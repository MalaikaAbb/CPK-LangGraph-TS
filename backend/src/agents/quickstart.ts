/**
 * `/quickstart` — the graph the Quickstart's TypeScript tab publishes.
 *
 * Since doc-sync 2026-11-09 the Quickstart has a TypeScript tab of its own
 * ("src/agent.ts"), copied verbatim below: one `mock_llm` node over
 * `MessagesAnnotation`, model `gpt-6-luna` with `reasoning_effort: "none"`,
 * and no checkpointer, because the LangGraph API server supplies persistence.
 * `backend/langgraph.json` maps `sample_agent` to this `graph` export, the
 * same mapping as the page's own `langgraph.json`.
 */

//#region agent
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import {
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";

async function mockLlm(state: typeof MessagesAnnotation.State) {
  const model = new ChatOpenAI({ modelKwargs: { reasoning_effort: "none" }, model: "gpt-6-luna" });
  const response = await model.invoke([
    new SystemMessage("You are a helpful assistant."),
    ...state.messages,
  ]);
  return { messages: response };
}

export const graph = new StateGraph(MessagesAnnotation)
  .addNode("mock_llm", mockLlm)
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END)
  .compile();
//#endregion
