import { federation } from "./federation.ts";
import { handleInternal } from "./internal-api.ts";

const port = parseInt(process.env.PORT ?? "3001", 10);

// Rewrite an incoming request's URL to https so Fedify generates correct AP URLs.
// The proxy preserves the public Host header (e.g. metazine.pessi.info), but
// the TCP connection arrives over plain HTTP. Without this, Fedify would emit
// http:// URLs in JSON-LD responses.
function toHttps(req: Request): Request {
  const url = new URL(req.url);
  if (url.protocol === "https:") return req;
  url.protocol = "https:";
  return new Request(url, req);
}

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);

    // Internal API paths are handled locally — no https rewrite needed
    if (url.pathname.startsWith("/internal/")) {
      const res = await handleInternal(req, federation);
      if (res) return res;
    }

    return federation.fetch(toHttps(req), {
      contextData: undefined,
      onNotFound: () => new Response("Not Found", { status: 404 }),
      onNotAcceptable: () => new Response("Not Acceptable", { status: 406 }),
    });
  },
});

console.log(`Fedify sidecar listening on port ${server.port}`);
