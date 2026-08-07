import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { TranscribeFileOptions } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

import { LANGGRAPH_URL, LANGSMITH_API_KEY, VOICE_AGENT_ID } from "@/lib/agents";

/**
 * The Voice page publishes this file almost in full, and it is the reason the
 * route exists at all: the mic button in the composer is not a prop you set,
 * it is what `<CopilotChat>` renders once the runtime advertises
 * `audioFileTranscriptionEnabled: true` on `/info`. Only a runtime built with
 * `createCopilotRuntimeHandler` from `@copilotkit/runtime/v2` accepts a
 * `transcriptionService` — the v1 wrapper the rest of this app uses drops the
 * option — hence a second runtime rather than a flag on the first.
 *
 * The `[[...slug]]` catch-all matters too: the v2 handler does its own URL
 * routing under `basePath`, dispatching `/info`, `/agent/:id/run` and
 * `/transcribe` itself.
 *
 * Deviation from the doc: it hardcodes `graphId: "starterAgent"`, the name in
 * the CLI starter's `langgraph.json`. This repo's registry calls the voice
 * graph `voice-demo`, so that id is used instead.
 */

const voiceDemoAgent = new LangGraphAgent({
  deploymentUrl: LANGGRAPH_URL,
  graphId: VOICE_AGENT_ID,
  langsmithApiKey: LANGSMITH_API_KEY,
});

/**
 * Transcription service wrapper that reports a clean, typed auth error when
 * OPENAI_API_KEY is not configured. When the key is present we delegate to
 * the real OpenAI-backed service; any upstream Whisper error keeps its
 * natural categorization.
 */
class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({ openai: new OpenAI({ apiKey }) })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      // "api key" substring → handleTranscribe maps to AUTH_FAILED → 401.
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

// Cache the runtime + handler across invocations so the transcription service
// is constructed once per Node process instead of per request.
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    agents: {
      // The page mounts <CopilotKit agent="voice-demo">; resolve that to the
      // voice graph in backend/langgraph.json.
      [VOICE_AGENT_ID]: voiceDemoAgent,
      // useAgent() with no args defaults to "default"; alias so any internal
      // default-agent lookups resolve against the same graph.
      default: voiceDemoAgent,
    },
    transcriptionService: new GuardedOpenAITranscriptionService(),
  });

  cachedHandler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit-voice",
  });
  return cachedHandler;
}

// Next.js App Router bindings. This file lives at
// `src/app/api/copilotkit-voice/[[...slug]]/route.ts` — the catchall slug
// pattern forwards every sub-path (`/info`, `/agent/:id/run`, `/transcribe`,
// ...) to the V2 handler so its URL router can dispatch.
export const POST = (req: NextRequest) => getHandler()(req);
export const GET = (req: NextRequest) => getHandler()(req);
export const PUT = (req: NextRequest) => getHandler()(req);
export const DELETE = (req: NextRequest) => getHandler()(req);
