# Agent Config

> Forward typed configuration from your UI into the agent's reasoning loop.


<!-- interactive demo: agent-config -->


You have a working agent and want the user to be able to tune how it behaves: tone, expertise level, response length, language, persona. By the end of this guide, your UI will own a typed config object that the agent reads on every run and rebuilds its system prompt from.

## When to use this

Reach for agent config whenever the agent's behaviour depends on user-controllable settings that don't fit naturally as chat input:

- **Tone, voice, persona**: "playful", "formal", "casual"
- **Expertise level**: "beginner", "intermediate", "expert"
- **Response shape**: short / medium / long, structured / prose, language
- **Domain switches**: which knowledge base to consult, which tool subset to enable

If the values are a *channel* the user occasionally tunes (a settings panel, a toolbar of selects), agent config is the right shape. If the values are *content* the agent should write back to (notes, a document, a plan), use [Shared State](/langgraph-typescript/shared-state) instead.

How agent config flows from the UI into the agent's reasoning loop depends on your runtime architecture. Agents living behind a runtime read it from agent state on every run, while in-process agents receive the same object as forwarded properties on the provider — same UX, slightly different wiring on each side.

<WhenFrameworkHas flag="agent_config_pattern" equals="shared-state">

## How it works

<Steps>
  <Step>
    ### Install the CopilotKit LangGraph SDK

    ```bash
    npm install @copilotkit/sdk-js
    ```

  </Step>
  <Step>
    ### Wire CopilotKit state into your graph

    Agent config flows from the UI through `useAgentContext` and arrives on
    `state.copilotkit.context`. Use `CopilotKitStateAnnotation` to expose
    that channel — your chat node reads it to assemble the system prompt
    on every turn.

    
~~~~typescript title="agent-config.ts"
import type { RunnableConfig } from "@langchain/core/runnables";
import type { AIMessage } from "@langchain/core/messages";
import { SystemMessage } from "@langchain/core/messages";
import {
  MemorySaver,
  START,
  StateGraph,
  Annotation,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { makeChatOpenAI } from "./openai-headers";

import { CopilotKitStateAnnotation } from "@copilotkit/sdk-js/langgraph";

type Tone = "professional" | "casual" | "enthusiastic";
type Expertise = "beginner" | "intermediate" | "expert";
type ResponseLength = "concise" | "detailed";

const DEFAULT_TONE: Tone = "professional";
const DEFAULT_EXPERTISE: Expertise = "intermediate";
const DEFAULT_RESPONSE_LENGTH: ResponseLength = "concise";

const VALID_TONES = new Set<string>(["professional", "casual", "enthusiastic"]);
const VALID_EXPERTISE = new Set<string>(["beginner", "intermediate", "expert"]);
const VALID_RESPONSE_LENGTHS = new Set<string>(["concise", "detailed"]);

interface ResolvedProps {
  tone: Tone;
  expertise: Expertise;
  responseLength: ResponseLength;
}

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
});

type AgentState = typeof AgentStateAnnotation.State;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsConfigKeys(value: Record<string, unknown>): boolean {
  return "tone" in value || "expertise" in value || "responseLength" in value;
}

function extractConfigContext(context: unknown): Record<string, unknown> {
  if (typeof context === "string") {
    try {
      return extractConfigContext(JSON.parse(context));
    } catch {
      return {};
    }
  }

  if (Array.isArray(context)) {
    for (const entry of [...context].toReversed()) {
      const extracted = extractConfigContext(entry);
      if (containsConfigKeys(extracted)) return extracted;
    }
    return {};
  }

  if (!isRecord(context)) return {};
  const value = context.value;
  if (typeof value === "string") {
    const parsed = extractConfigContext(value);
    if (containsConfigKeys(parsed)) return parsed;
  }
  if (isRecord(value) && containsConfigKeys(value)) return value;
  return containsConfigKeys(context) ? context : {};
}

function readForwardedProperties(
  config: RunnableConfig | undefined,
): Record<string, unknown> {
  const configurable =
    (config?.configurable as Record<string, unknown> | undefined) ?? {};
  return (configurable.properties as Record<string, unknown> | undefined) ?? {};
}

function readConfig(state: AgentState, config: RunnableConfig): ResolvedProps {
  const contextConfig = extractConfigContext(state.copilotkit?.context);
  const properties = containsConfigKeys(contextConfig)
    ? contextConfig
    : readForwardedProperties(config);

  const toneRaw = properties.tone;
  const expertiseRaw = properties.expertise;
  const responseLengthRaw = properties.responseLength;

  const tone =
    typeof toneRaw === "string" && VALID_TONES.has(toneRaw)
      ? (toneRaw as Tone)
      : DEFAULT_TONE;
  const expertise =
    typeof expertiseRaw === "string" && VALID_EXPERTISE.has(expertiseRaw)
      ? (expertiseRaw as Expertise)
      : DEFAULT_EXPERTISE;
  const responseLength =
    typeof responseLengthRaw === "string" &&
    VALID_RESPONSE_LENGTHS.has(responseLengthRaw)
      ? (responseLengthRaw as ResponseLength)
      : DEFAULT_RESPONSE_LENGTH;

  return { tone, expertise, responseLength };
}

const TONE_RULES: Record<Tone, string> = {
  professional: "Use neutral, precise language. No emoji. Short sentences.",
  casual:
    "Use friendly, conversational language. Contractions OK. Light humor welcome.",
  enthusiastic:
    "Use upbeat, energetic language. Exclamation points OK. Emoji OK.",
};

const EXPERTISE_RULES: Record<Expertise, string> = {
  beginner: "Assume no prior knowledge. Define jargon. Use analogies.",
  intermediate:
    "Assume common terms are understood; explain specialized terms.",
  expert: "Assume technical fluency. Use precise terminology. Skip basics.",
};

const LENGTH_RULES: Record<ResponseLength, string> = {
  concise: "Respond in 1-3 sentences.",
  detailed: "Respond in multiple paragraphs with examples where relevant.",
};

function buildSystemPrompt(props: ResolvedProps): string {
  return [
    "You are a helpful assistant.",
    "",
    `Tone: ${TONE_RULES[props.tone]}`,
    `Expertise level: ${EXPERTISE_RULES[props.expertise]}`,
    `Response length: ${LENGTH_RULES[props.responseLength]}`,
  ].join("\n");
}

async function chatNode(state: AgentState, config: RunnableConfig) {
  const model = makeChatOpenAI(config, {
    model: "gpt-4o-mini",
    temperature: 0.4,
  });
  const props = readConfig(state, config);
  const systemPrompt = buildSystemPrompt(props);

  const response = (await model.invoke(
    [new SystemMessage({ content: systemPrompt }), ...state.messages],
    config,
  )) as AIMessage;

  return { messages: response };
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chatNode)
  .addEdge(START, "chat_node")
  .addEdge("chat_node", "__end__");

const memory = new MemorySaver();

export const graph = workflow.compile({ checkpointer: memory });
~~~~


  </Step>
</Steps>

Agent config is a typed object the frontend owns and publishes to the agent as
runtime context. The backend reads that context entry and turns it into a
system prompt.


Hold the typed config in React state, then mirror every change into the agent
through `useAgentContext`:

```tsx title="frontend/src/app/page.tsx — UI publishes the typed config"
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}
```




The backend half is also a single node. Read the latest config context at the top of every run and use it to build the system prompt for that turn:

```python title="backend/agent.py — agent reads config and rebuilds the system prompt"
import json

CONFIG_KEYS = ("tone", "expertise", "responseLength")

def read_config_value(entry):
    value = entry.get("value")
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    if not isinstance(value, dict):
        return None
    if any(key in value for key in CONFIG_KEYS):
        return value
    return None

async def my_agent_node(state: AgentState, config: RunnableConfig):
    context_entries = state.get("copilotkit", {}).get("context", [])
    cfg = next(
        (
            value
            for entry in reversed(context_entries)
            if (value := read_config_value(entry)) is not None
        ),
        {},
    )
    tone = cfg.get("tone", "professional")
    expertise = cfg.get("expertise", "intermediate")
    response_length = cfg.get("responseLength", "concise")
    system_prompt = build_system_prompt(tone, expertise, response_length)
    # ...
```

The agent reads the latest typed config at the start of every turn, rebuilds the system prompt, runs the turn. This is the same shape as the [shared-state write-side pattern](/langgraph-typescript/shared-state#writing-to-agent-state); agent config is just a specific use of that pattern with a UI-owned typed object on top.

</WhenFrameworkHas>

<WhenFrameworkHas flag="agent_config_pattern" equals="runtime-properties">

## How it works

The runtime owns the agent in-process, so config travels through frontend
runtime properties rather than agent state. There's no separate backend service
to push state into: the typed object becomes the input to the agent factory
directly.


Pass the typed object as `properties` on `<CopilotKit>`:

```tsx title="frontend/src/app/page.tsx — config flows through the provider"
<CopilotKit
  runtimeUrl="/api/copilotkit"
  properties={{ tone, expertise, responseLength }}
  useSingleEndpoint
>
  <Demo />
</CopilotKit>
```




The runtime hands the same object to the agent factory on every call as `input.forwardedProps`. The factory uses those fields to build a system prompt before returning the agent for that turn:

```ts title="backend/agent factory — synthesise the system prompt per turn"
export const agentConfigFactory = async (input: AgentFactoryInput) => {
  const { tone, expertise, responseLength } = input.forwardedProps ?? {};
  const systemPrompt = buildSystemPrompt(tone, expertise, responseLength);
  return makeAgent({ systemPrompt /* ... */ });
};
```

</WhenFrameworkHas>

<IntegrationGrid path="agent-config" />
