import { downloadBlob } from "@/lib/utils";
import { prepareProject, renderFrame, type PreparedProject } from "./engine";
import type { Project } from "@/lib/project/types";
import { canvasSize } from "@/lib/project/types";

export async function exportPng(project: Project, filename?: string) {
  const prepared = await prepareProject(project);
  const canvas = document.createElement("canvas");
  canvas.width = prepared.width;
  canvas.height = prepared.height;
  const ctx = canvas.getContext("2d")!;
  renderFrame(ctx, prepared, prepared.duration, "play");
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename ?? `${slug(project.name)}-still.png`);
      resolve();
    }, "image/png");
  });
}

export async function exportWebm(
  project: Project,
  opts: {
    fps?: number;
    bitrate?: number;
    onProgress?: (p: number) => void;
    signal?: AbortSignal;
  } = {},
) {
  const fps = opts.fps ?? 30;
  const prepared = await prepareProject(project);
  const canvas = document.createElement("canvas");
  canvas.width = prepared.width;
  canvas.height = prepared.height;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(fps);
  const mime = pickMime();
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: opts.bitrate ?? 4_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    recorder.onerror = () => reject(new Error("Recording failed"));
  });
  recorder.start();

  const duration = prepared.duration;
  const frames = Math.max(1, Math.ceil(duration * fps));
  const frameTime = 1000 / fps;

  for (let i = 0; i <= frames; i++) {
    if (opts.signal?.aborted) {
      recorder.stop();
      throw new DOMException("Aborted", "AbortError");
    }
    const t = (i / frames) * duration;
    renderFrame(ctx, prepared, t, "play");
    opts.onProgress?.(i / frames);
    await wait(frameTime);
  }

  recorder.stop();
  const blob = await done;
  downloadBlob(blob, `${slug(project.name)}.webm`);
  return blob;
}

export async function renderThumb(prepared: PreparedProject) {
  const canvas = document.createElement("canvas");
  const { width, height } = canvasSize(prepared.project);
  const scale = 480 / width;
  canvas.width = 480;
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  renderFrame(ctx, prepared, prepared.duration, "play");
  return canvas.toDataURL("image/jpeg", 0.72);
}

function pickMime() {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "chalkline";
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
