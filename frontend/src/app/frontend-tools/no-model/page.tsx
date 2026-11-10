"use client";

import { DemoFrame } from "@/components/demo-frame";

import { BackgroundChat } from "../background-chat";

const AGENT_ID = "frontend-tools-no-model";

/**
 * The page's "Call a frontend tool from a node with no model" graph. Any
 * message makes `request_background` emit a `change_background` tool call;
 * the follow-up run (carrying the ToolMessage) is routed to `confirm`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle={`agent: ${AGENT_ID} (no model)`}>
      <BackgroundChat agentId={AGENT_ID} />
    </DemoFrame>
  );
}
