import { getIcon } from "@/lib/animation/icons";
import { captionTheme, paintBackground } from "@/lib/animation/backgrounds";
import { buildCells, orderCells, rasterizeImage, type Cell } from "@/lib/animation/edges";
import { drawHand } from "@/lib/animation/hand";
import { sceneDuration } from "@/lib/project/factory";
import type { Layer, Project, Scene } from "@/lib/project/types";
import { canvasSize, resolveAnim } from "@/lib/project/types";
import { clamp, easeBy, easeInOut, lerp } from "@/lib/utils";

export type EngineMode = "edit" | "play";

interface PathPrep {
  d: string;
  el: SVGPathElement;
  length: number;
}

interface PreparedLayer {
  layer: Layer;
  bitmap?: HTMLCanvasElement;
  cells?: Cell[];
  order?: number[];
  paths?: PathPrep[];
  totalPath?: number;
  iconVb?: number;
}

interface PreparedScene {
  scene: Scene;
  layers: PreparedLayer[];
  duration: number;
}

export interface PreparedProject {
  project: Project;
  width: number;
  height: number;
  scenes: PreparedScene[];
  duration: number;
}

export async function waitFonts() {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

function makePath(d: string): PathPrep {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", d);
  const length = el.getTotalLength();
  return { d, el, length };
}

async function prepareLayer(layer: Layer): Promise<PreparedLayer> {
  if (layer.type === "image" && layer.image) {
    const bitmap = await rasterizeImage(
      layer.image.src,
      layer.width,
      layer.height,
      layer.image.filter,
    );
    const cols = Math.max(6, Math.round(layer.width / 36));
    const rows = Math.max(6, Math.round(layer.height / 36));
    const cells = buildCells(bitmap, cols, rows);
    const order = orderCells(cells, resolveAnim(layer.anim).style, cols, rows);
    return { layer, bitmap, cells, order };
  }
  if (layer.type === "icon" && layer.icon) {
    const def = getIcon(layer.icon.iconId);
    const paths = def.paths.map((d) => makePath(d));
    const totalPath = paths.reduce((a, p) => a + p.length, 0);
    return { layer, paths, totalPath, iconVb: def.viewBox ?? 64 };
  }
  if (layer.type === "shape" && layer.shape) {
    const paths = [makePath(shapePath(layer))];
    return { layer, paths, totalPath: paths[0]!.length };
  }
  if (layer.type === "arrow" && layer.arrow) {
    const paths = [makePath(arrowPath(layer))];
    return { layer, paths, totalPath: paths[0]!.length };
  }
  return { layer };
}

function shapePath(layer: Layer) {
  const w = layer.width;
  const h = layer.height;
  const kind = layer.shape?.kind ?? "rect";
  if (kind === "ellipse" || kind === "callout") {
    const rx = w / 2;
    const ry = h / 2;
    return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx - 0.01} 0`;
  }
  if (kind === "line") {
    return `M 0 ${h / 2} L ${w} ${h / 2}`;
  }
  if (kind === "highlight") {
    return `M 0 0 H ${w} V ${h} H 0 Z`;
  }
  if (kind === "bubble") {
    const tail = Math.min(28, h * 0.22);
    const bh = h - tail;
    const r = Math.min(22, w / 8, bh / 4);
    return `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${bh - r} Q ${w} ${bh} ${w - r} ${bh} H ${w * 0.4} L ${w * 0.28} ${h} L ${w * 0.34} ${bh} H ${r} Q 0 ${bh} 0 ${bh - r} V ${r} Q 0 0 ${r} 0 Z`;
  }
  return `M 0 0 H ${w} V ${h} H 0 Z`;
}

function arrowPath(layer: Layer) {
  const x2 = layer.arrow?.x2 ?? layer.width;
  const y2 = layer.arrow?.y2 ?? layer.height / 2;
  const x1 = 0;
  const y1 = layer.height / 2;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = 16;
  const hx = x2 - Math.cos(ang) * head;
  const hy = y2 - Math.sin(ang) * head;
  const left = `${hx + Math.cos(ang + Math.PI / 2) * 9} ${hy + Math.sin(ang + Math.PI / 2) * 9}`;
  const right = `${hx + Math.cos(ang - Math.PI / 2) * 9} ${hy + Math.sin(ang - Math.PI / 2) * 9}`;
  return `M ${x1} ${y1} L ${x2} ${y2} M ${x2} ${y2} L ${left} M ${x2} ${y2} L ${right}`;
}

export async function prepareProject(project: Project): Promise<PreparedProject> {
  await waitFonts();
  const { width, height } = canvasSize(project);
  const scenes: PreparedScene[] = [];
  for (const scene of project.scenes) {
    const layers: PreparedLayer[] = [];
    for (const layer of scene.layers) {
      try {
        layers.push(await prepareLayer(layer));
      } catch {
        layers.push({ layer });
      }
    }
    scenes.push({ scene, layers, duration: sceneDuration(scene) });
  }
  const duration = scenes.reduce((a, s) => a + s.duration, 0);
  return { project, width, height, scenes, duration: Math.max(0.5, duration) };
}

export function localTime(prepared: PreparedProject, time: number) {
  let t = clamp(time, 0, Math.max(0, prepared.duration - 0.0001));
  for (let i = 0; i < prepared.scenes.length; i++) {
    const s = prepared.scenes[i]!;
    if (t <= s.duration || i === prepared.scenes.length - 1) {
      return { sceneIndex: i, local: clamp(t, 0, s.duration), scene: s };
    }
    t -= s.duration;
  }
  const last = prepared.scenes[prepared.scenes.length - 1]!;
  return { sceneIndex: prepared.scenes.length - 1, local: last.duration, scene: last };
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  prepared: PreparedProject,
  time: number,
  mode: EngineMode,
  selectedIds: string[] = [],
) {
  const { width, height, project } = prepared;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  paintBackground(ctx, width, height, project);

  const { scene, local } = localTime(prepared, time);
  const transition = scene.scene.transition ?? "cut";
  const fadeFor = 0.45;

  if (scene.scene.camera.enabled && mode === "play") {
    const p = easeInOut(clamp(local / Math.max(0.001, scene.duration), 0, 1));
    const cam = scene.scene.camera;
    const scale = lerp(cam.fromScale, cam.toScale, p);
    const ox = lerp(cam.fromX, cam.toX, p);
    const oy = lerp(cam.fromY, cam.toY, p);
    ctx.translate(width / 2 + ox, height / 2 + oy);
    ctx.scale(scale, scale);
    ctx.translate(-width / 2, -height / 2);
  }

  let hand: { x: number; y: number; style: Layer["anim"]["hand"]; dust?: boolean } | null = null;

  let sceneAlpha = 1;
  if (mode === "play" && transition !== "cut" && local < fadeFor) {
    const u = local / fadeFor;
    if (transition === "fade" || transition === "dissolve") sceneAlpha = u;
  }
  ctx.save();
  ctx.globalAlpha *= sceneAlpha;

  if (mode === "play" && transition === "slide" && local < fadeFor) {
    ctx.translate(width * (1 - local / fadeFor), 0);
  }
  if (mode === "play" && transition === "iris" && local < fadeFor) {
    const r = Math.hypot(width, height) * (local / fadeFor);
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.max(4, r), 0, Math.PI * 2);
    ctx.clip();
  }

  const drawingIds = new Set(
    scene.layers
      .filter((prep) => {
        const layer = prep.layer;
        return layer.visible && local >= layer.start && local < layer.start + layer.duration;
      })
      .map((prep) => prep.layer.id),
  );
  const spotlight = Boolean(project.spotlight) && mode === "play" && drawingIds.size > 0;

  for (const prep of scene.layers) {
    const layer = prep.layer;
    if (!layer.visible) continue;
    if (mode === "edit") {
      drawLayerComplete(ctx, prep, local);
      if (selectedIds.includes(layer.id)) drawSelection(ctx, layer);
      continue;
    }
    const start = layer.start;
    const end = layer.start + layer.duration;
    if (local < start) continue;
    if (local >= end) {
      ctx.save();
      if (spotlight) ctx.globalAlpha *= 0.38;
      drawLayerComplete(ctx, prep, local);
      ctx.restore();
      continue;
    }
    const anim = resolveAnim(layer.anim);
    const raw = (local - start) / Math.max(0.001, layer.duration);
    const p = easeBy(anim.easing, clamp(raw * Math.max(0.25, anim.speed), 0, 1));
    const h = drawLayerPartial(ctx, prep, p, local);
    if (h) hand = { ...h, dust: anim.dust };
  }

  ctx.restore();
  ctx.restore();

  if (mode === "edit" && project.grid) drawGrid(ctx, width, height);

  if (mode === "play") {
    if (transition === "wipe" && local < fadeFor) {
      const w = (local / fadeFor) * width;
      ctx.save();
      ctx.fillStyle =
        project.background === "chalkboard" || project.background === "blueprint" || project.background === "night"
          ? "#161412"
          : "#e7dfd0";
      ctx.fillRect(w, 0, width - w, height);
      ctx.restore();
    }
    if (transition === "dissolve" && local < fadeFor) {
      ctx.save();
      ctx.fillStyle =
        project.background === "chalkboard" || project.background === "blueprint" || project.background === "night"
          ? "rgba(22,20,18,0.35)"
          : "rgba(231,223,208,0.35)";
      for (let i = 0; i < 80; i++) {
        const seed = i * 17 + Math.floor(local * 40);
        const x = ((seed * 13) % 97) / 97 * width;
        const y = ((seed * 29) % 89) / 89 * height;
        ctx.fillRect(x, y, 6, 6);
      }
      ctx.restore();
    }
    const caption = scene.scene.captions.find((c) => local >= c.start && local <= c.end);
    if (caption) {
      const span = Math.max(0.001, caption.end - caption.start);
      const capP = clamp((local - caption.start) / Math.min(0.7, span * 0.4), 0, 1);
      drawCaption(ctx, width, height, caption.text, project.background, capP);
    }
    if (hand) {
      drawHand(ctx, hand.x, hand.y, hand.style, 0.92);
      if (hand.dust) drawDust(ctx, hand.x, hand.y, local);
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(28,25,22,0.08)";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSelection(ctx: CanvasRenderingContext2D, layer: Layer) {
  ctx.save();
  transformLayer(ctx, layer);
  ctx.strokeStyle = "#1f4e79";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(-1, -1, layer.width + 2, layer.height + 2);
  ctx.setLineDash([]);
  const handles = [
    [0, 0],
    [layer.width, 0],
    [0, layer.height],
    [layer.width, layer.height],
  ];
  ctx.fillStyle = "#1f4e79";
  for (const [hx, hy] of handles) {
    ctx.fillRect(hx! - 4, hy! - 4, 8, 8);
  }
  ctx.restore();
}

function transformLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
  ctx.translate(-layer.width / 2, -layer.height / 2);
  ctx.globalAlpha *= layer.opacity;
}

function applyEntrance(ctx: CanvasRenderingContext2D, layer: Layer, p: number) {
  const anim = resolveAnim(layer.anim);
  if (anim.entrance === "none" || p >= 1) return;
  const e = clamp(p / 0.35, 0, 1);
  const inv = 1 - e;
  if (anim.entrance === "fade") ctx.globalAlpha *= 0.25 + 0.75 * e;
  if (anim.entrance === "pop") {
    const s = 0.72 + 0.28 * e;
    ctx.translate(layer.width / 2, layer.height / 2);
    ctx.scale(s, s);
    ctx.translate(-layer.width / 2, -layer.height / 2);
  }
  if (anim.entrance === "zoom") {
    const s = 0.4 + 0.6 * e;
    ctx.translate(layer.width / 2, layer.height / 2);
    ctx.scale(s, s);
    ctx.translate(-layer.width / 2, -layer.height / 2);
    ctx.globalAlpha *= 0.3 + 0.7 * e;
  }
  if (anim.entrance === "spin") {
    ctx.translate(layer.width / 2, layer.height / 2);
    ctx.rotate(inv * 0.85);
    ctx.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e);
    ctx.translate(-layer.width / 2, -layer.height / 2);
  }
  if (anim.entrance === "slide-up") ctx.translate(0, 36 * inv);
  if (anim.entrance === "slide-left") ctx.translate(48 * inv, 0);
  if (anim.entrance === "slide-right") ctx.translate(-48 * inv, 0);
  if (anim.entrance === "slide-down") ctx.translate(0, -36 * inv);
  if (anim.entrance === "drop") ctx.translate(0, -42 * inv);
}

function applyAfter(ctx: CanvasRenderingContext2D, layer: Layer, local: number) {
  const after = resolveAnim(layer.anim).after;
  if (after === "none") return;
  const w = layer.width;
  const h = layer.height;
  const t = local;
  ctx.translate(w / 2, h / 2);
  if (after === "pulse") {
    const s = 1 + Math.sin(t * 4.2) * 0.035;
    ctx.scale(s, s);
  } else if (after === "float") {
    ctx.translate(0, Math.sin(t * 2.1) * 6);
  } else if (after === "shake") {
    ctx.translate(Math.sin(t * 28) * 1.6, Math.cos(t * 22) * 1.1);
    ctx.rotate(Math.sin(t * 18) * 0.012);
  }
  ctx.translate(-w / 2, -h / 2);
}

function applyStyleClip(ctx: CanvasRenderingContext2D, layer: Layer, p: number) {
  const style = resolveAnim(layer.anim).style;
  const w = layer.width;
  const h = layer.height;
  ctx.beginPath();
  if (style === "scanner" || style === "wipe-right" || style === "columns") ctx.rect(0, 0, w * Math.max(p, 0.02), h);
  else if (style === "wipe-left") ctx.rect(w * (1 - p), 0, w * Math.max(p, 0.02), h);
  else if (style === "wipe-down" || style === "rain") ctx.rect(0, 0, w, h * Math.max(p, 0.02));
  else if (style === "wipe-up") ctx.rect(0, h * (1 - p), w, h * Math.max(p, 0.02));
  else if (style === "diagonal") {
    ctx.moveTo(0, 0);
    ctx.lineTo(w * p * 2, 0);
    ctx.lineTo(0, h * p * 2);
    ctx.closePath();
  } else if (style === "diamond") {
    const s = Math.hypot(w, h) * p;
    ctx.moveTo(w / 2, h / 2 - s);
    ctx.lineTo(w / 2 + s, h / 2);
    ctx.lineTo(w / 2, h / 2 + s);
    ctx.lineTo(w / 2 - s, h / 2);
    ctx.closePath();
  } else if (style === "radial" || style === "spiral" || style === "portrait" || style === "reverse-spiral") {
    const r = Math.hypot(w, h) * p;
    ctx.arc(w / 2, h / 2, Math.max(4, r), 0, Math.PI * 2);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.clip();
}

function drawDust(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const a = t * 13 + i * 1.7;
    const dx = Math.cos(a) * (8 + (i % 4) * 5);
    const dy = Math.sin(a * 0.8) * (6 + (i % 3) * 4) - i * 1.4;
    ctx.fillStyle = `rgba(244,239,230,${0.18 + (i % 3) * 0.08})`;
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLayerComplete(ctx: CanvasRenderingContext2D, prep: PreparedLayer, local = 0) {
  drawLayerPartial(ctx, prep, 1, local);
}

function drawLayerPartial(
  ctx: CanvasRenderingContext2D,
  prep: PreparedLayer,
  p: number,
  local = 0,
): { x: number; y: number; style: Layer["anim"]["hand"] } | null {
  const layer = prep.layer;
  const anim = resolveAnim(layer.anim);
  ctx.save();
  transformLayer(ctx, layer);
  applyEntrance(ctx, layer, p);
  if (p >= 1) applyAfter(ctx, layer, local);
  if (anim.wiggle && p < 1) {
    ctx.translate(Math.sin(p * 42) * 1.4, Math.cos(p * 33) * 1.2);
    ctx.rotate(Math.sin(p * 21) * 0.015);
  }
  if (p < 1 && layer.type !== "image") applyStyleClip(ctx, layer, p);
  let hand: { x: number; y: number; style: Layer["anim"]["hand"] } | null = null;

  if (layer.type === "text" && layer.text) {
    hand = drawText(ctx, layer, p);
  } else if (layer.type === "icon" || layer.type === "shape" || layer.type === "arrow") {
    hand = drawPaths(ctx, prep, p);
  } else if (layer.type === "image" && prep.bitmap && prep.cells && prep.order) {
    hand = drawImageLayer(ctx, prep, p);
  }

  ctx.restore();
  if (hand) {
    const ang = (layer.rotation * Math.PI) / 180;
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    const lx = hand.x - layer.width / 2;
    const ly = hand.y - layer.height / 2;
    const gx = cx + lx * Math.cos(ang) - ly * Math.sin(ang);
    const gy = cy + lx * Math.sin(ang) + ly * Math.cos(ang);
    return { x: gx, y: gy, style: layer.anim.hand };
  }
  return null;
}

function fontFor(layer: Layer) {
  const t = layer.text!;
  const size = Math.max(18, layer.height * 0.55);
  const family =
    t.font === "hand"
      ? "Caveat, cursive"
      : t.font === "serif"
        ? "Fraunces, serif"
        : t.font === "mono"
          ? "IBM Plex Mono, monospace"
          : "Source Sans 3, sans-serif";
  const weight = t.weight;
  return `${weight} ${size}px ${family}`;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  p: number,
): { x: number; y: number; style: Layer["anim"]["hand"] } | null {
  const t = layer.text!;
  const anim = resolveAnim(layer.anim);
  ctx.font = fontFor(layer);
  ctx.fillStyle = t.color;
  ctx.textBaseline = "middle";
  ctx.textAlign = t.align;
  const lines = t.text.split("\n");
  const size = Math.max(18, layer.height * 0.55);
  const lh = size * t.lineHeight;
  let ax = layer.width / 2;
  if (t.align === "left") ax = 8;
  if (t.align === "right") ax = layer.width - 8;
  let lastX = ax;
  let lastY = layer.height / 2;

  const mode = anim.textAnim;

  if (mode === "fade") {
    ctx.save();
    ctx.globalAlpha *= clamp(p, 0, 1);
    lines.forEach((line, i) => {
      const y = layer.height / 2 - ((lines.length - 1) * lh) / 2 + i * lh;
      ctx.fillText(line, ax, y);
    });
    ctx.restore();
    return p < 1 ? { x: ax, y: lastY + 8, style: layer.anim.hand } : null;
  }

  if (mode === "word") {
    const allWords = t.text.split(/(\s+)/).filter((w) => w.length);
    const wordTokens = allWords.filter((w) => w.trim().length);
    const shown = Math.floor(p * Math.max(1, wordTokens.length));
    let used = 0;
    lines.forEach((line, i) => {
      const y = layer.height / 2 - ((lines.length - 1) * lh) / 2 + i * lh;
      const parts = line.split(/(\s+)/);
      let visible = "";
      for (const part of parts) {
        if (!part.trim()) {
          visible += part;
          continue;
        }
        if (used < shown) {
          visible += part;
          used++;
        }
      }
      ctx.fillText(visible, ax, y);
      lastX = ax + (t.align === "center" ? ctx.measureText(visible).width / 2 : ctx.measureText(visible).width);
      lastY = y;
    });
    if (p >= 1) return null;
    return { x: lastX, y: lastY + 8, style: layer.anim.hand };
  }

  if (mode === "bounce") {
    ctx.textAlign = "left";
    const totalChars = Math.max(1, t.text.replace(/\n/g, "").length);
    let count = 0;
    lines.forEach((line, i) => {
      const y = layer.height / 2 - ((lines.length - 1) * lh) / 2 + i * lh;
      const fullW = ctx.measureText(line).width;
      let x = ax;
      if (t.align === "center") x = ax - fullW / 2;
      if (t.align === "right") x = ax - fullW;
      for (const ch of line) {
        const appear = count / totalChars;
        count++;
        if (p < appear) continue;
        const localP = clamp((p - appear) / 0.18, 0, 1);
        const bounce = 1 + Math.sin(localP * Math.PI) * 0.22;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, bounce);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        x += ctx.measureText(ch).width;
        lastX = x;
        lastY = y;
      }
    });
    if (p >= 1) return null;
    return { x: lastX, y: lastY + 8, style: layer.anim.hand };
  }

  const totalChars = Math.max(1, t.text.replace(/\n/g, "").length);
  const shown = Math.floor(p * totalChars);
  let count = 0;
  lines.forEach((line, i) => {
    const y = layer.height / 2 - ((lines.length - 1) * lh) / 2 + i * lh;
    let visible = "";
    for (const ch of line) {
      if (count < shown) {
        visible += ch;
        count++;
      }
    }
    ctx.fillText(visible, ax, y);
    lastX = ax + (t.align === "center" ? ctx.measureText(visible).width / 2 : ctx.measureText(visible).width);
    lastY = y;
  });
  if (p >= 1) return null;
  return { x: lastX, y: lastY + 8, style: layer.anim.hand };
}

function drawPaths(
  ctx: CanvasRenderingContext2D,
  prep: PreparedLayer,
  p: number,
): { x: number; y: number; style: Layer["anim"]["hand"] } | null {
  const layer = prep.layer;
  const anim = resolveAnim(layer.anim);
  const paths = anim.reverse ? [...(prep.paths ?? [])].reverse() : (prep.paths ?? []);
  const total = prep.totalPath || 1;
  const drawLen = p * total;
  let acc = 0;
  let hx = layer.width / 2;
  let hy = layer.height / 2;

  const color =
    layer.icon?.color ??
    layer.shape?.stroke ??
    layer.arrow?.color ??
    layer.anim.color;
  const sw =
    layer.icon?.strokeWidth ??
    layer.shape?.strokeWidth ??
    layer.arrow?.strokeWidth ??
    layer.anim.strokeWidth;

  const iconVb = prep.iconVb;
  let sx = 1;
  let sy = 1;
  let ox = 0;
  let oy = 0;
  if (iconVb) {
    const s = Math.min(layer.width, layer.height) / iconVb;
    sx = sy = s;
    ox = (layer.width - iconVb * s) / 2;
    oy = (layer.height - iconVb * s) / 2;
    ctx.translate(ox, oy);
    ctx.scale(s, s);
  }

  if (layer.shape?.kind === "highlight") {
    ctx.fillStyle = layer.shape.fill || "rgba(31,78,121,0.22)";
    ctx.globalAlpha *= p;
    ctx.fillRect(0, 0, layer.width, layer.height);
    ctx.globalAlpha = layer.opacity;
    return p < 1 ? { x: layer.width * p, y: layer.height / 2, style: layer.anim.hand } : null;
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (layer.arrow?.dashed) ctx.setLineDash([10, 8]);

  const sketch = layer.anim.strokeStyle;
  applyStrokeStyle(ctx, sketch, sw);

  for (const path of paths) {
    const local = clamp(drawLen - acc, 0, path.length);
    const p2d = new Path2D(path.d);
    ctx.save();
    ctx.setLineDash([local, path.length]);
    ctx.lineDashOffset = 0;
    if (sketch === "charcoal" || sketch === "sketch") {
      ctx.globalAlpha *= 0.7;
      ctx.stroke(p2d);
      ctx.translate(0.8 + anim.sketchiness, 0.6);
      ctx.stroke(p2d);
    } else if (anim.sketchiness > 0.5) {
      ctx.stroke(p2d);
      ctx.translate(anim.sketchiness * 0.8, anim.sketchiness * 0.4);
      ctx.globalAlpha *= 0.55;
      ctx.stroke(p2d);
    } else {
      ctx.stroke(p2d);
    }
    ctx.restore();
    if (local > 0 && local <= path.length) {
      const pt = path.el.getPointAtLength(local);
      hx = pt.x * sx + ox;
      hy = pt.y * sy + oy;
    }
    acc += path.length;
  }

  const kind = layer.shape?.kind;
  if (kind === "rect" || kind === "ellipse" || kind === "bubble" || kind === "callout") {
    if (p > 0.72 && layer.shape?.fill && layer.shape.fill !== "transparent") {
      ctx.save();
      ctx.globalAlpha *= clamp((p - 0.72) / 0.28, 0, 1);
      ctx.fillStyle = layer.shape.fill;
      if (kind === "ellipse" || kind === "callout") {
        ctx.beginPath();
        ctx.ellipse(layer.width / 2, layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "bubble" && paths[0]) {
        ctx.fill(new Path2D(paths[0].d));
      } else {
        ctx.fillRect(0, 0, layer.width, layer.height);
      }
      ctx.restore();
    }
  }

  if (p >= 1) return null;
  return { x: hx, y: hy, style: layer.anim.hand };
}

function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  style: Layer["anim"]["strokeStyle"],
  sw: number,
) {
  if (style === "chalk") {
    ctx.lineWidth = sw + 1.4;
    ctx.globalAlpha *= 0.85;
  } else if (style === "fountain") {
    ctx.lineWidth = sw + 0.6;
  } else if (style === "marker") {
    ctx.lineWidth = sw;
  } else if (style === "charcoal") {
    ctx.lineWidth = sw + 1.8;
  }
}

function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  prep: PreparedLayer,
  p: number,
): { x: number; y: number; style: Layer["anim"]["hand"] } | null {
  const layer = prep.layer;
  const anim = resolveAnim(layer.anim);
  const cells = prep.cells!;
  const order = anim.reverse ? [...prep.order!].reverse() : prep.order!;
  const bitmap = prep.bitmap!;
  const style = anim.drawStyle;
  const sketchUntil = style === "reveal" ? 0 : style === "outline" ? 1 : 0.58;
  const n = order.length;
  const sketchCount = Math.floor(clamp(p / Math.max(0.001, sketchUntil), 0, 1) * n);
  const fillP =
    style === "outline" || style === "marker"
      ? 0
      : clamp((p - sketchUntil) / Math.max(0.001, 1 - sketchUntil), 0, 1);
  const fillCount = Math.floor(fillP * n);

  ctx.save();
  ctx.strokeStyle = anim.color;
  ctx.lineCap = "round";
  applyStrokeStyle(ctx, anim.strokeStyle, anim.strokeWidth);
  const jitter = anim.sketchiness * 2.2;
  const upto = style === "reveal" ? 0 : sketchCount;
  for (let i = 0; i < upto; i++) {
    const cell = cells[order[i]!]!;
    for (const s of cell.strokes) {
      const j = ((i * 17) % 5) - 2;
      ctx.beginPath();
      ctx.moveTo(s.x1 + j * jitter * 0.15, s.y1);
      ctx.lineTo(s.x2 + j * jitter * 0.1, s.y2 + j * 0.2);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (fillCount > 0 && style !== "outline") {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < fillCount; i++) {
      const cell = cells[order[i]!]!;
      if (anim.fillReveal === "iris") {
        const r = Math.max(cell.w, cell.h) * 0.7;
        ctx.moveTo(cell.cx + r, cell.cy);
        ctx.arc(cell.cx, cell.cy, r, 0, Math.PI * 2);
      } else if (anim.fillReveal === "dissolve") {
        if ((i + Math.floor(p * 17)) % 3 !== 0) {
          ctx.rect(cell.x, cell.y, cell.w + 0.6, cell.h + 0.6);
        }
      } else {
        ctx.rect(cell.x, cell.y, cell.w + 0.6, cell.h + 0.6);
      }
    }
    ctx.clip();
    const alpha = anim.fillReveal === "fade" ? clamp(fillP * 1.4, 0, 1) : 1;
    ctx.globalAlpha *= alpha;
    if (style === "illust") ctx.filter = "contrast(1.15) saturate(0.85)";
    ctx.drawImage(bitmap, 0, 0, layer.width, layer.height);
    ctx.restore();
  }

  if (p >= 1) {
    ctx.drawImage(bitmap, 0, 0, layer.width, layer.height);
    return null;
  }
  const idx = order[Math.min(n - 1, Math.max(0, style === "reveal" ? fillCount : sketchCount))]!;
  const cell = cells[idx]!;
  return { x: cell.cx, y: cell.cy, style: anim.hand };
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  bg: Project["background"],
  p = 1,
) {
  const theme = captionTheme(bg);
  const shown = text.slice(0, Math.max(1, Math.floor(clamp(p, 0, 1) * text.length)));
  ctx.save();
  ctx.font = "600 22px Source Sans 3, sans-serif";
  const padX = 18;
  const w = ctx.measureText(text).width;
  const x = (width - w) / 2;
  const y = height - 48;
  ctx.fillStyle = theme.fill;
  roundFill(ctx, x - padX, y - 20, w + padX * 2, 36, 10);
  ctx.fillStyle = theme.text;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(shown, x, y - 2);
  ctx.restore();
}

function roundFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
