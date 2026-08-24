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
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    ctx.putImageData(data, 0, 0);
    return;
  }

  const n = w * h;
  const lum = new Float32Array(n);
  let mean = 0;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const L = 0.3 * px[p]! + 0.59 * px[p + 1]! + 0.11 * px[p + 2]!;
    lum[i] = L;
    mean += L;
  }
  mean /= n;
  const invert = mean < 92;
  if (invert) {
    for (let i = 0; i < n; i++) lum[i] = 255 - lum[i]!;
  }

  const blur = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      blur[i] =
        (lum[i - w - 1]! +
          lum[i - w]! +
          lum[i - w + 1]! +
          lum[i - 1]! +
          lum[i]! +
          lum[i + 1]! +
          lum[i + w - 1]! +
          lum[i + w]! +
          lum[i + w + 1]!) /
        9;
    }
  }

  const mag = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -blur[i - w - 1]! +
        blur[i - w + 1]! -
        2 * blur[i - 1]! +
        2 * blur[i + 1]! -
        blur[i + w - 1]! +
        blur[i + w + 1]!;
      const gy =
        -blur[i - w - 1]! -
        2 * blur[i - w]! -
        blur[i - w + 1]! +
        blur[i + w - 1]! +
        2 * blur[i + w]! +
        blur[i + w + 1]!;
      mag[i] = Math.hypot(gx, gy);
    }
  }

  const outlinesOnly = filter === "ink";
  const edgeT = outlinesOnly ? 38 : 26;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const p = i * 4;
      const L = blur[i] || lum[i]!;
      const m = mag[i]!;
      const edge = m > edgeT;
      const paper = L > 232 && m < 14;
      if (paper || x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        px[p] = 255;
        px[p + 1] = 255;
        px[p + 2] = 255;
        px[p + 3] = 0;
        continue;
      }
      if (edge) {
        const ink = Math.max(18, 48 - (m - edgeT) * 0.4);
        px[p] = ink;
        px[p + 1] = ink * 0.92;
        px[p + 2] = ink * 0.82;
        px[p + 3] = 255;
        continue;
      }
      if (outlinesOnly || L > 188) {
        px[p + 3] = 0;
        continue;
      }
      // Flat marker wash from the original colour so masses still read, without photo shading.
      const wash = 0.38;
      px[p] = Math.round(px[p]! * wash + 28 * (1 - wash));
      px[p + 1] = Math.round(px[p + 1]! * wash + 25 * (1 - wash));
      px[p + 2] = Math.round(px[p + 2]! * wash + 22 * (1 - wash));
      px[p + 3] = L < 70 ? 200 : 110;
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
            const len = 11 + Math.random() * 16;
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
    case "scribble":
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
