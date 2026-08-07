import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/predictive-state-updates" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          An agent&apos;s state changes discontinuously — only when something
          explicitly writes it. But a single operation can take many seconds and
          contain sub-steps the user would want to see. Predictive state updates
          are the fix: the agent reports progress as it goes, through a tool
          whose only job is to write the running list into state.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Plan a three-course dinner party for six, including shopping and timings",
              "Walk through how you'd migrate a REST API to GraphQL",
            ]}
            expect="Steps appear in the left pane one at a time while the agent works, with a 'Working' badge, rather than all at once when it finishes."
            fail="Steps appear only after the reply completes — the agent batched its step_progress calls to the end instead of reporting as it went."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/predictive-state-updates/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The agent">
        <SourceCode file="backend/src/agents/predictive-state-updates.ts" region="agent" />
      </Panel>

      <Panel
        title="The manual-emission variant"
        description="The custom-graph tab's other sub-variant: no mapping at all, the node emits when it decides to."
      >
        <SourceCode
          file="backend/src/agents/predictive-state-updates-manual.ts"
          region="manual"
        />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This is the escape hatch for progress that is not attached to a tool
          call — a loop over files, a polling wait, a multi-phase computation.
          The page simulates that with a fixed list and a one-second pause. Note
          the node also <em>returns</em> <code>observed_steps</code>: a
          node&apos;s returned state is authoritative when it finishes, so
          without that the emitted values would vanish at the checkpoint.
        </p>
      </Panel>

   

      <Panel
        title="The prebuilt-agent variant"
        description="The page's other agent-type tab. Same mapping, declared as middleware instead of applied per invocation."
      >
        <SourceCode
          file="backend/src/agents/predictive-state-updates-prebuilt.ts"
          region="prebuilt"
        />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Both graphs are registered, and the demo has a tab for each, so the
          two constructions can be compared against identical behaviour. The
          custom graph spells out state, nodes, routing and the streaming call;
          the prebuilt one declares <code>stateStreamingMiddleware</code> once
          and lets <code>createAgent</code> own the loop. Note that the two are
          separate graphs with separate threads — switching tabs does not carry
          a conversation across.
        </p>
      </Panel>

     
  

      <Callout tone="info" title="Related, and easy to confuse">
        <p>
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State streaming
          </a>{" "}
          forwards a tool argument into state <em>while the argument is being
          generated</em> — sub-token granularity, configured with{" "}
          <code>PredictStateMapping</code>. This route is coarser and needs no
          configuration: the model simply calls a tool more than once. Reach for
          streaming when one long value is being written, and for this when
          there are discrete steps to report.
        </p>
      </Callout>
    </>
  );
}
