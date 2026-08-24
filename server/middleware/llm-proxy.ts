import { handleLlmProxy } from "../../src/lib/ai/proxy.server";

interface LlmEvent {
  url: URL;
  req: { method: string; headers: Headers; json?: () => Promise<unknown>; text?: () => Promise<string> };
}

export default async function llmProxyMiddleware(
  event: LlmEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (event.url.pathname !== "/api/llm") return next();
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  let bodyText = "";
  try {
    if (typeof event.req.text === "function") bodyText = await event.req.text();
    else if (typeof event.req.json === "function") bodyText = JSON.stringify(await event.req.json());
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const request = new Request(event.url.toString(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: bodyText || "{}",
  });
  return handleLlmProxy(request);
}
