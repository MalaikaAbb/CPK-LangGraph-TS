import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

import {
  A2UI_DYNAMIC_AGENT_ID,
  LANGGRAPH_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

/**
 * A second runtime for the dynamic-schema A2UI route.
 *
 * The two A2UI flavours want opposite settings for the same flag. Fixed schema
 * needs `injectA2UITool: false` (the graph owns `display_flight` and must be
 * the only thing drawing the card); dynamic schema needs the tool injected,
 * because the whole point is that a secondary LLM designs the surface from the
 * catalog the provider hands it.
 *
 * `injectA2UITool` is set per-runtime, not per-agent, so the two cannot share
 * one endpoint. This route is the dynamic half; `/api/copilotkit` is the rest
 * of the app.
 *
 * Note what is deliberately absent: any `a2ui` block. The Dynamic Schema page
 * is explicit that passing a catalog on the provider is the entire setup —
 * "the catalog auto-enables A2UI and injects the `generate_a2ui` tool, so the
 * runtime needs no `a2ui` block."
 *
 * An earlier version set `a2ui: { injectA2UITool: true }` here as belt and
 * braces. Removed to match the documented path — the catalog already does it,
 * and a second injection is at best redundant. (It was briefly suspected of
 * causing the sub-agent to invent component names; it was not. That turned out
 * to be the agent's own system prompt naming components in prose. See
 * `backend/src/agents/declarative-gen-ui.ts`.)
 */
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    [A2UI_DYNAMIC_AGENT_ID]: new LangGraphAgent({
      deploymentUrl: LANGGRAPH_URL,
      graphId: A2UI_DYNAMIC_AGENT_ID,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  },
  a2ui: {
    injectA2UITool: true,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-declarative-gen-ui",
  });

  return handleRequest(req);
};
