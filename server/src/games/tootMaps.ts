import type { TootMapInfo } from "../../../shared/toot.js";

export type HazardKind =
  | "poop" | "spikes" | "thorns" | "fire"
  | "saw" | "roach" | "dog" | "dino" | "spider" | "bat" | "ghost" | "chainsaw"
  | "hammer" | "blade";

export interface MapDef {
  info: TootMapInfo;
  /** which hazards this map uses, with weights */
  palette: [HazardKind, number][];
}

export const MAPS: MapDef[] = [
  {
    info: {
      id: "sewer",
      name: "Stinky Sewer",
      emoji: "💩",
      tagline: "Pipes, bubbles and a very bad smell.",
      hazards: "Poop piles with flies, cockroaches, giant spiders, saw wheels",
      theme: {
        skyTop: "#8FB36B", skyBottom: "#3E5233", rock: "#A58E63", rockEdge: "#3B2F1E",
        far: ["🫧", "🕸️"], near: ["🪳", "🫧"],
      },
    },
    palette: [["poop", 3], ["roach", 3], ["spider", 2], ["saw", 1]],
  },
  {
    info: {
      id: "mansion",
      name: "Haunted Mansion",
      emoji: "👻",
      tagline: "Do not look behind you.",
      hazards: "Ghost nuns, bats, swinging blades, giant spiders, hammers",
      theme: {
        skyTop: "#5B3F8C", skyBottom: "#1E1535", rock: "#8F7BB5", rockEdge: "#EDE3FF",
        far: ["🌙", "🦇"], near: ["🕯️", "🕸️"],
      },
    },
    palette: [["ghost", 3], ["bat", 3], ["blade", 2], ["spider", 2], ["hammer", 1]],
  },
  {
    info: {
      id: "jungle",
      name: "Jurassic Jungle",
      emoji: "🦖",
      tagline: "The volcano is grumpy today.",
      hazards: "Dinosaurs, fire pits, thorns, giant spiders",
      theme: {
        skyTop: "#9BE8A8", skyBottom: "#2E7D55", rock: "#9B7B55", rockEdge: "#3E2F1F",
        far: ["🌴", "🌋"], near: ["🌿", "🦕"],
      },
    },
    palette: [["dino", 3], ["fire", 2], ["thorns", 2], ["spider", 2]],
  },
  {
    info: {
      id: "street",
      name: "Angry Street",
      emoji: "🐕",
      tagline: "Every dog on the block is awake.",
      hazards: "Dangerous dogs, hammers, saw wheels, cockroaches, spikes",
      theme: {
        skyTop: "#FFD9A0", skyBottom: "#FF9E80", rock: "#D8B48A", rockEdge: "#5A3F2A",
        far: ["🏠", "🛺"], near: ["🌳", "🐄"],
      },
    },
    palette: [["dog", 4], ["hammer", 2], ["saw", 1], ["roach", 1], ["spikes", 1]],
  },
  {
    info: {
      id: "factory",
      name: "Factory of Doom",
      emoji: "🏭",
      tagline: "Safety rules do not apply here.",
      hazards: "Saw wheels, chainsaws, hammers, giant blades, spikes",
      theme: {
        skyTop: "#C3CEDC", skyBottom: "#60708A", rock: "#A9B6C6", rockEdge: "#2F3A4A",
        far: ["🏭", "⚙️"], near: ["⚙️", "🔩"],
      },
    },
    palette: [["saw", 3], ["chainsaw", 3], ["hammer", 2], ["blade", 2], ["spikes", 2]],
  },
];

export const MAP_INFOS = MAPS.map((m) => m.info);
export const mapById = (id: string) => MAPS.find((m) => m.info.id === id) ?? MAPS[0];