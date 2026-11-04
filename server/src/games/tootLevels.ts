import type { TootHazard, TootLevel, TootRect, TootSkin } from "../../../shared/toot.js";
import { mapById, type HazardKind } from "./tootMaps.js";

export const LEVEL_COUNT = 3;
export const WORLD_H = 900;
/** the y of the floor surface where vehicles stand */
export const GROUND_Y = WORLD_H - 4;

type Kind = HazardKind | "pillarFloor" | "pillarCeil" | "gate" | "island";

/** horizontal space each segment needs */
const WIDTH: Record<Kind, number> = {
  pillarFloor: 100, pillarCeil: 100, gate: 100, island: 240,
  poop: 300, spikes: 320, thorns: 300, fire: 260,
  roach: 260, dog: 340, dino: 440, spider: 160, bat: 240, ghost: 260,
  saw: 160, chainsaw: 300, hammer: 620, blade: 700,
};

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

/** Builds one level of a map. The same map and index always give the same course. */
export function buildLevel(mapId: string, index: number): TootLevel {
  const map = mapById(mapId);
  const rnd = mulberry32(hash(map.info.id) + index * 7919);
  const d = index; // 0, 1, 2: higher is harder
  const length = 7500 + index * 1500;

  const solids: TootRect[] = [
    { x: -400, y: -200, w: length + 1200, h: 200 }, // ceiling
    { x: -400, y: WORLD_H, w: length + 1200, h: 200 }, // floor
    { x: -400, y: -200, w: 400, h: WORLD_H + 400 }, // left wall
    { x: length + 400, y: -200, w: 400, h: WORLD_H + 400 }, // right wall
  ];
  const hazards: TootHazard[] = [];
  const checkpoints = [1, 2].map((k) => ({ x: Math.round((length * k) / 3), y: GROUND_Y }));

  // keep the start, checkpoints and finish free of obstacles
  const zones = [0, ...checkpoints.map((c) => c.x), length];
  const blocked = (x: number, w: number) => zones.some((z) => x < z + 600 && x + w > z - 600);

  const add = (h: Omit<TootHazard, "id">) => hazards.push({ id: hazards.length, ...h });
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

  const table: [Kind, number][] = [
    ["pillarFloor", 1], ["pillarCeil", 1], ["gate", 1], ["island", 1],
    ...map.palette,
  ];
  const total = table.reduce((s, [, w]) => s + w, 0);
  const choose = (): Kind => {
    let r = rnd() * total;
    for (const [k, w] of table) {
      r -= w;
      if (r <= 0) return k;
    }
    return "island";
  };

  let x = 1300;
  while (x < length - 800) {
    const kind = choose();
    const w = WIDTH[kind];
    if (blocked(x, w)) {
      x += 250;
      continue;
    }
    const cx = x + w / 2;
    const skin = kind as TootSkin;

    const strip = (sx: number, sy: number, sw: number, sh: number) =>
      add({ shape: "rect", skin, x: sx, y: sy, w: sw, h: sh, ax: 0, ay: 0, period: 1, phase: 0 });
    const ground = (r: number, ax: number, period: number) =>
      add({ shape: "circle", skin, x: cx - r, y: WORLD_H - 2 * r, w: 2 * r, h: 2 * r, ax, ay: 0, period, phase: rnd() * 6.28 });
    const floating = (r: number, cy: number, ax: number, ay: number, period: number) =>
      add({ shape: "circle", skin, x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, ax, ay, period, phase: rnd() * 6.28 });
    const swing = (len: number, amp: number, period: number, r: number) =>
      add({
        shape: "circle", skin, x: cx - r, y: len - r, w: 2 * r, h: 2 * r, ax: 0, ay: 0,
        period, phase: rnd() * 6.28, swing: { px: cx, py: 0, len, amp },
      });

    switch (kind) {
      case "pillarFloor": {
        const h = 180 + rnd() * (160 + 40 * d);
        solids.push({ x, y: WORLD_H - h, w: 100, h });
        break;
      }
      case "pillarCeil": {
        const h = 180 + rnd() * (160 + 40 * d);
        solids.push({ x, y: 0, w: 100, h });
        break;
      }
      case "gate": {
        // a gap you must fly through
        const gap = 520 - 40 * d;
        const cy = 300 + rnd() * 300;
        const botY = cy + gap / 2;
        solids.push({ x, y: 0, w: 90, h: cy - gap / 2 });
        solids.push({ x, y: botY, w: 90, h: WORLD_H - botY });
        break;
      }
      case "island": {
        solids.push({ x, y: 320 + rnd() * 300, w: 240, h: 34 });
        break;
      }
      case "poop":
      case "spikes":
      case "thorns":
      case "fire": {
        const h = kind === "poop" ? 46 : kind === "fire" ? 44 : kind === "thorns" ? 40 : 32;
        strip(x, WORLD_H - h, w, h);
        if (kind === "spikes" && d >= 1 && rnd() < 0.5) strip(x, 0, w, h);
        break;
      }
      case "roach":
        ground(24, 110, 2.4 - 0.2 * d);
        break;
      case "dog":
        ground(34, 150 + 15 * d, 2.2 - 0.2 * d);
        break;
      case "dino":
        ground(64, 190, 3.6 - 0.3 * d);
        break;
      case "chainsaw":
        ground(38, 170, 2.0 - 0.2 * d);
        break;
      case "spider":
        add({
          shape: "circle", skin, x: cx - 38, y: 230 - 38, w: 76, h: 76, ax: 0, ay: 130 + 20 * d,
          period: 3 - 0.3 * d, phase: rnd() * 6.28, hangFrom: 0,
        });
        break;
      case "bat":
        floating(26, 300 + rnd() * 300, 110, 70, 2.2);
        break;
      case "ghost":
        floating(42, 300 + rnd() * 300, 90, 60, 3.4);
        break;
      case "saw":
        floating(46, 450, 0, 150 + 20 * d, 2.6 - 0.3 * d);
        break;
      case "hammer":
        swing(380, 0.85, 2.6 - 0.2 * d, 46);
        break;
      case "blade":
        swing(430, 1.0, 3 - 0.3 * d, 56);
        break;
    }
    x += w + 520 + rnd() * 380 - 50 * d;
  }
  void pick;

  return {
    index,
    mapId: map.info.id,
    name: `${map.info.name} · ${index + 1}`,
    length,
    height: WORLD_H,
    spawn: { x: 220, y: GROUND_Y },
    checkpoints,
    finishX: length,
    solids,
    hazards,
    theme: map.info.theme,
  };
}