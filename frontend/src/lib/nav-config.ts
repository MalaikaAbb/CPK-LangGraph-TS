/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/langgraph-typescript.
 * `agentId` is the id the graph is registered under in
 * `backend/langgraph.json`, which is also the `graphId` the runtime hands to
 * `LangGraphAgent` — so a route, its doc page, and its graph line up in one
 * place.
 */

export const DOC_SYNC_DATE = "2026-08-06";
export const DOCS_ROOT = "https://docs.copilotkit.ai/langgraph-typescript";

export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Graph id from `backend/langgraph.json`. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/langgraph-typescript",
        summary: "What this harness covers and how the pieces fit together.",
        status: "reference",
        statusNote: "Landing page — orientation and a live graph roster.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Quickstart",
        docPath: "/langgraph-typescript/quickstart",
        summary:
          "One compiled graph served by `langgraphjs dev`, reached by the Copilot Runtime through LangGraphAgent.",
        status: "working",
        statusNote:
          "The doc's bring-your-own-agent tab is written in Python even here; this is that same one-node graph in TypeScript.",
      },
    ],
  },
  {
    title: "Prebuilt Components",
    routes: [
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "CopilotChat",
        docPath: "/langgraph-typescript/prebuilt-components/chat",
        summary:
          "The base inline chat surface, sized to fill whatever container you give it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        agentId: "prebuilt-sidebar",
        title: "CopilotSidebar",
        docPath: "/langgraph-typescript/prebuilt-components/sidebar",
        summary:
          "The collapsible docked chat that wraps your main content rather than covering it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        agentId: "prebuilt-popup",
        title: "CopilotPopup",
        docPath: "/langgraph-typescript/prebuilt-components/popup",
        summary:
          "The floating launcher that opens an overlay chat on top of the page.",
        status: "working",
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        agentId: "chat-controls",
        title: "Open, close, and feedback",
        docPath: "/langgraph-typescript/prebuilt-components/chat-controls",
        summary:
          "Driving modal state from your own UI with useCopilotChatConfiguration, and capturing thumbs up/down.",
        status: "working",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/css",
        hasDemo: true,
        agentId: "chat-customization-css",
        title: "CSS Customization",
        docPath: "/langgraph-typescript/custom-look-and-feel/css",
        summary:
          "Re-skinning the chat with the v2 shadcn design tokens and the .copilotKit* class hooks.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        agentId: "chat-slots",
        title: "Slots",
        docPath: "/langgraph-typescript/custom-look-and-feel/slots",
        summary:
          "Overriding chat sub-components at all three levels: class strings, prop objects, and whole components.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        agentId: "headless-simple",
        title: "Headless UI",
        docPath: "/langgraph-typescript/custom-look-and-feel/headless-ui",
        summary:
          "A chat built from useAgent, useCopilotKit and useRenderToolCall alone, with no CopilotKit chrome.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/reasoning-messages",
        hasDemo: true,
        agentId: "reasoning-default",
        title: "Reasoning Messages",
        docPath: "/langgraph-typescript/custom-look-and-feel/reasoning-messages",
        summary:
          "The built-in reasoning card, and the header/content sub-slots that replace parts of it.",
        status: "partial",
        statusNote:
          "Needs a model that emits reasoning tokens (defaults to o4-mini) AND a verified OpenAI org, since reasoning summaries are gated behind verification — set OPENAI_REASONING_SUMMARY=off if yours is not. Token streaming is disabled here so the trace and the answer stay separate.",
      },
    ],
  },
  {
    title: "Input Modalities",
    routes: [
      {
        path: "/multimodal-attachments",
        hasDemo: true,
        agentId: "multimodal",
        title: "Multimodal Attachments",
        docPath: "/langgraph-typescript/multimodal-attachments",
        summary:
          "Drag-and-drop file attachments sent to the agent as AG-UI content parts.",
        status: "working",
      },
      {
        path: "/voice",
        hasDemo: true,
        agentId: "voice-demo",
        title: "Voice",
        docPath: "/langgraph-typescript/voice",
        summary:
          "A second runtime carrying a TranscriptionService, which is what makes the composer grow a mic button.",
        status: "partial",
        statusNote:
          "The mic transcribes through OpenAI Whisper on the same OPENAI_API_KEY. Without one the route still runs via the doc's sample-audio button.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/reasoning",
        hasDemo: true,
        agentId: "reasoning-custom",
        title: "Reasoning",
        docPath: "/langgraph-typescript/generative-ui/reasoning",
        summary:
          "Replacing the whole reasoning card through the messageView.reasoningMessage slot.",
        status: "partial",
        statusNote:
          "Same reasoning-model, org-verification and disabled-streaming caveats as Reasoning Messages.",
      },
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        agentId: "gen-ui-tool-based",
        title: "Components as Tools",
        docPath: "/langgraph-typescript/generative-ui/tool-based",
        summary:
          "useComponent registering a React component as a tool the agent calls to render it.",
        status: "working",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool-rendering",
        title: "Tool Call Rendering",
        docPath: "/langgraph-typescript/generative-ui/tool-rendering",
        summary:
          "A named renderer for the get_weather tool, plus the wildcard catch-all from useDefaultRenderTool.",
        status: "partial",
        statusNote:
          "get_weather only — it is the sole backend tool the page actually defines. search_flights, get_stock_price and roll_dice appear only as renderer props.",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Rendering",
        docPath: "/langgraph-typescript/generative-ui/state-rendering",
        summary:
          "Rendering agent state as it changes, driven by the same emitIntermediateState mapping as State Streaming.",
        status: "working",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "declarative-gen-ui",
        title: "A2UI · Dynamic Schema",
        docPath: "/langgraph-typescript/generative-ui/a2ui/dynamic-schema",
        summary:
          "A bring-your-own-catalog dashboard where a secondary LLM designs the surface per request.",
        status: "partial",
        statusNote:
          "The catalog definitions and renderers are the doc's; the leaf UI they render into is this repo's. Also the most model-sensitive route here: the schema-designing model must follow a large JSON-Schema catalog exactly, and one invented component name fails the whole surface. Runs on gpt-4o (OPENAI_A2UI_MODEL), not the repo default.",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/langgraph-typescript/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "partial",
        statusNote:
          "The Book button is inert: the page notes a2ui.render does not yet accept action_handlers.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend_tools",
        title: "Frontend Tools",
        docPath: "/langgraph-typescript/frontend-tools",
        summary:
          "A tool the agent calls that executes in the browser and changes the page.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "Human in the Loop",
        docPath: "/langgraph-typescript/human-in-the-loop",
        summary:
          "useHumanInTheLoop suspending the run behind a picker until the user answers.",
        status: "working",
      },
      {
        path: "/human-in-the-loop/interrupt-flow",
        hasDemo: true,
        agentId: "interrupt-flow",
        title: "Interrupts",
        docPath: "/langgraph-typescript/human-in-the-loop/interrupt-flow",
        summary:
          "The other HITL shape: the graph calls interrupt(), and useInterrupt renders and resumes it.",
        status: "working",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "programmatic-control",
        title: "Programmatic Control",
        docPath: "/langgraph-typescript/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent, stopAgent and subscribe — no chat component.",
        status: "working",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Shared State",
        docPath: "/langgraph-typescript/shared-state",
        summary:
          "The two-way channel: the agent writes notes through a tool, the UI writes preferences through setState.",
        status: "working",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Render state in your app",
        docPath: "/langgraph-typescript/shared-state/rendering-in-app",
        summary:
          "The same agent state rendered as a main-view canvas rather than inside the chat.",
        status: "working",
      },
      {
        path: "/shared-state/streaming",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Streaming",
        docPath: "/langgraph-typescript/shared-state/streaming",
        summary:
          "copilotkitCustomizeConfig forwarding a tool argument into a state key while it is still being generated.",
        status: "working",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        agentId: "readonly-state-agent-context",
        title: "Agent Read-Only Context",
        docPath: "/langgraph-typescript/shared-state/agent-readonly",
        summary:
          "useAgentContext as a one-way UI-to-agent channel — props for the agent, with no setter.",
        status: "working",
      },
      {
        path: "/agent-app-context",
        hasDemo: true,
        agentId: "agent-app-context",
        title: "Readables",
        docPath: "/langgraph-typescript/agent-app-context?impl=graph",
        summary:
          "The same useAgentContext channel read out of state.copilotkit.context by a custom graph.",
        status: "partial",
        statusNote:
          "Covers the page's `impl=graph` tab. The `impl=prebuilt` tab (createAgent + copilotkitMiddleware) is documented on the page rather than run, since this repo builds every graph node by node.",
      },
      {
        path: "/shared-state/in-app-agent-read",
        hasDemo: true,
        agentId: "shared-state-language",
        title: "Reading agent state",
        docPath: "/langgraph-typescript/shared-state/in-app-agent-read",
        summary:
          "Reading agent.state.language in your own components as the graph returns it each turn.",
        status: "working",
      },
      {
        path: "/shared-state/in-app-agent-write",
        hasDemo: true,
        agentId: "shared-state-language",
        title: "Writing agent state",
        docPath: "/langgraph-typescript/shared-state/in-app-agent-write",
        summary:
          "agent.setState writing back, plus the setState-then-runAgent re-run the page describes.",
        status: "working",
      },
      {
        path: "/shared-state/state-inputs-outputs",
        hasDemo: true,
        agentId: "state-inputs-outputs",
        title: "Input/Output Schemas",
        docPath: "/langgraph-typescript/shared-state/state-inputs-outputs",
        summary:
          "Splitting state by purpose: question in, answer out, resources internal and never synced.",
        status: "partial",
        statusNote:
          "The doc declares `resources` and describes its purpose, but no published snippet ever writes or reads it — the node has a `...add the rest` elision exactly there. The internal-state half is this repo's.",
      },
      {
        path: "/shared-state/predictive-state-updates",
        hasDemo: true,
        agentId: "predictive-state-updates",
        title: "Predictive state updates",
        docPath: "/langgraph-typescript/shared-state/predictive-state-updates",
        summary:
          "A StepProgressTool reporting intermediate steps so the UI is never just a spinner.",
        status: "partial",
        statusNote:
          "Two tabs, one per agent-type variant. The custom-graph tab works. The prebuilt tab is reproduced verbatim including model: \"openai:gpt-5.4\", so it only runs if your key can reach that model — see README §9.",
      },
    ],
  },
  {
    title: "Multi-Agent",
    routes: [
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        agentId: "subagents",
        title: "Sub-Agents",
        docPath: "/langgraph-typescript/multi-agent/subagents",
        summary:
          "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "working",
      },
      {
        path: "/subgraphs",
        hasDemo: true,
        agentId: "subgraphs",
        title: "Subgraphs",
        docPath: "/langgraph-typescript/subgraphs",
        summary:
          "A compiled graph used as a node inside another graph, streaming to the UI like a flat one.",
        status: "partial",
        statusNote:
          "The page publishes only the frontend useAgent snippet and links out to the Feature Viewer for the rest, so the parent/child graph here is this repo's.",
      },
    ],
  },
  {
    title: "Agent Config",
    routes: [
      {
        path: "/agent-config",
        hasDemo: true,
        agentId: "agent-config",
        title: "Agent Config",
        docPath: "/langgraph-typescript/agent-config",
        summary:
          "A typed config object the UI owns, published with useAgentContext and rebuilt into the system prompt each turn.",
        status: "working",
      },
      {
        path: "/configurable",
        hasDemo: true,
        agentId: "configurable",
        title: "Configurable",
        docPath: "/langgraph-typescript/configurable",
        summary:
          "Per-run execution parameters that ride on config.configurable and never touch agent state.",
        status: "working",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
