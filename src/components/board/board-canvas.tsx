import { localTime, renderFrame, type EngineMode, type PreparedProject } from "@/lib/animation/engine";
import { canvasSize, type Layer } from "@/lib/project/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

type Props = {
  prepared: PreparedProject | null;
  time: number;
  mode: EngineMode;
  selectedId?: string | null;
  className?: string;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
};

export function BoardCanvas({
  prepared,
  time,
  mode,
  selectedId,
  className,
  onSelect,
  onMove,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prepared) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = prepared;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrame(ctx, prepared, time, mode, selectedId ? [selectedId] : []);
  }, [prepared, time, mode, selectedId]);

  function toLocal(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !prepared) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * prepared.width;
    const y = ((e.clientY - rect.top) / rect.height) * prepared.height;
    return { x, y };
  }

  function hit(x: number, y: number): Layer | null {
    if (!prepared) return null;
    const { scene } = localTime(prepared, mode === "edit" ? prepared.duration : time);
    for (let i = scene.scene.layers.length - 1; i >= 0; i--) {
      const layer = scene.scene.layers[i]!;
      if (!layer.visible) continue;
      if (x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height) {
        return layer;
      }
    }
    return null;
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        className="max-h-full max-w-full rounded-sm bg-paper shadow-pop"
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: prepared ? `${prepared.width} / ${prepared.height}` : "16 / 9",
        }}
        onPointerDown={(e) => {
          if (mode !== "edit" || !prepared) return;
          const pt = toLocal(e);
          if (!pt) return;
          const layer = hit(pt.x, pt.y);
          onSelect?.(layer?.id ?? null);
          if (layer && !layer.locked) {
            drag.current = { id: layer.id, dx: pt.x - layer.x, dy: pt.y - layer.y };
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const pt = toLocal(e);
          if (!pt) return;
          onMove?.(drag.current.id, pt.x - drag.current.dx, pt.y - drag.current.dy);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      />
      {!prepared ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
          Preparing board…
        </div>
      ) : null}
    </div>
  );
}

export function BoardFrame({
  aspect,
  children,
}: {
  aspect: string;
  children: ReactNode;
}) {
  const [w, h] = aspect.split(":").map(Number);
  return (
    <div
      className="overflow-hidden rounded-lg bg-ink shadow-pop"
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      {children}
    </div>
  );
}

export function displaySize(prepared: PreparedProject | null) {
  if (!prepared) return canvasSize({ aspect: "16:9", resolution: "720p" });
  return { width: prepared.width, height: prepared.height };
}
