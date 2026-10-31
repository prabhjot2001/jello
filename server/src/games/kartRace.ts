import type { Server } from "socket.io";
import type { ClientToServer, ServerToClient, RoomState } from "../../../shared/events.js";
import type {
  KartAttack, KartPeer, KartResult, KartSettings, KartSnapshot, KartState,
} from "../../../shared/kart.js";

type IO = Server<ClientToServer, ServerToClient>;

const LENGTHS: Record<KartSettings["length"], number> = {
  short: 10_000,
  normal: 14_000,
  long: 20_000,
};
const DIFFICULTIES: KartSettings["difficulty"][] = ["chill", "normal", "hard", "insane"];
const LENGTH_KEYS: KartSettings["length"][] = ["short", "normal", "long"];

const COUNTDOWN_MS = 4000;
const COIN_BONUS_MS = 100; // each coin takes 0.1s off the final time
const MAX_COINS = 150;
const FINISH_GRACE_MS = 3000; // the other player may still win thanks to coins
const RACE_TIMEOUT_MS = 150_000;
const DEFAULT_AVATARS = ["troll", "doge"];
const DEFAULT_COLORS = ["#FFB5C8", "#9FE3C4"];

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export class KartGame {
  private phase: KartState["phase"] = "garage";
  private settings: KartSettings = { difficulty: "normal", length: "normal", items: true };
  private seed = 0;
  private startAt = 0;
  private winnerId: string | null = null;
  private results: KartResult[] = [];
  private cfg = new Map<string, { avatar: string; color: string; ready: boolean }>();
  private finishT = new Map<string, { raw: number; coins: number; final: number }>();
  private lastX = new Map<string, number>();
  private lastK = new Map<string, number>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private io: IO, private room: RoomState) {}

  start() {
    this.room.players.forEach((p, i) =>
      this.cfg.set(p.id, {
        avatar: DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
        color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        ready: false,
      })
    );
    this.emitState();
  }

  destroy() {
    this.clearTimers();
  }

  publicState(): KartState {
    return {
      phase: this.phase,
      players: this.room.players.map((p) => {
        const c = this.cfg.get(p.id) ?? { avatar: "troll", color: "#FFB5C8", ready: false };
        return { id: p.id, name: p.name, avatar: c.avatar, color: c.color, ready: c.ready };
      }),
      settings: { ...this.settings },
      seed: this.seed,
      trackLength: LENGTHS[this.settings.length],
      startAt: this.startAt,
      winnerId: this.winnerId,
      results: this.results,
    };
  }

  /* ----- garage ----- */

  customize(playerId: string, avatar: string, color: string) {
    const c = this.cfg.get(playerId);
    if (this.phase !== "garage" || !c) return;
    if (/^[a-z0-9-]{1,24}$/.test(String(avatar))) c.avatar = avatar;
    if (/^#[0-9a-fA-F]{6}$/.test(String(color))) c.color = color;
    c.ready = false;
    this.emitState();
  }

  setSettings(patch: Partial<KartSettings>) {
    if (this.phase !== "garage") return;
    if (patch.difficulty && DIFFICULTIES.includes(patch.difficulty)) this.settings.difficulty = patch.difficulty;
    if (patch.length && LENGTH_KEYS.includes(patch.length)) this.settings.length = patch.length;
    if (typeof patch.items === "boolean") this.settings.items = patch.items;
    this.cfg.forEach((c) => (c.ready = false));
    this.emitState();
  }

  setReady(playerId: string, ready: boolean) {
    const c = this.cfg.get(playerId);
    if (this.phase !== "garage" || !c) return;
    c.ready = ready;
    this.emitState();
    const everyoneReady =
      this.room.players.length === 2 && this.room.players.every((p) => this.cfg.get(p.id)?.ready);
    if (everyoneReady) this.beginCountdown();
  }

  /* ----- race ----- */

  private beginCountdown() {
    this.clearTimers();
    this.phase = "countdown";
    this.seed = Math.floor(Math.random() * 2 ** 31);
    this.startAt = Date.now() + COUNTDOWN_MS;
    this.winnerId = null;
    this.results = [];
    this.finishT.clear();
    this.lastX.clear();
    this.lastK.clear();
    this.emitState();
    this.later(COUNTDOWN_MS, () => this.beginRace());
  }

  private beginRace() {
    this.phase = "race";
    this.emitState();
    this.later(RACE_TIMEOUT_MS, () => this.finalize());
  }

  /** Validates a position update and returns it for relaying to the other player. */
  snapshot(playerId: string, s: KartSnapshot): KartPeer | null {
    if (this.phase !== "race" && this.phase !== "countdown") return null;
    const x = num(s?.x, 0, LENGTHS[this.settings.length] + 600, 0);
    const k = Math.round(num(s?.k, 0, MAX_COINS, 0));
    this.lastX.set(playerId, x);
    this.lastK.set(playerId, k);
    return {
      id: playerId,
      t: num(s?.t, 0, Number.MAX_SAFE_INTEGER, Date.now()),
      x,
      y: num(s?.y, 0, 400, 0),
      c: Math.round(num(s?.c, 0, 999, 0)),
      k,
      f: Math.round(num(s?.f, 0, 7, 0)),
    };
  }

  /** Validates an item attack (banana trap) before it is relayed to the other player. */
  attack(_playerId: string, a: KartAttack): KartAttack | null {
    if (this.phase !== "race" || a?.kind !== "banana") return null;
    return { kind: "banana", x: num(a.x, 0, LENGTHS[this.settings.length] + 600, 0) };
  }

  finish(playerId: string, p: { t: number; coins: number }) {
    if (this.phase !== "race" || this.finishT.has(playerId)) return;
    const elapsed = Date.now() - this.startAt;
    // trust the client's own measurement, but keep it near what the server saw
    const raw = Math.round(num(p?.t, Math.max(0, elapsed - 2000), elapsed + 200, elapsed));
    const coins = Math.round(num(p?.coins, 0, MAX_COINS, 0));
    this.finishT.set(playerId, { raw, coins, final: raw - coins * COIN_BONUS_MS });
    if (this.finishT.size >= this.room.players.length) return this.finalize();
    if (this.finishT.size === 1) this.later(FINISH_GRACE_MS, () => this.finalize());
  }

  private finalize() {
    if (this.phase !== "race") return;
    this.clearTimers();
    const rows: KartResult[] = this.room.players.map((p) => {
      const f = this.finishT.get(p.id);
      return {
        id: p.id,
        name: p.name,
        timeMs: f?.final ?? null,
        rawMs: f?.raw ?? null,
        coins: f?.coins ?? this.lastK.get(p.id) ?? 0,
      };
    });
    rows.sort((a, b) => {
      if (a.timeMs !== null && b.timeMs !== null) return a.timeMs - b.timeMs;
      if (a.timeMs !== null) return -1;
      if (b.timeMs !== null) return 1;
      return (this.lastX.get(b.id) ?? 0) - (this.lastX.get(a.id) ?? 0);
    });
    this.results = rows;
    this.winnerId = rows[0]?.id ?? null;
    this.phase = "final";
    this.emitState();
  }

  again() {
    if (this.phase !== "final") return;
    this.clearTimers();
    this.phase = "garage";
    this.winnerId = null;
    this.results = [];
    this.cfg.forEach((c) => (c.ready = false));
    this.emitState();
  }

  /* ----- internals ----- */

  private emitState() {
    this.io.to(this.room.code).emit("kart:state", this.publicState());
  }

  private later(ms: number, fn: () => void) {
    this.timers.push(setTimeout(fn, ms));
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}

const games = new Map<string, KartGame>();

export function startKartGame(io: IO, room: RoomState) {
  games.get(room.code)?.destroy();
  const game = new KartGame(io, room);
  games.set(room.code, game);
  game.start();
}

export const getKartGame = (code: string) => games.get(code);

export function stopKartGame(code: string) {
  games.get(code)?.destroy();
  games.delete(code);
}