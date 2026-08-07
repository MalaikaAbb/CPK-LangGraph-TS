"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { DEFAULT_SLOTS } from "../slots";
import { TimePickerCard } from "../time-picker-card";

const AGENT_ID = "hitl-in-chat";

export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop" subtitle={`agent: ${AGENT_ID}`}>
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message:
          "Please book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  // The generic is supplied explicitly. Without it `useHumanInTheLoop` falls
  // back to Record<string, unknown>, so `args.topic` would be `unknown` and
  // unusable in JSX — unlike useRenderTool, it does not infer from
  // `parameters`. See README §9.
  useHumanInTheLoop<{ topic: string; attendee: string }>({
    agentId: AGENT_ID,
    name: "book_call",
    description:
      "Ask the user to pick a time slot for a call. The picker UI presents fixed candidate slots; the user's choice is returned to the agent.",
    parameters: z.object({
      topic: z
        .string()
        .describe("What the call is about (e.g. 'Intro with sales')"),
      attendee: z
        .string()
        .describe("Who the call is with (e.g. 'Alice from Sales')"),
    }),
    // No `status` prop: the card gates its own buttons on the pick/cancel it
    // has already recorded, so it cannot double-resolve the tool call even
    // before `status` catches up.
    render: ({ args, respond }) => (
      <TimePickerCard
        topic={args?.topic ?? "a call"}
        attendee={args?.attendee}
        slots={DEFAULT_SLOTS}
        onSubmit={(result) => respond?.(result)}
      />
    ),
  });

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
