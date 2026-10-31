export type ThemeId =
  | "calico" | "siamese" | "tuxedo" | "midnight"
  | "strawberry-milk" | "blueberry-kiss" | "peachy-puff" | "minty-mochi"
  | "cloudberry" | "honey-bunny" | "sakura-sugar" | "grape-cupcake";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  stickers: string[]; // files in /public/stickers
  defaultTrack: string; // id from TRACKS
}

export const THEMES: Theme[] = [
  {
    id: "calico",
    name: "Calico Cafe",
    emoji: "🐱",
    stickers: ["troll.png", "cry-cat.png", "doge.png"],
    defaultTrack: "cozy",
  },
  {
    id: "siamese",
    name: "Lavender Siamese",
    emoji: "😸",
    stickers: ["troll.png", "loser.png"],
    defaultTrack: "dreamy",
  },
  {
    id: "tuxedo",
    name: "Mint Tuxedo",
    emoji: "😺",
    stickers: ["doge.png", "cry-cat.png"],
    defaultTrack: "playful",
  },
  {
    id: "midnight",
    name: "Midnight Cat",
    emoji: "🌙",
    stickers: ["troll.png", "doge.png", "loser.png"],
    defaultTrack: "chill",
  },
  {
    id: "strawberry-milk",
    name: "Strawberry Milk",
    emoji: "🍓",
    stickers: ["cry-cat.png", "doge.png"],
    defaultTrack: "cozy",
  },
  {
    id: "blueberry-kiss",
    name: "Blueberry Kiss",
    emoji: "🫐",
    stickers: ["troll.png", "loser.png"],
    defaultTrack: "dreamy",
  },
  {
    id: "peachy-puff",
    name: "Peachy Puff",
    emoji: "🍑",
    stickers: ["cry-cat.png", "doge.png"],
    defaultTrack: "cozy",
  },
  {
    id: "minty-mochi",
    name: "Minty Mochi",
    emoji: "🍵",
    stickers: ["doge.png", "cry-cat.png"],
    defaultTrack: "playful",
  },
  {
    id: "cloudberry",
    name: "Cloudberry",
    emoji: "☁️",
    stickers: ["troll.png", "doge.png"],
    defaultTrack: "chill",
  },
  {
    id: "honey-bunny",
    name: "Honey Bunny",
    emoji: "🍯",
    stickers: ["cry-cat.png", "loser.png"],
    defaultTrack: "cozy",
  },
  {
    id: "sakura-sugar",
    name: "Sakura Sugar",
    emoji: "🌸",
    stickers: ["cry-cat.png", "doge.png"],
    defaultTrack: "dreamy",
  },
  {
    id: "grape-cupcake",
    name: "Grape Cupcake",
    emoji: "🧁",
    stickers: ["troll.png", "loser.png"],
    defaultTrack: "playful",
  },
];
export const TRACKS = [
  { id: "cozy", name: "Cozy Cafe", src: "/music/cozy.mp3" },
  { id: "dreamy", name: "Dreamy Pastel", src: "/music/dreamy.mp3" },
  { id: "playful", name: "Playful Paws", src: "/music/playful.mp3" },
  { id: "chill", name: "Midnight Chill", src: "/music/chill.mp3" },
];
