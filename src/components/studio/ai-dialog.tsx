import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/field";
import { generateBoard, LlmError, testConnection } from "@/lib/ai/client";
import { listOpenRouterFreeModels } from "@/lib/ai/openrouter";
import { parsePromptHints } from "@/lib/ai/prompt";
import {
  DEFAULT_PRESET,
  hasLlmKey,
  inferPresetId,
  isOpenRouterFree,
  LLM_PRESETS,
  loadLlmSettings,
  saveLlmSettings,
  type LlmSettings,
} from "@/lib/ai/settings";
import { ASPECTS, type AspectId, type Project } from "@/lib/project/types";
import { ChevronDown, LoaderCircle, Plug, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const EXAMPLES = [
  "Make a 1 minute video on the Caldwell-Luc procedure in 9:16",
  "45 second explainer on photosynthesis, 16:9, chalkboard look",
  "Square 30s intro for a habit-tracker app",
  "1 minute classroom film on the water cycle, portrait",
];

export function AiDialog({
  open,
  mode,
  onClose,
  onApply,
}: {
  open: boolean;
  mode: "replace" | "create";
  onClose: () => void;
  onApply: (project: Project) => void;
}) {
  const [settings, setSettings] = useState<LlmSettings>(() => loadLlmSettings());
  const [showSettings, setShowSettings] = useState(() => !hasLlmKey(loadLlmSettings()));
  const [preset, setPreset] = useState(() => loadLlmSettings().preset ?? DEFAULT_PRESET.id);
  const [prompt, setPrompt] = useState(EXAMPLES[0]!);
  const [aspect, setAspect] = useState<AspectId | "auto">("auto");
  const [busy, setBusy] = useState<"idle" | "test" | "run">("idle");
  const [status, setStatus] = useState("");
  const [freeModels, setFreeModels] = useState<string[]>(["openrouter/free"]);
  const hints = useMemo(() => parsePromptHints(prompt), [prompt]);
  const freeMode = isOpenRouterFree({ ...settings, preset });
  const presetMeta = LLM_PRESETS.find((p) => p.id === preset);

  useEffect(() => {
    if (!open) return;
    const loaded = loadLlmSettings();
    setSettings(loaded);
    setPreset(loaded.preset ?? inferPresetId(loaded.baseUrl, loaded.model));
    setShowSettings(!hasLlmKey(loaded));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && busy === "idle") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open || !freeMode) return;
    void listOpenRouterFreeModels(settings)
      .then((ids) => setFreeModels(ids.length ? ids : ["openrouter/free"]))
      .catch(() => setFreeModels(["openrouter/free"]));
  }, [open, freeMode, settings.baseUrl, settings.apiKey]);

  if (!open) return null;

  function persist(next: LlmSettings) {
    const saved = saveLlmSettings(next);
    setSettings(saved);
    return saved;
  }

  function applyPreset(id: string) {
    setPreset(id);
    const p = LLM_PRESETS.find((x) => x.id === id);
    if (!p) return;
    persist({
      ...settings,
      baseUrl: p.baseUrl,
      model: p.model || settings.model,
      preset: id,
    });
  }

  async function onTest() {
    persist({ ...settings, preset });
    setBusy("test");
    setStatus("Pinging the model…");
    try {
      const reply = await testConnection({ ...settings, preset });
      toast.success(reply ? `Model said: ${reply}` : "Connected");
      setStatus("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach the model");
      setStatus("");
    } finally {
      setBusy("idle");
    }
  }

  async function onRun() {
    const saved = persist({ ...settings, preset });
    if (!saved.baseUrl || !saved.model) {
      setShowSettings(true);
      toast.error("Add a base URL and model first");
      return;
    }
    if (!hasLlmKey(saved)) {
      setShowSettings(true);
      toast.error("Paste your API key in Connection first");
      return;
    }
    setBusy("run");
    setStatus(freeMode ? "Picking a free model and writing the board…" : "The model is writing the board…");
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 120000);
    try {
      const resolvedAspect = aspect === "auto" ? (hints.aspect as AspectId | undefined) : aspect;
      const { project } = await generateBoard(prompt, saved, {
        aspect: resolvedAspect,
        seconds: hints.seconds,
        signal: ctrl.signal,
      });
      onApply(project);
      toast.success(`Drew “${project.name}” · ${project.scenes.length} scenes`);
      onClose();
    } catch (err) {
      const msg =
        err instanceof LlmError
          ? err.message
          : err instanceof DOMException && err.name === "AbortError"
            ? "Timed out waiting for the model"
            : err instanceof Error
              ? err.message
              : "Generation failed";
      toast.error(msg);
      setStatus("");
    } finally {
      window.clearTimeout(timer);
      setBusy("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" onClick={onClose}>
      <div
        className="flex max-h-[min(92dvh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-elevated shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Wand2 className="size-4 text-marker" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Optional</p>
            <h2 className="font-display text-2xl leading-tight">Ask a model to draw the board</h2>
          </div>
          <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </header>

        <div className="studio-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed text-ink-soft">
            Default is <span className="font-medium text-ink">OpenRouter / free</span> — paste a key and we
            send to <span className="font-mono text-xs">openrouter/free</span>, which picks a live free model
            and hops to another if one is busy. Any other OpenAI-compatible endpoint still works.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4 h-11 w-full justify-between gap-3 border-line-strong bg-paper px-3 text-left"
            onClick={() => setShowSettings((v) => !v)}
            aria-expanded={showSettings}
          >
            <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
              <Plug className="size-4 shrink-0 text-marker" />
              Connection
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-normal text-ink-soft">
                {presetMeta?.name ?? "Provider"}
                {hasLlmKey(settings) ? " · key saved" : " · needs a key"}
              </span>
              <ChevronDown className={`size-4 shrink-0 text-ink transition-transform ${showSettings ? "rotate-180" : ""}`} />
            </span>
          </Button>

          {showSettings ? (
            <div className="mt-2 rounded-md border border-line-strong bg-paper p-3">
              <Label>Provider preset</Label>
              <NativeSelect className="mt-1" value={preset} onChange={(e) => applyPreset(e.target.value)}>
                {LLM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NativeSelect>
              {presetMeta?.blurb ? <p className="mt-1.5 text-xs text-ink-soft">{presetMeta.blurb}</p> : null}

              <div className="mt-3">
                <Label>Base URL</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={settings.baseUrl}
                  placeholder="https://openrouter.ai/api/v1"
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                />
              </div>
              <div className="mt-3">
                <Label>API key</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  type="password"
                  autoComplete="off"
                  value={settings.apiKey}
                  placeholder={freeMode ? "sk-or-… from openrouter.ai/keys" : "sk-… (Ollama can leave this blank)"}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <Label>Model</Label>
                  {freeMode ? (
                    <NativeSelect
                      className="mt-1 font-mono text-xs"
                      value={freeModels.includes(settings.model) ? settings.model : "openrouter/free"}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value, preset: "openrouter-free" })}
                    >
                      {freeModels.map((id) => (
                        <option key={id} value={id}>
                          {id === "openrouter/free" ? "openrouter/free (auto-switch)" : id}
                        </option>
                      ))}
                    </NativeSelect>
                  ) : (
                    <Input
                      className="mt-1 font-mono text-xs"
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <Label>Path</Label>
                  <Input
                    className="mt-1 font-mono text-xs"
                    value={settings.path}
                    onChange={(e) => setSettings({ ...settings, path: e.target.value })}
                  />
                </div>
              </div>
              {freeMode ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  Auto-switch uses the official free router, then other live <span className="font-mono">:free</span>{" "}
                  models if one is down or rate-limited. {Math.max(0, freeModels.length - 1)} free models listed right now.
                </p>
              ) : null}
              <Button size="sm" variant="outline" className="mt-3" disabled={busy !== "idle"} onClick={() => void onTest()}>
                {busy === "test" ? <LoaderCircle className="animate-spin" /> : null}
                Test connection
              </Button>
            </div>
          ) : null}

          <div className="mt-4">
            <Label>What should it draw?</Label>
            <Textarea
              className="mt-1 min-h-32"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-line px-2.5 py-1 text-left text-[11px] text-ink-soft hover:border-marker"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <Label>Aspect</Label>
              <NativeSelect
                className="mt-1"
                value={aspect}
                onChange={(e) => setAspect(e.target.value as AspectId | "auto")}
              >
                <option value="auto">From the prompt{hints.aspect ? ` (${hints.aspect})` : ""}</option>
                {Object.entries(ASPECTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label>Read duration</Label>
              <p className="mt-2 text-sm text-ink-soft">
                {hints.seconds ? `${hints.seconds}s from your prompt` : "Default ~45s if you do not say"}
              </p>
            </div>
          </div>
        </div>

        <footer className="flex items-center gap-2 border-t border-line px-5 py-3">
          <p className="min-w-0 flex-1 truncate text-xs text-muted">
            {status || (mode === "replace" ? "Replaces the scenes on this board." : "Creates a new board.")}
          </p>
          <Button variant="ghost" onClick={onClose} disabled={busy === "run"}>
            Cancel
          </Button>
          <Button onClick={() => void onRun()} disabled={busy !== "idle" || !prompt.trim()}>
            {busy === "run" ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
            Draw it
          </Button>
        </footer>
      </div>
    </div>
  );
}
