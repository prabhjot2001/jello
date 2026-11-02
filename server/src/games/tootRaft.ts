import Matter from "matter-js";
import type { Server } from "socket.io";
import type { ClientToServer, ServerToClient, RoomState } from "../../../shared/events.js";
import type {
  TootCounts, TootEvent, TootHazard, TootInput, TootLevel, TootPlayer, TootSnapshot, TootState,
} from "../../../shared/toot.js";
import { buildLevel, LEVEL_COUNT } from "./tootLevels.js";

type IO = Server<ClientToServer, ServerToClient>;
const { Engine, Bodies, Body, Composite } = Matter;

/** The feel of the game. Tweak these first if it feels too twitchy or too heavy. */
const TUNE = {
  gravityScale: 0.001,
  thrustTotal: 2.4, // thrust of all players at full power, in raft weights (more players = less each)
  frictionAir: 0.035,
  inertiaMul: 1.5, // higher = the raft tilts more slowly
  aimMax: 1.0, // radians, keep in sync with the client
  gasUse: 45, // gas per second at full power
  gasRegen: 28,
  capsizeRad: 1.75,
};

const STEP_MS = 1000 / 60;
const STEP_S = STEP_MS / 1000;
const SNAP_EVERY = 3; // 20 snapshots per second
const COUNTDOWN_MS = 4000;
const RESPAWN_MS = 1500;
const RAFT_W = 220;
const RAFT_H = 26;
const AVATARS = ["troll", "doge", "cry-cat", "loser"];
const COLORS = ["#FFB5C8", "#9FE3C4", "#FFE08A", "#9AD1FF"];

const slotX = (i: number, n: number) => (n === 1 ? 0 : -RAFT_W * 0.34 + RAFT_W * 0.68 * (i / (n - 1)));
const emptyCounts = (): TootCounts => ({ deaths: 0, blames: {}, farts: {}, timeMs: 0 });

interface Slot {
  id: string;
  aim: number;
  wantFart: boolean;
  power: number;
  gas: number;
  locked: boolean;
  wasFarting: boolean;
  /** recent contribution to the raft's tilt, used to decide who gets the blame */
  ema: number;
}

function hazardCenter(h: TootHazard, gt: number) {
  const s = Math.sin((2 * Math.PI * gt) / h.period + h.phase);
  return { x: h.x + h.w / 2 + h.ax * s, y: h.y + h.h / 2 + h.ay * s };
}

function hazardHitsRaft(h: TootHazard, gt: number, raft: Matter.Body): boolean {
  const c = hazardCenter(h, gt);
  const cos = Math.cos(raft.angle);
  const sin = Math.sin(raft.angle);

  if (h.kind === "saw") {
    const dx = c.x - raft.position.x;
    const dy = c.y - raft.position.y;
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    const px = Math.max(-RAFT_W / 2, Math.min(RAFT_W / 2, lx));
    const py = Math.max(-RAFT_H / 2, Math.min(RAFT_H / 2, ly));
    const r = h.w / 2 - 4;
    return (lx - px) ** 2 + (ly - py) ** 2 <= r * r;
  }

  // spikes: test points along the raft's edges against the strip
  const left = c.x - h.w / 2 + 4;
  const right = c.x + h.w / 2 - 4;
  const top = c.y - h.h / 2 + 4;
  const bottom = c.y + h.h / 2 - 4;
  for (let i = 0; i <= 10; i++) {
    const lx = -RAFT_W / 2 + (RAFT_W * i) / 10;
    for (const ly of [-RAFT_H / 2, RAFT_H / 2]) {
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
  private level!: TootLevel;
  private levelIndex = 0;
  private phase: TootState["phase"] = "countdown";
  private startAt = 0;
  private playStart = 0;
  private gt = 0;
  private slots: Slot[] = [];
  private cp = -1; // last checkpoint reached, -1 = the start
  private deadUntil = 0;
  private capsizeT = 0;
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
    this.totals = emptyCounts();
    this.loadLevel(0);
    this.loop = setInterval(this.tick, 16);
    this.begin();
  }

  destroy() {
    if (this.loop) clearInterval(this.loop);
    this.loop = null;
    this.timers.forEach(clearTimeout);
    this.timers = [];
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

  again() {
    if (this.phase !== "final") return;
    this.totals = emptyCounts();
    this.loadLevel(0);
    this.begin();
  }

  publicState(): TootState {
    return {
      phase: this.phase,
      levelIndex: this.levelIndex,
      levelCount: LEVEL_COUNT,
      level: this.level,
      players: this.players(),
      startAt: this.startAt,
      stats: this.stats,
      totals: this.phase === "final" ? this.totals : null,
    };
  }

  /* ----- setup ----- */

  private players(): TootPlayer[] {
    return this.slots.map((s, i) => ({
      id: s.id,
      name: this.room.players.find((p) => p.id === s.id)?.name ?? "Cat",
      slot: i,
      avatar: AVATARS[i % AVATARS.length],
      color: COLORS[i % COLORS.length],
    }));
  }

  private loadLevel(index: number) {
    this.levelIndex = index;
    this.level = buildLevel(index);
    this.engine = Engine.create({ gravity: { x: 0, y: 1, scale: TUNE.gravityScale } });

    for (const s of this.level.solids) {
      Composite.add(
        this.engine.world,
        Bodies.rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, { isStatic: true, friction: 0.8, restitution: 0.15 })
      );
    }
    this.raft = Bodies.rectangle(this.level.spawn.x, this.level.spawn.y, RAFT_W, RAFT_H, {
      density: 0.002,
      friction: 0.7,
      frictionAir: TUNE.frictionAir,
      restitution: 0.15,
    });
    Body.setInertia(this.raft, this.raft.inertia * TUNE.inertiaMul);
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
        this.emitState();
      }, COUNTDOWN_MS)
    );
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

      // the thruster pushes the raft opposite to the way its gas shoots out
      let torque = 0;
      if (s.power > 0) {
        const F = (TUNE.thrustTotal / n) * weight * s.power;
        const lx = -Math.sin(s.aim);
        const ly = -Math.cos(s.aim);
        const fx = (lx * cos - ly * sin) * F;
        const fy = (lx * sin + ly * cos) * F;
        const ox = slotX(i, n);
        const oy = RAFT_H / 2;
        const rx = ox * cos - oy * sin;
        const ry = ox * sin + oy * cos;
        Body.applyForce(raft, { x: raft.position.x + rx, y: raft.position.y + ry }, { x: fx, y: fy });
        torque = Math.abs(rx * fy - ry * fx);
      }
      s.ema = s.ema * 0.985 + (torque / (weight * RAFT_W)) * 20 + s.power * 0.3;
    });

    Engine.update(this.engine, STEP_MS);
    this.gt += STEP_S;
    this.checkRules(now);
  }

  private checkRules(now: number) {
    const raft = this.raft;

    const nextCp = this.level.checkpoints[this.cp + 1];
    if (nextCp && raft.position.x > nextCp.x) {
      this.cp++;
      this.emit({ kind: "checkpoint", index: this.cp });
    }

    if (raft.position.x >= this.level.finishX) return this.clearLevel(now);

    for (const h of this.level.hazards) {
      if (hazardHitsRaft(h, this.gt, raft)) return this.fail("hazard", now);
    }

    const tilt = Math.abs(Math.atan2(Math.sin(raft.angle), Math.cos(raft.angle)));
    this.capsizeT = tilt > TUNE.capsizeRad ? this.capsizeT + STEP_S : Math.max(0, this.capsizeT - STEP_S * 2);
    if (this.capsizeT > 0.6) return this.fail("capsize", now);

    if (raft.position.y > this.level.height + 250) this.fail("fell", now);
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

    const name = blame ? this.room.players.find((p) => p.id === blame!.id)?.name ?? "Someone" : "Gravity";
    this.emit({ kind: "fail", reason, blameId: blame?.id ?? null, name });

    Body.setVelocity(this.raft, { x: 0, y: 0 });
    Body.setAngularVelocity(this.raft, 0);
    this.deadUntil = now + RESPAWN_MS;
  }

  private respawn() {
    const spot = this.cp >= 0 ? this.level.checkpoints[this.cp] : this.level.spawn;
    Body.setPosition(this.raft, { x: spot.x, y: spot.y });
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