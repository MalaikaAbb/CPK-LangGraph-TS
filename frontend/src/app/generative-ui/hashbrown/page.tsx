import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/hashbrown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Streaming structured output rendered progressively: the agent emits
          a catalog-constrained UI envelope, <code>@hashbrownai/react</code>{" "}
          parses it as tokens arrive, and the components (metric card, bar
          chart, pie chart) fill in while the response is still streaming.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Build a sales dashboard: total revenue, revenue by quarter as a bar chart, and share by product as a pie chart"]}
            expect="Cards and charts appear and fill in while the reply streams, rather than all at once at the end."
            fail="Raw JSON text, or an error such as 'Export prompt doesn't exist' (Hashbrown drifted past 0.7.0; the page's code needs exactly 0.7.0)."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Everything here is the page's Code tab">
        <p>
          All files are the page&apos;s demo Code tab, verbatim, moved from{" "}
          <code>src/app/demos/declarative-hashbrown/</code> to{" "}
          <code>demo-chat/</code>. <code>@hashbrownai/core</code> and{" "}
          <code>/react</code> are pinned to exactly <code>0.7.0</code>, because
          the code uses APIs that 0.8 removed. The agent&apos;s{" "}
          <code>makeChatOpenAI</code> is borrowed from the CopilotKit showcase
          (README §9 item 2).
        </p>
      </Callout>

      <Panel title="Renderer">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/hashbrown/demo-chat/chat.tsx" },
            { file: "frontend/src/app/generative-ui/hashbrown/demo-chat/hashbrown-renderer.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Runtime route and agent">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-declarative-hashbrown/route.ts" },
            { file: "backend/src/agents/byoc-hashbrown.ts" },
          ]}
        />
      </Panel>

      <Panel title="Demo page">
        <SourceCode file="frontend/src/app/generative-ui/hashbrown/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
