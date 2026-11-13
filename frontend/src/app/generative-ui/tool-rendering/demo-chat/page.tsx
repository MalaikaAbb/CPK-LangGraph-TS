"use client";

import {
  CopilotChat,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomCatchallRenderer,
  WeatherCard,
  parseJsonResult,
} from "../weather-card";

const AGENT_ID = "tool-rendering";

interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <Chat />
    </DemoFrame>
  );
}

// "Grouping tool calls" (doc-sync 2026-11-09): the five values the page lists
// for `messageView.toolCallDisplay`, switchable here instead of hard-coding the
// page's `"line"` example.
const TOOL_CALL_DISPLAYS = ["grouped", "line", "stacked", "turn", "separate"] as const;
type ToolCallDisplay = (typeof TOOL_CALL_DISPLAYS)[number];

function Chat() {
  const [toolCallDisplay, setToolCallDisplay] = useState<ToolCallDisplay>("grouped");
  const [groupCatchall, setGroupCatchall] = useState(false);

  // Named renderer: `name` must equal the tool name the agent exposes — that
  // string is how the runtime routes the call to this component.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({
        location: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={loading}
            location={parameters?.location ?? parsed.city ?? ""}
            temperature={parsed.temperature}
            humidity={parsed.humidity}
            windSpeed={parsed.wind_speed}
            conditions={parsed.conditions}
          />
        );
      },
    },
    [],
  );

  // Wildcard catch-all for anything a named renderer above did not claim.
  // `useDefaultRenderTool` is a convenience wrapper around
  // `useRenderTool({ name: "*", ... })`.
  useDefaultRenderTool(
    {
      render: ({ name, parameters, status, result }) => (
        <CustomCatchallRenderer
          name={name}
          parameters={parameters}
          status={status}
          result={result}
        />
      ),
      // The page's opt-in: `useDefaultRenderTool({ render: MyToolRow, group: true })`.
      // Custom renderers otherwise always show on their own.
      group: groupCatchall,
    },
    [groupCatchall],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
        <label className="flex items-center gap-1.5">
          toolCallDisplay
          <select
            value={toolCallDisplay}
            onChange={(e) => setToolCallDisplay(e.target.value as ToolCallDisplay)}
            className="rounded border border-slate-300 bg-transparent px-1 py-0.5 dark:border-slate-700"
          >
            {TOOL_CALL_DISPLAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={groupCatchall}
            onChange={(e) => setGroupCatchall(e.target.checked)}
          />
          catch-all <code>group: true</code>
        </label>
      </div>
      <div className="min-h-0 flex-1">
        <CopilotChat
          agentId={AGENT_ID}
          className="h-full"
          messageView={{ toolCallDisplay }}
        />
      </div>
    </div>
  );
}
