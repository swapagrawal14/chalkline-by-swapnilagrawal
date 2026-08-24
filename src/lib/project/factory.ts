import { getIcon } from "@/lib/animation/icons";
import { uid } from "@/lib/utils";
import {
  DEFAULT_ANIM,
  resolveAnim,
  type AnimSettings,
  type Layer,
  type Project,
  type Scene,
} from "./types";

export function defaultAnim(partial?: Partial<AnimSettings>): AnimSettings {
  return resolveAnim({ ...DEFAULT_ANIM, ...partial });
}

export function makeLayer(partial: Partial<Layer> & Pick<Layer, "type" | "name">): Layer {
  return {
    id: uid("ly"),
    visible: true,
    locked: false,
    x: 100,
    y: 80,
    width: 280,
    height: 280,
    rotation: 0,
    opacity: 1,
    start: 0,
    duration: 2.4,
    order: 0,
    anim: defaultAnim(),
    ...partial,
  };
}

export function makeScene(name = "Scene 1", layers: Layer[] = []): Scene {
  return {
    id: uid("sc"),
    name,
    layers,
    captions: [],
    camera: {
      enabled: false,
      fromScale: 1,
      toScale: 1.08,
      fromX: 0,
      fromY: 0,
      toX: -20,
      toY: -12,
    },
    hold: 0.45,
    transition: "cut",
  };
}

export function makeProject(name = "Untitled board"): Project {
  const scene = makeScene();
  return {
    id: uid("pr"),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    aspect: "16:9",
    resolution: "720p",
    background: "paper",
    solidColor: "#F4EFE6",
    scenes: [scene],
    activeSceneId: scene.id,
    loop: false,
    musicVolume: 0.4,
    notes: "",
    snap: false,
    grid: false,
    spotlight: false,
    sfx: false,
  };
}

export function textLayer(
  text: string,
  x: number,
  y: number,
  width: number,
  opts?: Partial<Layer>,
): Layer {
  const font = opts?.text?.font ?? "hand";
  const size = font === "hand" ? 64 : 48;
  return makeLayer({
    type: "text",
    name: text.slice(0, 28) || "Text",
    x,
    y,
    width,
    height: Math.max(70, size + 16),
    duration: Math.max(1.6, text.length * 0.08),
    text: {
      text,
      font,
      weight: 600,
      align: "center",
      color: "#1C1916",
      lineHeight: 1.15,
      ...opts?.text,
    },
    ...opts,
  });
}

export function iconLayer(
  iconId: string,
  x: number,
  y: number,
  size = 180,
  opts?: Partial<Layer>,
): Layer {
  const icon = getIcon(iconId);
  return makeLayer({
    type: "icon",
    name: icon.name,
    x,
    y,
    width: size,
    height: size,
    duration: 2.2,
    icon: { iconId, color: "#1C1916", strokeWidth: 2.6 },
    anim: defaultAnim({ style: "contour", drawStyle: "outline" }),
    ...opts,
  });
}

export function sequenceLayers(layers: Layer[], gap = 0.18) {
  let t = 0.25;
  layers.forEach((layer, i) => {
    layer.order = i;
    layer.start = t;
    t += layer.duration + gap;
  });
  return layers;
}

export function sceneDuration(scene: Scene) {
  const ends = scene.layers.filter((l) => l.visible).map((l) => l.start + l.duration);
  const capEnds = scene.captions.map((c) => c.end);
  const max = Math.max(0, ...ends, ...capEnds);
  return max + scene.hold;
}

export function projectDuration(project: Project) {
  return project.scenes.reduce((sum, s) => sum + sceneDuration(s), 0);
}
