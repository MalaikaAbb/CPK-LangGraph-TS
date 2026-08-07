/**
 * `/shared-state/predictive-state-updates` — the custom-graph tab's
 * **manual emission** sub-variant
 * (`?agent-type=custom-graph&state-emission=manual-emission`).
 *
 * The other two variants let something else decide when state goes out: the
 * tool-emission graph maps a streaming tool argument with
 * `copilotkitCustomizeConfig`, and the prebuilt one declares the same mapping
 * as middleware. Here the node simply calls `copilotkitEmitState` whenever it
 * wants the UI to see something, which is the escape hatch when progress is
 * not attached to a tool call at all — a loop over files, a polling wait, a
 * multi-phase computation.
 *
 * The page's own framing: "For long-running tasks, you can emit state updates
 * progressively as predictions of the final state." Its example simulates that
 * with a fixed list and a one-second delay, and that is what runs below.
 *
 * Two things about the published snippet, both left as-is:
 *
 *  1. It is a fragment. Everything outside the emit loop — the state, the
 *     model call, the return — is elided behind `// ...`, so the surrounding
 *     node here is this repo's.
 *  2. It does not `await` the emit. `copilotkitEmitState` is an
 *     `AsyncFunction`, the SDK's own docstring writes
 *     `await copilotkitEmitState(config, { progress: i })`, and the Python tab
 *     on the same page writes `await copilotkit_emit_state(...)`. Only the
 *     TypeScript tab drops it. It happens to work because the `setTimeout`
 *     right after gives the promise time to settle, but it is a floating
 *     promise. See README §9.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import {
  Annotation,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import {
  copilotkitEmitState,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  observed_steps: Annotation<string[]>,
});

type AgentState = typeof AgentStateAnnotation.State;

//#region manual
async function chatNode(state: AgentState, config: RunnableConfig) {
  // Simulate executing steps one by one
  const steps = [
    "Analyzing input data...",
    "Identifying key patterns...",
    "Generating recommendations...",
    "Formatting final output...",
  ];

  for (const step of steps) {
    state.observed_steps = [...(state.observed_steps ?? []), step];
    copilotkitEmitState(config, state);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Not the doc's — the page elides everything around the loop behind `// ...`.
  // The model call gives the run something to say once the simulated work is
  // done, and returning `observed_steps` is what makes the emitted values
  // survive the checkpoint: a node's returned state is the source of truth
  // when it finishes, so without this the list would vanish at the end.
  const model = chatModel({ temperature: 0.3 });
  const response = await model.invoke(
    [
      new SystemMessage({
        content:
          "You are a task performer. You have just completed a simulated " +
          "four-step process. Summarise what you did in one short sentence.",
      }),
      ...state.messages,
    ],
    config,
  );

  return { messages: response, observed_steps: state.observed_steps };
}
//#endregion

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
