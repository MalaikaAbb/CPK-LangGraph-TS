/**
 * Configurable — https://docs.copilotkit.ai/langgraph-typescript/configurable
 *
 * The page (rewritten upstream, doc-sync 2026-11-09) no longer shows a
 * browser → `forwardedProps.config.configurable` flow. Its TypeScript tab says
 * graph execution settings belong to the trusted backend that invokes or
 * serves the graph: application values go in `context`, `recursionLimit` is a
 * top-level execution setting. It publishes one fragment (the `doc-snippet`
 * region below) and links LangGraph's runtime-configuration guide for "the
 * matching context schema and node signature", which it does not print.
 *
 * So everything outside `doc-snippet` is repo-authored, following LangGraph's
 * guide (contextSchema as the second `StateGraph` argument, node reads
 * `config.context`). See README §9 "Configurable publishes only an invoke
 * fragment".
 */
import { SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  StateGraph,
  type LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region context-schema
// Repo-authored (LangGraph runtime-configuration guide, not the CopilotKit
// page): the keys a trusted backend may put in `context`.
export const ConfigurableContext = Annotation.Root({
  tenantId: Annotation<string>,
});
type ConfigurableContextType = typeof ConfigurableContext.State;

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});
type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region node
// Repo-authored: reads the validated value from the runtime context the server
// supplied, then answers so the value is observable in chat.
async function agentNode(
  state: AgentState,
  config: LangGraphRunnableConfig<ConfigurableContextType>,
) {
  const tenantId = config.context?.tenantId ?? null;
  const recursionLimit = config.recursionLimit ?? null;

  const system = new SystemMessage({
    content:
      "You are a helpful assistant. The trusted server resolved this run's " +
      `tenant as ${JSON.stringify(tenantId)} and set recursionLimit to ` +
      `${JSON.stringify(recursionLimit)}. When asked what configuration or ` +
      "tenant you received, report these two values exactly.",
  });

  const response = await chatModel().invoke(
    [system, ...state.messages],
    config,
  );
  return { messages: [response] };
}
//#endregion

export const graph = new StateGraph(AgentStateAnnotation, ConfigurableContext)
  .addNode("agent_node", agentNode)
  .addEdge("__start__", "agent_node")
  .addEdge("agent_node", "__end__")
  .compile();

//#region doc-snippet
/**
 * The page's TypeScript block ("agent.ts"), verbatim inside a function so the
 * free names it uses (`graph`, `input`, `verifiedTenantId`) are bound. This is
 * the direct-invoke form; in this harness the graph is served by
 * `langgraphjs dev`, so the runtime route sets the same two values through
 * `LangGraphAgent`'s `assistantConfig` instead (see
 * `frontend/src/app/api/copilotkit/[[...slug]]/route.ts`).
 */
export async function invokeWithTrustedContext(
  input: Parameters<typeof graph.invoke>[0],
  verifiedTenantId: string,
) {
  const result = await graph.invoke(input, {
    context: { tenantId: verifiedTenantId },
    recursionLimit: 50,
  });
  return result;
}
//#endregion
