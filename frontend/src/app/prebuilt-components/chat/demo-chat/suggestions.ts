import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export function useAgenticChatSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Write a sonnet",
        message: "Write a short sonnet about AI.",
      },
      {
        title: "Tell me a joke",
        message: "Tell me a one-line joke.",
      },
      {
        title: "Is 17 prime?",
        message: "Explain whether 17 is a prime number.",
      },
    ],
    available: "always",
  });
}