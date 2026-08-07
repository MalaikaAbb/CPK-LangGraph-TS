/**
 * `/shared-state/state-inputs-outputs` — splitting state by purpose.
 *
 * Published in full on the Input/Output Schemas page. Three annotations, not
 * one: the frontend may *write* `question`, may *read* `answer`, and never
 * sees `resources` at all. `new StateGraph(Full, { input, output })` is what
 * enforces that.
 *
 * The observable consequence, which is what the route demonstrates: after a
 * run, `agent.state.answer` is populated and `agent.state.question` is not
 * echoed back — the UI stays the source of truth for it.
 *
 * `resources` is the gap. It is declared in the full annotation and the page
 * describes its purpose ("used by the LLM to answer the question, and should
 * not be communicated to the user, or set by them"), but no snippet on the
 * page ever writes or reads it: `answerNode` returns only `messages` and
 * `answer`, and a `...add the rest of the agent implementation` elision sits
 * exactly where that logic would go. Both language tabs have the same hole.
 *
 * This file reproduces the page as published rather than filling it in, so
 * `resources` stays permanently `undefined`. That means the input/output
 * filtering is demonstrated, but the *internal* third of the pattern is not —
 * you cannot tell from this route whether `resources` is hidden by the output
 * annotation or simply never set. Making that visible would require inventing
 * the missing code. See README §9.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region schemas
// An input annotation for inputs you are willing to accept from the frontend
const InputAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  question: Annotation<string>,
});

// Output annotation for output you are willing to pass to the frontend
const OutputAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  answer: Annotation<string>,
});

// The full annotation, including the inputs, outputs and internal state
// ("resources" in our case)
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  question: Annotation<string>,
  answer: Annotation<string>,
  resources: Annotation<string[]>,
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region node
async function answerNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel();

  const systemMessage = new SystemMessage({
    content: `You are a helpful assistant. Answer the question: ${state.question}.`,
  });

  const response = await model.invoke([systemMessage, ...state.messages], config);

  // ...add the rest of the agent implementation
  // extract the answer, which will be assigned to the state soon
  const answer =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  return {
    messages: [response],
    // include the answer in the returned state
    answer,
  };
}
//#endregion

//#region graph
// StateGraph accepts the full state annotation as the first parameter,
// with optional input/output annotations to filter what's communicated with
// the frontend.
const workflow = new StateGraph(AgentStateAnnotation, {
  input: InputAnnotation,
  output: OutputAnnotation,
})
  .addNode("answer_node", answerNode)
  .addEdge(START, "answer_node")
  .addEdge("answer_node", END);

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
//#endregion
