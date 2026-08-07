"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "subgraphs";

/**
 * The Subgraphs page's whole frontend contribution is this: subscribe to agent
 * state and read it. There is no subgraph-specific hook, no nesting-aware API,
 * and nothing to configure — which is the claim being tested here.
 *
 * The `lastNode` field is this demo's own addition. It is the cheapest way to
 * make the nesting observable: if the outline arrives stamped
 * `planner_subgraph.plan_node`, the inner graph's writes really did stream out
 * on their own rather than being flushed when the parent finished.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/subgraphs" subtitle={`agent: ${AGENT_ID}`}>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_26rem]">
        <OutlinePane />
        <div className="min-h-0 border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-800">
          <CopilotChat agentId={AGENT_ID} className="h-full" />
        </div>
      </div>
    </DemoFrame>
  );
}

type SubgraphState = { outline?: string[]; lastNode?: string };

function OutlinePane() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  // Access agent state as usual — subgraph streaming is handled automatically.
  const state = (agent.state ?? {}) as SubgraphState;
  const outline = state.outline ?? [];

  return (
    <section className="flex min-h-0 flex-col overflow-hidden p-6">
      <header className="flex shrink-0 flex-wrap items-center gap-2">
        <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          state[&quot;outline&quot;]
        </h2>
        {agent.isRunning && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        )}
        <span className="ml-auto font-mono text-xs text-slate-400">
          last write: {state.lastNode ?? "—"}
        </span>
      </header>

      <p className="mt-1 shrink-0 text-xs text-slate-500">
        Written by <code>planner_subgraph</code>, a compiled graph used as a
        single node inside the parent. It arrives here before the parent&apos;s
        answer starts streaming.
      </p>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {outline.length > 0 ? (
          <ol className="space-y-2">
            {outline.map((step, i) => (
              <li
                key={`${i}-${step}`}
                className="flex gap-2 text-sm text-slate-800 dark:text-slate-200"
              >
                <span className="select-none font-mono text-xs text-slate-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-16 text-center text-sm text-slate-400">
            Ask something that needs a plan — the sub-graph outlines it first.
          </p>
        )}
      </div>
    </section>
  );
}
