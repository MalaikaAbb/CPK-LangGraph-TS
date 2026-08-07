"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { NotesCard, PreferencesCard, type Preferences } from "../notes-card";

const AGENT_ID = "shared-state-read-write";

type RWAgentState = {
  notes?: string[];
  preferences?: Preferences;
};

const DEFAULT_PREFERENCES: Preferences = { tone: "neutral", detail: "normal" };

export default function Page() {
  return (
    <DemoFrame parentPath="/shared-state" subtitle={`agent: ${AGENT_ID}`}>
      <Surface />
    </DemoFrame>
  );
}

function Surface() {
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this fires, we
  // re-render, and the panels reflect the new values.
  const { agent } = useAgent({
    agentId: AGENT_ID,
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const agentState = agent.state as RWAgentState | undefined;
  const notes = agentState?.notes ?? [];
  const preferences = agentState?.preferences ?? DEFAULT_PREFERENCES;

  // WRITE: every edit goes straight into agent state. On the agent's next
  // turn `_inject_preferences` reads this back out and prepends a preferences
  // block to the system prompt — so the UI's writes visibly steer the model.
  const handlePreferencesChange = (next: Preferences) => {
    agent.setState({
      ...(agentState as object | undefined),
      preferences: next,
      notes: agentState?.notes ?? [],
    } as RWAgentState);
  };

  const handleClearNotes = () => {
    agent.setState({
      ...(agentState as object | undefined),
      notes: [],
    } as RWAgentState);
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_24rem]">
      <div className="min-h-0 space-y-4 overflow-y-auto p-6">
        <NotesCard notes={notes} onClear={handleClearNotes} />
        <PreferencesCard
          preferences={preferences}
          onChange={handlePreferencesChange}
        />
      </div>
      <div className="min-h-0 border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-800">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}
