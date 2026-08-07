import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/interrupt-flow" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A pause the <em>graph</em> decides on, not the model. A node calls{" "}
          <code>interrupt(...)</code>, the run suspends mid-node, the payload
          arrives at the client as a custom event, and{" "}
          <code>useInterrupt</code> renders it and resumes with the answer.
          Because the checkpointer replays the node on resume, the{" "}
          <code>interrupt</code> call returns the user&apos;s value the second
          time through — which is why the node reads like straight-line code.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The graph here trips twice on a fresh thread, tagging each payload
          with a <code>type</code>. That lets the demo carry both of the
          page&apos;s examples as tabs: the single-hook walkthrough, and the
          conditional two-hook variant that is meant to keep them from fighting
          over one event.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "What can you help me with?"]}
            expect="On the Single interrupt tab: before any reply streams, a form appears asking for a name — its text is the raw JSON payload, which is the point. Answer it, then answer the approval prompt the same way, and the assistant finally speaks, naming itself with what you typed. On the Multiple interrupts tab, after pressing Reset thread: nothing appears at all."
            fail="Single tab shows no form: the interrupt never reached the client — check that agentId on the hook matches the runtime-registered id, and look for a CUSTOM_EVENT named on_interrupt in the Inspector. If that event is present, the graph is fine and the fault is in the hook. Multiple tab rendering a card would mean the doc's predicate started working — worth re-checking §9."
          />
        </div>
      </Panel>

      <Panel
        title="The graph side"
        description="interrupt() throws the first time and returns the answer on replay, so `state.x ?? interrupt(...)` is the whole idiom."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/interrupt-flow.ts", region: "state" },
            { file: "backend/src/agents/interrupt-flow.ts", region: "node" },
          ]}
        />
      </Panel>

      <Panel
        title="The frontend side — both of the page's examples, as tabs"
        description="Single interrupt vs. the conditional multi-interrupt variant. One works; one does not."
      >
        <div className="mb-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="pb-2 pr-4 font-medium">Tab</th>
                <th className="pb-2 pr-4 font-medium">Doc section</th>
                <th className="pb-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="align-top">
                <td className="py-3 pr-4 font-mono text-xs">Single interrupt</td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                  Main walkthrough — one hook, no <code>enabled</code>
                </td>
                <td className="py-3 text-emerald-700 dark:text-emerald-400">
                  Fires and resolves
                </td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4 font-mono text-xs">
                  Multiple interrupts
                </td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                  &ldquo;Condition UI executions&rdquo; — two hooks split by{" "}
                  <code>enabled</code>
                </td>
                <td className="py-3 text-rose-700 dark:text-rose-400">
                  Never fires
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <SourceCode file="frontend/src/app/human-in-the-loop/interrupt-flow/demo-chat/page.tsx" />
      </Panel>

     
    </>
  );
}
