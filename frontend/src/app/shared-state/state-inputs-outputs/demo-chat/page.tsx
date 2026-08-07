"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "state-inputs-outputs";

/**
 * The observable claim of the Input/Output Schemas page, made visible.
 *
 * `question` is in the input annotation only, so the UI can write it but never
 * reads it back — the panel below keeps its own copy and labels it as such.
 * `answer` is in the output annotation, so it arrives.
 *
 * `resources` proves nothing here, and the slot says so: the doc declares the
 * field but never writes it, so reproducing the page faithfully leaves it
 * permanently `undefined`. See README §9.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/state-inputs-outputs"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Layout />
    </DemoFrame>
  );
}

type IOState = {
  question?: string;
  answer?: string;
  resources?: string[];
};

function Layout() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });
  const { copilotkit } = useCopilotKit();

  // The UI is the source of truth for `question`, because the graph never
  // returns it. Losing track of it here would lose it entirely.
  const [question, setQuestion] = useState("Why use input/output schemas?");

  const state = (agent.state ?? {}) as IOState;

  const submit = async () => {
    if (agent.isRunning || !question.trim()) return;
    agent.setState({ ...(agent.state ?? {}), question } as IOState);
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    });
    try {
      await copilotkit.runAgent({ agent });
    } catch (err) {
      console.error("[state-inputs-outputs] runAgent failed", err);
    }
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_24rem]">
      <section className="min-h-0 space-y-4 overflow-y-auto p-6">
        <Slot
          name="question"
          tone="in"
          caption="Input annotation only — writable by the UI, never returned."
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={submit}
              disabled={agent.isRunning}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Ask
            </button>
          </div>
          <p className="mt-2 font-mono text-xs text-slate-400">
            agent.state.question ={" "}
            {state.question === undefined ? "undefined" : JSON.stringify(state.question)}
          </p>
        </Slot>

        <Slot
          name="answer"
          tone="out"
          caption="Output annotation — written by the graph, arrives here."
        >
          {state.answer ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {state.answer}
            </p>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              Nothing yet.
            </p>
          )}
        </Slot>

        <Slot
          name="resources"
          tone="internal"
          caption="In neither annotation — and never written, because the doc never shows it being written."
        >
          <p className="font-mono text-xs text-slate-500">
            agent.state.resources ={" "}
            {state.resources === undefined
              ? "undefined"
              : JSON.stringify(state.resources)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            This slot is inconclusive by design. The page declares{" "}
            <code>resources</code> and says the UI must not see it, but no
            snippet ever assigns it — there is a{" "}
            <code>{"// ...add the rest of the agent implementation"}</code>{" "}
            elision exactly where that would go. The graph here is the page as
            published, so the field is simply never set. You cannot tell from
            this route whether the output annotation is hiding it or nothing
            wrote it, and filling that in would mean inventing the missing
            code.
          </p>
        </Slot>
      </section>

      <div className="min-h-0 border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}

const TONES = {
  in: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200",
  out: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  internal:
    "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
} as const;

function Slot({
  name,
  tone,
  caption,
  children,
}: {
  name: string;
  tone: keyof typeof TONES;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </h2>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${TONES[tone]}`}
        >
          {tone}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
