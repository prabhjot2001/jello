import type { TootHazard, TootLevel, TootRect } from "../../../shared/toot.js";

export const LEVEL_COUNT = 3;
const NAMES = ["Stinky Cave", "Gassy Gorge", "Toxic Tunnels"];
export const WORLD_H = 900;
const SPAWN_Y = WORLD_H - 13 - 4;

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds a level from its index. The same index always gives the same course. */
export function buildLevel(index: number): TootLevel {
  const rnd = mulberry32(4242 + index * 7919);
  const d = index; // 0, 1, 2: higher is harder
  const length = 7000 + index * 1500;

  const solids: TootRect[] = [
    { x: -400, y: -200, w: length + 1200, h: 200 }, // ceiling
    { x: -400, y: WORLD_H, w: length + 1200, h: 200 }, // floor
    { x: -400, y: -200, w: 400, h: WORLD_H + 400 }, // left wall
    { x: length + 400, y: -200, w: 400, h: WORLD_H + 400 }, // right wall
  ];
  const hazards: TootHazard[] = [];
  const checkpoints = [1, 2].map((k) => ({ x: Math.round((length * k) / 3), y: SPAWN_Y }));

  // keep the start, checkpoints and finish free of obstacles
  const zones = [0, ...checkpoints.map((c) => c.x), length];
  const blocked = (x: number, w: number) => zones.some((z) => x < z + 500 && x + w > z - 500);

  const addHazard = (
    kind: "spikes" | "saw", x: number, y: number, w: number, h: number,
    ay = 0, period = 1, phase = 0
  ) => hazards.push({ id: hazards.length, kind, x, y, w, h, ax: 0, ay, period, phase });

  let x = 1100;
  while (x < length - 700) {
    const kind = Math.floor(rnd() * 6);
    const width = [100, 100, 100, 360, 100, 240][kind];
    if (blocked(x, width)) {
      x += 200;
      continue;
    }

    switch (kind) {
      case 0: {
        // pillar from the floor
        const h = 200 + rnd() * (200 + 60 * d);
        solids.push({ x, y: WORLD_H - h, w: 100, h });
        break;
      }
      case 1: {
        // pillar from the ceiling
        const h = 200 + rnd() * (200 + 60 * d);
        solids.push({ x, y: 0, w: 100, h });
        break;
      }
      case 2: {
        // narrow gate: you must pass through the gap
        const gap = 360 - 30 * d;
        const cy = 250 + rnd() * 400;
        const botY = cy + gap / 2;
        solids.push({ x, y: 0, w: 90, h: cy - gap / 2 });
        solids.push({ x, y: botY, w: 90, h: WORLD_H - botY });
        break;
      }
      case 3: {
        addHazard("spikes", x, WORLD_H - 30, 360, 30);
        if (d >= 1 && rnd() < 0.5) addHazard("spikes", x, 0, 360, 30);
        break;
      }
      case 4: {
        // saw moving up and down in the middle
        addHazard("saw", x, 450 - 46, 92, 92, 150 + 20 * d, 2.6 - 0.3 * d, rnd() * 6.28);
        break;
      }
      default: {
        // floating island
        solids.push({ x, y: 300 + rnd() * 350, w: 240, h: 34 });
      }
    }
    x += width + 400 + rnd() * 350 - 50 * d;
  }

  return {
    index,
    name: NAMES[index] ?? `Level ${index + 1}`,
    length,
    height: WORLD_H,
    spawn: { x: 220, y: SPAWN_Y },
    checkpoints,
    finishX: length,
    solids,
    hazards,
  };
}