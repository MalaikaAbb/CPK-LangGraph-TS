import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The opposite trade from{" "}
          <a
            href="/generative-ui/a2ui/fixed-schema"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            fixed schema
          </a>
          . Nothing about the layout is decided in advance — a secondary LLM
          designs the whole surface per request, choosing components from the
          catalog you gave it and filling them with data. You supply a
          vocabulary; it writes the sentence.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          What makes it work is that the runtime serialises your catalog —
          component names and their Zod prop schemas, descriptions included —
          into the agent&apos;s context, so the model knows exactly what it is
          allowed to emit.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Build me a dashboard for a SaaS company's Q3: revenue, churn, top accounts, and pipeline by stage",
              "Show me a breakdown of website traffic by source with a chart",
            ]}
            expect="A progress indicator while the schema generates, then cards, metric tiles, a table and a chart appear — assembled differently for each prompt."
            fail="A wall of JSON, or a lone 'no data' card. The first means the middleware is not attached; the second means the model emitted a component whose props did not validate."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Self-defined components on this route">
        <p>
          <code>definitions.ts</code>, <code>renderers.tsx</code> and{" "}
          <code>catalog.ts</code> are all printed in the doc and reproduced
          here. What is not printed is the leaf UI the renderers call into, so
          these are this repo&apos;s:
        </p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          <li>
            <code>CardShell</code>, <code>Badge</code>, <code>Button</code> —
            shadcn-style primitives
          </li>
          <li>
            <code>CHART_COLORS</code> and the <code>c</code> colour constants
          </li>
        </ul>
        <p className="mt-2">
          The doc&apos;s <code>coerceChartData</code> logic is inlined from its
          two duplicated copies into one helper — same behaviour, including the{" "}
          <code>console.warn</code> rather than a silent zero.
        </p>
      </Callout>

      <Panel title="The three-file split">
        <dl className="space-y-2 text-sm">
          {[
            ["definitions.ts", "Zod prop schemas plus human-readable descriptions. Platform-agnostic, so the runtime can serialise it to the LLM."],
            ["renderers.tsx", "React implementations keyed by the same names. TypeScript enforces that every definition has one."],
            ["catalog.ts", "createCatalog(definitions, renderers, { includeBasicCatalog: true })."],
          ].map(([name, desc]) => (
            <div key={name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-32 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="The catalog">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

      <Panel title="The provider and the runtime">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" },
            { file: "frontend/src/app/api/copilotkit-declarative-gen-ui/route.ts" },
            { file: "backend/src/agents/declarative-gen-ui.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
