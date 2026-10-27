"use client";

import { useState } from "react";
import {
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";

type FeedbackItem = {
  messageId: string;
  value: "up" | "down";
};

type FeedbackEvent = {
  messageId: string;
  value: "up" | "down";
};

const analytics = {
  track: (eventName: string, data: FeedbackEvent) => {
    console.log(`[Analytics] ${eventName}`, data);
  },
};

function ChatControls({
  chatOpen,
  setChatOpen,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
}) {
  const config = useCopilotChatConfiguration();

  const toggleChat = () => {
    const nextOpen = !(config?.isModalOpen ?? chatOpen);

    if (config?.setModalOpen) {
      config.setModalOpen(nextOpen);
    }

    setChatOpen(nextOpen);
  };

  return (
    <div style={{ marginTop: "28px" }}>
      <button
        type="button"
        onClick={toggleChat}
        aria-expanded={config?.isModalOpen ?? chatOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "14px 24px",
          border: "none",
          borderRadius: "12px",
          background:
            (config?.isModalOpen ?? chatOpen) ? "#dc2626" : "#2563eb",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 650,
          cursor: "pointer",
          boxShadow: "0 5px 14px rgba(37,99,235,0.18)",
          transition: "background 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span aria-hidden="true">
          {(config?.isModalOpen ?? chatOpen) ? "✕" : "✦"}
        </span>

        {(config?.isModalOpen ?? chatOpen) ? "Close chat" : "Open chat"}

        <span aria-hidden="true">
          {(config?.isModalOpen ?? chatOpen) ? "−" : "→"}
        </span>
      </button>
    </div>
  );
}

export default function PrebuiltSidebarDemo() {
  const [chatOpen, setChatOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem | null>(null);

  const handleFeedback = (
    messageId: string,
    value: "up" | "down",
  ) => {
    setFeedback({ messageId, value });
  };

  return (
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
          }}
        >
          <span aria-hidden="true">✦</span>
          AI ASSISTANT
        </div>

        <h1
          style={{
            margin: "20px 0 12px",
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
            margin: "0",
            color: "#64748b",
            fontSize: "16px",
            lineHeight: 1.7,
          }}
        >
          Get answers, explore ideas, and work smarter with your
          personal AI assistant.
        </p>

        <ChatControls
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
        />

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
                borderRadius: "6px",
                padding: "6px 10px",
                background: "transparent",
                color: "#166534",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {[
            {
              icon: "💬",
              title: "Ask anything",
              description:
                "Ask questions and get help from your AI assistant.",
            },
            {
              icon: "💡",
              title: "Explore ideas",
              description:
                "Brainstorm, learn new things, and solve problems.",
            },
            {
              icon: "👍",
              title: "Share feedback",
              description:
                "Rate assistant responses to share your feedback.",
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                padding: "22px",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "42px",
                  height: "42px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  background: "#eff6ff",
                  fontSize: "21px",
                }}
              >
                {item.icon}
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </p>
            </article>
          ))}
        </section>
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
  );
}