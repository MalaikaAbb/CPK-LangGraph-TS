import { StateSchema, StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { CopilotKitStateSchema } from "@copilotkit/sdk-js/langgraph";
// #region inject-context
// Verbatim from https://docs.copilotkit.ai/langgraph-typescript/agent-app-context?impl=graph
// ("agent-js/src/agent.ts"). The three imports above are the ones the page's
// previous step ("Inherit from CopilotKitState") and the code itself rely on
// but this block does not repeat.
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

// add the agent state definition from the previous step
export const AgentStateSchema = new StateSchema({
  // ... Your defined state properties
  ...CopilotKitStateSchema.fields,
});
export type AgentState = typeof AgentStateSchema.State;

async function chat_node(state: AgentState, config: RunnableConfig) {
  // Extract the colleagues from CopilotKit context
  const copilotKitContext = state.copilotkit.context
  const colleaguesContextItem = copilotKitContext.find(contextItem => contextItem.description === "The current user's colleagues")

  // The value is a JSON string, so parse it to read the fields
  const colleagues = colleaguesContextItem ? JSON.parse(colleaguesContextItem.value) : [];

  // Now each entry is an object, so colleague.name works
  // @ts-expect-error doc bug (README §9 item 3): `c` is untyped because JSON.parse returns any — implicit any under strict
  const colleagueList = colleagues.map((c) => `${c.name} (${c.role})`).join(", ");

  // Provide the list of colleagues to the LLM
  const systemMessage = new SystemMessage({
    content: `
      You are a helpful assistant that can help emailing colleagues.
      The user's colleagues are: ${colleagueList}
    `,
  });

  const response = await new ChatOpenAI({ modelKwargs: { reasoning_effort: "none" }, model: "gpt-6-luna" }).invoke(
    [systemMessage, ...state.messages],
    config
  );

  return {
    ...state,
    messages: response,
  };
}
// #endregion

/**
 * Graph (repo-authored wiring; the page's block ends at the node).
 */
export const agentAppContextGraph = new StateGraph(AgentStateSchema)
  .addNode("chat_node", chat_node)
  .addEdge("__start__", "chat_node")
  .addEdge("chat_node", "__end__")
  .compile();
