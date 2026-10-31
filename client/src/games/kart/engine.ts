import type { KartDifficulty } from "@/types";
import { findAvatar, getAvatarImage } from "./avatars";

/* ---------- layout (logical pixels, canvas is drawn at 2x) ---------- */
export const W = 720;
export const TOP_H = 44;
export const STRIP_H = 250;
export const GAP = 8;
export const H = TOP_H + STRIP_H * 2 + GAP;
const GROUND = 196;
const KART_SCREEN_X = 170;

/* ---------- physics ---------- */
export const STEP = 1 / 120;
const GRAVITY = 2600;
const JUMP_V = 780;
const CRASH_TIME = 0.9;
const JUMP_BUFFER = 0.12;
const DUCK_TIME = 0.55;

export const F_DUCK = 1;
export const F_BOOST = 2;
export const F_SHIELD = 4;

/** Difficulty levels. duckAt / patrolAt / comboAt = track progress (0..1) where that feature unlocks; 2 = never. */
interface Cfg {
  speed: [number, number];
  gap: [number, number];
  duckAt: number;
  patrolAt: number;
  comboAt: number;
  pad: number;
}
const CFG: Record<KartDifficulty, Cfg> = {
  chill: { speed: [330, 400], gap: [650, 950], duckAt: 0.45, patrolAt: 2, comboAt: 2, pad: 0.25 },
  normal: { speed: [380, 470], gap: [520, 820], duckAt: 0.25, patrolAt: 0.6, comboAt: 0.8, pad: 0.2 },
  hard: { speed: [420, 540], gap: [440, 700], duckAt: 0.1, patrolAt: 0.3, comboAt: 0.5, pad: 0.2 },
  insane: { speed: [470, 620], gap: [380, 600], duckAt: 0, patrolAt: 0.15, comboAt: 0.25, pad: 0.18 },
};

const lerpSpeed = (d: KartDifficulty, p: number) => {
  const [a, b] = CFG[d].speed;
  return a + (b - a) * Math.min(1, Math.max(0, p));
};

/* ---------- track ---------- */
export interface Hurdle {
  x: number;
  w: number;
  /** vertical extent above the road: floor hurdles 0..h, overhead obstacles 62..112 */
  y0: number;
  y1: number;
  emoji: string;
  /** patrolling hurdles slide left and right */
  amp: number;
  omega: number;
  phase: number;
}
export interface Coin { x: number; y: number }
export interface Pad { x: number; w: number }
export interface Box { x: number }
export interface Track {
  hurdles: Hurdle[];
  coins: Coin[];
  pads: Pad[];
  boxes: Box[];
}

const FLOOR = [
  { emoji: "🚧", w: 56, y0: 0, y1: 50 },
  { emoji: "📦", w: 50, y0: 0, y1: 52 },
  { emoji: "🧱", w: 56, y0: 0, y1: 46 },
  { emoji: "🍌", w: 40, y0: 0, y1: 28 },
  { emoji: "🌵", w: 40, y0: 0, y1: 60 },
];
const OVERHEAD = [
  { emoji: "🦅", w: 56, y0: 62, y1: 112 },
  { emoji: "🦇", w: 52, y0: 62, y1: 112 },
];
const PATROL = [
  { emoji: "🦀", w: 46, y0: 0, y1: 38 },
  { emoji: "🐢", w: 50, y0: 0, y1: 36 },
];

const mk = (
  x: number,
  o: { emoji: string; w: number; y0: number; y1: number },
  amp = 0,
  omega = 0,
  phase = 0
): Hurdle => ({ x, w: o.w, y0: o.y0, y1: o.y1, emoji: o.emoji, amp, omega, phase });

export const hurdleX = (h: Hurdle, t: number) => (h.amp ? h.x + h.amp * Math.sin(h.omega * t + h.phase) : h.x);

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Same seed + settings gives the same track on both devices. */
export function buildTrack(seed: number, length: number, difficulty: KartDifficulty, items: boolean): Track {
  const rnd = mulberry32(seed);
  const cfg = CFG[difficulty];
  const t: Track = { hurdles: [], coins: [], pads: [], boxes: [] };
  const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)];

  // coins in an arc over a hurdle (reward for jumping) or in a line (reward for ducking / driving)
  const coinArc = (cx: number, top: number) => {
    for (let i = 0; i < 5; i++) {
      t.coins.push({ x: cx + (i - 2) * 34, y: top + 18 + Math.round(50 * Math.sin((Math.PI * i) / 4)) });
    }
  };
  const coinLine = (x0: number, n: number) => {
    for (let i = 0; i < n; i++) t.coins.push({ x: x0 + i * 38, y: 22 });
  };

  let x = 1100;
  while (x < length - 900) {
    const p = x / length;
    const v = lerpSpeed(difficulty, p);
    const roll = rnd();
    let end: number;

    if (p >= cfg.duckAt && roll < 0.3) {
      const o = pick(OVERHEAD);
      t.hurdles.push(mk(x, o));
      coinLine(x - 50, 5);
      end = x + o.w;
    } else if (p >= cfg.patrolAt && roll < 0.5) {
      x += 70;
      const o = pick(PATROL);
      t.hurdles.push(mk(x, o, 70, 2.2 + rnd(), rnd() * 6.28));
      coinArc(x + o.w / 2, o.y1);
      end = x + o.w + 70;
    } else {
      const o = pick(FLOOR);
      t.hurdles.push(mk(x, o));
      coinArc(x + o.w / 2, o.y1);
      end = x + o.w;
      // combo: a jump followed by a duck
      if (p >= cfg.comboAt && rnd() < 0.3) {
        const o2 = pick(OVERHEAD);
        const x2 = end + v * 0.95;
        t.hurdles.push(mk(x2, o2));
        coinLine(x2 - 50, 5);
        end = x2 + o2.w;
      }
    }

    // fairness rule: always leave enough room to land and react
    const gap = Math.max(cfg.gap[0] + rnd() * (cfg.gap[1] - cfg.gap[0]), v * 0.7);
    let next = end + gap;
    if (p > 0.1 && rnd() < cfg.pad) {
      const px = end + gap * 0.35;
      t.pads.push({ x: px, w: 70 });
      next = Math.max(next, px + 70 + v * 1.25); // extra room after a speed boost
    } else if (items && rnd() < 0.4) {
      t.boxes.push({ x: end + gap * 0.5 });
    } else if (rnd() < 0.5) {
      coinLine(end + gap * 0.25, 4);
    }
    x = next;
  }
  return t;
}

/* ---------- items ---------- */
export type Item = "banana" | "shield" | "nitro";
export const ITEM_EMOJI: Record<Item, string> = { banana: "🍌", shield: "🛡️", nitro: "🚀" };

/** behind > 0 means you are behind your partner. Mild catch-up: the trailing player gets nitro more often. */
export function rollItem(behind: number): Item {
  const w: Record<Item, number> =
    behind > 1200
      ? { nitro: 0.55, shield: 0.15, banana: 0.3 }
      : behind < -1200
        ? { nitro: 0.2, shield: 0.5, banana: 0.3 }
        : { nitro: 0.3, shield: 0.3, banana: 0.4 };
  let r = Math.random();
  for (const k of Object.keys(w) as Item[]) {
    r -= w[k];
    if (r <= 0) return k;
  }
  return "banana";
}

export const makeBanana = (x: number): Hurdle => ({
  x, w: 44, y0: 0, y1: 34, emoji: "🍌", amp: 0, omega: 0, phase: 0,
});

/* ---------- simulation (runs locally on each device) ---------- */
export interface KartSim {
  t: number;
  x: number;
  y: number;
  vy: number;
  speed: number;
  wheel: number;
  crashT: number;
  crashes: number;
  jumpBuf: number;
  duckT: number;
  boostT: number;
  boostMul: number;
  shield: boolean;
  item: Item | null;
  finished: boolean;
  coins: number;
  hit: Set<number>;
  coinTaken: Set<number>;
  boxTaken: Set<number>;
  padTaken: Set<number>;
  extras: Hurdle[];
  extraHit: Set<number>;
}

export const newSim = (): KartSim => ({
  t: 0, x: 0, y: 0, vy: 0, speed: 0, wheel: 0,
  crashT: 0, crashes: 0, jumpBuf: 0, duckT: 0, boostT: 0, boostMul: 1,
  shield: false, item: null, finished: false, coins: 0,
  hit: new Set(), coinTaken: new Set(), boxTaken: new Set(), padTaken: new Set(),
  extras: [], extraHit: new Set(),
});

export const pressJump = (sim: KartSim) => {
  sim.jumpBuf = JUMP_BUFFER;
};

/** On the road: crouch under overhead obstacles. In the air: fast-fall. */
export const pressDuck = (sim: KartSim) => {
  if (sim.y > 0) sim.vy = Math.min(sim.vy, -950);
  else sim.duckT = DUCK_TIME;
};

export const applyShield = (sim: KartSim) => {
  sim.shield = true;
};
export const applyNitro = (sim: KartSim) => {
  sim.boostT = Math.max(sim.boostT, 1.5);
  sim.boostMul = 1.7;
};
export const addBanana = (sim: KartSim, x: number) => {
  sim.extras.push(makeBanana(x));
};

export const flagsOf = (s: KartSim) =>
  (s.duckT > 0 ? F_DUCK : 0) | (s.boostT > 0 ? F_BOOST : 0) | (s.shield ? F_SHIELD : 0);

export interface StepEvents {
  jumped: boolean;
  crashed: boolean;
  finished: boolean;
  shielded: boolean;
  boosted: boolean;
  box: boolean;
  coins: number;
}

export function step(sim: KartSim, dt: number, tr: Track, length: number, difficulty: KartDifficulty): StepEvents {
  const ev: StepEvents = {
    jumped: false, crashed: false, finished: false, shielded: false, boosted: false, box: false, coins: 0,
  };
  sim.t += dt;

  // jump (with a small input buffer so an early tap still counts)
  if (sim.jumpBuf > 0) {
    sim.jumpBuf -= dt;
    if (sim.y <= 0 && sim.vy <= 0 && !sim.finished) {
      sim.vy = JUMP_V;
      sim.y = 0.01;
      sim.jumpBuf = 0;
      sim.duckT = 0;
      ev.jumped = true;
    }
  }
  if (sim.y > 0 || sim.vy > 0) {
    sim.vy -= GRAVITY * dt;
    sim.y += sim.vy * dt;
    if (sim.y <= 0) {
      sim.y = 0;
      sim.vy = 0;
    }
  }
  sim.duckT = Math.max(0, sim.duckT - dt);
  sim.crashT = Math.max(0, sim.crashT - dt);
  sim.boostT = Math.max(0, sim.boostT - dt);

  const base = lerpSpeed(difficulty, sim.x / length);
  const crashFactor = sim.crashT > 0 ? 0.3 + 0.7 * (1 - sim.crashT / CRASH_TIME) : 1;
  const boost = sim.boostT > 0 ? sim.boostMul : 1;
  sim.speed = sim.finished ? Math.max(0, sim.speed - 500 * dt) : base * crashFactor * boost;
  sim.x += sim.speed * dt;
  sim.wheel += (sim.speed * dt) / 12;
  if (sim.finished) return ev;

  const left = sim.x - 26;
  const right = sim.x + 26;
  const top = sim.y + (sim.duckT > 0 ? 46 : 92);

  const collide = (h: Hurdle, i: number, hits: Set<number>) => {
    const hx = hurdleX(h, sim.t);
    if (hx + h.w < left || hx > right || hits.has(i)) return;
    if (sim.y < h.y1 - 6 && top > h.y0 + 4) {
      hits.add(i);
      if (sim.shield) {
        sim.shield = false;
        ev.shielded = true;
      } else {
        sim.crashT = CRASH_TIME;
        sim.crashes++;
        sim.boostT = 0;
        ev.crashed = true;
      }
    }
  };
  tr.hurdles.forEach((h, i) => collide(h, i, sim.hit));
  sim.extras.forEach((h, i) => collide(h, i, sim.extraHit));

  tr.coins.forEach((c, i) => {
    if (sim.coinTaken.has(i) || c.x < left - 14 || c.x > right + 14) return;
    if (c.y >= sim.y - 12 && c.y <= top - 8) {
      sim.coinTaken.add(i);
      sim.coins++;
      ev.coins++;
    }
  });

  tr.boxes.forEach((b, i) => {
    if (sim.item || sim.boxTaken.has(i) || Math.abs(b.x - sim.x) > 36 || sim.y > 60) return;
    sim.boxTaken.add(i);
    ev.box = true;
  });

  tr.pads.forEach((p, i) => {
    if (sim.padTaken.has(i) || sim.y > 24 || sim.x < p.x || sim.x > p.x + p.w) return;
    sim.padTaken.add(i);
    sim.boostT = Math.max(sim.boostT, 0.9);
    sim.boostMul = Math.max(sim.boostMul, 1.55);
    ev.boosted = true;
  });

  if (sim.x >= length) {
    sim.finished = true;
    ev.finished = true;
  }
  return ev;
}

/* ---------- drawing ---------- */
export interface Theme {
  skyTop: string;
  skyBottom: string;
  ink: string;
  card: string;
}

export function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    skyTop: v("--secondary", "#D4F5E6"),
    skyBottom: v("--background", "#FFF4E6"),
    ink: v("--border", "#4A3566"),
    card: v("--card", "#FFFFFF"),
  };
}

export interface StripInput {
  name: string;
  avatarId: string;
  color: string;
  x: number;
  y: number;
  vy: number;
  crashT: number;
  wheel: number;
  coins: number;
  flags: number;
  finished: boolean;
  /** time used to animate patrolling hurdles */
  t: number;
  extras: Hurdle[];
  // own strip only: what has already been picked up / hit
  knocked?: Set<number>;
  coinTaken?: Set<number>;
  boxTaken?: Set<number>;
  extraHit?: Set<number>;
}

const FONT = '"Fredoka Variable", "Nunito Variable", sans-serif';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The kart with the avatar sticker sitting on top. (cx, ground) is where the wheels touch the road. */
export function drawKart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  ground: number,
  p: Pick<StripInput, "avatarId" | "color" | "y" | "vy" | "crashT" | "wheel" | "flags">,
  th: Theme,
  time: number
) {
  const av = findAvatar(p.avatarId);
  const img = getAvatarImage(av);
  const duck = p.flags & F_DUCK ? 1 : 0;

  const sh = Math.max(0.45, 1 - p.y / 170);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx, ground + 3, 46 * sh, 7 * sh, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, ground - p.y);
  ctx.scale(1 + 0.06 * duck, 1 - 0.28 * duck);
  const tilt =
    Math.max(-0.2, Math.min(0.2, -p.vy * 0.00028)) + (p.crashT > 0 ? Math.sin(p.crashT * 38) * 0.1 : 0);
  ctx.rotate(tilt);
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.strokeStyle = th.ink;

  // boost flame
  if (p.flags & F_BOOST) {
    const fl = 18 + Math.random() * 10;
    ctx.fillStyle = "#FF9A3C";
    ctx.beginPath();
    ctx.moveTo(-44, -34);
    ctx.lineTo(-44 - fl, -26);
    ctx.lineTo(-44, -18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFE066";
    ctx.beginPath();
    ctx.moveTo(-44, -30);
    ctx.lineTo(-44 - fl * 0.55, -26);
    ctx.lineTo(-44, -22);
    ctx.closePath();
    ctx.fill();
  }

  // wheels
  for (const wx of [-27, 27]) {
    ctx.fillStyle = "#3b2f4f";
    ctx.beginPath();
    ctx.arc(wx, -12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(wx, -12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3b2f4f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx, -12);
    ctx.lineTo(wx + Math.cos(p.wheel) * 5, -12 + Math.sin(p.wheel) * 5);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = th.ink;
  }

  // body
  ctx.fillStyle = p.color;
  rr(ctx, -42, -44, 84, 28, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  rr(ctx, -34, -40, 40, 6, 3);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  rr(ctx, 30, -36, 14, 14, 5);
  ctx.fill();

  // avatar sticker
  ctx.save();
  ctx.translate(-2, -66 + (p.crashT > 0 ? 0 : Math.sin(time / 90) * 1.2));
  if (p.crashT > 0) ctx.rotate(p.crashT * 14);
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 4;
  if (img) {
    const s = 58;
    const ar = img.naturalWidth / img.naturalHeight;
    const w = ar >= 1 ? s : s * ar;
    const h = ar >= 1 ? s / ar : s;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.font = "46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(av.fallback, 0, 2);
  }
  ctx.restore();

  // seat rim over the sticker so the driver looks seated inside the kart
  ctx.fillStyle = p.color;
  rr(ctx, -26, -46, 48, 12, 6);
  ctx.fill();
  ctx.stroke();

  // shield bubble
  if (p.flags & F_SHIELD) {
    ctx.fillStyle = "rgba(120,200,255,0.22)";
    ctx.strokeStyle = "rgba(90,170,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(0, -52, 66, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawMarker(ctx: CanvasRenderingContext2D, th: Theme, p: StripInput, px: number, y: number) {
  const av = findAvatar(p.avatarId);
  const img = getAvatarImage(av);
  ctx.fillStyle = p.color;
  ctx.strokeStyle = th.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (img) {
    ctx.drawImage(img, px - 10, y - 10, 20, 20);
  } else {
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(av.fallback, px, y + 1);
  }
}

function drawProgress(ctx: CanvasRenderingContext2D, th: Theme, opp: StripInput, me: StripInput, length: number) {
  const x0 = 46;
  const x1 = W - 46;
  const y = 22;
  ctx.fillStyle = th.card;
  ctx.strokeStyle = th.ink;
  ctx.lineWidth = 2;
  rr(ctx, x0 - 8, y - 7, x1 - x0 + 16, 14, 7);
  ctx.fill();
  ctx.stroke();
  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏁", x1 + 22, y + 1);
  for (const p of [opp, me]) {
    const f = Math.min(1, Math.max(0, p.x / length));
    drawMarker(ctx, th, p, x0 + (x1 - x0) * f, y);
  }
}

function drawStrip(
  ctx: CanvasRenderingContext2D,
  top: number,
  p: StripInput,
  track: Track,
  length: number,
  th: Theme,
  time: number
) {
  const cam = p.x - KART_SCREEN_X;
  ctx.save();
  ctx.translate(0, top);
  ctx.beginPath();
  ctx.rect(0, 0, W, STRIP_H);
  ctx.clip();

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(1, th.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND);

  if (p.crashT > 0.55) ctx.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);

  // clouds + hills (parallax)
  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.8;
  const span = W + 120;
  for (let i = 0; i < 5; i++) {
    const cx = ((((i * 260 - cam * 0.15) % span) + span) % span) - 60;
    ctx.fillText("☁️", cx, 34 + (i % 3) * 22);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#E3D6FB";
  for (let i = -1; i < 4; i++) {
    const hx = i * 300 - ((cam * 0.4) % 300);
    ctx.beginPath();
    ctx.ellipse(hx + 150, GROUND - 20, 170, 62, 0, Math.PI, 0);
    ctx.fill();
  }

  // grass + road
  ctx.fillStyle = "#BFEBC9";
  ctx.fillRect(-10, GROUND - 26, W + 20, 20);
  ctx.fillStyle = "#B7B1CC";
  ctx.fillRect(-10, GROUND - 8, W + 20, STRIP_H);
  const curb = 40;
  const off = ((cam % (curb * 2)) + curb * 2) % (curb * 2);
  for (let x = -off; x < W; x += curb * 2) {
    ctx.fillStyle = "#FF8FA3";
    ctx.fillRect(x, GROUND - 8, curb, 6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + curb, GROUND - 8, curb, 6);
  }
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  const dash = 90;
  const off2 = ((cam % dash) + dash) % dash;
  for (let x = -off2; x < W; x += dash) ctx.fillRect(x, GROUND + 28, 46, 5);

  // start + finish lines
  for (const wx of [0, length]) {
    const sx = wx - cam;
    if (sx < -40 || sx > W + 40) continue;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 ? "#2d2540" : "#ffffff";
        ctx.fillRect(sx + c * 14, GROUND - 8 + r * 10, 14, 10);
      }
    }
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(wx === 0 ? "🚦" : "🏁", sx + 14, GROUND - 56);
  }

  // boost pads (flat on the road)
  for (const pad of track.pads) {
    const sx = pad.x - cam;
    if (sx + pad.w < -10 || sx > W + 10) continue;
    ctx.fillStyle = "#FFE066";
    ctx.strokeStyle = th.ink;
    ctx.lineWidth = 2;
    rr(ctx, sx, GROUND - 6, pad.w, 16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#FF9A3C";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const c0 = sx + 14 + i * 20;
      ctx.beginPath();
      ctx.moveTo(c0, GROUND - 2);
      ctx.lineTo(c0 + 8, GROUND + 2);
      ctx.lineTo(c0, GROUND + 6);
      ctx.stroke();
    }
  }

  // hurdles (floor, overhead, patrolling) and banana traps
  const drawHurdle = (h: Hurdle, knocked: boolean) => {
    const sx = hurdleX(h, p.t) - cam;
    if (sx + h.w < -20 || sx > W + 20) return;
    ctx.save();
    ctx.translate(sx + h.w / 2, GROUND);
    ctx.font = `${Math.round((h.y1 - h.y0) * 1.05)}px sans-serif`;
    ctx.textAlign = "center";
    if (knocked) {
      ctx.globalAlpha = 0.5;
      ctx.rotate(0.7);
      ctx.translate(14, -8);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(0, 2, h.w * 0.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#000";
    if (h.y0 > 0) {
      ctx.textBaseline = "middle";
      ctx.fillText(h.emoji, 0, -(h.y0 + h.y1) / 2);
    } else {
      ctx.textBaseline = "bottom";
      ctx.fillText(h.emoji, 0, 4);
    }
    ctx.restore();
  };
  track.hurdles.forEach((h, i) => drawHurdle(h, !!p.knocked?.has(i)));
  p.extras.forEach((h, i) => drawHurdle(h, !!p.extraHit?.has(i)));

  // coins
  track.coins.forEach((c, i) => {
    const sx = c.x - cam;
    if (sx < -16 || sx > W + 16) return;
    if (p.coinTaken ? p.coinTaken.has(i) : c.x < p.x - 20) return;
    const k = Math.abs(Math.cos(time / 260 + c.x * 0.05));
    ctx.fillStyle = "#FFD34D";
    ctx.strokeStyle = th.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx, GROUND - c.y, 3 + 9 * k, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // item boxes
  ctx.font = "34px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  track.boxes.forEach((b, i) => {
    const sx = b.x - cam;
    if (sx < -30 || sx > W + 30) return;
    if (p.boxTaken ? p.boxTaken.has(i) : b.x < p.x - 20) return;
    ctx.fillText("🎁", sx, GROUND - 55 + Math.sin(time / 200 + i) * 4);
  });

  drawKart(ctx, KART_SCREEN_X, GROUND, p, th, time);

  // name + coins chip
  ctx.font = `700 16px ${FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const label = `${p.name}   🪙 ${p.coins}`;
  const tw = ctx.measureText(label).width + 20;
  ctx.fillStyle = th.card;
  ctx.strokeStyle = th.ink;
  ctx.lineWidth = 2;
  rr(ctx, 10, 10, tw, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = th.ink;
  ctx.fillText(label, 20, 24);

  if (p.finished) {
    ctx.font = `700 34px ${FONT}`;
    ctx.textAlign = "center";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText("FINISHED 🏁", W / 2, 70);
    ctx.fillStyle = "#4A3566";
    ctx.fillText("FINISHED 🏁", W / 2, 70);
  }
  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  o: { opp: StripInput; me: StripInput; track: Track; length: number; th: Theme; time: number }
) {
  ctx.clearRect(0, 0, W, H);
  drawProgress(ctx, o.th, o.opp, o.me, o.length);
  drawStrip(ctx, TOP_H, o.opp, o.track, o.length, o.th, o.time);
  drawStrip(ctx, TOP_H + STRIP_H + GAP, o.me, o.track, o.length, o.th, o.time);
}