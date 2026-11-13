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

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
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
    title: "Rich Threads",
    routes: [
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Threads Drawer",
        docPath: "/langgraph-typescript/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in conversation sidebar, wired with no active-thread state of its own.",
        status: "working",
        statusNote:
          "Two separate switches: Intelligence mode for real rows, and a license (publicLicenseKey or licenseToken) for the drawer to render anything but its locked Upgrade view.",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Headless Threads",
        docPath: "/langgraph-typescript/headless-threads",
        summary:
          "The same thread data through useThreads, with a hand-built list — including rename, which the drawer omits.",
        status: "working",
        statusNote:
          "Needs Intelligence mode. In SSE mode /info reports mutations: false, so rename/archive/delete have no endpoint to call.",
      },
      {
        path: "/threads-lifecycle",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Thread & History Lifecycle",
        docPath: "/langgraph-typescript/threads-lifecycle",
        summary:
          "Where a threadId comes from, how history replays, and how switching differs from starting fresh.",
        status: "working",
        statusNote:
          "Switch and start are live in either mode; history replay needs a server-side store, so it is inert in SSE mode.",
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
      {
        path: "/custom-look-and-feel/markdown",
        hasDemo: true,
        agentId: "chat-markdown",
        title: "Markdown Rendering",
        docPath: "/langgraph-typescript/custom-look-and-feel/markdown",
        summary:
          "The markdownRenderer slot on assistant messages in all three forms: a Streamdown components map, a class string, and a whole replacement component.",
        status: "partial",
        statusNote:
          "Snippets verbatim; route ported from aws-strands-ts. The page defines no CSS for its my-link / my-heading classes, so the first example is only visible in DevTools. Not yet checked in a browser here.",
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
          "Backend is the page's Code-tab agent with all four tools (get_weather, search_flights, get_stock_price, roll_d20); only get_weather has a named renderer, the rest go through the catch-all. Grouping controls (toolCallDisplay, group: true) not yet checked in a browser.",
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
        path: "/generative-ui/a2ui",
        title: "A2UI",
        docPath: "/langgraph-typescript/generative-ui/a2ui",
        summary:
          "The A2UI overview: three operations, two approaches, two ways to switch it on, and the surface color variables.",
        status: "reference",
        statusNote:
          "Overview page. Its setup paths are exercised by the Dynamic Schema (catalog on provider) and Fixed Schema (runtime a2ui block) routes; the no-catalog injectA2UITool: true combination and the CSS variables are shown, not run.",
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
      {
        path: "/generative-ui/json-render",
        hasDemo: true,
        agentId: "byoc_json_render",
        title: "JSON Render",
        docPath: "/langgraph-typescript/generative-ui/json-render",
        summary:
          "An agent-emitted { root, elements } spec drawn by @json-render/react against a Zod component catalog.",
        status: "partial",
        statusNote:
          "The page's full Code tab, verbatim (own runtime route + own <CopilotKit>). makeChatOpenAI swapped for new ChatOpenAI; suggestion chips not copied. Type-checks; not yet checked in a browser.",
      },
      {
        path: "/generative-ui/hashbrown",
        hasDemo: true,
        agentId: "byoc_hashbrown",
        title: "Hashbrown",
        docPath: "/langgraph-typescript/generative-ui/hashbrown",
        summary:
          "Streamed structured output parsed progressively by @hashbrownai/react and rendered through a component catalog.",
        status: "partial",
        statusNote:
          "The page's full Code tab, verbatim, on @hashbrownai 0.7.0 exactly. makeChatOpenAI swapped for new ChatOpenAI; suggestion chips not copied. Type-checks; not yet checked in a browser.",
      },
      {
        path: "/generative-ui/mcp-apps",
        hasDemo: true,
        agentId: "mcp_apps",
        title: "MCP Apps",
        docPath: "/langgraph-typescript/generative-ui/mcp-apps",
        summary:
          "An MCP server's UI resources rendered inline in the chat as sandboxed iframes, wired by the runtime's mcpApps.servers.",
        status: "partial",
        statusNote:
          "The page's Code tab verbatim (agent, runtime route, demo page) pointed at the public Excalidraw MCP server. A minimal ./chat is adapted from the CopilotKit showcase (no suggestion chips); makeChatOpenAI swapped for new ChatOpenAI. Not yet checked in a browser.",
      },
      {
        path: "/generative-ui/open-generative-ui",
        hasDemo: true,
        agentId: "open_gen_ui",
        title: "Open Generative UI",
        docPath: "/langgraph-typescript/generative-ui/open-generative-ui",
        summary:
          "generateSandboxedUi streaming agent-written HTML/CSS/JS into a sandboxed iframe; an advanced variant adds sandbox functions that call back into the host.",
        status: "partial",
        statusNote:
          "The page's Code tab verbatim (two agents, runtime route, both demo pages). A minimal ./chat and ./design-skill (feeds the openGenerativeUI.designSkill prop the page teaches) are borrowed from the CopilotKit showcase; all suggestion chips left out; makeChatOpenAI swapped for new ChatOpenAI. Advanced variant at /generative-ui/open-generative-ui/advanced. Not yet checked in a browser.",
      },
      {
        path: "/generative-ui/components",
        hasDemo: true,
        agentId: "genui",
        title: "Components and surfaces",
        docPath: "/langgraph-typescript/generative-ui/components",
        summary:
          "standardUI on the provider: the runtime adds render_ui and its guide, and the agent answers with streamed A2UI 1.0 components.",
        status: "partial",
        statusNote:
          "The page's runtime is a BuiltInAgent TanStack factory (shown, not run); here the same provider config is served by this repo's genui LangGraph graph. Needs @copilotkit 1.85 (bumped here). Not yet checked in a browser.",
      },
      {
        path: "/generative-ui/components/surfaces",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Surfaces",
        docPath: "/langgraph-typescript/generative-ui/components/surfaces",
        summary:
          "GenerativeUISurface page targets the chat can fill, limit, scroll to, and replace, with per-component error boundaries.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). All published snippets run. Product, ProductRow and the product list are repo scaffolding; ./catalog is taken to be the Catalogs page's shopUI; the model invents the products (no products tool).",
      },
      {
        path: "/generative-ui/components/catalogs",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Catalogs",
        docPath: "/langgraph-typescript/generative-ui/components/catalogs",
        summary:
          "createGenerativeUI catalogs: typed components, zod and Valibot props, extends, parameterOrder and exportA2UICatalog.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Every snippet runs; Hero, Panel and cartUI are repo scaffolding. fs.writeFileSync is replaced by printing the exported catalog.",
      },
      {
        path: "/generative-ui/components/standard-catalog",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Standard catalog",
        docPath: "/langgraph-typescript/generative-ui/components/standard-catalog",
        summary:
          "standardUI's 69 components as is, extended with a ProductCard, with Map/Video/HtmlView omitted, and with Card overridden.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). ProductCard and productSchema are repo scaffolding.",
      },
      {
        path: "/generative-ui/components/state-and-actions",
        hasDemo: true,
        agentId: "genui",
        title: "Components · State and actions",
        docPath: "/langgraph-typescript/generative-ui/components/state-and-actions",
        summary:
          "App state bound into props, functions run on click, events sent to the agent, and writable props that keep user input.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Cart, cart.addItem, the state-catalog ProductCard and the catalogs around the fragment snippets are repo scaffolding. Renderer functions cannot be called by the agent in this version, so allowedCallers is shown as exported only.",
      },
      {
        path: "/generative-ui/components/theming",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Theming",
        docPath: "/langgraph-typescript/generative-ui/components/theming",
        summary:
          "The theme option's CSS variables, a typed GenerativeUITheme file, dark-mode overrides, map styles, and .a2ui-surface CSS.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The dark-mode script renders in the demo body, not <head>. The page's mapStyle URLs are placeholders, so the Map variant draws no basemap.",
      },
      {
        path: "/generative-ui/components/transports",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Transports",
        docPath: "/langgraph-typescript/generative-ui/components/transports",
        summary:
          "The render_ui tool transport vs the markdown transport, the runtime's generativeUI flag, and agentIds scoping.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The runtime sample's agent is undefined; this repo's genui LangGraph graph stands in, plus a shop agent so agentIds has one agent inside and one outside.",
      },
      {
        path: "/generative-ui/components/markdown-mode",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Markdown mode",
        docPath: "/langgraph-typescript/generative-ui/components/markdown-mode",
        summary:
          "The agent writes A2UI operations in a2ui code blocks inside its reply; sendContext: false moves the catalog into forwardedProps.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The sendContext: false variant renders no UI by design: the only backend shown for it is Python reading forwarded_props, which this repo's TypeScript graph does not.",
      },
      {
        path: "/generative-ui/components/from-a2ui",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Adopt from A2UI",
        docPath: "/langgraph-typescript/generative-ui/components/from-a2ui",
        summary:
          "The v0.9 a2ui renderer → A2UI 1.0 migration: the After catalog running on the new engine, with the Before code shown.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Airport and Arrow are repo scaffolding. The support matrix rules out @ag-ui/a2ui-toolkit 0.0.5 agent tools, (aws-strands-ts's fixed-schema agent; this repo's builds operations by hand).",
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
        status: "partial",
        statusNote:
          "Main graph verbatim (gpt-6-luna). New no-model graph (/frontend-tools/no-model) and useFrontendTools list demo (/frontend-tools/tool-list) not yet checked in a browser; the list demo's reports/navigate are repo-authored.",
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
        path: "/human-in-the-loop/index",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "HITL Overview",
        docPath: "/langgraph-typescript/human-in-the-loop/index",
        summary:
          "The overview's demo: useHumanInTheLoop suspending the run behind an in-chat time picker.",
        status: "partial",
        statusNote:
          "Code tab verbatim (agent, demo page, card); makeChatOpenAI swapped for new ChatOpenAI; the Code tab's showcase route.ts replaced by the main runtime. Not yet checked in a browser.",
      },
      {
        path: "/human-in-the-loop/useInterrupt",
        hasDemo: true,
        agentId: "gen-ui-interrupt",
        title: "Pausing the Agent for Input",
        docPath: "/langgraph-typescript/human-in-the-loop/useInterrupt",
        summary:
          "A backend tool pauses the graph with interrupt(); useInterrupt renders a picker in the chat and resolve() resumes it.",
        status: "partial",
        statusNote:
          "Page excerpts are verbatim @region blocks of the CopilotKit showcase files used here (agent graph assembly and generateFallbackSlots are the showcase's; TimePickerCard is a minimal stand-in; the suggestions hook is not copied). Not yet checked in a browser.",
      },
      {
        path: "/human-in-the-loop/headless",
        hasDemo: true,
        agentId: "interrupt-headless",
        title: "Headless Interrupts",
        docPath: "/langgraph-typescript/human-in-the-loop/headless",
        summary:
          "The same interrupt resolved from the app surface through a hand-rolled useHeadlessInterrupt over useAgent.",
        status: "partial",
        statusNote:
          "Demo is the doc's interrupt-headless file verbatim plus a minimal stand-in for its undefined AppSurface; agent shared with useInterrupt. Not yet checked in a browser.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        hasDemo: true,
        agentId: "governed-actions",
        title: "Governed Action Approval UI",
        docPath: "/langgraph-typescript/human-in-the-loop/governed-actions",
        summary:
          "Gating a side-effecting tool call behind an approve/reject card before it runs.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts. The useHumanInTheLoop approval works in principle; the governance behind it (policy engine, GovernedAction emitter, executeSideEffect) is published nowhere, so verdicts are whatever the model invents. The useInterrupt variant is not built. Not yet checked in a browser.",
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
      {
        path: "/webmcp",
        hasDemo: true,
        agentId: "webmcp",
        title: "WebMCP",
        docPath: "/langgraph-typescript/webmcp",
        summary:
          "A frontend tool mirrored onto document.modelContext so WebMCP browser agents can call it, plus the core-only registration with no agent.",
        status: "partial",
        statusNote:
          "Ported from aws-strands-ts; both snippets verbatim, searchOrders is a repo-authored stub. WebMCP itself needs Chrome 149+ with the flag or origin trial; elsewhere only the chat path works. Not yet checked in a browser.",
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
        status: "partial",
        statusNote:
          "Backend graph was missing from langgraph.json; now the page's Code-tab agent verbatim (gpt-6-luna; the unpublished makeChatOpenAI swapped for the repo's chatModel). Not yet checked in a browser.",
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
        status: "partial",
        statusNote:
          "Backend is the page's Code-tab subagents.ts verbatim. Its append-only delegations reducer contradicts the page's own merge-by-id callout, so the log doubles on a continued thread (README §9 item 19).",
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
    title: "Agent Capabilities",
    routes: [
      {
        path: "/guardrails",
        title: "Guardrails & DLP",
        docPath: "/langgraph-typescript/guardrails",
        summary:
          "Input, output and tool-call screening as agent middleware, ordered before CopilotKitMiddleware.",
        status: "broken",
        statusNote:
          "Reference-only: the page publishes Python only (AgentMiddleware, PIIMiddleware) and no TypeScript form; this repo's backend is Node. Code kept verbatim in docs-verbatim/guardrails/.",
      },
      {
        path: "/deploy-agentcore",
        title: "AWS AgentCore",
        docPath: "/langgraph-typescript/deploy-agentcore",
        summary:
          "Scaffolding and deploying a CopilotKit + LangGraph app to AWS Bedrock AgentCore with CDK.",
        status: "reference",
        statusNote:
          "Needs an AWS account (CDK, Cognito) — not testable locally. Commands kept verbatim.",
      },
      {
        path: "/deploy-langsmith",
        title: "LangSmith Platform",
        docPath: "/langgraph-typescript/deploy-langsmith",
        summary:
          "Deploying a graph to LangSmith and pointing LangGraphAgent at the deployment URL.",
        status: "reference",
        statusNote:
          "Needs a LangSmith deployment — not testable locally. The runtime wiring is the same LangGraphAgent shape every route here already uses.",
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
          "Server-owned execution settings: the trusted runtime route sets LangGraph context and recursion_limit; the browser sends none.",
        status: "partial",
        statusNote:
          "The page publishes only a graph.invoke(..., { context, recursionLimit }) fragment. Context schema, node and runtime wiring are repo-authored (README §9 item 18). Not yet checked in a browser.",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/langgraph-typescript",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
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
