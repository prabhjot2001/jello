import type { TankEvent, TankTrack, TerrainOp } from "../../../shared/tanks.js";
import { FIELD_H, FIELD_W, type Terrain } from "./tanksTerrain.js";
import type { WeaponDef } from "./tanksWeapons.js";

export const TANK_R = 22;
export const PIVOT_Y = 22; // barrel pivot height above the tank's feet
export const BARREL = 34;

const DT = 1 / 60;
const G = 520;
const V_SCALE = 9.2;
const WIND_K = 22;
const MAX_TICKS = 60 * 22;

export interface SimTank {
  id: string;
  x: number;
  /** y of the row just above the ground the tank stands on */
  y: number;
}

export interface SimInput {
  terrain: Terrain;
  tanks: SimTank[];
  shooter: number;
  weapon: WeaponDef;
  angle: number;
  power: number;
  wind: number;
  gravity: number;
  blast: number;
  rnd: () => number;
}

export interface SimResult {
  tracks: TankTrack[];
  events: TankEvent[];
  ticks: number;
  /** score change of the shooter */
  delta: number[];
  /** indexes of tanks whose aim gets scrambled */
  scramble: number[];
}

interface P {
  x: number; y: number; px: number; py: number; vx: number; vy: number;
  t0: number; age: number; alive: boolean; kind: string; r: number; pts: number;
  rolling: boolean; dir: number; bounces: number; apex: boolean; track: TankTrack;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Plays a whole shot at once. The result is a recording (positions per tick plus explosions with their terrain
 * changes), so every player just replays it. Nothing is simulated twice, so clients can never disagree.
 */
export function simulate(c: SimInput): SimResult {
  const { terrain, tanks, weapon: w } = c;
  const shooter = tanks[c.shooter];
  const tracks: TankTrack[] = [];
  const events: TankEvent[] = [];
  const delta = tanks.map(() => 0);
  const scramble: number[] = [];
  const projs: P[] = [];
  const pending: { t: number; fn: () => void }[] = [];
  let tick = 0;

  function schedule(delay: number, fn: () => void) {
    pending.push({ t: tick + delay, fn });
  }

  function boom(x: number, y: number, r0: number, pts: number, o: { carve?: boolean; fx?: string; scramble?: boolean } = {}) {
    const r = Math.max(5, Math.round(r0 * c.blast));
    const ix = Math.round(x);
    const iy = Math.round(y);
    const ops: TerrainOp[] = [];
    if (o.carve !== false) ops.push(terrain.circle(false, ix, iy, r));
    const popups: Record<string, number> = {};
    tanks.forEach((t, i) => {
      const d = Math.hypot(t.x - ix, t.y - 14 - iy);
      const reach = r + TANK_R;
      if (d > reach) return;
      if (pts > 0) {
        const ratio = Math.max(0.2, Math.min(1, 1 - Math.max(0, d - 8) / reach));
        const p = Math.round(pts * ratio);
        const signed = i === c.shooter ? -p : p; // hitting yourself costs points
        delta[c.shooter] += signed;
        popups[t.id] = (popups[t.id] ?? 0) + signed;
      }
      if (o.scramble && i !== c.shooter && !scramble.includes(i)) scramble.push(i);
    });
    events.push({ t: Math.max(1, tick), x: ix, y: iy, r, fx: o.fx ?? "boom", ops, pts: popups });
  }

  function spawn(o: {
    x: number; y: number; vx: number; vy: number; kind: string; r: number; pts: number; delay?: number; fx?: string;
  }): P {
    const t0 = tick + 1 + (o.delay ?? 0);
    const p: P = {
      x: o.x, y: o.y, px: o.x, py: o.y, vx: o.vx, vy: o.vy, t0, age: 0, alive: true,
      kind: o.kind, r: o.r, pts: o.pts, rolling: false, dir: o.vx >= 0 ? 1 : -1, bounces: 0, apex: false,
      track: { t0, pts: [], fx: o.fx ?? o.kind },
    };
    projs.push(p);
    tracks.push(p.track);
    return p;
  }

  function shootAt(angle: number, power: number, o: { kind: string; r: number; pts: number; delay?: number; fx?: string }) {
    const a = rad(angle);
    const v = power * V_SCALE;
    return spawn({
      x: shooter.x + Math.cos(a) * BARREL,
      y: shooter.y - PIVOT_Y - Math.sin(a) * BARREL,
      vx: Math.cos(a) * v,
      vy: -Math.sin(a) * v,
      ...o,
    });
  }

  function normalAt(x: number, y: number): [number, number] {
    let nx = 0;
    let ny = 0;
    for (let ay = -4; ay <= 4; ay++) {
      for (let ax = -4; ax <= 4; ax++) {
        if (!terrain.solid(x + ax, y + ay)) {
          nx += ax;
          ny += ay;
        }
      }
    }
    const m = Math.hypot(nx, ny);
    return m < 0.01 ? [0, -1] : [nx / m, ny / m];
  }

  function steer(p: P) {
    let best: SimTank | null = null;
    let bd = 300;
    for (let i = 0; i < tanks.length; i++) {
      if (i === c.shooter) continue;
      const d = Math.hypot(tanks[i].x - p.x, tanks[i].y - 14 - p.y);
      if (d < bd) {
        bd = d;
        best = tanks[i];
      }
    }
    if (!best) return;
    const sp = Math.hypot(p.vx, p.vy);
    const cur = Math.atan2(p.vy, p.vx);
    let da = Math.atan2(best.y - 14 - p.y, best.x - p.x) - cur;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const turn = Math.max(-2.6 * DT, Math.min(2.6 * DT, da));
    p.vx = Math.cos(cur + turn) * sp;
    p.vy = Math.sin(cur + turn) * sp;
  }

  function startRoll(p: P) {
    p.rolling = true;
    p.dir = p.vx >= 0 ? 1 : -1;
    p.age = 0;
    p.x = p.px;
    p.y = p.py;
    p.vx = 0;
    p.vy = 0;
  }

  function bounce(p: P, onTank: boolean) {
    if (onTank || p.bounces >= 3) {
      boom(p.x, p.y, p.r, p.pts);
      p.alive = false;
      return;
    }
    const [nx, ny] = normalAt(Math.round(p.x), Math.round(p.y));
    p.x = p.px;
    p.y = p.py;
    const dot = p.vx * nx + p.vy * ny;
    p.vx = (p.vx - 2 * dot * nx) * 0.72;
    p.vy = (p.vy - 2 * dot * ny) * 0.72;
    p.bounces++;
    events.push({ t: tick, x: Math.round(p.x), y: Math.round(p.y), r: 8, fx: "spark" });
    if (Math.hypot(p.vx, p.vy) < 70) {
      boom(p.x, p.y, p.r, p.pts);
      p.alive = false;
    }
  }

  function dig(p: P) {
    const sp = Math.hypot(p.vx, p.vy) || 1;
    const ux = p.vx / sp;
    const uy = p.vy / sp;
    const ops: TerrainOp[] = [];
    for (let i = 0; i <= 18; i++) ops.push(terrain.circle(false, p.x + ux * i * 9, p.y + uy * i * 9, 11 * c.blast));
    events.push({ t: tick, x: Math.round(p.x), y: Math.round(p.y), r: 14, fx: "dig", ops });
  }

  function pile(p: P) {
    boom(p.x, p.y, 14, 40);
    const ops: TerrainOp[] = [];
    for (let k = 1; k <= 7; k++) ops.push(terrain.circle(false, p.x, p.y + k * 13, 15 * c.blast));
    events.push({ t: tick, x: Math.round(p.x), y: Math.round(p.y), r: 14, fx: "dig", ops });
  }

  function napalm(p: P) {
    const ox = p.x;
    const oy = p.y;
    boom(ox, oy, 14, 20, { fx: "fire" });
    for (let i = 0; i < 7; i++) {
      const fx = ox + (i - 3) * 20;
      schedule(2 + i * 3, () => {
        let sy = Math.round(oy) - 50;
        while (sy < FIELD_H && !terrain.solid(fx, sy)) sy++;
        boom(fx, sy - 2, 16, 32, { fx: "fire" });
      });
    }
  }

  function impact(p: P, onTank: boolean) {
    const x = p.x;
    const y = p.y;
    switch (p.kind) {
      case "roller":
        if (onTank) {
          boom(x, y, p.r, p.pts);
          p.alive = false;
        } else {
          startRoll(p);
        }
        return;
      case "bouncer":
        bounce(p, onTank);
        return;
      case "cluster": {
        boom(x, y, 12, 14);
        for (let i = 0; i < 6; i++) {
          const a = rad(-90 + (i - 2.5) * 24);
          const sp = 240 + c.rnd() * 140;
          spawn({ x, y: y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, kind: "shell", r: 18, pts: 38, fx: "bomblet" });
        }
        p.alive = false;
        return;
      }
      case "digger":
        dig(p);
        p.alive = false;
        return;
      case "pile":
        pile(p);
        p.alive = false;
        return;
      case "dirt": {
        const r = Math.round(p.r * c.blast);
        const op = terrain.circle(true, x, y, r);
        events.push({ t: tick, x: Math.round(x), y: Math.round(y), r, fx: "dirt", ops: [op] });
        p.alive = false;
        return;
      }
      case "wall": {
        const top = Math.max(0, Math.round(y) - 170);
        const op = terrain.rect(true, Math.round(x) - 8, top, 16, Math.round(y) - top + 6);
        events.push({ t: tick, x: Math.round(x), y: Math.round(y), r: 16, fx: "dirt", ops: [op] });
        p.alive = false;
        return;
      }
      case "napalm":
        napalm(p);
        p.alive = false;
        return;
      case "mark":
        boom(x, y, 6, 0, { carve: false, fx: "mark" });
        p.alive = false;
        return;
      case "mover":
        boom(x, y, p.r, 0);
        p.alive = false;
        return;
      case "wacky":
        boom(x, y, p.r, p.pts, { scramble: true });
        p.alive = false;
        return;
      default:
        boom(x, y, p.r, p.pts);
        p.alive = false;
    }
  }

  function onApex(p: P) {
    if (p.kind === "mirv") {
      for (let i = 0; i < 5; i++) {
        spawn({ x: p.x, y: p.y, vx: p.vx + (i - 2) * 85, vy: p.vy * 0.3, kind: "shell", r: 26, pts: 62, fx: "warhead" });
      }
      p.alive = false;
    } else if (p.kind === "carpet") {
      const s = p.vx >= 0 ? 1 : -1;
      for (let i = 0; i < 7; i++) {
        spawn({ x: p.x + s * i * 30, y: p.y, vx: 0, vy: 0, kind: "shell", r: 22, pts: 44, delay: i * 4, fx: "bomblet" });
      }
      p.alive = false;
    }
  }

  function fly(p: P) {
    p.vy += G * c.gravity * DT;
    p.vx += c.wind * WIND_K * DT;
    if (p.kind === "homing") steer(p);
    const dx = p.vx * DT;
    const dy = p.vy * DT;
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dy))); // never move more than a pixel at a time
    for (let s = 0; s < n; s++) {
      p.px = p.x;
      p.py = p.y;
      p.x += dx / n;
      p.y += dy / n;
      if (p.x < -60 || p.x > FIELD_W + 60 || p.y > FIELD_H + 60) {
        p.alive = false;
        return;
      }
      let hitTank = false;
      for (let i = 0; i < tanks.length; i++) {
        if (i === c.shooter && p.age < 14) continue;
        if (Math.hypot(p.x - tanks[i].x, p.y - 14 - tanks[i].y) < TANK_R - 2) hitTank = true;
      }
      if (hitTank || terrain.solid(p.x, p.y)) {
        impact(p, hitTank);
        if (!p.alive || p.rolling || p.kind === "bouncer") return;
      }
    }
    if (!p.apex && p.age > 12 && p.vy > 0) {
      p.apex = true;
      onApex(p);
    }
  }

  function roll(p: P) {
    const nx = p.x + p.dir * 150 * DT;
    let sy = -1;
    for (let yy = Math.round(p.y) - 16; yy < Math.round(p.y) + 36; yy++) {
      if (terrain.solid(nx, yy)) {
        sy = yy;
        break;
      }
    }
    if (sy < 0) {
      // rolled off a ledge: fall again
      p.rolling = false;
      p.vx = p.dir * 150;
      p.vy = 0;
      p.x = nx;
      return;
    }
    if (p.y - (sy - 5) > 6) {
      boom(p.x, p.y, p.r, p.pts); // a wall is in the way
      p.alive = false;
      return;
    }
    p.x = nx;
    p.y = sy - 5;
    for (const t of tanks) {
      if (Math.hypot(p.x - t.x, p.y - 14 - t.y) < TANK_R + 6) {
        boom(p.x, p.y, p.r, p.pts);
        p.alive = false;
        return;
      }
    }
    if (p.age > 420 || p.x < 0 || p.x > FIELD_W) {
      boom(p.x, p.y, p.r, p.pts);
      p.alive = false;
    }
  }

  function sniper() {
    const a = rad(c.angle);
    const ux = Math.cos(a);
    const uy = -Math.sin(a);
    const sx = shooter.x + ux * BARREL;
    const sy = shooter.y - PIVOT_Y + uy * BARREL;
    let x = sx;
    let y = sy;
    let buried = 0;
    let hit = false;
    const ops: TerrainOp[] = [];
    tick = 1;
    for (let i = 0; i < 720 && !hit; i++) {
      x += ux * 2;
      y += uy * 2;
      if (x < 0 || x > FIELD_W || y > FIELD_H) break;
      for (let k = 0; k < tanks.length; k++) {
        if (k === c.shooter && i < 20) continue;
        if (Math.hypot(tanks[k].x - x, tanks[k].y - 14 - y) < TANK_R) hit = true;
      }
      if (hit) break;
      if (terrain.solid(x, y)) {
        buried += 2;
        if (buried > 160) break; // too much dirt
        if (i % 2 === 0) ops.push(terrain.circle(false, x, y, 4));
      }
    }
    tracks.push({ t0: 1, pts: [r1(sx), r1(sy), r1(x), r1(y)], fx: "laser" });
    if (ops.length) events.push({ t: 2, x: Math.round(sx), y: Math.round(sy), r: 4, fx: "dig", ops });
    tick = 3;
    boom(x, y, hit ? w.r : 12, hit ? w.pts : 0, { fx: hit ? "laser" : "spark" });
  }

  function dome() {
    const cx = Math.round(shooter.x);
    const cy = Math.round(shooter.y - 12);
    const ops: TerrainOp[] = [
      terrain.circle(true, cx, cy, 54),
      terrain.circle(false, cx, cy, 38),
      terrain.rect(true, cx - 54, shooter.y + 1, 108, 24), // keep a floor under the tank
    ];
    tick = 1;
    events.push({ t: 1, x: cx, y: cy, r: 54, fx: "dome", ops });
  }

  /* ----- fire ----- */
  switch (w.kind) {
    case "sniper":
      sniper();
      break;
    case "dome":
      dome();
      break;
    case "tracer":
      for (const off of [-10, -5, 0, 5, 10]) shootAt(c.angle + off, c.power, { kind: "mark", r: 6, pts: 0, fx: "tracer" });
      break;
    case "tommy":
      for (let i = 0; i < 8; i++) {
        shootAt(c.angle + (c.rnd() - 0.5) * 1.6, c.power, { kind: "shell", r: w.r, pts: w.pts, delay: i * 5, fx: "bullet" });
      }
      break;
    default: {
      const n = w.shots ?? 1;
      const spread = w.spread ?? 0;
      for (let i = 0; i < n; i++) {
        shootAt(c.angle + (i - (n - 1) / 2) * spread, c.power, {
          kind: w.kind, r: w.r, pts: w.pts, fx: w.kind === "shell" ? "shell" : w.kind,
        });
      }
    }
  }

  /* ----- run until everything has landed ----- */
  while (tick < MAX_TICKS) {
    tick++;
    for (let i = pending.length - 1; i >= 0; i--) {
      if (pending[i].t <= tick) {
        const fn = pending[i].fn;
        pending.splice(i, 1);
        fn();
      }
    }
    let active = false;
    for (const p of projs.slice()) {
      if (!p.alive) continue;
      active = true;
      if (p.t0 > tick) continue;
      p.age++;
      p.px = p.x;
      p.py = p.y;
      if (p.rolling) roll(p);
      else fly(p);
      p.track.pts.push(r1(p.x), r1(p.y));
    }
    if (!active && pending.length === 0) break;
  }

  return { tracks, events, ticks: Math.max(tick + 6, 40), delta, scramble };
}
