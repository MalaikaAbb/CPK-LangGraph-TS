"use client";

import {
  CopilotChat,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useEffect, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "configurable";

/**
 * `forwardedProps.config.configurable` is the whole subject of this route.
 *
 * The doc's warning is the reason this page has a button instead of an effect:
 * calling `runAgent` in the component body runs it on every render and trips
 * "thread is already processing". Its own fix is a `useEffect` with an empty
 * dependency array *or* an event handler — an event handler is the honest
 * choice here, because the point of the route is to change the config and
 * re-run to see the difference.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/configurable" subtitle={`agent: ${AGENT_ID}`}>
      <Layout />
    </DemoFrame>
  );
}

const LOCALES = ["en-GB", "es-ES", "ja-JP"] as const;

function Layout() {
  const { agent } = useAgent({ agentId: AGENT_ID });
  const { copilotkit } = useCopilotKit();

  const [authToken, setAuthToken] = useState("example-token");
  const [sending, setSending] = useState(false);

   useEffect(() => {
    agent.runAgent({
      forwardedProps: {
        config: {
          configurable: {
            authToken: authToken,
          },
          recursion_limit: 50,
        }
      }
    });
  }, []);
  

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[24rem_1fr]">
      <aside className="min-h-0 overflow-y-auto border-b border-slate-200 p-6 lg:border-b-0 lg:border-r dark:border-slate-800">
        <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          config.configurable
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sent per run. Never part of agent state, so it is never checkpointed
          and never comes back.
        </p>

        <div className="mt-4 space-y-3">
          <Field label="authToken" value={authToken} onChange={setAuthToken} />
          <label className="block">
            <span className="font-mono text-xs text-slate-500">locale</span>
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Change a value and press again — the reply changes, but nothing in{" "}
          <code>agent.state</code> does.
        </p>
      </aside>

      <div className="min-h-0">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}
