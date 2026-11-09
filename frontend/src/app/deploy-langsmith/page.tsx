import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference route: the LangSmith Platform page deploys a graph with
 * `langgraph deploy` (needs a LangSmith account with deployments) and points
 * `LangGraphAgent` at the deployment URL. Its runtime wiring is the same shape
 * this harness already runs against a local `langgraphjs dev` server, so the
 * only untested part is the hosted deployment itself.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/deploy-langsmith" />

      <Callout tone="premium" title="Requires a LangSmith deployment — not testable locally">
        <p>
          To try it for real, deploy <code>backend/</code> with{" "}
          <code>langgraph deploy</code> and set{" "}
          <code>LANGGRAPH_DEPLOYMENT_URL</code> and{" "}
          <code>LANGSMITH_API_KEY</code> in <code>.env</code>. Every route&apos;s{" "}
          <code>LangGraphAgent</code> then talks to the deployment instead of{" "}
          <code>localhost:8123</code>. Note the page scaffolds a Python
          project; this repo&apos;s graphs are TypeScript.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Browser → CopilotKit runtime → LangSmith deployment → agent. Create
          or reuse a project with a <code>langgraph.json</code>, deploy it,
          then register it in the runtime as a <code>LangGraphAgent</code> with
          the deployment URL, the graph id from <code>langgraph.json</code>,
          and a LangSmith key. The page also covers wrapping a Google ADK agent
          for the same platform, which does not apply here.
        </p>
      </Panel>

      <Panel title="Deploy">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/install-cli.sh" },
            { file: "docs-verbatim/deploy-langsmith/new-project.sh" },
            { file: "docs-verbatim/deploy-langsmith/langgraph.json" },
            { file: "docs-verbatim/deploy-langsmith/deploy.sh" },
          ]}
        />
      </Panel>

      <Panel
        title="Connect CopilotKit"
        description="Compare with frontend/src/app/api/copilotkit/[[...slug]]/route.ts, which is the same LangGraphAgent shape for every graph."
      >
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/route.ts" },
            { file: "docs-verbatim/deploy-langsmith/providers.tsx" },
            { file: "docs-verbatim/deploy-langsmith/layout.tsx" },
            { file: "docs-verbatim/deploy-langsmith/env.example" },
          ]}
        />
      </Panel>
    </>
  );
}
