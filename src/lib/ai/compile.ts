import {
  defaultAnim,
  iconLayer,
  makeProject,
  makeScene,
  projectDuration,
  shapeLayer,
  staggerLayers,
  textLayer,
} from "@/lib/project/factory";
import { ASPECTS, type AspectId, type Layer, type Project, type Scene } from "@/lib/project/types";
import { uid } from "@/lib/utils";
import { resolveIconId, type AiScene, type AiStoryboard } from "./schema";

function wrap(text: string, max: number) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3).join("\n");
}

function frame(aspect: AspectId) {
  const { w, h } = ASPECTS[aspect];
  const portrait = h > w;
  const pad = portrait ? 44 : 72;
  return { w, h, pad, portrait, inner: w - pad * 2, maxChars: portrait ? 16 : 28 };
}

function tTitle(text: string, x: number, y: number, width: number, maxChars: number, font: "serif" | "hand" = "serif"): Layer {
  const wrapped = wrap(text, maxChars);
  const lines = Math.max(1, wrapped.split("\n").length);
  return textLayer(wrapped || " ", x, y, width, {
    height: font === "serif" ? 76 + (lines - 1) * 8 : 84,
    duration: 1.7,
    text: {
      text: wrapped || " ",
      font,
      weight: 700,
      align: "center",
      color: "#1C1916",
      lineHeight: 1.1,
    },
    anim: defaultAnim({ entrance: "pop", textAnim: "word", hand: "ghost", easing: "bounce" }),
  });
}

function tSub(text: string, x: number, y: number, width: number, maxChars: number): Layer {
  const wrapped = wrap(text, maxChars + 4);
  return textLayer(wrapped, x, y, width, {
    height: 68,
    duration: 1.5,
    text: {
      text: wrapped,
      font: "hand",
      weight: 600,
      align: "center",
      color: "#1F4E79",
      lineHeight: 1.12,
    },
    anim: defaultAnim({ textAnim: "typewriter", hand: "pen" }),
  });
}

function tLabel(text: string, x: number, y: number, width: number, align: "left" | "center" = "center"): Layer {
  return textLayer(text, x, y, width, {
    height: 56,
    duration: 1.15,
    text: { text, font: "hand", weight: 600, align, color: "#1C1916", lineHeight: 1 },
    anim: defaultAnim({ textAnim: "fade", entrance: "fade", hand: "ghost" }),
  });
}

function ic(id: string | undefined, x: number, y: number, size: number, i = 0): Layer {
  const styles = ["contour", "scanner", "spiral", "wipe-down", "radial"] as const;
  return iconLayer(resolveIconId(id), x, y, size, {
    duration: 2,
    anim: defaultAnim({
      style: styles[i % styles.length],
      drawStyle: "outline",
      after: i % 3 === 0 ? "pulse" : i % 3 === 1 ? "float" : "none",
    }),
  });
}

function layoutScene(scene: AiScene, aspect: AspectId): Layer[] {
  const f = frame(aspect);
  const x0 = f.pad;
  const w = f.inner;
  const layout = scene.layout;
  const items = (scene.items ?? []).slice(0, 5);
  const layers: Layer[] = [];

  const pushTitle = (y = 36) => {
    if (scene.title) layers.push(tTitle(scene.title, x0, y, w, f.maxChars));
    if (scene.subtitle) layers.push(tSub(scene.subtitle, x0, y + 86, w, f.maxChars));
    return scene.subtitle ? y + 160 : y + 100;
  };

  if (layout === "title") {
    const y = f.portrait ? f.h * 0.16 : f.h * 0.12;
    layers.push(tTitle(scene.title || scene.name, x0, y, w, f.maxChars));
    if (scene.subtitle) layers.push(tSub(scene.subtitle, x0, y + 100, w, f.maxChars));
    const icon = items[0]?.icon || "spark";
    layers.push(ic(icon, f.w / 2 - 90, y + 210, 180, 0));
  } else if (layout === "hero") {
    const top = pushTitle(40);
    if (scene.body) layers.push(tSub(scene.body, x0, top, w, f.maxChars + 2));
    const icons = items.length ? items : [{ icon: "lightbulb", label: "" }];
    const n = Math.min(3, icons.length);
    const size = f.portrait ? 140 : 160;
    if (f.portrait) {
      icons.slice(0, n).forEach((it, i) => {
        layers.push(ic(it.icon, f.w / 2 - size / 2, top + 100 + i * (size + 70), size, i));
        if (it.label) layers.push(tLabel(it.label, x0, top + 100 + i * (size + 70) + size, w));
      });
    } else {
      const col = w / n;
      icons.slice(0, n).forEach((it, i) => {
        layers.push(ic(it.icon, x0 + col * i + (col - size) / 2, top + 40, size, i));
        if (it.label) layers.push(tLabel(it.label, x0 + col * i, top + 40 + size + 8, col));
      });
    }
  } else if (layout === "steps" || layout === "timeline") {
    pushTitle(28);
    const n = Math.max(items.length, 1);
    const list = items.length ? items : [{ icon: "flag", label: "Step" }];
    if (f.portrait) {
      list.forEach((it, i) => {
        const y = 160 + i * 200;
        layers.push(ic(it.icon, 48, y, 110, i));
        layers.push(tLabel(it.label, 180, y + 20, f.w - 220, "left"));
        if (it.detail) layers.push(tSub(it.detail, 180, y + 80, f.w - 220, 18));
      });
    } else {
      const col = w / n;
      list.forEach((it, i) => {
        const x = x0 + col * i;
        layers.push(ic(it.icon, x + (col - 140) / 2, 170, 140, i));
        layers.push(tLabel(it.label, x, 330, col));
        if (it.detail) layers.push(tSub(it.detail, x, 400, col, 14));
      });
    }
  } else if (layout === "grid") {
    pushTitle(24);
    const list = items.slice(0, 4);
    const cols = f.portrait ? 1 : 2;
    const cellW = cols === 1 ? w : w / 2;
    list.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = x0 + c * cellW;
      const y = 140 + r * (f.portrait ? 220 : 230);
      const size = 130;
      layers.push(ic(it.icon, x + (cellW - size) / 2, y, size, i));
      layers.push(tLabel(it.label, x, y + size + 6, cellW));
    });
  } else if (layout === "compare") {
    pushTitle(28);
    const left = scene.left ?? { title: items[0]?.label ?? "Before", body: items[0]?.detail, icon: items[0]?.icon ?? "warning" };
    const right = scene.right ?? { title: items[1]?.label ?? "After", body: items[1]?.detail, icon: items[1]?.icon ?? "check" };
    if (f.portrait) {
      layers.push(ic(left.icon, f.w / 2 - 80, 170, 160, 0));
      layers.push(tLabel(left.title, x0, 350, w));
      layers.push(ic(right.icon, f.w / 2 - 80, 460, 160, 1));
      layers.push(tLabel(right.title, x0, 640, w));
    } else {
      layers.push(ic(left.icon, f.w * 0.18, 180, 170, 0));
      layers.push(tLabel(left.title, f.pad, 370, f.w * 0.4));
      if (left.body) layers.push(tSub(left.body, f.pad, 430, f.w * 0.4, 16));
      layers.push(ic(right.icon, f.w * 0.62, 180, 170, 1));
      layers.push(tLabel(right.title, f.w * 0.52, 370, f.w * 0.4));
      if (right.body) layers.push(tSub(right.body, f.w * 0.52, 430, f.w * 0.4, 16));
    }
  } else if (layout === "cycle") {
    pushTitle(20);
    const list = items.slice(0, 4);
    const cx = f.w / 2;
    const cy = f.h / 2 + 30;
    const rx = Math.min(f.w, f.h) * 0.28;
    const ry = Math.min(f.w, f.h) * 0.22;
    list.forEach((it, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(list.length, 1);
      const x = cx + Math.cos(a) * rx - 65;
      const y = cy + Math.sin(a) * ry - 65;
      layers.push(ic(it.icon, x, y, 130, i));
      layers.push(tLabel(it.label, x - 30, y + 130, 190));
    });
  } else if (layout === "quote") {
    const q = scene.quote || scene.title || scene.body || "";
    layers.push(
      shapeLayer("bubble", x0, f.h * 0.2, w, Math.min(260, f.h * 0.34), {
        anim: defaultAnim({ style: "contour", drawStyle: "outline", entrance: "pop" }),
      }),
    );
    layers.push(tTitle(q, x0 + 20, f.h * 0.24, w - 40, f.maxChars - 2, "serif"));
    if (scene.attribution) layers.push(tSub(scene.attribution, x0, f.h * 0.2 + Math.min(260, f.h * 0.34) + 12, w, f.maxChars));
  } else if (layout === "list") {
    pushTitle(28);
    const list = items.length ? items : (scene.body ? scene.body.split(/[;\n]/).map((s) => ({ label: s.trim(), icon: "check" })) : []);
    list.slice(0, 5).forEach((it, i) => {
      const y = 140 + i * Math.min(88, (f.h - 180) / Math.max(list.length, 1));
      layers.push(
        tLabel(`${i + 1}.  ${it.label}`, x0 + 12, y, w - 24, "left"),
      );
    });
  } else {
    // close
    layers.push(ic(items[0]?.icon || "check", f.w / 2 - 100, f.h * 0.12, 200, 0));
    layers.push(tTitle(scene.title || "That's the idea", x0, f.h * 0.42, w, f.maxChars));
    if (scene.subtitle || scene.body) layers.push(tSub(scene.subtitle || scene.body || "", x0, f.h * 0.56, w, f.maxChars));
  }

  return staggerLayers(layers, 0.48);
}

function sceneFromAi(ai: AiScene, aspect: AspectId, index: number): Scene {
  const scene = makeScene(ai.name || `Scene ${index + 1}`);
  scene.layers = layoutScene(ai, aspect);
  scene.transition = ai.transition ?? (index === 0 ? "cut" : "fade");
  scene.hold = 0.55;
  scene.camera.enabled = index === 0;
  const end = Math.max(4, ...scene.layers.map((l) => l.start + l.duration), 0) + scene.hold;
  if (ai.caption) {
    scene.captions = [{ id: uid("cap"), text: ai.caption, start: 0.25, end: Math.max(3, end - 0.35) }];
  }
  return scene;
}

export function compileStoryboard(board: AiStoryboard, targetSeconds?: number): Project {
  const aspect = board.aspect;
  const project = makeProject(board.name || "AI board");
  project.aspect = aspect;
  project.background = board.background;
  project.notes = board.notes ?? "";
  const scenes = board.scenes.slice(0, 14).map((s, i) => sceneFromAi(s, aspect, i));
  if (!scenes.length) scenes.push(makeScene("Scene 1"));
  project.scenes = scenes;
  project.activeSceneId = scenes[0]!.id;

  if (targetSeconds && targetSeconds > 8) {
    const actual = projectDuration(project);
    if (actual > 1) {
      const factor = Math.max(0.45, Math.min(2.3, targetSeconds / actual));
      for (const sc of project.scenes) {
        sc.hold *= factor;
        for (const l of sc.layers) {
          l.start *= factor;
          l.duration *= factor;
        }
        for (const c of sc.captions) {
          c.start *= factor;
          c.end *= factor;
        }
      }
    }
  }
  return project;
}
