import type { MilitiaPlayerState } from "@/types";
import { PH, PW, type MilitiaWorld } from "./engine";
import { weaponDef } from "./weapons";

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

const VIEW_H = 620;

export function makeCamera(w: MilitiaWorld, cw: number, ch: number, focusX: number, focusY: number): Camera {
  const scale = Math.max(ch / VIEW_H, cw / w.map.w, ch / w.map.h);
  const vw = cw / scale;
  const vh = ch / scale;
  const shake = w.shake > 0 ? (Math.random() - 0.5) * 14 * w.shake : 0;
  const x = Math.min(Math.max(0, w.map.w - vw), Math.max(0, focusX - vw / 2)) + shake;
  const y = Math.min(Math.max(0, w.map.h - vh), Math.max(0, focusY - vh / 2)) + shake;
  return { x, y, scale };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function background(ctx: CanvasRenderingContext2D, w: MilitiaWorld, cw: number, ch: number, cam: Camera, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, w.map.sky[0]);
  g.addColorStop(1, w.map.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);
  const px = cam.x * 0.15;
  ctx.globalAlpha = 0.5;
  if (w.map.decor === "space" || w.map.decor === "cave") {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 60; i++) {
      const x = ((i * 977) % 2600) - px;
      const y = (i * 613) % ch;
      const s = 1 + (i % 3);
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.globalAlpha = 0.25 + 0.5 * tw;
      ctx.fillRect(((x % cw) + cw) % cw, y, s, s);
    }
  } else {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 7; i++) {
      const x = (((i * 520 + t * 12) - px) % (cw + 300)) - 150;
      const y = 60 + (i * 83) % (ch * 0.4);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(x, y, 90, 26, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 50, y - 14, 60, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, aim: number, weapon: string, jet: boolean, label: string, hp: number, me: boolean) {
  const face = Math.cos(aim) >= 0 ? 1 : -1;
  if (jet) {
    ctx.fillStyle = "#FFB04D";
    ctx.beginPath();
    ctx.moveTo(x - 6, y + PH / 2 - 4);
    ctx.lineTo(x + 6, y + PH / 2 - 4);
    ctx.lineTo(x, y + PH / 2 + 18 + Math.random() * 8);
    ctx.fill();
  }
  // jetpack
  ctx.fillStyle = "#6b6b86";
  rr(ctx, x - face * 16, y - 12, 9, 22, 3);
  ctx.fill();
  // body
  ctx.fillStyle = color;
  ctx.strokeStyle = "#3b2f4a";
  ctx.lineWidth = 2.5;
  rr(ctx, x - PW / 2, y - PH / 2 + 6, PW, PH - 6, 9);
  ctx.fill();
  ctx.stroke();
  // ears
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + sx * 12, y - PH / 2 + 8);
    ctx.lineTo(x + sx * 10, y - PH / 2 - 6);
    ctx.lineTo(x + sx * 1, y - PH / 2 + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // eyes
  ctx.fillStyle = "#3b2f4a";
  ctx.beginPath();
  ctx.arc(x + face * 4, y - 10, 2.6, 0, Math.PI * 2);
  ctx.arc(x + face * 11, y - 10, 2.6, 0, Math.PI * 2);
  ctx.fill();
  // gun
  ctx.save();
  ctx.translate(x, y - 2);
  ctx.rotate(aim);
  if (face < 0) ctx.scale(1, -1);
  const len = weapon === "sniper" ? 40 : weapon === "rocket" ? 38 : weapon === "shotgun" ? 34 : weapon === "pistol" ? 20 : 28;
  ctx.fillStyle = "#3b3b52";
  rr(ctx, 4, -4, len, 8, 2);
  ctx.fill();
  ctx.fillStyle = "#8c8cab";
  ctx.fillRect(4 + len - 6, -3, 6, 6);
  ctx.restore();
  // name + hp
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = me ? "#fff" : "#fff";
  ctx.strokeStyle = "rgba(40,30,60,.7)";
  ctx.lineWidth = 3;
  ctx.strokeText(label, x, y - PH / 2 - 24);
  ctx.fillText(label, x, y - PH / 2 - 24);
  ctx.fillStyle = "rgba(0,0,0,.4)";
  ctx.fillRect(x - 18, y - PH / 2 - 18, 36, 5);
  ctx.fillStyle = hp > 50 ? "#7be29b" : hp > 25 ? "#ffd36b" : "#ff6b8b";
  ctx.fillRect(x - 18, y - PH / 2 - 18, 36 * Math.max(0, hp / 100), 5);
}

export function drawWorld(ctx: CanvasRenderingContext2D, w: MilitiaWorld, cw: number, ch: number, cam: Camera, t: number, myColor: string, myName: string) {
  background(ctx, w, cw, ch, cam, t);
  ctx.save();
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);

  // solids
  for (const [x, y, sw, sh] of w.map.solids) {
    ctx.fillStyle = w.map.solid;
    ctx.fillRect(x, y, sw, sh);
    ctx.fillStyle = w.map.edge;
    ctx.fillRect(x, y, sw, Math.min(8, sh));
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.fillRect(x, y + Math.min(8, sh), sw, sh > 30 ? 6 : 0);
  }

  // crates
  for (const c of w.crates) {
    const pos = w.map.crates[c.id];
    if (!pos || c.taken) continue;
    const bob = Math.sin(t * 3 + c.id) * 3;
    ctx.fillStyle = "#FFF3C4";
    ctx.strokeStyle = "#3b2f4a";
    ctx.lineWidth = 2.5;
    rr(ctx, pos[0] - 14, pos[1] - 14 + bob, 28, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.font = "16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(weaponDef(c.weapon).emoji, pos[0], pos[1] + 6 + bob);
  }

  // peers
  for (const p of w.peers.values()) {
    if (!p.alive) continue;
    drawCat(ctx, p.rx, p.ry, p.color, p.aim, p.w, !!p.jet, p.name, p.hp, false);
  }
  if (w.alive) drawCat(ctx, w.x, w.y, myColor, w.aim, w.weapon, w.jetting, myName, w.hp, true);

  // projectiles
  for (const p of w.proj) {
    if (p.w === "grenade") {
      ctx.fillStyle = "#3b3b52";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.age % 0.3 < 0.15 ? "#ff6b6b" : "#ffd36b";
      ctx.fillRect(p.x - 2, p.y - 9, 4, 4);
    } else if (p.w === "rocket") {
      const a = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(a);
      ctx.fillStyle = "#FFB04D";
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-8, 4);
      ctx.fill();
      ctx.fillStyle = "#e9e9f5";
      rr(ctx, -8, -4, 18, 8, 4);
      ctx.fill();
      ctx.restore();
    } else {
      const a = Math.atan2(p.vy, p.vx);
      const l = p.w === "sniper" ? 34 : 14;
      ctx.strokeStyle = p.w === "sniper" ? "#fff" : "#FFE28A";
      ctx.lineWidth = p.w === "sniper" ? 3 : 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x - Math.cos(a) * l, p.y - Math.sin(a) * l);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  // particles
  for (const p of w.parts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (w.flash > 0) {
    ctx.fillStyle = `rgba(255,80,110,${Math.min(0.35, w.flash)})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

export interface HudInfo {
  players: MilitiaPlayerState[];
  myId: string;
  timeLeft: number;
  target: number;
  feed: { text: string; at: number }[];
  respawnIn: number;
  touch: boolean;
  countdown: number;
}

export function drawHud(ctx: CanvasRenderingContext2D, w: MilitiaWorld, cw: number, ch: number, hud: HudInfo, now: number) {
  ctx.textAlign = "left";
  ctx.font = "bold 14px system-ui, sans-serif";
  // scoreboard
  const rows = [...hud.players].sort((a, b) => b.kills - a.kills);
  rows.forEach((p, i) => {
    const y = 14 + i * 22;
    ctx.fillStyle = "rgba(30,20,50,.55)";
    ctx.fillRect(10, y, 170, 19);
    ctx.fillStyle = p.color;
    ctx.fillRect(10, y, 6, 19);
    ctx.fillStyle = "#fff";
    ctx.fillText(`${p.id === hud.myId ? "You" : p.name}`.slice(0, 12), 22, y + 14);
    ctx.textAlign = "right";
    ctx.fillText(`${p.kills}/${hud.target}`, 174, y + 14);
    ctx.textAlign = "left";
  });
  // timer
  const m = Math.floor(Math.max(0, hud.timeLeft) / 60);
  const s = Math.floor(Math.max(0, hud.timeLeft) % 60);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(30,20,50,.55)";
  ctx.fillRect(cw / 2 - 40, 10, 80, 26);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px system-ui, sans-serif";
  ctx.fillText(`${m}:${String(s).padStart(2, "0")}`, cw / 2, 30);

  // kill feed
  ctx.textAlign = "right";
  ctx.font = "bold 13px system-ui, sans-serif";
  hud.feed.filter((f) => now - f.at < 5000).slice(-5).forEach((f, i) => {
    ctx.fillStyle = "rgba(30,20,50,.6)";
    const tw = ctx.measureText(f.text).width + 14;
    ctx.fillRect(cw - 10 - tw, 54 + i * 22, tw, 19);
    ctx.fillStyle = "#fff";
    ctx.fillText(f.text, cw - 17, 68 + i * 22);
  });

  // bars (bottom centre)
  const bx = cw / 2 - 110;
  const by = ch - (hud.touch ? 34 : 40);
  ctx.fillStyle = "rgba(30,20,50,.55)";
  ctx.fillRect(bx - 6, by - 8, 232, 44);
  ctx.fillStyle = "#3a2d4d";
  ctx.fillRect(bx, by - 2, 220, 8);
  ctx.fillStyle = w.hp > 50 ? "#7be29b" : w.hp > 25 ? "#ffd36b" : "#ff6b8b";
  ctx.fillRect(bx, by - 2, 220 * Math.max(0, w.hp / 100), 8);
  ctx.fillStyle = "#3a2d4d";
  ctx.fillRect(bx, by + 10, 220, 6);
  ctx.fillStyle = "#7FE3FF";
  ctx.fillRect(bx, by + 10, 220 * w.fuel, 6);
  const d = weaponDef(w.weapon);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px system-ui, sans-serif";
  const ammo = w.reloadT > 0 ? "reloading…" : `${w.ammo[w.weapon] ?? 0}/${d.mag}`;
  ctx.fillText(`${d.emoji} ${d.name}  ${ammo}   💣 ${w.grenades}`, bx, by + 30);

  if (hud.countdown > 0) {
    ctx.textAlign = "center";
    ctx.font = "bold 90px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#3b2f4a";
    ctx.lineWidth = 8;
    ctx.strokeText(String(hud.countdown), cw / 2, ch / 2);
    ctx.fillText(String(hud.countdown), cw / 2, ch / 2);
  }
  if (!w.alive && hud.respawnIn > 0) {
    ctx.textAlign = "center";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#3b2f4a";
    ctx.lineWidth = 5;
    const t = `Respawn in ${hud.respawnIn}…`;
    ctx.strokeText(t, cw / 2, ch / 2);
    ctx.fillText(t, cw / 2, ch / 2);
  }
}

/* ---------- touch controls ---------- */

export const STICK_R = 64;
export interface StickState {
  id: number;
  x: number;
  y: number;
}
export interface TouchButton {
  id: "swap" | "grenade" | "reload";
  x: number;
  y: number;
  r: number;
  label: string;
}

export const leftCentre = (_cw: number, ch: number) => ({ x: 110, y: ch - 110 });
export const rightCentre = (cw: number, ch: number) => ({ x: cw - 110, y: ch - 110 });
export const touchButtons = (cw: number, ch: number): TouchButton[] => [
  { id: "grenade", x: cw - 215, y: ch - 150, r: 30, label: "💣" },
  { id: "swap", x: cw - 130, y: ch - 235, r: 30, label: "🔁" },
  { id: "reload", x: 80, y: ch - 235, r: 28, label: "⟳" },
];

export function drawSticks(ctx: CanvasRenderingContext2D, cw: number, ch: number, left: StickState | null, right: StickState | null, aimMag: number) {
  const draw = (c: { x: number; y: number }, s: StickState | null, hot: boolean) => {
    ctx.fillStyle = "rgba(255,255,255,.18)";
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c.x, c.y, STICK_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const dx = s ? Math.max(-STICK_R, Math.min(STICK_R, s.x - c.x)) : 0;
    const dy = s ? Math.max(-STICK_R, Math.min(STICK_R, s.y - c.y)) : 0;
    const m = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, STICK_R / m);
    ctx.fillStyle = hot ? "rgba(255,120,150,.9)" : "rgba(255,255,255,.7)";
    ctx.beginPath();
    ctx.arc(c.x + dx * k, c.y + dy * k, 26, 0, Math.PI * 2);
    ctx.fill();
  };
  draw(leftCentre(cw, ch), left, false);
  draw(rightCentre(cw, ch), right, aimMag > 0.6);
  for (const b of touchButtons(cw, ch)) {
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(b.label, b.x, b.y + 8);
  }
}
