import { downloadBlob, clamp } from "@/lib/utils";
import { prepareProject, renderFrame, type PreparedProject } from "./engine";
import type { Project } from "@/lib/project/types";
import { canvasSize } from "@/lib/project/types";
import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";

export type VideoFormat = "webm" | "mp4";

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
  return exportMovie(project, { ...opts, format: "webm" });
}

export async function exportMovie(
  project: Project,
  opts: {
    format: VideoFormat;
    fps?: number;
    onProgress?: (p: number) => void;
    signal?: AbortSignal;
  },
) {
  const fps = opts.fps ?? 30;
  const format = opts.format;
  const prepared = await prepareProject(project);
  const canvas = document.createElement("canvas");
  canvas.width = prepared.width;
  canvas.height = prepared.height;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const soundtrack = await mixSoundtrack(project, prepared);

  try {
    const blob = await encodeWithMediabunny({
      canvas,
      ctx,
      prepared,
      soundtrack,
      format,
      fps,
      onProgress: opts.onProgress,
      signal: opts.signal,
    });
    downloadBlob(blob, `${slug(project.name)}.${format}`);
    return blob;
  } catch (err) {
    if (opts.signal?.aborted) throw err;
    const blob = await encodeWithMediaRecorder({
      canvas,
      ctx,
      prepared,
      soundtrack,
      format,
      fps,
      onProgress: opts.onProgress,
      signal: opts.signal,
    });
    downloadBlob(blob, `${slug(project.name)}.${extForMime(blob.type, format)}`);
    return blob;
  }
}

async function encodeWithMediabunny(args: EncodeArgs): Promise<Blob> {
  const { canvas, ctx, prepared, soundtrack, format, fps, onProgress, signal } = args;
  const { width, height } = prepared;
  const duration = prepared.duration;
  const frames = Math.max(1, Math.ceil(duration * fps));
  const dt = 1 / fps;

  const videoCodec = await getFirstEncodableVideoCodec(
    format === "mp4" ? (["avc", "hevc", "vp9", "av1"] as VideoCodec[]) : (["vp9", "vp8", "av1"] as VideoCodec[]),
    { width, height, quality: QUALITY_HIGH },
  );
  if (!videoCodec) throw new Error("No video encoder");

  const audioCodec = soundtrack
    ? await getFirstEncodableAudioCodec(
        format === "mp4"
          ? (["aac", "opus", "pcm-s16"] as AudioCodec[])
          : (["opus", "vorbis"] as AudioCodec[]),
      )
    : null;
  if (soundtrack && !audioCodec) throw new Error("No audio encoder");

  const target = new BufferTarget();
  const output = new Output({
    format: format === "mp4" ? new Mp4OutputFormat({ fastStart: "in-memory" }) : new WebMOutputFormat(),
    target,
  });

  const videoSource = new CanvasSource(canvas, {
    codec: videoCodec,
    quality: QUALITY_HIGH,
    keyFrameInterval: 2,
  });
  output.addVideoTrack(videoSource, { frameRate: fps });

  let audioSource: AudioBufferSource | null = null;
  if (soundtrack && audioCodec) {
    audioSource = new AudioBufferSource({ codec: audioCodec, quality: QUALITY_HIGH });
    output.addAudioTrack(audioSource);
  }

  await output.start();
  if (audioSource && soundtrack) await audioSource.add(soundtrack);

  for (let i = 0; i < frames; i++) {
    if (signal?.aborted) {
      await output.cancel().catch(() => {});
      throw new DOMException("Aborted", "AbortError");
    }
    const t = Math.min(duration, (i / frames) * duration);
    renderFrame(ctx, prepared, t, "play");
    await videoSource.add(i * dt, dt);
    if (i % 4 === 0) {
      onProgress?.(i / frames);
      await wait(0);
    }
  }

  await output.finalize();
  onProgress?.(1);
  const buffer = target.buffer;
  if (!buffer) throw new Error("Empty file");
  return new Blob([buffer], { type: format === "mp4" ? "video/mp4" : "video/webm" });
}

async function encodeWithMediaRecorder(args: EncodeArgs): Promise<Blob> {
  const { canvas, ctx, prepared, soundtrack, format, fps, onProgress, signal } = args;
  const duration = prepared.duration;
  const frames = Math.max(1, Math.ceil(duration * fps));
  const frameTime = 1000 / fps;
  const canvasStream = canvas.captureStream(fps);
  const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  let audioCtx: AudioContext | null = null;
  if (soundtrack) {
    audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    const src = audioCtx.createBufferSource();
    src.buffer = soundtrack;
    src.connect(dest);
    src.start(0);
    tracks.push(...dest.stream.getAudioTracks());
  }

  const stream = new MediaStream(tracks);
  const mime = pickMime(format, Boolean(soundtrack));
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 4_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mime }));
    recorder.onerror = () => reject(new Error("Recording failed"));
  });
  recorder.start();

  for (let i = 0; i <= frames; i++) {
    if (signal?.aborted) {
      recorder.stop();
      await audioCtx?.close().catch(() => {});
      throw new DOMException("Aborted", "AbortError");
    }
    const t = (i / frames) * duration;
    renderFrame(ctx, prepared, t, "play");
    onProgress?.(i / frames);
    await wait(frameTime);
  }

  recorder.stop();
  const blob = await done;
  canvasStream.getTracks().forEach((tr) => tr.stop());
  stream.getTracks().forEach((tr) => tr.stop());
  await audioCtx?.close().catch(() => {});
  return blob;
}

type EncodeArgs = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  prepared: PreparedProject;
  soundtrack: AudioBuffer | null;
  format: VideoFormat;
  fps: number;
  onProgress?: (p: number) => void;
  signal?: AbortSignal;
};

async function mixSoundtrack(project: Project, prepared: PreparedProject): Promise<AudioBuffer | null> {
  const duration = Math.max(0.25, prepared.duration);
  const hasMusic = Boolean(project.musicSrc);
  const hasSfx = Boolean(project.sfx);
  if (!hasMusic && !hasSfx) return null;
  if (typeof OfflineAudioContext === "undefined") return null;

  const sampleRate = 44100;
  const length = Math.max(1, Math.ceil(sampleRate * duration));
  const offline = new OfflineAudioContext(2, length, sampleRate);

  if (hasMusic && project.musicSrc) {
    try {
      const decoded = await decodeMusic(project.musicSrc);
      const src = offline.createBufferSource();
      src.buffer = decoded;
      const gain = offline.createGain();
      gain.gain.value = clamp(project.musicVolume ?? 0.4, 0, 1);
      src.connect(gain);
      gain.connect(offline.destination);
      src.start(0);
      src.stop(duration);
    } catch {
      if (!hasSfx) return null;
    }
  }

  if (hasSfx) {
    let acc = 0;
    for (const scene of prepared.scenes) {
      for (const prep of scene.layers) {
        if (!prep.layer.visible) continue;
        const at = acc + prep.layer.start;
        if (at >= duration) continue;
        tickAt(offline, at);
      }
      acc += scene.duration;
    }
  }

  return offline.startRendering();
}

async function decodeMusic(src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  const raw = await res.arrayBuffer();
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(raw.slice(0));
  } finally {
    await ctx.close().catch(() => {});
  }
}

function tickAt(ctx: OfflineAudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 680;
  gain.gain.setValueAtTime(0.05, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.08);
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

function pickMime(format: VideoFormat, withAudio: boolean) {
  const list =
    format === "mp4"
      ? withAudio
        ? ["video/mp4;codecs=avc1.4d001f,mp4a.40.2", "video/mp4"]
        : ["video/mp4;codecs=avc1.4d001f", "video/mp4"]
      : withAudio
        ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        : ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const t of list) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return format === "mp4" ? "video/mp4" : "video/webm";
}

function extForMime(mime: string, fallback: VideoFormat) {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  return fallback;
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "chalkline";
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
