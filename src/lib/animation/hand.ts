import type { HandStyle } from "@/lib/project/types";

export function drawHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  style: HandStyle,
  scale = 1,
  mirror = false,
) {
  if (style === "ghost") return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(mirror || style === "left-marker" ? -scale : scale, scale);
  ctx.rotate(0.42);

  const tool = style === "pen" ? "pen" : style === "chalk" ? "chalk" : "marker";
  drawTool(ctx, tool);
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
    ctx.lineTo(7, 18);
    ctx.lineTo(-7, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2b4c7e";
    roundRect(ctx, -6, 18, 12, 78, 3);
    ctx.fill();
    ctx.fillStyle = "#d7c4a3";
    roundRect(ctx, -5, 22, 10, 14, 2);
    ctx.fill();
    return;
  }

  if (tool === "chalk") {
    ctx.fillStyle = "#f3efe4";
    ctx.strokeStyle = "#cfc6b4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.lineTo(5, 52);
    ctx.lineTo(-5, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  ctx.fillStyle = "#1c1916";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(5, 14);
  ctx.lineTo(-5, 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1f4e79";
  roundRect(ctx, -7, 14, 14, 72, 4);
  ctx.fill();
  ctx.fillStyle = "#d4542c";
  roundRect(ctx, -7, 14, 14, 10, 3);
  ctx.fill();
}

function drawFingers(ctx: CanvasRenderingContext2D) {
  const skin = "#e2b48a";
  const stroke = "#5a3b28";
  ctx.fillStyle = skin;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;

  // palm
  ctx.beginPath();
  ctx.moveTo(-18, 58);
  ctx.quadraticCurveTo(-28, 92, -8, 118);
  ctx.quadraticCurveTo(22, 128, 28, 92);
  ctx.quadraticCurveTo(30, 62, 10, 54);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // thumb
  ctx.beginPath();
  ctx.ellipse(-22, 78, 10, 16, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // knuckles wrapping the marker
  const fingers = [
    { x: -10, y: 52, w: 8, h: 22, r: -0.15 },
    { x: 0, y: 48, w: 8, h: 24, r: 0 },
    { x: 10, y: 52, w: 7.5, h: 22, r: 0.12 },
    { x: 18, y: 58, w: 7, h: 18, r: 0.22 },
  ];
  for (const f of fingers) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.r);
    roundRect(ctx, -f.w / 2, 0, f.w, f.h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // sleeve
  ctx.fillStyle = "#1c1916";
  ctx.beginPath();
  ctx.moveTo(-12, 112);
  ctx.quadraticCurveTo(8, 136, 26, 108);
  ctx.lineTo(40, 150);
  ctx.lineTo(-24, 156);
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
