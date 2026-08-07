import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/subgraphs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A compiled graph is a runnable, so it drops into{" "}
          <code>addNode</code> like any function. That is the entire mechanism —
          a subgraph is just encapsulation, and it is what lets a large system be
          assembled from pieces that different teams can own.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The CopilotKit-specific claim, and the one this route exists to check,
          is that nesting costs you nothing on the wire: a subgraph&apos;s state
          writes and messages stream to the browser in real time, exactly as a
          flat graph&apos;s do, with no extra configuration on either side.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "How should I migrate a REST API to GraphQL?",
              "Plan a week of onboarding for a new engineer",
            ]}
            expect="The outline pane fills with three bullets and the `last write` line reads planner_subgraph.plan_node — all before the chat reply starts streaming. Then the reply arrives following that outline, and `last write` flips to parent.answer_node."
            fail="The outline and the reply appear together at the end. Streaming is being buffered until the whole parent run finishes, which is the behaviour this page says you should not see."
          />
        </div>
      </Panel>

      <Panel
        title="The frontend side, in full"
        description="There is no subgraph-aware API. This is the same useAgent subscription every shared-state route uses."
      >
        <SourceCode file="frontend/src/app/subgraphs/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The graph side"
        description="An inner planner, and a parent that mounts it as one node."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/subgraphs.ts", region: "state" },
            { file: "backend/src/agents/subgraphs.ts", region: "subgraph" },
            { file: "backend/src/agents/subgraphs.ts", region: "parent" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="The graphs here are this repo's, not the doc's">
        <p>
          The page publishes exactly one snippet — the four-line{" "}
          <code>useAgent</code> call above — and points at the CopilotKit Feature
          Viewer for everything else. Its position is that no agent-side code is
          needed to <em>enable</em> subgraph streaming, which is true and is why
          there is nothing to copy. But it also means a parent/child pair had to
          be written to have something to observe. The one above is deliberately
          the plainest thing that exercises the claim. See README §9.
        </p>
      </Callout>

      <Callout tone="info" title="interrupt() works from inside a subgraph too">
        <p>
          The page closes on this, and it matters more than it sounds: a nested
          graph can suspend the whole run. The primitive itself is covered on the{" "}
          <Link
            href="/human-in-the-loop/interrupt-flow"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Interrupts
          </Link>{" "}
          route, where the pause is in a top-level node and easier to follow.
        </p>
      </Callout>

      <Panel title="Related">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/multi-agent/subagents"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Sub-Agents
          </Link>{" "}
          solves an overlapping problem the other way round: there, each
          specialist is a tool the supervisor chooses to call, so control flow is
          the model&apos;s. Here it is an edge in the graph, so control flow is
          yours. Reach for subgraphs when the sequence is known and for
          sub-agents when it is not.
        </p>
      </Panel>
    </>
  );
}
