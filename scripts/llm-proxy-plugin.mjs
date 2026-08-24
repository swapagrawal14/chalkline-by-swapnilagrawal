/** Dev-server POST /api/llm → OpenAI-compatible upstream. */
export function llmProxyPlugin() {
  return {
    name: "chalkline-llm-proxy",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
          if (pathOnly !== "/api/llm") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "POST") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks);
          const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080");
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              (req.socket?.encrypted ? "https" : "http"),
          );
          const headers = new Headers();
          headers.set("content-type", "application/json");
          const request = new Request(`${proto}://${host}${req.url}`, {
            method: "POST",
            headers,
            body: raw,
          });
          const mod = await server.ssrLoadModule("/src/lib/ai/proxy.server.ts");
          const response = await mod.handleLlmProxy(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error("[chalkline] /api/llm failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ error: "proxy failed" }));
          }
        }
      });
    },
  };
}
