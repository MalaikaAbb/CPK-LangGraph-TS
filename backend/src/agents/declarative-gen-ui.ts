/**
 * `/generative-ui/a2ui/dynamic-schema` — the agent draws whatever the request
 * needs, using a catalog it never sees at build time.
 *
 * There is deliberately no A2UI code in this file. The page's default path is
 * that passing `a2ui={{ catalog }}` on the provider is enough: the runtime
 * serialises the catalog's component names and Zod prop schemas into
 * `copilotkit.context`, injects a `generate_a2ui` tool, and the A2UI
 * middleware turns the resulting `a2ui_operations` into a rendered surface.
 * The tool therefore arrives on `state.copilotkit.actions` exactly like any
 * frontend tool, and this graph's only job is to bind it and call it.
 *
 * (The page's "I opted out of auto-inject" section shows the manual route —
 * `A2UIMiddleware` plus `get_a2ui_tools` — in Python only. This repo takes the
 * default path, which is fully documented for TypeScript.)
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
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { A2UI_MODEL, chatModel } from "./model.js";

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});

export type AgentState = typeof AgentStateAnnotation.State;

/**
 * Deliberately does NOT name components in prose.
 *
 * An earlier version said "Prefer a Column of Cards; use Metric tiles for
 * KPIs…" and the schema-designing model turned that English straight into
 * component names — emitting `ColumnOfCards` and `MetricTile`, neither of
 * which exists in the catalog. Nothing could resolve them, so the surface
 * never rendered and the progress indicator span forever.
 *
 * The catalog is the authoritative list and the runtime already serialises it
 * into context, so restating it here can only contradict it. Guidance stays at
 * the level of intent; component selection is left to the catalog.
 */
const SYSTEM_PROMPT =
 "You are a demo assistant for Declarative Generative UI (A2UI — Dynamic " +
  "Schema). Whenever a response would benefit from a rich visual — a " +
  "dashboard, status report, KPI summary, card layout, info grid, a " +
  "pie/donut chart of part-of-whole breakdowns, or a bar chart comparing " +
  "values across categories — call the A2UI tool to draw it. Keep chat " +
  "replies to one short sentence and let the UI do the talking.\n\n" +
  // Shape rules only. Naming components here is what broke this route before;
  // the catalog in context is the authority on *which* components exist. What
  // the model kept getting wrong was the protocol's structure, so that — and
  // only that — is restated.
  "The component catalog and its JSON Schema are supplied to you in context. " +
  "Obey them exactly, and obey the A2UI structure:\n" +
  "- Every component is a flat entry in the `components` array with its own " +
  "`id`. Never nest a component object inside another component.\n" +
  "- Identify a component with the `component` key, never `type`.\n" +
  "- Reference children by id: `children` is an array of id strings and " +
  "`child` is a single id string. Never inline the child object.\n" +
  // The validator rejects the whole surface on a repeated id, and the model
  // reliably reuses one when several components describe the same subject
  // (e.g. a `pipeline_chart` card and the chart inside it).
  "- Every `id` must be unique across the entire `components` array. Two " +
  "components about the same subject still need distinct ids — suffix them " +
  "(`pipeline_card`, `pipeline_chart`) rather than repeating one.\n" +
  "- Use only component names and props that appear in the supplied schema, " +
  "spelled exactly. Never invent either.\n\n" +
  // The catalog is already in context with exact names, and the model STILL
  // reached for `VBox`. Enumerating the names is duplication, and it can go
  // stale against `a2ui/definitions.ts` — but an unresolvable name fails the
  // whole surface, so the duplication buys more than it costs. The named
  // near-misses are ones this route has actually produced.
  "The catalog for this app provides exactly these components:\n" +
  "  Column, Row, Card, Text, Metric, InfoRow, StatusBadge, DataTable, " +
  "PieChart, BarChart, PrimaryButton.\n" +
  "Nothing else exists. In particular there is no VBox, HBox, Stack, Grid, " +
  "Dashboard, MetricTile or ColumnOfCards — a vertical stack is `Column`, a " +
  "horizontal one is `Row`, and a titled container is `Card`. If you want a " +
  "component that is not on this list, compose it from the ones that are.\n\n" +
  // The model gets flat props right (Metric) and nested ones wrong: it emits
  // `children` on Card, bare strings for DataTable columns, and `slices` on
  // PieChart. A worked example fixes all three far more reliably than prose.
  "A correct surface looks exactly like this — note `child` (singular) on " +
  "Card, the object form of DataTable columns and rows, and `data` (not " +
  "`slices`) on the charts:\n" +
  "[\n" +
  '  { "id": "root", "component": "Column", "children": ["rev_card", "acct_card"] },\n' +
  '  { "id": "rev_card", "component": "Card", "title": "Q3 Revenue", "child": "rev_metric" },\n' +
  '  { "id": "rev_metric", "component": "Metric", "label": "Total Revenue", "value": "$1.2M", "trend": "up" },\n' +
  '  { "id": "acct_card", "component": "Card", "title": "Top Accounts", "child": "acct_table" },\n' +
  '  { "id": "acct_table", "component": "DataTable",\n' +
  '    "columns": [{ "key": "name", "label": "Account" }, { "key": "arr", "label": "ARR" }],\n' +
  '    "rows": [{ "name": "Acme Corp", "arr": 300000 }, { "name": "Beta Inc", "arr": 250000 }] },\n' +
  '  { "id": "stage_chart", "component": "PieChart", "title": "Pipeline by Stage",\n' +
  '    "description": "Open pipeline split by stage",\n' +
  '    "data": [{ "label": "Prospecting", "value": 30 }, { "label": "Proposal", "value": 25 }] }\n' +
  "]\n" +
  "Emit each component exactly once. Never repeat an entry.";
// Deliberately unnamed: the doc calls the injected tool `generate_a2ui`, but
// the action that actually arrives on this agent is `render_a2ui` (confirmed
// in the Inspector's Agent tab). Naming the wrong one in the prompt is worse
// than naming neither — the model has exactly one tool bound, so "the A2UI
// tool" is unambiguous and cannot go stale.

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ model: A2UI_MODEL, temperature: 0.2 });

  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
  ]);

  const response = await modelWithTools.invoke(
    [new SystemMessage({ content: SYSTEM_PROMPT }), ...state.messages],
    config,
  );

  return { messages: response };
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

export const graph = workflow.compile({ checkpointer: new MemorySaver() });
