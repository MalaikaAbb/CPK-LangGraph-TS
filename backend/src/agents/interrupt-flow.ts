/**
 * `/human-in-the-loop/interrupt-flow` — the graph-enforced pause.
 *
 * This is the half of human-in-the-loop that has no equivalent on
 * tool-calling-only integrations: LangGraph's own `interrupt(...)` suspends
 * the run mid-node. The client receives the payload as an `on_interrupt`
 * custom event, renders whatever it likes, and resumes with
 * `copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })`
 * — which `useInterrupt` does for you.
 *
 * The node body is the Interrupts page's TypeScript tab. Two interrupts are
 * wired rather than one so the page can also demonstrate the `enabled`
 * predicate the doc's "Condition UI executions" section describes: each
 * interrupt carries a `type`, and the frontend registers one `useInterrupt`
 * per type.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  interrupt,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region state
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  agentName: Annotation<string>,
  approval: Annotation<unknown>,
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

//#region node
async function chatNode(state: AgentState, config: RunnableConfig) {
  // Interrupt #1 — the graph decides it needs a name before it will talk.
  // `interrupt` throws a GraphInterrupt the first time through; on resume the
  // checkpointer replays the node and `interrupt` returns the user's answer.
  const agentName =
    state.agentName ??
    interrupt({
      type: "ask",
      content: "Before we start, what would you like to call me?",
    });

  // Interrupt #2 — a deterministic approval gate, asked once per thread.
  const approval =
    state.approval ??
    interrupt({
      type: "approval",
      content: `Ready to continue as "${agentName}"?`,
    });

  const model = chatModel({ temperature: 0.3 });

  const systemMessage = new SystemMessage({
    content:
      `You are a helpful assistant named ${agentName}. The user ` +
      `${approval === false ? "declined" : "approved"} the check-in gate; ` +
      "acknowledge that once, briefly, then help them.",
  });

  const response = await model.invoke([systemMessage, ...state.messages], config);

  return {
    messages: response,
    agentName,
    approval,
  };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
