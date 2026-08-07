"use client";

import {
  CopilotChat,
  CopilotChatReasoningMessage,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ReasoningBlock } from "../reasoning-block";

const AGENT_ID = "reasoning-custom";

/**
 * The whole reasoning card replaced, rather than its sub-slots.
 *
 * Passing a component to `messageView.reasoningMessage` — instead of a
 * `{ header, contentView, toggle }` object — hands over the entire card,
 * including its collapse behaviour. `ReasoningBlock` deliberately does not
 * collapse: the thinking chain is the point of this route.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/generative-ui/reasoning" subtitle={`agent: ${AGENT_ID}`}>
      <CopilotChat
        agentId={AGENT_ID}
        className="h-full"
        messageView={{
          reasoningMessage:
            ReasoningBlock as unknown as typeof CopilotChatReasoningMessage,
        }}
      />
    </DemoFrame>
  );
}
