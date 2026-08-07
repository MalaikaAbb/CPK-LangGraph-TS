import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          An agent stopping mid-run to ask, then carrying on with the answer
          folded into its reasoning. The model calls a tool that exists only on
          the client; CopilotKit routes the call to your <code>render</code>{" "}
          function; the run stays open until you call <code>respond</code>. The
          agent keeps its context, and the user keeps the steering wheel.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Book an intro call with the sales team to discuss pricing",
              "Schedule a 1:1 with Alice next week to review Q2 goals",
            ]}
            expect="A picker renders inline with four slots. Nothing further streams until you pick — then the card collapses to a green 'Booked' badge with your slot, and the agent's confirmation names it. 'None of these work' collapses to a red 'Cancelled' badge instead."
            fail="The agent describes some times in prose and finishes — it answered instead of calling the tool. Or the picker renders but the run continues underneath it, which means respond was never called."
          />
        </div>
      </Panel>

      <Panel
        title="The picker"
        description="Once it has recorded a pick or a cancel it gates its own buttons, so the tool call cannot be resolved twice."
      >
        <SourceCode file="frontend/src/app/human-in-the-loop/time-picker-card.tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The <code>Card</code>, <code>Button</code> and <code>Badge</code>{" "}
          primitives it imports are this repo&apos;s, not the doc&apos;s —
          shadcn-shaped, Tailwind-only, in{" "}
          <code>card.tsx</code>, <code>button.tsx</code> and{" "}
          <code>badge.tsx</code> beside it. The candidate slots live in{" "}
          <code>slots.ts</code>: page-owned data, so a real calendar API drops
          in without touching the card.
        </p>
      </Panel>

      <Panel title="The registration">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/human-in-the-loop/demo-chat/page.tsx" },
            { file: "backend/src/agents/frontend-tools.ts", region: "agent" },
          ]}
        />
      </Panel>

      <Panel title="Two patterns, and LangGraph is one of the few backends with both">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="pb-2 pr-4 font-medium">Pattern</th>
                <th className="pb-2 pr-4 font-medium">Who decides to pause</th>
                <th className="pb-2 font-medium">Where it lives here</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="align-top">
                <td className="py-3 pr-4 font-mono text-xs">useHumanInTheLoop</td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                  The LLM, by calling a client-side tool
                </td>
                <td className="py-3 text-emerald-700 dark:text-emerald-400">
                  This route
                </td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4 font-mono text-xs">useInterrupt</td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                  The graph, by calling interrupt() in a node
                </td>
                <td className="py-3 text-emerald-700 dark:text-emerald-400">
                  <Link
                    href="/human-in-the-loop/interrupt-flow"
                    className="underline underline-offset-4"
                  >
                    Interrupts
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The distinction the page draws is about <em>who</em> decides to stop.
          Here the model chose to ask, so the pause is one branch of a normal
          tool call and the agent sees the answer as a tool result. On the{" "}
          <Link
            href="/human-in-the-loop/interrupt-flow"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Interrupts
          </Link>{" "}
          route the code path stops unconditionally, whatever the model wanted —
          and the agent is not aware of the exchange unless you put it back in
          state yourself. Most CopilotKit backends only have the first shape;
          the second needs a runtime with a real <code>interrupt(...)</code>{" "}
          primitive, which is exactly what LangGraph provides.
        </p>
      </Panel>
    </>
  );
}
