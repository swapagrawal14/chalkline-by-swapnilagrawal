import { defaultAnim, iconLayer, makeProject, makeScene, sequenceLayers, staggerLayers, textLayer } from "./factory";
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

export function sampleCaldwellLuc(): Project {
  const project = makeProject("Caldwell-Luc overview");
  project.notes =
    "Educational whiteboard on the Caldwell-Luc (radical antrostomy). High-level only — not a surgical guide.";

  const s1 = makeScene("Hook");
  s1.layers = staggerLayers([
    textLayer("Caldwell-Luc", 140, 80, 1000, {
      duration: 2,
      text: { text: "Caldwell-Luc", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
      anim: defaultAnim({ entrance: "pop", textAnim: "bounce", easing: "bounce", hand: "ghost" }),
    }),
    textLayer("A maxillary sinus operation, in outline.", 160, 200, 960, {
      duration: 2,
      text: { text: "A maxillary sinus operation, in outline.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
    }),
    iconLayer("sinus", 500, 320, 240, { duration: 2.4, anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "float" }) }),
  ]);
  s1.captions = [{ id: "cl1", text: "Named for George Caldwell and Henri Luc — a window into the maxillary sinus.", start: 0.3, end: 7 }];
  s1.camera.enabled = true;

  const s2 = makeScene("What it is");
  s2.transition = "slide";
  s2.layers = staggerLayers([
    textLayer("What it is", 140, 48, 1000, {
      duration: 1.6,
      text: { text: "What it is", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
      anim: defaultAnim({ entrance: "slide-up", textAnim: "word", hand: "ghost" }),
    }),
    iconLayer("hospital", 120, 180, 160),
    textLayer("Antrostomy", 80, 360, 240, {
      duration: 1.3,
      text: { text: "Antrostomy", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
    iconLayer("sinus", 520, 170, 170, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }),
    textLayer("Canine fossa", 480, 360, 250, {
      duration: 1.3,
      text: { text: "Canine fossa", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
    iconLayer("stethoscope", 920, 180, 160),
    textLayer("Historic approach", 880, 360, 260, {
      duration: 1.3,
      text: { text: "Historic approach", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 },
    }),
  ]);
  s2.captions = [{ id: "cl2", text: "A window through the canine fossa to drain or explore the maxillary antrum.", start: 0.2, end: 8 }];

  const s3 = makeScene("When");
  s3.transition = "fade";
  s3.layers = staggerLayers([
    textLayer("When it was used", 140, 40, 1000, {
      duration: 1.6,
      text: { text: "When it was used", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("warning", 80, 170, 150, { anim: defaultAnim({ style: "contour", drawStyle: "outline" }) }),
    textLayer("Chronic sinusitis", 50, 350, 230, { duration: 1.2, text: { text: "Chronic sinusitis", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }),
    iconLayer("tooth", 370, 170, 150),
    textLayer("Dental origin", 340, 350, 220, { duration: 1.2, text: { text: "Dental origin", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }),
    iconLayer("bandage", 650, 170, 150),
    textLayer("Failed drainage", 620, 350, 220, { duration: 1.2, text: { text: "Failed drainage", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }),
    iconLayer("clipboard", 940, 170, 150),
    textLayer("Access for pathology", 900, 350, 260, { duration: 1.2, text: { text: "Access for pathology", font: "hand", weight: 600, align: "center", color: "#1C1916", lineHeight: 1 } }),
  ]);
  s3.captions = [{ id: "cl3", text: "Once common for stubborn maxillary disease. Endoscopic work has largely replaced it.", start: 0.3, end: 9 }];

  const s4 = makeScene("Steps");
  s4.transition = "wipe";
  s4.layers = staggerLayers([
    textLayer("Four beats, not a recipe", 100, 40, 1080, {
      duration: 1.6,
      text: { text: "Four beats, not a recipe", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("scalpel", 70, 170, 150),
    textLayer("Incision", 50, 350, 200, { duration: 1.2, text: { text: "Incision", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("bone", 370, 170, 150),
    textLayer("Window", 350, 350, 200, { duration: 1.2, text: { text: "Window", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("drop", 670, 170, 150, { anim: defaultAnim({ style: "rain", drawStyle: "outline" }) }),
    textLayer("Clearance", 650, 350, 200, { duration: 1.2, text: { text: "Clearance", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("check", 970, 170, 150, { anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Close", 950, 350, 200, { duration: 1.2, text: { text: "Close", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
  ]);
  s4.captions = [{ id: "cl4", text: "Gingivobuccal incision, canine-fossa window, antral work, then close. Details live in the theatre, not here.", start: 0.2, end: 10 }];

  const s5 = makeScene("Now");
  s5.transition = "iris";
  s5.layers = staggerLayers([
    iconLayer("eye-open", 500, 90, 200, { anim: defaultAnim({ style: "radial", drawStyle: "outline" }) }),
    textLayer("Today: endoscopy first", 140, 330, 1000, {
      duration: 2,
      text: { text: "Today: endoscopy first", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    textLayer("Caldwell-Luc remains a chapter, not the default.", 160, 440, 960, {
      duration: 2.2,
      text: { text: "Caldwell-Luc remains a chapter, not the default.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
    }),
  ]);
  s5.captions = [{ id: "cl5", text: "Know the history so the modern approach makes sense.", start: 0.3, end: 6 }];

  project.scenes = [s1, s2, s3, s4, s5];
  project.activeSceneId = s1.id;
  return project;
}

export function sampleHowTo(): Project {
  const project = makeProject("How to explain anything");
  const s1 = makeScene("Method");
  s1.layers = staggerLayers([
    textLayer("How to explain anything", 100, 40, 1080, {
      duration: 1.8,
      text: { text: "How to explain anything", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
      anim: defaultAnim({ entrance: "slide-up", textAnim: "word", hand: "ghost" }),
    }),
    iconLayer("question", 80, 170, 150),
    textLayer("Name it", 60, 350, 200, { duration: 1.2, text: { text: "Name it", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("list", 360, 170, 150),
    textLayer("Chunk it", 340, 350, 200, { duration: 1.2, text: { text: "Chunk it", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("pencil", 640, 170, 150),
    textLayer("Draw it", 620, 350, 200, { duration: 1.2, text: { text: "Draw it", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("check", 940, 170, 150, { anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Leave one line", 900, 350, 260, { duration: 1.2, text: { text: "Leave one line", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
  ]);
  s1.captions = [{ id: "ht1", text: "If they can redraw it from memory, you explained it.", start: 0.3, end: 10 }];
  project.scenes = [s1];
  project.activeSceneId = s1.id;
  return project;
}

export function sampleCompare(): Project {
  const project = makeProject("Old way vs new way");
  const s1 = makeScene("Compare");
  s1.layers = staggerLayers([
    textLayer("Old way  /  New way", 140, 40, 1000, {
      duration: 1.7,
      text: { text: "Old way  /  New way", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("clipboard", 140, 160, 180),
    textLayer("Scattered notes", 100, 370, 280, { duration: 1.3, text: { text: "Scattered notes", font: "hand", weight: 600, align: "center", color: "#8B2E2E", lineHeight: 1 } }),
    iconLayer("arrow-right", 520, 210, 140, { anim: defaultAnim({ style: "wipe-right", drawStyle: "outline" }) }),
    iconLayer("spark", 880, 160, 180, { anim: defaultAnim({ style: "spiral", drawStyle: "outline", after: "pulse" }) }),
    textLayer("One board", 860, 370, 240, { duration: 1.3, text: { text: "One board", font: "hand", weight: 600, align: "center", color: "#2F6B4F", lineHeight: 1 } }),
  ]);
  s1.captions = [{ id: "cmp1", text: "Swap the labels. Keep the contrast.", start: 0.3, end: 8 }];
  project.scenes = [s1];
  project.activeSceneId = s1.id;
  return project;
}

export function sampleTimeline(): Project {
  const project = makeProject("A short history");
  const s1 = makeScene("Timeline");
  s1.layers = staggerLayers([
    textLayer("A short history", 140, 36, 1000, {
      duration: 1.6,
      text: { text: "A short history", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    iconLayer("flag", 70, 160, 140),
    textLayer("Start", 50, 330, 180, { duration: 1.1, text: { text: "Start", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("gear", 360, 160, 140),
    textLayer("Build", 340, 330, 180, { duration: 1.1, text: { text: "Build", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("users", 650, 160, 140),
    textLayer("Share", 630, 330, 180, { duration: 1.1, text: { text: "Share", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
    iconLayer("trophy", 940, 160, 140, { anim: defaultAnim({ style: "radial", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Stay", 920, 330, 180, { duration: 1.1, text: { text: "Stay", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1 } }),
  ]);
  s1.captions = [{ id: "tl1", text: "Four beats. Rename them for any origin story.", start: 0.3, end: 9 }];
  project.scenes = [s1];
  project.activeSceneId = s1.id;
  return project;
}

export function sampleFaq(): Project {
  const project = makeProject("Two questions");
  const s1 = makeScene("Q1");
  s1.layers = staggerLayers([
    iconLayer("question", 530, 70, 160, { anim: defaultAnim({ style: "radial", drawStyle: "outline" }) }),
    textLayer("Why a whiteboard?", 140, 270, 1000, {
      duration: 1.8,
      text: { text: "Why a whiteboard?", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    textLayer("Because the drawing is the remembering.", 160, 400, 960, {
      duration: 2,
      text: { text: "Because the drawing is the remembering.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
    }),
  ]);
  s1.captions = [{ id: "fq1", text: "Motion is the mnemonic.", start: 0.3, end: 6 }];
  const s2 = makeScene("Q2");
  s2.transition = "fade";
  s2.layers = staggerLayers([
    iconLayer("check", 530, 70, 160, { anim: defaultAnim({ style: "contour", drawStyle: "outline", after: "pulse" }) }),
    textLayer("Do I need an account?", 140, 270, 1000, {
      duration: 1.8,
      text: { text: "Do I need an account?", font: "serif", weight: 700, align: "center", color: "#1C1916", lineHeight: 1 },
    }),
    textLayer("No. The board lives on this device.", 180, 400, 920, {
      duration: 2,
      text: { text: "No. The board lives on this device.", font: "hand", weight: 600, align: "center", color: "#1F4E79", lineHeight: 1.1 },
    }),
  ]);
  s2.captions = [{ id: "fq2", text: "Optional AI uses the key you paste — we do not keep it.", start: 0.3, end: 6 }];
  project.scenes = [s1, s2];
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
  {
    id: "caldwell",
    title: "Caldwell-Luc",
    blurb: "Medical overview in five scenes.",
    build: sampleCaldwellLuc,
  },
  {
    id: "howto",
    title: "How-to method",
    blurb: "Name, chunk, draw, leave a line.",
    build: sampleHowTo,
  },
  {
    id: "compare",
    title: "Old vs new",
    blurb: "A two-sided contrast board.",
    build: sampleCompare,
  },
  {
    id: "timeline",
    title: "Short history",
    blurb: "Four beats of an origin story.",
    build: sampleTimeline,
  },
  {
    id: "faq",
    title: "Two questions",
    blurb: "Q then A, twice.",
    build: sampleFaq,
  },
];
