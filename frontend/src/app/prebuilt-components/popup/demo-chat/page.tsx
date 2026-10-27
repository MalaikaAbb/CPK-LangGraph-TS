"use client";


import {CopilotPopup } from "@copilotkit/react-core/v2";
import { MainContent } from "./main-content";
import { Suggestions } from "./suggestions-mount";

export default function PrebuiltPopupDemo() {
  return (
    <>
      <MainContent />
      <CopilotPopup
        agentId="prebuilt-popup"
        defaultOpen={true}
        labels={{
          chatInputPlaceholder: "Ask the popup anything...",
        }}
      />
      <Suggestions />
    </>
  );
}