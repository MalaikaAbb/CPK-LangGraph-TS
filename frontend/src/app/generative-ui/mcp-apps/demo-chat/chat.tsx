"use client";

// The Code tab's page imports `./chat` without showing it. Minimal stand-in
// adapted from the CopilotKit showcase (its suggestion chips left out):
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/mcp-apps/chat.tsx

import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="mcp-apps" className="h-full rounded-2xl" />;
}
