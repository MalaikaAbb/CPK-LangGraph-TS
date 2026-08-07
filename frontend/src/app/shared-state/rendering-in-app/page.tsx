import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/rendering-in-app" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          That agent state is not chat state. <code>useAgent</code> works in any
          component under the provider, so a dashboard, a document canvas, a map
          or a table can subscribe to the same agent the chat uses — and both
          re-render from one state object.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This route uses the same agent as{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Shared State
          </a>
          . Only the layout differs: there the canvas sits beside a chat pane,
          here it is the page and the chat is docked. Both read{" "}
          <code>agent.state.notes</code>; neither is privileged.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Add a task to the list, mark it done, and add another",
            ]}
            expect="Cards appear in the main view as the agent records observations. Clicking one removes it, and asking the agent what it knows confirms the removal — the write went to shared state, not just to local UI."
            fail="Cards appear but clicking does nothing lasting — the setState call is being overwritten by the agent's next state snapshot."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="Three things worth doing every time">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Target the agent explicitly.</strong>{" "}
            <code>useAgent()</code> with no argument binds to the agent named{" "}
            <code>default</code>. With 29 registered agents, always pass{" "}
            <code>agentId</code>.
          </li>
          <li>
            <strong>Treat state as partial.</strong> Mid-run it may be
            half-streamed, so guard with defaults —{" "}
            <code>(agent.state ?? {"{}"}) as Partial&lt;T&gt;</code> — rather
            than dotting straight through.
          </li>
          <li>
            <strong>Throttle a heavy canvas.</strong>{" "}
            <code>useAgent({"{ throttleMs }"})</code> if a streaming run
            re-renders it too often.
          </li>
        </ul>
      </Callout>
    </>
  );
}
