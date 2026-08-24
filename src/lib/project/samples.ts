import { defaultAnim, iconLayer, makeProject, makeScene, sequenceLayers, textLayer } from "./factory";
import type { Project } from "./types";

export function sampleMeetChalkline(): Project {
  const project = makeProject("Meet Chalkline");
  const s1 = makeScene("Hook");
  s1.layers = sequenceLayers([
    textLayer("Meet Chalkline", 140, 90, 1000, {
      duration: 2.2,
      text: { text: "Meet Chalkline", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1.1 },
      anim: defaultAnim({ entrance: "pop", easing: "bounce", textAnim: "bounce", after: "none", hand: "ghost" }),
    }),
    textLayer("Whiteboard stories, drawn by hand.", 180, 250, 920, {
      duration: 2.4,
      text: { text: "Whiteboard stories, drawn by hand.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
      anim: defaultAnim({ textAnim: "typewriter", hand: "pen", speed: 0.95 }),
    }),
    iconLayer("pencil", 530, 380, 200, { duration: 2.6, anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "float" }) }),
  ]);
  s1.captions = [
    { id: "c1", text: "A studio for explainer videos — in the browser.", start: 0.4, end: 6.4 },
  ];
  s1.camera.enabled = true;

  const s2 = makeScene("How it works");
  s2.transition = "slide";
  s2.layers = sequenceLayers([
    textLayer("Three steps", 140, 48, 1000, {
      duration: 1.6,
      text: { text: "Three steps", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1.1 },
      anim: defaultAnim({ entrance: "slide-up", textAnim: "word", hand: "ghost" }),
    }),
    iconLayer("book", 90, 180, 170, { duration: 2 }),
    textLayer("Drop in ideas", 70, 370, 220, {
      duration: 1.4,
      text: { text: "Drop in ideas", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("spark", 520, 180, 170, { duration: 2, anim: defaultAnim({ style: "spiral", drawStyle: "outline", entrance: "zoom" }) }),
    textLayer("Watch it draw", 500, 370, 220, {
      duration: 1.4,
      text: { text: "Watch it draw", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("rocket", 960, 180, 170, { duration: 2.2, anim: defaultAnim({ style: "wipe-down", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Export a film", 940, 370, 220, {
      duration: 1.4,
      text: { text: "Export a film", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
  ]);
  s2.captions = [{ id: "c2", text: "Icons, photos, type, arrows — all drawn in sequence.", start: 0.2, end: 8 }];

  const s3 = makeScene("Finish");
  s3.transition = "iris";
  s3.layers = sequenceLayers([
    iconLayer("check", 500, 120, 240, { duration: 2.4, anim: defaultAnim({ style: "contour", drawStyle: "outline", color: "#1F4E79", after: "pulse" }) }),
    textLayer("No watermark. No account. Just the board.", 160, 400, 960, {
      duration: 2.6,
      text: { text: "No watermark. No account. Just the board.", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1.1 },
      anim: defaultAnim({ textAnim: "word", entrance: "fade" }),
    }),
  ]);
  s3.captions = [{ id: "c3", text: "Save locally. Export WebM. Tell the story.", start: 0.3, end: 5.5 }];

  project.scenes = [s1, s2, s3];
  project.activeSceneId = s1.id;
  project.notes = "A tour of Chalkline. Duplicate this board and replace the copy with your own story.";
  return project;
}

export function sampleWaterCycle(): Project {
  const project = makeProject("The water cycle");
  project.background = "paper";
  const s1 = makeScene("Cycle");
  s1.layers = sequenceLayers([
    textLayer("The Water Cycle", 140, 40, 1000, {
      duration: 2,
      text: { text: "The Water Cycle", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
      anim: defaultAnim({ textAnim: "bounce", entrance: "pop", easing: "bounce", hand: "ghost" }),
    }),
    iconLayer("sun", 80, 140, 160, { duration: 2, anim: defaultAnim({ style: "radial", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Evaporation", 60, 320, 200, {
      duration: 1.3,
      text: { text: "Evaporation", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
    iconLayer("cloud", 500, 130, 180, { duration: 2, anim: defaultAnim({ style: "scanner", drawStyle: "outline" }) }),
    textLayer("Condensation", 490, 320, 210, {
      duration: 1.3,
      text: { text: "Condensation", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
    iconLayer("drop", 960, 140, 150, { duration: 2, anim: defaultAnim({ style: "rain", drawStyle: "outline", entrance: "slide-down" }) }),
    textLayer("Precipitation", 940, 320, 210, {
      duration: 1.3,
      text: { text: "Precipitation", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
    iconLayer("leaf", 520, 430, 150, { duration: 2, anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "float" }) }),
    textLayer("Collection", 500, 590, 200, {
      duration: 1.3,
      text: { text: "Collection", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
  ]);
  s1.captions = [{ id: "w1", text: "Heat lifts water. Clouds form. Rain returns it.", start: 0.4, end: 12 }];
  project.scenes = [s1];
  project.activeSceneId = s1.id;
  return project;
}

export function sampleStartup(): Project {
  const project = makeProject("Why users stay");
  const s1 = makeScene("Loop");
  s1.layers = sequenceLayers([
    textLayer("Why users stay", 140, 50, 1000, {
      duration: 1.8,
      text: { text: "Why users stay", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
      anim: defaultAnim({ entrance: "slide-up", textAnim: "word", hand: "ghost" }),
    }),
    iconLayer("spark", 80, 180, 160, { duration: 1.8, anim: defaultAnim({ style: "spiral", drawStyle: "outline" }) }),
    textLayer("Aha", 80, 380, 160, {
      text: { text: "Aha", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
      duration: 1.2,
    }),
    iconLayer("users", 360, 180, 160, { duration: 1.8 }),
    textLayer("Habit", 360, 380, 160, {
      text: { text: "Habit", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
      duration: 1.2,
    }),
    iconLayer("chart", 640, 180, 160, { duration: 1.8, anim: defaultAnim({ style: "wipe-up", drawStyle: "outline" }) }),
    textLayer("Value", 640, 380, 160, {
      text: { text: "Value", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
      duration: 1.2,
    }),
    iconLayer("heart", 920, 180, 160, { duration: 1.8, anim: defaultAnim({ style: "radial", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Love", 920, 380, 160, {
      text: { text: "Love", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
      duration: 1.2,
    }),
  ]);
  s1.captions = [{ id: "s1", text: "Shorten the distance from first click to first win.", start: 0.3, end: 10 }];
  project.scenes = [s1];
  project.activeSceneId = s1.id;
  return project;
}

export const STARTER_TEMPLATES: { id: string; title: string; blurb: string; build: () => Project }[] = [
  {
    id: "meet",
    title: "Product intro",
    blurb: "Three scenes. Hook, steps, close.",
    build: sampleMeetChalkline,
  },
  {
    id: "water",
    title: "Science diagram",
    blurb: "Icons + labels for a classroom cycle.",
    build: sampleWaterCycle,
  },
  {
    id: "startup",
    title: "Growth loop",
    blurb: "A four-beat business explainer.",
    build: sampleStartup,
  },
];
