const cache = new Map<string, HTMLImageElement>();

/** Returns the loaded image, or null while it loads or if the file does not exist (use the fallback then). */
export function getSticker(path: string): HTMLImageElement | null {
  let img = cache.get(path);
  if (!img) {
    img = new Image();
    img.src = path;
    cache.set(path, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export const vehicleSticker = (id: string) => getSticker(`/stickers/vehicles/${id}.png`);
export const hazardSticker = (skin: string) => getSticker(`/stickers/hazards/${skin}.png`);
export const flySticker = () => getSticker("/stickers/hazards/fly.png");
