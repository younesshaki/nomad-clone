export type Chapter = {
  title: string;
};

export type Part = {
  title: string;
  chapters: Chapter[];
};

export const parts: Part[] = [
  {
    title: "Genesis",
    chapters: [
      { title: "First Light" },
      { title: "The Voice" },
      { title: "Chosen" },
      { title: "The Covenant" },
    ],
  },
  {
    title: "Trials",
    chapters: [
      { title: "Into the Unknown" },
      { title: "The Abyss" },
      { title: "Rebirth" },
      { title: "Return" },
    ],
  },
  {
    title: "Exile",
    chapters: [
      { title: "Banishment" },
      { title: "Wasteland" },
      { title: "Remnants" },
      { title: "Embers" },
    ],
  },
  {
    title: "Ascension",
    chapters: [
      { title: "Summit" },
      { title: "Aether" },
      { title: "Revelation" },
      { title: "Crown" },
    ],
  },
  {
    title: "Echoes",
    chapters: [
      { title: "Afterglow" },
      { title: "Resonance" },
      { title: "Horizon" },
      { title: "Legacy" },
    ],
  },
];
