/**
 * `/shared-state/agent-readonly` — `useAgentContext` as a one-way UI → agent
 * channel.
 *
 * The whole node is published on the Agent Read-Only Context page and is
 * reproduced verbatim below (modulo the model construction, README §9). The
 * shape worth noticing: context arrives on `state.copilotkit.context` and is
 * prepended as a *second* system message, right after the main prompt. There
 * is no setter and no tool that writes it back — that is the point.
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

const SYSTEM_PROMPT =
  "You are a helpful assistant. You are given read-only context about the " +
  "current user and what they are looking at. Use it when it is relevant, " +
  "and say so plainly when the context does not cover what was asked.";

//#region inject-context
async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel();

  // Inject read-only context from useAgentContext / useCopilotReadable.
  // Mirrors the `createAppContextBeforeAgent` logic in CopilotKitMiddleware:
  // context may be a string or an object — stringify it and prepend as a
  // system message right after the main system prompt.
  // Typed by the SDK as `{ description, value }[]`, but the doc's own comment
  // is explicit that it "may be a string or an object" at runtime depending on
  // how the runtime serialised it. Widen to `unknown` so the string branch
  // below survives type-narrowing, and keep the defensive handling.
  const appContext: unknown = state.copilotkit?.context;
  const isEmptyContext =
    !appContext ||
    (typeof appContext === "string" && appContext.trim() === "") ||
    (typeof appContext === "object" && Object.keys(appContext).length === 0);

  const systemMessages: SystemMessage[] = [
    new SystemMessage({ content: SYSTEM_PROMPT }),
  ];

  if (!isEmptyContext) {
    const contextContent =
      typeof appContext === "string"
        ? appContext
        : JSON.stringify(appContext, null, 2);
    systemMessages.push(
      new SystemMessage({ content: `App Context:\n${contextContent}` }),
    );
  }

  const response = await model.invoke(
    [...systemMessages, ...state.messages],
    config,
  );

  return { messages: response };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });

/**
 * `/agent-app-context` (Readables) is the same mechanism with a different
 * emphasis: the page's example publishes a list of colleagues and expects the
 * agent to answer questions about them. Same node, different prompt.
 */
export const agentAppContextGraph = (() => {
  const prompt =
    "You are a helpful assistant that can help emailing colleagues. " +
    "The user's colleagues are provided to you as app context.";

  async function node(state: AgentState, config: RunnableConfig) {
    const model = chatModel();
    const appContext: unknown = state.copilotkit?.context;
    const messages: SystemMessage[] = [new SystemMessage({ content: prompt })];
    if (appContext && Object.keys(appContext as object).length > 0) {
      messages.push(
        new SystemMessage({
          content: `App Context:\n${
            typeof appContext === "string"
              ? appContext
              : JSON.stringify(appContext, null, 2)
          }`,
        }),
      );
    }
    const response = await model.invoke([...messages, ...state.messages], config);
    return { messages: response };
  }

  return new StateGraph(AgentStateAnnotation)
    .addNode("chat_node", node)
    .addEdge(START, "chat_node")
    .addEdge("chat_node", "__end__")
    .compile({ checkpointer: new MemorySaver() });
})();
