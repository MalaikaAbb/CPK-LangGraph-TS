"use client";

import {
  CopilotChat,
  CopilotChatAssistantMessage,
} from "@copilotkit/react-core/v2";
import { JsonRenderAssistantMessage } from "./json-render-renderer";
// Harness change: the Code tab's suggestion chips (./suggestions) are demo-only and not copied.
// doc: import { useByocJsonRenderSuggestions } from "./suggestions";

export const AGENT_ID = "byoc_json_render";

export function Chat() {
  // doc: useByocJsonRenderSuggestions();

  return (
    <CopilotChat
      agentId={AGENT_ID}
      className="h-full rounded-2xl"
      messageView={{
        assistantMessage:
          JsonRenderAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
      }}
    />
  );
}