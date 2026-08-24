import { handlePublicApi } from "../../src/lib/api/public";

interface ApiEvent {
  url: URL;
  req: {
    method?: string;
    headers: Headers;
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };
}

export default async function publicApiMiddleware(
  event: ApiEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (!event.url.pathname.startsWith("/api/chalkline") && !event.url.pathname.startsWith("/api/v1")) return next();
  const method = (event.req.method ?? "GET").toUpperCase();
  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (typeof event.req.arrayBuffer === "function") body = await event.req.arrayBuffer();
    else if (typeof event.req.text === "function") body = await event.req.text();
    else if (typeof event.req.json === "function") body = JSON.stringify(await event.req.json());
  }
  const headers = new Headers(event.req.headers);
  const request = new Request(event.url.toString(), { method, headers, body });
  const response = await handlePublicApi(request);
  return response ?? next();
}
