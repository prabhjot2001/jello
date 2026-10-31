export type KartDifficulty = "chill" | "normal" | "hard" | "insane";
export type KartLength = "short" | "normal" | "long";

export interface KartSettings {
  difficulty: KartDifficulty;
  length: KartLength;
  items: boolean;
}

export interface KartPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  ready: boolean;
}

export interface KartResult {
  id: string;
  name: string;
  /** final time after the coin bonus */
  timeMs: number | null;
  /** time on the clock before the bonus */
  rawMs: number | null;
  coins: number;
}

export interface KartState {
  phase: "garage" | "countdown" | "race" | "final";
  players: KartPlayer[];
  settings: KartSettings;
  seed: number;
  trackLength: number;
  startAt: number;
  winnerId: string | null;
  results: KartResult[];
}

/** t = synced server time, x = distance, y = height, c = crashes, k = coins, f = flags (1 duck, 2 boost, 4 shield) */
export interface KartSnapshot {
  t: number;
  x: number;
  y: number;
  c: number;
  k: number;
  f: number;
}

export interface KartPeer extends KartSnapshot {
  id: string;
}

export interface KartAttack {
  kind: "banana";
  x: number;
}