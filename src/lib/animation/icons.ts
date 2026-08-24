export interface IconDef {
  id: string;
  name: string;
  category: "objects" | "people" | "nature" | "charts" | "ui" | "science" | "business";
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
];

export const ICON_CATEGORIES = [
  "objects",
  "people",
  "nature",
  "charts",
  "science",
  "business",
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
