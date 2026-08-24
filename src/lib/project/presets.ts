import type { AnimSettings, BackgroundId, StrokeStyle } from "./types";
import { DEFAULT_ANIM } from "./types";

export interface MotionPreset {
  id: string;
  name: string;
  blurb: string;
  anim: Partial<AnimSettings>;
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "quick",
    name: "Quick reveal",
    blurb: "Fast scanner, no hand",
    anim: {
      style: "scanner",
      drawStyle: "reveal",
      hand: "ghost",
      speed: 1.7,
      easing: "ease-out",
      entrance: "fade",
      strokeStyle: "marker",
      reverse: false,
      wiggle: false,
      dust: false,
      after: "none",
    },
  },
  {
    id: "artist",
    name: "Sketch artist",
    blurb: "Slow contour + charcoal",
    anim: {
      style: "contour",
      drawStyle: "outline-fill",
      strokeStyle: "charcoal",
      hand: "right-marker",
      speed: 0.7,
      sketchiness: 0.85,
      easing: "ease",
      entrance: "none",
      wiggle: true,
      dust: false,
      fillReveal: "fade",
      after: "none",
    },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    blurb: "Technical outline",
    anim: {
      style: "wipe-right",
      drawStyle: "outline",
      strokeStyle: "fountain",
      hand: "ghost",
      color: "#8ec8e8",
      speed: 1.2,
      easing: "linear",
      entrance: "none",
      wiggle: false,
      dust: false,
      after: "none",
    },
  },
  {
    id: "chalk",
    name: "Chalk talk",
    blurb: "Dusty chalkboard hand",
    anim: {
      style: "scanner",
      drawStyle: "outline-fill",
      strokeStyle: "chalk",
      hand: "chalk",
      color: "#F4EFE6",
      sketchiness: 0.7,
      speed: 0.9,
      wiggle: true,
      dust: true,
      easing: "ease",
      entrance: "none",
      fillReveal: "dissolve",
      after: "none",
    },
  },
  {
    id: "pop",
    name: "Pop in",
    blurb: "Bounce onto the board",
    anim: {
      style: "radial",
      drawStyle: "reveal",
      hand: "ghost",
      entrance: "pop",
      easing: "bounce",
      speed: 1.35,
      wiggle: false,
      dust: false,
      after: "pulse",
    },
  },
  {
    id: "story",
    name: "Story hand",
    blurb: "Classic marker draw",
    anim: { ...DEFAULT_ANIM },
  },
  {
    id: "spiral",
    name: "Spiral in",
    blurb: "From the center out",
    anim: {
      style: "spiral",
      drawStyle: "outline-fill",
      hand: "pen",
      entrance: "fade",
      easing: "ease-out",
      speed: 1,
      fillReveal: "iris",
      after: "none",
    },
  },
  {
    id: "comic",
    name: "Comic jump",
    blurb: "Chunky pops + drop",
    anim: {
      style: "chunks",
      drawStyle: "illust",
      hand: "right-marker",
      entrance: "drop",
      easing: "ease-out",
      speed: 1.25,
      fillReveal: "instant",
      after: "none",
    },
  },
  {
    id: "rain",
    name: "Rain down",
    blurb: "Falls in columns",
    anim: {
      style: "rain",
      drawStyle: "outline-fill",
      hand: "ghost",
      entrance: "slide-down",
      easing: "ease-in",
      speed: 1.15,
      after: "none",
    },
  },
  {
    id: "kinetic",
    name: "Kinetic",
    blurb: "Scatter + spin",
    anim: {
      style: "scatter",
      drawStyle: "reveal",
      hand: "ghost",
      entrance: "spin",
      easing: "elastic",
      speed: 1.4,
      after: "float",
    },
  },
  {
    id: "vintage",
    name: "Vintage",
    blurb: "Slow charcoal fade",
    anim: {
      style: "edges-first",
      drawStyle: "outline-fill",
      strokeStyle: "charcoal",
      hand: "pen",
      entrance: "fade",
      easing: "ease",
      speed: 0.65,
      sketchiness: 0.8,
      after: "none",
    },
  },
  {
    id: "diamond",
    name: "Diamond",
    blurb: "Iris from the middle",
    anim: {
      style: "diamond",
      drawStyle: "outline-fill",
      hand: "ghost",
      entrance: "zoom",
      easing: "ease-out",
      fillReveal: "iris",
      speed: 1.1,
      after: "none",
    },
  },
  {
    id: "type",
    name: "Typewriter",
    blurb: "Letter by letter",
    anim: {
      style: "wipe-right",
      drawStyle: "reveal",
      hand: "pen",
      textAnim: "typewriter",
      easing: "linear",
      speed: 0.9,
      entrance: "none",
      after: "none",
    },
  },
  {
    id: "bounce",
    name: "Bounce stack",
    blurb: "Drop, then pulse",
    anim: {
      style: "radial",
      drawStyle: "reveal",
      hand: "ghost",
      entrance: "drop",
      easing: "bounce",
      speed: 1.3,
      after: "pulse",
      textAnim: "bounce",
    },
  },
];

export const INK_SWATCHES = [
  "#1C1916",
  "#1F4E79",
  "#8B2E2E",
  "#2F6B4F",
  "#F4EFE6",
  "#C45C26",
];

export interface BoardLook {
  id: string;
  name: string;
  bg: BackgroundId;
  ink: string;
  stroke: StrokeStyle;
}

export const BOARD_LOOKS: BoardLook[] = [
  { id: "paper", name: "Paper", bg: "paper", ink: "#1C1916", stroke: "marker" },
  { id: "chalk", name: "Chalkboard", bg: "chalkboard", ink: "#F4EFE6", stroke: "chalk" },
  { id: "blueprint", name: "Blueprint", bg: "blueprint", ink: "#8ec8e8", stroke: "fountain" },
  { id: "kraft", name: "Kraft", bg: "kraft", ink: "#1C1916", stroke: "charcoal" },
  { id: "night", name: "Night", bg: "night", ink: "#F4EFE6", stroke: "marker" },
  { id: "lined", name: "Notebook", bg: "lined", ink: "#1F4E79", stroke: "fountain" },
];
