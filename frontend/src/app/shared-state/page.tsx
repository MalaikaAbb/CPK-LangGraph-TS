import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One object that both sides can read and write. In LangGraph it is the
          graph&apos;s own state, extended with{" "}
          <code>CopilotKitStateAnnotation.spec</code> — that spread is what gives
          the runtime somewhere to put updates from{" "}
          <code>agent.setState</code>. A tool writes to it by returning a{" "}
          <code>Command(&#123; update &#125;)</code>; the UI writes to it with{" "}
          <code>setState</code>, and the graph reads that back on its next
          turn.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo shows both directions at once — the agent writes{" "}
          <code>notes</code>, you write <code>preferences</code>, and neither
          goes through the chat thread.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Hi, I'm a backend engineer and I mostly work in Rust",
              "Then set Tone to playful and Detail to brief, and ask: what should I read next?",
            ]}
            expect="The scratch pad fills with observations about you as the agent learns them. After changing the preferences, the next reply visibly changes register and length — that is the write side working, not just the panel updating."
            fail="The panel updates but the agent's voice does not change — the chat node is not folding state.preferences into its system prompt."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The doc shows the state but not the tool">
        <p>
          MARK THIS AS WARNING - TOOL IS MISSING HAD TO BE DEFINED. 
          The page publishes <code>AgentStateAnnotation</code> verbatim and then
          describes the rest in prose: &ldquo;a <code>set_notes</code> tool emits
          a <code>Command(&#123; update: ... &#125;)</code> to push agent-authored
          state, and a preferences-injecting chat node reads UI-authored state
          every turn.&rdquo; Neither function body appears anywhere on it. Both
          are written here to exactly that contract. See README §9.
        </p>
      </Callout>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The cards">
        <SourceCode file="frontend/src/app/shared-state/notes-card.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="A tool for the write side, a prompt-assembling chat node for the read side."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/shared-state-read-write.ts", region: "set-notes" },
            { file: "backend/src/agents/shared-state-read-write.ts", region: "inject-preferences" },
          ]}
        />
      </Panel>

      

      <Panel title="Where the rest of this section goes">
        <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            <a href="/shared-state/rendering-in-app" className="text-[var(--accent)] underline underline-offset-4">
              Render state in your app
            </a>{" "}
            — the same state as a main-view canvas rather than a chat sidebar.
          </li>
          <li>
            <a href="/shared-state/streaming" className="text-[var(--accent)] underline underline-offset-4">
              State streaming
            </a>{" "}
            — updates arriving mid-tool instead of at checkpoints.
          </li>
          <li>
            <a href="/shared-state/agent-readonly" className="text-[var(--accent)] underline underline-offset-4">
              Agent read-only context
            </a>{" "}
            — when the agent should read a value but never write it.
          </li>
        </ul>
      </Panel>
    </>
  );
}
