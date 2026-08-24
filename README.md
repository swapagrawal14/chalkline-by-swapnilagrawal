# Chalkline

The hand that draws your story.

Chalkline is an in-browser **whiteboard animation studio**. Drop photos, stamp line icons, type copy, and a hand draws them onto the board — then you export a WebM film or a PNG still. No account. No watermark. Boards live in this browser.

Inspired by tools like [Inkplainer](https://inkplainer.pages.dev/), built as a fuller studio: motion packs, scenes, captions, present mode, looks, and more.

---

## What you can make

Explainer clips, classroom diagrams, product intros, science cycles, growth loops — anything that benefits from watching a board get drawn.

- **Layers** — text, icons, photos, boxes, ovals, arrows, highlights, speech bubbles, callouts
- **Library** — 90+ line icons (including medical), plus stampable clips: title cards, three steps, compare, timeline, cycle, quotes, stats, lists, Q&A, funnel, anatomy
- **Templates** — product intro, science cycle, growth loop, Caldwell-Luc overview, how-to method, old vs new, short history, two questions
- **Optional AI** — connect any OpenAI-compatible API; prompt a film and it lands on the canvas
- **23 drawing orders** — scanner, zigzag, contour, spiral, radial, chunks, wipes, diagonal, reverse spiral, edges-first, subject-aware (portrait / human / landscape / building / vehicle), checker, rain, diamond, scatter, columns
- **14 motion packs** on a strip under the canvas — quick reveal, sketch artist, blueprint, chalk talk, pop, story hand, spiral, comic, rain, kinetic, vintage, diamond, typewriter, bounce stack
- **Stroke & hand** — marker, charcoal, sketch, fountain, chalk · right / left / pen / chalk / ghost (no hand)
- **Text animation** — typewriter, word-by-word, fade, bounce letters
- **Entrance & after** — fade, pop, drop, zoom, spin, slides · then pulse, float, or shake
- **Scenes** — multi-scene timeline, hold, Ken Burns camera, transitions (cut, fade, wipe, slide, dissolve, iris)
- **Looks** — paper, chalkboard, blueprint, kraft, night, notebook
- **Captions** — timed lower-thirds
- **Export** — WebM video, PNG still, JSON project file
- **Present mode** — fullscreen play

---

## Requirements

| | |
|---|---|
| **Node.js** | 22 or newer ([nodejs.org](https://nodejs.org/)) |
| **npm** | 10+ (ships with Node) |
| **Browser** | Chromium / Chrome / Edge recommended. Firefox and Safari work for editing; WebM export uses `MediaRecorder` and is most reliable in Chromium. |
| **OS** | macOS, Windows, Linux |

No database, no sign-in. Optional music is a file you pick locally. Optional AI uses **your** model endpoint and key, stored only in this browser.

---

## Install

```bash
git clone https://github.com/swapagrawal14/chalkline-by-swapnilagrawal.git
cd chalkline-by-swapnilagrawal
npm install
```

That’s it. There is no `.env` file to create.

---

## Run (development)

```bash
npm run dev
```

Then open **http://localhost:8080** in your browser.

| Path | What you get |
|---|---|
| `/` | Landing page with a live sample board |
| `/studio` | Your boards (templates + saved work) |
| `/studio?p=<id>` | Open a specific board |

First visit seeds starter templates (product intro, science diagram, growth loop, Caldwell-Luc overview, how-to, compare, timeline, FAQ).

### Production build

```bash
npm run build
npm run preview
```

Preview serves the built app on **http://127.0.0.1:8081**.

`npm run build` also runs a migrate step. This app does not use a remote database, so that step is a no-op unless `DATABASE_URL` is set.

---

## Using the studio

1. **Open studio** → New board, or start from a template.
2. **Add pieces** — Text, Image (or drop a PNG/JPEG/WebP/GIF/SVG on the stage), icons from the library, **ready-made clips** (title card, steps, compare…), shapes, arrows, speech bubbles.
3. **Compose** — drag on the board. Arrow keys nudge (Shift = 10px). Align / flip in the inspector.
4. **Animate** — tap a **motion pack** under the canvas. With a layer selected it styles that layer; with nothing selected it paints the whole scene. Tune style, stroke, hand, easing, entrance, speed, sketchiness in the inspector (desktop) or the **Motion** tab (phone).
5. **Sequence** — auto-sequence, or set start/duration per layer. Add scenes along the timeline. Pick a scene transition.
6. **Play** — Space, or the Play button. Speed 0.5×–2× in the header.
7. **Export** — **PNG** for the finished frame, **Export** for a WebM of the drawing. Keep this tab visible while it records.

### Motion strip

Always visible under the board on desktop. Packs, copy/paste motion, stagger, scene timing, and board looks (paper / chalkboard / blueprint / kraft / night / notebook).

### Board tools (inspector)

- **Grid** and **snap** — `G` toggles the grid
- **Spotlight** — dims other layers while one is drawing
- **Tick** — a small click when a layer starts (Web Audio, no files)
- **Loop playback**
- **Ken Burns** camera on the active scene
- **Music bed** — pick an audio file on this device
- **Image slicer** — split a photo into independently drawn tiles; sketch / poster / ink filters

### Present

Press **F** or the Present button for a fullscreen play-through. Esc exits.

---

## Keyboard

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `F` | Present mode |
| `G` | Toggle grid |
| `?` | Shortcuts list |
| `← ↑ → ↓` | Nudge selected layer (Shift = 10px) |
| `Delete` / `Backspace` | Remove layer |
| `⌘/Ctrl D` | Duplicate layer |
| `⌘/Ctrl Z` | Undo (`Shift` = redo) |
| `⌘/Ctrl Shift C` / `V` | Copy / paste motion |
| `⌘/Ctrl S` | Save on this device |
| `Esc` | Deselect / exit present |

---

## Where boards are stored

Everything is **on this device**:

- Projects in IndexedDB (`chalkline-db`)
- Last-opened id in `localStorage`

Clearing site data for this origin **deletes your boards**. To move work between browsers or machines:

1. Open the board → inspector → **Export JSON**
2. On the other machine: studio picker → **Import JSON**

JSON is a full project (layers, motion, scenes, captions, embedded images as data URLs). Music is stored the same way if you attached a bed.

There is no cloud sync and no account.

---

## Optional AI (bring your own model)

Chalkline does not ship an AI key. If you want a model to *storyboard a board for you*:

1. Studio header **Ask AI**, or the same button on the boards list.
2. Open **Connection**. Default preset is **OpenRouter / free** — paste an [OpenRouter](https://openrouter.ai/keys) key. The studio calls `openrouter/free`, which picks a live free model and hops to another if one is busy. Other presets: OpenAI, Groq, Together, Ollama, LM Studio, custom.
3. Prompt in plain language, e.g. `Make a 1 minute video on the Caldwell-Luc procedure in 9:16`.
4. The model returns a storyboard JSON. Chalkline lays scenes, icons, captions, and timing onto the canvas. Edit anything after.

**Compatibility.** Any server that speaks `POST {base}/chat/completions` (OpenAI Chat Completions). Path defaults to `/chat/completions`; change it if yours differs.

**Where the key lives.** `localStorage` key `chalkline:llm` on this origin only. It is sent to the URL you typed — not to a Chalkline account. If the browser blocks the request (CORS, common with `api.openai.com`), the app retries through a same-origin `/api/llm` forwarder that does not store the key.

**Ollama / LM Studio.** Run locally, pick the matching preset. A dummy key like `ollama` is enough when the server ignores auth.

**What the model is allowed to do.** Educational whiteboard scenes — short titles, icons from the library, captions. It cannot invent new icon artwork or upload photos. Medical / technical prompts stay high-level overviews, not operational instructions.

**If generation fails.** Test connection first. Check base URL (include `/v1` for OpenAI-shaped APIs), model id, and that the key is valid. Local models need the app opened on the same machine as Ollama.

---

## Library clips

Stamp these from the Library tab onto the current scene. They respect the board's aspect (portrait stacks, landscape spreads).

| Clip | What you get |
|---|---|
| Title card | Headline, supporting line, icon |
| Three steps | Icon + label row (or stack) |
| Four grid | 2×2 beats |
| Compare | Before / after |
| Timeline | Four sequential beats |
| Cycle | Four stages around a center |
| Quote | Speech bubble + attribution |
| Stats | Three numbers |
| Numbered list | Five lines |
| Q & A | Question then answer |
| Callout | Warning + note |
| Close | Check + takeaway |
| Anatomy | Central icon + labels |
| Funnel | Wide-to-narrow stages |

Icons cover objects, people, nature, charts, science, business, **medical** (scalpel, sinus, lungs, stethoscope, …), and UI marks.

---

## Export notes

- **PNG** — last frame of the board, downloads immediately.
- **MP4** and **WebM** — Export menu in the studio header. Both mix in the **music bed** (and tick SFX if you turned that on). Chromium / Chrome / Edge encode most reliably. Keep the tab open while it encodes.
- If a board has no music file, the video is silent — attach a music bed in the inspector before exporting.
- Resolution follows the board setting (720p / 1080p / 1440p) and aspect (16:9, 9:16, 1:1, 4:5, 21:9).
- Captions and the drawing hand are burned into the video. Presenter notes are not.

---

## Project layout

```
src/
  routes/                 / and /studio
  components/
    landing/              marketing page
    studio/               editor chrome, motion dock, present mode
    board/                canvas + autoplay demo
  lib/
    animation/            engine, cell orders, hands, icons, WebM/PNG export
    project/              types, store (Zustand), IndexedDB, templates, clips, presets
    ai/                   optional OpenAI-compatible client, storyboard compiler
public/                   favicon, OG image
```

Stack: React 19, TanStack Start / Router, Tailwind v4, Zustand, HTML5 canvas. Auth and Postgres helpers exist in the tree from the scaffold; **this app does not use them**.

---

## npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server at http://localhost:8080 |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build (port 8081) |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Script / unit tests |
| `npm run format` | Prettier |

---

## Troubleshooting

**`npm run dev` fails on the port**  
Something else is bound to 8080. Stop that process, or temporarily change `server.port` in `vite.config.ts` (the committed default is 8080).

**Blank studio / “Board not on this device”**  
Boards are per-browser. Open `/studio` and pick a template, or import a JSON file.

**Icons or canvas look empty on a phone**  
Rotate to landscape or add layers from the bottom bar (Text / Icons / Image / Motion). Play is on that bar too.

**Export video errors**  
Use Chrome or Edge, keep the tab focused, and try a shorter scene first. Safari/Firefox may not support the WebM `MediaRecorder` mime type this studio requests.

**`npm install` warnings about optional packages**  
Safe to ignore if the install finishes. You do not need Playwright unless you run the browser-smoke scripts.

**Fonts**  
Fraunces, Source Sans 3, Caveat, and IBM Plex Mono load from Google Fonts. Offline, the UI falls back to system serif/sans/cursive/mono.

---

## License

Source is published as-is for you to run, study, and remix. Add a `LICENSE` file if you want a specific SPDX license on the repo.
