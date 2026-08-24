/** Dev-server /api/v1 → public Chalkline API. */
export function publicApiPlugin() {
  return {
    name: "chalkline-public-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
          if (!pathOnly.startsWith("/api/chalkline") && !pathOnly.startsWith("/api/v1")) {
            next();
            return;
          }
          const chunks = [];
          if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
            for await (const chunk of req) chunks.push(chunk);
          }
          const raw = Buffer.concat(chunks);
          const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080");
          const proto = String(
            req.headers["x-forwarded-proto"] ?? (req.socket?.encrypted ? "https" : "http"),
          );
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) for (const v of value) headers.append(key, v);
            else headers.set(key, String(value));
          }
          const request = new Request(`${proto}://${host}${req.url}`, {
            method: req.method ?? "GET",
            headers,
            body: raw.length ? raw : undefined,
          });
          const mod = await server.ssrLoadModule("/src/lib/api/public.ts");
          const response = await mod.handlePublicApi(request);
          if (!response) {
            next();
            return;
          }
          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error("[chalkline] /api/chalkline failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: "api failed" }));
          }
        }
      });
    },
  };
}
