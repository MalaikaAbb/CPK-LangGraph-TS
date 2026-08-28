import { IntelligenceStatus } from "@/components/intelligence-status";
import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The smallest end-to-end path. One <code>StateGraph</code> compiled
          and exported as <code>graph</code>, named in{" "}
          <code>langgraph.json</code>, served by <code>langgraphjs dev</code> on{" "}
          <code>:8123</code>, and reached by the Next runtime through a{" "}
          <code>LangGraphAgent</code> carrying that graph id. Two processes, two
          ports — both TypeScript, but the LangGraph server is a real server, not
          an in-process import.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Can you tell me a joke?",
              "What do you think about React?",
            ]}
            expect="Tokens stream in a word at a time and the reply renders as markdown."
            fail="An error banner. Check that langgraphjs dev is up on :8123 and that OPENAI_API_KEY is set in the repo-root .env."
          />
        </div>
      </Panel>

      <Panel
        title="Intelligence, live"
        description="Read from this checkout's own configuration at render time — not a description of it."
      >
        <IntelligenceStatus />
      </Panel>

      <Callout tone="warn" title="The Quickstart moved to the v2 runtime">
        <p>
          Three things changed when the doc switched surfaces, and all three are
          load-bearing:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            The import is <code>@copilotkit/runtime/v2</code>, not{" "}
            <code>@copilotkit/runtime</code>. There is no{" "}
            <code>serviceAdapter</code> on this surface at all —{" "}
            <code>ExperimentalEmptyAdapter</code> belonged to the v1 GraphQL
            runtime and has no counterpart.
          </li>
          <li>
            <code>createCopilotRuntimeHandler</code> returns a plain fetch
            handler rather than a <code>{"{ handleRequest }"}</code> wrapper, so
            the route is just its verb exports.
          </li>
          <li>
            The file moved to{" "}
            <code>api/copilotkit/[[...slug]]/route.ts</code>. The handler serves
            a whole subtree — <code>/info</code>, agent runs, thread
            list/rename/delete — so the old single-segment route 404s every run
            while <code>/info</code> keeps answering 200. The app looks
            connected and never replies, with no error anywhere.
          </li>
        </ul>
        <p className="mt-2">
          This route exports four verbs rather than the doc&apos;s two.{" "}
          <code>GET</code> serves <code>/info</code> and the thread list,{" "}
          <code>POST</code> runs agents, and <code>PATCH</code>/
          <code>DELETE</code> are how threads are renamed, archived and deleted
          — which the three{" "}
          <a
            href="/prebuilt-components/copilot-threads-drawer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Rich Threads
          </a>{" "}
          routes need.
        </p>
      </Callout>

      <Callout tone="info" title="Two credentials, two different jobs">
        <p>
          <code>INTELLIGENCE_API_KEY</code> puts the runtime in Intelligence
          mode — that is what makes threads persist and the thread endpoints
          return real rows. A license is separate:{" "}
          <code>COPILOTKIT_LICENSE_TOKEN</code> on the runtime, or{" "}
          <code>NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY</code> on the provider
          (what the Threads Drawer doc&apos;s own sample passes). Client-side
          feature UIs gate on the license, not on the key — so a runtime can
          serve threads perfectly while every drawer still shows an Upgrade
          button.
        </p>
        <p className="mt-2">
          Neither is required to chat. Without them the runtime falls back to
          SSE with an in-memory runner, which is why this harness stays runnable
          with only an OpenAI key and a <code>langgraphjs dev</code> server.
        </p>
      </Callout>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The three files that make it work"
        description="Read from this repo, so they can be diffed against the doc's samples directly."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/quickstart.ts", region: "agent" },
            { file: "backend/langgraph.json" },
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
            { file: "frontend/src/lib/copilot-runtime.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
