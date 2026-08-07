import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          UI built from agent state rather than from messages. As the agent
          works, it emits state updates and the component re-renders — so
          progress, drafts and intermediate results show up outside the chat
          transcript entirely.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This route and{" "}
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Streaming
          </a>{" "}
          share one agent, because the docs give them the same one. The
          difference is emphasis: that page is about the backend mapping that
          makes updates arrive mid-tool, this one is about rendering whatever
          arrives.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write a short blog post about why agents need a shared state channel",
              "Now rewrite it as a limerick",
            ]}
            expect="The left pane fills progressively with a LIVE badge and a rising character count. The document never appears as a chat message."
            fail="Text lands in one burst at the end, or shows up in the chat instead — the PredictStateMapping is not in effect."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend half"
        description="A state-streaming mapping forwards a tool argument into a state key as it is generated."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/shared-state-streaming.ts", region: "agent" },

          ]}
          note="copilotkitCustomizeConfig wraps the config for one model invocation, so the mapping travels with the call rather than with the graph."
        />
      </Panel>

      <Callout tone="info" title="Subscribe to both update kinds">
        <p>
          <code>OnStateChanged</code> alone renders the document but leaves the
          LIVE badge stale, because run start and stop are a different
          notification. Adding <code>OnRunStatusChanged</code> is what keeps{" "}
          <code>agent.isRunning</code> current. Both are named explicitly in the
          hook call — <code>useAgent</code> does not subscribe to everything by
          default.
        </p>
      </Callout>
    </>
  );
}
