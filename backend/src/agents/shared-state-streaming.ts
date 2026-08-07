/**
 * `/shared-state/streaming` and `/generative-ui/state-rendering`.
 *
 * The point of this graph is one call: `copilotkitCustomizeConfig` with an
 * `emitIntermediateState` mapping. That mapping — published verbatim by both
 * pages — forwards the `write_document.document` tool argument into
 * `state.document` *while the model is still generating it*, so the UI can
 * watch the document assemble token by token rather than appear in one burst
 * at the next checkpoint.
 *
 * The pages publish the mapping and the tool's name / argument name / target
 * state key, but not the tool body; it is implemented to that contract. Note
 * the doc's own caveat: when the tool completes, its return value is written
 * to the same key, so the streamed partial becomes the authoritative value.
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
  copilotkitCustomizeConfig,
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  document: Annotation<string>,
});

export type AgentState = typeof AgentStateAnnotation.State;

//#region tool


const writeDocument = tool(
  async ({ document }, config: ToolRunnableConfig) => {
    const toolCallId = config.toolCall?.id;
    if (typeof toolCallId !== "string" || toolCallId.length === 0) {
      throw new Error(
        "write_document: missing tool_call_id — tool was invoked outside a " +
          "ToolNode context. Refusing to emit a ToolMessage with an empty " +
          "tool_call_id (OpenAI rejects those).",
      );
    }
    return new Command({
      update: {
        document,
        messages: [
          new ToolMessage({
            content: "Document written to shared state.",
            name: "write_document",
            id: randomUUID(),
            tool_call_id: toolCallId,
          }),
        ],
      },
    });
  },
  {
    name: "write_document",
    description:
      "Write a document for the user.\n\n" +
      "Always call this tool when the user asks you to write or draft " +
      "something of any length (an essay, poem, email, summary, etc.). " +
      "The `document` argument is streamed *per token* into shared agent " +
      "state under the `document` key, so the UI can render it as it is " +
      "generated.",
    schema: z.object({
      document: z.string(),
    }),
  },
);

//#endregion

const tools = [writeDocument];

//#region agent
async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0.4 });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  const systemMessage = new SystemMessage({
    content:
      "You are a collaborative writing assistant. Whenever the user asks for " +
      "a document, essay, plan or draft, call `write_document` with the " +
      "complete text. Do not repeat the document in your chat reply — the " +
      "app renders it from shared state.",
  });

  const streamingConfig = copilotkitCustomizeConfig(config, {
    emitIntermediateState: [
      {
        stateKey: "document",
        tool: "write_document",
        toolArgument: "document",
      },
    ],
  });

  const response = await modelWithTools.invoke(
    [systemMessage, ...state.messages],
    streamingConfig,
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
