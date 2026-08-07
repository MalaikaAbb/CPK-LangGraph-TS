/**
 * `/shared-state/predictive-state-updates` — the graph the page publishes in
 * full, unchanged apart from the model construction (README §9).
 *
 * A LangGraph agent's state only changes across node transitions, so a single
 * long node looks like a spinner. `StepProgressTool` + the
 * `emitIntermediateState` mapping fixes that: the model reports its steps as a
 * tool argument, and CopilotKit forwards that argument into `observed_steps`
 * while it is still streaming.
 *
 * Note the doc's warning: when a node finishes, its returned state is the
 * single source of truth. That is why the tool's `Command` also writes
 * `observed_steps` — otherwise the streamed value would be discarded at the
 * checkpoint.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import type { ToolRunnableConfig } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage } from "@langchain/core/messages";
import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import {
  Annotation,
  Command,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  copilotkitCustomizeConfig,
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { DEFAULT_MODEL } from "./model.js";

//#region agent
// 1. Define shared state with CopilotKit annotations
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  observed_steps: Annotation<string[]>,
});

type AgentState = typeof AgentStateAnnotation.State;

// 2. Define the tool with proper ToolMessage handling
const stepProgressTool = tool(
  async ({ steps }, config: ToolRunnableConfig) => {
    const toolCallId = config.toolCall?.id;
    if (typeof toolCallId !== "string" || toolCallId.length === 0) {
      throw new Error(
        "StepProgressTool: missing tool_call_id — tool was invoked outside a " +
          "ToolNode context. Refusing to emit a ToolMessage with an empty " +
          "tool_call_id (OpenAI rejects those).",
      );
    }

    return new Command({
      update: {
        observed_steps: steps,
        messages: [
          new ToolMessage({
            content: "Steps recorded to shared state.",
            name: "StepProgressTool",
            id: randomUUID(),
            tool_call_id: toolCallId,
          }),
        ],
      },
    });
  },
  {
    name: "StepProgressTool",
    description: "Records progress by updating the steps array",
    schema: z.object({
      steps: z.array(z.string()),
    }),
  },
);

const tools = [stepProgressTool];

// 3. Define the chat node
async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = new ChatOpenAI({
    model: DEFAULT_MODEL,
    modelKwargs: { parallel_tool_calls: false },
  });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  // Configure CopilotKit to stream tool arguments into state
  const streamingConfig = copilotkitCustomizeConfig(config, {
    emitIntermediateState: [
      {
        stateKey: "observed_steps",
        tool: "StepProgressTool",
        toolArgument: "steps",
      },
    ],
  });

  const response = await modelWithTools.invoke(
    [
      new SystemMessage(
        "You are a task performer. Pretend doing tasks you are given, " +
          "report the steps using StepProgressTool.",
      ),
      ...state.messages,
    ],
    streamingConfig,
  );

  return { messages: response };
}

// 4. Define routing logic
function shouldContinue({ messages, copilotkit }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const hasBackendToolCall = lastMessage.tool_calls.some((toolCall) => {
      return !actions || actions.every((action) => action.name !== toolCall.name);
    });

    if (hasBackendToolCall) {
      return "tool_node";
    }
  }

  return "__end__";
}

// 5. Compile the graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as never);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
//#endregion
