"use client";

import React from "react";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Explain this demo",
        message: "Explain how this CopilotKit popup works.",
      },
      {
        title: "Help me code",
        message: "Help me write a simple React component.",
      },
      {
        title: "Summarize",
        message: "Summarize the main features of this demo.",
      },
    ],
    available: "always",
  });

  return null;
}