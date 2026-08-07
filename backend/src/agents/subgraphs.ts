/**
 * `/subgraphs` — a graph used as a node inside another graph.
 *
 * The Subgraphs page publishes no backend code at all. Its claim is precisely
 * that none is needed: "Using this feature requires no extra steps on the
 * agent side. All you need to do is subscribe to the agent state in your
 * frontend." So the only thing this file has to prove is that a *nested* graph
 * streams state and messages to the UI exactly like a flat one does.
 *
 * The parent/child split below is therefore this repo's, not the doc's — the
 * page links out to the Feature Viewer for its example. It is deliberately the
 * plainest thing that exercises the claim: an outer graph whose single node is
 * an inner compiled graph, both writing to the same shared-state channels.
 *
 * `interrupt()` also works from inside a subgraph, per the page's closing
 * line; the Interrupts route covers that primitive on its own.
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

//#region state
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  /** Written by the inner graph, read by the outer one and by the UI. */
  outline: Annotation<string[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  /** Which graph most recently wrote. Proves nesting is visible to the UI. */
  lastNode: Annotation<string>,
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region subgraph
/**
 * The inner graph — a self-contained "planner" unit. It has its own nodes and
 * its own edges, and it knows nothing about the graph that will embed it.
 */
async function planNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 });

  const response = await model.invoke(
    [
      new SystemMessage({
        content:
          "You are a planning sub-graph. Reply with 3 short bullet points " +
          "outlining how to answer the user's request. Bullets only.",
      }),
      ...state.messages,
    ],
    config,
  );

  const text =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const outline = text
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean);

  // No `messages` here: the plan is state, not chat. It streams to the UI
  // through the shared-state channel while the outer graph keeps going.
  return { outline, lastNode: "planner_subgraph.plan_node" };
}

const plannerSubgraph = new StateGraph(AgentStateAnnotation)
  .addNode("plan_node", planNode)
  .addEdge(START, "plan_node")
  .addEdge("plan_node", "__end__")
  .compile();
//#endregion

//#region parent
/** The outer graph answers, using whatever the subgraph put in `outline`. */
async function answerNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0.3 });

  const response = await model.invoke(
    [
      new SystemMessage({
        content:
          "You are the parent graph. A planning sub-graph produced this " +
          `outline:\n${(state.outline ?? []).map((s) => `- ${s}`).join("\n")}\n` +
          "Answer the user by following it.",
      }),
      ...state.messages,
    ],
    config,
  );

  return { messages: response, lastNode: "parent.answer_node" };
}

// A compiled graph is a runnable, so it drops straight into `addNode`.
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("planner_subgraph", plannerSubgraph)
  .addNode("answer_node", answerNode)
  .addEdge(START, "planner_subgraph")
  .addEdge("planner_subgraph", "answer_node")
  .addEdge("answer_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
//#endregion
