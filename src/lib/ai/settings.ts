const KEY = "chalkline:llm";

export interface LlmSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
  path: string;
  preset?: string;
}

export const LLM_PRESETS = [
  {
    id: "openrouter-free",
    name: "OpenRouter / free",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/free",
    blurb: "Your OpenRouter key. Auto-picks a live free model.",
  },
  {
    id: "openrouter",
    name: "OpenRouter (any model)",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
    blurb: "Paid or specific model ids.",
  },
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", blurb: "" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", blurb: "" },
  {
    id: "together",
    name: "Together",
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    blurb: "",
  },
  { id: "ollama", name: "Ollama (this machine)", baseUrl: "http://127.0.0.1:11434/v1", model: "llama3.2", blurb: "" },
  { id: "lmstudio", name: "LM Studio", baseUrl: "http://127.0.0.1:1234/v1", model: "local-model", blurb: "" },
  { id: "custom", name: "Custom OpenAI-compatible", baseUrl: "https://", model: "", blurb: "" },
] as const;

export const DEFAULT_PRESET = LLM_PRESETS[0]!;

export const EMPTY_LLM: LlmSettings = {
  baseUrl: DEFAULT_PRESET.baseUrl,
  apiKey: "",
  model: DEFAULT_PRESET.model,
  path: "/chat/completions",
  preset: DEFAULT_PRESET.id,
};

export function loadLlmSettings(): LlmSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_LLM };
    const parsed = JSON.parse(raw) as Partial<LlmSettings>;
    const presetId = String(parsed.preset ?? "");
    const preset = LLM_PRESETS.find((p) => p.id === presetId);
    const looksLegacyOpenAi =
      !presetId &&
      String(parsed.baseUrl ?? "").includes("api.openai.com") &&
      String(parsed.model ?? "") === "gpt-4o-mini" &&
      !parsed.apiKey;
    if (looksLegacyOpenAi) return { ...EMPTY_LLM };
    return {
      baseUrl: String(parsed.baseUrl ?? EMPTY_LLM.baseUrl).replace(/\/+$/, ""),
      apiKey: String(parsed.apiKey ?? ""),
      model: String(parsed.model ?? EMPTY_LLM.model),
      path: String(parsed.path ?? EMPTY_LLM.path) || "/chat/completions",
      preset: preset?.id ?? inferPresetId(String(parsed.baseUrl ?? ""), String(parsed.model ?? "")),
    };
  } catch {
    return { ...EMPTY_LLM };
  }
}

export function inferPresetId(baseUrl: string, model: string) {
  const base = baseUrl.replace(/\/+$/, "");
  if (base.includes("openrouter.ai") && (model === "openrouter/free" || model.endsWith(":free"))) {
    return "openrouter-free";
  }
  const exact = LLM_PRESETS.find((p) => p.baseUrl.replace(/\/+$/, "") === base && p.model === model);
  if (exact) return exact.id;
  const byBase = LLM_PRESETS.find((p) => p.baseUrl.replace(/\/+$/, "") === base);
  return byBase?.id ?? "custom";
}

export function saveLlmSettings(s: LlmSettings) {
  const next = {
    ...s,
    baseUrl: s.baseUrl.replace(/\/+$/, ""),
    path: s.path.startsWith("/") ? s.path : `/${s.path}`,
    preset: s.preset ?? inferPresetId(s.baseUrl, s.model),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function hasLlmKey(s: LlmSettings) {
  return Boolean(s.apiKey.trim()) || /127\.0\.0\.1|localhost/i.test(s.baseUrl);
}

export function isOpenRouter(s: LlmSettings) {
  return /openrouter\.ai/i.test(s.baseUrl);
}

export function isOpenRouterFree(s: LlmSettings) {
  return (
    s.preset === "openrouter-free" ||
    s.model === "openrouter/free" ||
    (isOpenRouter(s) && s.model.endsWith(":free"))
  );
}
