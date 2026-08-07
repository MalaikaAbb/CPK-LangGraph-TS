/**
 * `/shared-state/in-app-agent-read` and `/shared-state/in-app-agent-write`.
 *
 * Both pages use the same one-field example: a `language` slot on agent state
 * that the app reads with `agent.state.language` and writes with
 * `agent.setState({ language })`. Nothing here writes it but the UI — the
 * agent's only job is to *honour* it and hand it back so it survives the turn.
 *
 * The pages publish the state definition in two different TypeScript dialects:
 * `new StateSchema({ ... ...CopilotKitStateSchema.fields })` with zod, and
 * `Annotation.Root({ ...CopilotKitStateAnnotation.spec, ... })`. This repo uses
 * the annotation form throughout, because that is the form every page with a
 * complete, runnable TypeScript graph uses. See README §9.
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
  language: Annotation<"english" | "spanish">,
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region agent
async function chatNode(state: AgentState, config: RunnableConfig) {
  // If language is not defined, use a default value. A default declared on the
  // annotation is not read at runtime, so resolve it here.
  const language = state.language ?? "english";

  const model = chatModel({ temperature: 0.3 });

  const response = await model.invoke(
    [
      new SystemMessage({
        content:
          `You are a helpful assistant. Reply in ${language}, whatever ` +
          "language the user writes in. Mention which language you are " +
          "using in your first sentence so the switch is visible.",
      }),
      ...state.messages,
    ],
    config,
  );

  return {
    messages: response,
    // Return the language so it is available to the next nodes and to the
    // frontend to read.
    language,
  };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
