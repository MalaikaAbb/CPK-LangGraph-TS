/**
 * `genui` — the agent behind every Components and surfaces route.
 *
 * Repo-authored, NOT from the docs. The pages are framework-neutral: their
 * runtime sample is a `BuiltInAgent` TanStack factory (Components overview)
 * or "change nothing on the runtime", and the `render_ui` tool plus its
 * catalog guide arrive per run from the provider. For a LangGraph graph that
 * means: bind `state.copilotkit.actions` (where `render_ui` lands) and fold
 * `state.copilotkit.context` (where the guide lands) into the system prompt,
 * the same two moves the Frontend Tools and Read-Only Context pages publish.
 *
 * The first sentence of the prompt is the Components overview page's own
 * system prompt; the `render_ui` props hint after it is ported from the
 * aws-strands-ts harness. No backend tools: the pages' snippets call none
 * (the sibling's `search_products` demo tool was trimmed after review).
 */
import type { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

const SYSTEM_PROMPT =
  "You are a helpful assistant. When a visual answer helps, render it with generative UI. " +
  "In `render_ui` operations, put each prop directly on the component node next to `id` and `component`; never nest props under a `props` key.";

type AgentState = typeof CopilotKitStateAnnotation.State;

//#region agent
async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 }).bindTools!(
    convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
  );

  // The catalog guide (and any useAgentContext entries) ride on context.
  const context = state.copilotkit?.context ?? [];
  const system = [new SystemMessage({ content: SYSTEM_PROMPT })];
  if (context.length > 0) {
    system.push(
      new SystemMessage({ content: `App Context:\n${JSON.stringify(context, null, 2)}` }),
    );
  }

  const response = await model.invoke([...system, ...state.messages], config);
  return { messages: response };
}

export const graph = new StateGraph(CopilotKitStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__")
  .compile({ checkpointer: new MemorySaver() });
//#endregion
