import { AutoPlayBoard } from "@/components/board/auto-play";
import { Button } from "@/components/ui/button";
import { sampleMeetChalkline, STARTER_TEMPLATES } from "@/lib/project/samples";
import { Link } from "@tanstack/react-router";
import {
  Clapperboard,
  Hand,
  Layers3,
  Lock,
  Scissors,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useMemo } from "react";

export function HomePage() {
  const demo = useMemo(() => sampleMeetChalkline(), []);

  return (
    <div className="paper-grain min-h-dvh text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
          <span className="grid size-8 place-items-center rounded-sm bg-paper-deep">
            <span className="block h-4 w-0.5 rotate-[-38deg] rounded-full bg-marker" />
          </span>
          Chalkline
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <a href="#features" className="hidden px-3 py-2 text-ink-soft hover:text-ink md:inline">
            Features
          </a>
          <a href="#how" className="hidden px-3 py-2 text-ink-soft hover:text-ink md:inline">
            How it works
          </a>
          <Link to="/developers" className="hidden px-3 py-2 text-ink-soft hover:text-ink md:inline">
            API
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/studio">Boards</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/studio">Open studio</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-8 md:grid-cols-[1.05fr_0.95fr] md:pt-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Whiteboard animation studio
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
            The hand that draws your story
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            Turn diagrams, photos, and copy into explainer films. Twenty-three drawing
            orders, a full icon library, ready-made clips, and optional AI that talks to
            the model you connect — all on this device.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/studio">Start a board</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/developers">Free API</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <li>No account</li>
            <li>No watermark</li>
            <li>Saved in this browser</li>
          </ul>
        </div>
        <div className="rounded-xl bg-ink p-2 shadow-pop md:p-3">
          <div className="overflow-hidden rounded-lg bg-paper">
            <AutoPlayBoard project={demo} />
          </div>
          <p className="px-2 py-2 text-center text-[11px] uppercase tracking-[0.16em] text-paper/70">
            Live sample · Meet Chalkline
          </p>
        </div>
      </section>

      <section id="features" className="border-y border-line bg-surface/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title}>
              <f.icon className="mb-3 size-5 text-marker" />
              <h2 className="font-display text-2xl">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">How it works</p>
        <h2 className="mt-3 font-display text-4xl">Three beats, then a film</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-line bg-elevated p-5 shadow-soft">
              <p className="font-mono text-xs text-muted">0{i + 1}</p>
              <h3 className="mt-2 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-surface/70">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl">Also in the studio</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {EXTRAS.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink-soft">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-marker" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/studio">Open the studio</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl">Start from a template</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STARTER_TEMPLATES.map((t) => (
            <Link
              key={t.id}
              to="/studio"
              className="rounded-xl border border-line bg-elevated p-5 shadow-soft hover:border-marker"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Template</p>
              <p className="mt-2 font-display text-2xl">{t.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: Hand,
    title: "A real drawing hand",
    body: "Marker, chalk, fountain, charcoal, or a ghost. The stroke follows the path as if someone is at the board.",
  },
  {
    icon: Sparkles,
    title: "Motion packs on the board",
    body: "Quick reveal, sketch artist, rain, kinetic, typewriter, bounce — tap a pack under the canvas. It is never buried.",
  },
  {
    icon: Layers3,
    title: "Scenes, captions, looks",
    body: "Chalkboard, blueprint, kraft. Fade, wipe, slide, iris between scenes. Lower-thirds type on as the hand works.",
  },
  {
    icon: Clapperboard,
    title: "Present, then export",
    body: "Fullscreen present mode for a talk. WebM of the drawing, PNG of the last frame. No watermark.",
  },
  {
    icon: Scissors,
    title: "Photo to sketch",
    body: "Upload a PNG or JPEG, run sketch / ink / poster filters, then reveal it in bands, a spiral, rain, or a contour trace.",
  },
  {
    icon: Wand2,
    title: "Ask your own model",
    body: "Optional. Paste any OpenAI-compatible base URL and key. Prompt a minute-long portrait film — the board appears on the canvas.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "No sign-in. Boards live in this browser. Presenter notes stay off the export. JSON import if you move machines.",
  },
];

const STEPS = [
  {
    title: "Place the pieces",
    body: "Type a title in Caveat or Fraunces, drop a photo, or stamp an icon. Drag to compose the frame.",
  },
  {
    title: "Pick how it draws",
    body: "Tap a motion pack under the board. Tune entrance, easing, after-motion, and the hand. Stagger the scene if you want a cascade.",
  },
  {
    title: "Play and take the film",
    body: "Spacebar previews. F presents. Export records the canvas. Switch the board to chalkboard or blueprint for a different room.",
  },
];

const EXTRAS = [
  "23 animation orders: scanner, rain, diamond, checker, scatter, subject-aware…",
  "14 motion packs plus board looks (paper, chalk, blueprint, kraft, night)",
  "Text: typewriter, word-by-word, fade, bounce letters",
  "After-draw pulse, float, or shake — plus wiggle and chalk dust",
  "Entrances: pop, zoom, spin, drop, slides. Easing including bounce and elastic",
  "Scene transitions: cut, fade, wipe, slide, dissolve, iris",
  "Spotlight, grid snap, present mode, copy/paste motion",
  "Speech bubbles, callouts, image slicer, sketch/ink/poster filters",
  "Stagger timing, faster/slower scene, duplicate scene, JSON import/export",
  "Lower-third captions, Ken Burns, music bed, optional tick SFX",
  "Library clips: title cards, steps, compare, timeline, cycle, quotes, stats, Q&A",
  "Optional AI: your OpenAI-compatible URL + key; the model storyboards onto the canvas",
];
