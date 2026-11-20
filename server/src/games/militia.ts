import type { Server } from "socket.io";
import type { ClientToServer, ServerToClient, RoomState } from "../../../shared/events.js";
import type {
  MilitiaFire, MilitiaMapInfo, MilitiaPlayerState, MilitiaSettings, MilitiaSnap, MilitiaState,
} from "../../../shared/militia.js";

type IO = Server<ClientToServer, ServerToClient>;

/** Geometry lives in the client. The server only needs how many spawns and which weapon sits in each crate (same order as the client map). */
interface MapSpec extends MilitiaMapInfo {
  spawns: number;
  crates: string[];
}

export const MILITIA_MAPS: MapSpec[] = [
  { id: "alley", name: "Cat Alley", emoji: "🐟", spawns: 6, crates: ["shotgun", "smg", "rocket", "sniper", "grenade", "smg"] },
  { id: "roofs", name: "Rooftop Run", emoji: "🌆", spawns: 6, crates: ["sniper", "rocket", "shotgun", "smg", "grenade", "shotgun"] },
  { id: "cave", name: "Yarn Cave", emoji: "🧶", spawns: 6, crates: ["rocket", "shotgun", "smg", "sniper", "grenade", "smg"] },
  { id: "station", name: "Orbit Station", emoji: "🛰️", spawns: 6, crates: ["smg", "rocket", "sniper", "shotgun", "grenade", "rocket"] },
];

const COLORS = ["#FF8FB1", "#7FC8FF", "#FFD36B", "#9FE3C4", "#C9A7FF", "#FFA77F"];
const COUNTDOWN_MS = 4000;
const RESPAWN_MS = 3000;
const CRATE_RESPAWN_MS = 14_000;
const MAX_HP = 100;
const KILL_OPTIONS = [10, 15, 20, 30];
const MINUTE_OPTIONS = [3, 5, 8, 12];

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, Number.isFinite(n) ? n : a));
const finite = (n: unknown, fallback = 0) => (Number.isFinite(Number(n)) ? Number(n) : fallback);
const mapSpec = (id: string) => MILITIA_MAPS.find((m) => m.id === id) ?? MILITIA_MAPS[0];
const WEAPONS = new Set(["pistol", "smg", "shotgun", "sniper", "rocket", "grenade"]);

export class MilitiaGame {
  private phase: MilitiaState["phase"] = "lobby";
  private settings: MilitiaSettings = { map: "alley", kills: 15, minutes: 5 };
  private players: MilitiaPlayerState[] = [];
  private crates: MilitiaState["crates"] = [];
  private startAt = 0;
  private endsAt = 0;
  private winnerId: string | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private lastHit = new Map<string, number>();

  constructor(private io: IO, private room: RoomState) {}

  start() {
    this.players = this.room.players.map((p, i) => ({
      id: p.id,
      name: p.name,
      color: COLORS[i % COLORS.length],
      kills: 0,
      deaths: 0,
      hp: MAX_HP,
      alive: true,
      respawnAt: 0,
      spawn: i,
      ready: false,
    }));
    this.emitState();
  }

  destroy() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  publicState(): MilitiaState {
    return {
      phase: this.phase,
      settings: this.settings,
      maps: MILITIA_MAPS.map(({ id, name, emoji }) => ({ id, name, emoji })),
      players: this.players,
      crates: this.crates,
      startAt: this.startAt,
      endsAt: this.endsAt,
      winnerId: this.winnerId,
    };
  }

  private emitState() {
    this.io.to(this.room.code).emit("militia:state", this.publicState());
  }

  private later(ms: number, fn: () => void) {
    this.timers.push(setTimeout(fn, ms));
  }

  private player(id: string) {
    return this.players.find((p) => p.id === id);
  }

  setSettings(id: string, patch: Partial<MilitiaSettings>) {
    if (this.phase !== "lobby" || !this.player(id)) return;
    if (typeof patch.map === "string" && MILITIA_MAPS.some((m) => m.id === patch.map)) this.settings.map = patch.map;
    if (KILL_OPTIONS.includes(Number(patch.kills))) this.settings.kills = Number(patch.kills);
    if (MINUTE_OPTIONS.includes(Number(patch.minutes))) this.settings.minutes = Number(patch.minutes);
    this.players.forEach((p) => (p.ready = false));
    this.emitState();
  }

  setColor(id: string, color: string) {
    const p = this.player(id);
    if (!p || this.phase !== "lobby" || !COLORS.includes(color)) return;
    p.color = color;
    this.emitState();
  }

  setReady(id: string, ready: boolean) {
    const p = this.player(id);
    if (!p || this.phase !== "lobby") return;
    p.ready = ready;
    this.emitState();
    if (this.players.length >= 2 && this.players.every((x) => x.ready)) this.begin();
  }

  private begin() {
    const spec = mapSpec(this.settings.map);
    this.crates = spec.crates.map((weapon, id) => ({ id, weapon, taken: false, by: null }));
    this.players.forEach((p, i) => {
      p.kills = 0;
      p.deaths = 0;
      p.hp = MAX_HP;
      p.alive = true;
      p.spawn = i % spec.spawns;
    });
    this.winnerId = null;
    this.phase = "countdown";
    this.startAt = Date.now() + COUNTDOWN_MS;
    this.endsAt = this.startAt + this.settings.minutes * 60_000;
    this.emitState();
    this.later(COUNTDOWN_MS, () => {
      this.phase = "play";
      this.emitState();
    });
    this.later(COUNTDOWN_MS + this.settings.minutes * 60_000, () => this.finish());
  }

  relay(id: string, snap: MilitiaSnap) {
    const p = this.player(id);
    if (!p || !p.alive || this.phase === "lobby" || !snap) return;
    this.io.to(this.room.code).except(id).volatile.emit("militia:peer", {
      id,
      x: finite(snap.x),
      y: finite(snap.y),
      vx: finite(snap.vx),
      vy: finite(snap.vy),
      aim: finite(snap.aim),
      w: WEAPONS.has(snap.w) ? snap.w : "pistol",
      jet: clamp(finite(snap.jet), 0, 1),
    });
  }

  fire(id: string, f: Omit<MilitiaFire, "id">) {
    const p = this.player(id);
    if (!p || !p.alive || this.phase !== "play" || !f || !WEAPONS.has(f.w)) return;
    this.io.to(this.room.code).except(id).emit("militia:fire", {
      id,
      w: f.w,
      x: finite(f.x),
      y: finite(f.y),
      a: finite(f.a),
      p: clamp(finite(f.p), 0, 1),
    });
  }

  hit(attackerId: string, h: { victim: string; dmg: number; w: string }) {
    if (this.phase !== "play" || !h) return;
    const a = this.player(attackerId);
    const v = this.player(String(h.victim));
    if (!a || !v || a.id === v.id || !a.alive || !v.alive) return;
    const dmg = clamp(Math.round(finite(h.dmg)), 1, 100);
    // rate guard: ignore absurd bursts from one shooter
    const now = Date.now();
    const key = `${a.id}>${v.id}`;
    if (now - (this.lastHit.get(key) ?? 0) < 25) return;
    this.lastHit.set(key, now);

    v.hp = Math.max(0, v.hp - dmg);
    const killed = v.hp <= 0;
    if (killed) {
      v.alive = false;
      v.deaths += 1;
      v.respawnAt = now + RESPAWN_MS;
      a.kills += 1;
    }
    this.io.to(this.room.code).emit("militia:hit", {
      victim: v.id, attacker: a.id, hp: v.hp, dmg, killed, w: WEAPONS.has(h.w) ? h.w : "pistol",
    });
    if (killed) {
      this.emitState();
      if (a.kills >= this.settings.kills) {
        this.finish();
        return;
      }
      this.later(RESPAWN_MS, () => {
        if (this.phase !== "play") return;
        v.hp = MAX_HP;
        v.alive = true;
        v.spawn = Math.floor(Math.random() * mapSpec(this.settings.map).spawns);
        this.emitState();
      });
    }
  }

  pickup(id: string, crateId: number) {
    const p = this.player(id);
    const c = this.crates[crateId];
    if (!p || !c || !p.alive || c.taken || this.phase !== "play") return;
    c.taken = true;
    c.by = id;
    this.emitState();
    this.later(CRATE_RESPAWN_MS, () => {
      c.taken = false;
      c.by = null;
      this.emitState();
    });
  }

  private finish() {
    if (this.phase === "over") return;
    this.phase = "over";
    const sorted = [...this.players].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    this.winnerId = sorted[0] && (!sorted[1] || sorted[0].kills > sorted[1].kills) ? sorted[0].id : null;
    this.emitState();
  }

  again() {
    if (this.phase !== "over") return;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.phase = "lobby";
    this.players.forEach((p) => {
      p.ready = false;
      p.kills = 0;
      p.deaths = 0;
      p.hp = MAX_HP;
      p.alive = true;
    });
    this.winnerId = null;
    this.emitState();
  }
}

const games = new Map<string, MilitiaGame>();

export function startMilitiaGame(io: IO, room: RoomState) {
  games.get(room.code)?.destroy();
  const game = new MilitiaGame(io, room);
  games.set(room.code, game);
  game.start();
}

export const getMilitiaGame = (code: string) => games.get(code);

export function stopMilitiaGame(code: string) {
  games.get(code)?.destroy();
  games.delete(code);
}
