import type { Server } from "socket.io";
import type { ClientToServer, ServerToClient, RoomState } from "../../../shared/events.js";
import type {
  TankAim, TankPick, TankPose, TankSettings, TankShot, TanksState, TankTerrain,
} from "../../../shared/tanks.js";
import { FIELD_H, FIELD_W, Terrain } from "./tanksTerrain.js";
import { MAP_INFOS, mapById } from "./tanksMaps.js";
import { simulate } from "./tanksSim.js";
import { WEAPONS, WEAPON_INFOS, weaponById } from "./tanksWeapons.js";

type IO = Server<ClientToServer, ServerToClient>;

const COLORS = ["#FF8FB1", "#7FC8FF"];
const WIND_MAX = { off: 0, low: 4, normal: 8, high: 12 };
const BLAST = { small: 0.75, normal: 1, large: 1.35 };
const PICK_MS = 20_000;
const MOVE_STEP = 14;
const MOVES_PER_TURN = 4;

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, Number.isFinite(n) ? n : a));
const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

interface Seat {
  id: string;
  tank: string;
  score: number;
  arsenal: string[];
  used: string[];
  angle: number;
  power: number;
  x: number;
  y: number;
  tilt: number;
  moves: number;
}

export class TankGame {
  private phase: TanksState["phase"] = "garage";
  private mapId = MAP_INFOS[0].id;
  private settings: TankSettings = { turns: 10, wind: "normal", blast: "normal", kick: false, timer: 60 };
  private ready: Record<string, boolean> = {};
  private seats: Seat[] = [];
  private terrain: Terrain | null = null;
  private heights: number[] = [];
  private pool: string[] = [];
  private picker = 0;
  private first = 0;
  private current = 0;
  private turnNo = 0;
  private endsAt = 0;
  private selected: string | null = null;
  private wind = 0;
  private shotId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private io: IO, private room: RoomState) {}

  start() {
    this.seats = this.room.players.slice(0, 2).map((p, i) => ({
      id: p.id, tank: `tank${i + 1}`, score: 0, arsenal: [], used: [],
      angle: i === 0 ? 45 : 135, power: 60, x: 0, y: 0, tilt: 0, moves: MOVES_PER_TURN,
    }));
    this.seats.forEach((s) => (this.ready[s.id] = false));
    this.emitState();
  }

  destroy() {
    this.clearTimer();
  }

  /* ----- state ----- */

  publicState(): TanksState {
    const cur = this.seats[this.current];
    return {
      phase: this.phase,
      maps: MAP_INFOS,
      weapons: WEAPON_INFOS,
      garage: {
        map: this.mapId,
        settings: this.settings,
        tanks: Object.fromEntries(this.seats.map((s) => [s.id, s.tank])),
        ready: this.ready,
      },
      players: this.seats.map((s, i) => ({
        id: s.id,
        name: this.room.players.find((p) => p.id === s.id)?.name ?? "Player",
        seat: i, tank: s.tank, color: COLORS[i], score: s.score,
        arsenal: s.arsenal, used: s.used, angle: s.angle, power: s.power,
      })),
      poses: Object.fromEntries(this.seats.map((s) => [s.id, this.pose(s)])),
      shop: this.phase === "shop" ? { pool: this.pool, picker: this.seats[this.picker].id, endsAt: this.endsAt } : null,
      turn: {
        current: cur?.id ?? "",
        number: this.turnNo + 1,
        total: this.settings.turns * 2,
        endsAt: this.endsAt,
        selected: this.selected,
        movesLeft: cur?.moves ?? 0,
      },
      wind: this.wind,
      windMax: WIND_MAX[this.settings.wind],
    };
  }

  terrainPayload(): TankTerrain | null {
    if (!this.terrain) return null;
    return { w: FIELD_W, h: FIELD_H, heights: this.heights, ops: this.terrain.ops };
  }

  private pose(s: Seat): TankPose {
    return { x: s.x, y: s.y, tilt: s.tilt };
  }

  private seatOf(id: string) {
    return this.seats.findIndex((s) => s.id === id);
  }

  private emitState() {
    this.io.to(this.room.code).emit("tanks:state", this.publicState());
  }

  private armTimer(ms: number, fn: () => void) {
    this.clearTimer();
    this.timer = setTimeout(fn, ms);
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /* ----- garage ----- */

  pick(playerId: string, p: TankPick) {
    const i = this.seatOf(playerId);
    if (this.phase !== "garage" || i < 0) return;
    if (typeof p.tank === "string" && /^[a-z0-9-]{1,24}$/.test(p.tank)) this.seats[i].tank = p.tank;
    if (typeof p.map === "string" && MAP_INFOS.some((m) => m.id === p.map)) this.mapId = p.map;
    this.seats.forEach((s) => (this.ready[s.id] = false));
    this.emitState();
  }

  setSettings(playerId: string, p: Partial<TankSettings>) {
    if (this.phase !== "garage" || this.seatOf(playerId) < 0) return;
    const s = this.settings;
    if (p.turns !== undefined && [5, 8, 10].includes(p.turns)) s.turns = p.turns;
    if (p.wind && p.wind in WIND_MAX) s.wind = p.wind;
    if (p.blast && p.blast in BLAST) s.blast = p.blast;
    if (typeof p.kick === "boolean") s.kick = p.kick;
    if (p.timer !== undefined && [0, 30, 60, 90].includes(p.timer)) s.timer = p.timer;
    this.seats.forEach((x) => (this.ready[x.id] = false));
    this.emitState();
  }

  setReady(playerId: string, ready: boolean) {
    if (this.phase !== "garage" || this.seatOf(playerId) < 0) return;
    this.ready[playerId] = ready;
    this.emitState();
    if (this.seats.length === 2 && this.seats.every((s) => this.ready[s.id])) this.startShop();
  }

  /* ----- weapon shop: the players take turns picking from random weapons ----- */

  private startShop() {
    this.seats.forEach((s) => {
      s.arsenal = [];
      s.used = [];
      s.score = 0;
    });
    this.pool = shuffle(WEAPONS.map((w) => w.id)).slice(0, this.settings.turns * 2);
    this.first = Math.random() < 0.5 ? 0 : 1;
    this.picker = this.first;
    this.phase = "shop";
    this.armPick();
    this.emitState();
  }

  private armPick() {
    this.endsAt = Date.now() + PICK_MS;
    this.armTimer(PICK_MS, () => this.buy(this.seats[this.picker].id, this.pool[Math.floor(Math.random() * this.pool.length)]));
  }

  buy(playerId: string, weapon: string) {
    if (this.phase !== "shop" || this.seats[this.picker].id !== playerId || !this.pool.includes(weapon)) return;
    this.seats[this.picker].arsenal.push(weapon);
    this.pool = this.pool.filter((w) => w !== weapon);
    if (this.pool.length === 0) return this.startMatch();
    this.picker = 1 - this.picker;
    this.armPick();
    this.emitState();
  }

  /* ----- the match ----- */

  private startMatch() {
    const info = mapById(this.mapId);
    const built = info.build(Math.random);
    this.heights = built.heights;
    const terrain = new Terrain(built.heights);
    built.ops.forEach((op) => terrain.apply(op));
    this.terrain = terrain;

    const xs = [180 + Math.random() * 140, 1280 + Math.random() * 140];
    this.seats.forEach((s, i) => {
      s.x = Math.round(xs[i]);
      s.y = terrain.surfaceY(s.x, 0) - 1;
      s.moves = MOVES_PER_TURN;
      s.tilt = 0;
      this.settle(s);
    });

    this.turnNo = 0;
    this.current = this.first;
    this.wind = this.nextWind(0);
    this.selected = this.seats[this.current].arsenal[0] ?? null;
    this.phase = "play";
    this.armTurn();
    this.io.to(this.room.code).emit("tanks:terrain", this.terrainPayload()!);
    this.emitState();
  }

  private nextWind(prev: number) {
    const max = WIND_MAX[this.settings.wind];
    if (max === 0) return 0;
    return Math.round(clamp(prev + (Math.random() * 6 - 3), -max, max));
  }

  private armTurn() {
    const secs = this.settings.timer;
    this.endsAt = secs > 0 ? Date.now() + secs * 1000 : 0;
    if (secs > 0) this.armTimer(secs * 1000, () => this.autoFire());
    else this.clearTimer();
  }

  private autoFire() {
    const s = this.seats[this.current];
    const weapon = this.selected && s.arsenal.includes(this.selected) ? this.selected : s.arsenal[0];
    if (weapon) this.fire(s.id, weapon, s.angle, s.power);
  }

  /** Is the tank resting on something? Climbs out of small dirt piles and falls when the ground is gone. */
  private settle(s: Seat) {
    const t = this.terrain!;
    const buried = t.solid(s.x, s.y - 14);
    if (!buried) {
      let n = 0;
      while ((t.solid(s.x - 10, s.y) || t.solid(s.x, s.y) || t.solid(s.x + 10, s.y)) && n < 30) {
        s.y--;
        n++;
      }
      if (n >= 30) s.y += 30;
      while (s.y < FIELD_H - 1 && !t.solid(s.x - 10, s.y + 1) && !t.solid(s.x, s.y + 1) && !t.solid(s.x + 10, s.y + 1)) s.y++;
    }
    if (buried) {
      s.tilt = 0;
      return;
    }
    const yl = t.surfaceY(s.x - 16, s.y - 30);
    const yr = t.surfaceY(s.x + 16, s.y - 30);
    s.tilt = Math.round(clamp(Math.atan2(yr - yl, 32), -0.35, 0.35) * 100) / 100;
  }

  /* ----- turn actions ----- */

  /** The player is aiming. Returns what the other player should see. */
  aim(playerId: string, a: { angle: number; power: number }): TankAim | null {
    const i = this.seatOf(playerId);
    if (this.phase !== "play" || i !== this.current) return null;
    const s = this.seats[i];
    s.angle = clamp(Number(a?.angle), 0, 180);
    s.power = clamp(Number(a?.power), 5, 100);
    return { id: playerId, angle: s.angle, power: s.power };
  }

  select(playerId: string, weapon: string) {
    const i = this.seatOf(playerId);
    if (this.phase !== "play" || i !== this.current || !this.seats[i].arsenal.includes(weapon)) return;
    this.selected = weapon;
    this.emitState();
  }

  move(playerId: string, dir: number) {
    const i = this.seatOf(playerId);
    if (this.phase !== "play" || i !== this.current) return;
    const s = this.seats[i];
    const t = this.terrain!;
    if (s.moves <= 0) return;
    const sign = dir < 0 ? -1 : 1;
    const nx = clamp(s.x + sign * MOVE_STEP, 24, FIELD_W - 24);
    if (t.solid(nx, s.y - 18) || t.solid(nx + sign * 10, s.y - 18)) return; // a wall is in the way
    s.x = Math.round(nx);
    this.settle(s);
    s.moves--;
    this.emitState();
  }

  fire(playerId: string, weaponId: string, angle: number, power: number) {
    const si = this.seatOf(playerId);
    if (this.phase !== "play" || si !== this.current || !this.terrain) return;
    const seat = this.seats[si];
    const weapon = weaponById(weaponId);
    if (!weapon || !seat.arsenal.includes(weaponId)) return;

    this.clearTimer();
    seat.angle = clamp(angle, 0, 180);
    seat.power = clamp(power, 5, 100);
    this.phase = "shot";

    const res = simulate({
      terrain: this.terrain,
      tanks: this.seats.map((s) => ({ id: s.id, x: s.x, y: s.y })),
      shooter: si,
      weapon,
      angle: seat.angle,
      power: seat.power,
      wind: this.wind,
      gravity: mapById(this.mapId).info.gravity,
      blast: BLAST[this.settings.blast],
      rnd: Math.random,
    });

    seat.arsenal = seat.arsenal.filter((w) => w !== weaponId);
    seat.used.push(weaponId);
    res.delta.forEach((d, i) => (this.seats[i].score += d));
    res.scramble.forEach((i) => {
      this.seats[i].angle = 20 + Math.round(Math.random() * 140);
      this.seats[i].power = 25 + Math.round(Math.random() * 65);
    });

    // kickback pushes the shooter away from the direction it fired
    if (this.settings.kick) {
      const dir = seat.angle < 90 ? -1 : 1;
      for (let k = 0; k < Math.round(seat.power * 0.2); k++) {
        if (this.terrain.solid(seat.x + dir, seat.y - 8)) break;
        seat.x += dir;
      }
    }
    this.seats.forEach((s) => this.settle(s));

    const shot: TankShot = {
      id: ++this.shotId,
      startAt: Date.now() + 350,
      ticks: res.ticks,
      shooter: playerId,
      weapon: weaponId,
      angle: seat.angle,
      power: seat.power,
      tracks: res.tracks,
      events: res.events,
      after: {
        poses: Object.fromEntries(this.seats.map((s) => [s.id, this.pose(s)])),
        scores: Object.fromEntries(this.seats.map((s) => [s.id, s.score])),
        aims: Object.fromEntries(this.seats.map((s) => [s.id, { angle: s.angle, power: s.power }])),
      },
    };
    this.io.to(this.room.code).emit("tanks:shot", shot);
    this.emitState();
    this.armTimer(350 + (res.ticks / 60) * 1000 + 900, () => this.nextTurn());
  }

  private nextTurn() {
    this.turnNo++;
    if (this.turnNo >= this.settings.turns * 2) {
      this.phase = "over";
      this.clearTimer();
      this.emitState();
      return;
    }
    this.current = (this.first + this.turnNo) % 2;
    const s = this.seats[this.current];
    s.moves = MOVES_PER_TURN;
    this.wind = this.nextWind(this.wind);
    this.selected = s.arsenal[0] ?? null;
    this.phase = "play";
    this.armTurn();
    this.emitState();
  }

  /** Back to the garage for a rematch. */
  again() {
    if (this.phase !== "over") return;
    this.clearTimer();
    this.terrain = null;
    this.seats.forEach((s) => (this.ready[s.id] = false));
    this.phase = "garage";
    this.emitState();
  }
}

const games = new Map<string, TankGame>();

export function startTankGame(io: IO, room: RoomState) {
  games.get(room.code)?.destroy();
  const game = new TankGame(io, room);
  games.set(room.code, game);
  game.start();
}

export const getTankGame = (code: string) => games.get(code);

export function stopTankGame(code: string) {
  games.get(code)?.destroy();
  games.delete(code);
}
