"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "reasoning-default";

/**
 * The reasoning card, default and sub-slotted, side by side.
 *
 * The default needs no configuration at all: if the model emits reasoning
 * tokens, the card appears. The sub-slot variant replaces only the header and
 * the content area, leaving the toggle animation and the card's own
 * open/collapse logic in place — which is the distinction between this page
 * and Generative UI › Reasoning, where the whole component is swapped.
 */
export default function Page() {
  const [custom, setCustom] = useState(false);

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/reasoning-messages"
      subtitle={`agent: ${AGENT_ID}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          {(["default", "sub-slots"] as const).map((mode) => {
            const active = (mode === "sub-slots") === custom;
            return (
              <button
                key={mode}
                onClick={() => setCustom(mode === "sub-slots")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {mode}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500">
            Ask something that needs working out
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <CopilotChat
            // Remounting on toggle keeps the two variants from sharing a
            // half-rendered card mid-stream.
            key={custom ? "custom" : "default"}
            agentId={AGENT_ID}
            className="h-full"
             messageView={{
              // Both sub-slots the page documents. Replacing them individually
              // keeps the built-in card's expand/collapse behaviour — that is
              // the difference between this and the whole-component override
              // on the Generative UI → Reasoning route.
              reasoningMessage: {
                header: CustomHeader,
                contentView: CustomContent,
              },
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}

/** Replaces the clickable bar: icon, label, and the expand affordance. */
function CustomHeader({
  isOpen,
  label,
  hasContent,
  isStreaming,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  label?: string;
  hasContent?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium"
      {...props}
    >
      {isStreaming ? "🧠" : "💡"}
      <span>{label}</span>
      {hasContent && (
        <span className="ml-auto text-xs">{isOpen ? "Hide" : "Show"}</span>
      )}
    </button>
  );
}

/** Replaces the reasoning text area, with a blinking cursor while streaming. */
function CustomContent({
  isStreaming,
  hasContent,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
  hasContent?: boolean;
}) {
  if (!hasContent && !isStreaming) return null;

  return (
    <div className="px-4 pb-3 font-mono text-sm text-gray-500" {...props}>
      {children}
      {isStreaming && <span className="ml-1 animate-pulse">▊</span>}
    </div>
  );
}
