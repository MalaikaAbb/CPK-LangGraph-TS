import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Settings that change how the agent behaves, without becoming chat
          messages. The UI owns a typed object — tone, expertise, response
          length — publishes it through <code>useAgentContext</code>, and the
          agent rebuilds its system prompt from it at the start of every turn.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The line the doc draws is worth keeping: if the values are a{" "}
          <em>channel</em> the user occasionally tunes, this is the right shape.
          If they are <em>content</em> the agent should write back to — notes, a
          document, a plan — that is{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Ask 'what is a vector database?' with expertise=beginner, then switch to expert and ask again",
              "Set tone=blunt, length=concise, and ask anything",
            ]}
            expect="The same question gets visibly different answers: the beginner one avoids jargon, the expert one assumes it. Blunt/concise drops the pleasantries and the padding."
            fail="Identical answers regardless of the settings — the context entries are not reaching the before-model callback."
          />
        </div>
      </Panel>

      <Panel title="The UI half">
        <SourceCode file="frontend/src/app/agent-config/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent half"
        description="Read the latest config at the top of every run, rebuild the system prompt, run the turn."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/agent-config.ts", region: "read-config" },

          ]}
        />
      </Panel>
    </>
  );
}
