import type { LlmSettings } from "./settings";

const FREE_ROUTER = "openrouter/free";

type ModelsResponse = {
  data?: { id?: string; name?: string; pricing?: { prompt?: string; completion?: string }; architecture?: { modality?: string } }[];
};

let cache: { at: number; ids: string[] } | null = null;
const CACHE_MS = 10 * 60 * 1000;

function isChatFree(row: NonNullable<ModelsResponse["data"]>[number]) {
  const id = String(row.id ?? "");
  if (!id) return false;
  if (id === FREE_ROUTER) return false;
  if (/embed|whisper|tts|moderation|rerank/i.test(id)) return false;
  const modality = String(row.architecture?.modality ?? "text->text");
  if (modality.includes("embed") || modality.startsWith("image") || modality.startsWith("audio")) return false;
  const freeSuffix = id.endsWith(":free");
  const zero =
    Number(row.pricing?.prompt ?? 1) === 0 && Number(row.pricing?.completion ?? 1) === 0;
  return freeSuffix || zero;
}

async function fetchJson(url: string, headers: Record<string, string>, viaProxy: boolean) {
  if (viaProxy) {
    const res = await fetch("/api/llm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, method: "GET", headers }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<ModelsResponse>;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ModelsResponse>;
}

export async function listOpenRouterFreeModels(settings: LlmSettings): Promise<string[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.ids;
  const url = `${settings.baseUrl.replace(/\/+$/, "")}/models`;
  const headers: Record<string, string> = {};
  if (settings.apiKey) headers.authorization = `Bearer ${settings.apiKey}`;
  let data: ModelsResponse = {};
  try {
    data = await fetchJson(url, headers, false);
  } catch {
    try {
      data = await fetchJson(url, headers, true);
    } catch {
      cache = { at: Date.now(), ids: [FREE_ROUTER] };
      return cache.ids;
    }
  }
  const ids = (data.data ?? []).filter(isChatFree).map((r) => String(r.id));
  const unique = [FREE_ROUTER, ...ids.filter((id, i) => ids.indexOf(id) === i)];
  cache = { at: Date.now(), ids: unique };
  return unique;
}

export async function freeModelQueue(settings: LlmSettings): Promise<string[]> {
  const live = await listOpenRouterFreeModels(settings);
  const preferred = settings.model && settings.model !== FREE_ROUTER ? [settings.model] : [];
  const rest = live.filter((id) => id !== settings.model);
  return [...preferred, ...rest].slice(0, 6);
}

export function openRouterHeaders(settings: LlmSettings): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (settings.apiKey) headers.authorization = `Bearer ${settings.apiKey}`;
  if (typeof window !== "undefined") {
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "Chalkline";
  }
  return headers;
}

export { FREE_ROUTER };
