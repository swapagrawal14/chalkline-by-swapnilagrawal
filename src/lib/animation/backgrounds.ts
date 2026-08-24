import type { Project } from "@/lib/project/types";

export function isDarkBackground(bg: Project["background"]) {
  return bg === "chalkboard" || bg === "blueprint" || bg === "night";
}

export function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Pick<Project, "background" | "solidColor">,
) {
  const { background, solidColor } = project;
  ctx.save();

  if (background === "solid") {
    ctx.fillStyle = solidColor;
    ctx.fillRect(0, 0, width, height);
  } else if (background === "chalkboard") {
    ctx.fillStyle = "#24352b";
    ctx.fillRect(0, 0, width, height);
    noise(ctx, width, height, 0.08);
  } else if (background === "blueprint") {
    ctx.fillStyle = "#16324f";
    ctx.fillRect(0, 0, width, height);
    grid(ctx, width, height, 40, "rgba(180,210,240,0.18)", 20);
  } else if (background === "night") {
    ctx.fillStyle = "#161412";
    ctx.fillRect(0, 0, width, height);
  } else if (background === "kraft") {
    ctx.fillStyle = "#c9a46c";
    ctx.fillRect(0, 0, width, height);
    noise(ctx, width, height, 0.12);
  } else if (background === "whiteboard") {
    ctx.fillStyle = "#f7f6f2";
    ctx.fillRect(0, 0, width, height);
    grid(ctx, width, height, 48, "rgba(28,25,22,0.04)", 0);
  } else if (background === "grid") {
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(0, 0, width, height);
    grid(ctx, width, height, 32, "rgba(28,25,22,0.08)", 0);
  } else if (background === "lined") {
    ctx.fillStyle = "#f7f1e4";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(180,150,110,0.45)";
    ctx.lineWidth = 1;
    for (let y = 48; y < height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(196,80,70,0.35)";
    ctx.beginPath();
    ctx.moveTo(72, 0);
    ctx.lineTo(72, height);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#f4efe6";
    ctx.fillRect(0, 0, width, height);
    const g = ctx.createRadialGradient(width * 0.15, height * 0.1, 0, width * 0.5, height * 0.5, width);
    g.addColorStop(0, "rgba(255,252,247,0.55)");
    g.addColorStop(1, "rgba(214,200,170,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    noise(ctx, width, height, 0.09);
  }

  ctx.restore();
}

function grid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  color: string,
  minor: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  if (minor) {
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.08)");
    for (let x = 0; x <= w; x += minor) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
  }
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  const tile = 96;
  const img = ctx.createImageData(tile, tile);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 220 + Math.random() * 35;
    img.data[i] = v;
    img.data[i + 1] = v - 8;
    img.data[i + 2] = v - 16;
    img.data[i + 3] = alpha * 255 * Math.random();
  }
  const c = document.createElement("canvas");
  c.width = tile;
  c.height = tile;
  c.getContext("2d")!.putImageData(img, 0, 0);
  const pattern = ctx.createPattern(c, "repeat");
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
}

export function captionTheme(bg: Project["background"]) {
  if (isDarkBackground(bg)) {
    return { fill: "rgba(20,18,16,0.55)", text: "#F4EFE6" };
  }
  return { fill: "rgba(28,25,22,0.82)", text: "#F4EFE6" };
}
