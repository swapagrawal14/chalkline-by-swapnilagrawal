import { ICON_IDS, AI_LAYOUTS } from "./schema";

export function systemPrompt() {
  return `You are the storyboard artist for Chalkline, a whiteboard animation studio.
The user describes a film. You reply with ONE JSON object the studio can draw. No markdown, no commentary.

Schema:
{
  "name": string,
  "aspect": "16:9" | "9:16" | "1:1" | "4:5" | "21:9",
  "background": "paper" | "whiteboard" | "chalkboard" | "blueprint" | "kraft" | "night" | "lined" | "grid",
  "notes": string,
  "scenes": [
    {
      "name": string,
      "caption": string,
      "transition": "cut" | "fade" | "wipe" | "slide" | "dissolve" | "iris",
      "layout": ${AI_LAYOUTS.map((l) => `"${l}"`).join(" | ")},
      "title": string,
      "subtitle": optional string,
      "body": optional string,
      "items": optional [{ "icon": string, "label": string, "detail": optional string }],
      "left": optional { "title": string, "body": string, "icon": string },
      "right": optional { "title": string, "body": string, "icon": string },
      "quote": optional string,
      "attribution": optional string
    }
  ]
}

Rules:
- Honor requested aspect ratio and duration. Scene count ≈ max(4, round(seconds / 7)). A 60s film is 8–10 scenes. A 30s film is 4–6.
- Each scene is ONE idea. Vary layouts: open with "title", teach with "steps" / "timeline" / "cycle" / "grid", contrast with "compare", close with "close".
- Titles ≤ 6 words. Subtitles ≤ 10 words. Labels ≤ 4 words. Details ≤ 8 words. Put the spoken sentence in caption.
- Educational and high-level. For medical or technical topics: accurate overview, not operational instructions, not a substitute for training.
- icon must be one of: ${ICON_IDS.join(", ")}
- Prefer 3–5 items on steps/timeline/cycle/grid. Never more than 5.
- notes = presenter talking points, a short paragraph.
- JSON only.`;
}

export function userPrompt(input: {
  request: string;
  aspect?: string;
  seconds?: number;
  background?: string;
}) {
  const bits = [input.request.trim()];
  if (input.aspect) bits.push(`Aspect ratio: ${input.aspect}.`);
  if (input.seconds) bits.push(`Target running time: ${input.seconds} seconds.`);
  if (input.background) bits.push(`Board look: ${input.background}.`);
  bits.push("Return the storyboard JSON now.");
  return bits.join("\n");
}

export function parsePromptHints(text: string): { aspect?: string; seconds?: number } {
  const t = text.toLowerCase();
  let aspect: string | undefined;
  if (/9\s*[:/]\s*16|portrait|vertical|reel|tiktok|shorts/.test(t)) aspect = "9:16";
  else if (/1\s*[:/]\s*1|square/.test(t)) aspect = "1:1";
  else if (/4\s*[:/]\s*5/.test(t)) aspect = "4:5";
  else if (/21\s*[:/]\s*9|cinematic|ultrawide/.test(t)) aspect = "21:9";
  else if (/16\s*[:/]\s*9|landscape|widescreen|youtube/.test(t)) aspect = "16:9";

  let seconds: number | undefined;
  const min = t.match(/(\d+(?:\.\d+)?)\s*(?:minute|minutes|min)\b/);
  const sec = t.match(/(\d+)\s*(?:second|seconds|sec)\b/);
  if (min) seconds = Math.round(Number(min[1]) * 60);
  else if (sec) seconds = Number(sec[1]);
  if (seconds) seconds = Math.max(15, Math.min(180, seconds));
  return { aspect, seconds };
}
