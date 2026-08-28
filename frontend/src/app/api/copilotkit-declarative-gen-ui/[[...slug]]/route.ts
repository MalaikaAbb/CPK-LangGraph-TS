import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import {
  A2UI_DYNAMIC_AGENT_ID,
  LANGGRAPH_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";
import { buildRuntime } from "@/lib/copilot-runtime";

/**
 * A second runtime for the dynamic-schema A2UI route.
 *
 * The two A2UI flavours want opposite settings for the same flag. Fixed schema
 * needs `injectA2UITool: false` (the graph owns `display_flight` and must be
 * the only thing drawing the card); dynamic schema needs the tool injected,
 * because the whole point is that a secondary LLM designs the surface from the
 * catalog the provider hands it. `injectA2UITool` is per-runtime, so the two
 * cannot share one endpoint.
 *
 * Note the absence of an `a2ui` block. The Dynamic Schema page is explicit that
 * passing a catalog on the provider is the entire setup — the catalog
 * auto-enables A2UI and injects `generate_a2ui`, so the runtime needs none.
 *
 * Moved to the v2 catch-all alongside the main route, and it shares
 * `buildRuntime` — so Intelligence and per-user threads are wired the same way
 * here as on the main endpoint.
 */
const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime({
    agents: {
      [A2UI_DYNAMIC_AGENT_ID]: new LangGraphAgent({
        deploymentUrl: LANGGRAPH_URL,
        graphId: A2UI_DYNAMIC_AGENT_ID,
        langsmithApiKey: LANGSMITH_API_KEY,
      }),
    },
  }),
  basePath: "/api/copilotkit-declarative-gen-ui",
});

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as DELETE,
};
