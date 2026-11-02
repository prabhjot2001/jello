import type { TootLevel, TootPlayer, TootPlayerSnap } from "@/types";
import { findAvatar, getAvatarImage } from "../kart/avatars";
import type { Theme } from "../kart/engine";

export const VIEW_W = 800;
export const VIEW_H = 500;
const RAFT_W = 220;
const RAFT_H = 26;

/** Where each player sits on the raft. Must match the server. */
export const slotX = (i: number, n: number) => (n === 1 ? 0 : -RAFT_W * 0.34 + RAFT_W * 0.68 * (i / (n - 1)));

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

function drawAvatar(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, size: number) {
  const av = findAvatar(id);
  const img = getAvatarImage(av);
  if (img) {
    const ar = img.naturalWidth / img.naturalHeight;
    const w = ar >= 1 ? size : size * ar;
    const h = ar >= 1 ? size / ar : size;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  } else {
    ctx.font = `${Math.round(size * 0.8)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";
    ctx.fillText(av.fallback, x, y + 2);
  }
}

export function drawTootScene(
  ctx: CanvasRenderingContext2D,
  o: {
    level: TootLevel;
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
  const { level, players, pose, cam, particles, mySlot, aimOwn, th, time } = o;
  const n = players.length;
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  // sky + parallax
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(1, th.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.font = "40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.6;
  const span = VIEW_W + 160;
  for (let i = 0; i < 6; i++) {
    const cx = ((((i * 330 - cam.x * 0.2) % span) + span) % span) - 80;
    ctx.fillText("☁️", cx, 60 + (i % 3) * 50 - cam.y * 0.05);
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.translate(-cam.x, -cam.y);
  const inView = (x: number, y: number, w: number, h: number) =>
    x + w > cam.x - 80 && x < cam.x + VIEW_W + 80 && y + h > cam.y - 80 && y < cam.y + VIEW_H + 80;

  // rock
  ctx.fillStyle = "#D8CBF0";
  ctx.strokeStyle = th.ink;
  ctx.lineWidth = 3;
  for (const s of level.solids) {
    if (!inView(s.x, s.y, s.w, s.h)) continue;
    rr(ctx, s.x, s.y, s.w, s.h, 10);
    ctx.fill();
    ctx.stroke();
  }

  // checkpoints and finish
  level.checkpoints.forEach((c, i) => {
    if (!inView(c.x - 40, c.y - 120, 80, 140)) return;
    ctx.globalAlpha = pose.cp >= i ? 1 : 0.45;
    ctx.fillStyle = th.ink;
    ctx.fillRect(c.x - 2, c.y - 110, 4, 110);
    ctx.font = "44px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#000";
    ctx.fillText("🚩", c.x, c.y - 100);
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
    const s = Math.sin((2 * Math.PI * pose.gt) / h.period + h.phase);
    const hx = h.x + h.ax * s;
    const hy = h.y + h.ay * s;
    if (!inView(hx, hy, h.w, h.h)) continue;
    ctx.lineWidth = 2;
    ctx.strokeStyle = th.ink;
    if (h.kind === "spikes") {
      const up = h.y + h.h / 2 > level.height / 2;
      const count = Math.max(1, Math.round(h.w / 30));
      const tw = h.w / count;
      ctx.fillStyle = "#FF7B9C";
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        if (up) {
          ctx.moveTo(hx + i * tw, hy + h.h);
          ctx.lineTo(hx + i * tw + tw / 2, hy);
          ctx.lineTo(hx + (i + 1) * tw, hy + h.h);
        } else {
          ctx.moveTo(hx + i * tw, hy);
          ctx.lineTo(hx + i * tw + tw / 2, hy + h.h);
          ctx.lineTo(hx + (i + 1) * tw, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else {
      const r = h.w / 2;
      ctx.save();
      ctx.translate(hx + r, hy + r);
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
    }
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

  // the raft with its cats
  if (!pose.dead) {
    ctx.save();
    ctx.translate(pose.x, pose.y);
    ctx.rotate(pose.a);
    ctx.fillStyle = "#E8C48F";
    ctx.strokeStyle = th.ink;
    ctx.lineWidth = 3;
    rr(ctx, -RAFT_W / 2, -RAFT_H / 2, RAFT_W, RAFT_H, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(120,80,40,0.45)";
    ctx.lineWidth = 2;
    for (let k = 1; k < 6; k++) {
      const px = -RAFT_W / 2 + (k * RAFT_W) / 6;
      ctx.beginPath();
      ctx.moveTo(px, -RAFT_H / 2 + 3);
      ctx.lineTo(px, RAFT_H / 2 - 3);
      ctx.stroke();
    }

    players.forEach((p, i) => {
      const sx = slotX(i, n);
      const snap = pose.ps[i];
      const aim = i === mySlot ? aimOwn : snap?.aim ?? 0;
      const power = snap?.p ?? 0;

      // nozzle cone points the way the gas shoots out
      ctx.save();
      ctx.translate(sx, RAFT_H / 2);
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
        ctx.ellipse(sx, -RAFT_H / 2, 30, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const shake = power > 0.3 ? (Math.random() - 0.5) * 3 : 0;
      drawAvatar(ctx, p.avatar, sx + shake, -RAFT_H / 2 - 24 + Math.sin(time / 200 + i) * 1.5, 52);
    });
    ctx.restore();

    // name tags (not rotated, so they stay readable)
    const cos = Math.cos(pose.a);
    const sin = Math.sin(pose.a);
    ctx.font = `700 13px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    players.forEach((p, i) => {
      const lx = slotX(i, n);
      const ly = -RAFT_H / 2 - 62;
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
    ctx.font = "90px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💥", pose.x, pose.y);
  }
  ctx.restore();
}