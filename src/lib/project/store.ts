import { create } from "zustand";
import { exportMovie, exportPng, renderThumb, type VideoFormat } from "@/lib/animation/export";
import { localTime, prepareProject, type PreparedProject } from "@/lib/animation/engine";
import { armSfx, playMarkerTap, setScratch } from "@/lib/animation/sfx";
import {
  iconLayer,
  makeProject,
  makeScene,
  projectDuration,
  sequenceLayers,
  textLayer,
} from "./factory";
import {
  deleteProject,
  lastProjectId,
  listProjects,
  loadProject,
  normalizeProject,
  saveProject,
  toMeta,
} from "./persist";
import { STARTER_TEMPLATES } from "./samples";
import { BOARD_LOOKS, MOTION_PRESETS } from "./presets";
import { getClip } from "./clips";
import type { AnimSettings, Layer, Project, ProjectMeta, Scene, ShapeKind } from "./types";
import { canvasSize, resolveAnim } from "./types";
import { downloadBlob, uid } from "@/lib/utils";

export type Tool = "select" | "text" | "icon" | "rect" | "ellipse" | "arrow" | "highlight";
export type LeftTab = "layers" | "library" | "captions" | "notes";

const MAX_HISTORY = 40;
const SNAP = 20;

type StudioState = {
  ready: boolean;
  metas: ProjectMeta[];
  project: Project | null;
  prepared: PreparedProject | null;
  preparing: boolean;
  selectedId: string | null;
  tool: Tool;
  leftTab: LeftTab;
  playing: boolean;
  time: number;
  playSpeed: number;
  showTour: boolean;
  exporting: boolean;
  exportProgress: number;
  history: string[];
  future: string[];
  dirty: boolean;
  missing: boolean;
  presenting: boolean;
  showHelp: boolean;
  motionClipboard: AnimSettings | null;

  init: () => Promise<void>;
  refreshMetas: () => Promise<void>;
  load: (id: string) => Promise<void>;
  createBlank: () => Promise<void>;
  createFromTemplate: (id: string) => Promise<string>;
  duplicate: () => Promise<void>;
  rename: (name: string) => void;
  removeProject: (id: string) => Promise<void>;
  mutate: (fn: (p: Project) => void, opts?: { history?: boolean; prepare?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
  setTool: (t: Tool) => void;
  setLeftTab: (t: LeftTab) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (t: number) => void;
  tick: (dt: number) => void;
  addText: () => void;
  addIcon: (iconId: string) => void;
  addShape: (kind: ShapeKind) => void;
  addArrow: () => void;
  addImages: (files: File[]) => Promise<void>;
  deleteSelected: () => void;
  duplicateLayer: () => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  moveLayer: (id: string, x: number, y: number) => void;
  updateAnim: (id: string, patch: Partial<AnimSettings>) => void;
  reorderLayer: (id: string, dir: -1 | 1) => void;
  autoSequence: () => void;
  addScene: () => void;
  deleteScene: (id: string) => void;
  setActiveScene: (id: string) => void;
  addCaption: () => void;
  sliceSelected: (cols: number, rows: number) => Promise<void>;
  persist: () => Promise<void>;
  exportVideo: (format?: VideoFormat) => Promise<void>;
  exportStill: () => Promise<void>;
  dismissTour: () => void;
  applyBackground: (bg: Project["background"]) => void;
  applyMotionPreset: (id: string, scope: "layer" | "scene") => void;
  setPlaySpeed: (n: number) => void;
  flipSelected: (axis: "x" | "y") => void;
  alignSelected: (edge: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  copyMotion: () => void;
  pasteMotion: () => void;
  duplicateScene: () => void;
  staggerWithGap: (gap: number) => void;
  scaleTiming: (factor: number) => void;
  nudgeSelected: (dx: number, dy: number) => void;
  applyLook: (id: string) => void;
  setPresenting: (v: boolean) => void;
  setShowHelp: (v: boolean) => void;
  toggleFlag: (key: "snap" | "grid" | "spotlight" | "sfx" | "scribe") => void;
  exportJson: () => void;
  importJson: (file: File) => Promise<string | null>;
  stampClip: (id: string) => void;
  applyGenerated: (generated: Project) => void;
  createFromGenerated: (generated: Project) => Promise<string>;
};

function sceneOf(p: Project): Scene {
  return p.scenes.find((s) => s.id === p.activeSceneId) ?? p.scenes[0]!;
}

function snapshot(p: Project) {
  return JSON.stringify(p);
}

function patchPreparedPos(prepared: PreparedProject | null, id: string, x: number, y: number) {
  if (!prepared) return prepared;
  for (const sc of prepared.scenes) {
    for (const pl of sc.layers) {
      if (pl.layer.id === id) {
        pl.layer.x = x;
        pl.layer.y = y;
      }
    }
  }
  return { ...prepared };
}

export const useStudio = create<StudioState>((set, get) => ({
  ready: false,
  metas: [],
  project: null,
  prepared: null,
  preparing: false,
  selectedId: null,
  tool: "select",
  leftTab: "layers",
  playing: false,
  time: 0,
  playSpeed: 1,
  showTour: false,
  exporting: false,
  exportProgress: 0,
  history: [],
  future: [],
  dirty: false,
  missing: false,
  presenting: false,
  showHelp: false,
  motionClipboard: null,

  init: async () => {
    if (typeof window === "undefined") return;
    let metas = await listProjects();
    if (metas.length === 0) {
      for (const t of STARTER_TEMPLATES) {
        const p = t.build();
        await saveProject(p);
      }
      metas = await listProjects();
      try {
        if (!localStorage.getItem("chalkline:tour")) set({ showTour: true });
      } catch {
        set({ showTour: true });
      }
    }
    set({ metas, ready: true });
  },

  refreshMetas: async () => {
    const metas = await listProjects();
    set({ metas });
  },

  load: async (id) => {
    const project = await loadProject(id);
    if (!project) {
      set({ project: null, prepared: null, preparing: false, missing: true });
      return;
    }
    set({
      project,
      selectedId: null,
      time: 0,
      playing: false,
      history: [snapshot(project)],
      future: [],
      dirty: false,
      preparing: true,
      missing: false,
      presenting: false,
    });
    const prepared = await prepareProject(project);
    set({ prepared, preparing: false });
  },

  createBlank: async () => {
    const project = makeProject("Untitled board");
    const s = sceneOf(project);
    s.layers = sequenceLayers([
      textLayer("Your story starts here", 140, 240, 1000, {
        text: {
          text: "Your story starts here",
          font: "serif",
          weight: 700,
          align: "center",
          color: "#1C1916",
          lineHeight: 1.1,
        },
      }),
      iconLayer("lightbulb", 540, 360, 180),
    ]);
    await saveProject(project);
    await get().load(project.id);
    await get().refreshMetas();
  },

  createFromTemplate: async (id: string) => {
    const t = STARTER_TEMPLATES.find((x) => x.id === id) ?? STARTER_TEMPLATES[0]!;
    const project = t.build();
    project.id = uid("pr");
    project.createdAt = Date.now();
    await saveProject(project);
    await get().refreshMetas();
    return project.id;
  },

  duplicate: async () => {
    const p = get().project;
    if (!p) return;
    const copy: Project = JSON.parse(JSON.stringify(p));
    copy.id = uid("pr");
    copy.name = `${p.name} copy`;
    copy.createdAt = Date.now();
    await saveProject(copy);
    await get().load(copy.id);
    await get().refreshMetas();
  },

  rename: (name) => {
    get().mutate((p) => {
      p.name = name;
    });
  },

  removeProject: async (id) => {
    await deleteProject(id);
    if (get().project?.id === id) set({ project: null, prepared: null });
    await get().refreshMetas();
  },

  mutate: (fn, opts) => {
    const project = get().project;
    if (!project) return;
    const next: Project = JSON.parse(JSON.stringify(project));
    fn(next);
    next.updatedAt = Date.now();
    const history = opts?.history === false ? get().history : [...get().history, snapshot(project)].slice(-MAX_HISTORY);
    set({ project: next, dirty: true, history, future: opts?.history === false ? get().future : [] });
    if (opts?.prepare !== false) {
      void (async () => {
        set({ preparing: true });
        try {
          const prepared = await prepareProject(next);
          if (get().project?.id === next.id && get().project?.updatedAt === next.updatedAt) {
            set({ prepared, preparing: false });
          }
        } catch {
          set({ preparing: false });
        }
      })();
    }
  },

  undo: () => {
    const { history, project } = get();
    if (history.length < 2 || !project) return;
    const prev = history[history.length - 2]!;
    const current = history[history.length - 1]!;
    const restored = JSON.parse(prev) as Project;
    set({
      project: restored,
      history: history.slice(0, -1),
      future: [current, ...get().future],
      dirty: true,
    });
    void prepareProject(restored).then((prepared) => set({ prepared }));
  },

  redo: () => {
    const { future } = get();
    if (!future.length) return;
    const [head, ...rest] = future;
    const restored = JSON.parse(head!) as Project;
    set({
      project: restored,
      history: [...get().history, head!],
      future: rest,
      dirty: true,
    });
    void prepareProject(restored).then((prepared) => set({ prepared }));
  },

  select: (id) => set({ selectedId: id }),
  setTool: (t) => set({ tool: t }),
  setLeftTab: (t) => set({ leftTab: t }),

  play: () => {
    armSfx();
    set({ playing: true });
  },
  pause: () => {
    setScratch(false);
    set({ playing: false });
  },
  togglePlay: () => {
    const { playing, time, prepared } = get();
    if (playing) {
      setScratch(false);
      set({ playing: false });
      return;
    }
    armSfx();
    if (prepared && time >= prepared.duration - 0.05) {
      set({ time: 0, playing: true });
      return;
    }
    set({ playing: true });
  },
  seek: (t) => set({ time: Math.max(0, t), playing: false }),
  tick: (dt) => {
    const { playing, time, prepared, playSpeed, project } = get();
    if (!playing || !prepared) return;
    const prev = time;
    let next = time + dt * playSpeed;
    if (next >= prepared.duration) {
      if (project?.loop) next = 0;
      else {
        setScratch(false);
        set({ time: prepared.duration, playing: false });
        return;
      }
    }
    if (project?.sfx !== false) {
      try {
        const loc = localTime(prepared, next);
        let drawing = false;
        for (const layer of loc.scene.scene.layers) {
          if (!layer.visible) continue;
          if (prev < layer.start && next >= layer.start) playMarkerTap();
          if (
            next >= layer.start &&
            next < layer.start + layer.duration &&
            resolveAnim(layer.anim).hand !== "ghost"
          ) {
            drawing = true;
          }
        }
        setScratch(drawing);
      } catch {
        /* ignore */
      }
    } else {
      setScratch(false);
    }
    set({ time: next });
  },

  addText: () => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      const layer = textLayer("New title", 200, 200, 720);
      layer.start = end + 0.12;
      s.layers.push(layer);
      set({ selectedId: layer.id, tool: "select" });
    });
  },

  addIcon: (iconId) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      const layer = iconLayer(iconId, 480, 180, 220);
      layer.start = end + 0.12;
      s.layers.push(layer);
      set({ selectedId: layer.id, leftTab: "layers" });
    });
  },

  addShape: (kind) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      const names: Record<ShapeKind, string> = {
        rect: "Box",
        ellipse: "Oval",
        line: "Line",
        highlight: "Highlight",
        bubble: "Speech",
        callout: "Callout",
      };
      const layer: Layer = {
        ...iconLayer("check", 360, 200, 240),
        id: uid("ly"),
        type: "shape",
        name: names[kind],
        width: kind === "highlight" ? 400 : kind === "bubble" ? 360 : 280,
        height: kind === "highlight" ? 90 : kind === "bubble" ? 200 : 180,
        start: end + 0.1,
        duration: 1.6,
        shape: {
          kind,
          fill: kind === "highlight" ? "rgba(31,78,121,0.2)" : "transparent",
          stroke: "#1C1916",
          strokeWidth: 3,
        },
        icon: undefined,
      };
      s.layers.push(layer);
      set({ selectedId: layer.id });
    });
  },

  addArrow: () => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      const layer: Layer = {
        ...iconLayer("check", 200, 260, 280),
        id: uid("ly"),
        type: "arrow",
        name: "Arrow",
        width: 280,
        height: 80,
        start: end + 0.1,
        duration: 1.4,
        arrow: { x2: 280, y2: 40, color: "#1C1916", strokeWidth: 3, dashed: false },
        icon: undefined,
      };
      s.layers.push(layer);
      set({ selectedId: layer.id });
    });
  },

  addImages: async (files) => {
    const urls: { src: string; w: number; h: number; name: string }[] = [];
    for (const file of files) {
      const src = await readFile(file);
      const dim = await imageSize(src);
      urls.push({ src, w: dim.w, h: dim.h, name: file.name.replace(/\.[^.]+$/, "") });
    }
    get().mutate((p) => {
      const s = sceneOf(p);
      let end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      const { width, height } = canvasSize(p);
      for (const u of urls) {
        const maxW = width * 0.55;
        const maxH = height * 0.7;
        const scale = Math.min(maxW / u.w, maxH / u.h, 1);
        const w = u.w * scale;
        const h = u.h * scale;
        const layer: Layer = {
          ...iconLayer("spark", (width - w) / 2, (height - h) / 2, w),
          id: uid("ly"),
          type: "image",
          name: u.name || "Image",
          width: w,
          height: h,
          start: end + 0.15,
          duration: 3.2,
          image: { src: u.src, naturalWidth: u.w, naturalHeight: u.h, filter: "none" },
          icon: undefined,
          anim: {
            ...iconLayer("spark", 0, 0).anim,
            style: "scanner",
            drawStyle: "outline-fill",
            hand: "right-marker",
          },
        };
        s.layers.push(layer);
        end = layer.start + layer.duration;
        set({ selectedId: layer.id });
      }
    });
  },

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    get().mutate((p) => {
      const s = sceneOf(p);
      s.layers = s.layers.filter((l) => l.id !== id);
      s.captions = s.captions.filter((c) => c.id !== id);
    });
    set({ selectedId: null });
  },

  duplicateLayer: () => {
    const id = get().selectedId;
    if (!id) return;
    get().mutate((p) => {
      const s = sceneOf(p);
      const layer = s.layers.find((l) => l.id === id);
      if (!layer) return;
      const copy = { ...JSON.parse(JSON.stringify(layer)), id: uid("ly"), x: layer.x + 24, y: layer.y + 24, name: `${layer.name} copy` };
      s.layers.push(copy);
      set({ selectedId: copy.id });
    });
  },

  updateLayer: (id, patch) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const layer = s.layers.find((l) => l.id === id);
      if (layer) Object.assign(layer, patch);
    });
  },

  moveLayer: (id, x, y) => {
    const snap = get().project?.snap;
    if (snap) {
      x = Math.round(x / SNAP) * SNAP;
      y = Math.round(y / SNAP) * SNAP;
    }
    get().mutate(
      (p) => {
        const s = sceneOf(p);
        const layer = s.layers.find((l) => l.id === id);
        if (layer) {
          layer.x = x;
          layer.y = y;
        }
      },
      { prepare: false, history: false },
    );
    set({ prepared: patchPreparedPos(get().prepared, id, x, y) });
  },

  updateAnim: (id, patch) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const layer = s.layers.find((l) => l.id === id);
      if (layer) Object.assign(layer.anim, patch);
    });
  },

  reorderLayer: (id, dir) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const i = s.layers.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.layers.length) return;
      const [item] = s.layers.splice(i, 1);
      s.layers.splice(j, 0, item!);
    });
  },

  autoSequence: () => {
    get().mutate((p) => {
      sequenceLayers(sceneOf(p).layers);
    });
  },

  addScene: () => {
    get().mutate((p) => {
      const scene = makeScene(`Scene ${p.scenes.length + 1}`);
      p.scenes.push(scene);
      p.activeSceneId = scene.id;
      set({ selectedId: null, time: projectDuration(p) - sceneDurationSafe(scene) });
    });
  },

  deleteScene: (id) => {
    get().mutate((p) => {
      if (p.scenes.length <= 1) return;
      p.scenes = p.scenes.filter((s) => s.id !== id);
      if (p.activeSceneId === id) p.activeSceneId = p.scenes[0]!.id;
    });
  },

  setActiveScene: (id) => {
    get().mutate(
      (p) => {
        p.activeSceneId = id;
      },
      { history: false, prepare: false },
    );
    set({ selectedId: null });
  },

  addCaption: () => {
    get().mutate((p) => {
      const s = sceneOf(p);
      s.captions.push({
        id: uid("cap"),
        text: "New caption",
        start: get().time,
        end: get().time + 2.5,
      });
    });
  },

  sliceSelected: async (cols, rows) => {
    const { project, selectedId } = get();
    if (!project || !selectedId) return;
    const s = sceneOf(project);
    const layer = s.layers.find((l) => l.id === selectedId);
    if (!layer || layer.type !== "image" || !layer.image) return;
    const tiles = await sliceImage(layer, cols, rows);
    get().mutate((p) => {
      const sc = sceneOf(p);
      const idx = sc.layers.findIndex((l) => l.id === selectedId);
      if (idx < 0) return;
      const orig = sc.layers[idx]!;
      sc.layers.splice(idx, 1, ...tiles.map((t, i) => ({
        ...JSON.parse(JSON.stringify(orig)),
        id: uid("ly"),
        name: `${orig.name} ${i + 1}`,
        x: orig.x + t.x,
        y: orig.y + t.y,
        width: t.w,
        height: t.h,
        start: orig.start + i * 0.45,
        duration: Math.max(1.2, orig.duration / tiles.length + 0.6),
        image: { src: t.src, naturalWidth: t.w, naturalHeight: t.h, filter: orig.image?.filter ?? "none" },
      })));
    });
  },

  persist: async () => {
    const { project, prepared } = get();
    if (!project) return;
    let thumb: string | undefined;
    if (prepared) {
      try {
        thumb = await renderThumb(prepared);
      } catch {
        /* ignore */
      }
    }
    await saveProject(project, thumb);
    set({ dirty: false });
    await get().refreshMetas();
  },

  exportVideo: async (format = "mp4") => {
    const project = get().project;
    if (!project) return;
    set({ exporting: true, exportProgress: 0, playing: false });
    try {
      await exportMovie(project, {
        format,
        onProgress: (p) => set({ exportProgress: p }),
      });
    } finally {
      set({ exporting: false, exportProgress: 1 });
    }
  },

  exportStill: async () => {
    const project = get().project;
    if (!project) return;
    await exportPng(project);
  },

  dismissTour: () => {
    set({ showTour: false });
    try {
      localStorage.setItem("chalkline:tour", "1");
    } catch {
      /* ignore */
    }
  },

  applyBackground: (bg) => {
    get().mutate((p) => {
      p.background = bg;
    });
  },

  applyMotionPreset: (id, scope) => {
    const preset = MOTION_PRESETS.find((x) => x.id === id);
    if (!preset) return;
    const selectedId = get().selectedId;
    get().mutate((p) => {
      const s = sceneOf(p);
      const targets =
        scope === "scene" || !selectedId
          ? s.layers
          : s.layers.filter((l) => l.id === selectedId);
      for (const layer of targets) {
        layer.anim = resolveAnim({ ...layer.anim, ...preset.anim });
      }
    });
  },

  setPlaySpeed: (n) => set({ playSpeed: n }),

  flipSelected: (axis) => {
    const id = get().selectedId;
    if (!id) return;
    get().mutate((p) => {
      const s = sceneOf(p);
      const layer = s.layers.find((l) => l.id === id);
      if (!layer) return;
      if (axis === "x") layer.flipX = !layer.flipX;
      else layer.flipY = !layer.flipY;
    });
  },

  alignSelected: (edge) => {
    const { project, selectedId } = get();
    if (!project || !selectedId) return;
    const { width, height } = canvasSize(project);
    get().mutate((p) => {
      const s = sceneOf(p);
      const layer = s.layers.find((l) => l.id === selectedId);
      if (!layer) return;
      if (edge === "left") layer.x = 40;
      if (edge === "center") layer.x = (width - layer.width) / 2;
      if (edge === "right") layer.x = width - layer.width - 40;
      if (edge === "top") layer.y = 40;
      if (edge === "middle") layer.y = (height - layer.height) / 2;
      if (edge === "bottom") layer.y = height - layer.height - 40;
    });
  },

  copyMotion: () => {
    const { project, selectedId } = get();
    if (!project || !selectedId) return;
    const layer = sceneOf(project).layers.find((l) => l.id === selectedId);
    if (!layer) return;
    set({ motionClipboard: resolveAnim(layer.anim) });
  },

  pasteMotion: () => {
    const { motionClipboard, selectedId } = get();
    if (!motionClipboard || !selectedId) return;
    get().updateAnim(selectedId, motionClipboard);
  },

  duplicateScene: () => {
    get().mutate((p) => {
      const s = sceneOf(p);
      const copy = JSON.parse(JSON.stringify(s)) as Scene;
      copy.id = uid("sc");
      copy.name = `${s.name} copy`;
      const i = p.scenes.findIndex((x) => x.id === s.id);
      p.scenes.splice(i + 1, 0, copy);
      p.activeSceneId = copy.id;
      set({ selectedId: null });
    });
  },

  staggerWithGap: (gap) => {
    get().mutate((p) => {
      sequenceLayers(sceneOf(p).layers, gap);
    });
  },

  scaleTiming: (factor) => {
    get().mutate((p) => {
      const s = sceneOf(p);
      for (const layer of s.layers) {
        layer.start *= factor;
        layer.duration *= factor;
      }
      for (const cap of s.captions) {
        cap.start *= factor;
        cap.end *= factor;
      }
    });
  },

  nudgeSelected: (dx, dy) => {
    const { project, selectedId } = get();
    if (!project || !selectedId) return;
    const layer = sceneOf(project).layers.find((l) => l.id === selectedId);
    if (!layer || layer.locked) return;
    get().moveLayer(selectedId, layer.x + dx, layer.y + dy);
  },

  applyLook: (id) => {
    const look = BOARD_LOOKS.find((x) => x.id === id);
    if (!look) return;
    get().mutate((p) => {
      p.background = look.bg;
      for (const scene of p.scenes) {
        for (const layer of scene.layers) {
          layer.anim = resolveAnim({ ...layer.anim, color: look.ink, strokeStyle: look.stroke });
          if (layer.icon) layer.icon.color = look.ink;
          if (layer.text) layer.text.color = look.ink;
          if (layer.shape) layer.shape.stroke = look.ink;
          if (layer.arrow) layer.arrow.color = look.ink;
        }
      }
    });
  },

  setPresenting: (v) => set({ presenting: v, playing: v ? true : get().playing }),
  setShowHelp: (v) => set({ showHelp: v }),

  toggleFlag: (key) => {
    get().mutate(
      (p) => {
        p[key] = !p[key];
      },
      { prepare: key === "grid" || key === "spotlight" || key === "scribe" ? true : false },
    );
  },

  exportJson: () => {
    const p = get().project;
    if (!p) return;
    const name = p.name.replace(/[^\w.-]+/g, "-") || "board";
    downloadBlob(new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }), `${name}.chalkline.json`);
  },

  importJson: async (file) => {
    try {
      const text = await file.text();
      const data = normalizeProject(JSON.parse(text) as Project);
      data.id = uid("pr");
      data.createdAt = Date.now();
      data.updatedAt = Date.now();
      await saveProject(data);
      await get().refreshMetas();
      return data.id;
    } catch {
      return null;
    }
  },

  stampClip: (id) => {
    const clip = getClip(id);
    const project = get().project;
    if (!clip || !project) return;
    const size = canvasSize(project);
    const built = clip.build(size);
    get().mutate((p) => {
      const s = sceneOf(p);
      const end = Math.max(0, ...s.layers.map((l) => l.start + l.duration));
      for (const layer of built.layers) {
        layer.start += end;
        s.layers.push(layer);
      }
      if (built.captions) {
        for (const c of built.captions) {
          s.captions.push({ ...c, start: c.start + end, end: c.end + end });
        }
      }
      const last = built.layers[built.layers.length - 1];
      if (last) set({ selectedId: last.id });
    });
  },

  applyGenerated: (generated) => {
    get().mutate((p) => {
      p.name = generated.name;
      p.aspect = generated.aspect;
      p.background = generated.background;
      p.solidColor = generated.solidColor;
      p.notes = generated.notes;
      p.scenes = generated.scenes;
      p.activeSceneId = generated.scenes[0]?.id ?? p.activeSceneId;
    });
    set({ time: 0, selectedId: null, playing: false });
  },

  createFromGenerated: async (generated) => {
    const project: Project = JSON.parse(JSON.stringify(generated));
    project.id = uid("pr");
    project.createdAt = Date.now();
    project.updatedAt = Date.now();
    await saveProject(project);
    await get().refreshMetas();
    return project.id;
  },
}));

function sceneDurationSafe(scene: Scene) {
  const ends = scene.layers.map((l) => l.start + l.duration);
  return Math.max(0.5, ...ends, 0) + scene.hold;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function imageSize(src: string) {
  return new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

async function sliceImage(layer: Layer, cols: number, rows: number) {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = layer.image!.src;
  });
  const tiles: { src: string; x: number; y: number; w: number; h: number }[] = [];
  const tw = layer.width / cols;
  const th = layer.height / rows;
  const c = document.createElement("canvas");
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      c.width = Math.max(1, Math.round(tw));
      c.height = Math.max(1, Math.round(th));
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(
        img,
        (col * img.naturalWidth) / cols,
        (r * img.naturalHeight) / rows,
        img.naturalWidth / cols,
        img.naturalHeight / rows,
        0,
        0,
        c.width,
        c.height,
      );
      tiles.push({
        src: c.toDataURL("image/png"),
        x: col * tw,
        y: r * th,
        w: tw,
        h: th,
      });
    }
  }
  return tiles;
}

export function lastId() {
  return lastProjectId();
}

export function durationOf(p: Project | null, prepared: PreparedProject | null) {
  if (prepared) return prepared.duration;
  if (p) return projectDuration(p);
  return 0;
}
