"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <main>
      <CopilotSidebar
        agentId="configurable"
        labels={{
          modalHeaderTitle: "Your Assistant",
          welcomeMessageText: "Hi! How can I help you today?",
        }}
      />
      <h1>Your App</h1>
    </main>
  );
}

