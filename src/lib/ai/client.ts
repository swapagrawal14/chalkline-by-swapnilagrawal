import { compileStoryboard } from "./compile";
import { freeModelQueue, openRouterHeaders } from "./openrouter";
import { parsePromptHints, systemPrompt, userPrompt } from "./prompt";
import { parseStoryboard, type AiStoryboard } from "./schema";
import { isOpenRouter, isOpenRouterFree, type LlmSettings } from "./settings";
import type { AspectId, Project } from "@/lib/project/types";

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

function completionsUrl(settings: LlmSettings) {
  const base = settings.baseUrl.replace(/\/+$/, "");
  const path = settings.path.startsWith("/") ? settings.path : `/${settings.path}`;
  if (/\/chat\/completions$/i.test(base)) return base;
  return `${base}${path}`;
}

function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fence ? fence[1] : text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new LlmError("The model did not return JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

async function postCompletions(
  settings: LlmSettings,
  body: Record<string, unknown>,
  viaProxy: boolean,
  signal: AbortSignal,
): Promise<string> {
  const url = completionsUrl(settings);
  const headers: Record<string, string> = isOpenRouter(settings)
    ? openRouterHeaders(settings)
    : {
        "content-type": "application/json",
        ...(settings.apiKey ? { authorization: `Bearer ${settings.apiKey}` } : {}),
      };

  if (viaProxy) {
    const res = await fetch("/api/llm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, headers, body }),
      signal,
    });
    const text = await res.text();
    if (!res.ok) throw new LlmError(proxyError(text, res.status), res.status);
    return parseContent(text);
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  if (!res.ok) throw new LlmError(proxyError(text, res.status), res.status);
  return parseContent(text);
}

function parseContent(text: string): string {
  let data: { choices?: { message?: { content?: string | Array<{ type?: string; text?: string }> } }[] };
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    return text;
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => p.text ?? "").join("");
  }
  throw new LlmError("Unexpected response from the model.");
}

function proxyError(text: string, status: number) {
  try {
    const j = JSON.parse(text) as { error?: { message?: string } | string };
    if (typeof j.error === "string") return j.error;
    if (j.error?.message) return j.error.message;
  } catch {
    /* ignore */
  }
  const clip = text.replace(/\s+/g, " ").slice(0, 220);
  return clip || `The model returned HTTP ${status}`;
}

async function complete(settings: LlmSettings, messages: { role: string; content: string }[], signal: AbortSignal) {
  const models = isOpenRouterFree(settings) ? await freeModelQueue(settings) : [settings.model];
  let lastErr: unknown;
  for (const model of models) {
    const next: LlmSettings = { ...settings, model };
    try {
      return await completeOnce(next, messages, signal);
    } catch (err) {
      lastErr = err;
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      if (err instanceof LlmError && (err.status === 401 || err.status === 403)) throw err;
      if (!isOpenRouterFree(settings) || models.length < 2) throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new LlmError("No free model accepted the request.");
}

async function completeOnce(settings: LlmSettings, messages: { role: string; content: string }[], signal: AbortSignal) {
  const body: Record<string, unknown> = {
    model: settings.model,
    messages,
    temperature: 0.4,
    max_tokens: 8000,
  };
  const tryOnce = async (payload: Record<string, unknown>, viaProxy: boolean) =>
    postCompletions(settings, payload, viaProxy, signal);

  try {
    return await tryOnce({ ...body, response_format: { type: "json_object" } }, false);
  } catch (err) {
    const cors = err instanceof TypeError;
    if (cors) {
      try {
        return await tryOnce({ ...body, response_format: { type: "json_object" } }, true);
      } catch (err2) {
        if (err2 instanceof LlmError && err2.status === 400) {
          return await tryOnce(body, true);
        }
        throw err2;
      }
    }
    if (err instanceof LlmError && err.status === 400) {
      try {
        return await tryOnce(body, false);
      } catch (err2) {
        if (err2 instanceof TypeError) return await tryOnce(body, true);
        throw err2;
      }
    }
    throw err;
  }
}

export async function generateBoard(
  request: string,
  settings: LlmSettings,
  opts?: { aspect?: AspectId; seconds?: number; signal?: AbortSignal },
): Promise<{ project: Project; storyboard: AiStoryboard }> {
  const hints = parsePromptHints(request);
  const aspect = opts?.aspect ?? (hints.aspect as AspectId | undefined);
  const seconds = opts?.seconds ?? hints.seconds;
  const content = await complete(
    settings,
    [
      { role: "system", content: systemPrompt() },
      { role: "user", content: userPrompt({ request, aspect, seconds }) },
    ],
    opts?.signal ?? new AbortController().signal,
  );
  let raw: unknown;
  try {
    raw = extractJson(content);
  } catch (err) {
    throw new LlmError(err instanceof Error ? err.message : "Could not parse the model JSON.");
  }
  const storyboard = parseStoryboard(raw);
  if (aspect) storyboard.aspect = aspect;
  const project = compileStoryboard(storyboard, seconds);
  return { project, storyboard };
}

export async function testConnection(settings: LlmSettings): Promise<string> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 20000);
  try {
    const text = await complete(
      settings,
      [
        { role: "system", content: "Reply with the single word pong." },
        { role: "user", content: "ping" },
      ],
      ctrl.signal,
    );
    return text.trim().slice(0, 80);
  } finally {
    window.clearTimeout(t);
  }
}
