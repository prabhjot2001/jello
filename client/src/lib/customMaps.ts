import type { TootCustomMap } from "@/types";

const KEY = "toot-custom-maps";

export interface SavedMap {
  id: string;
  spec: TootCustomMap;
  updatedAt: number;
}

function read(): SavedMap[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? (v as SavedMap[]) : [];
  } catch {
    return [];
  }
}

function write(list: SavedMap[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage is optional
  }
}

export const loadSaved = () => read().sort((a, b) => b.updatedAt - a.updatedAt);

export function saveMap(spec: TootCustomMap, id?: string) {
  const list = read();
  const mapId = id ?? `m${Date.now().toString(36)}`;
  const entry: SavedMap = { id: mapId, spec, updatedAt: Date.now() };
  const i = list.findIndex((m) => m.id === mapId);
  if (i >= 0) list[i] = entry;
  else list.push(entry);
  write(list);
  return { id: mapId, list: loadSaved() };
}

export function deleteMap(id: string) {
  write(read().filter((m) => m.id !== id));
  return loadSaved();
}

/* ---------- share codes: the map as plain text, easy to paste in a chat ---------- */

const toB64 = (bytes: Uint8Array) => {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromB64 = (text: string) => {
  const pad = "=".repeat((4 - (text.length % 4)) % 4);
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

export const encodeMap = (spec: TootCustomMap) => "T1." + toB64(new TextEncoder().encode(JSON.stringify(spec)));

export function decodeMap(code: string): TootCustomMap | null {
  try {
    const t = code.trim();
    if (!t.startsWith("T1.")) return null;
    const r = JSON.parse(new TextDecoder().decode(fromB64(t.slice(3)))) as Partial<TootCustomMap>;
    if (!r || !Array.isArray(r.items) || typeof r.length !== "number") return null;
    return {
      v: 1,
      name: String(r.name ?? "Imported map").slice(0, 24),
      theme: String(r.theme ?? "sewer"),
      length: r.length,
      items: r.items.filter((i) => Array.isArray(i) && i.length === 4) as TootCustomMap["items"],
    };
  } catch {
    return null;
  }
}
