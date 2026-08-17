import Link from "next/link";

import { KeyValue, Panel } from "@/components/ui";
import { AGENT_IDS } from "@/lib/agents";
import { DOCS_ROOT } from "@/lib/nav-config";
import { DocDriftPanel } from "@/components/doc-drift-panel";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          CopilotKit + LangGraph (TypeScript)
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          A test harness for the LangGraph TypeScript integration. Every doc page
          under{" "}
          <a
            href={DOCS_ROOT}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            docs.copilotkit.ai/langgraph-typescript
          </a>{" "}
          that this repo tracks is a route here, and each route runs the thing
          its page teaches rather than describing it.
        </p>
      </header>


      <DocDriftPanel />

      <Panel title="What this is">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One Next app and one LangGraph server. Each doc route is bound to its
          own compiled graph, so a page can be exercised without another
          page&apos;s conversation, state or tools bleeding into it.
        </p>
        <div className="mt-4">
          <KeyValue
            rows={[
              [
                "Docs tracked",
                <a
                  key="d"
                  href={DOCS_ROOT}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  {DOCS_ROOT}
                </a>,
              ],
              ["Graphs", `${AGENT_IDS.length}, all in backend/langgraph.json`],
              ["Backend", "TypeScript LangGraph, served by langgraphjs dev on :8123"],
              ["Model", "OpenAI (gpt-4o-mini by default)"],
            ]}
          />
        </div>
      </Panel>

      <Panel title="How a message travels">
        <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> A chat component posts to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              /api/copilotkit
            </code>{" "}
            in this Next app.
          </li>
          <li>
            <strong>2.</strong> The Copilot Runtime resolves the agent id to a{" "}
            <code>LangGraphAgent</code> and forwards the run to the LangGraph
            server on <code>:8123</code>, naming the graph via{" "}
            <code>graphId</code>.
          </li>
          <li>
            <strong>3.</strong> The graph executes — nodes, checkpointer, backend
            tools, and OpenAI calls all live there.
          </li>
          <li>
            <strong>4.</strong> AG-UI events stream back as SSE. Browser-executed
            tools run here, and their results go back so the run can continue.
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Two routes bypass step 1 for a runtime of their own:{" "}
          <Link
            href="/voice"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Voice
          </Link>{" "}
          (its runtime carries a <code>TranscriptionService</code>, which the v1
          wrapper drops) and{" "}
          <Link
            href="/generative-ui/a2ui/dynamic-schema"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            A2UI · Dynamic Schema
          </Link>{" "}
          (it needs <code>injectA2UITool: true</code>, the opposite of what the
          fixed-schema route needs, and that flag is per-runtime).
        </p>
      </Panel>

      <Panel title="Start here">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <Link
              href="/quickstart"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Quickstart
            </Link>{" "}
            is the smallest end-to-end path and the fastest way to confirm both
            processes are up. Every route has an{" "}
            <strong>Open demo</strong> button that opens a chrome-free surface in
            a new tab.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sidebar dot colours mirror status: green working, amber partial, grey
            reference. The{" "}
            <Link
              href="/status"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              status overview
            </Link>{" "}
            lists every route in one table.
          </p>
        </div>
      </Panel>
    </>
  );
}
