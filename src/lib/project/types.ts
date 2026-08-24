export const ASPECTS = {
  "16:9": { w: 1280, h: 720, label: "Landscape 16:9" },
  "9:16": { w: 720, h: 1280, label: "Portrait 9:16" },
  "1:1": { w: 1080, h: 1080, label: "Square 1:1" },
  "4:5": { w: 1080, h: 1350, label: "Social 4:5" },
  "21:9": { w: 1680, h: 720, label: "Cinematic 21:9" },
} as const;

export type AspectId = keyof typeof ASPECTS;

export const RESOLUTIONS = {
  "720p": 720,
  "1080p": 1080,
  "1440p": 1440,
} as const;

export type ResolutionId = keyof typeof RESOLUTIONS;

export const ANIMATION_STYLES = [
  "scanner",
  "zigzag",
  "contour",
  "spiral",
  "radial",
  "chunks",
  "wipe-down",
  "wipe-right",
  "wipe-left",
  "wipe-up",
  "diagonal",
  "reverse-spiral",
  "edges-first",
  "portrait",
  "human",
  "landscape",
  "building",
  "vehicle",
  "checker",
  "rain",
  "diamond",
  "scatter",
  "columns",
  "scribble",
] as const;

export type AnimationStyle = (typeof ANIMATION_STYLES)[number];

export const DRAW_STYLES = [
  "outline-fill",
  "illust",
  "outline",
  "reveal",
  "marker",
] as const;

export type DrawStyle = (typeof DRAW_STYLES)[number];

export const STROKE_STYLES = [
  "marker",
  "charcoal",
  "sketch",
  "fountain",
  "chalk",
] as const;

export type StrokeStyle = (typeof STROKE_STYLES)[number];

export const HAND_STYLES = [
  "ghost",
  "right-marker",
  "left-marker",
  "pen",
  "chalk",
] as const;

export type HandStyle = (typeof HAND_STYLES)[number];

export const FILL_REVEALS = [
  "fade",
  "wipe",
  "iris",
  "instant",
  "dissolve",
] as const;

export type FillReveal = (typeof FILL_REVEALS)[number];

export const EASINGS = ["linear", "ease", "ease-in", "ease-out", "bounce", "elastic"] as const;
export type Easing = (typeof EASINGS)[number];

export const ENTRANCES = [
  "none",
  "fade",
  "pop",
  "slide-up",
  "slide-left",
  "slide-right",
  "slide-down",
  "drop",
  "zoom",
  "spin",
] as const;
export type Entrance = (typeof ENTRANCES)[number];

export const SCENE_TRANSITIONS = ["cut", "fade", "wipe", "slide", "dissolve", "iris"] as const;
export type SceneTransition = (typeof SCENE_TRANSITIONS)[number];

export const TEXT_ANIMS = ["typewriter", "word", "fade", "bounce"] as const;
export type TextAnim = (typeof TEXT_ANIMS)[number];

export const AFTER_MOTIONS = ["none", "pulse", "float", "shake"] as const;
export type AfterMotion = (typeof AFTER_MOTIONS)[number];

export const BACKGROUNDS = [
  "paper",
  "whiteboard",
  "lined",
  "grid",
  "kraft",
  "chalkboard",
  "blueprint",
  "night",
  "solid",
] as const;

export type BackgroundId = (typeof BACKGROUNDS)[number];

export type LayerType = "image" | "text" | "icon" | "shape" | "arrow";

export type ShapeKind = "rect" | "ellipse" | "line" | "highlight" | "bubble" | "callout";

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  flipX?: boolean;
  flipY?: boolean;
}

export interface AnimSettings {
  style: AnimationStyle;
  drawStyle: DrawStyle;
  strokeStyle: StrokeStyle;
  hand: HandStyle;
  speed: number;
  color: string;
  fillReveal: FillReveal;
  strokeWidth: number;
  sketchiness: number;
  easing: Easing;
  entrance: Entrance;
  reverse: boolean;
  wiggle: boolean;
  dust: boolean;
  textAnim: TextAnim;
  after: AfterMotion;
}

export interface TextContent {
  text: string;
  font: "hand" | "sans" | "serif" | "mono";
  weight: 400 | 600 | 700;
  align: "left" | "center" | "right";
  color: string;
  lineHeight: number;
}

export interface IconContent {
  iconId: string;
  color: string;
  strokeWidth: number;
}

export interface ShapeContent {
  kind: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ArrowContent {
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
  dashed: boolean;
}

export interface ImageContent {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  filter: "none" | "sketch" | "poster" | "ink";
}

export interface Layer extends Transform {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  start: number;
  duration: number;
  order: number;
  anim: AnimSettings;
  text?: TextContent;
  icon?: IconContent;
  shape?: ShapeContent;
  arrow?: ArrowContent;
  image?: ImageContent;
}

export interface Caption {
  id: string;
  text: string;
  start: number;
  end: number;
}

export interface CameraMove {
  enabled: boolean;
  fromScale: number;
  toScale: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface Scene {
  id: string;
  name: string;
  layers: Layer[];
  captions: Caption[];
  camera: CameraMove;
  hold: number;
  transition: SceneTransition;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  aspect: AspectId;
  resolution: ResolutionId;
  background: (typeof BACKGROUNDS)[number];
  solidColor: string;
  scenes: Scene[];
  activeSceneId: string;
  loop: boolean;
  musicName?: string;
  musicSrc?: string;
  musicVolume: number;
  notes: string;
  snap: boolean;
  grid: boolean;
  spotlight: boolean;
  sfx: boolean;
  scribe: boolean;
}

export interface ProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
  thumb?: string;
  aspect: AspectId;
  layerCount: number;
  duration: number;
}

export const DEFAULT_ANIM: AnimSettings = {
  style: "scribble",
  drawStyle: "outline-fill",
  strokeStyle: "marker",
  hand: "right-marker",
  speed: 1.2,
  color: "#1C1916",
  fillReveal: "fade",
  strokeWidth: 2.8,
  sketchiness: 0.55,
  easing: "ease-out",
  entrance: "none",
  reverse: false,
  wiggle: true,
  dust: true,
  textAnim: "typewriter",
  after: "none",
};

export function resolveAnim(partial?: Partial<AnimSettings> | null): AnimSettings {
  const p = partial ?? {};
  return {
    ...DEFAULT_ANIM,
    ...p,
    easing: p.easing ?? DEFAULT_ANIM.easing,
    entrance: p.entrance ?? DEFAULT_ANIM.entrance,
    reverse: p.reverse ?? false,
    wiggle: p.wiggle ?? false,
    dust: p.dust ?? false,
    speed: typeof p.speed === "number" ? p.speed : DEFAULT_ANIM.speed,
    sketchiness: typeof p.sketchiness === "number" ? p.sketchiness : DEFAULT_ANIM.sketchiness,
    textAnim: p.textAnim ?? DEFAULT_ANIM.textAnim,
    after: p.after ?? DEFAULT_ANIM.after,
  };
}

export function canvasSize(project: Pick<Project, "aspect" | "resolution">) {
  const base = ASPECTS[project.aspect];
  const targetH = RESOLUTIONS[project.resolution];
  const scale = targetH / base.h;
  return {
    width: Math.round(base.w * scale),
    height: Math.round(base.h * scale),
  };
}
