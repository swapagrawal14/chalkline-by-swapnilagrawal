import type { Layer, Project, ProjectMeta } from "./types";
import { canvasSize, resolveAnim } from "./types";
import { projectDuration } from "./factory";

const DB_NAME = "chalkline-db";
const STORE = "projects";
const LAST_KEY = "chalkline:last";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function normalizeProject(raw: Project): Project {
  const p = raw;
  p.snap = Boolean(p.snap);
  p.grid = Boolean(p.grid);
  p.spotlight = Boolean(p.spotlight);
  p.sfx = p.sfx !== false;
  p.scribe = p.scribe !== false;
  p.loop = Boolean(p.loop);
  p.musicVolume = typeof p.musicVolume === "number" ? p.musicVolume : 0.4;
  p.notes = p.notes ?? "";
  p.solidColor = p.solidColor ?? "#F4EFE6";
  const { width, height } = canvasSize(p);
  const hasMusic = Boolean(p.musicSrc);
  for (const scene of p.scenes ?? []) {
    scene.transition = scene.transition ?? "cut";
    scene.hold = typeof scene.hold === "number" ? scene.hold : 0.45;
    if (hasMusic) scene.hold = Math.min(scene.hold, 0.12);
    scene.captions = scene.captions ?? [];
    scene.layers = (scene.layers ?? []).map((layer) => {
      const anim = resolveAnim(layer.anim);
      anim.speed = Math.min(anim.speed ?? 1, 1);
      if (layer.type === "image" && layer.image?.filter === "sketch") {
        layer.image.filter = "none";
      }
      if (layer.type === "text" && layer.text) {
        if (anim.textAnim === "fade") anim.textAnim = "typewriter";
      }
      const next: Layer = { ...layer, locked: Boolean(layer.locked), anim };
      clampLayerToBoard(next, width, height);
      return next;
    });
    const layerEnd = Math.max(0, ...scene.layers.map((l) => l.start + l.duration));
    for (const cap of scene.captions) {
      if (cap.end > layerEnd + 0.4) cap.end = layerEnd + 0.25;
      if (cap.start < 0) cap.start = 0;
    }
  }
  return p;
}

function clampLayerToBoard(layer: Layer, width: number, height: number) {
  const pad = 12;
  layer.width = Math.max(24, Math.min(layer.width, width - pad * 2));
  layer.height = Math.max(layer.type === "arrow" ? 8 : 24, Math.min(layer.height, height - pad * 2));
  layer.x = Math.max(pad, Math.min(layer.x, width - layer.width - pad));
  layer.y = Math.max(pad, Math.min(layer.y, height - layer.height - pad));
}

export function scaleTimeline(project: Project, target: number) {
  const cur = projectDuration(project);
  if (cur < 0.5 || target < 0.5) return;
  if (Math.abs(cur - target) / target < 0.04) return;
  const k = target / cur;
  for (const scene of project.scenes) {
    scene.hold = Math.max(0, scene.hold * k);
    for (const layer of scene.layers) {
      layer.start *= k;
      layer.duration *= k;
    }
    for (const cap of scene.captions) {
      cap.start *= k;
      cap.end *= k;
    }
  }
}

export function probeAudioDuration(src: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof Audio === "undefined") {
      resolve(null);
      return;
    }
    const a = new Audio();
    let settled = false;
    const done = (v: number | null) => {
      if (settled) return;
      settled = true;
      a.removeAttribute("src");
      resolve(v);
    };
    a.preload = "metadata";
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) && a.duration > 0 ? a.duration : null);
    a.onerror = () => done(null);
    window.setTimeout(() => done(null), 5000);
    a.src = src;
  });
}

export async function fitProjectToMusic(project: Project) {
  if (!project.musicSrc) return;
  const duration = await probeAudioDuration(project.musicSrc);
  if (duration) scaleTimeline(project, duration);
}

export async function saveProject(project: Project, thumb?: string) {
  project.updatedAt = Date.now();
  const record = { ...project, thumb };
  await tx("readwrite", (s) => s.put(record));
  try {
    localStorage.setItem(LAST_KEY, project.id);
  } catch {
    /* ignore */
  }
}

export async function loadProject(id: string): Promise<Project | null> {
  const rec = await tx<Project & { thumb?: string }>("readonly", (s) => s.get(id));
  if (!rec) return null;
  const { thumb: _t, ...project } = rec as Project & { thumb?: string };
  return normalizeProject(project);
}

export async function deleteProject(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, "readonly");
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as (Project & { thumb?: string })[]) ?? [];
      const metas: ProjectMeta[] = rows
        .map((p) => ({
          id: p.id,
          name: p.name,
          updatedAt: p.updatedAt,
          thumb: p.thumb,
          aspect: p.aspect,
          layerCount: p.scenes.reduce((n, s) => n + s.layers.length, 0),
          duration: projectDuration(p),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(metas);
    };
    req.onerror = () => reject(req.error);
  });
}

export function lastProjectId() {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

export function toMeta(project: Project, thumb?: string): ProjectMeta {
  return {
    id: project.id,
    name: project.name,
    updatedAt: project.updatedAt,
    thumb,
    aspect: project.aspect,
    layerCount: project.scenes.reduce((n, s) => n + s.layers.length, 0),
    duration: projectDuration(project),
  };
}
