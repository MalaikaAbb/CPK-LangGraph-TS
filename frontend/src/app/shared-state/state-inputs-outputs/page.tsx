import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/state-inputs-outputs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Not all of a graph&apos;s state is the frontend&apos;s business.{" "}
          <code>new StateGraph(Full, &#123; input, output &#125;)</code> narrows
          the channel in each direction independently: the UI may write only
          what the input annotation names, and receives only what the output
          annotation names. Everything in the full annotation and neither of the
          others stays inside the graph.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two reasons to bother. One is correctness — a field the user must not
          set cannot be set. The other is cost: syncing a large internal working
          set on every checkpoint is real bandwidth for no benefit.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Press Ask with the default question",
              "Edit the question and press Ask again",
            ]}
            expect="The answer slot fills, and the question slot's read-back line stays `undefined` even though you just sent one. That pair is the demonstrable half — the UI wrote an input it never gets back, and received an output it never set. The resources slot also reads `undefined`, but proves nothing: the doc never writes it."
            fail="`agent.state.question` comes back populated — the input annotation is not being applied; check that the third argument to StateGraph is `{ input, output }` rather than being merged into the full annotation."
          />
        </div>
      </Panel>
{/* 
      <Panel
        title="The three annotations"
        description="Input, output, and the full state the nodes actually run against."
      >
        <SourceCodeGroup
          files={[
            {
              file: "backend/src/agents/state-inputs-outputs.ts",
              region: "schemas",
            },
            { file: "backend/src/agents/state-inputs-outputs.ts", region: "graph" },
          ]}
        />
      </Panel>

      <Panel title="The node">
        <SourceCode
          file="backend/src/agents/state-inputs-outputs.ts"
          region="node"
        />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Note what it returns: <code>messages</code> and <code>answer</code>,
          and nothing else. The <code>...add the rest of the agent
          implementation</code> comment is the doc&apos;s own, and it sits
          exactly where <code>resources</code> would be populated. Writing a
          field the output annotation excludes would not be an error — it would
          be kept in state and simply not forwarded — but the page never shows
          that step, so neither does this.
        </p>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/state-inputs-outputs/demo-chat/page.tsx" />
      </Panel> */}

      <Callout tone="warn" title="The doc never implements the internal slice">
        <p>
          PARTIAL CODE PROVIDED - MARK AS ERROR SHOWING THE DOCS
        </p>
        
      </Callout>

   

      <Panel title="Related">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Shared State
          </Link>{" "}
          is the unrestricted version of the same channel, where everything in
          the annotation flows both ways.
        </p>
      </Panel>
    </>
  );
}
