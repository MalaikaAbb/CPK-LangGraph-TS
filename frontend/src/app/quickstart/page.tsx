import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

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
            { file: "frontend/src/app/api/copilotkit/route.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
