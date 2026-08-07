/**
 * `/generative-ui/a2ui/fixed-schema` — the agent owns the schema, the LLM
 * supplies only data.
 *
 * Everything from `CATALOG_ID` down to the `display_flight` tool is published
 * verbatim on the Fixed Schema A2UI page (schema-loading variant, which is the
 * one it lists langgraph-typescript under). The page loads
 * `flight_schema.json` but never prints its contents; the file here is the
 * component tree the page diagrams — Card > Column > [Title, Row(Airport →
 * Arrow → Airport), Row(AirlineBadge · PriceTag), Button] — with the JSON
 * Pointer bindings it describes.
 *
 * `booked_schema.json` sits unused next to it on purpose: the page explains
 * that the "Book" button's optimistic swap needs `action_handlers` on
 * `a2ui.render`, which the SDK does not expose yet. The sibling schema is kept
 * so the swap can be wired the moment it does.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { z } from "zod";
import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import {
  MemorySaver,
  START,
  StateGraph,
  Annotation,
} from "@langchain/langgraph";

import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region display-flight
const CATALOG_ID = "copilotkit://flight-fixed-catalog";
const SURFACE_ID = "flight-fixed-schema";
const A2UI_OPERATIONS_KEY = "a2ui_operations";

// Schemas are JSON so they can be authored and reviewed independently of the
// agent code.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCHEMAS_DIR = join(__dirname, "a2ui_schemas");

function loadSchema(filename: string): unknown[] {
  const full = join(SCHEMAS_DIR, filename);
  return JSON.parse(readFileSync(full, "utf-8")) as unknown[];
}

const FLIGHT_SCHEMA = loadSchema("flight_schema.json");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BOOKED_SCHEMA = loadSchema("booked_schema.json");

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});

export type AgentState = typeof AgentStateAnnotation.State;

function createSurfaceOp(surfaceId: string, catalogId: string) {
  return {
    version: "v0.9",
    createSurface: { surfaceId, catalogId },
  };
}

function updateComponentsOp(surfaceId: string, components: unknown[]) {
  return {
    version: "v0.9",
    updateComponents: { surfaceId, components },
  };
}

function updateDataModelOp(surfaceId: string, data: unknown, path: string = "/") {
  return {
    version: "v0.9",
    updateDataModel: { surfaceId, path, value: data },
  };
}

function renderA2uiOperations(operations: unknown[]): string {
  return JSON.stringify({ [A2UI_OPERATIONS_KEY]: operations });
}

const displayFlight = tool(
  async ({
    origin,
    destination,
    airline,
    price,
  }: {
    origin: string;
    destination: string;
    airline: string;
    price: string;
  }) => {
    return renderA2uiOperations([
      createSurfaceOp(SURFACE_ID, CATALOG_ID),
      updateComponentsOp(SURFACE_ID, FLIGHT_SCHEMA),
      updateDataModelOp(SURFACE_ID, { origin, destination, airline, price }),
    ]);
  },
  {
    name: "display_flight",
    description:
      'Show a flight card for the given trip. Use short airport codes (e.g. "SFO", "JFK") for origin/destination and a price string like "$289".',
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
      airline: z.string(),
      price: z.string(),
    }),
  },
);
//#endregion

const tools = [displayFlight];

const SYSTEM_PROMPT =
  "You are a flight search assistant. When the user asks about a flight, " +
  "call `display_flight` with plausible details — the card is drawn from a " +
  "fixed schema, so you only supply the four data fields. Add one short " +
  "sentence of context after the card.";

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: SYSTEM_PROMPT }), ...state.messages],
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
  .addNode("chat_node", chatNode)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as never);

const memory = new MemorySaver();

export const graph = workflow.compile({ checkpointer: memory });
