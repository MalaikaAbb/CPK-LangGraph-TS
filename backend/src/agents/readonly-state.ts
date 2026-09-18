import { StateSchema, StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { CopilotKitStateSchema } from "@copilotkit/sdk-js/langgraph";

/**
 * Agent state
 *
 * Inherits the CopilotKit state properties,
 * including copilotkit.context and messages.
 */
export const AgentStateSchema = new StateSchema({
  ...CopilotKitStateSchema.fields,
});

export type AgentState = typeof AgentStateSchema.State;

/**
 * Chat node
 */
async function chat_node(
  state: AgentState,
  config: RunnableConfig,
) {
  // Get CopilotKit context
  const copilotKitContext = state.copilotkit.context;

  // Find the colleagues context item
  const colleaguesContextItem = copilotKitContext.find(
    (contextItem) =>
      contextItem.description ===
      "The current user's colleagues",
  );

  // The context value is a JSON string,
  // so parse it before using it.
  const colleagues = colleaguesContextItem
    ? JSON.parse(colleaguesContextItem.value)
    : [];

  // Convert colleagues into a readable list
  const colleagueList = colleagues
    .map(
      (c: { name: string; role: string }) =>
        `${c.name} (${c.role})`,
    )
    .join(", ");

  // Give the colleagues information to the LLM
  const systemMessage = new SystemMessage({
    content: `
You are a helpful assistant that can help emailing colleagues.

The user's colleagues are:
${colleagueList}
    `
  });

  // Call the model
  const response = await new ChatOpenAI({
    model: "gpt-5.4",
  }).invoke(
    [systemMessage, ...state.messages],
    config
  );

  // Return updated state
  return {
    ...state,
    messages: response,
  };
}

/**
 * Graph
 */
export const agentAppContextGraph = new StateGraph(AgentStateSchema)
  .addNode("chat_node", chat_node)
  .addEdge("__start__", "chat_node")
  .addEdge("chat_node", "__end__")
  .compile();
