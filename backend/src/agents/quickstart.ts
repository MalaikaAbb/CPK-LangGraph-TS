/**
 * `/quickstart` — the smallest graph the Quickstart describes.
 *
 * The Quickstart's "use an existing agent" tab shows this graph in Python
 * (`mock_llm` over `MessagesState`, one edge in, one edge out) even on the
 * TypeScript docs; the "start from scratch" tab is where LangGraph
 * (JavaScript) is offered, and it only tells you the export must match the
 * name in `langgraph.json`. What follows is that same one-node graph written
 * against the TypeScript API, exported as `graph` so `langgraph.json` can
 * point `sample_agent` at it.
 *
 * Deliberately *not* extending `CopilotKitStateAnnotation`: the Quickstart's
 * graph doesn't, and the point of this route is to prove the minimum works.
 * Every other route in this repo extends it, because every other route needs
 * the frontend-tool or context channel it opens.
 */

import type { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { chatModel } from "./model.js";

//#region agent
async function mockLlm(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig,
) {
  const model = chatModel();
  const systemMessage = new SystemMessage({
    content: "You are a helpful assistant.",
  });

  const response = await model.invoke([systemMessage, ...state.messages], config);

  return { messages: response };
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("mock_llm", mockLlm)
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END);

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
//#endregion
