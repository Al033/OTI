/**
 * Browser-side NDJSON stream reader. Yields parsed events from a fetch
 * response whose body is newline-delimited JSON. Handles partial-line
 * buffering so an event split across chunks reassembles correctly.
 */

export interface StreamEvent {
  kind: string;
  [k: string]: unknown;
}

export async function* readNdjsonStream(
  res: Response,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  if (!res.body) {
    throw new Error("Streaming response has no body");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        try {
          yield JSON.parse(line) as StreamEvent;
        } catch (err) {
          console.warn("[stream] dropped malformed line:", line.slice(0, 200), err);
        }
      }
    }
    const tail = buffer.trim();
    if (tail) {
      try {
        yield JSON.parse(tail) as StreamEvent;
      } catch (err) {
        console.warn("[stream] dropped tail:", tail.slice(0, 200), err);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
