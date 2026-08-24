import type { Project, ProjectMeta } from "./types";
import { resolveAnim } from "./types";
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
  for (const scene of p.scenes ?? []) {
    scene.transition = scene.transition ?? "cut";
    scene.hold = typeof scene.hold === "number" ? scene.hold : 0.45;
    scene.captions = scene.captions ?? [];
    scene.layers = (scene.layers ?? []).map((layer) => ({
      ...layer,
      locked: Boolean(layer.locked),
      anim: resolveAnim(layer.anim),
    }));
  }
  return p;
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
