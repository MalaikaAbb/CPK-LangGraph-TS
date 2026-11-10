"use client";

import { CopilotSidebar, useFrontendTools } from "@copilotkit/react-core/v2";
import { useCallback, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "frontend_tools";

// Harness-authored: the page's snippet uses `reports` and `navigate` without
// defining them. `navigate` here records the path instead of routing, so the
// effect is visible without leaving the demo.
type Report = { id: string; title: string };
const ALL_REPORTS: Report[] = [
  { id: "q3-revenue", title: "Q3 Revenue" },
  { id: "churn", title: "Customer Churn" },
  { id: "hiring", title: "Hiring Pipeline" },
];

export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle={`useFrontendTools · agent: ${AGENT_ID}`}>
      <ToolList />
    </DemoFrame>
  );
}

function ToolList() {
  const [reports, setReports] = useState<Report[]>(ALL_REPORTS.slice(0, 2));
  const [opened, setOpened] = useState<string | null>(null);
  const navigate = useCallback((path: string) => setOpened(path), []);

  // #region doc
  // Verbatim from https://docs.copilotkit.ai/langgraph-typescript/frontend-tools#registering-a-list-of-tools
  useFrontendTools(
    reports.map((report) => ({
      name: `open_${report.id}`,
      description: `Open the ${report.title} report`,
      handler: async () => navigate(`/reports/${report.id}`),
    })),
    [navigate],
  );
  // #endregion

  return (
    <div className="h-full overflow-hidden">
      <main className="h-full overflow-y-auto p-8 text-sm text-slate-800 dark:text-slate-200">
        <h2 className="text-lg font-semibold">Registered report tools</h2>
        <ul className="mt-3 space-y-2">
          {ALL_REPORTS.map((r) => {
            const on = reports.some((x) => x.id === r.id);
            return (
              <li key={r.id} className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded border px-2 py-0.5 text-xs"
                  onClick={() =>
                    setReports((cur) =>
                      on ? cur.filter((x) => x.id !== r.id) : [...cur, r],
                    )
                  }
                >
                  {on ? "Remove" : "Add"}
                </button>
                <code>open_{r.id}</code> {on ? "(registered)" : "(not registered)"}
              </li>
            );
          })}
        </ul>
        <p className="mt-6">
          Last opened: <code>{opened ?? "nothing yet"}</code>
        </p>
      </main>
      <CopilotSidebar agentId={AGENT_ID} defaultOpen />
    </div>
  );
}
