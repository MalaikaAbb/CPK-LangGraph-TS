/**
 * The plain chat graphs.
 *
 * Several doc pages are about the *frontend* surface — which prebuilt
 * component you render, how you re-skin it, which slot you override — and the
 * agent behind them is deliberately unremarkable. Rather than copy the same
 * graph nine times, they share one builder and differ only in system prompt
 * and model.
 *
 * The graph shape is the one the Frontend Tools page publishes in full:
 * `CopilotKitStateAnnotation` as the state, one `chat_node`, and
 * `convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? [])`
 * bound at invocation time so any tool the page registers with
 * `useFrontendTool` / `useComponent` / `useHumanInTheLoop` is callable.
 * Keeping that channel open on every chat agent is what lets the Slots,
 * Headless and Chat Controls routes register a frontend tool if they want one.
 *
 * Each graph gets its own `MemorySaver`, so a conversation on one route does
 * not leak into another.
 */

import type { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";

import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import {
  chatModel,
  REASONING_MODEL,
  REASONING_SUMMARY,
  type ChatModelOptions,
} from "./model.js";

const AgentStateAnnotation = CopilotKitStateAnnotation;
export type AgentState = typeof AgentStateAnnotation.State;

//#region builders
/**
 * `modelOptions` is passed straight to `chatModel`, which omits any key it is
 * not given. That is what lets the reasoning graphs below share this builder:
 * they need a different model *and* no `temperature` at all, because the
 * o-series rejects the parameter rather than ignoring it. Defaulting the whole
 * object — rather than destructuring with `temperature = 0` — is deliberate,
 * since a per-property default would fire on an explicit `undefined` too.
 */
function buildChatGraph(
  systemPrompt: string,
  modelOptions: ChatModelOptions = { temperature: 0 },
) {
  async function chatNode(state: AgentState, config: RunnableConfig) {
    const llm = chatModel(modelOptions);

    // Frontend tools arrive on `state.copilotkit.actions`; converting them
    // gives the model callable LangChain tools for this turn only.
    const modelWithTools = llm.bindTools!([
      ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ]);

    const response = await modelWithTools.invoke(
      [new SystemMessage({ content: systemPrompt }), ...state.messages],
      config,
    );

    return { messages: response };
  }

  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("chat_node", chatNode)
    .addEdge(START, "chat_node")
    .addEdge("chat_node", "__end__");

  return workflow.compile({ checkpointer: new MemorySaver() });
}
//#endregion

const HELPFUL = "You are a helpful, concise assistant.";

/** `/prebuilt-components/chat` — the base inline chat surface. */
export const agenticChatGraph = buildChatGraph(HELPFUL);

/** `/prebuilt-components/sidebar`. */
export const prebuiltSidebarGraph = buildChatGraph(HELPFUL);

/** `/prebuilt-components/popup`. */
export const prebuiltPopupGraph = buildChatGraph(HELPFUL);

/** `/prebuilt-components/chat-controls` — open/close plus thumbs up/down. */
export const chatControlsGraph = buildChatGraph(
  HELPFUL +
    " Answer in two or three sentences so the feedback buttons on each " +
    "reply are easy to reach.",
);

/** `/custom-look-and-feel/css`. */
export const chatCustomizationCssGraph = buildChatGraph(HELPFUL);

/**
 * `/custom-look-and-feel/slots` — the page overrides the welcome screen, the
 * assistant message and the input disclaimer, so it helps if replies are long
 * enough to fill the overridden card.
 */
export const chatSlotsGraph = buildChatGraph(
  HELPFUL + " Use markdown — a short list or bold text where it helps.",
);

/** `/custom-look-and-feel/headless-ui` — the minimal two-hook example. */
export const headlessSimpleGraph = buildChatGraph(HELPFUL);

/** `/custom-look-and-feel/headless-ui` — the full composition example. */
export const headlessCompleteGraph = buildChatGraph(HELPFUL);

/** `/multimodal-attachments` — sees images and documents as content parts. */
export const multimodalGraph = buildChatGraph(
  "You are a helpful assistant. When the user attaches a file, describe what " +
    "you can actually see or read in it before answering.",
);

/** `/voice` — reached through the second runtime that carries transcription. */
export const voiceDemoGraph = buildChatGraph(
  "You are a helpful voice assistant. Keep answers short enough to be " +
    "comfortable to listen to.",
);

/** `/programmatic-control` — driven by `runAgent`, not by a composer. */
export const programmaticControlGraph = buildChatGraph(HELPFUL);

//#region reasoning-agents
/**
 * `/custom-look-and-feel/reasoning-messages` and `/generative-ui/reasoning`.
 *
 * Both need a model that actually emits reasoning tokens — the pages name o1,
 * o3 and o4-mini. Temperature is left unset because the o-series rejects it.
 */
const REASONING_PROMPT =
  "You are a careful assistant. Work through multi-step problems before " +
  "answering.";

/**
 * Same builder as every other graph in this file; only the model options
 * differ. Each of the four is load-bearing:
 *
 * - `model` — an o-series model, the only kind that emits reasoning tokens.
 * - no `temperature` — the o-series rejects the parameter rather than
 *   ignoring it.
 * - `useResponsesApi` — reasoning *summaries* exist only on the Responses API.
 *   Without it there is no visible trace to render, only hidden reasoning.
 * - `reasoning: { effort, summary }` — `summary: "auto"` is what actually asks
 *   for the trace. `effort: "low"` keeps demo turns quick; raise it for harder
 *   problems. Summaries need a verified OpenAI org; set
 *   `OPENAI_REASONING_SUMMARY=off` to drop just that field if yours is not.
 * - `disableStreaming` — see below.
 *
 * On `disableStreaming: true`, which looks wrong on a page about watching the
 * model think: token-level streaming of the Responses API pushes the
 * reasoning-summary delta and the answer's `output_text` delta to the *same*
 * content-block index. The streaming reducer merges them into one
 * `type: "reasoning"` block, and the AG-UI bridge then routes the whole turn —
 * answer included — to REASONING_MESSAGE_* events, so no assistant message
 * ever renders. The non-streaming path converts final output *items* rather
 * than indexed deltas, correctly yielding a separate `reasoning` block and
 * `text` block, so the bridge emits both a reasoning message and the answer.
 *
 * The visible cost is that these two routes fill in per-chunk rather than
 * per-token. That is the trade the docs' own rendering assumes.
 */
const REASONING_OPTIONS: ChatModelOptions = {
  model: REASONING_MODEL,
  useResponsesApi: true,
  reasoning: {
    effort: "low",
    // Omitted entirely rather than sent as null when summaries are off, so an
    // unverified org sends a request OpenAI accepts instead of a 400.
    ...(REASONING_SUMMARY === null ? {} : { summary: REASONING_SUMMARY }),
  },
  disableStreaming: true,
};

export const reasoningDefaultGraph = buildChatGraph(
  REASONING_PROMPT,
  REASONING_OPTIONS,
);

export const reasoningCustomGraph = buildChatGraph(
  REASONING_PROMPT,
  REASONING_OPTIONS,
);
//#endregion
