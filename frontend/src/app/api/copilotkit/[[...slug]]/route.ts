import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import {
  AGENT_IDS,
  A2UI_FIXED_AGENT_ID,
  LANGGRAPH_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";
import { buildRuntime } from "@/lib/copilot-runtime";

/**
 * The Quickstart's runtime, widened from one graph to the whole registry.
 *
 * The doc registers exactly one agent —
 * `sample_agent: new LangGraphAgent({ deploymentUrl, graphId, langsmithApiKey })`
 * — because its example project has one graph. This harness has one graph per
 * doc route, so every id in `backend/langgraph.json` gets its own
 * `LangGraphAgent` pointed at the same deployment with a different `graphId`.
 * That is the whole difference: one server, many graphs, one agent entry each.
 *
 * On the two agent classes the Quickstart offers: `LangGraphAgent`
 * (deploymentUrl + graphId) is the LangSmith / LangGraph-server tab, and it is
 * the right one for a TypeScript LangGraph project run by `langgraphjs dev`.
 * `LangGraphHttpAgent` (url) is the FastAPI tab — for a graph you expose
 * yourself over AG-UI, which is a Python-side pattern.
 *
 * Three things moved when the doc switched to the v2 runtime surface, and all
 * three are load-bearing:
 *
 *   - The import is `@copilotkit/runtime/v2`, not `@copilotkit/runtime`. There
 *     is no `serviceAdapter` on this surface — `ExperimentalEmptyAdapter`
 *     belonged to the v1 GraphQL runtime and has no counterpart here.
 *   - `createCopilotRuntimeHandler` returns a plain fetch handler rather than a
 *     `{ handleRequest }` wrapper, so the route is just the verb exports below.
 *   - The file lives at `[[...slug]]/route.ts`, not `route.ts`. The handler
 *     serves a subtree — `/info`, agent runs, thread list/rename/delete — so a
 *     single-segment route 404s everything except the bare URL while `/info`
 *     keeps answering 200. The app looks connected and never replies, which is
 *     the failure mode worth knowing: it produces no error anywhere.
 *
 * Intelligence, the license token and `identifyUser` are not here. They live in
 * `lib/copilot-runtime.ts`, shared with the voice and declarative-gen-ui
 * endpoints so all three agree on the mode and on who the user is — otherwise
 * threads created through one endpoint would be invisible to another.
 */
const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime({
    agents: Object.fromEntries(
      AGENT_IDS.map((graphId) => [
        graphId,
        new LangGraphAgent({
          deploymentUrl: LANGGRAPH_URL,
          graphId,
          langsmithApiKey: LANGSMITH_API_KEY,
        }),
      ]),
    ),
    // A2UI, scoped to the fixed-schema graph with tool injection off — the
    // runtime block the Fixed Schema page publishes. That graph owns its own
    // `display_flight` tool and returns the operations container itself, so
    // injecting `generate_a2ui` alongside it would give the model two ways to
    // draw the same card. The middleware still detects the operations and
    // renders the surface.
    //
    // `a2ui` sits on the options shared by both runtime modes, so it survived
    // the v1 → v2 move unchanged. The dynamic-schema route deliberately does
    // not come through here — it has its own endpoint where the catalog on the
    // provider is what turns A2UI on and injects the tool.
    a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] },
  }),
  basePath: "/api/copilotkit",
});

// Four verbs, not the doc's two. The Quickstart exports GET and POST because
// its app has no thread UI; PATCH and DELETE are how threads are renamed,
// archived and deleted, which the three Rich Threads routes need.
export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as DELETE,
};
