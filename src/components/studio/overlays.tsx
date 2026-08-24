import { BoardCanvas } from "@/components/board/board-canvas";
import { Button } from "@/components/ui/button";
import { durationOf, useStudio } from "@/lib/project/store";
import { formatTime } from "@/lib/utils";
import { Pause, Play, X } from "lucide-react";

export function PresentMode() {
  const presenting = useStudio((s) => s.presenting);
  const setPresenting = useStudio((s) => s.setPresenting);
  const prepared = useStudio((s) => s.prepared);
  const time = useStudio((s) => s.time);
  const playing = useStudio((s) => s.playing);
  const togglePlay = useStudio((s) => s.togglePlay);
  const project = useStudio((s) => s.project);
  if (!presenting || !project) return null;
  const duration = durationOf(project, prepared);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      <div className="flex items-center gap-3 px-4 py-3 text-paper">
        <p className="font-display text-lg">{project.name}</p>
        <span className="font-mono text-xs text-paper/60">
          {formatTime(time)} / {formatTime(duration)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={togglePlay}>
            {playing ? <Pause /> : <Play />}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPresenting(false)}>
            <X /> Exit
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <BoardCanvas prepared={prepared} time={time} mode={playing ? "play" : "edit"} className="h-full w-full" />
      </div>
    </div>
  );
}

export function ShortcutsHelp() {
  const show = useStudio((s) => s.showHelp);
  const setShowHelp = useStudio((s) => s.setShowHelp);
  if (!show) return null;
  const rows = [
    ["Space", "Play / pause"],
    ["F", "Present mode"],
    ["G", "Toggle grid"],
    ["?", "This list"],
    ["← ↑ → ↓", "Nudge layer (Shift = 10px)"],
    ["Delete", "Remove layer"],
    ["⌘/Ctrl D", "Duplicate layer"],
    ["⌘/Ctrl Z", "Undo"],
    ["⌘/Ctrl Shift C / V", "Copy / paste motion"],
    ["⌘/Ctrl S", "Save on this device"],
    ["Esc", "Deselect / exit present"],
  ];
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4" onClick={() => setShowHelp(false)}>
      <div
        className="w-full max-w-md rounded-xl bg-elevated p-6 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Keyboard</p>
        <h2 className="mt-1 font-display text-2xl">Shortcuts</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {rows.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between gap-4 py-2">
              <span className="font-mono text-xs text-marker">{k}</span>
              <span className="text-ink-soft">{v}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-4 w-full" onClick={() => setShowHelp(false)}>
          Close
        </Button>
      </div>
    </div>
  );
}
