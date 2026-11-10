"use client";

// #region doc
// Verbatim from https://docs.copilotkit.ai/langgraph-typescript/custom-look-and-feel/slots#tool-calls
// ("page.tsx", added upstream in doc-sync 2026-11-09).
import {
  CopilotChat,
  CopilotChatToolCallsView,
  type CopilotChatToolCallsViewProps,
} from "@copilotkit/react-core/v2";

const CustomToolCallsView = (props: CopilotChatToolCallsViewProps) => (
  <div className="rounded-lg border border-dashed p-2">
    <CopilotChatToolCallsView {...props} />
  </div>
);

export function Chat() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: { toolCallsView: CustomToolCallsView },
      }}
    />
  );
}
// #endregion
