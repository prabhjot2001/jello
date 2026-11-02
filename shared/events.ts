import type {
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
import type { TootEvent, TootInput, TootSnapshot, TootState } from "./toot.js";

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
