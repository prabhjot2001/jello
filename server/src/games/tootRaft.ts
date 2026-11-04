import Matter from "matter-js";
import type { Server } from "socket.io";
import type { ClientToServer, ServerToClient, RoomState } from "../../../shared/events.js";
import type {
  TootCounts, TootEvent, TootGarage, TootHazard, TootInput, TootLevel, TootPick,
  TootPlayer, TootSnapshot, TootState,
} from "../../../shared/toot.js";
import { buildLevel, LEVEL_COUNT } from "./tootLevels.js";
import { MAP_INFOS } from "./tootMaps.js";
import { VEHICLES, vehicleById } from "./tootVehicles.js";

type IO = Server<ClientToServer, ServerToClient>;
const { Engine, Bodies, Body, Composite } = Matter;

/** The feel of the game. Tweak these first if it feels too twitchy or too heavy. */
const TUNE = {
  gravityScale: 0.001,
  thrustTotal: 2.4, // thrust of all players at full power, in vehicle weights (more players = less each)
  frictionAir: 0.035,
  inertiaMul: 1.5, // higher = the vehicle tilts more slowly
  angDamp: 0.012, // extra spin damping per step, scaled by the vehicle's control
  aimMax: 1.0, // radians, keep in sync with the client
  gasUse: 45, // gas per second at full power
  gasRegen: 28,
  capsizeRad: 1.75,
  stuckMs: 7000, // no progress for this long: show a hint
  autoResetMs: 30000, // no progress for this long: back to the checkpoint
  rightCooldownMs: 6000,
};

const STEP_MS = 1000 / 60;
const STEP_S = STEP_MS / 1000;
const SNAP_EVERY = 3; // 20 snapshots per second
const COUNTDOWN_MS = 4000;
const RESPAWN_MS = 1500;
const VOTE_MS = 8000;
const AVATARS = ["troll", "doge", "cry-cat", "loser", "cat5", "cat6"];
const COLORS = ["#FFB5C8", "#9FE3C4", "#FFE08A", "#9AD1FF"];

const slotX = (i: number, n: number, w: number) => (n === 1 ? 0 : -w * 0.34 + w * 0.68 * (i / (n - 1)));
const emptyCounts = (): TootCounts => ({ deaths: 0, blames: {}, farts: {}, timeMs: 0 });

interface Slot {
  id: string;
  aim: number;
  wantFart: boolean;
  power: number;
  gas: number;
  locked: boolean;
  wasFarting: boolean;
  /** recent contribution to the vehicle's tilt, used to decide who gets the blame */
  ema: number;
}

function hazardCenter(h: TootHazard, gt: number) {
  const s = Math.sin((2 * Math.PI * gt) / h.period + h.phase);
  if (h.swing) {
    const a = h.swing.amp * s;
    return { x: h.swing.px + h.swing.len * Math.sin(a), y: h.swing.py + h.swing.len * Math.cos(a) };
  }
  return { x: h.x + h.w / 2 + h.ax * s, y: h.y + h.h / 2 + h.ay * s };
}

function hazardHitsRaft(h: TootHazard, gt: number, raft: Matter.Body, rw: number, rh: number): boolean {
  const c = hazardCenter(h, gt);
  const cos = Math.cos(raft.angle);
  const sin = Math.sin(raft.angle);

  if (h.shape === "circle") {
    const dx = c.x - raft.position.x;
    const dy = c.y - raft.position.y;
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    const px = Math.max(-rw / 2, Math.min(rw / 2, lx));
    const py = Math.max(-rh / 2, Math.min(rh / 2, ly));
    const r = h.w / 2 - 4;
    return (lx - px) ** 2 + (ly - py) ** 2 <= r * r;
  }

  // strips: test points along the vehicle's edges against the rectangle
  const left = c.x - h.w / 2 + 4;
  const right = c.x + h.w / 2 - 4;
  const top = c.y - h.h / 2 + 4;
  const bottom = c.y + h.h / 2 - 4;
  for (let i = 0; i <= 10; i++) {
    const lx = -rw / 2 + (rw * i) / 10;
    for (const ly of [-rh / 2, rh / 2]) {
      const wx = raft.position.x + lx * cos - ly * sin;
      const wy = raft.position.y + lx * sin + ly * cos;
      if (wx > left && wx < right && wy > top && wy < bottom) return true;
    }
  }
  return false;
}

export class TootGame {
  private engine!: Matter.Engine;
  private raft!: Matter.Body;
  private level: TootLevel | null = null;
  private garage: TootGarage = { map: "sewer", vehicle: "poop", avatars: {}, ready: {} };
  private rw = 220;
  private rh = 28;
  private power = 1;
  private control = 1;
  private levelIndex = 0;
  private phase: TootState["phase"] = "garage";
  private startAt = 0;
  private playStart = 0;
  private gt = 0;
  private slots: Slot[] = [];
  private cp = -1; // last checkpoint reached, -1 = the start
  private deadUntil = 0;
  private capsizeT = 0;
  private rightReadyAt = 0;
  private resetVotes = new Map<string, number>();
  private progX = 0;
  private progAt = 0;
  private stuckSent = false;
  private stats = emptyCounts();
  private totals = emptyCounts();
  private loop: ReturnType<typeof setInterval> | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private last = 0;
  private acc = 0;
  private ticks = 0;

  constructor(private io: IO, private room: RoomState) {}

  start() {
    this.slots = this.room.players.map((p) => ({
      id: p.id, aim: 0, wantFart: false, power: 0, gas: 100, locked: false, wasFarting: false, ema: 0,
    }));
    this.garage = {
      map: MAP_INFOS[0].id,
      vehicle: VEHICLES[0].id,
      avatars: Object.fromEntries(this.room.players.map((p, i) => [p.id, AVATARS[i % AVATARS.length]])),
      ready: Object.fromEntries(this.room.players.map((p) => [p.id, false])),
    };
    this.phase = "garage";
    this.loop = setInterval(this.tick, 16);
    this.emitState();
  }

  destroy() {
    if (this.loop) clearInterval(this.loop);
    this.loop = null;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  /* ----- garage ----- */

  pick(playerId: string, p: TootPick) {
    if (this.phase !== "garage" || !this.slots.some((s) => s.id === playerId)) return;
    let changed = false;
    if (typeof p.avatar === "string" && /^[a-z0-9-]{1,24}$/.test(p.avatar)) {
      this.garage.avatars[playerId] = p.avatar;
    }
    if (typeof p.map === "string" && p.map !== this.garage.map && MAP_INFOS.some((m) => m.id === p.map)) {
      this.garage.map = p.map;
      changed = true;
    }
    if (typeof p.vehicle === "string" && p.vehicle !== this.garage.vehicle && VEHICLES.some((v) => v.id === p.vehicle)) {
      this.garage.vehicle = p.vehicle;
      changed = true;
    }
    // a new map or vehicle needs everyone to confirm again
    if (changed) for (const id of Object.keys(this.garage.ready)) this.garage.ready[id] = false;
    this.emitState();
  }

  setReady(playerId: string, ready: boolean) {
    if (this.phase !== "garage" || !(playerId in this.garage.ready)) return;
    this.garage.ready[playerId] = ready;
    this.emitState();
    if (this.slots.length > 0 && this.slots.every((s) => this.garage.ready[s.id])) {
      this.totals = emptyCounts();
      this.loadLevel(0);
      this.begin();
    }
  }

  /* ----- public actions ----- */

  setInput(playerId: string, input: TootInput) {
    const s = this.slots.find((x) => x.id === playerId);
    if (!s) return;
    const aim = Number(input?.aim);
    s.aim = Number.isFinite(aim) ? Math.max(-TUNE.aimMax, Math.min(TUNE.aimMax, aim)) : 0;
    s.wantFart = !!input?.fart;
  }

  next() {
    if (this.phase !== "clear") return;
    if (this.levelIndex + 1 < LEVEL_COUNT) {
      this.loadLevel(this.levelIndex + 1);
      this.begin();
    } else {
      this.phase = "final";
      this.emitState();
    }
  }

  /** After the final results: back to the garage to pick another map or vehicle. */
  again() {
    if (this.phase !== "final") return;
    for (const id of Object.keys(this.garage.ready)) this.garage.ready[id] = false;
    this.phase = "garage";
    this.emitState();
  }

  /** Straighten the vehicle: set it upright in the nearest free spot. Shared cooldown. */
  right(playerId: string) {
    const now = Date.now();
    if (this.phase !== "play" || this.deadUntil || now < this.rightReadyAt) return;
    const raft = this.raft;
    let spot: { x: number; y: number } | null = null;
    search: for (const dy of [0, -40, -80, -120, -160, 40, 80]) {
      for (const dx of [0, -80, 80, -160, 160]) {
        if (this.fits(raft.position.x + dx, raft.position.y + dy)) {
          spot = { x: raft.position.x + dx, y: raft.position.y + dy };
          break search;
        }
      }
    }
    if (!spot) {
      this.respawn();
      this.emit({ kind: "reset", name: this.nameOf(playerId) });
      return;
    }
    Body.setAngle(raft, 0);
    Body.setPosition(raft, spot);
    Body.setVelocity(raft, { x: 0, y: 0 });
    Body.setAngularVelocity(raft, 0);
    this.capsizeT = 0;
    this.rightReadyAt = now + TUNE.rightCooldownMs;
    this.emit({ kind: "right", name: this.nameOf(playerId) });
    this.emitState();
  }

  /** Vote to go back to the last checkpoint. Needs half of the players (rounded up). */
  voteReset(playerId: string) {
    const now = Date.now();
    if (this.phase !== "play" || !this.slots.some((s) => s.id === playerId)) return;
    this.resetVotes.set(playerId, now + VOTE_MS);
    for (const [id, until] of this.resetVotes) if (until < now) this.resetVotes.delete(id);
    const needed = Math.ceil(this.slots.length / 2);
    if (this.resetVotes.size >= needed) {
      this.respawn();
      this.emit({ kind: "reset", name: this.nameOf(playerId) });
    } else {
      this.emit({ kind: "vote", name: this.nameOf(playerId), votes: this.resetVotes.size, needed });
    }
  }

  publicState(): TootState {
    return {
      phase: this.phase,
      maps: MAP_INFOS,
      vehicles: VEHICLES,
      garage: this.garage,
      vehicle: vehicleById(this.garage.vehicle),
      levelIndex: this.levelIndex,
      levelCount: LEVEL_COUNT,
      level: this.phase === "garage" ? null : this.level,
      players: this.players(),
      startAt: this.startAt,
      stats: this.stats,
      totals: this.phase === "final" ? this.totals : null,
      rightReadyAt: this.rightReadyAt,
    };
  }

  /* ----- setup ----- */

  private nameOf(id: string) {
    return this.room.players.find((p) => p.id === id)?.name ?? "Someone";
  }

  private players(): TootPlayer[] {
    return this.slots.map((s, i) => ({
      id: s.id,
      name: this.nameOf(s.id),
      slot: i,
      avatar: this.garage.avatars[s.id] ?? AVATARS[i % AVATARS.length],
      color: COLORS[i % COLORS.length],
    }));
  }

  private loadLevel(index: number) {
    const v = vehicleById(this.garage.vehicle);
    this.rw = v.w;
    this.rh = v.h;
    this.power = v.power;
    this.control = v.control;
    this.levelIndex = index;
    const level = buildLevel(this.garage.map, index);
    this.level = level;
    this.engine = Engine.create({ gravity: { x: 0, y: 1, scale: TUNE.gravityScale } });

    // low friction and rounded corners so the vehicle slides off walls instead of sticking
    for (const s of level.solids) {
      Composite.add(
        this.engine.world,
        Bodies.rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, {
          isStatic: true,
          friction: 0.02,
          frictionStatic: 0.05,
          restitution: 0.1,
          chamfer: { radius: Math.max(1, Math.min(14, Math.min(s.w, s.h) / 2 - 1)) },
        })
      );
    }
    this.raft = Bodies.rectangle(level.spawn.x, level.spawn.y - v.h / 2, v.w, v.h, {
      density: 0.002,
      friction: 0.1,
      frictionStatic: 0.1,
      frictionAir: TUNE.frictionAir,
      restitution: 0.1,
      chamfer: { radius: Math.min(8, v.h / 2 - 1) },
    });
    Body.setInertia(this.raft, this.raft.inertia * TUNE.inertiaMul * v.control);
    Composite.add(this.engine.world, this.raft);

    this.slots.forEach((s) => {
      s.power = 0;
      s.gas = 100;
      s.locked = false;
      s.wasFarting = false;
      s.ema = 0;
    });
    this.stats = emptyCounts();
    this.slots.forEach((s) => {
      this.stats.blames[s.id] = 0;
      this.stats.farts[s.id] = 0;
    });
    this.cp = -1;
    this.gt = 0;
    this.deadUntil = 0;
    this.capsizeT = 0;
    this.rightReadyAt = 0;
    this.resetVotes.clear();
  }

  private begin() {
    this.phase = "countdown";
    this.startAt = Date.now() + COUNTDOWN_MS;
    this.emitState();
    this.timers.push(
      setTimeout(() => {
        this.phase = "play";
        this.playStart = Date.now();
        this.last = Date.now();
        this.acc = 0;
        this.progX = this.raft.position.x;
        this.progAt = Date.now();
        this.stuckSent = false;
        this.emitState();
      }, COUNTDOWN_MS)
    );
  }

  /** Is an upright vehicle centered here clear of all solid rocks? */
  private fits(cx: number, cy: number): boolean {
    const hw = this.rw / 2 + 6;
    const hh = this.rh / 2 + 6;
    for (const s of this.level!.solids) {
      if (cx + hw > s.x && cx - hw < s.x + s.w && cy + hh > s.y && cy - hh < s.y + s.h) return false;
    }
    return true;
  }

  /* ----- simulation ----- */

  private tick = () => {
    if (this.phase !== "play") return;
    const now = Date.now();
    this.acc += Math.min(100, now - this.last);
    this.last = now;
    while (this.acc >= STEP_MS && this.phase === "play") {
      this.acc -= STEP_MS;
      this.step(now);
      if (++this.ticks % SNAP_EVERY === 0) this.sendSnapshot();
    }
  };

  private step(now: number) {
    if (this.deadUntil) {
      if (now < this.deadUntil) return;
      this.respawn();
    }

    const raft = this.raft;
    const n = this.slots.length;
    const weight = raft.mass * this.engine.gravity.scale * this.engine.gravity.y;
    const cos = Math.cos(raft.angle);
    const sin = Math.sin(raft.angle);

    this.slots.forEach((s, i) => {
      // gas and thrust power
      const wants = s.wantFart && !s.locked && s.gas > 0;
      s.power = wants ? Math.min(1, s.power + STEP_S * 3.5) : Math.max(0, s.power - STEP_S * 8);
      if (wants) {
        s.gas = Math.max(0, s.gas - TUNE.gasUse * s.power * STEP_S);
        if (s.gas <= 0) s.locked = true;
      } else if (s.power === 0) {
        s.gas = Math.min(100, s.gas + TUNE.gasRegen * STEP_S);
        if (s.locked && s.gas >= 25) s.locked = false;
      }
      const farting = s.power > 0.05;
      if (farting && !s.wasFarting) this.stats.farts[s.id] = (this.stats.farts[s.id] ?? 0) + 1;
      s.wasFarting = farting;

      // the thruster pushes the vehicle opposite to the way its gas shoots out
      let torque = 0;
      if (s.power > 0) {
        const F = ((TUNE.thrustTotal * this.power) / n) * weight * s.power;
        const lx = -Math.sin(s.aim);
        const ly = -Math.cos(s.aim);
        const fx = (lx * cos - ly * sin) * F;
        const fy = (lx * sin + ly * cos) * F;
        const ox = slotX(i, n, this.rw);
        const oy = this.rh / 2;
        const rx = ox * cos - oy * sin;
        const ry = ox * sin + oy * cos;
        Body.applyForce(raft, { x: raft.position.x + rx, y: raft.position.y + ry }, { x: fx, y: fy });
        torque = Math.abs(rx * fy - ry * fx);
      }
      s.ema = s.ema * 0.985 + (torque / (weight * this.rw)) * 20 + s.power * 0.3;
    });

    Engine.update(this.engine, STEP_MS);
    Body.setAngularVelocity(raft, raft.angularVelocity * (1 - TUNE.angDamp * this.control));
    this.gt += STEP_S;
    this.checkRules(now);
    if (this.phase === "play" && !this.deadUntil) this.watchProgress(now);
  }

  private checkRules(now: number) {
    const raft = this.raft;
    const level = this.level!;

    const nextCp = level.checkpoints[this.cp + 1];
    if (nextCp && raft.position.x > nextCp.x) {
      this.cp++;
      this.emit({ kind: "checkpoint", index: this.cp });
    }

    if (raft.position.x >= level.finishX) return this.clearLevel(now);

    for (const h of level.hazards) {
      if (hazardHitsRaft(h, this.gt, raft, this.rw, this.rh)) return this.fail("hazard", now);
    }

    const tilt = Math.abs(Math.atan2(Math.sin(raft.angle), Math.cos(raft.angle)));
    this.capsizeT = tilt > TUNE.capsizeRad ? this.capsizeT + STEP_S : Math.max(0, this.capsizeT - STEP_S * 2);
    if (this.capsizeT > 0.6) return this.fail("capsize", now);

    if (raft.position.y > level.height + 250) this.fail("fell", now);
  }

  /** Warn, then reset, when the team has not moved forward for a long time. */
  private watchProgress(now: number) {
    const x = this.raft.position.x;
    if (Math.abs(x - this.progX) > 90) {
      this.progX = x;
      this.progAt = now;
      this.stuckSent = false;
      return;
    }
    const idle = now - this.progAt;
    if (idle > TUNE.stuckMs && !this.stuckSent) {
      this.stuckSent = true;
      this.emit({ kind: "stuck" });
    }
    if (idle > TUNE.autoResetMs) {
      this.respawn();
      this.emit({ kind: "reset", name: "Auto reset" });
    }
  }

  private fail(reason: "capsize" | "hazard" | "fell", now: number) {
    let blame: Slot | null = null;
    let best = 0.25;
    for (const s of this.slots) {
      if (s.ema > best) {
        best = s.ema;
        blame = s;
      }
    }
    this.stats.deaths++;
    if (blame) this.stats.blames[blame.id] = (this.stats.blames[blame.id] ?? 0) + 1;

    this.emit({ kind: "fail", reason, blameId: blame?.id ?? null, name: blame ? this.nameOf(blame.id) : "Gravity" });

    Body.setVelocity(this.raft, { x: 0, y: 0 });
    Body.setAngularVelocity(this.raft, 0);
    this.deadUntil = now + RESPAWN_MS;
  }

  private respawn() {
    const level = this.level!;
    const spot = this.cp >= 0 ? level.checkpoints[this.cp] : level.spawn;
    Body.setPosition(this.raft, { x: spot.x, y: spot.y - this.rh / 2 });
    Body.setAngle(this.raft, 0);
    Body.setVelocity(this.raft, { x: 0, y: 0 });
    Body.setAngularVelocity(this.raft, 0);
    this.slots.forEach((s) => {
      s.gas = 100;
      s.power = 0;
      s.locked = false;
      s.ema = 0;
    });
    this.capsizeT = 0;
    this.deadUntil = 0;
    this.resetVotes.clear();
    this.progX = spot.x;
    this.progAt = Date.now();
    this.stuckSent = false;
    this.emit({ kind: "respawn" });
  }

  private clearLevel(now: number) {
    this.phase = "clear";
    this.stats.timeMs = now - this.playStart;
    this.totals.timeMs += this.stats.timeMs;
    this.totals.deaths += this.stats.deaths;
    for (const s of this.slots) {
      this.totals.blames[s.id] = (this.totals.blames[s.id] ?? 0) + (this.stats.blames[s.id] ?? 0);
      this.totals.farts[s.id] = (this.totals.farts[s.id] ?? 0) + (this.stats.farts[s.id] ?? 0);
    }
    this.emitState();
  }

  /* ----- output ----- */

  private sendSnapshot() {
    const r = this.raft;
    const snap: TootSnapshot = {
      t: Date.now(),
      gt: this.gt,
      x: Math.round(r.position.x * 10) / 10,
      y: Math.round(r.position.y * 10) / 10,
      a: Math.round(r.angle * 1000) / 1000,
      dead: this.deadUntil > 0,
      cp: this.cp,
      ps: this.slots.map((s) => ({
        aim: Math.round(s.aim * 100) / 100,
        gas: Math.round(s.gas),
        p: Math.round(s.power * 100) / 100,
      })),
    };
    this.io.to(this.room.code).volatile.emit("toot:snap", snap);
  }

  private emitState() {
    this.io.to(this.room.code).emit("toot:state", this.publicState());
  }

  private emit(e: TootEvent) {
    this.io.to(this.room.code).emit("toot:event", e);
  }
}

const games = new Map<string, TootGame>();

export function startTootGame(io: IO, room: RoomState) {
  games.get(room.code)?.destroy();
  const game = new TootGame(io, room);
  games.set(room.code, game);
  game.start();
}

export const getTootGame = (code: string) => games.get(code);

export function stopTootGame(code: string) {
  games.get(code)?.destroy();
  games.delete(code);
}