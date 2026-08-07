import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A surface whose <em>shape</em> is decided in advance and whose{" "}
          <em>data</em> comes from the agent. The component tree lives as JSON
          next to the agent and is loaded once at import; the{" "}
          <code>display_flight</code> tool supplies four fields. Because nothing
          is generated at request time, the card paints as soon as the tool
          returns — no secondary LLM call, no schema drift.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Find me a flight from SFO to JFK on United for 300$",
              "What about London to Tokyo on ANA?",
            ]}
            expect="A flight card renders in the chat: 'Itinerary / Flight Details', the two airport codes either side of an arrow, an airline badge, a price, and a Book flight button."
            fail="Raw JSON in the transcript instead of a card — usually the catalogId in createSurface does not match the frontend catalog's."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Self-defined components on this route">
        <p>
          The doc prints <code>definitions.ts</code>,{" "}
          <code>renderers.tsx</code> and <code>catalog.ts</code> in full, and
          all three are reproduced here. But the renderers import primitives
          from a sibling directory the page never shows. Those are rebuilt in{" "}
          <code>_components/primitives.tsx</code> and are the only invented UI
          on this route:
        </p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          <li>
            <code>Card</code>, <code>Badge</code>, <code>Button</code>,{" "}
            <code>Separator</code> — shadcn-style primitives
          </li>
        </ul>
        <p className="mt-2">
          The two schema files (<code>flight_schema.json</code>,{" "}
          <code>booked_schema.json</code>) are also absent from the page; they
          were supplied directly rather than derived.
        </p>
      </Callout>

      <Panel title="How the pieces meet">
        <ol className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>1.</strong> The schema JSON is loaded once at module import,
            backend-side.
          </li>
          <li>
            <strong>2.</strong> <code>display_flight</code> receives origin,
            destination, airline and price from the model.
          </li>
          <li>
            <strong>3.</strong> It returns an <code>a2ui_operations</code>{" "}
            container: <code>createSurface</code> +{" "}
            <code>updateComponents</code> + <code>updateDataModel</code>.
          </li>
          <li>
            <strong>4.</strong> The A2UI middleware intercepts the tool result
            and the frontend paints it with the matching catalog.
          </li>
        </ol>
      </Panel>

      <Panel title="The schema">
        <SourceCode file="backend/src/agents/a2ui_schemas/flight_schema.json" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Note which components carry values inline (<code>Title</code>,{" "}
          <code>Text</code>) and which reference the data model by JSON Pointer
          (<code>Airport</code>, <code>AirlineBadge</code>,{" "}
          <code>PriceTag</code>). The binder resolves those paths{" "}
          <em>before</em> the React renderer runs, which is why renderer props
          are typed as resolved strings rather than a path-or-literal union.
        </p>
      </Panel>

      <Panel title="The catalog">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts" },
          ]}
        />
      </Panel>

      <Panel title="The agent and the runtime">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/a2ui-fixed.ts", region: "display-flight" },
            { file: "frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" },
          ]}
        />
      </Panel>
    </>
  );
}
