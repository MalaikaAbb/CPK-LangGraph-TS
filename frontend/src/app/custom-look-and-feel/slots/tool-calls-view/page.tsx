"use client";

import { CopilotChatConfigurationProvider } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { Chat } from "./chat";

/**
 * Harness glue: the page's `<Chat />` passes no `agentId`, so it would talk to
 * the provider's default agent. This harness has no agent with that id, so the
 * configuration provider points the unchanged snippet at the `tool-rendering`
 * graph, which calls `get_weather` and therefore produces tool calls for the
 * slot to wrap.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/slots"
      subtitle="toolCallsView slot · agent: tool-rendering"
    >
      <CopilotChatConfigurationProvider agentId="tool-rendering">
        <div className="h-full">
          <Chat />
        </div>
      </CopilotChatConfigurationProvider>
    </DemoFrame>
  );
}
