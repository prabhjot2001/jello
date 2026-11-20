import type {
  MovieChat,
  MovieEvent,
  MovieMode,
  MovieSettings,
  MovieState,
} from "./movie.js";
import type {
  KartAttack,
  KartPeer,
  KartSettings,
  KartSnapshot,
  KartState,
} from "./kart.js";
import type { TootCustomMap, TootEvent, TootInput, TootPick, TootSnapshot, TootState } from "./toot.js";
import type { MilitiaFire, MilitiaHit, MilitiaPeer, MilitiaSettings, MilitiaSnap, MilitiaState } from "./militia.js";
import type { TankAim, TankPick, TankSettings, TankShot, TanksState, TankTerrain } from "./tanks.js";

export interface Player {
  id: string;
  name: string;
  ready: boolean;
}

export interface RoomState {
  code: string;
  players: Player[];
  gameId: string | null;
  mode: MovieMode;
  settings: MovieSettings;
  phase: "lobby" | "playing";
  limits: { min: number; max: number };
}

export type JoinAck =
  | { ok: true; state: RoomState; you: string }
  | { ok: false; error: string };

export interface ClientToServer {
  "room:create": (
    p: { name: string },
    ack: (r: { ok: true; code: string }) => void,
  ) => void;
  "room:join": (
    p: { code: string; name: string },
    ack: (r: JoinAck) => void,
  ) => void;
  "room:leave": () => void;
  "room:ready": (ready: boolean) => void;
  "room:select-game": (gameId: string) => void;
  "room:set-mode": (mode: MovieMode) => void;
  "room:set-settings": (patch: Partial<MovieSettings>) => void;
  "room:start": () => void;
  "room:back": () => void;
  "time:sync": (ack: (serverTime: number) => void) => void;
    "toot:pick": (p: TootPick) => void;
  "toot:ready": (ready: boolean) => void;
  "toot:right": () => void;
  "toot:reset": () => void;
  "toot:custom": (m: TootCustomMap) => void;
  "militia:request-state": () => void;
  "militia:settings": (patch: Partial<MilitiaSettings>) => void;
  "militia:color": (color: string) => void;
  "militia:ready": (ready: boolean) => void;
  "militia:update": (snap: MilitiaSnap) => void;
  "militia:fire": (f: Omit<MilitiaFire, "id">) => void;
  "militia:hit": (h: { victim: string; dmg: number; w: string }) => void;
  "militia:pickup": (crateId: number) => void;
  "militia:again": () => void;
  "movie:history": (ids: string[]) => void;
  "tanks:request-state": () => void;
  "tanks:pick": (p: TankPick) => void;
  "tanks:settings": (p: Partial<TankSettings>) => void;
  "tanks:ready": (ready: boolean) => void;
  "tanks:buy": (weapon: string) => void;
  "tanks:select": (weapon: string) => void;
  "tanks:move": (dir: number) => void;
  "tanks:aim": (a: { angle: number; power: number }) => void;
  "tanks:fire": (f: { weapon: string; angle: number; power: number }) => void;
  "tanks:again": () => void;

  "movie:request-state": () => void;
  "movie:guess": (text: string) => void;
  "movie:skip": () => void;

  "kart:request-state": () => void;
  "kart:customize": (p: { avatar: string; color: string }) => void;
  "kart:settings": (patch: Partial<KartSettings>) => void;
  "kart:ready": (ready: boolean) => void;
  "kart:update": (snap: KartSnapshot) => void;
  "kart:finish": (p: { t: number; coins: number }) => void;
  "kart:attack": (a: KartAttack) => void;
  "kart:again": () => void;

    "toot:request-state": () => void;
  "toot:input": (i: TootInput) => void;
  "toot:next": () => void;
  "toot:again": () => void;
}

export interface ServerToClient {
  "militia:state": (s: MilitiaState) => void;
  "militia:peer": (p: MilitiaPeer) => void;
  "militia:fire": (f: MilitiaFire) => void;
  "militia:hit": (h: MilitiaHit) => void;

  "movie:chat": (m: MovieChat) => void;
  "tanks:state": (s: TanksState) => void;
  "tanks:terrain": (t: TankTerrain) => void;
  "tanks:shot": (s: TankShot) => void;
  "tanks:aim": (a: TankAim) => void;

  "room:state": (state: RoomState) => void;
  "movie:state": (state: MovieState) => void;
  "movie:event": (event: MovieEvent) => void;
  "kart:state": (state: KartState) => void;
  "kart:peer": (peer: KartPeer) => void;
  "kart:attack": (a: KartAttack) => void;

    "toot:state": (state: TootState) => void;
  "toot:snap": (snap: TootSnapshot) => void;
  "toot:event": (event: TootEvent) => void;
}
