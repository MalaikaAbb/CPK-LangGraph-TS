"use client";

import {
  CopilotChatToolCallsView,
  useAgent,
  useComponent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { BarChart, barChartPropsSchema } from "../bar-chart";

const AGENT_ID = "gen-ui-tool-based";

/**
 * "Rendering in a headless chat" (Components as Tools, doc-sync 2026-11-09).
 *
 * Same `render_bar_chart` registration as the main demo, but the message list
 * is hand-rolled, so nothing paints the tool call unless we do. The page's
 * one-liner — `<CopilotChatToolCallsView message={assistantMessage}
 * messages={allMessages} />` — is used verbatim apart from binding its two
 * free names; the list, bubbles and composer are this repo's.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-based"
      subtitle={`headless · agent: ${AGENT_ID}`}
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
    agentId: AGENT_ID,
  });

  const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");
  const allMessages = agent.messages;

  const send = () => {
    const text = input.trim();
    if (!text || agent.isRunning) return;
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: text });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      console.error("[langgraph-typescript:tool-based/headless] runAgent failed", err);
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-6 text-sm">
        {allMessages.map((m) => {
          if (m.role === "user") {
            return (
              <p key={m.id} className="text-right">
                {typeof m.content === "string" ? m.content : ""}
              </p>
            );
          }
          if (m.role !== "assistant") return null;
          const assistantMessage = m;
          return (
            <div key={m.id} className="space-y-2">
              {typeof m.content === "string" && m.content && <p>{m.content}</p>}
              {/* #region doc */}
              <CopilotChatToolCallsView message={assistantMessage} messages={allMessages} />
              {/* #endregion */}
            </div>
          );
        })}
        {agent.isRunning && <p className="text-xs text-slate-400">Thinking…</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a bar chart…"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={agent.isRunning || !input.trim()}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
