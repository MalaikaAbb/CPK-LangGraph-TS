import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference route: deploying to AWS Bedrock AgentCore needs an AWS account,
 * CDK bootstrap and Cognito, none of which a local harness has. The page's
 * commands and config are kept verbatim under docs-verbatim/deploy-agentcore/.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/deploy-agentcore" />

      <Callout tone="premium" title="Requires an AWS account — not testable locally">
        <p>
          The page scaffolds a separate project with{" "}
          <code>npx copilotkit@latest create -f agentcore-langgraph</code> and
          deploys it to AWS AgentCore with CDK. Nothing in this repo is
          deployed there; the commands are shown for reference only.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The request path becomes browser → CopilotKit runtime → AgentCore
          runtime → agent. A starter template, a two-line config (stack-name
          prefix and the admin email that receives the Cognito invite), a
          deploy script, an optional local Docker stack, and a CDK destroy. The
          page also shows the 401 &quot;Missing Authentication Token&quot;
          error you get when the runtime calls AgentCore without auth.
        </p>
      </Panel>

      <Panel title="Scaffold, configure, deploy, tear down">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-agentcore/create-langgraph.sh" },
            { file: "docs-verbatim/deploy-agentcore/config.yaml" },
            { file: "docs-verbatim/deploy-agentcore/deploy-langgraph.sh" },
            { file: "docs-verbatim/deploy-agentcore/local-docker.sh" },
            { file: "docs-verbatim/deploy-agentcore/destroy.sh" },
          ]}
          note="The page also offers Strands variants (create-strands.sh, deploy-strands.sh, kept in the same folder); they are not LangGraph."
        />
      </Panel>
    </>
  );
}
