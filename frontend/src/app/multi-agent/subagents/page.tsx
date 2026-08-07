import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/multi-agent/subagents" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The canonical multi-agent shape: one supervisor LLM that exposes each
          specialist as a tool. Structurally this is just tool-calling — but
          each &quot;tool&quot; is a full agent with its own system prompt, and
          the supervisor only ever sees what it returns.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The example is Research → Write → Critique, delegated in sequence, and
          every delegation is written into shared state so the UI can show a
          live log instead of a spinner.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write a short paragraph explaining why agent-native UIs beat chatbots",
              "Draft an announcement for a new pricing tier",
            ]}
            expect="Three cards appear in order — Researcher, Writer, Critic — each with its task and the sub-agent's output, then a short final answer in the chat. The role chips light up as each fires."
            fail="The log stays empty while the agent answers directly — it skipped delegation. Or the same sub-agent fires repeatedly, which is what the 'EXACTLY ONCE' language in the instruction exists to prevent."
          />
        </div>
      </Panel>

      <Panel title="The delegation log">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/multi-agent/subagents/demo-chat/page.tsx" },
            { file: "frontend/src/app/multi-agent/subagents/delegation-log.tsx" },
          ]}
        />
      </Panel>

      <Panel
        title="The supervisor and its three tools"
        description="Each sub-agent is a single-shot model.invoke, not a nested compiled graph — far cheaper per delegation."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/subagents.ts", region: "supervisor-delegation-tools" },

          ]}
        />
      </Panel>

      <Panel title="What each delegation tool does">
        <ol className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> Run the sub-agent on the supplied{" "}
            <code>task</code> string.
          </li>
          <li>
            <strong>2.</strong> Append the result to{" "}
            <code>state[&quot;delegations&quot;]</code> so the UI can render it.
          </li>
          <li>
            <strong>3.</strong> Return the sub-agent&apos;s text as the tool
            result, which the supervisor sees on its next turn.
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Entries are appended only <em>after</em> the sub-agent returns, so the
          log grows by exactly one completed entry per call rather than showing
          running placeholders.
        </p>
      </Panel>

      <Callout tone="info" title="Failures are entries too">
        <p>
          A failed sub-agent still writes a <code>completed</code> entry whose
          result is an error string prefixed <code>[sub-agent error]</code>.
          Success and failure share one shape, so the renderer needs no separate
          branch, and the supervisor is instructed to surface the failure rather
          than fabricate an answer. The user-facing message carries only the
          exception class name — OpenAI SDK errors can contain URLs, request
          ids and quota details that should not reach a browser.
        </p>
      </Callout>

      <Callout tone="info" title="Keep the boundaries narrow">
        <p>
          Each sub-agent prompt does one thing. If a sub-agent needs the whole
          user context to do its job, the boundary is in the wrong place — the
          value of the pattern is that each specialist has less to think about,
          not more.
        </p>
      </Callout>

      <Callout tone="warn" title="Where the doc stops">
        <p>
          The page publishes the state annotation, the sub-agent prompts, the{" "}
          <code>delegationUpdate</code> helper and all three delegation tools
          verbatim — but not the supervisor node or the graph assembly. Those
          follow the same <code>chat_node</code> / <code>tool_node</code> /{" "}
          <code>shouldContinue</code> shape every other published LangGraph
          TypeScript graph in these docs uses. See README §9.
        </p>
      </Callout>
    </>
  );
}
