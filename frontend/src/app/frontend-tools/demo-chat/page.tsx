"use client";

import { DemoFrame } from "@/components/demo-frame";

import { BackgroundChat } from "../background-chat";

const AGENT_ID = "frontend_tools";

/** The model-driven graph: the model decides to call `change_background`. */
export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle={`agent: ${AGENT_ID}`}>
      <BackgroundChat agentId={AGENT_ID} />
    </DemoFrame>
  );
}
