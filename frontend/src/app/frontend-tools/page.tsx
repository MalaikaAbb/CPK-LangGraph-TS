import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The agent reaching into the app. <code>useFrontendTool</code>{" "}
          registers a tool whose handler runs in the user&apos;s browser, so it
          has the things a server never does: component state, the DOM,{" "}
          <code>localStorage</code>, whatever UI library the page already
          loaded. The model calls it like any other tool and never knows the
          difference.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient",
              "Now something cold and minimal",
            ]}
            expect="The page background changes within a second or two, the CSS value under the heading updates to match, and the agent confirms in words."
            fail="The agent describes a gradient without applying one — the tool was not on its list. Check that AGUIToolset() is in the agent's tools."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/frontend-tools/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The backend half"
        description="There is no change_background anywhere in backend/ — and there should not be."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/chat-agents.ts", region: "builders" },
          ]}
          note="AGUIToolset() is the whole mechanism: it puts CopilotKit's frontend-tool channel on the model's tool list every turn, so tools registered in React show up server-side without the agent declaring them."
        />
      </Panel>

      <Callout tone="info" title="The return value is not decoration">
        <p>
          <code>{"{ status: \"success\" }"}</code> travels back to the agent as
          the tool result. That is what lets the model distinguish &quot;done&quot;
          from &quot;failed&quot; and phrase its next message accordingly —
          returning nothing leaves it guessing, and it will often re-call the
          tool.
        </p>
      </Callout>

      <Callout tone="info" title="Same primitive, three pages">
        <p>
          Frontend tools also underpin{" "}
          <a
            href="/generative-ui/tool-based"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            components as tools
          </a>{" "}
          (<code>useComponent</code> — render, no handler) and{" "}
          <a
            href="/human-in-the-loop"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            human in the loop
          </a>{" "}
          (<code>useHumanInTheLoop</code> — render and wait for the user). This
          page is the plain case: a handler that runs and returns.
        </p>
      </Callout>
    </>
  );
}
