import type { TankMapInfo, TankTheme, TerrainOp } from "../../../shared/tanks.js";
import { FIELD_H, FIELD_W } from "./tanksTerrain.js";

export interface MapDef {
  info: TankMapInfo;
  build: (rnd: () => number) => { heights: number[]; ops: TerrainOp[] };
}

const clampH = (y: number) => Math.round(Math.min(FIELD_H - 70, Math.max(150, y)));

function waves(rnd: () => number, base: number, comps: [number, number][]): number[] {
  const ph = comps.map(() => rnd() * Math.PI * 2);
  return Array.from({ length: FIELD_W }, (_, x) => {
    let y = base;
    comps.forEach(([amp, len], i) => (y += amp * Math.sin((x / len) * Math.PI * 2 + ph[i])));
    return clampH(y);
  });
}

const th = (
  skyTop: string, skyBottom: string, dirt: string, dirtDark: string, grass: string,
  far: string[], near: string[], stars = false
): TankTheme => ({ skyTop, skyBottom, dirt, dirtDark, grass, far, near, stars });

export const MAPS: MapDef[] = [
  {
    info: {
      id: "hills", name: "Green Hills", emoji: "🌄", tagline: "Rolling hills and open sky.", gravity: 1,
      theme: th("#8EC9FF", "#E3F5FF", "#7A5230", "#4E3219", "#5DBB63", ["☁️"], ["🌳", "🌼"]),
    },
    build: (rnd) => ({ heights: waves(rnd, 370, [[55, 760], [26, 320], [10, 130]]), ops: [] }),
  },
  {
    info: {
      id: "canyon", name: "Canyon", emoji: "🏜️", tagline: "Two cliffs and one very deep valley.", gravity: 1,
      theme: th("#FFD39B", "#FF9E80", "#B5643A", "#7A3A20", "#D98B4A", ["☁️", "🦅"], ["🌵"]),
    },
    build: (rnd) => {
      const base = waves(rnd, 250, [[14, 400], [8, 150]]);
      const heights = base.map((y, x) => {
        const d = Math.abs(x - 800) / 300;
        return Math.min(FIELD_H - 70, y + (d < 1 ? Math.round(240 * (1 - d * d)) : 0));
      });
      return { heights, ops: [] };
    },
  },
  {
    info: {
      id: "dunes", name: "Desert Dunes", emoji: "🐪", tagline: "Soft sand, hard aim.", gravity: 1,
      theme: th("#FFE9A8", "#FFC46B", "#E3B86A", "#B88A35", "#F1D18A", ["☀️"], ["🌵", "🐪"]),
    },
    build: (rnd) => ({ heights: waves(rnd, 400, [[45, 520], [22, 230], [8, 90]]), ops: [] }),
  },
  {
    info: {
      id: "peaks", name: "Snow Peaks", emoji: "🏔️", tagline: "Sharp ridges and cold wind.", gravity: 1,
      theme: th("#B7D8FF", "#EAF4FF", "#9AA7B8", "#68758A", "#FFFFFF", ["❄️", "☁️"], ["🌲"]),
    },
    build: (rnd) => {
      const p1 = rnd() * 6;
      const p2 = rnd() * 6;
      return {
        heights: Array.from({ length: FIELD_W }, (_, x) =>
          clampH(470 - 150 * Math.abs(Math.sin(x / 190 + p1)) - 65 * Math.abs(Math.sin(x / 70 + p2)))
        ),
        ops: [],
      };
    },
  },
  {
    info: {
      id: "volcano", name: "Volcano", emoji: "🌋", tagline: "A big grumpy mountain in the middle.", gravity: 1,
      theme: th("#5B1F2E", "#FF7A45", "#4A3A3A", "#241A1A", "#FF5E3A", ["🌋", "🔥"], ["🪨"]),
    },
    build: (rnd) => {
      const base = waves(rnd, 470, [[10, 300]]);
      const heights = base.map((y, x) => clampH(y - Math.max(0, 260 - Math.abs(x - 800) * 0.62)));
      return { heights, ops: [["c", 800, 222, 52, 0]] };
    },
  },
  {
    info: {
      id: "moon", name: "Moon Craters", emoji: "🌙", tagline: "Low gravity. Shots fly far and high.", gravity: 0.55,
      theme: th("#0B0F2A", "#2B2F5E", "#8E8E9E", "#55556A", "#B5B5C5", ["🌍", "⭐"], ["🛸"], true),
    },
    build: (rnd) => {
      const heights = waves(rnd, 440, [[16, 500], [8, 180]]);
      const ops: TerrainOp[] = [];
      for (let i = 0; i < 6; i++) {
        const x = Math.round(160 + rnd() * 1280);
        ops.push(["c", x, heights[x] + 6, Math.round(40 + rnd() * 45), 0]);
      }
      return { heights, ops };
    },
  },
  {
    info: {
      id: "islands", name: "Floating Islands", emoji: "🏝️", tagline: "Fall off and you are in trouble.", gravity: 1,
      theme: th("#9BE8FF", "#E6F7FF", "#9B6B43", "#6D4A2D", "#66C16D", ["☁️"], ["🌴"]),
    },
    build: (rnd) => {
      const ops: TerrainOp[] = [
        ["e", 260, 340, 170, 55],
        ["e", 1340, 340, 170, 55],
      ];
      for (let i = 0; i < 3; i++) {
        ops.push(["e", Math.round(560 + i * 240 + rnd() * 60), Math.round(240 + rnd() * 180), Math.round(90 + rnd() * 60), Math.round(30 + rnd() * 25)]);
      }
      return { heights: Array.from({ length: FIELD_W }, () => FIELD_H - 50), ops };
    },
  },
  {
    info: {
      id: "plains", name: "Flat Plains", emoji: "🟩", tagline: "No cover. Pure aiming.", gravity: 1,
      theme: th("#A8E6FF", "#F2FBFF", "#8B6B4A", "#5A432C", "#6CC070", ["☁️"], ["🌾"]),
    },
    build: (rnd) => ({ heights: waves(rnd, 430, [[10, 520], [5, 140]]), ops: [] }),
  },
  {
    info: {
      id: "candy", name: "Candy Hills", emoji: "🍭", tagline: "Pink, sweet and still explosive.", gravity: 1,
      theme: th("#FFC1E3", "#FFF0F7", "#E8A5C8", "#B9739B", "#FFFFFF", ["☁️", "🍭"], ["🧁", "🍬"]),
    },
    build: (rnd) => ({ heights: waves(rnd, 360, [[60, 640], [30, 270], [12, 110]]), ops: [] }),
  },
];

export const MAP_INFOS = MAPS.map((m) => m.info);
export const mapById = (id: string) => MAPS.find((m) => m.info.id === id) ?? MAPS[0];
