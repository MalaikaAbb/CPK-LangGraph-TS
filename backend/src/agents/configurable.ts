/**
 * `/configurable` — execution parameters that are not agent state.
 *
 * The Configurable page's point is the boundary: things like auth tokens or
 * per-session metadata travel on `config.configurable`, arriving from the
 * frontend as
 * `runAgent({ forwardedProps: { config: { configurable: { … } } } })`. They are
 * never part of the graph's state, so they are never checkpointed and never
 * synced back to the UI.
 *
 * The node is the doc's TypeScript tab. The only addition is that it *reports*
 * what it received, so the route can actually be tested — without that the
 * page would have nothing observable to show.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});

export type AgentState = typeof AgentStateAnnotation.State;

//#region node
async function agentNode(state: AgentState, config: RunnableConfig) {
  // Pull the values from the provided config argument. `configurable` is
  // LangGraph's own channel — CopilotKit forwards whatever the frontend put
  // in `forwardedProps.config.configurable` straight through.
  const authToken = config.configurable?.authToken ?? null;
  console.log("agent_node received authToken:", authToken);

  const model = chatModel({ temperature: 0 });

  const systemMessage = new SystemMessage({
    content: [
      "You are a helpful assistant running with per-run execution config.",
      "Config received for this run:",
      `- authToken: ${authToken ?? "(not provided)"}`,
      "If the user asks what configuration you were given, report exactly " +
        "these values. Never claim a value you were not given.",
    ].join("\n"),
  });

  const response = await model.invoke([systemMessage, ...state.messages], config);

  return { messages: response };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("agent_node", agentNode)
  .addEdge(START, "agent_node")
  .addEdge("agent_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
