export interface TootRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Spikes are a static strip. A saw is a circle (x, y, w, h is its bounding box) that can move up and down. */
export interface TootHazard {
  id: number;
  kind: "spikes" | "saw";
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
  period: number;
  phase: number;
}

export interface TootLevel {
  index: number;
  name: string;
  length: number;
  height: number;
  spawn: { x: number; y: number };
  checkpoints: { x: number; y: number }[];
  finishX: number;
  solids: TootRect[];
  hazards: TootHazard[];
}

export interface TootPlayer {
  id: string;
  name: string;
  slot: number;
  avatar: string;
  color: string;
}

export interface TootCounts {
  deaths: number;
  blames: Record<string, number>;
  farts: Record<string, number>;
  timeMs: number;
}

export interface TootState {
  phase: "countdown" | "play" | "clear" | "final";
  levelIndex: number;
  levelCount: number;
  level: TootLevel;
  players: TootPlayer[];
  startAt: number;
  stats: TootCounts;
  totals: TootCounts | null;
}

export interface TootInput {
  aim: number;
  fart: boolean;
}

/** aim in radians, gas 0..100, p = current thrust power 0..1 */
export interface TootPlayerSnap {
  aim: number;
  gas: number;
  p: number;
}

export interface TootSnapshot {
  t: number;
  gt: number;
  x: number;
  y: number;
  a: number;
  dead: boolean;
  cp: number;
  ps: TootPlayerSnap[];
}

export type TootEvent =
  | { kind: "fail"; reason: "capsize" | "hazard" | "fell"; blameId: string | null; name: string }
  | { kind: "checkpoint"; index: number }
  | { kind: "respawn" };