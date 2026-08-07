import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A real backend tool, drawn as a branded card instead of raw JSON. The
          renderer sees three things — the parsed arguments, a live{" "}
          <code>status</code>, and the <code>result</code> once it lands — which
          is enough to show what is being fetched <em>while</em> it is being
          fetched, not just afterwards.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Named renderers and a wildcard compose: the interesting tools get
          their own components, and one catch-all handles everything else. The
          demo wires both.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What's the weather in Tokyo?", "How about São Paulo?"]}
            expect="A sky-blue card appears with the city name and 'Calling weather API…', then fills in with 68°, Sunny, humidity and wind. The reply does not restate the numbers."
            fail="Raw JSON or nothing at all in place of the card — the renderer's name does not match the tool's name."
          />
        </div>
      </Panel>

      <Panel title="The renderers">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The components">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/weather-card.tsx" />
      </Panel>

      <Panel
        title="The backend tool"
        description="The frontend renderer only ever sees what the agent sends down."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/tool-rendering.ts", region: "get-weather" },

          ]}
        />
      </Panel>

      <Callout tone="info" title="Three ways in, increasing effort">
        <p>
          <code>useDefaultRenderTool()</code> with no arguments registers
          CopilotKit&apos;s built-in card for every tool — zero config, and
          worth knowing because <strong>without any wildcard the tool calls
          are invisible</strong> and the user only sees the final text.
          Passing it a <code>render</code> gives every tool your own chrome.{" "}
          <code>useRenderTool({"{ name }"})</code> is the per-tool version.
        </p>
      </Callout>
    </>
  );
}
