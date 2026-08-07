import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/configurable" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The third channel into an agent, alongside messages and state.
          LangGraph nodes always receive a <code>RunnableConfig</code>, and its{" "}
          <code>configurable</code> object is free for you to fill. CopilotKit
          forwards whatever the frontend puts in{" "}
          <code>forwardedProps.config.configurable</code> straight through.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The distinction that matters: this is <em>not</em> state. It is not
          checkpointed, it is not synced back to the UI, and it does not survive
          into the next run unless you send it again — which is exactly what you
          want for an auth token or a per-session tenant id.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "what configuration was received?",
              "What is the authToken set to?",
            ]}
            expect="The reply reports back the three values verbatim. Change one and re-run: the new value is reported. Open the inspector's state tab and none of them are there."
            fail="The agent says it was given no configuration — the forwardedProps shape is wrong; it must be nested as { config: { configurable: {...} } }, not flat."
          />
        </div>
      </Panel>

      <Panel
        title="The graph side"
        description="Pull the values off `config.configurable` in any node."
      >
        <SourceCode file="backend/src/agents/configurable.ts" region="node" />
      </Panel>

      <Panel
        title="The frontend side"
        description="Config rides on the run, not on the provider."
      >
        <SourceCode file="frontend/src/app/configurable/demo-chat/page.tsx" />
      </Panel>

    

      <Panel title="Related">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/agent-config"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Agent Config
          </Link>{" "}
          looks similar and is not the same thing: it is user-tunable behaviour
          that belongs in the model&apos;s prompt, travels through{" "}
          <code>useAgentContext</code>, and lands in agent state. This route is
          execution plumbing that the model mostly should not see.
        </p>
      </Panel>
    </>
  );
}
