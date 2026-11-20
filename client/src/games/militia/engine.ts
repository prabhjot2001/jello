import type { MilitiaCrate, MilitiaPeer, MilitiaPlayerState, MilitiaSnap } from "@/types";
import { mapDef, type MilitiaMapDef, type Rect } from "./maps";
import { weaponDef, WEAPONS } from "./weapons";

export const PW = 26;
export const PH = 40;
const RUN = 300;
const JET_ACCEL = 1700;
const JET_MAX = 360;
const JET_SECONDS = 2.4;
const GRAVITY = 1500;
const MAX_FALL = 900;
const START_GRENADES = 2;

export interface MilitiaInput {
  move: number;
  jet: boolean;
  aim: number;
  fire: boolean;
}

export interface Peer extends MilitiaPeer {
  rx: number;
  ry: number;
  at: number;
  name: string;
  color: string;
  alive: boolean;
  hp: number;
}

export interface Proj {
  owner: string;
  mine: boolean;
  w: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  dmg: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  grav: number;
}

export interface WorldHooks {
  fire: (f: { w: string; x: number; y: number; a: number; p: number }) => void;
  hit: (victim: string, dmg: number, w: string) => void;
  pickup: (crateId: number) => void;
  sfx: (name: "mShot" | "mSmg" | "mShotgun" | "mSniper" | "mRocket" | "mBoom" | "mReload" | "mPick" | "mEmpty") => void;
}

const overlap = (ax: number, ay: number, aw: number, ah: number, r: Rect) =>
  ax < r[0] + r[2] && ax + aw > r[0] && ay < r[1] + r[3] && ay + ah > r[1];

export class MilitiaWorld {
  map: MilitiaMapDef;
  myId: string;
  hooks: WorldHooks;

  // local player (x/y = centre)
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  grounded = false;
  jetting = false;
  fuel = 1;
  aim = 0;
  alive = false;
  hp = 100;
  slots: [string, string] = ["smg", "pistol"];
  slot = 0;
  ammo: Record<string, number> = {};
  grenades = START_GRENADES;
  reloadT = 0;
  cooldown = 0;
  throwCd = 0;
  flash = 0;
  shake = 0;

  peers = new Map<string, Peer>();
  proj: Proj[] = [];
  parts: Particle[] = [];
  crates: MilitiaCrate[] = [];
  private crateAsked = new Map<number, number>();
  private crateWasTaken = new Map<number, boolean>();
  private lastFireHeld = false;

  constructor(mapId: string, myId: string, hooks: WorldHooks) {
    this.map = mapDef(mapId);
    this.myId = myId;
    this.hooks = hooks;
    this.refill();
  }

  get weapon() {
    return this.slots[this.slot];
  }

  private refill() {
    this.ammo = {};
    for (const id of Object.keys(WEAPONS)) this.ammo[id] = WEAPONS[id].mag;
  }

  /* ---------- life cycle ---------- */

  respawn(spawnIndex: number) {
    const s = this.map.spawns[spawnIndex % this.map.spawns.length];
    this.x = s[0];
    this.y = s[1];
    this.vx = 0;
    this.vy = 0;
    this.fuel = 1;
    this.alive = true;
    this.hp = 100;
    this.slots = ["smg", "pistol"];
    this.slot = 0;
    this.grenades = START_GRENADES;
    this.reloadT = 0;
    this.cooldown = 0.3;
    this.refill();
    this.burst(this.x, this.y, "#fff", 14, 220);
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.burst(this.x, this.y, "#ff6b8b", 26, 380);
    this.shake = 0.35;
  }

  applyPlayers(list: MilitiaPlayerState[]) {
    for (const p of list) {
      if (p.id === this.myId) continue;
      const peer = this.peers.get(p.id);
      if (peer) {
        peer.name = p.name;
        peer.color = p.color;
        peer.alive = p.alive;
        peer.hp = p.hp;
      } else {
        const s = this.map.spawns[p.spawn % this.map.spawns.length];
        this.peers.set(p.id, {
          id: p.id, x: s[0], y: s[1], vx: 0, vy: 0, aim: 0, w: "pistol", jet: 0,
          rx: s[0], ry: s[1], at: performance.now(), name: p.name, color: p.color, alive: p.alive, hp: p.hp,
        });
      }
    }
  }

  applyCrates(list: MilitiaCrate[]) {
    this.crates = list;
    for (const c of list) {
      const was = this.crateWasTaken.get(c.id) ?? false;
      if (c.taken && !was && c.by === this.myId && this.alive) this.equipFromCrate(c.weapon);
      this.crateWasTaken.set(c.id, c.taken);
    }
  }

  private equipFromCrate(id: string) {
    this.hooks.sfx("mPick");
    if (id === "grenade") {
      this.grenades = Math.min(6, this.grenades + 3);
      return;
    }
    // replace the held weapon unless it is the pistol, then replace the other slot
    const target = this.weapon === "pistol" ? 1 - this.slot : this.slot;
    this.slots[target] = id;
    this.ammo[id] = weaponDef(id).mag;
    this.slot = target;
    this.reloadT = 0;
  }

  onPeer(p: MilitiaPeer) {
    const peer = this.peers.get(p.id);
    if (!peer) return;
    peer.x = p.x;
    peer.y = p.y;
    peer.vx = p.vx;
    peer.vy = p.vy;
    peer.aim = p.aim;
    peer.w = p.w;
    peer.jet = p.jet;
    peer.at = performance.now();
  }

  snapshot(): MilitiaSnap {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy, aim: this.aim, w: this.weapon, jet: this.jetting ? 1 : 0 };
  }

  /* ---------- controls ---------- */

  swap() {
    if (!this.alive) return;
    this.slot = 1 - this.slot;
    this.reloadT = 0;
    this.cooldown = Math.max(this.cooldown, 0.2);
    this.hooks.sfx("mReload");
  }

  startReload() {
    const d = weaponDef(this.weapon);
    if (!this.alive || this.reloadT > 0 || this.ammo[this.weapon] >= d.mag) return;
    this.reloadT = d.reload;
    this.hooks.sfx("mReload");
  }

  throwGrenade() {
    if (!this.alive || this.grenades <= 0 || this.throwCd > 0) return;
    this.grenades -= 1;
    this.throwCd = 0.6;
    const mx = this.x + Math.cos(this.aim) * 26;
    const my = this.y - 6 + Math.sin(this.aim) * 26;
    this.spawnProj("grenade", true, this.myId, mx, my, this.aim, 0);
    this.hooks.fire({ w: "grenade", x: mx, y: my, a: this.aim, p: 1 });
  }

  /* ---------- simulation ---------- */

  private solidsHit(x: number, y: number, w: number, h: number) {
    for (const r of this.map.solids) if (overlap(x, y, w, h, r)) return r;
    return null;
  }

  step(dt: number, input: MilitiaInput, playing: boolean) {
    this.flash = Math.max(0, this.flash - dt);
    this.shake = Math.max(0, this.shake - dt);
    this.updatePeers(dt);
    this.updateProj(dt);
    this.updateParts(dt);
    this.askCrates(dt);
    if (!this.alive || !playing) {
      this.jetting = false;
      return;
    }
    this.aim = input.aim;
    const g = GRAVITY * this.map.gravity;

    // horizontal movement
    const target = input.move * RUN;
    const accel = this.grounded ? 3000 : 1700;
    if (this.vx < target) this.vx = Math.min(target, this.vx + accel * dt);
    else if (this.vx > target) this.vx = Math.max(target, this.vx - accel * dt);

    // jetpack
    this.jetting = false;
    if (input.jet && this.fuel > 0) {
      this.vy -= (JET_ACCEL * dt) * (0.6 + 0.4 * this.map.gravity);
      if (this.vy < -JET_MAX) this.vy = -JET_MAX;
      this.fuel = Math.max(0, this.fuel - dt / JET_SECONDS);
      this.jetting = true;
      if (Math.random() < 0.7) this.flame();
    } else {
      this.fuel = Math.min(1, this.fuel + dt * (this.grounded ? 0.7 : 0.1));
    }
    this.vy = Math.min(MAX_FALL, this.vy + g * dt);

    this.moveBody(dt);
    this.shooting(dt, input);
  }

  private moveBody(dt: number) {
    const hw = PW / 2;
    const hh = PH / 2;
    // x axis
    this.x += this.vx * dt;
    let r = this.solidsHit(this.x - hw, this.y - hh, PW, PH);
    if (r) {
      if (this.vx > 0) this.x = r[0] - hw;
      else if (this.vx < 0) this.x = r[0] + r[2] + hw;
      this.vx = 0;
    }
    // y axis
    this.y += this.vy * dt;
    this.grounded = false;
    r = this.solidsHit(this.x - hw, this.y - hh, PW, PH);
    if (r) {
      if (this.vy > 0) {
        this.y = r[1] - hh;
        this.grounded = true;
      } else if (this.vy < 0) {
        this.y = r[1] + r[3] + hh;
      }
      this.vy = 0;
    }
    this.x = Math.min(this.map.w - hw, Math.max(hw, this.x));
    this.y = Math.min(this.map.h - hh, Math.max(hh, this.y));
  }

  private shooting(dt: number, input: MilitiaInput) {
    this.cooldown -= dt;
    this.throwCd -= dt;
    const d = weaponDef(this.weapon);
    if (this.reloadT > 0) {
      this.reloadT -= dt;
      if (this.reloadT <= 0) this.ammo[this.weapon] = d.mag;
    }
    const pressed = input.fire && !this.lastFireHeld;
    this.lastFireHeld = input.fire;
    if (!input.fire || this.cooldown > 0 || this.reloadT > 0) return;
    if (this.ammo[this.weapon] <= 0) {
      if (pressed) this.hooks.sfx("mEmpty");
      this.startReload();
      return;
    }
    this.ammo[this.weapon] -= 1;
    this.cooldown = 1 / d.rate;
    const mx = this.x + Math.cos(this.aim) * 28;
    const my = this.y - 4 + Math.sin(this.aim) * 28;
    for (let i = 0; i < d.pellets; i++) {
      const a = this.aim + (Math.random() - 0.5) * 2 * d.spread;
      this.spawnProj(d.id, true, this.myId, mx, my, a, 0);
    }
    this.hooks.fire({ w: d.id, x: mx, y: my, a: this.aim, p: 0 });
    this.fireFx(d.id, mx, my, this.aim);
    // recoil
    this.vx -= Math.cos(this.aim) * d.recoil;
    if (!this.grounded) this.vy -= Math.sin(this.aim) * d.recoil * 0.6;
    if (this.ammo[this.weapon] <= 0) this.startReload();
  }

  private fireFx(id: string, x: number, y: number, a: number) {
    const snd = id === "smg" ? "mSmg" : id === "shotgun" ? "mShotgun" : id === "sniper" ? "mSniper" : id === "rocket" ? "mRocket" : "mShot";
    this.hooks.sfx(snd);
    for (let i = 0; i < 3; i++) {
      this.parts.push({
        x, y, vx: Math.cos(a) * 200 + (Math.random() - 0.5) * 120, vy: Math.sin(a) * 200 + (Math.random() - 0.5) * 120,
        life: 0.12, max: 0.12, size: 4, color: "#FFE28A", grav: 0,
      });
    }
  }

  /** Bullets fired by somebody else: purely visual. */
  onRemoteFire(f: { id: string; w: string; x: number; y: number; a: number; p: number }) {
    const d = weaponDef(f.w);
    if (f.w === "grenade") this.spawnProj("grenade", false, f.id, f.x, f.y, f.a, 0);
    else for (let i = 0; i < d.pellets; i++) this.spawnProj(d.id, false, f.id, f.x, f.y, f.a + (Math.random() - 0.5) * 2 * d.spread, 0);
    this.fireFx(f.w, f.x, f.y, f.a);
  }

  private spawnProj(w: string, mine: boolean, owner: string, x: number, y: number, a: number, extra: number) {
    const d = weaponDef(w);
    let sp = d.speed + extra;
    let vx = Math.cos(a) * sp;
    let vy = Math.sin(a) * sp;
    if (w === "grenade") {
      // inherits a little of the thrower's speed
      vx += mine ? this.vx * 0.4 : 0;
      vy += mine ? this.vy * 0.4 : 0;
      sp = Math.hypot(vx, vy);
    }
    this.proj.push({ owner, mine, w, x, y, vx, vy, age: 0, life: d.life, dmg: d.dmg });
  }

  private updateProj(dt: number) {
    const keep: Proj[] = [];
    for (const p of this.proj) {
      const d = weaponDef(p.w);
      p.age += dt;
      if (p.age >= p.life) {
        if (p.w === "grenade" || p.w === "rocket") this.explode(p, p.x, p.y);
        continue;
      }
      if (p.w === "grenade") {
        this.stepGrenade(p, dt);
        keep.push(p);
        continue;
      }
      const dist = Math.hypot(p.vx, p.vy) * dt;
      const n = Math.max(1, Math.ceil(dist / 10));
      const sx = (p.vx * dt) / n;
      const sy = (p.vy * dt) / n;
      let dead = false;
      for (let i = 0; i < n && !dead; i++) {
        p.x += sx;
        p.y += sy;
        if (d.grav) p.vy += GRAVITY * this.map.gravity * d.grav * (dt / n);
        if (this.solidsHit(p.x - 1, p.y - 1, 2, 2) || p.x < 0 || p.y < 0 || p.x > this.map.w || p.y > this.map.h) {
          dead = true;
          if (d.splash) this.explode(p, p.x, p.y);
          else this.sparks(p.x, p.y);
          break;
        }
        if (p.mine) {
          for (const peer of this.peers.values()) {
            if (!peer.alive) continue;
            if (Math.abs(p.x - peer.rx) < PW / 2 + 5 && Math.abs(p.y - peer.ry) < PH / 2 + 5) {
              if (d.splash) this.explode(p, p.x, p.y);
              else {
                this.hooks.hit(peer.id, p.dmg, p.w);
                this.blood(p.x, p.y);
              }
              dead = true;
              break;
            }
          }
        } else if (this.alive && Math.abs(p.x - this.x) < PW / 2 + 5 && Math.abs(p.y - this.y) < PH / 2 + 5) {
          if (d.splash) this.explode(p, p.x, p.y);
          else this.blood(p.x, p.y);
          dead = true;
        }
      }
      if (!dead) keep.push(p);
    }
    this.proj = keep;
  }

  private stepGrenade(p: Proj, dt: number) {
    p.vy = Math.min(MAX_FALL * 1.2, p.vy + GRAVITY * this.map.gravity * dt);
    p.x += p.vx * dt;
    if (this.solidsHit(p.x - 5, p.y - 5, 10, 10)) {
      p.x -= p.vx * dt;
      p.vx *= -0.5;
    }
    p.y += p.vy * dt;
    if (this.solidsHit(p.x - 5, p.y - 5, 10, 10)) {
      p.y -= p.vy * dt;
      p.vy *= -0.45;
      p.vx *= 0.8;
      if (Math.abs(p.vy) < 40) p.vy = 0;
    }
  }

  private explode(p: Proj, x: number, y: number) {
    const d = weaponDef(p.w);
    this.hooks.sfx("mBoom");
    this.burst(x, y, "#FFB04D", 30, 420);
    this.burst(x, y, "#FF6B6B", 14, 260);
    this.shake = Math.max(this.shake, 0.3);
    // knockback for me, whoever fired
    if (this.alive) {
      const dx = this.x - x;
      const dy = this.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < d.splash * 1.4) {
        const k = (1 - dist / (d.splash * 1.4)) * 720;
        const n = dist || 1;
        this.vx += (dx / n) * k;
        this.vy += (dy / n) * k - 120;
      }
    }
    if (p.mine) {
      for (const peer of this.peers.values()) {
        if (!peer.alive) continue;
        const dist = Math.hypot(peer.rx - x, peer.ry - y);
        if (dist < d.splash + 14) {
          const dmg = Math.max(8, Math.round(d.dmg * (1 - dist / (d.splash + 14))));
          this.hooks.hit(peer.id, dmg, p.w);
        }
      }
    }
  }

  private updatePeers(dt: number) {
    const now = performance.now();
    for (const p of this.peers.values()) {
      const age = Math.min(0.15, (now - p.at) / 1000);
      const tx = p.x + p.vx * age;
      const ty = p.y + p.vy * age;
      if (Math.hypot(tx - p.rx, ty - p.ry) > 240) {
        p.rx = tx;
        p.ry = ty;
      } else {
        const k = Math.min(1, dt * 22);
        p.rx += (tx - p.rx) * k;
        p.ry += (ty - p.ry) * k;
      }
      if (p.jet && p.alive && Math.random() < 0.6) {
        this.parts.push({
          x: p.rx - 4 + Math.random() * 8, y: p.ry + PH / 2, vx: (Math.random() - 0.5) * 60, vy: 160 + Math.random() * 80,
          life: 0.25, max: 0.25, size: 5, color: "#FFB04D", grav: 0,
        });
      }
    }
  }

  private askCrates(dt: number) {
    for (const [id, t] of this.crateAsked) {
      if (t - dt <= 0) this.crateAsked.delete(id);
      else this.crateAsked.set(id, t - dt);
    }
    if (!this.alive) return;
    for (const c of this.crates) {
      if (c.taken || this.crateAsked.has(c.id)) continue;
      const pos = this.map.crates[c.id];
      if (!pos) continue;
      if (Math.abs(pos[0] - this.x) < 30 && Math.abs(pos[1] - this.y) < 34) {
        this.crateAsked.set(c.id, 0.6);
        this.hooks.pickup(c.id);
      }
    }
  }

  /* ---------- particles ---------- */

  private flame() {
    this.parts.push({
      x: this.x - 4 + Math.random() * 8, y: this.y + PH / 2 - 4, vx: (Math.random() - 0.5) * 50, vy: 180 + Math.random() * 100,
      life: 0.28, max: 0.28, size: 5, color: Math.random() < 0.5 ? "#FFB04D" : "#FFE28A", grav: 0,
    });
  }

  private sparks(x: number, y: number) {
    this.burst(x, y, "#FFE28A", 3, 140);
  }

  private blood(x: number, y: number) {
    this.burst(x, y, "#FF6B8B", 6, 200);
  }

  burst(x: number, y: number, color: string, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * speed;
      this.parts.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.35 + Math.random() * 0.35, max: 0.7,
        size: 3 + Math.random() * 4, color, grav: 600,
      });
    }
    if (this.parts.length > 400) this.parts.splice(0, this.parts.length - 400);
  }

  private updateParts(dt: number) {
    for (const p of this.parts) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.grav * dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
  }
}
