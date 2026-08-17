# CopilotKit + LangGraph (TypeScript) Test Suite

A navigable, working test harness for the CopilotKit ↔ LangGraph TypeScript integration — every tracked doc page is a route, and every route runs the thing its page teaches.

| | |
|---|---|
| **Doc sync date** | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, rewritten on every sync |
| **Docs tracked** | <https://docs.copilotkit.ai/langgraph-typescript> (34 pages) |
| **CopilotKit** | `@copilotkit/react-core` `@copilotkit/runtime` `@copilotkit/voice` `@copilotkit/a2ui-renderer` — all `1.66.2`; `@copilotkit/sdk-js` `1.66.2` |
| **LangGraph** | `@langchain/langgraph` `1.4.9`, `@langchain/core` `1.2.5`, `@langchain/openai` `1.5.6`, `@langchain/langgraph-cli` `1.4.4` |
| **Frontend** | Next.js `16.3.0`, React `19.2.8`, TypeScript `5` |
| **Build** | `tsc --noEmit` clean · `eslint` clean · `next build` succeeds (35 routes prerendered) · all 32 graphs register |

---

## 2. Overview

LangGraph is LangChain's graph runtime: you declare state, nodes and edges, compile them, and a server runs the result with checkpointing. CopilotKit puts a user-facing frontend on top of that — streaming chat, generative UI, shared state, and human-in-the-loop — by speaking AG-UI to the graph.

This repo is a QA harness for that integration. Each page under `docs.copilotkit.ai/langgraph-typescript` that it tracks becomes a route with **notes and verbatim source on the left, a live chrome-free demo one click away**, and a status badge that says whether the thing actually works. It exists to answer "does this documented feature still do what the doc says?" without building a fresh app each time.

Every route is bound to its own compiled graph, so exercising one page never leaks a conversation, tool or state key into another.

- **Live doc root:** <https://docs.copilotkit.ai/langgraph-typescript>

---

## 3. Architecture

```
Browser
  │  React components from @copilotkit/react-core/v2
  ▼
Next.js app (frontend/, :3000)
  │  POST /api/copilotkit
  │    └─ CopilotRuntime { agents: { <graphId>: new LangGraphAgent({ deploymentUrl, graphId }) } }
  │  POST /api/copilotkit-voice/[[...slug]]      ← 2nd runtime: adds a TranscriptionService
  │  POST /api/copilotkit-declarative-gen-ui     ← 3rd runtime: A2UI enabled by the provider catalog
  ▼  AG-UI over SSE
LangGraph server (backend/, :8123)   `langgraphjs dev`
  │  reads backend/langgraph.json → 32 compiled graphs
  ▼
OpenAI  (gpt-4o-mini by default; o4-mini for the two reasoning routes;
         gpt-4o for A2UI dynamic-schema)
```

**Backend language/runtime for this integration: TypeScript.** This is worth stating because it varies. The Quickstart's "use an existing agent" tab is written in Python even on the TypeScript docs — `uv`, FastAPI, `ag-ui-langgraph` — but the path that actually applies here is the "start from scratch" tab's **LangGraph (JavaScript)** option: graphs are `.ts` files, `langgraph.json` names their exports, and `langgraphjs dev` serves them.

That choice determines the runtime class. `LangGraphAgent({ deploymentUrl, graphId })` addresses a LangGraph server (local or LangGraph Platform) and is what this repo uses. `LangGraphHttpAgent({ url })` — the Quickstart's other tab — is for a graph you expose yourself over AG-UI from FastAPI, which is a Python-side pattern.

**Why three runtime routes.** `transcriptionService` only exists on the v2 runtime handler, which the v1 wrapper drops, so Voice needs its own endpoint. And `injectA2UITool` is a per-runtime flag: fixed-schema must set it `false` (its graph owns `display_flight`, so a second injected tool would give the model two ways to draw the same card), while dynamic-schema must leave it unset so the provider catalog does the injecting. One runtime cannot be both.

---

## 4. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | **20+** (tested on 24.16.0) | Required by both halves. `langgraph.json` declares `node_version: "20"`. |
| npm | 10+ | Ships with Node. pnpm/yarn/bun work too; commands below use npm. |
| OpenAI API key | — | **Required.** Every graph runs on OpenAI, and the Voice route's transcription uses the same key for Whisper. |
| LangSmith API key | — | Optional. Only needed to point `LangGraphAgent` at LangGraph Platform instead of a local server. |
| Verified OpenAI org | — | Only for the two **Reasoning** routes. Reasoning *summaries* are gated behind [organization verification](https://platform.openai.com/settings/organization/general); without it those routes 400. Set `OPENAI_REASONING_SUMMARY=off` to run them without the trace. |
| CopilotKit Cloud key | — | Not used. Nothing in this repo requires the Enterprise Intelligence Platform. |

No Python and no global CLI install: `@langchain/langgraph-cli` is a dev dependency of `backend/`.

---

## 5. Setup

```bash
# 1. Clone
git clone <this-repo> langgraph-typescript
cd langgraph-typescript

# 2. Install frontend deps
npm install --prefix frontend

# 3. Install backend deps
npm install --prefix backend

# 4. Environment
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | What it does |
|---|---|---|
| `OPENAI_API_KEY` | **yes** | The model behind every graph, and the Whisper key for the Voice route's mic. |
| `LANGGRAPH_DEPLOYMENT_URL` | no | Where the Next runtime looks for the LangGraph server. Defaults to `http://localhost:8123`. Point it at a LangGraph Platform deployment to run against one. |
| `LANGSMITH_API_KEY` | no | Auth for LangGraph Platform. A local `langgraphjs dev` server needs no auth, so the default empty string is correct. |
| `OPENAI_MODEL` | no | Overrides the model for every graph. Defaults to `gpt-4o-mini`, which is what the doc snippets use. |
| `OPENAI_REASONING_MODEL` | no | For the two Reasoning routes, which need a model that emits reasoning tokens. Defaults to `o4-mini`. |
| `OPENAI_A2UI_MODEL` | no | Model for the A2UI dynamic-schema route only. Defaults to `gpt-4o`, which is what the doc's own A2UI example uses — `gpt-4o-mini` cannot hold the protocol shape. |
| `OPENAI_REASONING_SUMMARY` | no | `auto` (default), `concise`, `detailed`, or `off`. Summaries need a verified OpenAI org; `off` drops the field so unverified orgs get a working route without the reasoning card. |
| `NEXT_PUBLIC_COPILOTKIT_INSPECTOR` | no | Set to `off` to disable the inspector overlay everywhere. |

**One `.env`, two readers.** The LangGraph server picks it up via `"env": "../.env"` in `backend/langgraph.json`. Next only auto-loads `.env` from its own directory, so link it once:

```bash
ln -s ../.env frontend/.env.local
```

Skip that and you get a working chat with a broken mic — the graph has the key, the Next process does not.

**Ports:** frontend `3000`, LangGraph server `8123`. If `8123` is taken, change `--port` in `backend/package.json` and set `LANGGRAPH_DEPLOYMENT_URL` to match.

---

## 6. Running the project

Two processes, two terminals.

```bash
# Terminal 1 — the agents
npm run dev --prefix backend
```

Successful startup prints one line per graph and then the API banner:

```
info: ┏ Registering graph with id 'sample_agent'
info: ┗ [1] { graph_id: 'sample_agent' }
...                                            (32 of these)
info: ▪ Starting 10 workers
          🚀 API: http://localhost:8123
```

Seeing fewer than 32 `Registering graph` lines means an export name in `langgraph.json` no longer matches its file.

```bash
# Terminal 2 — the app
npm run dev --prefix frontend
```

```
▲ Next.js 16.3.0
- Local:  http://localhost:3000
✓ Ready in 2.1s
```

Open **<http://localhost:3000>**. A quick smoke test:

```bash
curl -s http://localhost:8123/assistants/search -X POST \
  -H 'content-type: application/json' -d '{"limit":100}' | grep -c graph_id
```

Then open `/quickstart`, click **Open demo**, and send "Can you tell me a joke?" — if tokens stream, both halves are wired.

---

## 7. What to expect — walkthrough per section

Every route has a notes page (what it demonstrates, verbatim source, known caveats) and an **Open demo ↗** button to a chrome-free surface. Statuses match §8.

### Getting Started

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/` | Landing page: architecture, graph roster, live route counts. | — | Counts render and the sidebar lists 10 groups. |
| `/quickstart` | The smallest end-to-end path: one compiled graph, named in `langgraph.json`, reached via `LangGraphAgent`. | "Can you tell me a joke?" | **Pass:** tokens stream a word at a time, markdown renders. **Fail:** error banner → check `:8123` is up and `OPENAI_API_KEY` is set. |

### Prebuilt Components

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/prebuilt-components/chat` | `<CopilotChat>` filling its container. | "What can you do?" | **Pass:** chat fills the pane, no docked chrome. **Fail:** zero-height chat → the container has no height. |
| `/prebuilt-components/sidebar` | `<CopilotSidebar defaultOpen>` beside content, not over it. | Toggle it closed and open. | **Pass:** page content reflows around it. **Fail:** it overlays content — that is Popup behaviour. |
| `/prebuilt-components/popup` | `<CopilotPopup>` overlay launcher with a custom `labels` placeholder. | Open, ask anything, close. | **Pass:** floats above content, placeholder reads "Ask the popup anything…". |
| `/prebuilt-components/chat-controls` | `useCopilotChatConfiguration().setModalOpen`, plus `onThumbsUp`/`onThumbsDown`. | Open from the page button; thumbs-up a reply. | **Pass:** external button opens the modal; feedback buttons appear on assistant messages and log their `message.id`. **Fail:** no thumbs buttons → they only render when a handler is passed. |

### Custom Look and Feel

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/custom-look-and-feel/css` | Re-skinning via v2 shadcn tokens and `.copilotKit*` class hooks, scoped to a wrapper. | Send two messages. | **Pass:** warm parchment theme, user bubbles are monospace with a `→` marker. **Fail:** default theme → `theme.css` was not imported by the route. |
| `/custom-look-and-feel/slots` | Three override levels: class string, props object, whole component. | Look before and after the first message. | **Pass:** custom welcome screen, tinted assistant card with a "slot" badge, tagged disclaimer. **Fail:** default welcome screen → the `welcomeScreen` prop is not landing. |
| `/custom-look-and-feel/headless-ui` | A chat with no CopilotKit chrome — `useAgent` + `useCopilotKit` only. | Send a message. | **Pass:** hand-rolled bubbles stream. **Fail:** nothing sends → `runAgent` was not called after `addMessage`. |
| `/custom-look-and-feel/reasoning-messages` | The built-in reasoning card and its `header` / `contentView` sub-slots. | "A bat and ball cost $1.10 in total…" | **Pass:** a card with custom header and monospace content, collapsing to "Thought for N seconds". It arrives in chunks, not per token — streaming is off on this graph by design (§9). **Fail:** no card → the model emitted no reasoning tokens. |

### Input Modalities

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/multimodal-attachments` | `attachments={{ enabled: true }}` sending files as AG-UI content parts. | Drag in a PNG, ask "what's in this image?" | **Pass:** thumbnail in the composer, then a description of the actual image. **Fail:** `RUN_ERROR` → the model does not support that modality. |
| `/voice` | A second runtime carrying a `TranscriptionService`, which is what grows the mic button. | Click **Try a sample audio**, then the mic. | **Pass:** sample text lands in the composer and auto-sends; the mic records and transcribes. **Fail:** no mic button at all → the runtime is not advertising `audioFileTranscriptionEnabled` (check `basePath` matches the route directory). A clean 401 on the mic means no `OPENAI_API_KEY` in the **Next** process. |

### Generative UI

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/generative-ui/reasoning` | Replacing the whole card via `messageView.reasoningMessage`. | A multi-step puzzle. | **Pass:** an amber "Reasoning" banner instead of the default card. **Fail:** default card → the slot did not take. |
| `/generative-ui/tool-based` | `useComponent` registering a React component as a tool. | "Chart Q1–Q4 revenue: 4, 6, 5, 9" | **Pass:** a Recharts bar chart renders inline. **Fail:** a markdown table → the model answered instead of calling the component tool. |
| `/generative-ui/tool-rendering` | A named renderer for `get_weather` plus the `useDefaultRenderTool` wildcard. | "What's the weather in Lisbon?" | **Pass:** a branded weather card, not raw JSON. **Fail:** raw JSON → the renderer `name` does not match the backend tool name. |
| `/generative-ui/state-rendering` | Drawing agent state as it arrives. | "Write a short blog post about shared state" | **Pass:** the document pane fills continuously. **Fail:** one burst at the end. |
| `/generative-ui/a2ui/dynamic-schema` | A secondary LLM designing a surface from your catalog. | "Show me a sales dashboard for Q3" | **Pass:** cards, metric tiles and a chart appear progressively. **Fail:** prose only → the catalog is not reaching the runtime. |
| `/generative-ui/a2ui/fixed-schema` | A JSON-authored component tree; the tool supplies only data. | "Find me a flight from SFO to JFK" | **Pass:** a flight card with airport codes, airline badge and price. **Fail:** a raw operations blob → the A2UI middleware is not scoped to this agent. The Book button is inert by design (§9). |

### App Control

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/frontend-tools` | A tool that executes in the browser and changes the page. | "Make the background a sunset gradient" | **Pass:** the page background changes. **Fail:** the agent describes a gradient in prose. |
| `/human-in-the-loop` | `useHumanInTheLoop` suspending the run behind a picker. | "Book an intro call with sales" | **Pass:** picker renders, nothing streams until you pick, then the confirmation names your slot. **Fail:** the run continues under the picker → `respond` was never called. |
| `/human-in-the-loop/interrupt-flow` | LangGraph's own `interrupt()`, plus two `useInterrupt` hooks split by `enabled`. | "Hello" | **Pass:** an *ask* card, then an *approval* card, then the reply — using the name you typed. Second message: no cards. **Fail:** immediate reply → the `agentId` on the hook does not match the registered id. |
| `/programmatic-control` | `addMessage`, `runAgent`, `stopAgent`, `subscribe` — no chat component. | Press the run button; press stop mid-run. | **Pass:** messages appear and streaming halts on stop. |

### Shared State

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/shared-state` | Two-way: agent writes `notes`, UI writes `preferences`. | "I'm a backend engineer working in Rust", then set Tone → playful and ask again. | **Pass:** scratch pad fills; after the preference change the register visibly shifts. **Fail:** panel updates but the voice does not → the node is not reading state back. |
| `/shared-state/rendering-in-app` | The same state as a main-view canvas with the chat docked beside it. | Ask for notes, then press Clear on the canvas. | **Pass:** canvas and chat share one state object; Clear empties it for both. |
| `/shared-state/streaming` | `copilotkitCustomizeConfig` + `emitIntermediateState`. | "Write a short blog post about agent state" | **Pass:** the pane fills a few words at a time with a LIVE badge. **Fail:** one jump at the end. |
| `/shared-state/agent-readonly` | `useAgentContext` as a one-way UI → agent channel. | "What do you know about me?" | **Pass:** it reports the name, timezone and activity from the sidebar. **Fail:** it knows nothing → the graph state does not spread `CopilotKitStateAnnotation.spec`. |
| `/agent-app-context` | The Readables page's colleague list, read off `state.copilotkit.context`. | "Who are my colleagues?", remove one, ask again. | **Pass:** answers track the roster with no message announcing the change. |
| `/shared-state/in-app-agent-read` | Reading `agent.state.language` in your own components. | "Switch to Spanish" | **Pass:** the Language line changes and the reply is Spanish. |
| `/shared-state/in-app-agent-write` | `agent.setState` plus the setState-then-`runAgent` re-run. | Press the toggle button. | **Pass:** the agent re-runs and answers in the new language without you typing. |
| `/shared-state/state-inputs-outputs` | Splitting state: `question` in, `answer` out, `resources` internal. | Press **Ask**. | **Pass:** answer fills; `agent.state.question` stays `undefined`; `agent.state.resources` stays `undefined` while the reply shows the agent used them. **Fail:** `resources` shows an array → the output annotation is not applied. |
| `/shared-state/predictive-state-updates` | `StepProgressTool` reporting steps mid-generation. | "Plan and execute a data migration" | **Pass:** the step list fills before the answer, with a LIVE badge. |

### Multi-Agent

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/multi-agent/subagents` | A supervisor delegating through tools, with a live log. | "Write a short piece on why agents need shared state" | **Pass:** the log grows with research → writing → critique entries in real time. **Fail:** one entry only → the `delegations` reducer is not concatenating. |
| `/subgraphs` | A compiled graph used as a node inside another. | "How should I migrate a REST API to GraphQL?" | **Pass:** the outline pane fills and `last write` reads `planner_subgraph.plan_node` **before** the reply starts. **Fail:** outline and reply land together → nested streaming is being buffered. |

### Agent Config

| Route | Demonstrates | Try | Pass / Fail |
|---|---|---|---|
| `/agent-config` | A typed config object the UI owns, rebuilt into the system prompt each turn. | Set tone → enthusiastic, expertise → beginner; ask "what is a graph?" | **Pass:** the answer's register and depth change to match. |
| `/configurable` | Per-run `config.configurable` that never touches agent state. | Press **Run with this config**, change `tenantId`, press again. | **Pass:** the reply reports the values back and the new one after the change; none appear in `agent.state`. **Fail:** "no configuration" → `forwardedProps` must nest as `{ config: { configurable: {...} } }`. |

---

## 8. Testing checklist / current status

35 routes (34 tracked doc pages + the landing page). Statuses live in `frontend/src/lib/nav-config.ts` and drive the in-app `/status` view, the sidebar dots and this table.

| Doc page | Route | Status | Notes |
|---|---|---|---|
| Introduction | `/` | ⚪ Reference | Landing page — orientation and live graph roster. |
| Quickstart | `/quickstart` | ✅ Working | Doc's bring-your-own tab is Python even here; this is that one-node graph in TypeScript. |
| CopilotChat | `/prebuilt-components/chat` | ✅ Working | |
| CopilotSidebar | `/prebuilt-components/sidebar` | ✅ Working | |
| CopilotPopup | `/prebuilt-components/popup` | ✅ Working | |
| Open, close, and feedback | `/prebuilt-components/chat-controls` | ✅ Working | |
| CSS Customization | `/custom-look-and-feel/css` | ✅ Working | |
| Slots | `/custom-look-and-feel/slots` | ✅ Working | Slot override components are this repo's — the doc declares them as stubs. |
| Headless UI | `/custom-look-and-feel/headless-ui` | ✅ Working | |
| Reasoning Messages | `/custom-look-and-feel/reasoning-messages` | ⚠️ Partial | Needs a reasoning-token model. Defaults to `o4-mini`; override with `OPENAI_REASONING_MODEL`. Token streaming disabled — see §9. |
| Multimodal Attachments | `/multimodal-attachments` | ✅ Working | |
| Voice | `/voice` | ⚠️ Partial | Mic needs `OPENAI_API_KEY` in the Next process. Without it the sample-audio button still drives the route. |
| Reasoning | `/generative-ui/reasoning` | ⚠️ Partial | Same reasoning-model dependency and disabled token streaming. |
| Components as Tools | `/generative-ui/tool-based` | ✅ Working | |
| Tool Call Rendering | `/generative-ui/tool-rendering` | ⚠️ Partial | `get_weather` only — the sole backend tool the page defines. See §9. |
| State Rendering | `/generative-ui/state-rendering` | ✅ Working | Shares a graph with State Streaming, as the docs do. |
| A2UI · Dynamic Schema | `/generative-ui/a2ui/dynamic-schema` | ⚠️ Partial | Catalog is the doc's; the leaf UI is this repo's. Most model-sensitive route in the repo — needs `gpt-4o`; one invented component name fails the whole surface. See §9. |
| A2UI · Fixed Schema | `/generative-ui/a2ui/fixed-schema` | ⚠️ Partial | Book button inert — `a2ui.render` takes no `action_handlers` yet, per the page itself. |
| Frontend Tools | `/frontend-tools` | ✅ Working | |
| Human-in-the-Loop | `/human-in-the-loop` | ✅ Working | |
| Interrupts | `/human-in-the-loop/interrupt-flow` | ✅ Working | `enabled` predicate signature differs from the doc — see §9. |
| Programmatic Control | `/programmatic-control` | ✅ Working | |
| Shared State | `/shared-state` | ✅ Working | `set_notes` written to the contract the page describes in prose. |
| Render state in your app | `/shared-state/rendering-in-app` | ✅ Working | |
| State Streaming | `/shared-state/streaming` | ✅ Working | |
| Agent Read-Only Context | `/shared-state/agent-readonly` | ✅ Working | |
| Readables | `/agent-app-context` | ⚠️ Partial | Covers `impl=graph`. `impl=prebuilt` (`createAgent` + `copilotkitMiddleware`) documented, not run. |
| Reading agent state | `/shared-state/in-app-agent-read` | ✅ Working | |
| Writing agent state | `/shared-state/in-app-agent-write` | ✅ Working | |
| Input/Output Schemas | `/shared-state/state-inputs-outputs` | ⚠️ Partial | Doc declares `resources` but never writes or reads it — the internal-state half is this repo's. See §9. |
| Predictive state updates | `/shared-state/predictive-state-updates` | ⚠️ Partial | Two tabs, one per `agent-type`. Custom graph works. Prebuilt tab is verbatim including `model: "openai:gpt-5.4"`, so it runs only if your key reaches that model — see §9. |
| Sub-Agents | `/multi-agent/subagents` | ✅ Working | Supervisor node + graph assembly are this repo's; tools and state are the doc's. |
| Subgraphs | `/subgraphs` | ⚠️ Partial | Page publishes only the frontend snippet, so the parent/child graph is this repo's. |
| Agent Config | `/agent-config` | ✅ Working | Graph published in full; reproduced. |
| Configurable | `/configurable` | ✅ Working | |

**Totals:** 24 ✅ Working · 10 ⚠️ Partial · 1 ⚪ Reference · 0 ❌ Broken · 0 🚧 Not started.

### Doc pages deliberately not tracked

The tracked set is the 34 pages this repo was scoped to. The live sidebar also carries Rich Threads (5 pages), Concepts (5), MCP Apps, most of the Runtime group, Inspector, VS Code Extension, Intelligence Platform (4), AWS AgentCore, and Troubleshooting. None are implemented here and none are counted above.

---

## 9. Known issues / doc-vs-implementation discrepancies

Ordered by how likely each is to cost you time.

**1. `useInterrupt`'s `enabled` predicate has a different signature than documented.**
[Interrupts](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop/interrupt-flow) writes it as `enabled: ({ eventValue }) => eventValue.type === 'ask'`. In `@copilotkit/react-core@1.66.2` the predicate receives the legacy event itself — `InterruptEvent<T>`, i.e. `{ name, value }` — so the payload is on `.value` and destructuring `eventValue` yields `undefined`. Copied as written, both hooks return `false` for every interrupt and the run hangs with no UI and no error. Fixed here in `frontend/src/app/human-in-the-loop/interrupt-flow/demo-chat/page.tsx`.

**2. `makeChatOpenAI` is imported everywhere and published nowhere.**
Nearly every LangGraph TypeScript snippet — [Frontend Tools](https://docs.copilotkit.ai/langgraph-typescript/frontend-tools), [Sub-Agents](https://docs.copilotkit.ai/langgraph-typescript/multi-agent/subagents), [Agent Config](https://docs.copilotkit.ai/langgraph-typescript/agent-config), [A2UI Fixed Schema](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/a2ui/fixed-schema) — opens with `import { makeChatOpenAI } from "./openai-headers"`. That module is never shown; it is a private helper in the demo repo the snippets are extracted from. The pages that *don't* use it ([Predictive state updates](https://docs.copilotkit.ai/langgraph-typescript/shared-state/predictive-state-updates), [Interrupts](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop/interrupt-flow), [Input/Output Schemas](https://docs.copilotkit.ai/langgraph-typescript/shared-state/state-inputs-outputs)) write `new ChatOpenAI({ model })` inline. This repo uses that second form via `backend/src/agents/model.ts`.

**3. The Readables TypeScript sample does not compile.**
[Readables (`impl=graph`)](https://docs.copilotkit.ai/langgraph-typescript/agent-app-context?impl=graph) reads `state.copilotKit.context` with a capital K (the channel is `state.copilotkit`, as every other page has it), matches a description string carrying an unbalanced quote — `'The current user\'s colleagues"'` — and dereferences the `find` result with no null check. The Python tab on the same page is correct. This repo follows the lowercase channel used by Frontend Tools and Read-Only Context.

**4. Two incompatible state-definition dialects across the docs.**
Some pages use `Annotation.Root({ ...CopilotKitStateAnnotation.spec, … })` ([Frontend Tools](https://docs.copilotkit.ai/langgraph-typescript/frontend-tools), [Shared State](https://docs.copilotkit.ai/langgraph-typescript/shared-state), [Input/Output Schemas](https://docs.copilotkit.ai/langgraph-typescript/shared-state/state-inputs-outputs)); others use `new StateSchema({ …CopilotKitStateSchema.fields })` with zod ([Reading agent state](https://docs.copilotkit.ai/langgraph-typescript/shared-state/in-app-agent-read), [Interrupts](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop/interrupt-flow)). Both exist in the SDK, but they do not mix in one graph and no page says which is current. This repo uses the annotation form throughout, because every page with a *complete, runnable* TypeScript graph uses it.

**5. `useAgent` has no `render` prop.**
[Predictive state updates](https://docs.copilotkit.ai/langgraph-typescript/shared-state/predictive-state-updates) shows `useAgent({ agentId, render: ({ state }) => … })` to draw a "Current Progress" list alongside a "Final Steps" list read from `agent.state`. `UseAgentProps` has no `render` member, so this is a type error; and both lists read the same array, so the distinction it implies does not exist. This route renders one list with a live indicator.

**6. Tool Call Rendering wires four tools and defines one.**
[Tool Call Rendering](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/tool-rendering) shows frontend renderers for `get_weather`, `search_flights`, `get_stock_price` and `roll_dice`, but publishes the backend definition of `get_weather` only. The other three appear solely as renderer props, so their argument and return shapes are never stated. Rather than invent them, this repo implements `get_weather` and marks the route Partial. The wildcard catch-all is still wired and will render any tool you add.

**7. The Voice route hardcodes a graph id from the CLI starter.**
[Voice](https://docs.copilotkit.ai/langgraph-typescript/voice) publishes its API route almost in full with `graphId: "starterAgent"` — the name `npx copilotkit@latest create` writes into its `langgraph.json`. Nothing on the page defines that graph, so copying the file into a project with different graph names 404s at the LangGraph server. This repo uses `voice-demo`.

**8. Pages that name a tool but never show it.**
[Shared State](https://docs.copilotkit.ai/langgraph-typescript/shared-state) describes `set_notes` ("emits a `Command({ update: ... })`") and a preferences-injecting chat node; [State Streaming](https://docs.copilotkit.ai/langgraph-typescript/shared-state/streaming) names `write_document.document` and publishes the mapping. In both cases the contract is complete — tool name, argument name, target state key, return shape — but no body is printed. Both are implemented here to that contract.

**9. Input/Output Schemas declares an internal state slice it never implements.**
[Input/Output Schemas](https://docs.copilotkit.ai/langgraph-typescript/shared-state/state-inputs-outputs) is built around three slices — `question` in, `answer` out, `resources` internal — and `resources` is the one the page exists to demonstrate. It is declared in the full annotation, its purpose is spelled out in prose ("used by the LLM to answer the question, and should not be communicated to the user, or set by them"), and the final step tells you to expect that "the UI has no access to resources." But no snippet on the page ever writes or reads it: `answerNode` returns only `messages` and `answer`, its system prompt does not mention resources, and a `// ...add the rest of the agent implementation` comment sits exactly where that logic would go. Both language tabs have the same hole. The `RESOURCES` constant and the prompt line citing it in `backend/src/agents/state-inputs-outputs.ts` are therefore this repo's, written so the page's own stated expectation is actually observable; the annotations and the `StateGraph(Full, { input, output })` call are the doc's, verbatim.

**10. Pages with no backend code at all.**
[Subgraphs](https://docs.copilotkit.ai/langgraph-typescript/subgraphs) publishes a four-line `useAgent` snippet and links to the Feature Viewer. Its claim — that nesting needs no agent-side changes — is true, which is why there is nothing to copy, but it also means a parent/child pair had to be written to have something to observe. The graphs in `backend/src/agents/subgraphs.ts` are this repo's.

**11. A2UI fixed-schema loads a JSON file it never prints.**
[Fixed Schema A2UI](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/a2ui/fixed-schema) calls `loadSchema("flight_schema.json")` but shows no contents. The page does diagram the exact tree and the binding syntax, so `backend/src/agents/a2ui_schemas/flight_schema.json` is written to that. The page also states its own limitation: `a2ui.render` does not accept `action_handlers` yet, so the Book button is inert and `booked_schema.json` is loaded but unused.

**12. The A2UI dynamic-schema opt-out path is Python-only.**
Its "I opted out of auto-inject" section shows `get_a2ui_tools` and `A2UIMiddleware` in a file labelled `agent.py`, with no TypeScript equivalent anywhere. This repo takes the documented default (a catalog on the provider auto-enables A2UI and injects the tool), which needs no A2UI code in the graph.

**13. Inline `useAgent` state reads are untyped in the docs.**
[Render state in your app](https://docs.copilotkit.ai/langgraph-typescript/shared-state/rendering-in-app) writes `agent.state?.items.map((it) => …)`, where `it` is implicitly `any` and fails under `strict`. Narrow `agent.state` once into a typed local first, as `rendering-in-app/demo-chat/page.tsx` does.

**14. Streaming a reasoning model over the Responses API collapses the answer into the reasoning block.**
With `useResponsesApi: true` and token streaming on, the reasoning-summary delta and the answer's `output_text` delta are pushed to the *same* content-block index. The streaming reducer merges them into a single `type: "reasoning"` block, and the AG-UI bridge then routes the entire turn — answer included — to `REASONING_MESSAGE_*` events, so no assistant message ever renders: you get a reasoning card and no reply. The non-streaming path converts final output *items* rather than indexed deltas, correctly yielding a separate `reasoning` block and `text` block, so both a reasoning message and the answer come through. Both reasoning graphs therefore set `disableStreaming: true` in `backend/src/agents/chat-agents.ts`; the visible cost is that those two routes fill in per-chunk rather than per-token. Observed on `@langchain/openai` 1.4.x and carried forward here on 1.5.6 — re-test before removing the flag.

**15. Interrupt payloads reach the client JSON-stringified, and the Interrupts page ignores that.**
A graph calling `interrupt({ type: "ask", content: "…" })` does not deliver an object: by the time the `on_interrupt` custom event reaches the browser, the AG-UI adapter has stringified it, so `event.value` is `'{"type":"ask","content":"…"}'`. [Interrupts](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop/interrupt-flow) never mentions this — its "Condition UI executions" example reads `eventValue.type` and `event.value.content` straight off the payload, which silently yields `undefined`. Every `enabled` predicate then returns false, no interrupt UI renders, and the run appears to hang with no error anywhere; the backend logs show the interrupt firing correctly. The one place the docs do say it is the [Programmatic Control](https://docs.copilotkit.ai/langgraph-typescript/programmatic-control) page's headless example — "the AG-UI adapter JSON-stringifies interrupt values, so parse when the value arrives as a string" — on a different page, in a different pattern. `interrupt-flow/demo-chat/page.tsx` parses defensively, handling both shapes, since a plain-string `interrupt("…")` payload is not JSON and must stay a string.


**16. The prebuilt-agent state schema on Predictive state updates does not typecheck.**
[Predictive state updates](https://docs.copilotkit.ai/langgraph-typescript/shared-state/predictive-state-updates?agent-type=prebuilt) declares `observed_steps: z.array(z.string()).default(() => [])` inside `new StateSchema({...})`. Against `@langchain/langgraph` 1.4.9 that is rejected: `StateSchema` fields must satisfy `SerializableSchema`, whose `~standard` implements both StandardSchemaV1 and StandardJSONSchemaV1, and zod 3.25 implements only the former — notwithstanding LangGraph's own docstring presenting a bare `z.object(...)` as compliant. Verified to construct and run correctly at runtime, so this is a type-level version skew rather than a broken example. `backend/src/agents/predictive-state-updates-prebuilt.ts` keeps the field as published behind a `@ts-expect-error`. The custom-graph tab uses `Annotation.Root` and is unaffected — which is also why the rest of this repo uses the annotation dialect (§9 item 4).

The same tab also specifies `model: "openai:gpt-5.4"`. That name is reproduced verbatim rather than mapped to the repo's configured model, so if your key cannot reach it this one tab fails at the first turn with an OpenAI model error while every other route keeps working. Change the `model` line in `backend/src/agents/predictive-state-updates-prebuilt.ts` to a model you have — e.g. `"openai:gpt-4o-mini"` — if you want it live.


**17. The manual-emission snippet does not await `copilotkitEmitState`.**
[Predictive state updates](https://docs.copilotkit.ai/langgraph-typescript/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission) writes `copilotkitEmitState(config, state);` inside a loop. The function is an `AsyncFunction`, the SDK's own docstring for it writes `await copilotkitEmitState(config, { progress: i })`, and the Python tab on the same page writes `await copilotkit_emit_state(...)` — only the TypeScript tab drops it. In this specific example it works, because the `setTimeout(…, 1000)` on the next line gives the promise time to settle, but it is a floating promise: a rejection would be unhandled, and nothing orders the emissions against the sleep. Copy that loop into code without the delay and updates can interleave or be lost. `backend/src/agents/predictive-state-updates-manual.ts` reproduces it as published. The snippet is also a fragment — everything around the loop is elided behind `// ...`, so the surrounding node is this repo's.


---

## 10. Troubleshooting

Drawn from the Quickstart's own troubleshooting accordion and the failure modes hit while building this repo.

**"graph is nullish" on startup.** The LangGraph CLI could not load a graph. The export name in `langgraph.json` must match the file: `"sample_agent": "./src/agents/quickstart.ts:graph"` needs `export const graph = …`. This repo puts several graphs in one file, so most entries name a specific export (`chat-agents.ts:agenticChatGraph`) — a typo there gives exactly this error.

**Fewer than 32 `Registering graph` lines.** Same cause. Compare the log against `Object.keys(langgraph.json.graphs)`.

**`EADDRINUSE: 127.0.0.1:8123`.** Something else holds the port — often another LangGraph server. Free it, or change `--port` in `backend/package.json` and set `LANGGRAPH_DEPLOYMENT_URL` to match.

**Connection issues between the two processes.** The Quickstart suggests `0.0.0.0` or `127.0.0.1` instead of `localhost`; on hosts where those resolve differently this is a real fix. Set `LANGGRAPH_DEPLOYMENT_URL=http://127.0.0.1:8123`.

**Chat works, the mic returns 401.** `OPENAI_API_KEY` is reaching the LangGraph server but not the Next process. Next only auto-loads `.env` from its own directory — `ln -s ../.env frontend/.env.local` (§5).

**"thread is already processing".** `runAgent` is being called on every render. Move it into an event handler, or a `useEffect` with an empty dependency array. The Configurable page warns about this specifically.

**Interrupt cards never appear.** Two causes, both silent. (1) `agentId` on `useInterrupt` must match a runtime-registered agent; omitting it defaults to `"default"` and the interrupt never fires. (2) `event.value` arrives JSON-stringified, so `event.value.type` is `undefined` and every `enabled` predicate returns false — parse it first (§9 item 15). If the backend log shows a `CUSTOM_EVENT` named `on_interrupt`, the graph is fine and the problem is one of these two.

**`400 Your organization must be verified to generate reasoning summaries`.** Only the two Reasoning routes. The visible reasoning trace requires a [verified OpenAI org](https://platform.openai.com/settings/organization/general); verification can take ~15 minutes to propagate. `effort` is not gated, only `summary` — so `OPENAI_REASONING_SUMMARY=off` keeps the model reasoning and the route answering, just with no reasoning card. Every other route is unaffected either way.

**The agent ignores a frontend tool.** Frontend tools arrive on `state.copilotkit.actions` and must be bound with `convertActionsToDynamicStructuredTools(...)` inside the node. A graph whose state does not spread `CopilotKitStateAnnotation.spec` has no such channel.

**A frontend tool call hangs the graph.** `shouldContinue` must route only *backend* tool calls to the tool node; a frontend tool has to leave the graph so CopilotKit can run it in the browser. Every routed graph here uses the published check.

**State updates arrive all at once.** Expected without an `emitIntermediateState` mapping — state only changes across node transitions. See `/shared-state/streaming`.

**A streamed value disappears when the run ends.** A node's returned state is the single source of truth at the checkpoint. The tool must also write the key in its `Command({ update })`, or the streamed partial is discarded.

**Nothing renders for a tool call.** Without `useDefaultRenderTool()` there is no `*` renderer and tool calls are invisible — the user sees only the final text.

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 35 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than 250 KB of rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline and report the whole corpus as rewritten on the next run. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level | Trigger |
|---|---|
| **High** | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code |
| **Low** | other prose |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run *after* a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged, so a change from six weeks ago still shows if nothing has happened since.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run and shown on `/`, `/status` and `/doc-sync`. There is no hand-maintained date to keep in step with it.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored derived data.

---

## 11. Project structure

```
langgraph-typescript/
├── .env.example                 # every variable, with what it does
├── CLAUDE.md                    # the build spec this repo was produced against
├── README.md
├── backend/                     # TypeScript LangGraph — served by `langgraphjs dev` on :8123
│   ├── langgraph.json           # THE REGISTRY: graphId → file.ts:export  (32 graphs)
│   ├── package.json             # `npm run dev` = langgraphjs dev --port 8123
│   └── src/agents/
│       ├── model.ts             # the one place ChatOpenAI is constructed
│       ├── quickstart.ts        # sample_agent — the minimal graph
│       ├── chat-agents.ts       # 11 prebuilt/look-and-feel graphs from one builder
│       ├── frontend-tools.ts    # frontend_tools, gen-ui-tool-based, hitl-in-chat
│       ├── tool-rendering.ts    # get_weather + ToolNode routing
│       ├── shared-state-*.ts    # read-write, streaming, language
│       ├── state-inputs-outputs.ts
│       ├── predictive-state-updates.ts
│       ├── readonly-state.ts    # agent-readonly + agent-app-context
│       ├── interrupt-flow.ts    # LangGraph interrupt()
│       ├── subagents.ts         # supervisor + 3 delegation tools
│       ├── subgraphs.ts         # a compiled graph as a node
│       ├── agent-config.ts  configurable.ts  declarative-gen-ui.ts  a2ui-fixed.ts
│       └── a2ui_schemas/        # flight_schema.json, booked_schema.json
└── frontend/                    # Next.js App Router — :3000
    ├── src/lib/
    │   ├── nav-config.ts        # SINGLE SOURCE OF TRUTH: routes, docs, statuses
    │   ├── agents.ts            # graph ids + LangGraph URL, mirrors langgraph.json
    │   ├── source.ts            # reads real repo files so pages show running code
    │   └── inspector.ts         # which provider owns the inspector overlay
    ├── src/components/          # app chrome, route header, demo frame, source viewer
    └── src/app/
        ├── api/copilotkit/route.ts                  # the runtime — all 32 graphs
        ├── api/copilotkit-voice/[[...slug]]/route.ts# + TranscriptionService
        ├── api/copilotkit-declarative-gen-ui/route.ts# + injectA2UITool: true
        ├── page.tsx  status/page.tsx                # landing, status table
        └── <doc-route>/
            ├── page.tsx         # notes, verbatim source, caveats
            └── demo-chat/       # the chrome-free live surface
```

Two invariants keep this honest: pages display source by **reading the real files off disk** (`lib/source.ts`), so nothing shown can drift from what runs; and route metadata lives only in `nav-config.ts`, so the nav, the badges, the status page and §8 cannot disagree.

---

## 12. References

Grouped as the doc sidebar groups them. All 34 tracked pages.

**Get Started**
- [Quickstart](https://docs.copilotkit.ai/langgraph-typescript/quickstart)

**Prebuilt Components**
- [CopilotChat](https://docs.copilotkit.ai/langgraph-typescript/prebuilt-components/chat)
- [CopilotSidebar](https://docs.copilotkit.ai/langgraph-typescript/prebuilt-components/sidebar)
- [CopilotPopup](https://docs.copilotkit.ai/langgraph-typescript/prebuilt-components/popup)
- [Open, close, and feedback](https://docs.copilotkit.ai/langgraph-typescript/prebuilt-components/chat-controls)

**Custom Look and Feel**
- [CSS Customization](https://docs.copilotkit.ai/langgraph-typescript/custom-look-and-feel/css)
- [Slots](https://docs.copilotkit.ai/langgraph-typescript/custom-look-and-feel/slots)
- [Headless UI](https://docs.copilotkit.ai/langgraph-typescript/custom-look-and-feel/headless-ui)
- [Reasoning Messages](https://docs.copilotkit.ai/langgraph-typescript/custom-look-and-feel/reasoning-messages)
- [Multimodal Attachments](https://docs.copilotkit.ai/langgraph-typescript/multimodal-attachments)
- [Voice](https://docs.copilotkit.ai/langgraph-typescript/voice)

**Build Generative UI**
- [Reasoning](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/reasoning)
- [Components as Tools](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/tool-based)
- [Tool Call Rendering](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/tool-rendering)
- [State Rendering](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/state-rendering)
- [A2UI · Dynamic Schema](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/a2ui/dynamic-schema)
- [A2UI · Fixed Schema](https://docs.copilotkit.ai/langgraph-typescript/generative-ui/a2ui/fixed-schema)

**Add Agent Powers**
- [Frontend Tools](https://docs.copilotkit.ai/langgraph-typescript/frontend-tools)
- [Human-in-the-Loop](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop)
- [Interrupts](https://docs.copilotkit.ai/langgraph-typescript/human-in-the-loop/interrupt-flow)
- [Sub-Agents](https://docs.copilotkit.ai/langgraph-typescript/multi-agent/subagents)
- [Agent Config](https://docs.copilotkit.ai/langgraph-typescript/agent-config)
- [Programmatic Control](https://docs.copilotkit.ai/langgraph-typescript/programmatic-control)

**Shared State**
- [Shared State](https://docs.copilotkit.ai/langgraph-typescript/shared-state)
- [Render state in your app](https://docs.copilotkit.ai/langgraph-typescript/shared-state/rendering-in-app)
- [State Streaming](https://docs.copilotkit.ai/langgraph-typescript/shared-state/streaming)
- [Agent Read-Only Context](https://docs.copilotkit.ai/langgraph-typescript/shared-state/agent-readonly)
- [Reading agent state](https://docs.copilotkit.ai/langgraph-typescript/shared-state/in-app-agent-read)
- [Writing agent state](https://docs.copilotkit.ai/langgraph-typescript/shared-state/in-app-agent-write)
- [Input/Output Schemas](https://docs.copilotkit.ai/langgraph-typescript/shared-state/state-inputs-outputs)
- [Predictive state updates](https://docs.copilotkit.ai/langgraph-typescript/shared-state/predictive-state-updates)
- [Readables — custom graph](https://docs.copilotkit.ai/langgraph-typescript/agent-app-context?impl=graph) · [prebuilt agent](https://docs.copilotkit.ai/langgraph-typescript/agent-app-context?impl=prebuilt)
- [Configurable](https://docs.copilotkit.ai/langgraph-typescript/configurable)
- [Subgraphs](https://docs.copilotkit.ai/langgraph-typescript/subgraphs)
