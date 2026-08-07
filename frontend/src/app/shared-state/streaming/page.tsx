import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/streaming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          By default agent state only updates <em>between</em> checkpoints, so a
          tool that writes a long document appears to the UI as one burst at the
          very end. State streaming forwards a specific tool argument into a
          state key <em>while the argument is still being generated</em> — so
          the user watches the answer assemble instead of watching a spinner.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write a short blog post about why agent state beats chat history",
              "Draft a polite email declining a meeting",
            ]}
            expect="The left pane fills a few words at a time, the character count climbs continuously, and the LIVE badge is on throughout. The text never appears as a chat message."
            fail="The document lands in one jump when the run ends. That is what it looks like without the mapping."
          />
        </div>
      </Panel>

      <Panel
        title="The backend: one streaming state mapping"
        description="The pattern is always the same — map one streaming tool argument to one shared-state key."
      >
        <SourceCode file="backend/src/agents/shared-state-streaming.ts" region="agent" />
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            The state key must exist in the agent&apos;s state —{" "}
            <code>document</code> here.
          </li>
          <li>
            <code>tool</code> and <code>toolArgument</code> must match the
            LLM-facing call exactly:{" "}
            <code>write_document.document</code>.
          </li>
          <li>
            When the call completes, its return value is written to the same
            key — so the streamed partial becomes the authoritative final value.
          </li>
        </ul>
      </Panel>

      <Panel
        title="Where the mapping is applied"
        description="copilotkitCustomizeConfig wraps the RunnableConfig for one invocation — so the mapping is per-call, not per-agent."
      >
        <SourceCode file="backend/src/agents/shared-state-streaming.ts" region="tool" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The tool body above is the other half of the contract. Everything the
          user sees before it runs arrived through the mapping; this{" "}
          <code>Command</code> is what makes the value survive the checkpoint,
          because a node&apos;s returned state is the single source of truth once
          it finishes.
        </p>
      </Panel>

      <Panel title="The frontend: useAgent + OnStateChanged">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/shared-state/streaming/demo-chat/page.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="info" title="Same agent as State Rendering">
        <p>
          The docs give{" "}
          <a
            href="/generative-ui/state-rendering"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Rendering
          </a>{" "}
          and this page the same backend, so the two routes share one agent and
          one conversation. That page is about drawing whatever arrives; this
          one is about the mapping that makes it arrive early.
        </p>
      </Callout>
    </>
  );
}
