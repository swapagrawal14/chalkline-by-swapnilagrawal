import { BoardCanvas } from "@/components/board/board-canvas";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Slider, Switch, Textarea } from "@/components/ui/field";
import { MotionDock } from "@/components/studio/motion-dock";
import { PresentMode, ShortcutsHelp } from "@/components/studio/overlays";
import { ICON_CATEGORIES, ICONS } from "@/lib/animation/icons";
import { BOARD_LOOKS, INK_SWATCHES, MOTION_PRESETS } from "@/lib/project/presets";
import { sceneDuration } from "@/lib/project/factory";
import { durationOf, useStudio } from "@/lib/project/store";
import {
  AFTER_MOTIONS,
  ANIMATION_STYLES,
  ASPECTS,
  BACKGROUNDS,
  DRAW_STYLES,
  EASINGS,
  ENTRANCES,
  HAND_STYLES,
  STROKE_STYLES,
  FILL_REVEALS,
  SCENE_TRANSITIONS,
  TEXT_ANIMS,
  canvasSize,
  resolveAnim,
  type AfterMotion,
  type AnimationStyle,
  type DrawStyle,
  type Easing,
  type Entrance,
  type FillReveal,
  type HandStyle,
  type Layer,
  type SceneTransition,
  type StrokeStyle,
  type TextAnim,
} from "@/lib/project/types";
import { cn, formatTime } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Captions,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clapperboard,
  Copy,
  Download,
  Eye,
  EyeOff,
  Highlighter,
  ImagePlus,
  Keyboard,
  Layers3,
  Library,
  Lock,
  Maximize2,
  MessageCircle,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  Save,
  Scissors,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STYLE_LABELS: Record<AnimationStyle, string> = {
  scanner: "Scanner",
  zigzag: "Zigzag",
  contour: "Contour",
  spiral: "Spiral",
  radial: "Radial",
  chunks: "Chunk jump",
  "wipe-down": "Wipe down",
  "wipe-right": "Wipe right",
  "wipe-left": "Wipe left",
  "wipe-up": "Wipe up",
  diagonal: "Diagonal",
  "reverse-spiral": "Reverse spiral",
  "edges-first": "Edges first",
  portrait: "Portrait",
  human: "Human",
  landscape: "Landscape",
  building: "Building",
  vehicle: "Vehicle",
  checker: "Checker",
  rain: "Rain",
  diamond: "Diamond",
  scatter: "Scatter",
  columns: "Columns",
};

export function StudioApp({ projectId }: { projectId?: string }) {
  const init = useStudio((s) => s.init);
  const load = useStudio((s) => s.load);
  const ready = useStudio((s) => s.ready);
  const project = useStudio((s) => s.project);
  const missing = useStudio((s) => s.missing);
  const tick = useStudio((s) => s.tick);
  const persist = useStudio((s) => s.persist);
  const dirty = useStudio((s) => s.dirty);
  const togglePlay = useStudio((s) => s.togglePlay);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const duplicateLayer = useStudio((s) => s.duplicateLayer);
  const select = useStudio((s) => s.select);
  const nudgeSelected = useStudio((s) => s.nudgeSelected);
  const toggleFlag = useStudio((s) => s.toggleFlag);
  const setPresenting = useStudio((s) => s.setPresenting);
  const setShowHelp = useStudio((s) => s.setShowHelp);
  const copyMotion = useStudio((s) => s.copyMotion);
  const pasteMotion = useStudio((s) => s.pasteMotion);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (ready && projectId) void load(projectId);
  }, [ready, projectId, load]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      tick((now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      void persist();
    }, 1000);
    return () => window.clearTimeout(t);
  }, [dirty, project?.updatedAt, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copyMotion();
        toast.success("Motion copied");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteMotion();
        toast.success("Motion pasted");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateLayer();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
        toast.success("Saved on this device");
      }
      if (e.key === "Escape") {
        if (useStudio.getState().presenting) {
          setPresenting(false);
          return;
        }
        if (useStudio.getState().showHelp) {
          setShowHelp(false);
          return;
        }
        select(null);
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setPresenting(!useStudio.getState().presenting);
      }
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        toggleFlag("grid");
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowHelp(!useStudio.getState().showHelp);
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        nudgeSelected(dx, dy);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePlay,
    deleteSelected,
    undo,
    redo,
    duplicateLayer,
    persist,
    select,
    nudgeSelected,
    toggleFlag,
    setPresenting,
    setShowHelp,
    copyMotion,
    pasteMotion,
  ]);

  if (!ready) {
    return (
      <div className="paper-grain flex min-h-dvh items-center justify-center text-muted">
        Opening studio…
      </div>
    );
  }

  if (!projectId) {
    return <ProjectPicker />;
  }

  if (missing) {
    return (
      <div className="paper-grain flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-3xl">Board not on this device</p>
        <p className="max-w-sm text-sm text-muted">It may have been deleted, or you are on a different browser.</p>
        <Button asChild>
          <Link to="/studio">All boards</Link>
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="paper-grain flex min-h-dvh items-center justify-center text-muted">
        Loading board…
      </div>
    );
  }

  return (
    <div className="paper-grain flex h-dvh flex-col overflow-hidden text-ink">
      <StudioHeader />
      <div className="flex min-h-0 flex-1">
        <LeftRail />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Stage />
          <MotionDock />
        </div>
        <Inspector />
      </div>
      <Timeline />
      <MobileBar />
      <Tour />
      <ExportOverlay />
      <MusicSync />
      <PresentMode />
      <ShortcutsHelp />
    </div>
  );
}

function StudioHeader() {
  const project = useStudio((s) => s.project)!;
  const rename = useStudio((s) => s.rename);
  const undo = useStudio((s) => s.undo);
  const redo = useStudio((s) => s.redo);
  const playing = useStudio((s) => s.playing);
  const togglePlay = useStudio((s) => s.togglePlay);
  const exportStill = useStudio((s) => s.exportStill);
  const persist = useStudio((s) => s.persist);
  const dirty = useStudio((s) => s.dirty);
  const mutate = useStudio((s) => s.mutate);
  const playSpeed = useStudio((s) => s.playSpeed);
  const setPlaySpeed = useStudio((s) => s.setPlaySpeed);
  const setPresenting = useStudio((s) => s.setPresenting);
  const setShowHelp = useStudio((s) => s.setShowHelp);
  const size = canvasSize(project);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface/90 px-3 backdrop-blur-sm">
      <Link
        to="/"
        className="hidden items-center gap-2 pr-2 font-display text-lg tracking-tight md:flex"
      >
        <Mark />
        Chalkline
      </Link>
      <Link to="/studio" className="text-muted md:hidden">
        <ChevronLeft className="size-5" />
      </Link>
      <input
        value={project.name}
        onChange={(e) => rename(e.target.value)}
        className="min-w-0 flex-1 truncate bg-transparent font-medium outline-none md:max-w-xs"
      />
      <span className="hidden text-xs text-faint md:inline">
        {size.width}×{size.height}
      </span>
      <NativeSelect
        className="hidden w-[7.5rem] md:block"
        value={project.aspect}
        onChange={(e) =>
          mutate((p) => {
            p.aspect = e.target.value as typeof p.aspect;
          })
        }
      >
        {Object.entries(ASPECTS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </NativeSelect>
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={undo} aria-label="Undo">
          <Undo2 />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={redo} aria-label="Redo">
          <Redo2 />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => void persist()} aria-label="Save">
          <Save className={dirty ? "text-marker" : ""} />
        </Button>
        <Button size="sm" variant={playing ? "outline" : "marker"} onClick={togglePlay} id="chalkline-play">
          {playing ? <Pause /> : <Play />}
          <span className="hidden sm:inline">{playing ? "Pause" : "Play"}</span>
        </Button>
        <div className="hidden items-center rounded-sm border border-line md:flex">
          {[0.5, 1, 1.5, 2].map((n) => (
            <button
              key={n}
              onClick={() => setPlaySpeed(n)}
              className={cn(
                "px-2 py-1 font-mono text-[11px]",
                playSpeed === n ? "bg-ink text-paper" : "text-muted hover:text-ink",
              )}
            >
              {n}x
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="hidden md:inline-flex"
          onClick={() => setPresenting(true)}
        >
          <Maximize2 />
          Present
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          className="hidden md:inline-flex"
          onClick={() => setShowHelp(true)}
          aria-label="Shortcuts"
        >
          <Keyboard />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            void exportStill();
            toast.success("Still frame downloaded");
          }}
        >
          PNG
        </Button>
        <ExportMenu />
      </div>
    </header>
  );
}

function ExportMenu() {
  const exportVideo = useStudio((s) => s.exportVideo);
  const project = useStudio((s) => s.project);
  const [open, setOpen] = useState(false);
  const hasSound = Boolean(project?.musicSrc) || Boolean(project?.sfx);

  async function run(format: "mp4" | "webm") {
    setOpen(false);
    try {
      await exportVideo(format);
      toast.success(format === "mp4" ? "MP4 downloaded" : "WebM downloaded");
    } catch {
      toast.error("Could not export video in this browser");
    }
  }

  return (
    <div className="relative">
      <Button size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Download />
        <span className="hidden sm:inline">Export</span>
      </Button>
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-md border border-line bg-elevated p-1 shadow-pop">
          <button
            type="button"
            className="flex w-full flex-col items-start rounded-sm px-3 py-2 text-left hover:bg-paper-deep"
            onClick={() => void run("mp4")}
          >
            <span className="text-sm font-medium">MP4 video</span>
            <span className="text-[11px] text-muted">{hasSound ? "Includes music bed" : "Picture only — add a music bed for sound"}</span>
          </button>
          <button
            type="button"
            className="flex w-full flex-col items-start rounded-sm px-3 py-2 text-left hover:bg-paper-deep"
            onClick={() => void run("webm")}
          >
            <span className="text-sm font-medium">WebM video</span>
            <span className="text-[11px] text-muted">{hasSound ? "Includes music bed" : "Picture only — add a music bed for sound"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-sm bg-paper-deep">
      <span className="block h-3.5 w-0.5 rotate-[-38deg] rounded-full bg-marker" />
    </span>
  );
}

function LeftRail() {
  const tab = useStudio((s) => s.leftTab);
  const setLeftTab = useStudio((s) => s.setLeftTab);
  const tabs = [
    { id: "layers", label: "Layers", icon: Layers3 },
    { id: "library", label: "Library", icon: Library },
    { id: "captions", label: "Captions", icon: Captions },
    { id: "notes", label: "Script", icon: StickyNote },
  ] as const;

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setLeftTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.12em]",
              tab === t.id ? "bg-paper text-ink" : "text-muted hover:text-ink",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>
      <div className="studio-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "layers" && <LayersList />}
        {tab === "library" && <LibraryPanel />}
        {tab === "captions" && <CaptionsPanel />}
        {tab === "notes" && <NotesPanel />}
      </div>
    </aside>
  );
}

function LayersList() {
  const project = useStudio((s) => s.project)!;
  const selectedId = useStudio((s) => s.selectedId);
  const select = useStudio((s) => s.select);
  const updateLayer = useStudio((s) => s.updateLayer);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const reorderLayer = useStudio((s) => s.reorderLayer);
  const addText = useStudio((s) => s.addText);
  const addImages = useStudio((s) => s.addImages);
  const fileRef = useRef<HTMLInputElement>(null);
  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0]!;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={addText}>
          <Type /> Text
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload /> Image
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            if (files.length) void addImages(files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-xs text-muted">Drop images anywhere on the stage, or pick from the library.</p>
      <ul className="flex flex-col gap-1">
        {[...scene.layers].reverse().map((layer) => (
          <li key={layer.id}>
            <button
              type="button"
              onClick={() => select(layer.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                selectedId === layer.id ? "bg-paper-deep" : "hover:bg-paper",
              )}
            >
              <span className="w-14 shrink-0 font-mono text-[10px] text-faint">
                {formatTime(layer.start)}
              </span>
              <span className="min-w-0 flex-1 truncate">{layer.name}</span>
              <span
                role="button"
                className="text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { locked: !layer.locked });
                }}
              >
                <Lock className={cn("size-3.5", layer.locked ? "text-marker" : "opacity-30")} />
              </span>
              <span
                role="button"
                className="text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { visible: !layer.visible });
                }}
              >
                {layer.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {scene.layers.length === 0 ? (
        <EmptyHint />
      ) : (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => selectedId && reorderLayer(selectedId, -1)}
          >
            Up
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => selectedId && reorderLayer(selectedId, 1)}
          >
            Down
          </Button>
          <Button size="sm" variant="ghost" onClick={deleteSelected}>
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

function MotionPacks() {
  const applyMotionPreset = useStudio((s) => s.applyMotionPreset);
  const selectedId = useStudio((s) => s.selectedId);
  return (
    <div className="mb-5">
      <Label>Motion packs</Label>
      <p className="mb-2 mt-1 text-xs text-muted">
        {selectedId ? "Applies to the selected layer. Use the strip under the board to paint a whole scene." : "Applies to every layer in this scene."}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {MOTION_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyMotionPreset(p.id, selectedId ? "layer" : "scene")}
            className="rounded-md border border-line bg-elevated px-2 py-2 text-left hover:border-marker"
          >
            <span className="block text-sm font-medium">{p.name}</span>
            <span className="block text-[11px] text-muted">{p.blurb}</span>
          </button>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-2 w-full"
        onClick={() => applyMotionPreset("story", "scene")}
      >
        Apply story hand to scene
      </Button>
    </div>
  );
}

function MobileMotion() {
  const project = useStudio((s) => s.project)!;
  const selectedId = useStudio((s) => s.selectedId);
  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0]!;
  const layer = scene.layers.find((l) => l.id === selectedId);
  const updateLayer = useStudio((s) => s.updateLayer);
  const updateAnim = useStudio((s) => s.updateAnim);
  const duplicateLayer = useStudio((s) => s.duplicateLayer);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const sliceSelected = useStudio((s) => s.sliceSelected);
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  return (
    <div>
      <MotionPacks />
      {layer ? (
        <LayerInspector
          layer={layer}
          updateLayer={updateLayer}
          updateAnim={updateAnim}
          duplicateLayer={duplicateLayer}
          deleteSelected={deleteSelected}
          sliceSelected={sliceSelected}
          cols={cols}
          rows={rows}
          setCols={setCols}
          setRows={setRows}
        />
      ) : (
        <p className="text-sm text-muted">Select a layer first, then pick a pack or tune the stroke.</p>
      )}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-lg border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
      This scene is empty. Add text, an icon, or an image to begin drawing.
    </div>
  );
}

function LibraryPanel() {
  const addIcon = useStudio((s) => s.addIcon);
  const addShape = useStudio((s) => s.addShape);
  const addArrow = useStudio((s) => s.addArrow);
  const [cat, setCat] = useState<(typeof ICON_CATEGORIES)[number] | "all">("all");
  const [q, setQ] = useState("");
  const items = ICONS.filter((i) => {
    if (cat !== "all" && i.category !== cat) return false;
    if (q && !i.name.toLowerCase().includes(q.toLowerCase()) && !i.id.includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant="outline" onClick={() => addShape("rect")}>
          <Square className="size-3.5" /> Box
        </Button>
        <Button size="sm" variant="outline" onClick={() => addShape("ellipse")}>
          <Circle className="size-3.5" /> Oval
        </Button>
        <Button size="sm" variant="outline" onClick={addArrow}>
          <ArrowRight className="size-3.5" /> Arrow
        </Button>
        <Button size="sm" variant="outline" onClick={() => addShape("highlight")}>
          <Highlighter className="size-3.5" /> Highlight
        </Button>
        <Button size="sm" variant="outline" onClick={() => addShape("bubble")}>
          <MessageCircle className="size-3.5" /> Speech
        </Button>
        <Button size="sm" variant="outline" onClick={() => addShape("callout")}>
          <Circle className="size-3.5" /> Callout
        </Button>
      </div>
      <Input
        placeholder="Search icons…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <NativeSelect value={cat} onChange={(e) => setCat(e.target.value as typeof cat)}>
        <option value="all">All icons</option>
        {ICON_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </NativeSelect>
      <div className="grid grid-cols-4 gap-1.5">
        {items.map((icon) => (
          <button
            key={icon.id}
            title={icon.name}
            onClick={() => addIcon(icon.id)}
            className="grid aspect-square min-w-0 place-items-center overflow-hidden rounded-md border border-line bg-elevated hover:border-marker"
          >
            <IconGlyph icon={icon} />
          </button>
        ))}
      </div>
    </div>
  );
}

function IconGlyph({ icon }: { icon: (typeof ICONS)[number] }) {
  const vb = icon.viewBox ?? 64;
  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="size-8" aria-hidden="true">
      {icon.paths.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

function CaptionsPanel() {
  const project = useStudio((s) => s.project)!;
  const addCaption = useStudio((s) => s.addCaption);
  const mutate = useStudio((s) => s.mutate);
  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0]!;

  return (
    <div className="flex flex-col gap-3">
      <Button size="sm" onClick={addCaption}>
        <Plus /> Caption
      </Button>
      {scene.captions.map((c) => (
        <div key={c.id} className="rounded-md border border-line bg-elevated p-2">
          <Input
            value={c.text}
            onChange={(e) =>
              mutate((p) => {
                const cap = (p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!).captions.find(
                  (x) => x.id === c.id,
                );
                if (cap) cap.text = e.target.value;
              })
            }
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input
                type="number"
                step="0.1"
                value={c.start}
                onChange={(e) =>
                  mutate((p) => {
                    const cap = (p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!).captions.find(
                      (x) => x.id === c.id,
                    );
                    if (cap) cap.start = Number(e.target.value);
                  })
                }
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="number"
                step="0.1"
                value={c.end}
                onChange={(e) =>
                  mutate((p) => {
                    const cap = (p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!).captions.find(
                      (x) => x.id === c.id,
                    );
                    if (cap) cap.end = Number(e.target.value);
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      {scene.captions.length === 0 ? (
        <p className="text-sm text-muted">Lower-thirds that type on while the board draws.</p>
      ) : null}
    </div>
  );
}

function NotesPanel() {
  const project = useStudio((s) => s.project)!;
  const mutate = useStudio((s) => s.mutate);
  return (
    <div className="flex flex-col gap-2">
      <Label>Presenter notes</Label>
      <Textarea
        value={project.notes}
        placeholder="Talking points for this board…"
        onChange={(e) =>
          mutate((p) => {
            p.notes = e.target.value;
          }, { prepare: false })
        }
      />
      <p className="text-xs text-muted">Private to you. Not burned into the export.</p>
    </div>
  );
}

function Stage() {
  const prepared = useStudio((s) => s.prepared);
  const time = useStudio((s) => s.time);
  const playing = useStudio((s) => s.playing);
  const selectedId = useStudio((s) => s.selectedId);
  const select = useStudio((s) => s.select);
  const moveLayer = useStudio((s) => s.moveLayer);
  const addImages = useStudio((s) => s.addImages);
  const [drop, setDrop] = useState(false);

  return (
    <main
      className="relative flex min-h-0 min-w-0 flex-1 items-start justify-center bg-paper-deep p-3 md:items-center md:p-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDrop(true);
      }}
      onDragLeave={() => setDrop(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrop(false);
        const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"));
        if (files.length) void addImages(files);
      }}
    >
      <BoardCanvas
        prepared={prepared}
        time={time}
        mode={playing ? "play" : "edit"}
        selectedId={selectedId}
        onSelect={select}
        onMove={moveLayer}
        className="h-full w-full"
      />
      {drop ? (
        <div className="pointer-events-none absolute inset-4 grid place-items-center rounded-xl border-2 border-dashed border-marker bg-marker/10 text-sm font-medium">
          Drop images to add layers
        </div>
      ) : null}
    </main>
  );
}

function Inspector() {
  const project = useStudio((s) => s.project)!;
  const selectedId = useStudio((s) => s.selectedId);
  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0]!;
  const layer = scene.layers.find((l) => l.id === selectedId);
  const mutate = useStudio((s) => s.mutate);
  const updateLayer = useStudio((s) => s.updateLayer);
  const updateAnim = useStudio((s) => s.updateAnim);
  const duplicateLayer = useStudio((s) => s.duplicateLayer);
  const deleteSelected = useStudio((s) => s.deleteSelected);
  const sliceSelected = useStudio((s) => s.sliceSelected);
  const autoSequence = useStudio((s) => s.autoSequence);
  const applyBackground = useStudio((s) => s.applyBackground);
  const applyLook = useStudio((s) => s.applyLook);
  const staggerWithGap = useStudio((s) => s.staggerWithGap);
  const scaleTiming = useStudio((s) => s.scaleTiming);
  const duplicateScene = useStudio((s) => s.duplicateScene);
  const toggleFlag = useStudio((s) => s.toggleFlag);
  const exportJson = useStudio((s) => s.exportJson);
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [gap, setGap] = useState(0.28);

  return (
    <aside className="studio-scroll hidden w-[320px] shrink-0 overflow-y-auto border-l border-line bg-surface p-4 md:block">
      <MotionPacks />
      <div className="mb-5">
        <Label>Board look</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {BOARD_LOOKS.map((look) => (
            <button
              key={look.id}
              onClick={() => applyLook(look.id)}
              className="rounded-sm border border-line px-2 py-1.5 text-[11px] hover:border-marker"
            >
              {look.name}
            </button>
          ))}
        </div>
        <Label className="mt-3 block">Surface</Label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              onClick={() => applyBackground(bg)}
              className={cn(
                "rounded-sm border px-2 py-1.5 text-[11px] capitalize",
                project.background === bg ? "border-ink bg-paper-deep" : "border-line hover:border-line-strong",
              )}
            >
              {bg}
            </button>
          ))}
        </div>
        {project.background === "solid" ? (
          <div className="mt-2">
            <Label>Color</Label>
            <input
              type="color"
              className="mt-1 h-8 w-full"
              value={project.solidColor}
              onChange={(e) =>
                mutate((p) => {
                  p.solidColor = e.target.value;
                })
              }
            />
          </div>
        ) : null}
        <div className="mt-3 flex flex-col gap-2">
          <Switch
            checked={project.loop}
            onChange={(v) =>
              mutate((p) => {
                p.loop = v;
              }, { prepare: false })
            }
            label="Loop playback"
          />
          <Switch
            checked={Boolean(project.grid)}
            onChange={() => toggleFlag("grid")}
            label="Show grid"
          />
          <Switch
            checked={Boolean(project.snap)}
            onChange={() => toggleFlag("snap")}
            label="Snap to grid"
          />
          <Switch
            checked={Boolean(project.spotlight)}
            onChange={() => toggleFlag("spotlight")}
            label="Spotlight current layer"
          />
          <Switch
            checked={Boolean(project.sfx)}
            onChange={() => toggleFlag("sfx")}
            label="Tick when a layer starts"
          />
          <Switch
            checked={scene.camera.enabled}
            onChange={(v) =>
              mutate((p) => {
                const sc = p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!;
                sc.camera.enabled = v;
              })
            }
            label="Ken Burns camera"
          />
        </div>
        <div className="mt-3">
          <Label>Music bed</Label>
          <input
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                mutate((p) => {
                  p.musicName = file.name;
                  p.musicSrc = String(reader.result);
                }, { prepare: false });
              };
              reader.readAsDataURL(file);
            }}
          />
          {project.musicName ? (
            <p className="mt-1 text-xs text-muted">{project.musicName} · mixed into MP4 / WebM</p>
          ) : (
            <p className="mt-1 text-xs text-muted">Attach a track to hear it in the exported video.</p>
          )}
        </div>
        <div className="mt-3">
          <Label>Scene transition</Label>
          <NativeSelect
            className="mt-1"
            value={scene.transition ?? "cut"}
            onChange={(e) =>
              mutate((p) => {
                const sc = p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!;
                sc.transition = e.target.value as SceneTransition;
              }, { prepare: false })
            }
          >
            {SCENE_TRANSITIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="mt-3">
          <div className="flex justify-between">
            <Label>Stagger gap</Label>
            <span className="font-mono text-xs text-muted">{gap.toFixed(2)}s</span>
          </div>
          <Slider
            min={0.05}
            max={1.2}
            step={0.05}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
          />
          <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => staggerWithGap(gap)}>
            Stagger this scene
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <Button size="sm" variant="outline" onClick={() => scaleTiming(0.8)}>
            Faster 0.8×
          </Button>
          <Button size="sm" variant="outline" onClick={() => scaleTiming(1.25)}>
            Slower 1.25×
          </Button>
        </div>
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={autoSequence}>
          Auto-sequence layers
        </Button>
        <Button size="sm" variant="outline" className="mt-2 w-full" onClick={duplicateScene}>
          Duplicate scene
        </Button>
        <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={exportJson}>
          Download board JSON
        </Button>
      </div>

      {!layer ? (
        <p className="text-sm text-muted">Select a layer to edit animation, drawing, and transform.</p>
      ) : (
        <LayerInspector
          layer={layer}
          updateLayer={updateLayer}
          updateAnim={updateAnim}
          duplicateLayer={duplicateLayer}
          deleteSelected={deleteSelected}
          sliceSelected={sliceSelected}
          cols={cols}
          rows={rows}
          setCols={setCols}
          setRows={setRows}
        />
      )}
    </aside>
  );
}

function LayerInspector({
  layer,
  updateLayer,
  updateAnim,
  duplicateLayer,
  deleteSelected,
  sliceSelected,
  cols,
  rows,
  setCols,
  setRows,
}: {
  layer: Layer;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  updateAnim: (id: string, patch: Partial<Layer["anim"]>) => void;
  duplicateLayer: () => void;
  deleteSelected: () => void;
  sliceSelected: (c: number, r: number) => Promise<void>;
  cols: number;
  rows: number;
  setCols: (n: number) => void;
  setRows: (n: number) => void;
}) {
  const anim = resolveAnim(layer.anim);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Layer</Label>
        <Input
          className="mt-1"
          value={layer.name}
          onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
        />
      </div>
      {layer.text ? (
        <div>
          <Label>Copy</Label>
          <Textarea
            className="mt-1"
            value={layer.text.text}
            onChange={(e) =>
              updateLayer(layer.id, { text: { ...layer.text!, text: e.target.value }, name: e.target.value.slice(0, 28) })
            }
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <NativeSelect
              value={layer.text.font}
              onChange={(e) =>
                updateLayer(layer.id, {
                  text: { ...layer.text!, font: e.target.value as NonNullable<Layer["text"]>["font"] },
                })
              }
            >
              <option value="hand">Hand</option>
              <option value="serif">Serif</option>
              <option value="sans">Sans</option>
              <option value="mono">Mono</option>
            </NativeSelect>
            <NativeSelect
              value={layer.text.align}
              onChange={(e) =>
                updateLayer(layer.id, {
                  text: { ...layer.text!, align: e.target.value as NonNullable<Layer["text"]>["align"] },
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </NativeSelect>
          </div>
          <div className="mt-2">
            <Label>Text animation</Label>
            <NativeSelect
              className="mt-1"
              value={anim.textAnim}
              onChange={(e) => updateAnim(layer.id, { textAnim: e.target.value as TextAnim })}
            >
              {TEXT_ANIMS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Label>Color</Label>
            <input
              type="color"
              value={layer.text.color}
              onChange={(e) => updateLayer(layer.id, { text: { ...layer.text!, color: e.target.value } })}
            />
          </div>
        </div>
      ) : null}
      {layer.icon ? (
        <div className="flex items-center gap-2">
          <Label>Ink</Label>
          <input
            type="color"
            value={layer.icon.color}
            onChange={(e) => updateLayer(layer.id, { icon: { ...layer.icon!, color: e.target.value } })}
          />
          <Label>Weight</Label>
          <Slider
            min={1}
            max={6}
            step={0.2}
            value={layer.icon.strokeWidth}
            onChange={(e) =>
              updateLayer(layer.id, { icon: { ...layer.icon!, strokeWidth: Number(e.target.value) } })
            }
          />
        </div>
      ) : null}
      <div>
        <Label>Animation style</Label>
        <NativeSelect
          className="mt-1"
          value={layer.anim.style}
          onChange={(e) => updateAnim(layer.id, { style: e.target.value as AnimationStyle })}
        >
          {ANIMATION_STYLES.map((s) => (
            <option key={s} value={s}>
              {STYLE_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <Label>Drawing</Label>
        <NativeSelect
          className="mt-1"
          value={layer.anim.drawStyle}
          onChange={(e) => updateAnim(layer.id, { drawStyle: e.target.value as DrawStyle })}
        >
          {DRAW_STYLES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Stroke</Label>
          <NativeSelect
            className="mt-1"
            value={layer.anim.strokeStyle}
            onChange={(e) => updateAnim(layer.id, { strokeStyle: e.target.value as StrokeStyle })}
          >
            {STROKE_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label>Hand</Label>
          <NativeSelect
            className="mt-1"
            value={layer.anim.hand}
            onChange={(e) => updateAnim(layer.id, { hand: e.target.value as HandStyle })}
          >
            {HAND_STYLES.map((s) => (
              <option key={s} value={s}>
                {s.replace("-", " ")}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div>
        <Label>Fill reveal</Label>
        <NativeSelect
          className="mt-1"
          value={layer.anim.fillReveal}
          onChange={(e) => updateAnim(layer.id, { fillReveal: e.target.value as FillReveal })}
        >
          {FILL_REVEALS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Easing</Label>
          <NativeSelect
            className="mt-1"
            value={anim.easing}
            onChange={(e) => updateAnim(layer.id, { easing: e.target.value as Easing })}
          >
            {EASINGS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label>Entrance</Label>
          <NativeSelect
            className="mt-1"
            value={anim.entrance}
            onChange={(e) => updateAnim(layer.id, { entrance: e.target.value as Entrance })}
          >
            {ENTRANCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div>
        <Label>After it draws</Label>
        <NativeSelect
          className="mt-1"
          value={anim.after}
          onChange={(e) => updateAnim(layer.id, { after: e.target.value as AfterMotion })}
        >
          {AFTER_MOTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Draw speed</Label>
          <span className="font-mono text-xs text-muted">{anim.speed.toFixed(1)}x</span>
        </div>
        <Slider
          min={0.4}
          max={2.5}
          step={0.1}
          value={anim.speed}
          onChange={(e) => updateAnim(layer.id, { speed: Number(e.target.value) })}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Sketchiness</Label>
          <span className="font-mono text-xs text-muted">{Math.round(anim.sketchiness * 100)}</span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={anim.sketchiness}
          onChange={(e) => updateAnim(layer.id, { sketchiness: Number(e.target.value) })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Switch
          checked={anim.reverse}
          onChange={(v) => updateAnim(layer.id, { reverse: v })}
          label="Reverse draw"
        />
        <Switch
          checked={anim.wiggle}
          onChange={(v) => updateAnim(layer.id, { wiggle: v })}
          label="Wiggle while drawing"
        />
        <Switch
          checked={anim.dust}
          onChange={(v) => updateAnim(layer.id, { dust: v })}
          label="Chalk dust"
        />
        <Switch
          checked={layer.locked}
          onChange={(v) => updateLayer(layer.id, { locked: v })}
          label="Lock position"
        />
      </div>
      <div>
        <Label>Ink</Label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {INK_SWATCHES.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => {
                updateAnim(layer.id, { color: c });
                if (layer.icon) updateLayer(layer.id, { icon: { ...layer.icon, color: c } });
                if (layer.text) updateLayer(layer.id, { text: { ...layer.text, color: c } });
              }}
              className="size-6 rounded-full border border-line"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {(["left", "center", "right"] as const).map((e) => (
          <Button key={e} size="sm" variant="outline" onClick={() => useStudio.getState().alignSelected(e)}>
            {e}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => useStudio.getState().flipSelected("x")}>
          Flip H
        </Button>
        <Button size="sm" variant="outline" onClick={() => useStudio.getState().flipSelected("y")}>
          Flip V
        </Button>
        <Button size="sm" variant="outline" onClick={() => useStudio.getState().alignSelected("middle")}>
          Middle
        </Button>
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Duration</Label>
          <span className="font-mono text-xs text-muted">{layer.duration.toFixed(1)}s</span>
        </div>
        <Slider
          min={0.4}
          max={12}
          step={0.1}
          value={layer.duration}
          onChange={(e) => updateLayer(layer.id, { duration: Number(e.target.value) })}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Start</Label>
          <span className="font-mono text-xs text-muted">{layer.start.toFixed(1)}s</span>
        </div>
        <Slider
          min={0}
          max={30}
          step={0.1}
          value={layer.start}
          onChange={(e) => updateLayer(layer.id, { start: Number(e.target.value) })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Num label="X" value={Math.round(layer.x)} onChange={(v) => updateLayer(layer.id, { x: v })} />
        <Num label="Y" value={Math.round(layer.y)} onChange={(v) => updateLayer(layer.id, { y: v })} />
        <Num label="W" value={Math.round(layer.width)} onChange={(v) => updateLayer(layer.id, { width: v })} />
        <Num label="H" value={Math.round(layer.height)} onChange={(v) => updateLayer(layer.id, { height: v })} />
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Rotation</Label>
          <span className="font-mono text-xs text-muted">{Math.round(layer.rotation)}°</span>
        </div>
        <Slider
          min={-180}
          max={180}
          value={layer.rotation}
          onChange={(e) => updateLayer(layer.id, { rotation: Number(e.target.value) })}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <Label>Opacity</Label>
          <span className="font-mono text-xs text-muted">{Math.round(layer.opacity * 100)}%</span>
        </div>
        <Slider
          min={0.1}
          max={1}
          step={0.05}
          value={layer.opacity}
          onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })}
        />
      </div>
      {layer.type === "image" ? (
        <div className="rounded-md border border-line p-3">
          <Label>Image slicer</Label>
          <p className="mb-2 mt-1 text-xs text-muted">Split this photo into independently drawn tiles.</p>
          <div className="grid grid-cols-2 gap-2">
            <Num label="Cols" value={cols} onChange={setCols} />
            <Num label="Rows" value={rows} onChange={setRows} />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => void sliceSelected(cols, rows)}
          >
            <Scissors /> Apply slices
          </Button>
          <NativeSelect
            className="mt-2"
            value={layer.image?.filter ?? "none"}
            onChange={(e) =>
              updateLayer(layer.id, {
                image: {
                  ...layer.image!,
                  filter: e.target.value as NonNullable<Layer["image"]>["filter"],
                },
              })
            }
          >
            <option value="none">Original</option>
            <option value="sketch">Sketch</option>
            <option value="poster">Poster</option>
            <option value="ink">Ink</option>
          </NativeSelect>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={duplicateLayer}>
          <Copy /> Duplicate
        </Button>
        <Button size="sm" variant="ghost" onClick={deleteSelected}>
          <Trash2 /> Delete
        </Button>
      </div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        className="mt-1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Timeline() {
  const project = useStudio((s) => s.project)!;
  const prepared = useStudio((s) => s.prepared);
  const time = useStudio((s) => s.time);
  const seek = useStudio((s) => s.seek);
  const select = useStudio((s) => s.select);
  const selectedId = useStudio((s) => s.selectedId);
  const setActiveScene = useStudio((s) => s.setActiveScene);
  const addScene = useStudio((s) => s.addScene);
  const deleteScene = useStudio((s) => s.deleteScene);
  const duplicateScene = useStudio((s) => s.duplicateScene);
  const playing = useStudio((s) => s.playing);
  const togglePlay = useStudio((s) => s.togglePlay);
  const duration = durationOf(project, prepared);
  const scene = project.scenes.find((s) => s.id === project.activeSceneId) ?? project.scenes[0]!;

  return (
    <footer className="hidden shrink-0 border-t border-line bg-surface md:block">
      <div className="flex items-center gap-2 px-3 py-2">
        <Button size="icon-sm" variant="ghost" onClick={togglePlay} aria-label="Play">
          {playing ? <Pause /> : <Play />}
        </Button>
        <span className="w-24 font-mono text-xs tabular-nums text-muted">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <div className="flex items-center gap-1">
          {project.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScene(s.id)}
              className={cn(
                "rounded-sm px-2 py-1 text-xs",
                s.id === scene.id ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft",
              )}
            >
              {i + 1}. {s.name}
            </button>
          ))}
          <Button size="icon-sm" variant="ghost" onClick={addScene} aria-label="Add scene">
            <Plus />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={duplicateScene} aria-label="Duplicate scene">
            <Copy />
          </Button>
          {project.scenes.length > 1 ? (
            <Button size="icon-sm" variant="ghost" onClick={() => deleteScene(scene.id)} aria-label="Delete scene">
              <X />
            </Button>
          ) : null}
        </div>
        <span className="ml-auto text-xs text-faint">{scene.layers.length} layers · {sceneDuration(scene).toFixed(1)}s</span>
      </div>
      <div
        className="relative mx-3 mb-3 h-16 cursor-pointer overflow-hidden rounded-md bg-paper-deep"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seek(((e.clientX - rect.left) / rect.width) * duration);
        }}
      >
        {scene.layers.map((layer, i) => {
          const left = (layer.start / Math.max(duration, 0.01)) * 100;
          const width = (layer.duration / Math.max(duration, 0.01)) * 100;
          return (
            <button
              key={layer.id}
              onClick={(e) => {
                e.stopPropagation();
                select(layer.id);
              }}
              className={cn(
                "absolute h-3 rounded-sm",
                selectedId === layer.id ? "bg-marker" : "bg-ink/30",
              )}
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 1.2)}%`,
                top: 6 + (i % 4) * 12,
              }}
              title={layer.name}
            />
          );
        })}
        <div
          className="pointer-events-none absolute top-0 h-full w-px bg-danger"
          style={{ left: `${(time / Math.max(duration, 0.01)) * 100}%` }}
        />
      </div>
    </footer>
  );
}

function MobileBar() {
  const playing = useStudio((s) => s.playing);
  const togglePlay = useStudio((s) => s.togglePlay);
  const addText = useStudio((s) => s.addText);
  const setLeftTab = useStudio((s) => s.setLeftTab);
  const addImages = useStudio((s) => s.addImages);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<"layers" | "library" | "motion" | null>(null);

  return (
    <div className="border-t border-line bg-surface md:hidden">
      {open ? (
        <div className="studio-scroll max-h-[42vh] overflow-y-auto p-3">
          {open === "layers" ? <LayersList /> : null}
          {open === "library" ? <LibraryPanel /> : null}
          {open === "motion" ? <MobileMotion /> : null}
        </div>
      ) : null}
      <div className="flex items-center justify-around py-2">
        <button className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted" onClick={togglePlay}>
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          Play
        </button>
        <button className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted" onClick={addText}>
          <Type className="size-5" />
          Text
        </button>
        <button
          className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted"
          onClick={() => setOpen(open === "library" ? null : "library")}
        >
          <Library className="size-5" />
          Icons
        </button>
        <button
          className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="size-5" />
          Image
        </button>
        <button
          className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted"
          onClick={() => setOpen(open === "motion" ? null : "motion")}
        >
          <Sparkles className="size-5" />
          Motion
        </button>
        <button
          className="flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-wider text-muted"
          onClick={() => {
            setLeftTab("layers");
            setOpen(open === "layers" ? null : "layers");
          }}
        >
          <Layers3 className="size-5" />
          Layers
        </button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            if (files.length) void addImages(files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function Tour() {
  const show = useStudio((s) => s.showTour);
  const dismiss = useStudio((s) => s.dismissTour);
  const [step, setStep] = useState(0);
  if (!show) return null;
  const steps = [
    {
      title: "A board, not a timeline first",
      body: "Drop images, pick line icons, or type a title. Each becomes a layer the hand will draw.",
    },
    {
      title: "Motion lives under the board",
      body: "Fourteen packs sit in the strip: sketch artist, chalk talk, rain, kinetic, typewriter. Tap a pack, then Play.",
    },
    {
      title: "Play, present, export",
      body: "Space plays. F presents. Export a WebM of the drawing, or a PNG of the final frame. Everything stays on this device.",
    },
  ];
  const s = steps[step]!;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-elevated p-6 shadow-pop">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {step + 1} / {steps.length}
        </p>
        <h2 className="mt-2 font-display text-2xl">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={dismiss}>
            Skip
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ChevronRight />
            </Button>
          ) : (
            <Button onClick={dismiss}>Start drawing</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportOverlay() {
  const exporting = useStudio((s) => s.exporting);
  const progress = useStudio((s) => s.exportProgress);
  if (!exporting) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45">
      <div className="w-80 rounded-xl bg-elevated p-6 text-center shadow-pop">
        <Clapperboard className="mx-auto mb-3" />
        <p className="font-display text-xl">Encoding the board</p>
        <p className="mt-1 text-sm text-muted">Music on this board is mixed into the file. Keep the tab open.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-deep">
          <div className="h-full bg-marker" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="mt-2 font-mono text-xs tabular-nums">{Math.round(progress * 100)}%</p>
      </div>
    </div>
  );
}

function MusicSync() {
  const project = useStudio((s) => s.project);
  const playing = useStudio((s) => s.playing);
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !project?.musicSrc) return;
    el.volume = project.musicVolume;
    if (playing) {
      el.currentTime = useStudio.getState().time;
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing, project?.musicSrc, project?.musicVolume]);

  if (!project?.musicSrc) return null;
  return <audio ref={ref} src={project.musicSrc} />;
}

function ProjectPicker() {
  const metas = useStudio((s) => s.metas);
  const createBlank = useStudio((s) => s.createBlank);
  const createFromTemplate = useStudio((s) => s.createFromTemplate);
  const removeProject = useStudio((s) => s.removeProject);
  const importJson = useStudio((s) => s.importJson);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl">
          <Mark />
          Chalkline
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              void importJson(file).then((id) => {
                if (id) void navigate({ to: "/studio", search: { p: id } });
                else toast.error("Could not read that board file");
              });
            }}
          />
          <Button
            onClick={() => {
              void createBlank().then(() => {
                const id = useStudio.getState().project?.id;
                if (id) void navigate({ to: "/studio", search: { p: id } });
              });
            }}
          >
            <Plus /> New board
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-16">
        <h1 className="font-display text-4xl">Your boards</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Saved privately in this browser. Start from a template or a blank page.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STARTER_MINI.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                void createFromTemplate(t.id).then((id) => {
                  void navigate({ to: "/studio", search: { p: id } });
                });
              }}
              className="rounded-xl border border-line bg-elevated p-5 text-left shadow-soft hover:border-marker"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Template</p>
              <p className="mt-2 font-display text-2xl">{t.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{t.blurb}</p>
            </button>
          ))}
        </div>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {metas.map((m) => (
            <li key={m.id} className="flex items-center gap-4 py-4">
              <Link to="/studio" search={{ p: m.id }} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md bg-paper-deep">
                  {m.thumb ? (
                    <img src={m.thumb} alt="" className="size-full object-cover" />
                  ) : (
                    <Pencil className="size-5 text-muted" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.name}</span>
                  <span className="text-xs text-muted">
                    {m.layerCount} layers · {formatTime(m.duration)} · {m.aspect}
                  </span>
                </span>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={() => void removeProject(m.id)} aria-label="Delete">
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

const STARTER_MINI = [
  { id: "meet", title: "Product intro", blurb: "Hook, three steps, close." },
  { id: "water", title: "Science diagram", blurb: "A classroom cycle with icons." },
  { id: "startup", title: "Growth loop", blurb: "Four beats of a product story." },
];
