# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-11-09

### 12:31 UTC — 32 pages, highest severity high

**High — Readables**

`/langgraph-typescript/agent-app-context` · route `/agent-app-context` · under “Implementation”

75 code lines, 1 heading, 34 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Callout type="warn" title="Context values arrive as JSON strings">
+ The AG-UI protocol defines a context value as a string. Therefore
+ `useAgentContext` calls `JSON.stringify` on any `value` that is not already a
+ string, and your agent receives the JSON text instead of the object or the
+ array.
+ 
+ Parse the value before you read a field from it. Use `json.loads(item["value"])`
+ in Python, or `JSON.parse(item.value)` in TypeScript. If you skip the parse
````

**High — Agent Config**

`/langgraph-typescript/agent-config` · route `/agent-config` · under “Wire CopilotKit state into your graph” · in a `typescript` block

73 code lines, 5 prose lines changed. The number of fenced code blocks changed.

````diff
- import { makeChatOpenAI } from "./openai-headers";
- 
- async function chatNode(state: AgentState, config: RunnableConfig) {
- const model = makeChatOpenAI(config, {
- model: "gpt-4o-mini",
- temperature: 0.4,
- });
+ async function runChatNode(
````

**High — Configurable**

`/langgraph-typescript/configurable` · route `/configurable` · under “Configurable”

7 code lines, 6 headings, 35 prose lines changed. The number of fenced code blocks changed.

````diff
- > Using agent execution parameters when communicating with an agent.
- ## What is this?
- LangGraph agents are able to take execution parameters, such as auth tokens and similar properties.
- You can add these using this feature.
+ > Choose the supported channel for LangGraph runtime values and execution settings.
- If you wish to read further, you can refer to [the configuration guide by LangGraph](https://docs.langchain.com/oss/python/langgraph/use-graph-api#add-runtime-configuration)
+ ## Choose the right channel
- ## When should I use this?
````

**High — Slots**

`/langgraph-typescript/custom-look-and-feel/slots` · route `/custom-look-and-feel/slots` · under “Tool calls”

23 code lines, 1 heading, 19 prose lines changed. The number of fenced code blocks changed.

````diff
+ ### Tool calls
+ 
+ The `assistantMessage` slot holds `toolCallsView`, which renders the tool calls
+ of one assistant message. Wrap the default `CopilotChatToolCallsView` to change
+ the container while keeping your registered tool renderers:
+ 
+ ```tsx title="page.tsx"
+ import {
````

**High — Frontend Tools**

`/langgraph-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

65 code lines, 2 headings, 36 prose lines changed. The number of fenced code blocks changed.

````diff
- <Callout type="info" title="See this in Inspector">
- Open Inspector on localhost. Go to **Inspect**, then **Event Snippets**.
- You can compile a tool call, reasoning, text, or activity, run it on the live
- agent, and save it. Saved snippets are grouped by recipe. On localhost chat,
- **Save as snippet** uses the recipe for the thing you click and fills the form.
- On a tool call, generative UI, or A2UI, the bookmark sits to the right of the
- block (or to the left if there is no room on the right).
- Run of a `generateSandboxedUi` tool call paints the sandbox UI in chat.
````

**High — A2UI · Dynamic Schema**

`/langgraph-typescript/generative-ui/a2ui/dynamic-schema` · route `/generative-ui/a2ui/dynamic-schema` · under “The A2UI agent tool” · in a `python` block

2 code lines changed.

````diff
- "model": ChatOpenAI(model="gpt-4o"),
+ "model": ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
````

**High — A2UI · Fixed Schema**

`/langgraph-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Fixed Schema A2UI”

16 code lines, 41 prose lines changed.

````diff
- - **Schema-loading** (langgraph-python, langgraph-typescript,
- langgraph-fastapi, llamaindex, crewai-crews, pydantic-ai,
- ms-agent-python, google-adk), the schema is saved as a `.json`
- file next to the agent and loaded once at startup.
+ - **Schema-loading** (including Strands TypeScript), the schema is saved
+ as a `.json` file next to the agent and loaded once at startup.
- - **LLM-driven** (mastra, strands), the agent runs a secondary LLM
- call to produce the operations container per-request. The catalog
````

**High — State Rendering**

`/langgraph-typescript/generative-ui/state-rendering` · route `/generative-ui/state-rendering` · under “How it works in code”

19 code lines, 2 headings, 18 prose lines changed. The number of fenced code blocks changed.

````diff
+ <Steps>
+ <Step>
+ ### Install the CopilotKit LangGraph SDK
+ 
+ ```bash
+ npm install @copilotkit/sdk-js
+ ```
+ 
````

**High — Components as Tools**

`/langgraph-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Wire CopilotKit state + tools into your graph” · in a `typescript` block

60 code lines, 2 headings, 25 prose lines changed. The number of fenced code blocks changed.

````diff
- import { RunnableConfig } from "@langchain/core/runnables";
+ import type { RunnableConfig } from "@langchain/core/runnables";
- import { makeChatOpenAI } from "./openai-headers";
- 
- async function chatNode(state: AgentState, config: RunnableConfig) {
- const model = makeChatOpenAI(config, {
- temperature: 0,
- model: "gpt-4o-mini",
````

**High — Tool Call Rendering**

`/langgraph-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “Default tool rendering (zero-config)”

20 code lines, 2 headings, 50 prose lines changed. The number of fenced code blocks changed.

````diff
- any UI.
+ any UI. Calls the agent makes in a row are grouped into one card; see
+ [Grouping tool calls](#grouping-tool-calls).
+ ## Grouping tool calls
+ 
+ Agents often call several tools in a row. By default, CopilotKit collapses
+ each run of calls drawn by the built-in card from `useDefaultRenderTool()` into
+ one card that reads "Used 3 tools". While a call runs, the card names it
````

**High — Human in the Loop**

`/langgraph-typescript/human-in-the-loop` · route `/human-in-the-loop` · under “Wire CopilotKit state + tools into your graph” · in a `typescript` block

42 code lines changed.

````diff
- import { RunnableConfig } from "@langchain/core/runnables";
+ import type { RunnableConfig } from "@langchain/core/runnables";
- import { makeChatOpenAI } from "./openai-headers";
- 
- async function chatNode(state: AgentState, config: RunnableConfig) {
- const model = makeChatOpenAI(config, {
- temperature: 0,
- model: "gpt-4o-mini",
````

**High — Interrupts**

`/langgraph-typescript/human-in-the-loop/interrupt-flow` · route `/human-in-the-loop/interrupt-flow` · under “Call `interrupt` in your LangGraph agent” · in a `python` block

8 code lines changed.

````diff
- response = ChatOpenAI(model="gpt-5.4").invoke(
+ response = ChatOpenAI(model="gpt-6-luna", reasoning_effort="none").invoke(
- const response = await new ChatOpenAI({ model: "gpt-5.4" }).invoke(
+ const response = await new ChatOpenAI({ modelKwargs: { reasoning_effort: "none" }, model: "gpt-6-luna" }).invoke(
- response = ChatOpenAI(model="gpt-5.4").invoke(
+ response = ChatOpenAI(model="gpt-6-luna", reasoning_effort="none").invoke(
- const response = await new ChatOpenAI({ model: "gpt-5.4" }).invoke(
+ const response = await new ChatOpenAI({ modelKwargs: { reasoning_effort: "none" }, model: "gpt-6-luna" }).invoke(
````

**High — Sub-Agents**

`/langgraph-typescript/multi-agent/subagents` · route `/multi-agent/subagents` · under “Wire CopilotKit state + tools into your graph” · in a `typescript` block

153 code lines changed.

````diff
- import { RunnableConfig } from "@langchain/core/runnables";
+ import type { RunnableConfig } from "@langchain/core/runnables";
+ import type { AIMessage } from "@langchain/core/messages";
- AIMessage,
- import { makeChatOpenAI } from "./openai-headers";
+ type ModelFactory = (config?: RunnableConfig) => ChatOpenAI;
+ 
+ const defaultModelFactory: ModelFactory = () =>
````

**High — Multimodal Attachments**

`/langgraph-typescript/multimodal-attachments` · route `/multimodal-attachments` · under “Configuration”

9 code lines, 1 heading, 11 prose lines changed. The number of fenced code blocks changed.

````diff
+ | `maxConcurrentUploads` | `number` | `1` | How many files upload at the same time. See [Upload concurrency](#upload-concurrency). |
+ 
+ ## Upload concurrency
+ 
+ When a user attaches several files at once, they upload one at a time by default. Every picked file shows in the attachment queue immediately, whether or not its upload has started.
+ 
+ Set `maxConcurrentUploads` to upload several together — worth raising when your upload endpoint handles parallel requests:
+ 
````

**High — CopilotChat**

`/langgraph-typescript/prebuilt-components/chat` · route `/prebuilt-components/chat` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotChat } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotChat`. That one
+ is the [deprecated v1 chat](/langgraph-typescript/migrate/v2). This page documents the v2 chat,
````

**High — Open, close, and feedback**

`/langgraph-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Control the open state from your own UI”

20 code lines, 1 heading, 48 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Control the open state from your own UI
+ 
+ Pass `open` and `onOpenChange` to `<CopilotSidebar>` or `<CopilotPopup>` to own
+ the open state yourself. This is the controlled pattern: the surface renders
+ whatever `open` says, and every request to open or close (the toggle button,
+ click-outside on the popup) arrives on `onOpenChange` instead of moving the
+ surface directly.
+ 
````

**High — CopilotPopup**

`/langgraph-typescript/prebuilt-components/popup` · route `/prebuilt-components/popup` · under “Basic setup” · in a `tsx` block

4 code lines, 7 prose lines changed. The number of fenced code blocks changed.

````diff
+ ```tsx
+ import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
+ ```
+ 
+ <Callout type="warn">
+ `@copilotkit/react-ui` also exports a component named `CopilotPopup`. That one
+ is the [deprecated v1 popup](/langgraph-typescript/migrate/v2). This page documents the v2 popup,
````

**High — CopilotSidebar**

`/langgraph-typescript/prebuilt-components/sidebar` · route `/prebuilt-components/sidebar` · under “When should I use this?”

4 code lines, 11 prose lines changed. The number of fenced code blocks changed.

````diff
- use [`<CopilotChat>`](/langgraph-typescript/prebuilt-components/chat) directly.
+ use [`<CopilotChat>`](/langgraph-typescript/prebuilt-components/chat) directly. For saved
+ conversations and switching between them, the sidebar hosts the
+ [Threads Drawer](/langgraph-typescript/prebuilt-components/copilot-threads-drawer).
+ 
+ ```tsx
+ import { CopilotKit, CopilotSidebar } from "@copilotkit/react-core/v2";
+ import "@copilotkit/react-core/v2/styles.css";
````

**High — Programmatic Control**

`/langgraph-typescript/programmatic-control` · route `/programmatic-control` · under “What is this?”

44 code lines, 4 prose lines changed.

````diff
- - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` to drive interrupt resolution from arbitrary UI.
+ - `agent.subscribe(subscriber)` — low-level AG-UI event subscription (`onCustomEvent`, `onRunStartedEvent`, `onRunFinalized`, `onRunFailed`, …). Pairs with `copilotkit.runAgent({ agent, resume })` for standard AG-UI interrupts, or `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })` for legacy `on_interrupt` custom events, to drive interrupt resolution from arbitrary UI.
- import { RunnableConfig } from "@langchain/core/runnables";
+ import type { RunnableConfig } from "@langchain/core/runnables";
- import { makeChatOpenAI } from "./openai-headers";
- 
- async function chatNode(state: AgentState, config: RunnableConfig) {
- const model = makeChatOpenAI(config, {
````

**High — Quickstart**

`/langgraph-typescript/quickstart` · route `/quickstart` · under “Quickstart”

126 code lines, 3 headings, 174 prose lines changed. The number of fenced code blocks changed.

````diff
- <OpsPlatformCTA
- variant="card"
- title="Ship LangGraph to production"
- body="Add persistent threads and the inspector with CopilotKit Intelligence."
- ctaLabel="Create a free account"
- surface="docs_langgraph_quickstart"
- />
+ ## Start with your coding agent
````

**High — Agent Read-Only Context**

`/langgraph-typescript/shared-state/agent-readonly` · route `/shared-state/agent-readonly` · under “Read CopilotKit context in your graph” · in a `typescript` block

19 code lines changed.

````diff
- async function chatNode(state: AgentState, config: RunnableConfig) {
- const model = makeChatOpenAI(config, { model: "gpt-5.4" });
- 
+ async function runChatNode(
+ state: AgentState,
+ config: RunnableConfig,
+ model: ChatOpenAI,
+ ) {
````

**High — Writing agent state**

`/langgraph-typescript/shared-state/in-app-agent-write` · route `/shared-state/in-app-agent-write` · under “Re-run the agent with updated state”

5 code lines, 2 prose lines changed.

````diff
- If you want to re-run it manually, use `agent.runAgent` after updating state.
+ If you want to re-run it manually, call `copilotkit.runAgent({ agent })` after updating state. Running through `copilotkit` sends your frontend tools and context with the run and executes any frontend tool calls.
- import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
+ import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2"; // [!code highlight]
+ const { copilotkit } = useCopilotKit(); // [!code highlight]
- agent.runAgent();
+ copilotkit.runAgent({ agent });
````

**High — Predictive state updates**

`/langgraph-typescript/shared-state/predictive-state-updates` · route `/shared-state/predictive-state-updates` · under “Emit the intermediate state” · in a `python` block

60 code lines changed.

````diff
- from copilotkit.langgraph import copilotkit_customize_config
+ import uuid
+ 
- from langgraph.types import Command
- from langgraph.graph import END
- from langchain.tools import tool
- from langchain_openai import ChatOpenAI
- from langchain_core.messages import SystemMessage, AIMessage
````

**High — Input/Output Schemas**

`/langgraph-typescript/shared-state/state-inputs-outputs` · route `/shared-state/state-inputs-outputs` · under “Emitting a state key outside the output schema”

9 code lines, 1 heading, 17 prose lines changed. The number of fenced code blocks changed.

````diff
+ ## Emitting a state key outside the output schema
+ 
+ The filtering above is driven by the graph's output schema. If you compile the
+ graph with an output schema that is narrower than its state, for example
+ `StateGraph(State, output_schema=Output)`, state keys outside `Output` never
+ reach the frontend.
+ 
+ In Python, list the keys that the frontend needs under `schema_keys` in the
````

**Medium — Headless UI**

`/langgraph-typescript/custom-look-and-feel/headless-ui` · route `/custom-look-and-feel/headless-ui` · under “Fully Headless UI”

2 headings changed.

````diff
- # Fully Headless UI
+ # Headless UI
````

**Low — Introduction**

`/langgraph-typescript` · routes `/`, `/doc-sync` · under “Introduction”

57 prose lines changed.

````diff
- > Bring your LangGraph agents to your users with CopilotKit via AG-UI.
+ > Redirect notice for a landing page that is served from a data record.
- <FrameworkOverview
- frameworkName="LangGraph"
- frameworkIcon={<LanggraphIcon className="h-14 w-14" />}
- header="Bring your LangGraph agents to your users"
- subheader="Give your LangGraph agents real user-interactivity using CopilotKit and AG-UI. Build rich, interactive, agent-powered applications."
- bannerVideo="https://cdn.copilotkit.ai/docs/copilotkit/videos/coagents/overview.mp4"
````

**Low — Reasoning Messages**

`/langgraph-typescript/custom-look-and-feel/reasoning-messages` · route `/custom-look-and-feel/reasoning-messages` · under “Reasoning Messages”

7 prose lines changed.

````diff
- > Customize how reasoning (thinking) tokens from models like o1, o3, and o4-mini are displayed.
+ > Customize how reasoning (thinking) tokens from models like `gpt-6-luna` are displayed.
- Some models (like OpenAI's o1, o3, and o4-mini) emit **reasoning tokens**: internal
+ Some models (like `gpt-6-luna`) emit **reasoning tokens**: internal
- | `label` | `string` | `"Thinking…"` while streaming, `"Thought for X seconds"` after |
+ | `label` | `string` | `labels.reasoningMessageThinkingLabel` (`"Thinking…"`) while streaming, `"Thought for X seconds"` after |
+ | `elapsedSeconds` | `number` | Seconds spent reasoning, for building a localized label |
````

**Low — Reasoning**

`/langgraph-typescript/generative-ui/reasoning` · route `/generative-ui/reasoning` · under “What is this?”

2 prose lines changed.

````diff
- Some models (OpenAI's `o1`, `o3`, and `o4-mini`, Anthropic's thinking
+ Some models (`gpt-6-luna`, Anthropic's thinking
````

**Low — Voice**

`/langgraph-typescript/voice` · route `/voice` · under “Next.js API route”

42 prose lines changed.

````diff
+ <Callout type="warn" title="Without a service, `/transcribe` answers 503">
+ A runtime with no `transcriptionService` still serves the route, and answers every request
+ `503` with `{ "error": "service_not_configured" }`. The mic button never appears, so the
+ symptom is a chat with no voice input rather than a visible server error — check `/info` for
+ `audioFileTranscriptionEnabled` when voice silently doesn't show up.
+ </Callout>
+ <Callout type="warn" title="Calling `/transcribe` yourself">
+ The chat handles this for you; these are the rules if you post to the route directly. As
````

**Info — Headless Threads**

`/langgraph-typescript/headless-threads` · route `/headless-threads`

Now tracked for the first time.

**Info — Threads Drawer**

`/langgraph-typescript/prebuilt-components/copilot-threads-drawer` · route `/prebuilt-components/copilot-threads-drawer`

Now tracked for the first time.

**Info — Thread & History Lifecycle**

`/langgraph-typescript/threads-lifecycle` · route `/threads-lifecycle`

Now tracked for the first time.

---

## 2026-08-26

### 10:18 UTC — 14 pages, highest severity high

**High — Readables**

`/langgraph-typescript/agent-app-context` · route `/agent-app-context` · under “Consume the data in your LangGraph agent” · in a `python` block

4 code lines changed.

````diff
- graph = create_agent( # Works the same for "create_react_agent" or similar options
+ graph = create_agent( # create_agent supersedes the deprecated create_react_agent, which accepts neither middleware= nor system_prompt=
- export const agenticChatGraph = createAgent({ // Works the same for "create_react_agent" or similar options
+ export const agenticChatGraph = createAgent({ // createAgent supersedes the deprecated createReactAgent, which accepts neither middleware nor systemPrompt
````

**High — Agent Config**

`/langgraph-typescript/agent-config` · route `/agent-config` · under “When to use this”

16 code lines, 1 heading, 20 prose lines changed. The number of fenced code blocks changed.

````diff
- <WhenFrameworkHas flag="agent_config_pattern" equals="shared-state">
+ 
- </WhenFrameworkHas>
- <WhenFrameworkHas flag="agent_config_pattern" equals="runtime-properties">
- ## How it works
- The runtime owns the agent in-process, so config travels through frontend
- runtime properties rather than agent state. There's no separate backend service
- to push state into: the typed object becomes the input to the agent factory
````

**High — A2UI · Fixed Schema**

`/langgraph-typescript/generative-ui/a2ui/fixed-schema` · route `/generative-ui/a2ui/fixed-schema` · under “Compositional schemas”

50 code lines, 2 headings, 74 prose lines changed. The number of fenced code blocks changed.

````diff
- renderer props are typed as their resolved values (plain `z.string()`,
- not a path-or-literal union).
+ your renderer receives the resolved value and never sees the path — but
+ the *definition* still has to declare that prop as a literal-or-binding
+ union, because that union is the only signal the binder has that the
+ prop is bindable. See [Declare the component
+ definitions](#declare-the-component-definitions).
+ ### Install the renderer package
````

**High — Tool Call Rendering**

`/langgraph-typescript/generative-ui/tool-rendering` · route `/generative-ui/tool-rendering` · under “What is this?”

105 code lines, 16 prose lines changed. The number of fenced code blocks changed.

````diff
- **Free course:** See this pattern built end-to-end in [Build Interactive Agents with Generative UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/) — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
+ **Free course:** See this pattern built end-to-end in [Build Interactive
+ Agents with Generative
+ UI](https://www.deeplearning.ai/short-courses/build-interactive-agents-with-generative-ui/)
+ — a free DeepLearning.AI short course taught by CopilotKit's CEO covering the
+ full Generative UI spectrum (Controlled, Declarative, and Open-Ended).
- ```typescript
- // src/app/demos/tool-rendering/page.tsx
````

**High — Programmatic Control**

`/langgraph-typescript/programmatic-control` · route `/programmatic-control` · under “What is this?”

43 code lines, 2 headings, 50 prose lines changed. The number of fenced code blocks changed.

````diff
- Every example on this page is pulled from two live cells:
- `headless-complete` (full chat surface, shown here for the message-send
- path) and `interrupt-headless` (button-driven interrupt resolver, shown
- here for the subscribe + resume path).
+ The send-and-stop example below is intentionally self-contained. The
+ later subscription and interrupt examples are pulled from the live
+ `interrupt-headless` cell.
- The message-send path in `headless-complete` is the canonical pattern:
````

**High — Quickstart**

`/langgraph-typescript/quickstart` · route `/quickstart` · under “Quickstart”

81 code lines, 3 headings, 135 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
- body="Add persistent threads and the inspector with the Enterprise Intelligence Platform."
+ body="Add persistent threads and the inspector with CopilotKit Intelligence."
- <SignupLink surface="docs_langgraph_quickstart_step1">Sign up for a free developer account</SignupLink> on our Enterprise Intelligence Platform to get a license key. You'll use it later to enable persistent threads and the inspector.
+ <SignupLink surface="docs_langgraph_quickstart_step1">Sign up for a free developer account</SignupLink> for CopilotKit Intelligence to get a license key. You'll use it later to enable persistent threads and the inspector.
- - **Enterprise Intelligence Platform** — persistent threads and the inspector. Choose **Yes** to scaffold a project pre-wired for the platform (the CLI walks you through sign-up, or you can [create an account](https://dashboard.operations.copilotkit.ai/?utm_source=docs&utm_medium=cta&utm_campaign=intelligence&utm_content=docs_cli_prompt) first), or **No** for a standard LangGraph setup.
+ - **CopilotKit Intelligence** — persistent threads and the inspector. Choose **Yes** to scaffold a project pre-wired for the platform (the CLI walks you through sign-up, or you can [create an account](https://dashboard.operations.copilotkit.ai/?utm_source=docs&utm_medium=cta&utm_campaign=intelligence&utm_content=docs_cli_prompt) first), or **No** for a standard LangGraph setup.
- ### Install LangGraph and AG-UI
````

**High — Render state in your app**

`/langgraph-typescript/shared-state/rendering-in-app` · route `/shared-state/rendering-in-app` · under “The pattern” · in a `tsx` block

29 code lines, 6 prose lines changed.

````diff
+ import { useEffect } from "react";
+ const INITIAL_CANVAS_STATE: CanvasState = {
+ title: "Project launch",
+ items: [
+ { id: "research", label: "Research user needs", done: true },
+ { id: "prototype", label: "Build a prototype", done: false },
+ ],
+ };
````

**Low — Introduction**

`/langgraph-typescript` · routes `/`, `/doc-sync` · under “Introduction”

2 prose lines changed.

````diff
- body="Add persistent threads and the inspector with the Enterprise Intelligence Platform."
+ body="Add persistent threads and the inspector with CopilotKit Intelligence."
````

**Low — Frontend Tools**

`/langgraph-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

21 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/langgraph-typescript/inspector).
````

**Low — Human in the Loop**

`/langgraph-typescript/human-in-the-loop` · route `/human-in-the-loop` · under “HITL Overview”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Frontend Tools**.
+ Your tool and its schema are listed.
+ 
+ More detail: [Inspector](/langgraph-typescript/inspector).
````

**Low — Open, close, and feedback**

`/langgraph-typescript/prebuilt-components/chat-controls` · route `/prebuilt-components/chat-controls` · under “Capture message feedback (thumbs up / down)”

11 prose lines changed.

````diff
- slot**. The buttons only render when a handler is provided:
+ When the slot is rendered through `CopilotChatMessageView`, a live assistant
+ message created by a direct AG-UI `TEXT_MESSAGE_START` can also include that
+ event's opaque `rawEvent` value. The join happens when the thumbs callback runs;
+ canonical messages and future run input stay unchanged. Chunk, snapshot,
+ persisted, legacy, and direct `CopilotChatAssistantMessage` paths don't provide
+ this callback metadata.
+ 
````

**Low — Shared State**

`/langgraph-typescript/shared-state` · route `/shared-state` · under “What is shared state?”

10 prose lines changed.

````diff
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Open a thread, then click **State**.
+ Agent state updates here as the run proceeds.
+ 
+ More detail: [Inspector](/langgraph-typescript/inspector).
+ </Callout>
+ 
+ 
````

**Low — Agent Read-Only Context**

`/langgraph-typescript/shared-state/agent-readonly` · route `/shared-state/agent-readonly` · under “Agent Read-Only Context”

9 prose lines changed.

````diff
+ 
+ 
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Go to **Agents**, then **Context**.
+ The values you publish with `useAgentContext` appear here.
+ 
+ More detail: [Inspector](/langgraph-typescript/inspector).
````

**Low — Voice**

`/langgraph-typescript/voice` · route `/voice` · under “Next.js API route”

4 prose lines changed.

````diff
- <WhenFrameworkHas flag="voice_backend_pattern" equals="adk-fastapi-agent-path">
- For the Google ADK showcase, agent runs take one more hop: this Next.js route registers the `voice-demo` agent with an `HttpAgent` pointed at `${AGENT_URL}/voice`. The Python `agent_server.py` mounts registered ADK agents with `add_adk_fastapi_endpoint(app, ..., path=f"/{agent_name}")`, so the browser talks to `/api/copilotkit-voice` while the Next.js runtime forwards voice-demo agent runs to the backend `/voice` endpoint.
- </WhenFrameworkHas>
+ 
````

---

---

## 2026-08-17

### 13:34 UTC — 2 pages, highest severity high

**High — Components as Tools** · _local snapshot edit, not an upstream change_

`/langgraph-typescript/generative-ui/tool-based` · route `/generative-ui/tool-based` · under “Install the CopilotKit LangGraph SDK” · in a `bash` block

3 code lines, 1 prose line changed. The number of fenced code blocks changed.

````diff
+ ```bash
+ npm install @copilotkit/sdk-js
+ ```
+ 
````

**Low — Headless UI** · _local snapshot edit, not an upstream change_

`/langgraph-typescript/custom-look-and-feel/headless-ui` · route `/custom-look-and-feel/headless-ui` · under “The core hooks”

1 prose line changed.

````diff
+ - `useRenderToolCall()` — returns a function that paints any registered tool call inline.
````
