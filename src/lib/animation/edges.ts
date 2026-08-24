import type { AnimationStyle } from "@/lib/project/types";

export interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  edge: number;
  strokes: { x1: number; y1: number; x2: number; y2: number }[];
}

export function rasterizeImage(
  src: string,
  width: number,
  height: number,
  filter: "none" | "sketch" | "poster" | "ink",
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(2, Math.round(width));
      canvas.height = Math.max(2, Math.round(height));
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
      if (filter !== "none") applyFilter(ctx, canvas.width, canvas.height, filter);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function applyFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filter: "sketch" | "poster" | "ink",
) {
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  if (filter === "poster") {
    for (let i = 0; i < px.length; i += 4) {
      px[i] = Math.round(px[i]! / 48) * 48;
      px[i + 1] = Math.round(px[i + 1]! / 48) * 48;
      px[i + 2] = Math.round(px[i + 2]! / 48) * 48;
    }
  } else if (filter === "ink") {
    for (let i = 0; i < px.length; i += 4) {
      const l = 0.3 * px[i]! + 0.59 * px[i + 1]! + 0.11 * px[i + 2]!;
      const v = l < 140 ? 30 : 245;
      px[i] = px[i + 1] = px[i + 2] = v;
    }
  } else {
    const copy = new Uint8ClampedArray(px);
    const idx = (x: number, y: number) => (y * w + x) * 4;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let gx = 0;
        let gy = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const i = idx(x + kx, y + ky);
            const l = 0.3 * copy[i]! + 0.59 * copy[i + 1]! + 0.11 * copy[i + 2]!;
            const sx = kx === 0 ? 0 : kx;
            const sy = ky === 0 ? 0 : ky;
            gx += l * sx;
            gy += l * sy;
          }
        }
        const mag = Math.min(255, Math.hypot(gx, gy) * 0.6);
        const i = idx(x, y);
        const v = 255 - mag;
        px[i] = px[i + 1] = px[i + 2] = v;
      }
    }
  }
  ctx.putImageData(data, 0, 0);
}

export function buildCells(canvas: HTMLCanvasElement, cols: number, rows: number): Cell[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * ch;
      const w = cw;
      const h = ch;
      const sampleW = Math.max(2, Math.round(w));
      const sampleH = Math.max(2, Math.round(h));
      let img: ImageData;
      try {
        img = ctx.getImageData(Math.round(x), Math.round(y), sampleW, sampleH);
      } catch {
        cells.push({ x, y, w, h, cx: x + w / 2, cy: y + h / 2, edge: 0, strokes: [] });
        continue;
      }
      const strokes: Cell["strokes"] = [];
      let edge = 0;
      const step = Math.max(3, Math.floor(Math.min(sampleW, sampleH) / 6));
      for (let py = 1; py < sampleH - 1; py += step) {
        for (let px = 1; px < sampleW - 1; px += step) {
          const i = (py * sampleW + px) * 4;
          const l = 0.3 * img.data[i]! + 0.59 * img.data[i + 1]! + 0.11 * img.data[i + 2]!;
          const i2 = (py * sampleW + px + 1) * 4;
          const l2 = 0.3 * img.data[i2]! + 0.59 * img.data[i2 + 1]! + 0.11 * img.data[i2 + 2]!;
          const diff = Math.abs(l - l2);
          if (diff > 18 || l < 90) {
            edge += diff;
            const jitter = (Math.random() - 0.5) * 3;
            const len = 6 + Math.random() * 10;
            const ang = diff > 18 ? Math.atan2(0, 1) + jitter * 0.2 : Math.random() * Math.PI;
            strokes.push({
              x1: x + px + jitter,
              y1: y + py,
              x2: x + px + Math.cos(ang) * len,
              y2: y + py + Math.sin(ang) * len,
            });
          }
        }
      }
      cells.push({
        x,
        y,
        w,
        h,
        cx: x + w / 2,
        cy: y + h / 2,
        edge,
        strokes: strokes.slice(0, 18),
      });
    }
  }
  return cells;
}

function seededShuffle(idx: number[]) {
  const a = [...idx];
  let seed = 1337 + a.length * 17;
  const rand = () => {
    seed = (seed * 16807 + 11) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function orderCells(cells: Cell[], style: AnimationStyle, cols: number, rows: number): number[] {
  const idx = cells.map((_, i) => i);
  const colOf = (i: number) => i % cols;
  const rowOf = (i: number) => Math.floor(i / cols);
  const cx = cols / 2;
  const cy = rows / 2;

  const by = (fn: (i: number) => number) => idx.sort((a, b) => fn(a) - fn(b));

  switch (style) {
    case "scanner":
    case "wipe-right":
      return by((i) => colOf(i) * 1000 + rowOf(i));
    case "zigzag":
    case "scribble":
      return idx.sort((a, b) => {
        const ra = rowOf(a);
        const rb = rowOf(b);
        if (ra !== rb) return ra - rb;
        return ra % 2 === 0 ? colOf(a) - colOf(b) : colOf(b) - colOf(a);
      });
    case "wipe-down":
      return by((i) => rowOf(i) * 1000 + colOf(i));
    case "wipe-left":
      return by((i) => (cols - colOf(i)) * 1000 + rowOf(i));
    case "wipe-up":
      return by((i) => (rows - rowOf(i)) * 1000 + colOf(i));
    case "diagonal":
      return by((i) => colOf(i) + rowOf(i));
    case "reverse-spiral":
      return by((i) => {
        const dx = colOf(i) - cx;
        const dy = rowOf(i) - cy;
        return -(Math.hypot(dx, dy) * 1000) + Math.atan2(dy, dx);
      });
    case "edges-first":
      return idx.sort((a, b) => cells[b]!.edge - cells[a]!.edge);
    case "chunks":
    case "scatter":
      return seededShuffle(idx);
    case "spiral":
      return by((i) => {
        const dx = colOf(i) - cx;
        const dy = rowOf(i) - cy;
        return Math.hypot(dx, dy) * 1000 + Math.atan2(dy, dx);
      });
    case "radial":
    case "portrait":
      return by((i) => Math.hypot(colOf(i) - cx, rowOf(i) - cy));
    case "contour":
      return idx.sort((a, b) => cells[b]!.edge - cells[a]!.edge);
    case "human":
      return by((i) => rowOf(i) * 10 + Math.abs(colOf(i) - cx));
    case "landscape":
      return by((i) => rowOf(i) * 1000 + colOf(i));
    case "building":
      return by((i) => (rows - rowOf(i)) * 1000 + colOf(i));
    case "vehicle":
      return by((i) => colOf(i) * 1000 + rowOf(i));
    case "checker":
      return by((i) => ((rowOf(i) + colOf(i)) % 2) * 10000 + rowOf(i) * 100 + colOf(i));
    case "rain":
      return by((i) => rowOf(i) * 40 + colOf(i) * 7);
    case "diamond":
      return by((i) => Math.abs(colOf(i) - cx) + Math.abs(rowOf(i) - cy));
    case "columns":
      return by((i) => colOf(i) * 1000 + rowOf(i));
    default:
      return idx;
  }
}
