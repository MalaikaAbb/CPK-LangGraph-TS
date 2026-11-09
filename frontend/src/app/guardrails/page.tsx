import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference-only route: the Guardrails & DLP page publishes only Python
 * (`create_agent`, `AgentMiddleware`, `PIIMiddleware`, `CopilotKitMiddleware`)
 * even under langgraph-typescript, and this repo's backend is a Node LangGraph
 * server. The published code is kept verbatim under docs-verbatim/guardrails/
 * and shown here; nothing is run.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/guardrails" />

      <Callout tone="warn" title="Python only — not runnable in this TypeScript harness">
        <p>
          Every snippet on this page is Python (LangChain&apos;s{" "}
          <code>AgentMiddleware</code> hooks and <code>PIIMiddleware</code>,
          ordered before <code>CopilotKitMiddleware</code>). The page gives no
          TypeScript equivalent, and no TypeScript sibling harness implements
          it, so there is no agent or demo here. The code is kept verbatim for
          reference. See README §9.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Input and output screening as agent middleware: built-in PII
          redaction/masking/blocking, a <code>before_model</code> input
          firewall that ends the run with a refusal message, a{" "}
          <code>wrap_model_call</code> output scrubber, a{" "}
          <code>wrap_tool_call</code> tool firewall, and the rule that
          guardrails go <em>before</em> <code>CopilotKitMiddleware</code> in
          the list so they wrap it.
        </p>
      </Panel>

      <Panel title="Built-in PII middleware">
        <SourceCode file="docs-verbatim/guardrails/agent.py" />
      </Panel>
      <Panel title="Input screening">
        <SourceCode file="docs-verbatim/guardrails/input_firewall.py" />
      </Panel>
      <Panel title="Output and DLP screening">
        <SourceCode file="docs-verbatim/guardrails/output_firewall.py" />
      </Panel>
      <Panel title="Screening tool calls">
        <SourceCode file="docs-verbatim/guardrails/tool_firewall.py" />
      </Panel>
      <Panel title="Ordering against CopilotKitMiddleware">
        <SourceCode file="docs-verbatim/guardrails/ordering.py" />
      </Panel>
    </>
  );
}
