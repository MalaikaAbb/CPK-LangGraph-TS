/**
 * `/multi-agent/subagents` — a supervisor that delegates through tools.
 *
 * Sections 1–4 below (state, sub-agent prompts, the `delegationUpdate` helper,
 * and the three delegation tools) are published verbatim on the Sub-Agents
 * page. Section 5 — the supervisor node and graph assembly — is not; it
 * follows the same `chat_node` / `tool_node` / `shouldContinue` shape every
 * other published LangGraph TypeScript graph in these docs uses.
 *
 * The reducer on `delegations` is the load-bearing detail, and the doc calls
 * it out: without it, parallel `tool_calls` in one assistant turn each run
 * their `Command` against the same snapshot and last-write-wins silently drops
 * all but one delegation.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import type { ToolRunnableConfig } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import {
  Annotation,
  Command,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

// ---------------------------------------------------------------------------
// 1. Shared state — `delegations` is rendered as a live log in the UI.
// ---------------------------------------------------------------------------

//#region state
export type SubAgentName =
  | "research_agent"
  | "writing_agent"
  | "critique_agent";

export interface Delegation {
  id: string;
  sub_agent: SubAgentName;
  task: string;
  status: "running" | "completed" | "failed";
  result: string;
}

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  // Use a list-extending reducer so parallel tool_calls in a single
  // assistant turn don't clobber each other. Without this, each tool
  // callback's Command runs against the same task-input snapshot, and the
  // channel reducer (last-write-wins by default) silently drops every
  // delegation but one.
  delegations: Annotation<Delegation[]>({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;
//#endregion

// ---------------------------------------------------------------------------
// 2. Sub-agents (small purpose-built LLM invocations).
//
// Each sub-agent has its own system prompt and is invoked synchronously
// from inside the matching supervisor tool. They don't share memory or
// tools with the supervisor — the supervisor only sees their return
// value.
// ---------------------------------------------------------------------------

const SUB_AGENT_PROMPTS: Record<SubAgentName, string> = {
  research_agent:
    "You are a research sub-agent. Given a topic, produce a concise " +
    "bulleted list of 3-5 key facts. No preamble, no closing.",
  writing_agent:
    "You are a writing sub-agent. Given a brief and optional source " +
    "facts, produce a polished 1-paragraph draft. Be clear and " +
    "concrete. No preamble.",
  critique_agent:
    "You are an editorial critique sub-agent. Given a draft, give " +
    "2-3 crisp, actionable critiques. No preamble.",
};

async function invokeSubAgent(
  agent: SubAgentName,
  task: string,
): Promise<string> {
  const subModel = chatModel({ temperature: 0 });
  const result = await subModel.invoke([
    new SystemMessage({ content: SUB_AGENT_PROMPTS[agent] }),
    new HumanMessage({ content: task }),
  ]);
  const content = (result as AIMessage).content;
  if (typeof content === "string") return content;
  // Content is sometimes a list of parts — flatten any text parts.
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : "text" in (part as Record<string, unknown>)
            ? String((part as { text?: unknown }).text ?? "")
            : "",
      )
      .join("");
  }
  return String(content ?? "");
}

// ---------------------------------------------------------------------------
// 3. Helper — emit a single delegation entry plus a ToolMessage.
//
// The `delegations` channel uses a list-extending reducer (see
// AgentStateAnnotation above) so each Command emits ONLY the new entry —
// parallel tool_calls in one assistant turn each contribute their entry
// and the reducer concatenates them. Emitting the full list here would
// cause duplicates under the new reducer.
// ---------------------------------------------------------------------------

function delegationUpdate(
  subAgent: SubAgentName,
  task: string,
  result: string,
  toolCallId: string,
  status: "completed" | "failed" = "completed",
): Command {
  const entry: Delegation = {
    id: randomUUID(),
    sub_agent: subAgent,
    task,
    status,
    result,
  };
  return new Command({
    update: {
      delegations: [entry],
      messages: [
        new ToolMessage({
          status: status === "completed" ? "success" : "error",
          name: subAgent,
          tool_call_id: toolCallId,
          content: result,
        }),
      ],
    },
  });
}

// Run a sub-agent and return either its output or a scrubbed failure
// message. A thrown error inside a delegation tool would otherwise
// propagate and crash the supervisor turn — the user sees a runtime
// error and no `failed` entry ever lands in the delegation log. Catch
// here so the supervisor can keep working and the UI can render the
// failed delegation just like a successful one.
async function runSubAgentSafely(
  agent: SubAgentName,
  task: string,
): Promise<{ ok: true; result: string } | { ok: false; result: string }> {
  try {
    const result = await invokeSubAgent(agent, task);
    return { ok: true, result };
  } catch (err) {
    const errName = err instanceof Error ? err.constructor.name : typeof err;
    console.error(`[subagents] ${agent} sub-agent invocation failed:`, err);
    return {
      ok: false,
      result: `sub-agent call failed: ${errName} (see server logs)`,
    };
  }
}

function requireToolCallId(
  config: ToolRunnableConfig,
  toolName: string,
): string {
  const toolCallId = config.toolCall?.id;
  if (typeof toolCallId !== "string" || toolCallId.length === 0) {
    throw new Error(
      `${toolName}: missing tool_call_id on ToolRunnableConfig.toolCall — ` +
        "tool was invoked outside a ToolNode context.",
    );
  }
  return toolCallId;
}

// ---------------------------------------------------------------------------
// 4. Supervisor tools — each tool delegates to one sub-agent.
//
// The supervisor LLM "calls" these tools to delegate work; each call
// synchronously runs the matching sub-agent, records the delegation
// into shared state, and returns the sub-agent's output as a
// ToolMessage the supervisor can read on its next step.
// ---------------------------------------------------------------------------

//#region supervisor-delegation-tools
const researchAgentTool = tool(
  async ({ task }, config: ToolRunnableConfig) => {
    const toolCallId = requireToolCallId(config, "research_agent");
    const outcome = await runSubAgentSafely("research_agent", task);
    return delegationUpdate(
      "research_agent",
      task,
      outcome.result,
      toolCallId,
      outcome.ok ? "completed" : "failed",
    );
  },
  {
    name: "research_agent",
    description:
      "Delegate a research task to the research sub-agent. " +
      "Use for: gathering facts, background, definitions, statistics. " +
      "Returns a bulleted list of key facts.",
    schema: z.object({
      task: z
        .string()
        .describe("The research question or topic to investigate."),
    }),
  },
);

const writingAgentTool = tool(
  async ({ task }, config: ToolRunnableConfig) => {
    const toolCallId = requireToolCallId(config, "writing_agent");
    const outcome = await runSubAgentSafely("writing_agent", task);
    return delegationUpdate(
      "writing_agent",
      task,
      outcome.result,
      toolCallId,
      outcome.ok ? "completed" : "failed",
    );
  },
  {
    name: "writing_agent",
    description:
      "Delegate a drafting task to the writing sub-agent. " +
      "Use for: producing a polished paragraph, draft, or summary. Pass " +
      "relevant facts from prior research inside `task`.",
    schema: z.object({
      task: z
        .string()
        .describe(
          "Brief + optional source facts. The sub-agent returns a 1-paragraph draft.",
        ),
    }),
  },
);

const critiqueAgentTool = tool(
  async ({ task }, config: ToolRunnableConfig) => {
    const toolCallId = requireToolCallId(config, "critique_agent");
    const outcome = await runSubAgentSafely("critique_agent", task);
    return delegationUpdate(
      "critique_agent",
      task,
      outcome.result,
      toolCallId,
      outcome.ok ? "completed" : "failed",
    );
  },
  {
    name: "critique_agent",
    description:
      "Delegate a critique task to the critique sub-agent. " +
      "Use for: reviewing a draft and suggesting concrete improvements.",
    schema: z.object({
      task: z
        .string()
        .describe("The draft to critique. The sub-agent returns 2-3 critiques."),
    }),
  },
);
//#endregion

const tools = [researchAgentTool, writingAgentTool, critiqueAgentTool];

// ---------------------------------------------------------------------------
// 5. The supervisor node and graph.
// ---------------------------------------------------------------------------

const SUPERVISOR_PROMPT =
  "You are a supervisor agent. You do not do the work yourself — you " +
  "delegate it. For anything substantive, call research_agent first, then " +
  "writing_agent with the facts it returned, then critique_agent on the " +
  "draft. Finish with a two-sentence summary of what your sub-agents " +
  "produced. Never write the draft yourself.";

async function supervisorNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: SUPERVISOR_PROMPT }), ...state.messages],
    config,
  );

  return { messages: response };
}

function shouldContinue({ messages, copilotkit }: AgentState) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const hasBackendToolCall = lastMessage.tool_calls.some(
      (toolCall) =>
        !actions || actions.every((action) => action.name !== toolCall.name),
    );
    if (hasBackendToolCall) return "tool_node";
  }
  return "__end__";
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", supervisorNode)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as never);

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
