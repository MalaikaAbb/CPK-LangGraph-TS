# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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
