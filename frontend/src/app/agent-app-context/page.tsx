import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-app-context" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Telling the agent what is going on in the app, in real time, without
          routing it through the chat thread.{" "}
          <code>useAgentContext(&#123; description, value &#125;)</code>{" "}
          registers a readable; the runtime threads it onto{" "}
          <code>state.copilotkit.context</code>; the graph reads it there and
          folds it into the prompt.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page&apos;s example is a colleague list, and the demo keeps it —
          the roster is editable so you can watch the agent&apos;s answers track
          a change it was never told about.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Who are my colleagues?",
              "Remove Jane Smith from the list, then ask: who can review a design?",
            ]}
            expect="The first answer names all three from the sidebar. After removing Jane, the agent no longer offers her and reaches for whoever is left — with no message telling it the roster changed."
            fail="The agent says it has no information about your colleagues. The readable is not reaching the graph — check that the graph's state spreads CopilotKitStateAnnotation.spec, since that is what creates the channel."
          />
        </div>
      </Panel>

      <Panel title="The frontend side">
        <SourceCode file="frontend/src/app/agent-app-context/demo-chat/page.tsx" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The <code>description</code> is not decoration. It is the only label
          the model gets for the value, so it decides whether the agent
          understands what it is looking at. Write it like a parameter
          docstring.
        </p>
      </Panel>

      <Panel
        title="The graph side"
        description="Read state.copilotkit.context and prepend it as a system message."
      >
        <SourceCode file="backend/src/agents/readonly-state.ts" region="inject-context" />
      </Panel>

      <Panel title="Related">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/shared-state/agent-readonly"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Agent Read-Only Context
          </Link>{" "}
          is the same hook framed as a design decision — when to reach for a
          one-way readable instead of full{" "}
          <Link
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </Link>
          . This route is the mechanics.
        </p>
      </Panel>
    </>
  );
}
