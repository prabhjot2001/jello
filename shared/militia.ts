export interface MilitiaSettings {
  map: string;
  kills: number; // kills needed to win
  minutes: number; // match length
}

export interface MilitiaMapInfo {
  id: string;
  name: string;
  emoji: string;
}

export interface MilitiaPlayerState {
  id: string;
  name: string;
  color: string;
  kills: number;
  deaths: number;
  hp: number;
  alive: boolean;
  respawnAt: number;
  spawn: number;
  ready: boolean;
}

export interface MilitiaCrate {
  id: number;
  weapon: string;
  taken: boolean;
  by: string | null;
}

export interface MilitiaState {
  phase: "lobby" | "countdown" | "play" | "over";
  settings: MilitiaSettings;
  maps: MilitiaMapInfo[];
  players: MilitiaPlayerState[];
  crates: MilitiaCrate[];
  startAt: number;
  endsAt: number;
  winnerId: string | null;
}

/** What each client broadcasts about its own body, ~20 times a second. */
export interface MilitiaSnap {
  x: number;
  y: number;
  vx: number;
  vy: number;
  aim: number;
  w: string;
  jet: number;
}

export interface MilitiaPeer extends MilitiaSnap {
  id: string;
}

export interface MilitiaFire {
  id: string;
  w: string;
  x: number;
  y: number;
  a: number;
  /** grenade throw power or 0 */
  p: number;
}

export interface MilitiaHit {
  victim: string;
  attacker: string;
  hp: number;
  dmg: number;
  killed: boolean;
  w: string;
}
