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
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/frontend-tools/demo-chat/page.tsx" },
            { file: "frontend/src/app/frontend-tools/background-chat.tsx" },
          ]}
        />
      </Panel>

      <Panel
        title="The backend half"
        description="The page's graph, verbatim: bind whatever the browser registered, per turn."
      >
        <SourceCode file="backend/src/agents/frontend-tools.ts" region="agent" />
      </Panel>

      <Panel
        title="Calling a frontend tool from a node with no model"
        description="The page's second graph, served as frontend-tools-no-model."
      >
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Open{" "}
          <a href="/frontend-tools/no-model" className="text-[var(--accent)] underline underline-offset-4">
            the no-model demo
          </a>{" "}
          and send any message. Pass: the background turns to the blue-purple
          gradient and the chat shows &quot;The frontend returned: …&quot;
          with the handler&apos;s result. Fail: nothing changes (the tool call
          never reached the browser) or the background keeps being re-requested
          (the follow-up run was not routed to <code>confirm</code>).
        </p>
        <SourceCode file="backend/src/agents/frontend-tools-no-model.ts" region="agent" />
      </Panel>

      <Panel
        title="Registering a list of tools"
        description="useFrontendTools takes an array; tools join and leave as the array changes."
      >
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Open{" "}
          <a href="/frontend-tools/tool-list" className="text-[var(--accent)] underline underline-offset-4">
            the tool-list demo
          </a>
          , ask &quot;open the churn report&quot; while it is not registered,
          then add it and ask again. Pass: the first attempt finds no tool, the
          second updates &quot;Last opened&quot; to{" "}
          <code>/reports/churn</code>. The <code>reports</code> list and{" "}
          <code>navigate</code> around the snippet are this repo&apos;s; the
          page does not define them.
        </p>
        <SourceCode file="frontend/src/app/frontend-tools/tool-list/page.tsx" region="doc" />
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
