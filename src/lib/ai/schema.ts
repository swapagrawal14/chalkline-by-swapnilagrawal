import { z } from "zod";
import { ICONS } from "@/lib/animation/icons";
import type { AspectId, BackgroundId, SceneTransition } from "@/lib/project/types";

export const AI_LAYOUTS = [
  "title",
  "hero",
  "steps",
  "grid",
  "compare",
  "timeline",
  "cycle",
  "quote",
  "list",
  "close",
] as const;

export type AiLayout = (typeof AI_LAYOUTS)[number];

const itemSchema = z.object({
  icon: z.string().optional(),
  label: z.string(),
  detail: z.string().optional(),
});

const sideSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  icon: z.string().optional(),
});

export const aiSceneSchema = z.object({
  name: z.string().default("Scene"),
  caption: z.string().optional(),
  transition: z.enum(["cut", "fade", "wipe", "slide", "dissolve", "iris"]).optional(),
  layout: z
    .string()
    .default("hero")
    .transform((s) => (AI_LAYOUTS.includes(s as AiLayout) ? (s as AiLayout) : "hero")),
  title: z.string().default(""),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  items: z.array(itemSchema).optional(),
  left: sideSchema.optional(),
  right: sideSchema.optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
});

export const aiStoryboardSchema = z.object({
  name: z.string().default("Untitled board"),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:5", "21:9"]).default("16:9"),
  background: z
    .enum(["paper", "whiteboard", "lined", "grid", "kraft", "chalkboard", "blueprint", "night", "solid"])
    .default("paper"),
  notes: z.string().optional(),
  scenes: z.array(aiSceneSchema).min(1),
});

export type AiStoryboard = z.infer<typeof aiStoryboardSchema>;
export type AiScene = z.infer<typeof aiSceneSchema>;

export const ICON_IDS = ICONS.map((i) => i.id);

const ALIASES: Record<string, string> = {
  doctor: "stethoscope",
  surgeon: "scalpel",
  surgery: "scalpel",
  knife: "scalpel",
  nose: "sinus",
  maxillary: "sinus",
  antrum: "sinus",
  face: "user",
  person: "user",
  people: "users",
  team: "users",
  water: "drop",
  rain: "drop",
  idea: "lightbulb",
  money: "coin",
  graph: "chart",
  bars: "chart",
  piechart: "pie",
  earth: "globe",
  world: "globe",
  plant: "leaf",
  tree: "tree",
  sun: "sun",
  moon: "moon",
  cloud: "cloud",
  heart: "heart",
  brain: "brain",
  flask: "flask",
  chemistry: "flask",
  dna: "dna",
  atom: "atom",
  book: "book",
  target: "target",
  trophy: "trophy",
  flag: "flag",
  clock: "clock",
  time: "clock",
  mail: "mail",
  chat: "chat",
  phone: "phone",
  laptop: "laptop",
  car: "car",
  plane: "plane",
  home: "home",
  building: "building",
  lock: "lock",
  key: "key",
  gear: "gear",
  settings: "gear",
  pencil: "pencil",
  draw: "pencil",
  spark: "spark",
  star: "star",
  check: "check",
  ok: "check",
  warning: "warning",
  alert: "warning",
  question: "question",
  info: "info",
  plus: "plus-circle",
  hospital: "hospital",
  pill: "pill",
  medicine: "pill",
  lungs: "lungs",
  lung: "lungs",
  ear: "ear",
  eye: "eye-open",
  tooth: "tooth",
  bone: "bone",
  pulse: "heartbeat",
  ekg: "heartbeat",
  ambulance: "ambulance",
  mask: "mask",
  kidney: "kidney",
  microscope: "microscope",
  graduate: "graduate",
  school: "graduate",
  music: "music-note",
  camera: "camera",
  video: "video",
  calendar: "calendar",
  bell: "bell",
  folder: "folder",
  shield: "shield",
  fire: "fire",
  bolt: "bolt",
  lightning: "bolt",
  wifi: "wifi",
  flower: "flower",
  apple: "apple",
  cup: "cup",
  coffee: "cup",
  ball: "ball",
  fish: "fish",
  wave: "wave",
  handshake: "handshake",
  compass: "compass",
  ruler: "ruler",
  clipboard: "clipboard",
  list: "list",
  play: "play-btn",
  pause: "pause-btn",
  umbrella: "umbrella",
  snow: "snowflake",
  battery: "battery",
  link: "link",
  bandage: "bandage",
  syringe: "syringe",
  stethoscope: "stethoscope",
  skull: "skull",
  megaphone: "megaphone",
  cart: "cart",
  coin: "coin",
  funnel: "funnel",
  cycle: "cycle",
  trend: "trend",
  rocket: "rocket",
  globe: "globe",
  leaf: "leaf",
  drop: "drop",
  mountain: "mountain",
  users: "users",
  user: "user",
};

export function resolveIconId(raw?: string | null): string {
  if (!raw) return "spark";
  const id = raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (ICON_IDS.includes(id)) return id;
  if (ALIASES[id]) return ALIASES[id]!;
  const named = ICONS.find((i) => i.name.toLowerCase() === raw.toLowerCase());
  if (named) return named.id;
  const hit = ICONS.find((i) => i.id.includes(id) || id.includes(i.id) || i.name.toLowerCase().includes(id));
  return hit?.id ?? "spark";
}

export function parseStoryboard(input: unknown): AiStoryboard {
  const result = aiStoryboardSchema.safeParse(input);
  if (result.success) return result.data;
  if (input && typeof input === "object" && Array.isArray((input as { scenes?: unknown }).scenes)) {
    const loose = aiStoryboardSchema.safeParse({
      name: "Untitled board",
      aspect: "16:9",
      background: "paper",
      scenes: (input as { scenes: unknown[] }).scenes.map((s) =>
        typeof s === "object" && s ? s : { title: String(s), layout: "hero" },
      ),
    });
    if (loose.success) return loose.data;
  }
  throw new Error(result.error.issues[0]?.message ?? "Storyboard JSON did not match the studio schema.");
}

export type HintedAspect = AspectId;
export type HintedBackground = BackgroundId;
export type HintedTransition = SceneTransition;
