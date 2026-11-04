import type { TootHazard, TootLevel, TootPlayer, TootPlayerSnap, TootVehicleInfo } from "@/types";
import { findAvatar, getAvatarImage } from "../kart/avatars";
import type { Theme } from "../kart/engine";

export const VIEW_W = 800;
export const VIEW_H = 500;

/** Where each player sits on the vehicle. Must match the server. */
export const slotX = (i: number, n: number, w: number) => (n === 1 ? 0 : -w * 0.34 + w * 0.68 * (i / (n - 1)));

export interface Pose {
  x: number;
  y: number;
  a: number;
  gt: number;
  dead: boolean;
  cp: number;
  ps: TootPlayerSnap[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  hue: number;
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

function emoji(ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, size: number, flip = false, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = alpha;
  ctx.font = `${Math.round(size)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(ch, 0, 0);
  ctx.restore();
}

export function drawAvatar(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, size: number) {
  const av = findAvatar(id);
  const img = getAvatarImage(av);
  if (img) {
    const ar = img.naturalWidth / img.naturalHeight;
    const w = ar >= 1 ? size : size * ar;
    const h = ar >= 1 ? size / ar : size;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  } else {
    emoji(ctx, av.fallback, x, y + 2, size * 0.8);
  }
}

/** The vehicle hull, centered on (0, 0). A row of its emoji decorates the hull. */
export function drawVehicle(ctx: CanvasRenderingContext2D, v: TootVehicleInfo, ink: string, time: number) {
  const { w, h } = v;
  ctx.lineWidth = 3;
  ctx.strokeStyle = ink;

  if (v.wheels) {
    for (const wx of [-w * 0.32, w * 0.32]) {
      ctx.fillStyle = "#3b2f4f";
      ctx.beginPath();
      ctx.arc(wx, h / 2, h * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(wx, h / 2, h * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (v.propeller) {
    ctx.save();
    ctx.translate(w / 2 + 6, 0);
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 6 + 24 * Math.abs(Math.cos(time / 40)), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = v.color;
  rr(ctx, -w / 2, -h / 2, w, h, Math.min(10, h / 2));
  ctx.fill();
  ctx.stroke();

  const size = h * 1.5;
  const count = Math.max(2, Math.round(w / (size * 1.1)));
  for (let i = 0; i < count; i++) {
    emoji(ctx, v.emoji, -w / 2 + (w * (i + 0.5)) / count, 1, size);
  }
}

/** Where a hazard is at game time gt. `dir` is the sign of its horizontal movement. */
function hazardPos(h: TootHazard, gt: number) {
  const phase = (2 * Math.PI * gt) / h.period + h.phase;
  const s = Math.sin(phase);
  if (h.swing) {
    const a = h.swing.amp * s;
    return { x: h.swing.px + h.swing.len * Math.sin(a), y: h.swing.py + h.swing.len * Math.cos(a), a, dir: Math.cos(phase) };
  }
  return { x: h.x + h.w / 2 + h.ax * s, y: h.y + h.h / 2 + h.ay * s, a: 0, dir: Math.cos(phase) * (h.ax || 1) };
}

function drawHazard(ctx: CanvasRenderingContext2D, h: TootHazard, gt: number, time: number, th: Theme, height: number) {
  const p = hazardPos(h, gt);
  const r = h.w / 2;
  ctx.lineWidth = 2;
  ctx.strokeStyle = th.ink;

  switch (h.skin) {
    case "spikes":
    case "thorns": {
      const up = h.y + h.h / 2 > height / 2;
      const count = Math.max(1, Math.round(h.w / 30));
      const tw = h.w / count;
      ctx.fillStyle = h.skin === "spikes" ? "#C9D1DC" : "#5CB85C";
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        if (up) {
          ctx.moveTo(h.x + i * tw, h.y + h.h);
          ctx.lineTo(h.x + i * tw + tw / 2, h.y);
          ctx.lineTo(h.x + (i + 1) * tw, h.y + h.h);
        } else {
          ctx.moveTo(h.x + i * tw, h.y);
          ctx.lineTo(h.x + i * tw + tw / 2, h.y + h.h);
          ctx.lineTo(h.x + (i + 1) * tw, h.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "fire": {
      const count = Math.max(1, Math.round(h.w / 40));
      for (let i = 0; i < count; i++) {
        emoji(ctx, "🔥", h.x + ((i + 0.5) * h.w) / count, h.y + h.h / 2 + Math.sin(time / 120 + i) * 2, 52);
      }
      break;
    }
    case "poop": {
      const count = Math.max(1, Math.round(h.w / 46));
      for (let i = 0; i < count; i++) {
        const px = h.x + ((i + 0.5) * h.w) / count;
        const py = h.y + h.h / 2 + 2;
        emoji(ctx, "💩", px, py, 54);
        for (let k = 0; k < 2; k++) {
          emoji(
            ctx, "🪰",
            px + Math.cos(time / 250 + i * 1.7 + k * 3.1) * 26,
            py - 34 + Math.sin(time / 170 + i + k * 2) * 10,
            22
          );
        }
      }
      break;
    }
    case "saw": {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time / 180);
      ctx.fillStyle = "#FF9AA2";
      for (let k = 0; k < 10; k++) {
        ctx.rotate((Math.PI * 2) / 10);
        ctx.beginPath();
        ctx.moveTo(r - 8, -7);
        ctx.lineTo(r + 8, 0);
        ctx.lineTo(r - 8, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "roach":
      emoji(ctx, "🪳", p.x, p.y, r * 2.2, p.dir > 0);
      break;
    case "dog":
      emoji(ctx, "🐕", p.x, p.y, r * 2.2, p.dir > 0);
      break;
    case "dino":
      emoji(ctx, "🦖", p.x, p.y, r * 1.9, p.dir > 0);
      break;
    case "bat":
      emoji(ctx, "🦇", p.x, p.y + Math.sin(time / 90) * 3, r * 2.2, p.dir > 0);
      break;
    case "ghost":
      emoji(ctx, "👻", p.x, p.y, r * 2, false, 0.7 + 0.25 * Math.sin(time / 300));
      break;
    case "spider": {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, h.hangFrom ?? 0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      emoji(ctx, "🕷️", p.x, p.y, r * 2.1);
      break;
    }
    case "chainsaw": {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.dir > 0) ctx.scale(-1, 1);
      ctx.fillStyle = "#E04B4B";
      rr(ctx, -34, -16, 40, 32, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#B8C0CC";
      rr(ctx, -62, -9, 34, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#333";
      for (let k = 0; k < 6; k++) {
        const tx = -60 + k * 5.5 + ((time / 40) % 5.5);
        ctx.beginPath();
        ctx.moveTo(tx, -9);
        ctx.lineTo(tx + 3, -14);
        ctx.lineTo(tx + 6, -9);
        ctx.fill();
      }
      ctx.restore();
      break;
    }
    case "hammer":
    case "blade": {
      const sw = h.swing!;
      ctx.strokeStyle = th.ink;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sw.px, sw.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (h.skin === "hammer") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        emoji(ctx, "🔨", 0, 0, r * 2.3);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = "#DDE5EE";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r, 0, Math.PI);
        ctx.arc(0, -r * 0.2, r * 0.55, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      break;
    }
  }
}

export function drawTootScene(
  ctx: CanvasRenderingContext2D,
  o: {
    level: TootLevel;
    vehicle: TootVehicleInfo;
    players: TootPlayer[];
    pose: Pose;
    cam: { x: number; y: number };
    particles: Particle[];
    mySlot: number;
    aimOwn: number;
    th: Theme;
    time: number;
  }
) {
  const { level, vehicle, players, pose, cam, particles, mySlot, aimOwn, th, time } = o;
  const n = players.length;
  const theme = level.theme;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  // map background: gradient and two parallax layers of emoji
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const layer = (items: string[], par: number, size: number, alpha: number, yBase: number, spacing: number) => {
    const span = spacing * 9;
    for (let i = 0; i < 9; i++) {
      const x = ((((i * spacing - cam.x * par) % span) + span) % span) - spacing;
      const y = yBase + ((i * 53) % 150) - cam.y * par * 0.3;
      emoji(ctx, items[i % items.length], x, y, size, false, alpha);
    }
  };
  layer(theme.far, 0.15, 64, 0.35, 60, 280);
  layer(theme.near, 0.35, 48, 0.5, 260, 240);

  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  const inView = (x: number, y: number, w: number, h: number) =>
    x + w > cam.x - 100 && x < cam.x + VIEW_W + 100 && y + h > cam.y - 100 && y < cam.y + VIEW_H + 100;

  // rock
  ctx.fillStyle = theme.rock;
  ctx.strokeStyle = theme.rockEdge;
  ctx.lineWidth = 3;
  for (const s of level.solids) {
    if (!inView(s.x, s.y, s.w, s.h)) continue;
    rr(ctx, s.x, s.y, s.w, s.h, 12);
    ctx.fill();
    ctx.stroke();
  }

  // checkpoints and finish
  level.checkpoints.forEach((c, i) => {
    if (!inView(c.x - 40, c.y - 120, 80, 140)) return;
    ctx.globalAlpha = pose.cp >= i ? 1 : 0.45;
    ctx.fillStyle = th.ink;
    ctx.fillRect(c.x - 2, c.y - 110, 4, 110);
    emoji(ctx, "🚩", c.x + 20, c.y - 95, 44);
    ctx.globalAlpha = 1;
  });
  if (inView(level.finishX, 0, 60, level.height)) {
    for (let r = 0; r < Math.ceil(level.height / 25); r++) {
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = (r + c) % 2 ? "#2d2540" : "#ffffff";
        ctx.fillRect(level.finishX + c * 25, r * 25, 25, 25);
      }
    }
  }

  // hazards
  for (const h of level.hazards) {
    const p = hazardPos(h, pose.gt);
    if (!inView(p.x - 400, p.y - 400, 800, 800)) continue;
    drawHazard(ctx, h, pose.gt, time, th, level.height);
  }

  // gas clouds
  for (const p of particles) {
    const t = p.age / p.life;
    ctx.globalAlpha = Math.max(0, 0.55 * (1 - t));
    ctx.fillStyle = `hsl(${p.hue}, 70%, 70%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.6 + t * 1.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // the vehicle with its cats
  if (!pose.dead) {
    ctx.save();
    ctx.translate(pose.x, pose.y);
    ctx.rotate(pose.a);
    drawVehicle(ctx, vehicle, th.ink, time);

    players.forEach((p, i) => {
      const sx = slotX(i, n, vehicle.w);
      const snap = pose.ps[i];
      const aim = i === mySlot ? aimOwn : snap?.aim ?? 0;
      const power = snap?.p ?? 0;

      // nozzle cone points the way the gas shoots out
      ctx.save();
      ctx.translate(sx, vehicle.h / 2);
      ctx.rotate(-aim);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = th.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 14 + power * 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (i === mySlot) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(sx, -vehicle.h / 2, 30, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const shake = power > 0.3 ? (Math.random() - 0.5) * 3 : 0;
      drawAvatar(ctx, p.avatar, sx + shake, -vehicle.h / 2 - 24 + Math.sin(time / 200 + i) * 1.5, 52);
    });
    ctx.restore();

    // name tags (not rotated, so they stay readable)
    const cos = Math.cos(pose.a);
    const sin = Math.sin(pose.a);
    ctx.font = `700 13px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    players.forEach((p, i) => {
      const lx = slotX(i, n, vehicle.w);
      const ly = -vehicle.h / 2 - 62;
      const wx = pose.x + lx * cos - ly * sin;
      const wy = pose.y + lx * sin + ly * cos;
      const w = ctx.measureText(p.name).width + 14;
      ctx.fillStyle = th.card;
      ctx.strokeStyle = th.ink;
      ctx.lineWidth = 2;
      rr(ctx, wx - w / 2, wy - 10, w, 20, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = th.ink;
      ctx.fillText(p.name, wx, wy + 1);
    });
  } else {
    emoji(ctx, "💥", pose.x, pose.y, 90);
  }
  ctx.restore();
}