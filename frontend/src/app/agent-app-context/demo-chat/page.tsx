"use client";

import {
  CopilotChat,
  useAgentContext,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "agent-app-context";

/**
 * The Readables page's own example: a colleague list the app owns and the
 * agent can read.
 *
 * `useAgentContext` republishes on every value change, so editing the roster
 * below is visible to the agent on its very next turn with nothing else wired
 * up. Nothing here writes back — that is the difference between a readable and
 * shared state.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/agent-app-context" subtitle={`agent: ${AGENT_ID}`}>
      <Layout />
    </DemoFrame>
  );
}

// The index signature is what satisfies `JsonSerializable`, the type
// `useAgentContext` requires of `value` — a readable has to survive a JSON
// round trip to reach the agent.
interface Colleague {
  [key: string]: string | number;
  id: number;
  name: string;
  role: string;
}

const INITIAL: Colleague[] = [
  { id: 1, name: "John Doe", role: "Developer" },
  { id: 2, name: "Jane Smith", role: "Designer" },
  { id: 3, name: "Bob Wilson", role: "Product Manager" },
];

const CANDIDATES: Colleague[] = [
  { id: 4, name: "Sarah Raman", role: "Staff Engineer" },
  { id: 5, name: "Tomás Oliveira", role: "Data Scientist" },
  { id: 6, name: "Amara Okonkwo", role: "Engineering Manager" },
];

function Layout() {
  const [colleagues, setColleagues] = useState<Colleague[]>(INITIAL);

  // Share context with the agent. One call per value; the description is what
  // the agent sees alongside it, so treat it like a parameter docstring.
  useAgentContext({
    description: "The current user's colleagues",
    value: colleagues,
  });

  const next = CANDIDATES.find((c) => !colleagues.some((x) => x.id === c.id));

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[24rem_1fr]">
      <aside className="min-h-0 overflow-y-auto border-b border-slate-200 p-6 lg:border-b-0 lg:border-r dark:border-slate-800">
        <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          useAgentContext
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          &ldquo;The current user&apos;s colleagues&rdquo; — republished
          whenever this list changes, read by the graph off{" "}
          <code>state.copilotkit.context</code>.
        </p>

        <ul className="mt-4 space-y-2">
          {colleagues.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-800 dark:text-slate-200">
                  {c.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {c.role}
                </span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setColleagues((prev) => prev.filter((x) => x.id !== c.id))
                }
                className="shrink-0 text-xs text-slate-400 underline underline-offset-2 hover:text-rose-600"
              >
                remove
              </button>
            </li>
          ))}
        </ul>

        {next && (
          <button
            type="button"
            onClick={() => setColleagues((prev) => [...prev, next])}
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
          >
            Add {next.name}
          </button>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Change the roster mid-conversation, then ask again — the agent answers
          from the new list without being told it changed.
        </p>
      </aside>

      <div className="min-h-0">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
