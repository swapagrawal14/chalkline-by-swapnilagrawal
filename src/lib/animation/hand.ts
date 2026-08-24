import type { HandStyle } from "@/lib/project/types";

export function drawHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  style: HandStyle,
  scale = 1,
  mirror = false,
  lift = 0,
) {
  if (style === "ghost") return;
  ctx.save();
  ctx.translate(x, y);
  const raise = lift * 36;
  ctx.translate(raise * 0.55, -raise);
  ctx.scale(mirror || style === "left-marker" ? -scale : scale, scale);
  ctx.rotate(0.48 + lift * 0.18);

  ctx.shadowColor = "rgba(28,25,22,0.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 14;

  const tool = style === "pen" ? "pen" : style === "chalk" ? "chalk" : "marker";
  drawTool(ctx, tool);
  ctx.shadowColor = "transparent";
  drawFingers(ctx);

  ctx.restore();
}

function drawTool(ctx: CanvasRenderingContext2D, tool: "marker" | "pen" | "chalk") {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (tool === "pen") {
    ctx.fillStyle = "#1c1916";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#243f73";
    roundRect(ctx, -7, 20, 14, 86, 3);
    ctx.fill();
    ctx.fillStyle = "#d7c4a3";
    roundRect(ctx, -6, 24, 12, 16, 2);
    ctx.fill();
    return;
  }

  if (tool === "chalk") {
    ctx.fillStyle = "#f3efe4";
    ctx.strokeStyle = "#cfc6b4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(6, 56);
    ctx.lineTo(-6, 56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  // Sharpie-style marker, tip on the stroke
  ctx.fillStyle = "#1a1714";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(4.2, 11);
  ctx.lineTo(-4.2, 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#111010";
  roundRect(ctx, -8.5, 11, 17, 86, 5);
  ctx.fill();
  ctx.fillStyle = "#3a3a3a";
  roundRect(ctx, -8.5, 11, 17, 14, 4);
  ctx.fill();
  ctx.fillStyle = "#cfc8bc";
  roundRect(ctx, -6, 22, 12, 7, 2);
  ctx.fill();
}

function drawFingers(ctx: CanvasRenderingContext2D) {
  const skin = "#e8bc90";
  const shade = "#c9956a";
  const stroke = "#6a4530";
  ctx.fillStyle = skin;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(-20, 62);
  ctx.quadraticCurveTo(-34, 96, -10, 128);
  ctx.quadraticCurveTo(26, 140, 34, 98);
  ctx.quadraticCurveTo(36, 66, 12, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.ellipse(-8, 102, 10, 16, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin;

  ctx.beginPath();
  ctx.ellipse(-26, 84, 11, 18, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const fingers = [
    { x: -12, y: 54, w: 9, h: 26, r: -0.18 },
    { x: -1, y: 50, w: 9, h: 28, r: -0.02 },
    { x: 10, y: 54, w: 8.5, h: 26, r: 0.12 },
    { x: 20, y: 62, w: 7.5, h: 20, r: 0.26 },
  ];
  for (const f of fingers) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.r);
    roundRect(ctx, -f.w / 2, 0, f.w, f.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f3d0ae";
    roundRect(ctx, -f.w / 2 + 1.5, f.h - 7, f.w - 3, 6, 2);
    ctx.fill();
    ctx.fillStyle = skin;
    ctx.restore();
  }

  ctx.fillStyle = "#1c1916";
  ctx.beginPath();
  ctx.moveTo(-14, 120);
  ctx.quadraticCurveTo(10, 146, 32, 116);
  ctx.lineTo(48, 168);
  ctx.lineTo(-28, 174);
  ctx.closePath();
  ctx.fill();
}

function roundRect(
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
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
