/**
 * Same-origin forwarder for OpenAI-compatible chat completions.
 * The browser sends the target URL + headers; we do not store keys.
 */
export async function handleLlmProxy(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  let payload: { url?: string; headers?: Record<string, string>; body?: unknown; method?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const url = String(payload.url ?? "");
  if (!/^https?:\/\//i.test(url)) {
    return Response.json({ error: "Only http(s) URLs are allowed" }, { status: 400 });
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "Bad URL" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return Response.json({ error: "Blocked URL" }, { status: 400 });
  }
  const method = String(payload.method ?? "POST").toUpperCase() === "GET" ? "GET" : "POST";
  const headers = new Headers();
  for (const [k, v] of Object.entries(payload.headers ?? {})) {
    const key = k.toLowerCase();
    if (key === "host" || key === "content-length" || key === "connection") continue;
    headers.set(k, v);
  }
  if (!headers.has("content-type") && method !== "GET") headers.set("content-type", "application/json");
  try {
    const res = await fetch(parsed.toString(), {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(payload.body ?? {}),
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
