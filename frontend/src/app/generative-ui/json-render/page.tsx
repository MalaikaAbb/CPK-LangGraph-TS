import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/json-render" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Bring-your-own declarative UI: the agent answers with a JSON spec
          (<code>root</code> plus a flat <code>elements</code> map) and the
          frontend draws it with <code>@json-render/react</code> against a Zod
          catalog of three components (metric card, bar chart, pie chart). A
          custom <code>assistantMessage</code> slot swaps the plain text for
          the rendered spec.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show me Q1 revenue by region as a bar chart, with a total metric card"]}
            expect="The assistant turn renders as a metric card and a bar chart instead of raw JSON."
            fail="Raw JSON in the bubble (the renderer could not parse or validate the spec), or a runtime error from @json-render/react (version drift from the page's code)."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Everything here is the page's Code tab">
        <p>
          All files below are the demo Code tab of the page, verbatim, moved
          from <code>src/app/demos/declarative-json-render/</code> to{" "}
          <code>demo-chat/</code>. The demo mounts its own{" "}
          <code>&lt;CopilotKit&gt;</code> against a dedicated single-route
          runtime (<code>/api/copilotkit-declarative-json-render</code>). Not
          copied: the Code tab&apos;s suggestion chips, and its unpublished{" "}
          <code>makeChatOpenAI</code> helper, which is swapped for{" "}
          <code>new ChatOpenAI(…)</code> with the same options (README §9 item
          2).
        </p>
      </Callout>

      <Panel title="Renderer and catalog">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/json-render/demo-chat/chat.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/demo-chat/json-render-renderer.tsx" },
            { file: "frontend/src/app/generative-ui/json-render/demo-chat/catalog.ts" },
            { file: "frontend/src/app/generative-ui/json-render/demo-chat/registry.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Runtime route and agent">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-declarative-json-render/route.ts" },
            { file: "backend/src/agents/byoc-json-render.ts" },
          ]}
        />
      </Panel>

      <Panel title="Demo page">
        <SourceCode file="frontend/src/app/generative-ui/json-render/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
