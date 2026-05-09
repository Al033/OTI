/**
 * Next.js instrumentation entry point. Auto-loaded by Next.js 16 when
 * present at the project root. Wires Langfuse OTel tracing for AI SDK
 * v6 calls (generateObject, streamObject, embed, embedMany) so every
 * pipeline run is observable.
 *
 * Per Langfuse's May 2026 guide:
 *   - @langfuse/otel exports a LangfuseSpanProcessor that emits OTel
 *     spans to Langfuse Cloud (or self-hosted).
 *   - The AI SDK auto-instruments every call when
 *     experimental_telemetry: { isEnabled: true } is set.
 *
 * Conditioned on LANGFUSE_PUBLIC_KEY presence so the app boots cleanly
 * without it. Known v6 issue: trace-level input/output is empty in the
 * Traces tab; observation-level is populated. Adequate for OTI.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) return;

  try {
    const [{ NodeSDK }, { LangfuseSpanProcessor }] = await Promise.all([
      import("@opentelemetry/sdk-node"),
      import("@langfuse/otel"),
    ]);
    const sdk = new NodeSDK({
      spanProcessors: [new LangfuseSpanProcessor()],
    });
    sdk.start();
    console.log("[instrumentation] Langfuse OTel tracing started");
  } catch (err) {
    console.warn(
      "[instrumentation] Langfuse not installed or failed to init — continuing without tracing:",
      err instanceof Error ? err.message : err,
    );
  }
}
