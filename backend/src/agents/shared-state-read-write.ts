/**
 * `/shared-state` and `/shared-state/rendering-in-app` — the two-way channel.
 *
 * The Shared State page publishes the state annotation verbatim and describes
 * the rest of the file: "a `set_notes` tool emits a `Command({ update: ... })`
 * to push agent-authored state, and a preferences-injecting chat node reads
 * UI-authored state every turn." Both halves are implemented to that contract.
 *
 * The direction of travel is what matters:
 *   - agent → UI: `set_notes` writes `notes`, the UI re-renders from
 *     `agent.state.notes`.
 *   - UI → agent: the page calls `agent.setState({ preferences })`, and the
 *     chat node folds those preferences into the system prompt on the next
 *     turn, so an edit in the sidebar visibly steers the model.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import type { ToolRunnableConfig } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import {
  Annotation,
  Command,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region state
export interface Preferences {
  name?: string;
  tone?: "formal" | "casual" | "playful";
  language?: string;
  interests?: string[];
}

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  preferences: Annotation<Preferences | undefined>,
  notes: Annotation<string[]>,
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region set-notes
/**
 * The agent's write side. Returning a `Command` rather than a plain value is
 * what lets one tool call update a state channel *and* close out its tool call
 * in the same step — the UI sees `notes` change as soon as the command lands.
 */
const setNotes = tool(
  async ({ notes }, config: ToolRunnableConfig) => {
    const toolCallId = config.toolCall?.id;
    if (typeof toolCallId !== "string" || toolCallId.length === 0) {
      throw new Error(
        "set_notes: missing tool_call_id — the tool was invoked outside a " +
          "ToolNode context. Refusing to emit a ToolMessage with an empty " +
          "tool_call_id (OpenAI rejects those).",
      );
    }

    return new Command({
      update: {
        notes,
        messages: [
          new ToolMessage({
            content: `Scratch pad now holds ${notes.length} note(s).`,
            name: "set_notes",
            id: randomUUID(),
            tool_call_id: toolCallId,
          }),
        ],
      },
    });
  },
  {
    name: "set_notes",
    description:
      "Replace the shared scratch pad with a new list of short observations " +
      "about the user. Pass the complete list each time — it overwrites.",
    schema: z.object({
      notes: z.array(z.string()).describe("The full list of notes to store."),
    }),
  },
);
//#endregion

const tools = [setNotes];

//#region inject-preferences
function describePreferences(preferences?: Preferences): string {
  if (!preferences) return "";
  const parts: string[] = [];
  if (preferences.name) parts.push(`The user's name is ${preferences.name}.`);
  if (preferences.tone) parts.push(`Use a ${preferences.tone} tone.`);
  if (preferences.language) parts.push(`Reply in ${preferences.language}.`);
  if (preferences.interests?.length) {
    parts.push(`They are interested in: ${preferences.interests.join(", ")}.`);
  }
  return parts.join(" ");
}

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0.3 });

  // READ the UI-authored half of shared state and fold it into this turn's
  // system prompt. This is the whole of "the UI's writes steer the model".
  const preferenceLine = describePreferences(state.preferences);
  const systemPrompt = [
    "You are a helpful assistant that keeps a shared scratch pad.",
    "When you learn something durable about the user, call `set_notes` with " +
      "the complete updated list of short notes.",
    preferenceLine && `User preferences: ${preferenceLine}`,
    state.notes?.length
      ? `Current notes: ${state.notes.map((n) => `- ${n}`).join("\n")}`
      : "The scratch pad is currently empty.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: systemPrompt }), ...state.messages],
    config,
  );

  return { messages: response };
}
//#endregion

function shouldContinue({ messages, copilotkit }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const hasBackendToolCall = lastMessage.tool_calls.some(
      (toolCall) =>
        !actions || actions.every((action) => action.name !== toolCall.name),
    );
    if (hasBackendToolCall) return "tool_node";
  }
  return "__end__";
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as never);

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
