"use client";

import React from "react";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useAgenticChatSuggestions } from "./suggestions";

export default function AgenticChatDemo() {
  return (
    
      <Chat />
    
  );
}

function Chat() {
  useAgenticChatSuggestions();
  return <CopilotChat agentId="agentic_chat" />;
}