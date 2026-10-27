"use client";


import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export function useReasoningCustomSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Show Resoning",
        message: "Explain step by step why the sky appears blue during the day but red at sunset.",
      },
      
    ],
    available: "always",
  });

  
}