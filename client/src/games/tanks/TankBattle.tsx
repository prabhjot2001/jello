import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/Sticker";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sounds";
import { serverNow, useServerTime } from "@/lib/clock";
import type { TankAim, TankEvent, TankShot, TanksState, TankTerrain } from "@/types";
import { readTheme } from "../kart/engine";
import { TerrainView, drawTank } from "./tankArt";

const VIEW_W = 720;
const VIEW_H = 450;
const MINI_W = 200;

interface Playback {
  shot: TankShot;
  next: number;
}
interface Part {
  x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; color: string;
}

const TRAIL: Record<string, string> = {
  shell: "#3b2f4f", bullet: "#ffd34d", bomblet: "#3b2f4f", warhead: "#e04b4b", roller: "#8a8fa0",
  bouncer: "#ff9a3c", homing: "#ffffff", tracer: "#4de1ff", mirv: "#e04b4b", cluster: "#3b2f4f",
  digger: "#a97c50", pile: "#555e6e", dirt: "#8b5a2b", mover: "#a97c50", wall: "#8b5a2b", napalm: "#ff7a45",
  carpet: "#3b2f4f", wacky: "#c77dff",
};

const btn =
  "flex h-14 select-none items-center justify-center rounded-2xl border-2 border-border bg-card font-display text-lg font-bold shadow-[3px_3px_0_0_var(--border)] active:translate-y-0.5";

export function TankBattle({
  state, terrain, shot, myId,
}: {
  state: TanksState;
  terrain: TankTerrain | null;
  shot: TankShot | null;
  myId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const viewRef = useRef<TerrainView | null>(null);
  const playback = useRef<Playback | null>(null);
  const pending = useRef<TankShot | null>(null);
  const aimRef = useRef({ angle: 45, power: 60 });
  const held = useRef({ angle: 0, power: 0 });
  const peerAim = useRef<Record<string, { angle: number; power: number }>>({});
  const [ui, setUi] = useState({ angle: 45, power: 60 });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [showWeapons, setShowWeapons] = useState(false);

  const me = state.players.find((p) => p.id === myId);
  const myTurn = state.phase === "play" && state.turn.current === myId && !busy;
  const mapInfo = state.maps.find((m) => m.id === state.garage.map);
  const now = useServerTime(250);
  const left = state.turn.endsAt ? Math.max(0, Math.ceil((state.turn.endsAt - now) / 1000)) : null;

  const setAim = (angle: number, power: number) => {
    aimRef.current = { angle: Math.max(0, Math.min(180, angle)), power: Math.max(5, Math.min(100, power)) };
    setUi({ angle: Math.round(aimRef.current.angle), power: Math.round(aimRef.current.power) });
  };

  const fire = () => {
    const s = stateRef.current;
    if (!s.turn.selected || s.phase !== "play" || s.turn.current !== myId) return;
    socket.emit("tanks:fire", { weapon: s.turn.selected, angle: aimRef.current.angle, power: aimRef.current.power });
    playSfx("click");
  };

  // a new terrain arrived: build the picture
  useEffect(() => {
    if (!terrain || !mapInfo) return;
    const view = new TerrainView(terrain.w, terrain.h, mapInfo.theme);
    view.build(terrain.heights, terrain.ops);
    viewRef.current = view;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrain, mapInfo?.id]);

  // my turn starts: take over my last aim
  useEffect(() => {
    if (state.turn.current === myId && me) setAim(me.angle, me.power);
    if (state.phase === "play" && state.turn.current === myId) playSfx("tTurn");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turn.number, state.turn.current]);

  // scores are shown after the replay, not before
  useEffect(() => {
    if (!playback.current) setScores(Object.fromEntries(state.players.map((p) => [p.id, p.score])));
  }, [state.players]);

  // a new shot arrives: replay it (waits if the previous replay is still running)
  useEffect(() => {
    if (!shot) return;
    pending.current = shot;
    setBusy(true);
  }, [shot]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = VIEW_W * 2;
    canvas.height = VIEW_H * 2;
    const th = readTheme();

    const parts: Part[] = [];
    const blasts: { x: number; y: number; r: number; age: number; fx: string }[] = [];
    const texts: { x: number; y: number; age: number; text: string; color: string }[] = [];
    const flash: Record<string, number> = {};
    const disp: Record<string, { x: number; y: number; tilt: number }> = {};
    const aimDisp: Record<string, { angle: number; power: number }> = {};
    const cam = { x: 0, y: 0, ready: false };
    let shake = 0;
    let lastBlast = { x: 0, y: 0, at: -1e9 };
    let last = performance.now();
    let lastSent = { angle: -1, power: -1, at: 0 };
    let raf = 0;

    const onAim = (a: TankAim) => {
      peerAim.current[a.id] = { angle: a.angle, power: a.power };
    };
    socket.on("tanks:aim", onAim);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const c = e.code;
      const fine = e.shiftKey ? 0.25 : 1;
      if (c === "ArrowLeft") held.current.angle = down ? 1 * fine : 0;
      else if (c === "ArrowRight") held.current.angle = down ? -1 * fine : 0;
      else if (c === "ArrowUp") held.current.power = down ? 1 * fine : 0;
      else if (c === "ArrowDown") held.current.power = down ? -1 * fine : 0;
      else if (down && !e.repeat && (c === "KeyA" || c === "KeyD")) socket.emit("tanks:move", c === "KeyA" ? -1 : 1);
      else if (down && !e.repeat && (c === "Space" || c === "Enter")) fire();
      else if (down && !e.repeat && /^Digit[0-9]$/.test(c)) {
        const idx = (Number(c.slice(5)) + 9) % 10;
        const id = stateRef.current.players.find((p) => p.id === myId)?.arsenal[idx];
        if (id) socket.emit("tanks:select", id);
      } else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const fireEvent = (e: TankEvent, st: TanksState, view: TerrainView | null) => {
      e.ops?.forEach((op) => view?.apply(op));
      blasts.push({ x: e.x, y: e.y, r: e.r, age: 0, fx: e.fx });
      lastBlast = { x: e.x, y: e.y, at: performance.now() };
      const count = Math.min(26, Math.round(e.r / 2.5));
      const color = e.fx === "fire" ? "#ff9a3c" : e.fx === "dirt" ? st.maps.find((m) => m.id === st.garage.map)?.theme.dirt ?? "#8b5a2b" : "#6b5b4b";
      if (e.fx !== "mark" && e.fx !== "spark") {
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 60 + Math.random() * 220;
          parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, age: 0, life: 0.5 + Math.random() * 0.6, size: 2 + Math.random() * 3, color });
        }
      }
      if (e.r > 50 && e.fx !== "dirt") shake = Math.max(shake, Math.min(10, e.r / 9));
      if (e.fx === "dirt" || e.fx === "dig") playSfx("tDirt");
      else if (e.fx === "mark" || e.fx === "spark") playSfx("pop", 0.4);
      else playSfx(e.r > 60 ? "tBoomBig" : "tBoom");
      for (const [id, pts] of Object.entries(e.pts ?? {})) {
        const d = disp[id];
        if (!d) continue;
        texts.push({ x: d.x, y: d.y - 60, age: 0, text: pts > 0 ? `+${pts}` : `${pts}`, color: pts > 0 ? "#2fbf5b" : "#e04b4b" });
        flash[id] = 0.6;
        playSfx("tHit", 0.7);
      }
    };

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const st = stateRef.current;
      const view = viewRef.current;
      const k = (rate: number) => 1 - Math.exp(-dt * rate);

      // start the next waiting replay
      if (!playback.current && pending.current) {
        const s = pending.current;
        pending.current = null;
        playback.current = { shot: s, next: 0 };
        playSfx("tFire");
      }
      const pb = playback.current;

      // controls held down
      if (st.phase === "play" && st.turn.current === myId && !pb) {
        const h = held.current;
        if (h.angle || h.power) {
          setAim(aimRef.current.angle + h.angle * 45 * dt, aimRef.current.power + h.power * 35 * dt);
        }
        const a = aimRef.current;
        if ((Math.abs(a.angle - lastSent.angle) > 0.2 || Math.abs(a.power - lastSent.power) > 0.2) && ts - lastSent.at > 60) {
          lastSent = { angle: a.angle, power: a.power, at: ts };
          socket.volatile.emit("tanks:aim", { angle: Math.round(a.angle * 10) / 10, power: Math.round(a.power * 10) / 10 });
        }
      }

      // tanks glide to their real positions (but stay put while a shot is being replayed)
      for (const p of st.players) {
        const target = st.poses[p.id];
        if (!target) continue;
        const d = (disp[p.id] ??= { ...target });
        if (!pb) {
          d.x += (target.x - d.x) * k(10);
          d.y += (target.y - d.y) * k(10);
          d.tilt += (target.tilt - d.tilt) * k(8);
        }
        flash[p.id] = Math.max(0, (flash[p.id] ?? 0) - dt * 1.5);
        const ad = (aimDisp[p.id] ??= { angle: p.angle, power: p.power });
        const want = p.id === myId && st.turn.current === myId && !pb ? aimRef.current : peerAim.current[p.id] ?? p;
        if (st.turn.current === p.id && !pb) {
          ad.angle += (want.angle - ad.angle) * k(p.id === myId ? 40 : 14);
          ad.power += (want.power - ad.power) * k(14);
        } else {
          ad.angle += (p.angle - ad.angle) * k(10);
          ad.power += (p.power - ad.power) * k(10);
        }
      }

      // replay
      let focus: { x: number; y: number } | null = null;
      const shots: { fx: string; x: number; y: number; prev: { x: number; y: number }[] }[] = [];
      if (pb) {
        const tf = Math.max(0, (serverNow() - pb.shot.startAt) * 0.06);
        const evs = pb.shot.events;
        while (pb.next < evs.length && evs[pb.next].t <= tf) fireEvent(evs[pb.next++], st, view);
        let sx = 0, sy = 0, n = 0;
        for (const tr of pb.shot.tracks) {
          const idx = tf - tr.t0;
          if (idx < 0) continue;
          if (tr.fx === "laser") {
            if (idx < 16) shots.push({ fx: "laser", x: tr.pts[2], y: tr.pts[3], prev: [{ x: tr.pts[0], y: tr.pts[1] }] });
            continue;
          }
          const cnt = tr.pts.length / 2;
          if (idx >= cnt - 1) continue;
          const i = Math.floor(idx);
          const f = idx - i;
          const x = tr.pts[2 * i] + (tr.pts[2 * i + 2] - tr.pts[2 * i]) * f;
          const y = tr.pts[2 * i + 1] + (tr.pts[2 * i + 3] - tr.pts[2 * i + 1]) * f;
          const prev: { x: number; y: number }[] = [];
          for (let j = 1; j <= 12 && i - j >= 0; j++) prev.push({ x: tr.pts[2 * (i - j)], y: tr.pts[2 * (i - j) + 1] });
          shots.push({ fx: tr.fx, x, y, prev });
          sx += x; sy += y; n++;
        }
        if (n) focus = { x: sx / n, y: sy / n };
        if (tf >= pb.shot.ticks) {
          // replay finished: show the real result
          setScores(pb.shot.after.scores);
          for (const [id, a] of Object.entries(pb.shot.after.aims)) aimDisp[id] = { ...a };
          playback.current = null;
          if (!pending.current) setBusy(false);
        }
      }

      // camera
      const cur = st.players.find((p) => p.id === st.turn.current);
      const curPos = cur ? disp[cur.id] : undefined;
      if (!focus && performance.now() - lastBlast.at < 900) focus = lastBlast;
      if (!focus && curPos) focus = { x: curPos.x + (cur!.seat === 0 ? 120 : -120), y: curPos.y - 80 };
      const fw = view?.w ?? 1600;
      const fh = view?.h ?? 560;
      if (focus) {
        const tx = Math.max(0, Math.min(fw - VIEW_W, focus.x - VIEW_W / 2));
        const ty = Math.max(0, Math.min(fh - VIEW_H, focus.y - VIEW_H / 2));
        if (!cam.ready) {
          cam.x = tx;
          cam.y = ty;
          cam.ready = true;
        } else {
          cam.x += (tx - cam.x) * k(5);
          cam.y += (ty - cam.y) * k(5);
        }
      }
      shake = Math.max(0, shake - dt * 18);
      const ox = shake ? (Math.random() - 0.5) * shake : 0;
      const oy = shake ? (Math.random() - 0.5) * shake : 0;

      // ----- draw -----
      const theme = st.maps.find((m) => m.id === st.garage.map)?.theme;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      sky.addColorStop(0, theme?.skyTop ?? "#8EC9FF");
      sky.addColorStop(1, theme?.skyBottom ?? "#E3F5FF");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      if (theme?.stars) {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        for (let i = 0; i < 70; i++) ctx.fillRect((i * 97) % VIEW_W, (i * 53) % (VIEW_H - 120), i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
      }
      const layer = (items: string[], par: number, size: number, alpha: number, yBase: number, spacing: number) => {
        if (!items.length) return;
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = alpha;
        const span = spacing * 8;
        for (let i = 0; i < 8; i++) {
          const x = ((((i * spacing - cam.x * par) % span) + span) % span) - spacing / 2;
          ctx.fillText(items[i % items.length], x, yBase + ((i * 41) % 110));
        }
        ctx.globalAlpha = 1;
      };
      if (theme) {
        layer(theme.far, 0.15, 56, 0.5, 40, 260);
        layer(theme.near, 0.4, 44, 0.7, 250, 230);
      }

      ctx.save();
      ctx.translate(Math.round(-cam.x + ox), Math.round(-cam.y + oy));
      if (view) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(view.look, 0, 0);
        ctx.imageSmoothingEnabled = true;
      }

      // tanks
      for (const p of st.players) {
        const d = disp[p.id];
        if (!d) continue;
        const ad = aimDisp[p.id] ?? p;
        drawTank(ctx, { skin: p.tank, x: d.x, y: d.y, tilt: d.tilt, face: p.seat === 0 ? 1 : -1, angle: ad.angle, flash: flash[p.id] ?? 0, ink: th.ink });
        ctx.font = `700 12px "Fredoka Variable", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tag = p.id === myId ? `${p.name} (you)` : p.name;
        const tw = ctx.measureText(tag).width + 12;
        ctx.fillStyle = th.card;
        ctx.fillRect(d.x - tw / 2, d.y - 62, tw, 18);
        ctx.fillStyle = p.color;
        ctx.fillRect(d.x - tw / 2, d.y - 62, 3, 18);
        ctx.fillStyle = th.ink;
        ctx.fillText(tag, d.x, d.y - 53);
        if (st.phase === "play" && st.turn.current === p.id && !pb) {
          ctx.font = "13px sans-serif";
          ctx.fillText("▼", d.x, d.y - 70 + Math.sin(ts / 200) * 3);
          ctx.font = `700 11px sans-serif`;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillText(`${Math.round(ad.angle)}°  ${Math.round(ad.power)}`, d.x, d.y + 12);
        }
      }

      // projectiles
      for (const s of shots) {
        if (s.fx === "laser") {
          ctx.strokeStyle = "rgba(77,225,255,0.9)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(s.prev[0].x, s.prev[0].y);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          continue;
        }
        const color = TRAIL[s.fx] ?? "#3b2f4f";
        s.prev.forEach((q, j) => {
          ctx.globalAlpha = (1 - j / 12) * 0.45;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        const r = s.fx === "bullet" ? 2.5 : s.fx === "bomblet" || s.fx === "warhead" || s.fx === "tracer" ? 3.5 : 5;
        ctx.fillStyle = color;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // explosions, debris, score popups
      for (let i = blasts.length - 1; i >= 0; i--) {
        const b = blasts[i];
        b.age += dt;
        const t = b.age / 0.45;
        if (t >= 1) {
          blasts.splice(i, 1);
          continue;
        }
        const col = b.fx === "fire" ? "255,150,60" : b.fx === "dirt" ? "150,110,70" : b.fx === "dome" ? "120,200,255" : b.fx === "laser" ? "77,225,255" : "255,200,90";
        ctx.fillStyle = `rgba(${col},${0.65 * (1 - t)})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * (0.4 + t * 0.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - t)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * (0.5 + t), 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        p.vy += 520 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age > p.life) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = 1 - p.age / p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        t.age += dt;
        if (t.age > 1.4) {
          texts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, 1.6 - t.age);
        ctx.font = `700 20px "Fredoka Variable", sans-serif`;
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#fff";
        ctx.strokeText(t.text, t.x, t.y - t.age * 40);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y - t.age * 40);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // minimap
      if (view) {
        const mh = (MINI_W * view.h) / view.w;
        const mx = VIEW_W - MINI_W - 8;
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(mx - 2, 6, MINI_W + 4, mh + 4);
        ctx.drawImage(view.look, mx, 8, MINI_W, mh);
        const sc = MINI_W / view.w;
        for (const p of st.players) {
          const d = disp[p.id];
          if (!d) continue;
          ctx.fillStyle = p.color;
          ctx.fillRect(mx + d.x * sc - 2, 8 + d.y * sc - 3, 4, 4);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(mx + cam.x * sc, 8 + cam.y * sc, VIEW_W * sc, VIEW_H * sc);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      socket.off("tanks:aim", onAim);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const hold = (key: "angle" | "power", dir: number) => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      held.current[key] = dir;
    },
    onPointerUp: () => {
      held.current[key] = 0;
    },
    onPointerLeave: () => {
      held.current[key] = 0;
    },
    onPointerCancel: () => {
      held.current[key] = 0;
    },
  });

  const weapon = state.weapons.find((w) => w.id === state.turn.selected);
  const arsenal = me?.arsenal ?? [];
  const windText = state.wind === 0 ? "No wind" : `${state.wind < 0 ? "◀" : "▶"} ${Math.abs(state.wind)}`;

  return (
    <div className="tanks-wrap mx-auto select-none">
      <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {state.players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-2 py-1 ${i === 1 ? "order-3 flex-row-reverse text-right" : "order-1"} ${
              state.turn.current === p.id ? "ring-4 ring-ring" : ""
            }`}
          >
            <Sticker src={`tanks/${p.tank}.png`} fallback="🪖" size={30} />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{p.id === myId ? `${p.name} (you)` : p.name}</div>
              <div className="font-display text-lg font-bold leading-none">{scores[p.id] ?? p.score}</div>
            </div>
          </div>
        ))}
        <div className="order-2 text-center text-xs font-semibold">
          <div>
            Shot {Math.min(state.turn.number, state.turn.total)}/{state.turn.total}
          </div>
          <div>💨 {windText}</div>
          {left !== null && <div>⏱ {left}s</div>}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-3xl border-2 border-border bg-card shadow-[4px_4px_0_0_var(--border)]"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      />

      <div className="mt-3 flex flex-col gap-2">
        <div className="text-center text-sm font-semibold">
          {myTurn ? "Your turn: aim and fire!" : busy ? "Shot in the air…" : `${state.players.find((p) => p.id === state.turn.current)?.name ?? "Rival"} is aiming…`}
        </div>

        <div className={`grid gap-2 ${myTurn ? "" : "pointer-events-none opacity-50"}`}>
          <div className="flex items-center gap-2">
            <div {...hold("angle", 1)} className={`${btn} w-14`}>◀</div>
            <label className="flex flex-1 flex-col text-xs">
              Angle {ui.angle}°
              <input type="range" min={0} max={180} step={1} value={ui.angle}
                onChange={(e) => setAim(Number(e.target.value), aimRef.current.power)} />
            </label>
            <div {...hold("angle", -1)} className={`${btn} w-14`}>▶</div>
          </div>
          <div className="flex items-center gap-2">
            <div {...hold("power", -1)} className={`${btn} w-14`}>−</div>
            <label className="flex flex-1 flex-col text-xs">
              Power {ui.power}
              <input type="range" min={5} max={100} step={1} value={ui.power}
                onChange={(e) => setAim(aimRef.current.angle, Number(e.target.value))} />
            </label>
            <div {...hold("power", 1)} className={`${btn} w-14`}>+</div>
          </div>
          <div className="flex items-center gap-2">
            <div onPointerDown={() => socket.emit("tanks:move", -1)} className={`${btn} flex-1`}>
              ⬅ Move
            </div>
            <div className="w-16 text-center text-xs font-semibold">{state.turn.movesLeft} moves</div>
            <div onPointerDown={() => socket.emit("tanks:move", 1)} className={`${btn} flex-1`}>
              Move ➡
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-14 flex-1 text-base" onClick={() => setShowWeapons((v) => !v)}>
              {weapon ? `${weapon.emoji} ${weapon.name}` : "Pick a weapon"} ({arsenal.length})
            </Button>
            <Button className="h-14 flex-1 text-lg" onClick={fire} disabled={!weapon}>
              🔥 FIRE
            </Button>
          </div>
        </div>

        {showWeapons && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {arsenal.map((id, i) => {
              const w = state.weapons.find((x) => x.id === id);
              if (!w) return null;
              return (
                <button
                  key={id}
                  onClick={() => {
                    socket.emit("tanks:select", id);
                    setShowWeapons(false);
                  }}
                  className={`rounded-xl border-2 border-border bg-card p-2 text-left text-xs ${state.turn.selected === id ? "ring-4 ring-ring" : ""}`}
                >
                  <div className="font-display text-sm font-bold">
                    {w.emoji} {w.name} <span className="text-muted-foreground">[{(i + 1) % 10}]</span>
                  </div>
                  <div className="text-muted-foreground">{w.desc}</div>
                </button>
              );
            })}
          </div>
        )}
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          ← → angle · ↑ ↓ power (hold Shift for fine) · A / D move · 1-9 weapon · Space fire
        </p>
      </div>
    </div>
  );
}
