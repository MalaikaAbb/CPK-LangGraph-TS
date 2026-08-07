/**
 * `/shared-state/predictive-state-updates` — the page's **prebuilt agent** tab.
 *
 * Same behaviour as the custom-graph version in
 * `predictive-state-updates.ts`, reached a completely different way. There you
 * declare the state, wire `chat_node` and `tool_node`, write `shouldContinue`,
 * and call `copilotkitCustomizeConfig` inside the node. Here `createAgent`
 * builds the loop and two middlewares do the rest:
 *
 * - `copilotkitMiddleware` opens the CopilotKit channel (actions, context)
 *   that `CopilotKitStateAnnotation` opens by hand in the custom graph.
 * - `stateStreamingMiddleware(stateItem({ … }))` is the declarative form of
 *   the `emitIntermediateState` mapping — same three fields, same effect:
 *   forward a tool argument into a state key while it is still streaming.
 *
 * Reproduced from the doc's `agent-type=prebuilt` tab with nothing adapted —
 * including `model: "openai:gpt-5.4"`. That model name is the page's. If your
 * key cannot reach it, this tab fails at the first turn with an OpenAI model
 * error while every other route keeps working; the custom-graph tab beside it
 * is unaffected. Changing it is a one-line edit, deliberately not applied.
 * See README §9.
 *
 * This is also the only file in the repo using the `StateSchema` +
 * `CopilotKitStateSchema.fields` dialect rather than `Annotation.Root` +
 * `CopilotKitStateAnnotation.spec`, because the prebuilt tab is written that
 * way and `createAgent` takes a `stateSchema`, not an annotation.
 */

import { createAgent } from "langchain";
import { copilotkitMiddleware } from "@copilotkit/sdk-js/langgraph";
import {
  stateStreamingMiddleware,
  stateItem,
} from "@copilotkit/sdk-js/langgraph-middlewares";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { StateSchema } from "@langchain/langgraph";
import { CopilotKitStateSchema } from "@copilotkit/sdk-js/langgraph";

//#region prebuilt
export const AgentStateSchema = new StateSchema({
  // @ts-expect-error — the doc's field, as published. `StateSchema` requires a
  // `SerializableSchema`: a `~standard` implementing StandardSchemaV1 *and*
  // StandardJSONSchemaV1. zod 3.25 only implements the first, so a plain zod
  // schema is rejected at the type level by @langchain/langgraph 1.4.9 —
  // despite that package's own docstring offering `z.object(...)` as a
  // compliant example. It constructs and runs correctly; only `tsc` objects.
  // Left as the doc writes it. See README §9.
  observed_steps: z.array(z.string()).default(() => []),
  ...CopilotKitStateSchema.fields,
});
export type AgentState = typeof AgentStateSchema.State;

const stepProgressTool = tool(async (args) => args, {
  name: "step_progress_tool",
  description: "Reports the current steps being executed",
  schema: z.object({ steps: z.array(z.string()) }),
});

export const graph = createAgent({
  model: "openai:gpt-5.4",
  tools: [stepProgressTool],
  middleware: [
    copilotkitMiddleware,
    stateStreamingMiddleware(
      stateItem({
        stateKey: "observed_steps",
        tool: "step_progress_tool",
        toolArgument: "steps",
      }),
    ),
  ],
  stateSchema: AgentStateSchema,
  systemPrompt:
    "You are a task performer. Report your steps using step_progress_tool.",
});
//#endregion
