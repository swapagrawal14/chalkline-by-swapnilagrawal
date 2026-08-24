import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

const SAMPLE = {
  name: "Caldwell-Luc in a minute",
  aspect: "9:16" as const,
  background: "whiteboard",
  seconds: 60,
  scenes: [
    {
      name: "Hook",
      layout: "title",
      title: "Caldwell-Luc",
      subtitle: "A window into the sinus",
      caption: "Named for George Caldwell and Henri Luc.",
    },
    {
      name: "Steps",
      layout: "steps",
      title: "Three beats",
      caption: "Incise, open the fossa, work in the antrum.",
      items: [
        { icon: "scalpel", label: "Incise" },
        { icon: "sinus", label: "Window" },
        { icon: "check", label: "Close" },
      ],
    },
  ],
};

const LAYOUTS = [
  ["title", "Big headline + subtitle"],
  ["hero", "Headline with one supporting line"],
  ["steps", "3–4 icon + label beats"],
  ["list", "Numbered lines"],
  ["compare", "Left vs right"],
  ["timeline", "A sequence"],
  ["grid", "2×2 cards"],
  ["cycle", "Things that loop"],
  ["quote", "A line someone said"],
  ["close", "The takeaway"],
];

export function ApiDocs() {
  const [origin, setOrigin] = useState("");
  const [ping, setPing] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [boardJson, setBoardJson] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const base = origin || "https://your-chalkline-site";
  const snippet = `// Paste this in your app, Cursor, or a browser console on any site.
const res = await fetch("${base}/api/chalkline/boards", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "My first board",
    aspect: "16:9",
    background: "whiteboard",
    scenes: [
      {
        layout: "title",
        title: "Hello Chalkline",
        caption: "The hand will draw this headline."
      },
      {
        layout: "steps",
        title: "Three beats",
        caption: "Incise, open, close.",
        items: [
          { icon: "scalpel", label: "Incise" },
          { icon: "sinus", label: "Window" },
          { icon: "check", label: "Close" }
        ]
      }
    ]
  })
});
const data = await res.json();
if (!data.ok) throw new Error(data.error);
download(data.board); // see helper below

function download(board) {
  const blob = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (board.name || "chalkline-board") + ".json";
  a.click();
}`;

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  async function runPing() {
    const res = await fetch("/api/chalkline?action=ping");
    setPing(JSON.stringify(await res.json(), null, 2));
  }

  async function runCreate() {
    setBusy(true);
    setResult("");
    setBoardJson("");
    try {
      const res = await fetch("/api/chalkline/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(SAMPLE),
      });
      const data = await res.json();
      setResult(
        JSON.stringify(
          {
            service: data.service,
            ok: data.ok,
            duration: data.duration,
            name: data.board?.name,
            scenes: data.board?.scenes?.length,
          },
          null,
          2,
        ),
      );
      if (data.ok && data.board) setBoardJson(JSON.stringify(data.board, null, 2));
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Call failed");
    } finally {
      setBusy(false);
    }
  }

  function saveBoard() {
    if (!boardJson) return;
    const blob = new Blob([boardJson], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chalkline-sample-board.json";
    a.click();
  }

  return (
    <div className="paper-grain min-h-dvh text-ink">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link to="/" className="font-display text-xl">
          Chalkline
        </Link>
        <Button asChild size="sm">
          <Link to="/studio">Open studio</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Chalkline API · free · no key · no Grok credits
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Use Chalkline from your own app</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          Think of this like a temp-mail API. You do not log in. You send a small JSON
          “recipe.” Chalkline sends back a full board file. Then a human (or you) opens
          that file in the studio and hits play.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Fact k="Cost" v="Free. No key. Does not spend Grok, OpenAI, or OpenRouter." />
          <Fact k="Limit" v="60 calls a minute per visitor. That’s a lot." />
          <Fact k="What you get" v="A .json board. Not an MP4. The studio still draws the film." />
        </div>

        <h2 className="mt-14 font-display text-2xl">If you only remember four steps</h2>
        <ol className="mt-4 space-y-4">
          <Step n="1" title="Ping (optional)">
            Open <code className="font-mono text-sm">{base}/api/chalkline?action=ping</code> in a
            tab. You should see <code className="font-mono text-sm">"service": "chalkline"</code>.
            If you do, the API is up.
          </Step>
          <Step n="2" title="Send a tiny recipe, not a movie">
            POST JSON with a name, aspect (<code className="font-mono text-sm">16:9</code> or{" "}
            <code className="font-mono text-sm">9:16</code>), and scenes. Each scene is a{" "}
            <code className="font-mono text-sm">layout</code>, a short{" "}
            <code className="font-mono text-sm">title</code>, and a{" "}
            <code className="font-mono text-sm">caption</code> (the spoken line). Do not send
            10 MB photos here.
          </Step>
          <Step n="3" title="Save the `board` object">
            The reply looks like <code className="font-mono text-sm">{`{ service, ok, board }`}</code>.
            If <code className="font-mono text-sm">ok</code> is true, download{" "}
            <code className="font-mono text-sm">board</code> as a <code className="font-mono text-sm">.json</code> file.
          </Step>
          <Step n="4" title="Import it in the studio">
            Chalkline → Open studio → Import JSON → Play. Drop photos after if you need
            them. Export WebM or MP4 from there.
          </Step>
        </ol>

        <h2 className="mt-14 font-display text-2xl">Copy-paste this</h2>
        <p className="mt-3 text-ink-soft">
          Works in a vibe-coded site, Cursor, or the browser console. Change the titles.
          Don’t overthink it.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg bg-ink">
          <div className="flex justify-end px-3 pt-3">
            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.16em] text-paper/70 hover:text-paper"
              onClick={() => void copy(snippet, "snip")}
            >
              {copied === "snip" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 pt-2 text-[13px] leading-relaxed text-paper">{snippet}</pre>
        </div>

        <h2 className="mt-14 font-display text-2xl">Try it on this page</h2>
        <div className="mt-4 rounded-xl border border-line bg-elevated p-4">
          <p className="break-all font-mono text-sm">{base}/api/chalkline</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void runPing()}>
              1. Ping
            </Button>
            <Button size="sm" onClick={() => void runCreate()} disabled={busy}>
              {busy ? "Creating…" : "2. Create a sample board"}
            </Button>
            {boardJson ? (
              <Button size="sm" variant="outline" onClick={saveBoard}>
                3. Download JSON
              </Button>
            ) : null}
          </div>
          {ping ? (
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-ink p-3 text-[12px] text-paper">{ping}</pre>
          ) : null}
          {result ? (
            <pre className="mt-3 overflow-auto rounded-lg bg-ink p-3 text-[12px] text-paper">{result}</pre>
          ) : null}
          {boardJson ? (
            <p className="mt-3 text-sm text-ink-soft">
              Download, then Studio → Import JSON. You should see a two-scene Caldwell-Luc
              board.
            </p>
          ) : null}
        </div>

        <h2 className="mt-14 font-display text-2xl">Tell your AI this</h2>
        <p className="mt-3 text-ink-soft">
          Paste the block below into ChatGPT / Cursor / Claude when you want it to drive
          Chalkline for you.
        </p>
        <Prompt origin={base} onCopy={() => void copy(AGENT, "agent")} copied={copied === "agent"} />

        <h2 className="mt-14 font-display text-2xl">Layouts you can send</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {LAYOUTS.map(([id, note]) => (
            <li key={id} className="rounded-lg border border-line bg-elevated px-3 py-2 text-sm">
              <code className="font-mono text-[13px]">{id}</code>
              <span className="text-ink-soft"> — {note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-soft">
          Mix them. Two scenes in a row with the same layout looks copy-pasted. Icon names
          come from <code className="font-mono text-xs">GET {base}/api/chalkline?action=icons</code>.
        </p>

        <h2 className="mt-14 font-display text-2xl">Every action</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-medium">Call</th>
                <th className="py-2 font-medium">When to use it</th>
              </tr>
            </thead>
            <tbody>
              <Row call="GET ?action=ping" does="Is the API awake?" />
              <Row call="GET ?action=icons" does="What icon ids can I put on a scene?" />
              <Row call="GET ?action=directing" does="Rules so an agent doesn’t make a boring board" />
              <Row call="POST ?action=createBoard" does="Turn my recipe into a board JSON" />
              <Row call="POST ?action=validateBoard" does="I already have a big JSON — is it ok?" />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          REST aliases if you hate query strings:{" "}
          <code className="font-mono text-xs">POST /api/chalkline/boards</code> and{" "}
          <code className="font-mono text-xs">POST /api/chalkline/boards/validate</code>.
        </p>

        <h2 className="mt-14 font-display text-2xl">Don’t do these</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft">
          <li>Don’t send photos through createBoard. Add pictures later in the studio, or in a full JSON you already have.</li>
          <li>Don’t expect an MP4 back. This API builds the board. The website draws it.</li>
          <li>Don’t put a Grok / OpenAI key in the request. This door doesn’t use one.</li>
          <li>Don’t write 12 scenes that are all “title + image.” Mix layouts.</li>
          <li>Don’t hammer it. 60 calls a minute is the cap; retry after a pause.</li>
        </ul>
      </main>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{k}</p>
      <p className="mt-2 text-sm leading-relaxed">{v}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-paper">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
      </div>
    </li>
  );
}

function Row({ call, does }: { call: string; does: string }) {
  return (
    <tr className="border-b border-line/70">
      <td className="py-2.5 pr-3 font-mono text-[12px]">{call}</td>
      <td className="py-2.5 text-ink-soft">{does}</td>
    </tr>
  );
}

function Prompt({ origin, onCopy, copied }: { origin: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-ink">
      <div className="flex justify-end px-3 pt-3">
        <button
          type="button"
          className="text-[11px] uppercase tracking-[0.16em] text-paper/70 hover:text-paper"
          onClick={onCopy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 pt-2 text-[13px] leading-relaxed text-paper">{AGENT.replaceAll("{{ORIGIN}}", origin)}</pre>
    </div>
  );
}

const AGENT = `You are talking to the Chalkline API, a free whiteboard-board compiler.

Base: {{ORIGIN}}/api/chalkline
No API key. No Grok. No MP4. You send a small storyboard, you get a board JSON.

Do this:
1. GET {{ORIGIN}}/api/chalkline?action=directing and follow those rules.
2. GET {{ORIGIN}}/api/chalkline?action=icons if you need icon ids.
3. POST {{ORIGIN}}/api/chalkline/boards with JSON:
   { name, aspect: "16:9"|"9:16", background: "whiteboard", scenes: [...] }
   Each scene: { layout, title, caption, items?: [{ icon, label }] }
   Layouts: title, hero, steps, list, compare, timeline, grid, cycle, quote, close.
   Mix layouts. Captions are the spoken line. Titles stay short.
4. If ok, give the human the board JSON as a downloadable .json file.
5. Tell them: open Chalkline studio → Import JSON → Play → Export.

Never put photos in createBoard. Never claim you returned a video file.`;
