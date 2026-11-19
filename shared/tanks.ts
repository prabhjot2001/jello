/** [type, a, b, c, d]. c = carve circle (x, y, r), a = add circle, r = carve rect (x, y, w, h), R = add rect, e = add ellipse (x, y, rx, ry), E = carve ellipse */
export type TerrainOp = [string, number, number, number, number];

export interface TankTheme {
  skyTop: string;
  skyBottom: string;
  dirt: string;
  dirtDark: string;
  grass: string;
  far: string[];
  near: string[];
  stars: boolean;
}

export interface TankMapInfo {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  gravity: number;
  theme: TankTheme;
}

export interface TankWeaponInfo {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  /** 1 to 5 */
  power: number;
}

export interface TankSettings {
  turns: number;
  wind: "off" | "low" | "normal" | "high";
  blast: "small" | "normal" | "large";
  kick: boolean;
  /** seconds per turn, 0 = no timer */
  timer: number;
}

export interface TankTerrain {
  w: number;
  h: number;
  heights: number[];
  ops: TerrainOp[];
}

export interface TankPose {
  x: number;
  y: number;
  tilt: number;
}

export interface TankPlayer {
  id: string;
  name: string;
  seat: number;
  tank: string;
  color: string;
  score: number;
  arsenal: string[];
  used: string[];
  angle: number;
  power: number;
}

export interface TanksState {
  phase: "garage" | "shop" | "play" | "shot" | "over";
  maps: TankMapInfo[];
  weapons: TankWeaponInfo[];
  garage: { map: string; settings: TankSettings; tanks: Record<string, string>; ready: Record<string, boolean> };
  players: TankPlayer[];
  poses: Record<string, TankPose>;
  shop: { pool: string[]; picker: string; endsAt: number } | null;
  turn: { current: string; number: number; total: number; endsAt: number; selected: string | null; movesLeft: number };
  wind: number;
  windMax: number;
}

export interface TankTrack {
  t0: number;
  /** x0, y0, x1, y1, ... one point per tick (60 per second) */
  pts: number[];
  fx: string;
}

export interface TankEvent {
  t: number;
  x: number;
  y: number;
  r: number;
  fx: string;
  ops?: TerrainOp[];
  /** score popups by tank id */
  pts?: Record<string, number>;
}

export interface TankShot {
  id: number;
  /** server time when playback starts */
  startAt: number;
  ticks: number;
  shooter: string;
  weapon: string;
  angle: number;
  power: number;
  tracks: TankTrack[];
  events: TankEvent[];
  after: {
    poses: Record<string, TankPose>;
    scores: Record<string, number>;
    aims: Record<string, { angle: number; power: number }>;
  };
}

export interface TankPick {
  tank?: string;
  map?: string;
}

export interface TankAim {
  id: string;
  angle: number;
  power: number;
}
