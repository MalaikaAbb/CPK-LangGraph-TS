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
/**
 * The doc's node, verbatim. It reads `config.configurable` and returns state —
 * that is the entire published snippet. It calls no model and appends no
 * message, which is why on its own the route completes with an empty chat.
 */
async function agentNode(
  state: AgentState,
  config: RunnableConfig,
): Promise<AgentState> {
  const authToken = config.configurable?.authToken ?? null;
  console.log("Auth Token: ", authToken);
  return state;
}
//#endregion

//#region reply
/**
 * This repo's. The doc's page is about *reading* execution config, not about
 * building an agent — it assumes you already have one from the Quickstart. So
 * the reply lives in its own node rather than being folded into the one above,
 * which keeps the published snippet readable as published.
 *
 * It also demonstrates something the page states but never shows: the same
 * `config.configurable` is available in *any* node, not just the first. This
 * node reads the token independently — nothing was threaded through state,
 * because `configurable` deliberately never touches state.
 *
 * Reporting the value back is what makes the route testable at all. Since
 * `configurable` is not state, there is nothing in `agent.state` for the UI to
 * inspect; the reply is the only observable evidence it arrived.
 */
async function replyNode(state: AgentState, config: RunnableConfig) {
  const authToken = config.configurable?.authToken ?? null;

  const model = chatModel({ temperature: 0 });

  const systemMessage = new SystemMessage({
    content: [
      "You are a helpful assistant running with per-run execution config.",
      "Config received for this run:",
      `- authToken: ${authToken ?? "(not provided)"}`,
      "Open with one short line stating the authToken you were given, quoted " +
        "exactly, or that you were given none. Then answer the user normally. " +
        "Never claim a value you were not given.",
    ].join("\n"),
  });

  const response = await model.invoke([systemMessage, ...state.messages], config);

  return { messages: response };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("agent_node", agentNode)
  .addNode("reply_node", replyNode)
  .addEdge(START, "agent_node")
  .addEdge("agent_node", "reply_node")
  .addEdge("reply_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
