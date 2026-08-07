/**
 * `/generative-ui/tool-rendering` — a backend tool with a branded frontend
 * renderer.
 *
 * The doc's `tool-rendering` cell wires four backend tools (`get_weather`,
 * `search_flights`, `get_stock_price`, `roll_dice`) but only publishes the
 * definition of `get_weather`. The other three appear solely as frontend
 * renderer props, so their argument and return shapes are never stated. This
 * repo implements the one tool the page actually defines and leaves the rest
 * out rather than inventing them — see README §9 and the route's status note.
 *
 * The system prompt is the doc's, trimmed to the single tool that exists here.
 */

import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

// ---------------------------------------------------------------------------
// 1. Agent state -- extends CopilotKit state annotation
// ---------------------------------------------------------------------------

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});

export type AgentState = typeof AgentStateAnnotation.State;

// ---------------------------------------------------------------------------
// 2. System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT =
  "You are a travel & lifestyle concierge. Use the get_weather tool when the " +
  "user asks about weather; otherwise reply in plain text. After tools " +
  "return, summarize in one short sentence. Never fabricate data a tool " +
  "could provide.";

//#region get-weather
// ---------------------------------------------------------------------------
// 3. Tools
// ---------------------------------------------------------------------------

const getWeather = tool(
  async ({ location }) => ({
    city: location,
    temperature: 68,
    humidity: 55,
    wind_speed: 10,
    conditions: "Sunny",
  }),
  {
    name: "get_weather",
    description: "Get the current weather for a given location.",
    schema: z.object({
      location: z.string().describe("City name"),
    }),
  },
);
//#endregion

const tools = [getWeather];

// ---------------------------------------------------------------------------
// 4. Graph
// ---------------------------------------------------------------------------

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: SYSTEM_PROMPT }), ...state.messages],
    config,
  );

  return { messages: response };
}

/**
 * Route to the tool node only for tools this graph owns. A frontend tool call
 * has to leave the graph so CopilotKit can run it in the browser — the same
 * check the State Streaming page publishes.
 */
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

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as never);

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
