export interface IconDef {
  id: string;
  name: string;
  category: "objects" | "people" | "nature" | "charts" | "ui" | "science" | "business" | "medical";
  paths: string[];
  viewBox?: number;
}

const VB = 64;

export const ICONS: IconDef[] = [
  {
    id: "lightbulb",
    name: "Lightbulb",
    category: "objects",
    paths: [
      "M32 8c-9 0-16 7.2-16 16.4 0 6.2 3.4 11.5 8.4 14.3V46c0 2.2 2.6 4 7.6 4s7.6-1.8 7.6-4v-7.3c5-2.8 8.4-8.1 8.4-14.3C48 15.2 41 8 32 8z",
      "M26 54h12",
      "M28 58h8",
    ],
  },
  {
    id: "rocket",
    name: "Rocket",
    category: "objects",
    paths: [
      "M32 6c8 10 12 20 12 32l-8 4-4-8-4 8-8-4c0-12 4-22 12-32z",
      "M32 22a4 4 0 1 0 0.01 0z",
      "M20 42c-4 4-8 14-8 14s8-2 12-6",
      "M44 42c4 4 8 14 8 14s-8-2-12-6",
    ],
  },
  {
    id: "globe",
    name: "Globe",
    category: "objects",
    paths: [
      "M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z",
      "M8 32h48",
      "M32 8c8 8 12 16 12 24s-4 16-12 24",
      "M32 8c-8 8-12 16-12 24s4 16 12 24",
    ],
  },
  {
    id: "leaf",
    name: "Leaf",
    category: "nature",
    paths: [
      "M12 52c24-4 40-24 40-44-20 0-40 16-40 40z",
      "M20 44c8-8 16-20 22-32",
    ],
  },
  {
    id: "drop",
    name: "Drop",
    category: "nature",
    paths: ["M32 8c0 0 18 20 18 32a18 18 0 1 1-36 0C14 28 32 8 32 8z"],
  },
  {
    id: "sun",
    name: "Sun",
    category: "nature",
    paths: [
      "M32 20a12 12 0 1 0 0.01 0z",
      "M32 8v6M32 50v6M8 32h6M50 32h6M14 14l4 4M46 46l4 4M14 50l4-4M46 18l4-4",
    ],
  },
  {
    id: "moon",
    name: "Moon",
    category: "nature",
    paths: ["M42 12a20 20 0 1 0 10 32A20 20 0 0 1 42 12z"],
  },
  {
    id: "tree",
    name: "Tree",
    category: "nature",
    paths: [
      "M32 56V36",
      "M32 38c-10 0-16-8-16-16 0-10 16-18 16-18s16 8 16 18c0 8-6 16-16 16z",
    ],
  },
  {
    id: "mountain",
    name: "Mountain",
    category: "nature",
    paths: ["M6 50 L24 18 L36 36 L44 24 L58 50 Z", "M28 28 l6-4 8 10"],
  },
  {
    id: "cloud",
    name: "Cloud",
    category: "nature",
    paths: ["M18 42h28a10 10 0 0 0 1-20 14 14 0 0 0-26-4 12 12 0 0 0-3 24z"],
  },
  {
    id: "user",
    name: "Person",
    category: "people",
    paths: [
      "M32 12a10 10 0 1 0 0.01 0z",
      "M14 54c2-12 10-18 18-18s16 6 18 18",
    ],
  },
  {
    id: "users",
    name: "People",
    category: "people",
    paths: [
      "M24 16a8 8 0 1 0 0.01 0z",
      "M10 50c2-10 8-14 14-14s12 4 14 14",
      "M42 18a7 7 0 1 0 0.01 0z",
      "M36 50c1-8 6-12 12-12 6 0 10 3 12 12",
    ],
  },
  {
    id: "heart",
    name: "Heart",
    category: "people",
    paths: [
      "M32 54S10 38 10 24a10 10 0 0 1 20-2 10 10 0 0 1 20 2c0 14-22 30-22 30z",
    ],
  },
  {
    id: "brain",
    name: "Brain",
    category: "science",
    paths: [
      "M20 24c-6 0-10 5-10 12 0 10 8 18 22 18s22-8 22-18c0-7-4-12-10-12 0-8-6-12-12-12s-12 4-12 12z",
      "M32 14v40",
      "M22 28c4 2 6 6 6 10",
      "M42 28c-4 2-6 6-6 10",
    ],
  },
  {
    id: "flask",
    name: "Flask",
    category: "science",
    paths: [
      "M26 8h12v14l14 26c2 4 0 8-6 8H18c-6 0-8-4-6-8l14-26V8z",
      "M24 12h16",
      "M22 40h20",
    ],
  },
  {
    id: "atom",
    name: "Atom",
    category: "science",
    paths: [
      "M32 30a2 2 0 1 0 0.01 0z",
      "M32 32c16-10 22-6 18 6s-18 16-26 6",
      "M32 32c-16-10-22-6-18 6s18 16 26 6",
      "M32 32c0-18 8-22 16-10s4 22-8 26",
    ],
  },
  {
    id: "dna",
    name: "DNA",
    category: "science",
    paths: [
      "M22 8c20 8 20 16 0 24 20 8 20 16 0 24",
      "M42 8c-20 8-20 16 0 24-20 8-20 16 0 24",
      "M24 16h16M24 32h16M24 48h16",
    ],
  },
  {
    id: "book",
    name: "Book",
    category: "objects",
    paths: [
      "M12 12h18c4 0 8 2 8 6v34c-4-2-8-2-8-2H12a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z",
      "M38 18s4-2 8-2h6a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4h-6s-4 0-8 2",
      "M32 18v34",
    ],
  },
  {
    id: "target",
    name: "Target",
    category: "business",
    paths: [
      "M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z",
      "M32 18a14 14 0 1 0 0.01 0z",
      "M32 26a6 6 0 1 0 0.01 0z",
    ],
  },
  {
    id: "trophy",
    name: "Trophy",
    category: "business",
    paths: [
      "M20 12h24v10c0 10-6 16-12 16s-12-6-12-16V12z",
      "M20 16H12c0 8 4 12 8 12",
      "M44 16h8c0 8-4 12-8 12",
      "M32 38v8",
      "M22 52h20",
      "M26 46h12v6H26z",
    ],
  },
  {
    id: "flag",
    name: "Flag",
    category: "ui",
    paths: ["M16 8v48", "M16 10h28l-6 10 6 10H16"],
  },
  {
    id: "clock",
    name: "Clock",
    category: "ui",
    paths: [
      "M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z",
      "M32 16v16l10 6",
    ],
  },
  {
    id: "chart",
    name: "Bars",
    category: "charts",
    paths: ["M10 54h44", "M16 54V30h8v24", "M28 54V18h8v36", "M40 54V38h8v16"],
  },
  {
    id: "pie",
    name: "Pie",
    category: "charts",
    paths: [
      "M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z",
      "M32 8v24h24",
    ],
  },
  {
    id: "trend",
    name: "Trend",
    category: "charts",
    paths: ["M8 48 L22 32 L34 40 L56 14", "M42 14h14v14"],
  },
  {
    id: "cycle",
    name: "Cycle",
    category: "charts",
    paths: [
      "M16 28a16 16 0 0 1 26-10",
      "M42 18l4-8 6 10",
      "M48 36a16 16 0 0 1-26 10",
      "M22 46l-4 8-6-10",
    ],
  },
  {
    id: "funnel",
    name: "Funnel",
    category: "charts",
    paths: ["M12 12h40L38 32v18l-12 4V32z"],
  },
  {
    id: "laptop",
    name: "Laptop",
    category: "objects",
    paths: [
      "M16 16h32v22H16z",
      "M8 40h48l-4 8H12z",
    ],
  },
  {
    id: "phone",
    name: "Phone",
    category: "objects",
    paths: [
      "M22 8h20a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z",
      "M28 12h8",
      "M32 50h0.01",
    ],
  },
  {
    id: "mail",
    name: "Mail",
    category: "ui",
    paths: ["M8 18h48v28H8z", "M8 18l24 16 24-16"],
  },
  {
    id: "chat",
    name: "Chat",
    category: "ui",
    paths: ["M10 12h36a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H26l-12 10v-10H10a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z"],
  },
  {
    id: "megaphone",
    name: "Megaphone",
    category: "business",
    paths: [
      "M8 26h10l28-12v36L18 38H8a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4z",
      "M18 38c0 8 4 14 10 14",
    ],
  },
  {
    id: "coin",
    name: "Coin",
    category: "business",
    paths: [
      "M32 10c14 0 22 6 22 22s-8 22-22 22S10 48 10 32 18 10 32 10z",
      "M32 22v20",
      "M26 28h8c3 0 5 2 5 4s-2 4-5 4h-10",
    ],
  },
  {
    id: "cart",
    name: "Cart",
    category: "business",
    paths: [
      "M8 12h8l6 28h26",
      "M16 20h34l-4 16H20",
      "M24 52a4 4 0 1 0 0.01 0z",
      "M44 52a4 4 0 1 0 0.01 0z",
    ],
  },
  {
    id: "building",
    name: "Building",
    category: "objects",
    paths: [
      "M12 56V20l20-10 20 10v36z",
      "M28 56V40h8v16",
      "M20 28h6M38 28h6M20 38h6M38 38h6",
    ],
  },
  {
    id: "car",
    name: "Car",
    category: "objects",
    paths: [
      "M8 38h48l-6-14H18z",
      "M16 24l6-10h20l6 10",
      "M18 42a6 6 0 1 0 0.01 0z",
      "M46 42a6 6 0 1 0 0.01 0z",
    ],
  },
  {
    id: "plane",
    name: "Plane",
    category: "objects",
    paths: [
      "M8 34l20-4 8-16 6 2-4 16 18 6-4 4-16-2-10 12-6-2 6-12-18-2z",
    ],
  },
  {
    id: "check",
    name: "Check",
    category: "ui",
    paths: [
      "M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z",
      "M20 32l8 8 16-16",
    ],
  },
  {
    id: "star",
    name: "Star",
    category: "ui",
    paths: ["M32 8l6 16h18L44 34l6 18-18-12-18 12 6-18L8 24h18z"],
  },
  {
    id: "arrow-right",
    name: "Arrow",
    category: "ui",
    paths: ["M10 32h40", "M36 16l18 16-18 16"],
  },
  {
    id: "home",
    name: "Home",
    category: "objects",
    paths: ["M8 30 L32 10 L56 30", "M16 28v24h12V38h8v14h12V28"],
  },
  {
    id: "key",
    name: "Key",
    category: "objects",
    paths: [
      "M26 32a12 12 0 1 1 8 0l6 6h8v8h-8l-4 4H28v-8l-2-4z",
    ],
  },
  {
    id: "lock",
    name: "Lock",
    category: "ui",
    paths: [
      "M18 28h28v24H18z",
      "M24 28V20a8 8 0 0 1 16 0v8",
      "M32 40v6",
    ],
  },
  {
    id: "spark",
    name: "Spark",
    category: "ui",
    paths: ["M32 6v16M32 42v16M6 32h16M42 32h16M14 14l10 10M40 40l10 10M14 50l10-10M40 24l10-10"],
  },
  {
    id: "gear",
    name: "Gear",
    category: "objects",
    paths: [
      "M32 22a10 10 0 1 0 0.01 0z",
      "M32 8v6M32 50v6M8 32h6M50 32h6M14.5 14.5l4.2 4.2M45.3 45.3l4.2 4.2M14.5 49.5l4.2-4.2M45.3 18.7l4.2-4.2",
    ],
  },
  {
    id: "map",
    name: "Map pin",
    category: "ui",
    paths: [
      "M32 8c10 0 18 8 18 18 0 14-18 30-18 30S14 40 14 26c0-10 8-18 18-18z",
      "M32 20a6 6 0 1 0 0.01 0z",
    ],
  },
  {
    id: "pencil",
    name: "Pencil",
    category: "objects",
    paths: ["M44 8l12 12-28 28-16 4 4-16z", "M36 16l12 12"],
  },
  {
    id: "scalpel",
    name: "Scalpel",
    category: "medical",
    paths: ["M8 52 L36 24 l8 8 L16 60z", "M36 24 l16-16 6 6-16 16", "M44 16 l6 6"],
  },
  {
    id: "syringe",
    name: "Syringe",
    category: "medical",
    paths: ["M14 50 L40 24", "M36 20 l8 8", "M44 12 l8 8", "M12 52 l-4 4", "M22 42 h10", "M26 38 h10"],
  },
  {
    id: "lungs",
    name: "Lungs",
    category: "medical",
    paths: [
      "M32 12v16",
      "M32 28c-4 0-14 4-16 16-1 8 4 16 12 12 4-2 6-8 4-16",
      "M32 28c4 0 14 4 16 16 1 8-4 16-12 12-4-2-6-8-4-16",
    ],
  },
  {
    id: "stethoscope",
    name: "Stethoscope",
    category: "medical",
    paths: [
      "M18 12v16c0 8 6 14 14 14s14-6 14-14V12",
      "M18 12h-4M46 12h4",
      "M32 42v6a10 10 0 0 0 10 10 8 8 0 1 0-0.01 0",
    ],
  },
  {
    id: "hospital",
    name: "Hospital",
    category: "medical",
    paths: ["M12 56V20h40v36", "M24 56V40h16v16", "M28 16V8h8v8", "M32 10v8M28 14h8", "M18 28h6M40 28h6M18 36h6M40 36h6"],
  },
  {
    id: "pill",
    name: "Pill",
    category: "medical",
    paths: ["M18 40 L40 18 a10 10 0 0 1 14 14 L32 54 a10 10 0 0 1-14-14z", "M26 32 l12 12"],
  },
  {
    id: "bandage",
    name: "Bandage",
    category: "medical",
    paths: ["M8 32 l16-16 32 32-16 16z", "M20 28 l16 16", "M24 24h4M28 20h4M36 40h4M40 36h4"],
  },
  {
    id: "skull",
    name: "Skull",
    category: "medical",
    paths: [
      "M32 8c12 0 20 8 20 20 0 8-4 14-8 16v8H20v-8c-4-2-8-8-8-16 0-12 8-20 20-20z",
      "M22 28a4 4 0 1 0 0.01 0z",
      "M42 28a4 4 0 1 0 0.01 0z",
      "M26 44h12M28 48h8",
    ],
  },
  {
    id: "ear",
    name: "Ear",
    category: "medical",
    paths: ["M40 12c-12 0-20 8-20 20 0 14 8 24 8 24", "M40 12c8 0 12 8 8 16-6 4-8 8-4 16", "M28 30c2-6 8-8 12-4"],
  },
  {
    id: "eye-open",
    name: "Eye",
    category: "medical",
    paths: ["M8 32c8-14 16-20 24-20s16 6 24 20c-8 14-16 20-24 20s-16-6-24-20z", "M32 24a8 8 0 1 0 0.01 0z"],
  },
  {
    id: "tooth",
    name: "Tooth",
    category: "medical",
    paths: ["M16 20c0-8 8-12 16-12s16 4 16 12c0 8-4 12-4 22 0 8-4 14-8 14s-6-4-4-12c-2 8-4 12-8 12s-8-6-8-14c0-10-4-14-4-22z"],
  },
  {
    id: "bone",
    name: "Bone",
    category: "medical",
    paths: ["M14 22a8 8 0 1 1 8-8", "M14 22a8 8 0 1 0-8 8", "M50 42a8 8 0 1 1 8 8", "M50 42a8 8 0 1 0-8 8", "M18 26 L46 46"],
  },
  {
    id: "heartbeat",
    name: "Heartbeat",
    category: "medical",
    paths: ["M6 32h12l6-14 8 28 6-14h20", "M32 54S10 40 10 26a10 10 0 0 1 18-4"],
  },
  {
    id: "ambulance",
    name: "Ambulance",
    category: "medical",
    paths: ["M8 28h32v20H8z", "M40 32h12l4 10v6H40", "M18 50a6 6 0 1 0 0.01 0z", "M48 50a6 6 0 1 0 0.01 0z", "M18 34h10M23 29v10"],
  },
  {
    id: "mask",
    name: "Mask",
    category: "medical",
    paths: ["M12 28h40v16c-8 8-32 8-40 0V28z", "M12 30c-8-4-8-12-4-16", "M52 30c8-4 8-12 4-16", "M24 36h16"],
  },
  {
    id: "sinus",
    name: "Sinus",
    category: "medical",
    paths: [
      "M32 8c-6 4-14 16-16 28 4 8 12 16 16 20 4-4 12-12 16-20-2-12-10-24-16-28z",
      "M26 30c2-6 6-8 6-8s4 2 6 8c-2 4-10 4-12 0z",
      "M32 38v10",
    ],
  },
  {
    id: "kidney",
    name: "Kidney",
    category: "medical",
    paths: ["M24 12c12 0 20 10 18 24-2 12-10 20-20 20-8 0-10-8-6-14 6-4 8-10 4-16-2-6 0-14 4-14z"],
  },
  {
    id: "microscope",
    name: "Microscope",
    category: "science",
    paths: ["M18 56h28", "M28 56V36h8", "M24 36h16", "M32 36c8-4 14-12 12-20-2-6-10-8-16-4", "M20 16h10"],
  },
  {
    id: "clipboard",
    name: "Clipboard",
    category: "objects",
    paths: ["M16 14h32v42H16z", "M24 14V8h16v6", "M24 28h16M24 36h16M24 44h12"],
  },
  {
    id: "list",
    name: "List",
    category: "ui",
    paths: ["M18 16h4M18 32h4M18 48h4", "M28 16h24M28 32h24M28 48h24"],
  },
  {
    id: "shield",
    name: "Shield",
    category: "objects",
    paths: ["M32 8l20 8v16c0 14-12 24-20 28-8-4-20-14-20-28V16z", "M32 22v20"],
  },
  {
    id: "fire",
    name: "Fire",
    category: "nature",
    paths: ["M32 56c-12 0-18-10-18-20 0-10 8-16 10-26 6 8 8 12 8 12s4-6 10-8c0 10 8 16 8 22 0 10-6 20-18 20z"],
  },
  {
    id: "bolt",
    name: "Bolt",
    category: "nature",
    paths: ["M36 6 L16 34h14L28 58 50 28H36z"],
  },
  {
    id: "wifi",
    name: "Wifi",
    category: "ui",
    paths: ["M8 24c12-12 36-12 48 0", "M16 32c8-8 24-8 32 0", "M24 40c4-4 12-4 16 0", "M32 50a3 3 0 1 0 0.01 0z"],
  },
  {
    id: "camera",
    name: "Camera",
    category: "objects",
    paths: ["M10 22h44v28H10z", "M22 22l4-8h12l4 8", "M32 30a8 8 0 1 0 0.01 0z"],
  },
  {
    id: "music-note",
    name: "Music",
    category: "objects",
    paths: ["M24 48a8 8 0 1 0 0.01 0z", "M28 48V16l20-4v24", "M48 36a8 8 0 1 0 0.01 0z"],
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "ui",
    paths: ["M12 16h40v36H12z", "M12 28h40", "M22 10v12M42 10v12", "M22 38h6M32 38h6M42 38h6"],
  },
  {
    id: "bell",
    name: "Bell",
    category: "ui",
    paths: ["M32 8c-8 0-14 8-14 20v10l-6 8h40l-6-8V28c0-12-6-20-14-20z", "M26 50c2 6 10 6 12 0"],
  },
  {
    id: "folder",
    name: "Folder",
    category: "objects",
    paths: ["M8 18h18l6 6h24v26H8z"],
  },
  {
    id: "link",
    name: "Link",
    category: "ui",
    paths: ["M26 40 l-6 6a10 10 0 0 1-14-14l8-8", "M38 24 l6-6a10 10 0 0 1 14 14l-8 8", "M24 40 L40 24"],
  },
  {
    id: "compass",
    name: "Compass",
    category: "science",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M32 18 L40 40 24 28z"],
  },
  {
    id: "graduate",
    name: "Graduate",
    category: "people",
    paths: ["M8 24 L32 12 56 24 32 36z", "M48 26v12c-8 6-24 6-32 0V26", "M54 24v16"],
  },
  {
    id: "ruler",
    name: "Ruler",
    category: "objects",
    paths: ["M10 40 L40 10 l14 14 L24 54z", "M18 32l4-4M24 26l4-4M30 20l4-4"],
  },
  {
    id: "handshake",
    name: "Handshake",
    category: "people",
    paths: ["M8 28l12-8 8 8", "M56 28l-12-8-8 8", "M20 28 l8 12 8-4 8 8 8-10", "M28 40l-4 8M36 44l2 8"],
  },
  {
    id: "wave",
    name: "Wave",
    category: "nature",
    paths: ["M6 40c8-12 12-12 20 0 8 12 12 12 20 0 8-12 12-12 18 0", "M6 50c8-8 12-8 20 0 8 8 12 8 20 0 8-8 12-8 18 0"],
  },
  {
    id: "fish",
    name: "Fish",
    category: "nature",
    paths: ["M8 32c8-16 28-16 40 0-12 16-32 16-40 0z", "M48 32l12-10v20z", "M20 28a2 2 0 1 0 0.01 0z"],
  },
  {
    id: "flower",
    name: "Flower",
    category: "nature",
    paths: [
      "M32 28a6 6 0 1 0 0.01 0z",
      "M32 10a8 8 0 0 1 0 16 8 8 0 0 1 0-16z",
      "M32 38a8 8 0 0 1 0 16 8 8 0 0 1 0-16z",
      "M14 32a8 8 0 0 1 16 0 8 8 0 0 1-16 0z",
      "M34 32a8 8 0 0 1 16 0 8 8 0 0 1-16 0z",
      "M32 44v16",
    ],
  },
  {
    id: "apple",
    name: "Apple",
    category: "nature",
    paths: ["M32 16c-14 0-20 12-20 24 0 12 10 20 20 20s20-8 20-20c0-12-6-24-20-24z", "M32 16c4-8 12-10 16-8"],
  },
  {
    id: "cup",
    name: "Cup",
    category: "objects",
    paths: ["M16 16h28v20c0 10-8 16-14 16s-14-6-14-16V16z", "M44 20h8c4 0 6 4 6 8s-2 8-6 8h-8", "M20 56h24"],
  },
  {
    id: "ball",
    name: "Ball",
    category: "objects",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M12 24c12 6 28 6 40 0", "M12 40c12-6 28-6 40 0", "M32 8v48"],
  },
  {
    id: "plus-circle",
    name: "Plus",
    category: "ui",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M32 20v24M20 32h24"],
  },
  {
    id: "info",
    name: "Info",
    category: "ui",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M32 28v16", "M32 20h0.01"],
  },
  {
    id: "warning",
    name: "Warning",
    category: "ui",
    paths: ["M32 8 L58 54 H6z", "M32 26v16", "M32 48h0.01"],
  },
  {
    id: "question",
    name: "Question",
    category: "ui",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M24 24c0-6 4-10 8-10s8 4 8 8-4 6-8 8v6", "M32 46h0.01"],
  },
  {
    id: "arrow-up",
    name: "Arrow up",
    category: "ui",
    paths: ["M32 54V12", "M16 28 L32 12 48 28"],
  },
  {
    id: "arrow-down",
    name: "Arrow down",
    category: "ui",
    paths: ["M32 10v42", "M16 36 L32 52 48 36"],
  },
  {
    id: "play-btn",
    name: "Play",
    category: "ui",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M26 20l20 12-20 12z"],
  },
  {
    id: "pause-btn",
    name: "Pause",
    category: "ui",
    paths: ["M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48z", "M24 22h6v20h-6z", "M34 22h6v20h-6z"],
  },
  {
    id: "battery",
    name: "Battery",
    category: "objects",
    paths: ["M8 20h40v24H8z", "M48 26h8v12h-8", "M14 26h20v12H14z"],
  },
  {
    id: "video",
    name: "Video",
    category: "objects",
    paths: ["M8 18h36v28H8z", "M44 26l14-8v28l-14-8z"],
  },
  {
    id: "umbrella",
    name: "Umbrella",
    category: "nature",
    paths: ["M8 32c0-14 10-22 24-22s24 8 24 22H8z", "M32 32v20a6 6 0 0 1-12 0"],
  },
  {
    id: "snowflake",
    name: "Snowflake",
    category: "nature",
    paths: ["M32 8v48M10 20l44 24M10 44l44-24", "M32 16l-6-4M32 16l6-4M32 48l-6 4M32 48l6 4"],
  },
];

export const ICON_CATEGORIES = [
  "objects",
  "people",
  "nature",
  "charts",
  "science",
  "business",
  "medical",
  "ui",
] as const;

export function getIcon(id: string): IconDef {
  return ICONS.find((i) => i.id === id) ?? ICONS[0]!;
}

export function iconSvg(icon: IconDef, color = "#1C1916", stroke = 2.4) {
  const vb = icon.viewBox ?? VB;
  const paths = icon.paths
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="32" height="32">${paths}</svg>`;
}
