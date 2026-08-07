/**
 * `/frontend-tools` — the graph the Frontend Tools page publishes in full.
 *
 * This is the reference wiring for every "the browser owns the tool" pattern
 * in the docs. `CopilotKitStateAnnotation` opens the `state.copilotkit.actions`
 * channel, `convertActionsToDynamicStructuredTools` turns whatever the page
 * registered with `useFrontendTool` into LangChain tools, and the model binds
 * them per turn. The tool body never runs here — CopilotKit executes it in the
 * browser and sends the result back as the tool message.
 *
 * Reproduced from the doc verbatim except for the model construction: the doc
 * imports an unpublished `makeChatOpenAI` helper (README §9).
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";

import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region agent
// CopilotKit forwards frontend tools to the agent via
// `state.copilotkit.actions`. `CopilotKitStateAnnotation` adds that
// channel to your graph's state; `convertActionsToDynamicStructuredTools`
// turns the forwarded action schemas into LangChain tools you can bind
// at model-invocation time.
const AgentStateAnnotation = CopilotKitStateAnnotation;
export type AgentState = typeof AgentStateAnnotation.State;

const SYSTEM_PROMPT = "You are a helpful, concise assistant.";

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0, model: "gpt-4o-mini" });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: SYSTEM_PROMPT }), ...state.messages],
    config,
  );

  return { messages: response };
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
//#endregion

/**
 * `/generative-ui/tool-based` — `useComponent` registers a React component as
 * a frontend tool, so the wiring is identical to the page above. The only
 * difference is the nudge to actually reach for it.
 */
export const genUiToolBasedGraph = buildFrontendToolGraph(
  "You are a helpful assistant. When the user asks for a chart, a " +
    "visualization, or a comparison of numbers, call the component tool " +
    "registered for it rather than describing the data in prose.",
);

/**
 * `/human-in-the-loop` — `useHumanInTheLoop` is also a frontend tool; the
 * difference is that its handler waits for the user instead of returning
 * immediately.
 */
export const hitlInChatGraph = buildFrontendToolGraph(
  "You are a scheduling assistant. When the user wants to book or schedule " +
    "anything, call the booking tool and let the user pick a time rather " +
    "than proposing one yourself. Confirm the choice afterwards.",
);

function buildFrontendToolGraph(systemPrompt: string) {
  async function node(state: AgentState, config: RunnableConfig) {
    const model = chatModel({ temperature: 0 });
    const modelWithTools = model.bindTools!([
      ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ]);
    const response = await modelWithTools.invoke(
      [new SystemMessage({ content: systemPrompt }), ...state.messages],
      config,
    );
    return { messages: response };
  }

  return new StateGraph(AgentStateAnnotation)
    .addNode("chat_node", node)
    .addEdge(START, "chat_node")
    .addEdge("chat_node", "__end__")
    .compile({ checkpointer: new MemorySaver() });
}
