/**
 * The graph ids this app can address.
 *
 * Mirrors the `graphs` map in `backend/langgraph.json`, which is what the
 * LangGraph server reads at startup: the key is the `graphId` the runtime
 * passes to `new LangGraphAgent({ ... })`, and the value is the
 * `path/to/file.ts:exportName` the server imports. So a route, its doc page,
 * and its graph line up through one string.
 *
 * Ids follow the doc pages' own demo ids wherever a page names one
 * (`sample_agent`, `agentic_chat`, `frontend_tools`, `prebuilt-sidebar`, …),
 * which is why the casing is inconsistent — that inconsistency is the docs'.
 *
 * If you add a graph to `langgraph.json`, add its id here too.
 */

export const AGENT_IDS = [
  // Getting started
  "sample_agent",

  // Prebuilt components
  "agentic_chat",
  "prebuilt-sidebar",
  "prebuilt-popup",
  "chat-controls",

  // Custom look and feel
  "chat-customization-css",
  "chat-slots",
  "headless-simple",
  "headless-complete",
  "reasoning-default",
  "reasoning-custom",

  // Input modalities
  "multimodal",
  "voice-demo",

  // Generative UI
  "tool-rendering",
  "gen-ui-tool-based",
  "a2ui-fixed-schema",
  "declarative-gen-ui",

  // App control
  "frontend_tools",
  "hitl-in-chat",
  "interrupt-flow",
  "programmatic-control",

  // Shared state
  "shared-state-read-write",
  "shared-state-streaming",
  "readonly-state-agent-context",
  "agent-app-context",
  "shared-state-language",
  "state-inputs-outputs",
  "predictive-state-updates",
  "predictive-state-updates-manual",
  "predictive-state-updates-prebuilt",

  // Multi-agent
  "subagents",
  "subgraphs",

  // Config
  "agent-config",
  "configurable",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

/**
 * Where the LangGraph server is listening.
 *
 * `langgraphjs dev --port 8123` is the Quickstart's own command and 8123 is the
 * port it names. `LANGGRAPH_DEPLOYMENT_URL` is the env var the Quickstart's
 * runtime snippet reads, so pointing this at a LangGraph Platform deployment
 * is a one-variable change.
 */
export const LANGGRAPH_URL =
  process.env.LANGGRAPH_DEPLOYMENT_URL ??
  process.env.AGENT_URL ??
  "http://localhost:8123";

/**
 * Only needed against LangGraph Platform / LangSmith. A local `langgraphjs dev`
 * server does not authenticate, so the empty-string default the Quickstart
 * passes is the right one here.
 */
export const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY ?? "";

/** The one agent the A2UI fixed-schema route scopes its runtime middleware to. */
export const A2UI_FIXED_AGENT_ID = "a2ui-fixed-schema";

/** The agent the dynamic-schema route's dedicated runtime serves. */
export const A2UI_DYNAMIC_AGENT_ID = "declarative-gen-ui";

/** The agent the voice route's dedicated runtime serves. */
export const VOICE_AGENT_ID = "voice-demo";
