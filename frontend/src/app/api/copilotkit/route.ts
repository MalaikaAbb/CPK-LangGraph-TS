import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

import {
  AGENT_IDS,
  A2UI_FIXED_AGENT_ID,
  LANGGRAPH_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

// The Quickstart's runtime, widened from one graph to the whole registry.
//
// The doc registers exactly one agent —
// `sample_agent: new LangGraphAgent({ deploymentUrl, graphId, langsmithApiKey })`
// — because its example project has one graph. This harness has one graph per
// doc route, so every id in `backend/langgraph.json` gets its own
// `LangGraphAgent` pointed at the same deployment with a different `graphId`.
// That is the whole difference: one server, many graphs, one agent entry each.
//
// On the two agent classes the Quickstart offers: `LangGraphAgent`
// (deploymentUrl + graphId) is the LangSmith / LangGraph-server tab, and it is
// the right one for a TypeScript LangGraph project run by `langgraphjs dev`.
// `LangGraphHttpAgent` (url) is the FastAPI tab — for a graph you expose
// yourself over AG-UI, which is a Python-side pattern.
const serviceAdapter = new ExperimentalEmptyAdapter();

const agents = Object.fromEntries(
  AGENT_IDS.map((graphId) => [
    graphId,
    new LangGraphAgent({
      deploymentUrl: LANGGRAPH_URL,
      graphId,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  ]),
);

const runtime = new CopilotRuntime({
  agents,
  // A2UI, scoped to the fixed-schema graph with tool injection off — the
  // runtime block the Fixed Schema page publishes. That graph owns its own
  // `display_flight` tool and returns the operations container itself, so
  // injecting `generate_a2ui` alongside it would give the model two ways to
  // draw the same card. The middleware still detects the operations and
  // renders the surface.
  //
  // The dynamic-schema route deliberately does not go through this runtime —
  // it has its own at /api/copilotkit-declarative-gen-ui, where the catalog on
  // the provider is what turns A2UI on and injects the tool.
  a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
