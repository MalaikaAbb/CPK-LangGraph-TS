
"use client";

import { CopilotSidebar, useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

function AgentTrigger({ agentId }: { agentId: string }) {
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();

  const run = async () => {
    if (agent.isRunning) return;

    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: "Summarize the latest sales data",
    });

    try {
      await copilotkit.runAgent({ agent });
    } catch (error) {
      console.error("CopilotKit runAgent failed:", error);
    }
  };

  const stop = () => {
    copilotkit.stopAgent({ agent });
  };

  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
      <button
        onClick={run}
        disabled={agent.isRunning}
        style={{
          padding: "10px 16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: agent.isRunning ? "not-allowed" : "pointer",
        }}
      >
        {agent.isRunning ? "Running..." : "Run agent"}
      </button>

      <button
        onClick={stop}
        disabled={!agent.isRunning}
        style={{
          padding: "10px 16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          cursor: !agent.isRunning ? "not-allowed" : "pointer",
        }}
      >
        Stop
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <CopilotSidebar
        agentId="programmatic-control"
        labels={{
          modalHeaderTitle: "Your Assistant",
          welcomeMessageText: "Hi! How can I help you today?",
        }}
      />

      <h1>Your App</h1>

      <AgentTrigger agentId="programmatic-control" />
    </main>
  );
}