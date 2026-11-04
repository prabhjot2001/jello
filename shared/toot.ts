export interface TootRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TootSkin =
  | "spikes" | "poop" | "thorns" | "fire"
  | "saw" | "roach" | "dog" | "dino" | "spider" | "bat" | "ghost" | "chainsaw"
  | "hammer" | "blade";

/**
 * A hazard is a rectangle (floor strips) or a circle (radius = w / 2).
 * Slide motion: the center moves by (ax, ay) * sin(...).
 * Swing motion (pendulum): the tip hangs from a pivot and swings by +-amp radians.
 */
export interface TootHazard {
  id: number;
  shape: "rect" | "circle";
  skin: TootSkin;
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
  period: number;
  phase: number;
  swing?: { px: number; py: number; len: number; amp: number };
  /** spiders hang on a thread from this y */
  hangFrom?: number;
}

export interface TootTheme {
  skyTop: string;
  skyBottom: string;
  rock: string;
  rockEdge: string;
  /** emoji for the slow background layer and the faster one in front of it */
  far: string[];
  near: string[];
}

export interface TootMapInfo {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  hazards: string;
  theme: TootTheme;
}

export interface TootVehicleInfo {
  id: string;
  name: string;
  emoji: string;
  color: string;
  w: number;
  h: number;
  /** thrust multiplier */
  power: number;
  /** stability multiplier: higher means the vehicle tilts less */
  control: number;
  premium: boolean;
  unlockStars: number;
  wheels: boolean;
  propeller: boolean;
}

export interface TootLevel {
  index: number;
  mapId: string;
  name: string;
  length: number;
  height: number;
  /** spawn.y is the ground the vehicle stands on */
  spawn: { x: number; y: number };
  checkpoints: { x: number; y: number }[];
  finishX: number;
  solids: TootRect[];
  hazards: TootHazard[];
  theme: TootTheme;
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

export interface TootGarage {
  map: string;
  vehicle: string;
  avatars: Record<string, string>;
  ready: Record<string, boolean>;
}

export interface TootPick {
  avatar?: string;
  map?: string;
  vehicle?: string;
}

export interface TootState {
  phase: "garage" | "countdown" | "play" | "clear" | "final";
  maps: TootMapInfo[];
  vehicles: TootVehicleInfo[];
  garage: TootGarage;
  vehicle: TootVehicleInfo;
  levelIndex: number;
  levelCount: number;
  level: TootLevel | null;
  players: TootPlayer[];
  startAt: number;
  stats: TootCounts;
  totals: TootCounts | null;
  /** server time when "Straighten" can be used again */
  rightReadyAt: number;
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
  | { kind: "respawn" }
  | { kind: "stuck" }
  | { kind: "right"; name: string }
  | { kind: "vote"; name: string; votes: number; needed: number }
  | { kind: "reset"; name: string };