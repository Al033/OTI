import { EVENT_BY_ID } from "@/lib/events";

/**
 * MCP Prompts surface — server-defined templates the connected client
 * can invoke as one-click superpowers. Claude.ai users see these in the
 * conversation UI as suggestions; Cursor / Claude Code users get them
 * as slash-commands.
 *
 * Each prompt declares its arguments (which the client fills in) and
 * returns a constructed messages array for the LLM. The server doesn't
 * call the LLM itself — the connected client does, billing on its own
 * Anthropic quota. This is the cost-shifting MCP pattern: the server
 * defines what good prompts look like; the client pays for inference.
 */

export interface PromptDescriptor {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export const MCP_PROMPTS: ReadonlyArray<PromptDescriptor> = [
  {
    name: "compare_regimes",
    description:
      "Given two corpus event ids, produce a structural comparison — what they share at the macro-fingerprint level, where they diverge, and which dimension matters most for distinguishing them. Useful for sanity-checking when the OTI brief surfaces a particular pair.",
    arguments: [
      { name: "event_a", description: "First event id (e.g. '2008-lehman').", required: true },
      { name: "event_b", description: "Second event id (e.g. '1998-russia-ltcm').", required: true },
    ],
  },
  {
    name: "rank_by_fit",
    description:
      "Given a free-text market description, walk Claude through ranking the OTI corpus by structural fit using only the point-in-time view (no hindsight). Forces the LLM to reason about analogousness without leaking what happened next.",
    arguments: [
      {
        name: "query",
        description:
          "The market event in plain English. e.g. 'Trump announces 25% tariffs on EU autos'.",
        required: true,
      },
      {
        name: "top_k",
        description: "How many ranked analogues to surface. Default 5.",
        required: false,
      },
    ],
  },
  {
    name: "negative_analogue",
    description:
      "Given a chosen analogue, find the case in the OTI corpus that scored similar on macro setup but resolved oppositely. Operationalises Contrastive Hypothesis Retrieval (CHR, arXiv:2604.04593) — the 'rule out to rule in' frame.",
    arguments: [
      {
        name: "anchor",
        description:
          "The chosen analogue's event id (e.g. '1998-russia-ltcm'). The negative analogue is selected from the rest of the corpus.",
        required: true,
      },
    ],
  },
  {
    name: "today_in_history",
    description:
      "Walk me through what today's regime fingerprint looks like, and the closest historical analogue from OTI's corpus. Designed for daily use as a thinking-warm-up.",
  },
];

interface PromptMessage {
  role: "user";
  content: { type: "text"; text: string };
}

export function buildPromptMessages(
  name: string,
  args: Record<string, unknown>,
): { description: string; messages: PromptMessage[] } | null {
  switch (name) {
    case "compare_regimes": {
      const a = args.event_a as string;
      const b = args.event_b as string;
      const eventA = EVENT_BY_ID.get(a);
      const eventB = EVENT_BY_ID.get(b);
      if (!eventA || !eventB) return null;
      return {
        description: `Compare ${eventA.title} (${eventA.date}) vs ${eventB.title} (${eventB.date})`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Compare these two macro regimes structurally. Use OTI's controlled vocabulary (regime tags, trigger types). Do NOT predict — describe what they share and where they diverge.

EVENT A — ${eventA.title} (${eventA.date}, ${eventA.region}):
- triggerType: ${eventA.triggerType}
- regimeTags: ${eventA.regimeTags.join(", ")}
- catalyst: ${eventA.catalyst}
- narrativeAtTime: ${eventA.narrativeAtTime}
- outcomeInHindsight: ${eventA.outcomeInHindsight}

EVENT B — ${eventB.title} (${eventB.date}, ${eventB.region}):
- triggerType: ${eventB.triggerType}
- regimeTags: ${eventB.regimeTags.join(", ")}
- catalyst: ${eventB.catalyst}
- narrativeAtTime: ${eventB.narrativeAtTime}
- outcomeInHindsight: ${eventB.outcomeInHindsight}

Structure your answer as:
1. **Shared macro fingerprint** (the tags / vibes they have in common)
2. **The disambiguator** (the specific macro variable or context that most distinguishes them)
3. **The lesson for analogue retrieval** (when picking between these two for a current setup, which signals matter most)

Spare, structural register. No price targets. No allocation guidance.`,
            },
          },
        ],
      };
    }

    case "rank_by_fit": {
      const query = args.query as string;
      const topK = (args.top_k as number) ?? 5;
      return {
        description: `Rank corpus by structural fit to: "${query}"`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Use OTI's MCP tools (\`search_analogues\` and \`get_event\` with includeHindsight=false) to find the top-${topK} historical regimes whose POINT-IN-TIME setup most resembles this query:

"${query}"

For each, write 2-3 sentences in OTI's spare, structural register on why it fits — using ONLY the candidate's narrativeAtTime. Do NOT use outcomeInHindsight. Do NOT predict what will happen next. Just describe the rhyme.

End with one specific question worth asking: "what would tell us we're wrong about this analogue?"`,
            },
          },
        ],
      };
    }

    case "negative_analogue": {
      const anchor = args.anchor as string;
      const event = EVENT_BY_ID.get(anchor);
      if (!event) return null;
      return {
        description: `Find the contrastive negative analogue for ${event.title}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `The OTI corpus contains ${event.title} (${event.date}) with these macro tags: ${event.regimeTags.join(", ")}. Its catalyst was: "${event.catalyst}".

Use \`search_analogues\` and \`get_event\` to find a different corpus event that:
  (a) scored high on tag/macro similarity to ${event.id}, AND
  (b) whose 1-day market reaction was OPPOSITE in direction.

This is the **negative analogue** — the case that LOOKED similar early but the t=0 tape was already telling a different story. Operationalises CHR (Contrastive Hypothesis Retrieval, arXiv:2604.04593).

Return:
1. The negative-analogue's event id, title, date.
2. Why it looked similar (the surface match).
3. Why it resolved differently (what t=0 was signaling).
4. The disambiguator: the specific macro variable that distinguishes the two.

If the corpus has no credible inversion, say so explicitly. Better silence than fabrication.`,
            },
          },
        ],
      };
    }

    case "today_in_history": {
      return {
        description: "What's today's regime, and what does it rhyme with?",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Walk me through today's macro regime. Read the resource at \`oti://corpus/manifest.json\` for the corpus inventory, then use \`search_analogues\` with whatever framing of "today's macro setup" you think is most defensible — major themes you've seen in market commentary in the last 48 hours, the dominant Fed/ECB stance, where credit spreads sit, what oil's doing.

Surface the top-3 historical regimes that rhyme + one negative analogue (the case that looked similar but went the other way). Use OTI's spare, structural register. No predictions.`,
            },
          },
        ],
      };
    }

    default:
      return null;
  }
}
