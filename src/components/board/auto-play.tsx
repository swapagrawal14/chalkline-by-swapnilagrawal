import { prepareProject, renderFrame, type PreparedProject } from "@/lib/animation/engine";
import type { Project } from "@/lib/project/types";
import { useEffect, useRef } from "react";

export function AutoPlayBoard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let dead = false;
    let raf = 0;
    let prepared: PreparedProject | null = null;
    let t = 0;
    let last = performance.now();

    void prepareProject(project).then((p) => {
      if (dead) return;
      prepared = p;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = p.width;
        canvas.height = p.height;
      }
      const loop = (now: number) => {
        if (dead || !prepared) return;
        const dt = (now - last) / 1000;
        last = now;
        t += dt;
        if (t > prepared.duration) t = 0;
        const el = canvasRef.current;
        const ctx = el?.getContext("2d");
        if (el && ctx) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          if (el.width !== Math.round(prepared.width * dpr)) {
            el.width = Math.round(prepared.width * dpr);
            el.height = Math.round(prepared.height * dpr);
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          renderFrame(ctx, prepared, t, "play");
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
  }, [project]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
