export interface Avatar {
  id: string;
  /** file inside client/public/stickers/ */
  file: string;
  /** shown when the image is missing */
  fallback: string;
  name: string;
}

// ids must be lowercase letters, digits or "-" (the server validates them)
export const AVATARS: Avatar[] = [
  { id: "troll", file: "sticker_001.png", fallback: "😼", name: "Troll" },
  { id: "doge", file: "sticker_023.png", fallback: "😸", name: "Doge" },
  { id: "cry-cat", file: "sticker_036.png", fallback: "😿", name: "Cry cat" },
  { id: "loser", file: "sticker_043.png", fallback: "🙀", name: "Loser" },
  { id: "cat5", file: "sticker_013.png", fallback: "😻", name: "Cat 5" },
  { id: "cat6", file: "sticker_025.png", fallback: "🐾", name: "Cat 6" },
  { id: "cat7", file: "sticker_054.png", fallback: "🐾", name: "Cat 7" },
  { id: "cat8", file: "sticker_055.png", fallback: "🐾", name: "Cat 8" },
  { id: "cat9", file: "sticker_056.png", fallback: "🐾", name: "Cat 9" },
  { id: "cat10", file: "sticker_057.png", fallback: "🐾", name: "Cat 10" },
  { id: "cat11", file: "sticker_058.png", fallback: "🐾", name: "Cat 11" },
  { id: "cat12", file: "sticker_059.png", fallback: "🐾", name: "Cat 12" },
  { id: "cat13", file: "sticker_060.png", fallback: "🐾", name: "Cat 13" },
  { id: "cat14", file: "sticker_061.png", fallback: "🐾", name: "Cat 14" },
  { id: "cat15", file: "sticker_062.png", fallback: "🐾", name: "Cat 15" },
  { id: "cat16", file: "sticker_063.png", fallback: "🐾", name: "Cat 16" },
  { id: "cat17", file: "sticker_064.png", fallback: "🐾", name: "Cat 17" },
  { id: "cat18", file: "sticker_065.png", fallback: "🐾", name: "Cat 18" },
];

export const COLORS = [
  "#FFB5C8",
  "#C9B3F5",
  "#9FE3C4",
  "#FFE08A",
  "#9AD1FF",
  "#FF9E80",
  "#F7A8E8",
  "#B5EAD7",
];

export const findAvatar = (id: string) =>
  AVATARS.find((a) => a.id === id) ?? AVATARS[0];

const images = new Map<string, HTMLImageElement>();

/** Returns the loaded sticker image, or null while loading / if the file is missing. */
export function getAvatarImage(av: Avatar): HTMLImageElement | null {
  let img = images.get(av.id);
  if (!img) {
    img = new Image();
    img.src = `/stickers/${av.file}`;
    images.set(av.id, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
