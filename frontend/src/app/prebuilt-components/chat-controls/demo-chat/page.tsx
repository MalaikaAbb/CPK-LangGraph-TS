
"use client";

import React, { useState } from "react";
import {
  CopilotKit,
  CopilotSidebar,
} from "@copilotkit/react-core/v2";

type FeedbackItem = {
  messageId: string;
  value: "up" | "down";
};

type FeedbackEvent = {
  messageId: string;
  value: "up" | "down";
};

// Local analytics implementation.
// Replace this with your analytics provider when needed.
const analytics = {
  track: (eventName: string, data: FeedbackEvent) => {
    console.log(`[Analytics] ${eventName}`, data);
  },
};

export default function PrebuiltSidebarDemo() {
  const [chatOpen, setChatOpen] = useState(false);
  const [feedback, setFeedback] =
    useState<FeedbackItem | null>(null);

  const handleFeedback = (
    messageId: string,
    value: "up" | "down",
  ) => {
    setFeedback({ messageId, value });
  };

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding: "48px 24px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              borderRadius: "999px",
              background: "#dbeafe",
              color: "#1d4ed8",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            <span aria-hidden="true">✦</span>
            AI ASSISTANT
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(30px, 5vw, 44px)",
              fontWeight: 750,
              letterSpacing: "-1.5px",
            }}
          >
            Your AI workspace
          </h1>

          <p
            style={{
              maxWidth: "560px",
              margin: "0 0 28px",
              color: "#64748b",
              fontSize: "16px",
              lineHeight: 1.7,
            }}
          >
            Get answers, explore ideas, and work smarter with your
            personal AI assistant.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "13px 22px",
                border: "1px solid #2563eb",
                borderRadius: "12px",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 650,
                cursor: "pointer",
                boxShadow: "0 5px 14px rgba(37,99,235,0.22)",
              }}
            >
              <span aria-hidden="true">✦</span>
              Ask the assistant
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                padding: "13px 20px",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#334155",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span aria-hidden="true">✕</span>
              Close assistant
            </button>
          </div>

          {feedback && (
            <div
              role="status"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                maxWidth: "560px",
                marginTop: "24px",
                padding: "16px",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                background: "#f0fdf4",
                color: "#166534",
              }}
            >
              <div>
                <div style={{ fontWeight: 650 }}>
                  {feedback.value === "up"
                    ? "👍 Thanks for your feedback!"
                    : "👎 Thanks! We'll use your feedback to improve."}
                </div>
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "13px",
                    overflowWrap: "anywhere",
                  }}
                >
                  Message ID: {feedback.messageId}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFeedback(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#166534",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "6px",
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <CopilotSidebar
          agentId="chat-controls"
          open={chatOpen}
          onOpenChange={setChatOpen}
          labels={{
            modalHeaderTitle: "Sidebar Assistant",
            welcomeMessageText: "How can I help you today?",
          }}
          messageView={{
            assistantMessage: {
              onThumbsUp: (message) => {
                const data: FeedbackEvent = {
                  messageId: message.id,
                  value: "up",
                };

                analytics.track("feedback", data);
                handleFeedback(data.messageId, data.value);
              },

              onThumbsDown: (message) => {
                const data: FeedbackEvent = {
                  messageId: message.id,
                  value: "down",
                };

                analytics.track("feedback", data);
                handleFeedback(data.messageId, data.value);
              },
            },
          }}
        />
      </main>
    </>
  );
}
