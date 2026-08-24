import { compileStoryboard } from "@/lib/ai/compile";
import { aiStoryboardSchema } from "@/lib/ai/schema";
import { ICONS } from "@/lib/animation/icons";
import { projectDuration } from "@/lib/project/factory";
import { normalizeProject } from "@/lib/project/persist";
import type { Project } from "@/lib/project/types";

const started = Date.now();
const hits = new Map<string, { n: number; t: number }>();

const SERVICE = "chalkline";

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "local";
}

function limited(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  row.n += 1;
  return row.n > 60;
}

function cors(req: Request, body: unknown, status = 200) {
  const origin = req.headers.get("origin") || "*";
  const json = typeof body === "string" ? body : JSON.stringify(body);
  return new Response(status === 204 ? null : json, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin === "null" ? "*" : origin,
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "cache-control": status === 200 && req.method === "GET" ? "public, max-age=60" : "no-store",
      "x-chalkline-api": "1",
    },
  });
}

function pack(extra: Record<string, unknown>, ok = true) {
  return { service: SERVICE, ok, ...extra };
}

function fail(req: Request, error: string, status: number, extra?: Record<string, unknown>) {
  return cors(req, pack({ error, ...extra }, false), status);
}

export const DIRECTING = {
  name: "Chalkline directing brief",
  version: 1,
  engine: {
    images: "Always color. Never sketch-filter photos. Reveals are color-in, wipe, or spiral — no black tick strokes.",
    audio: "If a voice-over is near the board length, the studio snaps the timeline to it. Long music beds are left alone.",
    camera: "Scribe follow-cam stays on the board. Variety is per scene.",
  },
  rules: [
    "Sequential layers: one marker hand, no overlapping starts.",
    "scribe: true, sfx: true, camera.enabled: false, filter: none on images.",
    "No two consecutive scenes share layout, transition, or textAnim.",
    "On-screen titles are short. Spoken sentence goes in captions.",
    "Layouts to cycle: hook-type, sketch-left, sketch-right, full-bleed, callout, icon-row, list-build, detail-crop, before-after, takeaway.",
    "Image styles to rotate: scribble, wipe-right, wipe-down, spiral, contour.",
    "textAnim to rotate: typewriter, bounce, word.",
    "Forbidden: Ken Burns, pulse/float/shake, scanner/rain/scatter/diamond, tiny 10×10 arrows, sketch filter.",
  ],
  compactScene: {
    name: "string",
    layout: "title | hero | steps | grid | compare | timeline | cycle | quote | list | close",
    title: "string",
    subtitle: "string?",
    caption: "spoken line",
    items: [{ icon: "icon id", label: "short" }],
    transition: "cut | fade | slide | wipe | dissolve | iris",
  },
};

function catalog() {
  return pack({
    name: "Chalkline API",
    version: "1.0.0",
    free: true,
    key: false,
    uptimeSec: Math.round((Date.now() - started) / 1000),
    base: "/api/chalkline",
    actions: {
      ping: "GET ?action=ping",
      icons: "GET ?action=icons",
      directing: "GET ?action=directing",
      createBoard: "POST ?action=createBoard",
      validateBoard: "POST ?action=validateBoard",
    },
    rest: {
      "GET /api/chalkline": "This card",
      "GET /api/chalkline/icons": "Icon ids",
      "GET /api/chalkline/directing": "Agent directing brief",
      "POST /api/chalkline/boards": "Create a board from a compact storyboard",
      "POST /api/chalkline/boards/validate": "Lint a finished board JSON",
      "GET /api/chalkline/openapi.json": "OpenAPI spec",
    },
    note: "Other websites call this the same way they call a temp-mail API. You get a board JSON back — play and export stay in the Chalkline studio.",
  });
}

export function openApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Chalkline API",
      version: "1.0.0",
      description:
        "Public Chalkline service. Create a whiteboard board from a compact storyboard, validate a full board, list icons. No API key. CORS is open.",
    },
    servers: [{ url: "/", description: "This Chalkline origin" }],
    paths: {
      "/api/chalkline": {
        get: { summary: "Service card. Also accepts ?action=ping|icons|directing" },
        post: { summary: "Also accepts ?action=createBoard|validateBoard" },
      },
      "/api/chalkline/boards": { post: { summary: "Create a board from a compact storyboard" } },
      "/api/chalkline/boards/validate": { post: { summary: "Validate a full Chalkline board" } },
      "/api/chalkline/icons": { get: { summary: "Icon ids" } },
      "/api/chalkline/directing": { get: { summary: "Directing brief for agents" } },
    },
  };
}

function validateBoard(raw: unknown) {
  if (!raw || typeof raw !== "object") return { ok: false as const, error: "Body must be a JSON object." };
  try {
    const project = normalizeProject(raw as Project);
    if (!project.scenes?.length) return { ok: false as const, error: "Need at least one scene." };
    const warnings: string[] = [];
    let layers = 0;
    let images = 0;
    const layouts: string[] = [];
    for (const scene of project.scenes) {
      layers += scene.layers.length;
      layouts.push(scene.layers.map((l) => l.type).join("+"));
      const starts = scene.layers.filter((l) => l.visible).map((l) => l.start);
      for (let i = 1; i < starts.length; i++) {
        if (starts[i]! < starts[i - 1]! + 0.05) {
          warnings.push(`Scene “${scene.name}” has overlapping layer starts.`);
          break;
        }
      }
      for (const layer of scene.layers) {
        if (layer.type === "image") {
          images += 1;
          if (layer.image?.filter && layer.image.filter !== "none") {
            warnings.push(`Image “${layer.name}” uses filter ${layer.image.filter}; the engine keeps color.`);
          }
        }
      }
    }
    for (let i = 1; i < layouts.length; i++) {
      if (layouts[i] === layouts[i - 1]) warnings.push(`Scenes ${i} and ${i + 1} use the same layer recipe.`);
    }
    return {
      ok: true as const,
      name: project.name,
      scenes: project.scenes.length,
      layers,
      images,
      duration: Math.round(projectDuration(project) * 10) / 10,
      aspect: project.aspect,
      warnings,
    };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Could not read that board." };
  }
}

async function readJson(request: Request, max: number) {
  const text = await request.text();
  if (text.length > max) return { error: `Body is too large (${Math.round(max / 1_000_000)} MB max).` as const };
  try {
    return { value: JSON.parse(text || "{}") as unknown };
  } catch {
    return { error: "Body must be JSON." as const };
  }
}

async function createBoard(request: Request) {
  const body = await readJson(request, 1_500_000);
  if ("error" in body && body.error) return { status: 413, payload: pack({ error: body.error }, false) };
  const parsed = (body as { value: unknown }).value;
  const obj = (parsed ?? {}) as Record<string, unknown>;
  const seconds = typeof obj.seconds === "number" ? obj.seconds : undefined;
  const read = aiStoryboardSchema.safeParse(parsed);
  if (!read.success) {
    return { status: 400, payload: pack({ error: "Invalid storyboard", details: read.error.flatten() }, false) };
  }
  const board = compileStoryboard(read.data, seconds);
  board.scribe = true;
  board.sfx = true;
  return {
    status: 200,
    payload: pack({
      board,
      duration: Math.round(projectDuration(board) * 10) / 10,
      import: "Save board as JSON and use Import JSON in the Chalkline studio.",
    }),
  };
}

function isOurs(pathname: string) {
  return pathname === "/api/chalkline" || pathname.startsWith("/api/chalkline/") || pathname === "/api/v1" || pathname.startsWith("/api/v1/");
}

function routeKey(pathname: string, action: string | null) {
  const p = pathname.replace(/\/+$/, "") || "/";
  const rest = p.replace(/^\/api\/(chalkline|v1)/, "") || "/";
  if (action) return `action:${action}`;
  if (rest === "/" || rest === "/index") return "index";
  if (rest === "/icons") return "icons";
  if (rest === "/directing") return "directing";
  if (rest === "/openapi.json") return "openapi";
  if (rest === "/boards" || rest === "/compile") return "boards";
  if (rest === "/boards/validate" || rest === "/validate") return "validate";
  return `unknown:${rest}`;
}

export async function handlePublicApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!isOurs(url.pathname)) return null;
  const method = request.method.toUpperCase();
  const action = url.searchParams.get("action") || url.searchParams.get("f");

  if (method === "OPTIONS") return cors(request, "", 204);
  if (limited(request)) return fail(request, "Slow down — 60 requests per minute on the free Chalkline API.", 429);

  const key = routeKey(url.pathname, action);

  if (method === "GET" && (key === "index" || key === "action:ping" || key === "action:getInfo")) {
    return cors(request, catalog());
  }
  if (method === "GET" && (key === "openapi" || key === "action:openapi")) {
    return cors(request, openApiSpec());
  }
  if (method === "GET" && (key === "directing" || key === "action:directing")) {
    return cors(request, pack({ directing: DIRECTING }));
  }
  if (method === "GET" && (key === "icons" || key === "action:icons" || key === "action:getIcons")) {
    return cors(
      request,
      pack({
        icons: ICONS.map((i) => ({ id: i.id, name: i.name, category: i.category })),
      }),
    );
  }

  if (method === "POST" && (key === "boards" || key === "action:createBoard" || key === "action:compile")) {
    const result = await createBoard(request);
    return cors(request, result.payload, result.status);
  }

  if (method === "POST" && (key === "validate" || key === "action:validateBoard" || key === "action:validate")) {
    const body = await readJson(request, 12_000_000);
    if ("error" in body && body.error) return fail(request, body.error, 413);
    const result = validateBoard((body as { value: unknown }).value);
    return cors(request, pack(result, result.ok), result.ok ? 200 : 400);
  }

  return fail(request, "Unknown Chalkline API call. GET /api/chalkline or GET /api/chalkline?action=ping", 404);
}
