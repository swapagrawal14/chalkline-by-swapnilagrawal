import { Button } from "@/components/ui/button";
import { BOARD_LOOKS, MOTION_PRESETS } from "@/lib/project/presets";
import { useStudio } from "@/lib/project/store";
import { cn } from "@/lib/utils";
import { Copy, ClipboardPaste } from "lucide-react";

export function MotionDock() {
  const applyMotionPreset = useStudio((s) => s.applyMotionPreset);
  const selectedId = useStudio((s) => s.selectedId);
  const copyMotion = useStudio((s) => s.copyMotion);
  const pasteMotion = useStudio((s) => s.pasteMotion);
  const motionClipboard = useStudio((s) => s.motionClipboard);
  const staggerWithGap = useStudio((s) => s.staggerWithGap);
  const applyLook = useStudio((s) => s.applyLook);
  const project = useStudio((s) => s.project);

  return (
    <div className="hidden w-full shrink-0 border-t border-line bg-surface px-3 py-1.5 md:block">
      <div className="flex items-center gap-2">
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {selectedId ? "Layer" : "Scene"}
        </p>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-0.5">
          {MOTION_PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.blurb}
              onClick={() => applyMotionPreset(p.id, selectedId ? "layer" : "scene")}
              className="shrink-0 rounded-md border border-line bg-elevated px-2 py-1 text-xs font-medium hover:border-marker"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost" disabled={!selectedId} onClick={copyMotion} aria-label="Copy motion">
            <Copy className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" disabled={!motionClipboard} onClick={pasteMotion} aria-label="Paste motion">
            <ClipboardPaste className="size-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => staggerWithGap(0.28)}>
            Stagger
          </Button>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Look</span>
        {BOARD_LOOKS.map((look) => (
          <button
            key={look.id}
            onClick={() => applyLook(look.id)}
            className={cn(
              "rounded-sm border px-1.5 py-0.5 text-[11px]",
              project?.background === look.bg ? "border-ink bg-paper-deep" : "border-line hover:border-line-strong",
            )}
          >
            {look.name}
          </button>
        ))}
      </div>
    </div>
  );
}
