
"use client";

import { useAgentContext } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { useState } from "react";

export default function Page() {
  // Create colleagues state with sample data
  const [colleagues, setColleagues] = useState([
    { id: 1, name: "John Doe", role: "Developer" },
    { id: 2, name: "Jane Smith", role: "Designer" },
    { id: 3, name: "Bob Wilson", role: "Product Manager" },
  ]);

  // Share colleagues context with the agent
  useAgentContext({
    description: "The current user's colleagues",
    value: colleagues,
  });

  return (
    <main>
      <CopilotSidebar
        agentId="agent-app-context"
        labels={{
          modalHeaderTitle: "Your Assistant",
          welcomeMessageText: "Hi! How can I help you today?",
        }}
      />

      <h1>Your App</h1>

      <div>
        <h2>Colleagues</h2>

        {colleagues.map((colleague) => (
          <div key={colleague.id}>
            <strong>{colleague.name}</strong> - {colleague.role}
          </div>
        ))}
      </div>
    </main>
  );
}
