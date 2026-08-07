/**
 * One place to construct the chat model.
 *
 * The doc snippets that ship with the live demo cells import a
 * `makeChatOpenAI(config, opts)` helper from a `./openai-headers` module that
 * the docs never publish. Every page that *doesn't* reference that helper —
 * State Streaming (predictive-state-updates), Interrupts, Input/Output Schemas,
 * Readables — writes `new ChatOpenAI({ model, ... })` inline instead. This repo
 * uses that second, fully published form; see README §9.
 *
 * The only thing added here is a default model name read from the environment,
 * so the whole registry can be pointed at a different OpenAI model without
 * editing 30 files.
 */

import { ChatOpenAI, type ChatOpenAIFields } from "@langchain/openai";

/** Default for every agent that isn't specifically about reasoning tokens. */
export const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/**
 * Reasoning agents need a model that actually emits reasoning tokens. The
 * Reasoning Messages page names o1, o3 and o4-mini as the models that do.
 */
export const REASONING_MODEL = process.env.OPENAI_REASONING_MODEL ?? "o4-mini";

/**
 * Reasoning *summaries* — the human-readable trace the Reasoning routes exist
 * to render — are gated behind OpenAI organization verification. An unverified
 * org gets a hard `400 Your organization must be verified to generate
 * reasoning summaries` and the whole run fails, rather than degrading.
 *
 * `effort` is not gated, so the escape hatch is to keep reasoning on and drop
 * only the summary: set `OPENAI_REASONING_SUMMARY=off`. The model still
 * reasons, the route still answers, and the reasoning card simply never
 * appears — which is a working chat rather than a broken one.
 *
 * Verify at https://platform.openai.com/settings/organization/general
 * (access can take ~15 minutes to propagate).
 */
/**
 * The A2UI dynamic-schema route asks the model to read a large JSON-Schema
 * catalog out of context and emit a conforming component tree — `component`
 * (not `type`) discriminators, a flat component list, children as arrays of
 * ID strings, data split into its own model. That is a demanding structured
 * generation task, and `gpt-4o-mini` does not hold the shape: it emits
 * `type` keys, invents component names, and nests children inline, none of
 * which the renderer can resolve.
 *
 * The Dynamic Schema page builds its A2UI generation model as
 * `ChatOpenAI(model="gpt-4o")`, so that is the default here too.
 */
export const A2UI_MODEL = process.env.OPENAI_A2UI_MODEL ?? "gpt-4o";

const summaryEnv = process.env.OPENAI_REASONING_SUMMARY ?? "auto";
export const REASONING_SUMMARY: "auto" | "concise" | "detailed" | null =
  summaryEnv === "off" || summaryEnv === "none" || summaryEnv === ""
    ? null
    : (summaryEnv as "auto" | "concise" | "detailed");

export interface ChatModelOptions {
  model?: string;
  /** Omit entirely for the o-series, which rejects the parameter. */
  temperature?: number;
  /**
   * Force the Responses API for every request rather than only when something
   * in the request requires it. Reasoning *summaries* are Responses-only, so
   * this has to be on for the reasoning routes.
   */
  useResponsesApi?: boolean;
  /** `{ effort, summary }` — summary is what produces the visible trace. */
  reasoning?: ChatOpenAIFields["reasoning"];
  /** Bypass token streaming and take the single final response instead. */
  disableStreaming?: boolean;
}

/**
 * Any option left undefined is dropped rather than forwarded, so callers can
 * pass a partial config without accidentally sending `temperature: undefined`
 * to a model that rejects the parameter outright.
 */
export function chatModel(options: ChatModelOptions = {}): ChatOpenAI {
  const { model = DEFAULT_MODEL, ...rest } = options;

  return new ChatOpenAI({
    model,
    ...Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    ),
  });
}
