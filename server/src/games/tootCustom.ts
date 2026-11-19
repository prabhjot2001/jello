import type {
  TootCustomMap, TootHazard, TootKindInfo, TootLevel, TootRect, TootSkin,
} from "../../../shared/toot.js";
import { GROUND_Y, WORLD_H } from "./tootLevels.js";
import { MAP_INFOS, mapById } from "./tootMaps.js";

const MIN_X = 900;
const END_PAD = 800;
const ZONE = 400;
const MAX_ITEMS = 160;

const kind = (
  id: string, label: string, emoji: string, group: "rock" | "hazard", anchor: TootKindInfo["anchor"],
  sizeLabel: string, min: number, max: number, def: number, w: number, h: number,
  opts: { usesY?: boolean; yDef?: number; ax?: number } = {}
): TootKindInfo => ({
  id, label, emoji, group, anchor, sizeLabel, min, max, def, w, h,
  usesY: !!opts.usesY, yDef: opts.yDef ?? 0, ax: opts.ax ?? 0,
});

/** Everything the map editor can place. Sent to the client, so the editor needs no copy of this list. */
export const KINDS: TootKindInfo[] = [
  kind("pillarFloor", "Rock pillar (floor)", "🪨", "rock", "floorPillar", "Height", 120, 560, 260, 100, 0),
  kind("pillarCeil", "Rock pillar (ceiling)", "🪨", "rock", "ceilPillar", "Height", 120, 560, 260, 100, 0),
  kind("gate", "Narrow gate", "🚪", "rock", "gate", "Gap", 300, 560, 460, 90, 0, { usesY: true, yDef: 450 }),
  kind("island", "Floating island", "🏝️", "rock", "island", "Width", 160, 420, 240, 0, 34, { usesY: true, yDef: 450 }),
  kind("poop", "Poop pile", "💩", "hazard", "strip", "Width", 120, 600, 280, 0, 46),
  kind("spikes", "Spikes", "🔺", "hazard", "strip", "Width", 120, 600, 320, 0, 32),
  kind("pinkspikes", "Candy spikes", "🍭", "hazard", "strip", "Width", 120, 600, 320, 0, 30),
  kind("thorns", "Thorns", "🌵", "hazard", "strip", "Width", 120, 600, 300, 0, 40),
  kind("fire", "Fire pit", "🔥", "hazard", "strip", "Width", 120, 600, 260, 0, 44),
  kind("roach", "Cockroach", "🪳", "hazard", "ground", "Patrol range", 40, 260, 110, 0, 24),
  kind("dog", "Angry dog", "🐕", "hazard", "ground", "Patrol range", 60, 300, 160, 0, 34),
  kind("dino", "Dinosaur", "🦖", "hazard", "ground", "Patrol range", 80, 320, 190, 0, 64),
  kind("chainsaw", "Chainsaw", "🪚", "hazard", "ground", "Patrol range", 80, 300, 170, 0, 38),
  kind("spider", "Giant spider", "🕷️", "hazard", "hang", "Drop distance", 80, 340, 130, 0, 38),
  kind("bat", "Bat", "🦇", "hazard", "float", "Flap range", 0, 200, 70, 0, 26, { usesY: true, yDef: 400, ax: 110 }),
  kind("ghost", "Ghost nun", "👻", "hazard", "float", "Float range", 0, 200, 60, 0, 42, { usesY: true, yDef: 400, ax: 90 }),
  kind("saw", "Saw wheel", "⚙️", "hazard", "float", "Up/down range", 0, 260, 150, 0, 46, { usesY: true, yDef: 450 }),
  kind("hammer", "Hammer", "🔨", "hazard", "swing", "Length", 250, 500, 380, 0, 46),
  kind("blade", "Giant blade", "🗡️", "hazard", "swing", "Length", 280, 520, 430, 0, 56),
];

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Horizontal space an item takes. Must match the editor's box. */
function itemWidth(info: TootKindInfo, size: number) {
  switch (info.anchor) {
    case "floorPillar":
    case "ceilPillar":
    case "gate":
      return info.w;
    case "island":
    case "strip":
      return size;
    case "ground":
      return 2 * size + 2 * info.h;
    case "hang":
      return 2 * info.h;
    case "float":
      return 2 * info.h + 2 * info.ax;
    case "swing":
      return size * 1.6;
  }
}

/** Cleans up anything a client sends. Returns null when it is not a map at all. */
export function validateCustom(raw: unknown): TootCustomMap | null {
  const r = raw as Partial<TootCustomMap> | null;
  if (!r || typeof r !== "object" || !Array.isArray(r.items)) return null;

  const length = num(r.length, 5000, 20000, 9000);
  const items: TootCustomMap["items"] = [];
  for (const it of r.items.slice(0, MAX_ITEMS)) {
    if (!Array.isArray(it)) continue;
    const info = KINDS.find((k) => k.id === it[0]);
    if (!info) continue;
    items.push([
      info.id,
      Math.round(num(it[1], MIN_X, length - END_PAD, MIN_X)),
      info.usesY ? Math.round(num(it[2], 100, 800, info.yDef)) : 0,
      Math.round(num(it[3], info.min, info.max, info.def)),
    ]);
  }

  const name = String(r.name ?? "").replace(/[^\w \-'!.]/g, "").trim().slice(0, 24) || "My map";
  const theme = MAP_INFOS.some((m) => m.id === r.theme) ? String(r.theme) : MAP_INFOS[0].id;
  return { v: 1, name, theme, length, items };
}

/** Turns a validated custom map into a level the physics and renderer already understand. */
export function buildCustomLevel(spec: TootCustomMap): TootLevel {
  const length = spec.length;
  const solids: TootRect[] = [
    { x: -400, y: -200, w: length + 1200, h: 200 },
    { x: -400, y: WORLD_H, w: length + 1200, h: 200 },
    { x: -400, y: -200, w: 400, h: WORLD_H + 400 },
    { x: length + 400, y: -200, w: 400, h: WORLD_H + 400 },
  ];
  const hazards: TootHazard[] = [];
  const checkpoints = [1, 2].map((k) => ({ x: Math.round((length * k) / 3), y: GROUND_Y }));
  const zones = [0, ...checkpoints.map((c) => c.x), length];
  const blocked = (x: number, w: number) => zones.some((z) => x < z + ZONE && x + w > z - ZONE);

  const push = (h: Omit<TootHazard, "id">) => hazards.push({ id: hazards.length, ...h });

  spec.items.forEach(([id, x, y, size], i) => {
    const info = KINDS.find((k) => k.id === id);
    if (!info || blocked(x, itemWidth(info, size))) return; // keep start, checkpoints and finish free

    const skin = id as TootSkin;
    const r = info.h;
    const phase = (i * 1.37) % 6.28;

    switch (info.anchor) {
      case "floorPillar":
        solids.push({ x, y: WORLD_H - size, w: info.w, h: size });
        break;
      case "ceilPillar":
        solids.push({ x, y: 0, w: info.w, h: size });
        break;
      case "gate": {
        const top = y - size / 2;
        const bottom = y + size / 2;
        solids.push({ x, y: 0, w: info.w, h: Math.max(40, top) });
        solids.push({ x, y: bottom, w: info.w, h: Math.max(40, WORLD_H - bottom) });
        break;
      }
      case "island":
        solids.push({ x, y, w: size, h: 34 });
        break;
      case "strip":
        push({ shape: "rect", skin, x, y: WORLD_H - info.h, w: size, h: info.h, ax: 0, ay: 0, period: 1, phase: 0 });
        break;
      case "ground": {
        const cx = x + size + r;
        push({ shape: "circle", skin, x: cx - r, y: WORLD_H - 2 * r, w: 2 * r, h: 2 * r, ax: size, ay: 0, period: 2.4, phase });
        break;
      }
      case "hang":
        push({ shape: "circle", skin, x, y: 230 - r, w: 2 * r, h: 2 * r, ax: 0, ay: size, period: 2.8, phase, hangFrom: 0 });
        break;
      case "float": {
        const cx = x + info.ax + r;
        const period = id === "ghost" ? 3.4 : id === "saw" ? 2.6 : 2.2;
        push({ shape: "circle", skin, x: cx - r, y: y - r, w: 2 * r, h: 2 * r, ax: info.ax, ay: size, period, phase });
        break;
      }
      case "swing": {
        const hammer = id === "hammer";
        const cx = x + size * 0.8;
        push({
          shape: "circle", skin, x: cx - r, y: size - r, w: 2 * r, h: 2 * r, ax: 0, ay: 0,
          period: hammer ? 2.6 : 3, phase,
          swing: { px: cx, py: 0, len: size, amp: hammer ? 0.85 : 1.0 },
        });
        break;
      }
    }
  });

  return {
    index: 0,
    mapId: "custom",
    name: spec.name,
    length,
    height: WORLD_H,
    spawn: { x: 220, y: GROUND_Y },
    checkpoints,
    finishX: length,
    solids,
    hazards,
    theme: mapById(spec.theme).info.theme,
    themeId: spec.theme,
  };
}
