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
          Which channel each kind of value should take into a LangGraph agent.
          The page now treats anything the browser puts in{" "}
          <code>forwardedProps.config</code> as untrusted: model-visible
          preferences go through agent context, credentials through an{" "}
          <code>Authorization</code> header, and graph execution settings are
          set by the trusted backend that serves the graph.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This route exercises the third row. The browser sends nothing but
          the chat message. The Next runtime route (the trusted server here)
          attaches <code>tenantId</code> and a <code>recursion_limit</code> of
          50 to the <code>configurable</code> agent, and the graph reads them
          from its LangGraph runtime context.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What tenant and recursion limit did the server give you?",
            ]}
            expect="The reply reports tenant tenant-demo (or CONFIGURABLE_TENANT_ID if set) and recursionLimit 50. The browser's request body carries neither value."
            fail="The agent reports tenant null — the tenantId key did not reach LangGraph context. Check that the graph declares it in its context schema (second StateGraph argument); @ag-ui/langgraph only forwards configurable keys the context schema names."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Most of this route is the repo's, not the page's">
        The page publishes a single <code>graph.invoke(input, &#123; context,
        recursionLimit &#125;)</code> fragment and defers the context schema and
        node signature to LangGraph&apos;s own runtime-configuration guide. The
        schema, node and runtime wiring below follow that guide; see README §9.
      </Callout>

      <Panel
        title="The page's snippet"
        description="Verbatim, wrapped in a function so its free names are bound."
      >
        <SourceCode file="backend/src/agents/configurable.ts" region="doc-snippet" />
      </Panel>

      <Panel
        title="Context schema and node"
        description="Repo-authored, per LangGraph's runtime configuration guide."
      >
        <SourceCode file="backend/src/agents/configurable.ts" region="context-schema" />
        <SourceCode file="backend/src/agents/configurable.ts" region="node" />
      </Panel>

      <Panel
        title="Where the trusted server sets it"
        description="The graph is served by langgraphjs dev, so the runtime route's LangGraphAgent carries the values."
      >
        <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="The frontend side" description="Nothing config-related — by design.">
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
          is the page&apos;s answer for preferences the model should see: they
          travel through <code>useAgentContext</code>. This route is execution
          plumbing the browser must not control.
        </p>
      </Panel>
    </>
  );
}
