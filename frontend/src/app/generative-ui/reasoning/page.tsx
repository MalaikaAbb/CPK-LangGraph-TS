import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/reasoning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same reasoning message type as{" "}
          <a
            href="/custom-look-and-feel/reasoning-messages"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Reasoning Messages
          </a>
          , but taken over completely. That route replaces two sub-slots and
          keeps the card; this one passes a whole component to{" "}
          <code>messageView.reasoningMessage</code> and gets the card&apos;s
          entire job — layout, styling, and the decision of whether to collapse
          at all. <code>ReasoningBlock</code> chooses not to, so the thinking
          chain stays on screen.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "A shop sells pens at 3 for £5 and notebooks at 2 for £7. What's the cheapest way to buy 11 pens and 5 notebooks?",
              "Estimate how many piano tuners work in Chicago, and show your reasoning.",
            ]}
            expect="Reasoning renders as an always-open banner tagged 'Reasoning', italic, above the final answer — not as a collapsible card."
            fail="The default card appears, meaning the slot did not take; or nothing appears, meaning the model returned no reasoning tokens for that prompt."
          />
        </div>
      </Panel>

      <Panel title="The custom card">
        <SourceCode file="frontend/src/app/generative-ui/reasoning/reasoning-block.tsx" />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[{ file: "frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx" }]}
        />
      </Panel>

      <Panel title="What the component receives">
        <dl className="space-y-2 text-sm">
          {[
            ["message", "The ReasoningMessage. `.content` holds the streaming text."],
            ["messages", "The full conversation, so you can tell whether this block is the trailing one."],
            ["isRunning", "Whether the agent is currently running."],
          ].map(([name, desc]) => (
            <div key={name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-28 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Note what is <em>not</em> in that list: there is no{" "}
          <code>isStreaming</code>. It has to be derived by checking{" "}
          <code>isRunning</code> against whether this message is the last one —
          which is exactly what the doc&apos;s own component does, and why it
          takes <code>messages</code> at all.
        </p>
      </Panel>
    </>
  );
}
