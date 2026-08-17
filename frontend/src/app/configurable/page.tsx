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
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          That is the published snippet in full: read <code>configurable</code>,
          return state. It calls no model and appends no message, so on its own
          it produces a run that finishes with an empty chat. The page assumes
          you already have an agent from the Quickstart and is only showing you
          where the values arrive.
        </p>
      </Panel>

      <Panel
        title="The node that replies"
        description="This repo's — the doc has no equivalent, and without one the route has nothing to show."
      >
        <SourceCode file="backend/src/agents/configurable.ts" region="reply" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Kept as a second node rather than folded into the first, so the
          published snippet stays readable as published. It also demonstrates
          something the page asserts but never shows: the same{" "}
          <code>config.configurable</code> is available in <em>any</em> node.
          This one re-reads the token independently — nothing was threaded
          through state, because <code>configurable</code> never touches state.
          That is also why the reply exists at all: with nothing in{" "}
          <code>agent.state</code> to inspect, the model&apos;s answer is the
          only observable evidence the value arrived.
        </p>
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
