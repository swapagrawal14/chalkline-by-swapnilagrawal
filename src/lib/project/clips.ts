import { uid } from "@/lib/utils";
import {
  arrowLayer,
  defaultAnim,
  iconLayer,
  shapeLayer,
  staggerLayers,
  textLayer,
} from "./factory";
import type { Caption, Layer } from "./types";

export interface ClipBuild {
  layers: Layer[];
  captions?: Caption[];
}

export interface ClipDef {
  id: string;
  name: string;
  blurb: string;
  category: "cards" | "process" | "compare" | "talk";
  build: (size: { width: number; height: number }) => ClipBuild;
}

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
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
  return lines.join("\n");
}

function titleLayer(text: string, x: number, y: number, w: number, maxChars: number, font: "serif" | "hand" = "serif") {
  const wrapped = wrap(text, maxChars);
  const lines = wrapped.split("\n").length;
  return textLayer(wrapped, x, y, w, {
    height: font === "serif" ? 78 + (lines - 1) * 12 : 88,
    duration: 1.8,
    text: {
      text: wrapped,
      font,
      weight: 700,
      align: "center",
      color: "#1C1916",
      lineHeight: 1.1,
    },
    anim: defaultAnim({ entrance: "pop", textAnim: "word", hand: "ghost", easing: "bounce" }),
  });
}

export const CLIPS: ClipDef[] = [
  {
    id: "title-card",
    name: "Title card",
    blurb: "Headline, line, icon",
    category: "cards",
    build: ({ width, height }) => {
      const portrait = height > width;
      const w = Math.min(width - 80, 1000);
      const x = (width - w) / 2;
      const layers = staggerLayers([
        titleLayer("Your headline here", x, portrait ? 180 : 90, w, portrait ? 16 : 26),
        textLayer("A short supporting line", x, portrait ? 320 : 200, w, {
          height: 70,
          duration: 1.6,
          text: { text: "A short supporting line", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
        }),
        iconLayer("spark", width / 2 - 90, portrait ? 520 : 340, 180, {
          duration: 2.2,
          anim: defaultAnim({ style: "spiral", drawStyle: "outline", after: "pulse" }),
        }),
      ]);
      return { layers, captions: [{ id: uid("cap"), text: "Open on the idea — then draw the rest.", start: 0.3, end: 6 }] };
    },
  },
  {
    id: "three-steps",
    name: "Three steps",
    blurb: "Icon + label row",
    category: "process",
    build: ({ width, height }) => {
      const portrait = height > width;
      const items = [
        { icon: "book", label: "Learn" },
        { icon: "spark", label: "Make" },
        { icon: "rocket", label: "Ship" },
      ];
      const layers: Layer[] = [titleLayer("Three steps", (width - Math.min(width - 80, 900)) / 2, 40, Math.min(width - 80, 900), 22)];
      if (portrait) {
        items.forEach((it, i) => {
          const y = 180 + i * 280;
          layers.push(iconLayer(it.icon, width / 2 - 80, y, 160));
          layers.push(
            textLayer(it.label, 40, y + 170, width - 80, {
              height: 64,
              duration: 1.2,
              text: { text: it.label, font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
            }),
          );
        });
      } else {
        const col = width / 3;
        items.forEach((it, i) => {
          const x = col * i + (col - 170) / 2;
          layers.push(iconLayer(it.icon, x, 180, 170));
          layers.push(
            textLayer(it.label, col * i + 20, 380, col - 40, {
              height: 64,
              duration: 1.2,
              text: { text: it.label, font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
            }),
          );
        });
      }
      return { layers: staggerLayers(layers, 0.45) };
    },
  },
  {
    id: "four-grid",
    name: "Four grid",
    blurb: "2×2 icons",
    category: "process",
    build: ({ width, height }) => {
      const ids = ["lightbulb", "users", "chart", "heart"];
      const labels = ["Idea", "People", "Proof", "Love"];
      const layers: Layer[] = [titleLayer("Four beats", 40, 24, width - 80, 20)];
      const gridTop = 120;
      const cellW = (width - 80) / 2;
      const cellH = (height - gridTop - 40) / 2;
      ids.forEach((id, i) => {
        const c = i % 2;
        const r = Math.floor(i / 2);
        const x = 40 + c * cellW;
        const y = gridTop + r * cellH;
        const size = Math.min(150, cellW - 40, cellH - 80);
        layers.push(iconLayer(id, x + (cellW - size) / 2 - 10, y, size));
        layers.push(
          textLayer(labels[i]!, x, y + size + 8, cellW - 20, {
            height: 56,
            duration: 1.1,
            text: { text: labels[i]!, font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 },
          }),
        );
      });
      return { layers: staggerLayers(layers, 0.4) };
    },
  },
  {
    id: "compare",
    name: "Compare",
    blurb: "Before / after",
    category: "compare",
    build: ({ width, height }) => {
      const portrait = height > width;
      const layers: Layer[] = [titleLayer("Before  /  After", 40, 36, width - 80, 18)];
      if (portrait) {
        layers.push(iconLayer("warning", width / 2 - 80, 180, 160, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }));
        layers.push(textLayer("Before", 40, 360, width - 80, { height: 60, text: { text: "Before", font: "hand", weight: 600, align: "center", color: "#8B2E2E", lineHeight: 1 } }));
        layers.push(iconLayer("check", width / 2 - 80, 480, 160, { anim: defaultAnim({ style: "radial", drawStyle: "outline", after: "pulse" }) }));
        layers.push(textLayer("After", 40, 660, width - 80, { height: 60, text: { text: "After", font: "hand", weight: 600, align: "center", color: "#2F6B4F", lineHeight: 1 } }));
      } else {
        layers.push(iconLayer("warning", width * 0.18, 180, 180));
        layers.push(textLayer("Before", 40, 390, width * 0.42, { height: 64, text: { text: "Before", font: "hand", weight: 600, align: "center", color: "#8B2E2E", lineHeight: 1 } }));
        layers.push(arrowLayer(width / 2 - 70, 250, 140, 50));
        layers.push(iconLayer("check", width * 0.62, 180, 180, { anim: defaultAnim({ style: "radial", drawStyle: "outline", after: "pulse" }) }));
        layers.push(textLayer("After", width * 0.52, 390, width * 0.42, { height: 64, text: { text: "After", font: "hand", weight: 600, align: "center", color: "#2F6B4F", lineHeight: 1 } }));
      }
      return { layers: staggerLayers(layers, 0.4) };
    },
  },
  {
    id: "timeline",
    name: "Timeline",
    blurb: "Four beats in a row",
    category: "process",
    build: ({ width, height }) => {
      const portrait = height > width;
      const beats = ["Start", "Build", "Prove", "Grow"];
      const icons = ["flag", "gear", "chart", "trophy"];
      const layers: Layer[] = [titleLayer("Timeline", 40, 28, width - 80, 18)];
      if (portrait) {
        beats.forEach((b, i) => {
          const y = 160 + i * 240;
          layers.push(iconLayer(icons[i]!, 80, y, 120));
          layers.push(textLayer(b, 220, y + 30, width - 280, { height: 64, text: { text: b, font: "hand", weight: 600, align: "left", color: "#1C1916", lineHeight: 1 } }));
        });
      } else {
        const col = (width - 80) / 4;
        beats.forEach((b, i) => {
          const x = 40 + i * col;
          layers.push(iconLayer(icons[i]!, x + (col - 140) / 2, 180, 140));
          layers.push(textLayer(b, x, 350, col, { height: 60, text: { text: b, font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }));
        });
      }
      return { layers: staggerLayers(layers, 0.38) };
    },
  },
  {
    id: "cycle",
    name: "Cycle",
    blurb: "Four stages around",
    category: "process",
    build: ({ width, height }) => {
      const labels = ["Heat", "Rise", "Fall", "Collect"];
      const icons = ["sun", "cloud", "drop", "leaf"];
      const layers: Layer[] = [titleLayer("A cycle", 40, 24, width - 80, 18)];
      const cx = width / 2;
      const cy = height / 2 + 20;
      const rx = Math.min(width, height) * 0.28;
      const ry = Math.min(width, height) * 0.24;
      labels.forEach((lab, i) => {
        const a = -Math.PI / 2 + i * (Math.PI / 2);
        const x = cx + Math.cos(a) * rx - 70;
        const y = cy + Math.sin(a) * ry - 70;
        layers.push(iconLayer(icons[i]!, x, y, 140, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }));
        layers.push(textLayer(lab, x - 20, y + 140, 180, { height: 52, text: { text: lab, font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }));
      });
      return { layers: staggerLayers(layers, 0.42) };
    },
  },
  {
    id: "quote",
    name: "Quote",
    blurb: "Callout line",
    category: "talk",
    build: ({ width, height }) => {
      const w = Math.min(width - 80, 980);
      const x = (width - w) / 2;
      const layers = staggerLayers([
        shapeLayer("bubble", x, height * 0.22, w, Math.min(280, height * 0.36), {
          duration: 1.4,
          anim: defaultAnim({ style: "contour", drawStyle: "outline", entrance: "pop" }),
        }),
        textLayer(wrap("The shortest path to belief is watching it get drawn.", 28), x + 24, height * 0.26, w - 48, {
          height: 90,
          duration: 2.2,
          text: { text: wrap("The shortest path to belief is watching it get drawn.", 28), font: "serif", weight: 600, align: "center", color: "#1C1916", lineHeight: 1.15 },
          anim: defaultAnim({ textAnim: "word", hand: "ghost" }),
        }),
        textLayer("— on the board", x, height * 0.22 + Math.min(280, height * 0.36) + 16, w, {
          height: 56,
          text: { text: "— on the board", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
        }),
      ]);
      return { layers };
    },
  },
  {
    id: "stats",
    name: "Stats",
    blurb: "Three numbers",
    category: "cards",
    build: ({ width, height }) => {
      const portrait = height > width;
      const stats = [
        { n: "3×", l: "faster" },
        { n: "92%", l: "kept" },
        { n: "1 tap", l: "to play" },
      ];
      const layers: Layer[] = [titleLayer("The numbers", 40, 32, width - 80, 18)];
      if (portrait) {
        stats.forEach((s, i) => {
          const y = 180 + i * 280;
          layers.push(textLayer(s.n, 40, y, width - 80, { height: 100, duration: 1.4, text: { text: s.n, font: "serif", weight: 700, align: "center", color: "#1F4E79", lineHeight: 1 } }));
          layers.push(textLayer(s.l, 40, y + 110, width - 80, { height: 56, text: { text: s.l, font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }));
        });
      } else {
        const col = width / 3;
        stats.forEach((s, i) => {
          layers.push(textLayer(s.n, col * i + 20, 200, col - 40, { height: 110, duration: 1.4, text: { text: s.n, font: "serif", weight: 700, align: "center", color: "#1F4E79", lineHeight: 1 } }));
          layers.push(textLayer(s.l, col * i + 20, 340, col - 40, { height: 56, text: { text: s.l, font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }));
        });
      }
      return { layers: staggerLayers(layers, 0.4) };
    },
  },
  {
    id: "list",
    name: "Numbered list",
    blurb: "Five lines",
    category: "talk",
    build: ({ width, height }) => {
      const items = ["Name the problem", "Show the pieces", "Draw the path", "Prove it simply", "Leave a next step"];
      const layers: Layer[] = [titleLayer("Checklist", 40, 28, width - 80, 18)];
      const top = 130;
      const gap = Math.min(90, (height - top - 40) / items.length);
      items.forEach((line, i) => {
        layers.push(
          textLayer(`${i + 1}.  ${line}`, 60, top + i * gap, width - 120, {
            height: 58,
            duration: 1.3,
            text: { text: `${i + 1}.  ${line}`, font: "hand", weight: 600, align: "left", color: "#1C1916", lineHeight: 1 },
            anim: defaultAnim({ textAnim: "typewriter", hand: "pen" }),
          }),
        );
      });
      return { layers: staggerLayers(layers, 0.5) };
    },
  },
  {
    id: "qa",
    name: "Q & A",
    blurb: "Question then answer",
    category: "talk",
    build: ({ width, height }) => {
      const w = width - 80;
      const layers = staggerLayers([
        iconLayer("question", width / 2 - 70, height * 0.12, 140, { anim: defaultAnim({ style: "radial", drawStyle: "outline" }) }),
        titleLayer("Why does this matter?", 40, height * 0.32, w, width < 800 ? 16 : 24),
        textLayer("Because watching it drawn is remembering it.", 40, height * 0.5, w, {
          height: 80,
          duration: 2,
          text: { text: wrap("Because watching it drawn is remembering it.", width < 800 ? 18 : 28), font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.15 },
        }),
      ]);
      return { layers };
    },
  },
  {
    id: "warning-box",
    name: "Callout",
    blurb: "Warning + note",
    category: "talk",
    build: ({ width }) => {
      const w = Math.min(width - 80, 900);
      const x = (width - w) / 2;
      const layers = staggerLayers([
        iconLayer("warning", x, 80, 120, { anim: defaultAnim({ style: "contour", drawStyle: "outline", color: "#8B2E2E" }) }),
        titleLayer("Watch this", x, 220, w, 18),
        textLayer("A short caution sits here.", x, 320, w, {
          height: 70,
          text: { text: "A short caution sits here.", font: "hand", weight: 600, align: "center", color: "#8B2E2E", lineHeight: 1.1 },
        }),
      ]);
      return { layers };
    },
  },
  {
    id: "close",
    name: "Close",
    blurb: "Check + takeaway",
    category: "cards",
    build: ({ width, height }) => {
      const w = width - 80;
      const layers = staggerLayers([
        iconLayer("check", width / 2 - 110, height * 0.14, 220, { anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "pulse" }) }),
        titleLayer("That's the idea", 40, height * 0.42, w, width < 800 ? 14 : 22),
        textLayer("One line they can say back.", 40, height * 0.56, w, {
          height: 70,
          text: { text: "One line they can say back.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
        }),
      ]);
      return { layers, captions: [{ id: uid("cap"), text: "Leave them with one sentence.", start: 0.3, end: 6 }] };
    },
  },
  {
    id: "anatomy",
    name: "Anatomy",
    blurb: "Icon + three labels",
    category: "process",
    build: ({ width, height }) => {
      const portrait = height > width;
      const layers: Layer[] = [titleLayer("The structure", 40, 28, width - 80, 18)];
      const labels = ["Surface", "Cavity", "Outlet"];
      if (portrait) {
        layers.push(iconLayer("sinus", width / 2 - 110, 160, 220, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }));
        labels.forEach((lab, i) => {
          layers.push(textLayer(lab, 40, 420 + i * 90, width - 80, { height: 60, text: { text: lab, font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }));
        });
      } else {
        layers.push(iconLayer("sinus", width / 2 - 140, 150, 260, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }));
        labels.forEach((lab, i) => {
          const x = 60 + i * ((width - 120) / 3);
          layers.push(textLayer(lab, x, 460, (width - 120) / 3, { height: 60, text: { text: lab, font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }));
        });
      }
      return { layers: staggerLayers(layers, 0.42) };
    },
  },
  {
    id: "funnel",
    name: "Funnel",
    blurb: "Wide to narrow",
    category: "process",
    build: ({ width, height }) => {
      const stages = ["Awareness", "Interest", "Action"];
      const icons = ["megaphone", "heart", "check"];
      const layers: Layer[] = [titleLayer("The funnel", 40, 28, width - 80, 18)];
      const top = 140;
      const gap = Math.min(160, (height - top - 40) / 3);
      stages.forEach((s, i) => {
        const w = width * (0.82 - i * 0.16);
        const x = (width - w) / 2;
        layers.push(shapeLayer("rect", x, top + i * gap, w, 88, { duration: 1.3 }));
        layers.push(iconLayer(icons[i]!, x + 16, top + i * gap + 8, 72));
        layers.push(
          textLayer(s, x + 100, top + i * gap + 12, w - 120, {
            height: 64,
            text: { text: s, font: "hand", weight: 600, align: "left", color: "#1C1916", lineHeight: 1 },
          }),
        );
      });
      return { layers: staggerLayers(layers, 0.4) };
    },
  },
];

export const CLIP_CATEGORIES = ["cards", "process", "compare", "talk"] as const;

export function getClip(id: string) {
  return CLIPS.find((c) => c.id === id);
}
