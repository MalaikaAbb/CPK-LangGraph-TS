/**
 * `genui` — the agent behind every Components and surfaces route.
 *
 * Repo-authored, NOT from the docs. The pages are framework-neutral: their
 * runtime sample is a `BuiltInAgent` TanStack factory (Components overview)
 * or "change nothing on the runtime", and the `render_ui` tool plus its
 * catalog guide arrive per run from the provider. For a LangGraph graph that
 * means: bind `state.copilotkit.actions` (where `render_ui` lands) and fold
 * `state.copilotkit.context` (where the guide lands) into the system prompt,
 * the same two moves the Frontend Tools and Read-Only Context pages publish.
 *
 * The first sentence of the prompt is the Components overview page's own
 * system prompt; the rest, and `search_products`, are ported from the
 * aws-strands-ts harness (`backend/src/agents/genui-tools.ts`), because the
 * Catalogs page's ProductCard tells the model to copy values from a tool
 * result that no page publishes.
 */
import type { RunnableConfig } from "@langchain/core/runnables";
import type { AIMessage } from "@langchain/core/messages";
import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";

import { chatModel } from "./model.js";

//#region search-products
// Ported from aws-strands-ts genui-tools.ts (same products, same filter).
interface ProductRecord {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  tags: string[];
}

const PRODUCTS: ProductRecord[] = [
  { productId: "p1", name: "Trail Runner", price: 120, imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=320&h=200&fit=crop", tags: ["running", "shoes", "trail"] },
  { productId: "p2", name: "City Sneaker", price: 85, imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=320&h=200&fit=crop", tags: ["shoes", "casual"] },
  { productId: "p3", name: "Track Spike", price: 140, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=200&fit=crop", tags: ["running", "shoes", "track"] },
  { productId: "p4", name: "Road Racer Lite", price: 59, imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=320&h=200&fit=crop", tags: ["running", "shoes", "road", "cheap"] },
  { productId: "p5", name: "Everyday Jogger", price: 45, imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=320&h=200&fit=crop", tags: ["running", "shoes", "cheap"] },
  { productId: "p6", name: "Wool Running Socks", price: 18, imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=320&h=200&fit=crop", tags: ["running", "socks", "accessories"] },
  { productId: "p7", name: "Classic White Mug", price: 40, imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p8", name: "Camp Enamel Mug", price: 28, imageUrl: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p9", name: "Tall Ceramic Mug", price: 35, imageUrl: "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
  { productId: "p10", name: "Cozy Tea Mug", price: 22, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=320&h=200&fit=crop", tags: ["mug", "coffee", "cup", "kitchen"] },
];

export const searchProducts = tool(
  async ({ query, maxPrice }: { query: string; maxPrice?: number }) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = PRODUCTS.filter(
      (p) =>
        (maxPrice === undefined || p.price <= maxPrice) &&
        words.every((w) => p.tags.some((t) => t.startsWith(w.replace(/s$/, ""))) || p.name.toLowerCase().includes(w)),
    );
    return { products: matches.map(({ tags: _tags, ...p }) => p) };
  },
  {
    name: "search_products",
    description:
      "Search the shop's products. Returns productId, name, price (USD) and imageUrl for each match.",
    schema: z.object({
      query: z.string().describe("Words to match, e.g. 'running shoes'. Empty returns everything."),
      maxPrice: z.number().optional().describe("Only return products at or below this price."),
    }),
  },
);
//#endregion

const SYSTEM_PROMPT =
  "You are a helpful assistant. When a visual answer helps, render it with generative UI. " +
  "When the user asks about products, call `search_products` first and copy its values into the props the component declares; " +
  "leave out any value the component has no prop for. " +
  "Use it only for products: render charts and other data yourself, and never give up on the rest of a request because a search came back empty. " +
  "In `render_ui` operations, put each prop directly on the component node next to `id` and `component`; never nest props under a `props` key.";

type AgentState = typeof CopilotKitStateAnnotation.State;
const backendTools = [searchProducts];

//#region agent
async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = chatModel({ temperature: 0 }).bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...backendTools,
  ]);

  // The catalog guide (and any useAgentContext entries) ride on context.
  const context = state.copilotkit?.context ?? [];
  const system = [new SystemMessage({ content: SYSTEM_PROMPT })];
  if (context.length > 0) {
    system.push(
      new SystemMessage({ content: `App Context:\n${JSON.stringify(context, null, 2)}` }),
    );
  }

  const response = await model.invoke([...system, ...state.messages], config);
  return { messages: response };
}

function route(state: AgentState) {
  const last = state.messages[state.messages.length - 1] as AIMessage;
  const backendNames = new Set<string>(backendTools.map((t) => t.name));
  return last.tool_calls?.some((c) => backendNames.has(c.name)) ? "tool_node" : "__end__";
}

export const graph = new StateGraph(CopilotKitStateAnnotation)
  .addNode("chat_node", chatNode)
  .addNode("tool_node", new ToolNode(backendTools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", route, ["tool_node", "__end__"])
  .compile({ checkpointer: new MemorySaver() });
//#endregion
