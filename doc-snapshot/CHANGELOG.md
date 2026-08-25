# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-21

### 15:47 UTC — 12 pages, highest severity high

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

`/langgraph-typescript/quickstart` · route `/quickstart` · under “Install LangGraph and AG-UI”

4 code lines, 3 headings, 105 prose lines changed.

````diff
- ### Install LangGraph and AG-UI
+ ### Install LangGraph
- Add LangGraph and the required AG-UI packages to your project:
+ Add the packages the agent code below imports:
- uv add langgraph copilotkit langchain-openai langchain-core python-dotenv
+ uv add langgraph langchain-openai langchain-core python-dotenv
+ 
+ Both tabs below import all four. The **FastAPI** tab installs what
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

**Low — Frontend Tools**

`/langgraph-typescript/frontend-tools` · route `/frontend-tools` · under “Frontend Tools”

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

8 prose lines changed.

````diff
+ 
+ <Callout type="info" title="See this in Inspector">
+ Open Inspector on localhost. Open a thread, then click **State**.
+ Agent state updates here as the run proceeds.
+ 
+ More detail: [Inspector](/langgraph-typescript/inspector).
+ </Callout>
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
