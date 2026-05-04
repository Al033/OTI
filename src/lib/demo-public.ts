/**
 * Public-safe slice of the demo cache. The full DEMO_RESULTS map lives
 * in lib/demo-cache.ts (server-only). Client components only need the
 * id/label/query tuples to render the examples strip.
 */

export interface DemoExampleListItem {
  id: string;
  label: string;
  query: string;
}

export const DEMO_EXAMPLE_LIST: ReadonlyArray<DemoExampleListItem> = [
  { id: "trump-tariffs", label: "Trump 'Liberation Day' tariffs", query: "Trump announces 25% tariffs on essentially all US trading partners." },
  { id: "fed-surprise-cut", label: "Fed surprise 50bp cut", query: "The Federal Reserve surprises markets with an inter-meeting 50bp emergency rate cut." },
  { id: "yields-spike", label: "Yields spike to 5%", query: "US 10-year Treasury yields rapidly spike toward 5% on inflation worries." },
  { id: "china-deval", label: "China devalues the yuan", query: "The PBOC unexpectedly weakens the yuan fix, signalling a competitive devaluation." },
  { id: "sov-bank-stress", label: "Major bank fails on duration losses", query: "A large regional bank fails after disclosing unrealised Treasury losses, triggering deposit outflows." },
  { id: "war-shock", label: "Major-power tail risk", query: "Tensions escalate between the US and China over Taiwan, with markets pricing war risk." },
];
