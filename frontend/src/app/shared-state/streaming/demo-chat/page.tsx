"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "shared-state-streaming";

type StreamingState = { document?: string };

/**
 * Identical subscription to the State Rendering route, because it is the same
 * agent — the docs give both pages one backend. The difference in emphasis is
 * on the notes page, not in the code.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state/streaming" subtitle={`agent: ${AGENT_ID}`}>
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_26rem]">
        <DocumentPane />
        <div className="min-h-0 border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-800">
          <CopilotChat agentId={AGENT_ID} className="h-full" />
        </div>
      </div>
    </DemoFrame>
  );
}

function DocumentPane() {
  // Subscribe to BOTH state changes and run-status changes. The former drives
  // the per-token document rerender; the latter toggles the LIVE badge when
  // the agent starts / stops.
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const state = (agent.state ?? {}) as StreamingState;
  const document = state.document ?? "";

  return (
    <section className="flex min-h-0 flex-col overflow-hidden p-6">
      <header className="flex shrink-0 items-center gap-2">
        <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          state[&quot;document&quot;]
        </h2>
        {agent.isRunning && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        )}
        <span className="ml-auto font-mono text-xs text-slate-400">
          {document.length} chars
        </span>
      </header>

      <p className="mt-1 shrink-0 text-xs text-slate-500">
        Written by the <code>write_document</code> tool argument, forwarded here
        before the tool has returned.
      </p>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {document ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {document}
          </p>
        ) : (
          <p className="py-16 text-center text-sm text-slate-400">
            Ask for something long enough to watch it assemble.
          </p>
        )}
      </div>
    </section>
  );
}
