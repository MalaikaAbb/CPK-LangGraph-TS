import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/agent-readonly" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A one-way UI-to-agent channel. Sometimes the agent should{" "}
          <em>know</em> something — who is logged in, what page they are on,
          what they just did — without being able to change it.{" "}
          <code>useAgentContext</code> publishes those values as pure inputs:
          refreshed when they change, removed automatically on unmount, and with
          no setter or tool for the agent to write back through.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Props for the agent, in other words. When you need reads{" "}
          <em>and</em> writes, that is{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            full shared state
          </a>{" "}
          instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Who am I and what have I been doing?",
              "Change my name to David/any other name — then ask again",
            ]}
            expect="The agent answers from the panel: your name, your timezone, and only the activities marked 'published'. Asking it to change your name gets an explanation that those values belong to the app; editing the field and asking again shows the new one."
            fail="The agent says it has no information about you — the before-model callback is not finding the context entries in session state."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent side"
        description="Context entries arrive on state.copilotkit.context; the chat node folds them into a second system message."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/readonly-state.ts", region: "inject-context" },
          ]}
        />
      </Panel>

      <Callout tone="info" title="The description is prompt">
        <p>
          Each entry ships its <code>description</code> alongside its value, and
          that string is what tells the model what the value is for. &quot;The
          user&apos;s IANA timezone (used when mentioning times)&quot; earns its
          length; <code>&quot;tz&quot;</code> would not.
        </p>
      </Callout>
    </>
  );
}
