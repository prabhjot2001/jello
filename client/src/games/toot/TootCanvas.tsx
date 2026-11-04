import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { socket } from "@/socket";
import { maybeMeme, playSfx } from "@/theme/sound";
import { serverNow, useServerTime } from "@/lib/clock";
import type { TootEvent, TootLevel, TootSnapshot, TootState } from "@/types";
import { readTheme } from "../kart/engine";
import { drawTootScene, slotX, VIEW_H, VIEW_W, type Particle, type Pose } from "./tootRender";

const AIM_RATE = 1.8; // radians per second
const AIM_MAX = 1.0; // keep in sync with the server

const btn =
  "flex h-20 items-center justify-center rounded-3xl border-2 border-border font-display font-bold shadow-[4px_4px_0_0_var(--border)] active:translate-y-1 sm:h-16";
const small =
  "flex h-12 items-center justify-center rounded-2xl border-2 border-border bg-card px-2 text-center text-sm font-display font-bold shadow-[3px_3px_0_0_var(--border)] active:translate-y-0.5";

function countdownLabel(remainingMs: number) {
  if (remainingMs > 3000) return "Get ready…";
  if (remainingMs > 2000) return "3";
  if (remainingMs > 1000) return "2";
  if (remainingMs > 0) return "1";
  if (remainingMs > -700) return "GO!";
  return "";
}

export function TootCanvas({ state, level, myId }: { state: TootState; level: TootLevel; myId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const input = useRef({ left: false, right: false, fart: false });
  const [banner, setBanner] = useState("");
  const [gas, setGas] = useState<number[]>([]);
  const [stuck, setStuck] = useState(false);

  const mySlot = state.players.findIndex((p) => p.id === myId);

  const straighten = () => socket.emit("toot:right");
  const backToCheckpoint = () => socket.emit("toot:reset");

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = VIEW_W * 2;
    canvas.height = VIEW_H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const th = readTheme();
    const buf: TootSnapshot[] = [];
    const particles: Particle[] = [];
    const cam = { x: 0, y: 0, ready: false };
    let levelIdx = -1;
    let aim = 0;
    let sent = { aim: 0, fart: false, at: 0 };
    let last = performance.now();
    let lastOwnSfx = 0;
    const lastOtherSfx: number[] = [];
    let lastGas: number[] = [];
    let raf = 0;
    let bannerTimer: ReturnType<typeof setTimeout> | undefined;

    const say = (text: string, ms = 2200) => {
      setBanner(text);
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => setBanner(""), ms);
    };

    const onSnap = (s: TootSnapshot) => {
      buf.push(s);
      if (buf.length > 40) buf.shift();
    };
    const onEvent = (e: TootEvent) => {
      const vehicleName = stateRef.current.vehicle.name;
      switch (e.kind) {
        case "fail":
          setStuck(false);
          playSfx("splat");
          maybeMeme(0.5);
          say(
            e.reason === "capsize"
              ? `💨 ${e.name} tipped the ${vehicleName}!`
              : e.reason === "hazard"
                ? `☠️ ${e.name} steered into danger!`
                : `🫧 ${e.name} dropped the ${vehicleName}!`
          );
          break;
        case "checkpoint":
          setStuck(false);
          playSfx("checkpoint");
          say("🚩 Checkpoint reached!");
          break;
        case "stuck":
          setStuck(true);
          say("🪤 Stuck? Try Straighten or Back to checkpoint.", 4500);
          break;
        case "right":
          setStuck(false);
          playSfx("roundStart");
          say(`↺ ${e.name} straightened the ${vehicleName}`);
          break;
        case "vote":
          say(`⟲ ${e.name} wants to go back to the checkpoint (${e.votes}/${e.needed})`, 3000);
          break;
        case "reset":
          setStuck(false);
          playSfx("roundStart");
          say(e.name === "Auto reset" ? "⟲ Stuck for too long: back to the checkpoint" : "⟲ Back to the checkpoint");
          break;
        default:
          setStuck(false);
          playSfx("roundStart");
      }
    };
    socket.on("toot:snap", onSnap);
    socket.on("toot:event", onEvent);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const c = e.code;
      if (c === "ArrowLeft" || c === "KeyA") input.current.left = down;
      else if (c === "ArrowRight" || c === "KeyD") input.current.right = down;
      else if (c === "Space" || c === "ArrowUp" || c === "KeyW" || c === "ArrowDown" || c === "KeyS") {
        input.current.fart = down;
      } else if (c === "KeyR") {
        if (down && !e.repeat) socket.emit("toot:right");
      } else if (c === "KeyC") {
        if (down && !e.repeat) socket.emit("toot:reset");
      } else return;
      e.preventDefault();
    };
    const keyDown = (e: KeyboardEvent) => onKey(e, true);
    const keyUp = (e: KeyboardEvent) => onKey(e, false);
    const release = () => {
      input.current = { left: false, right: false, fart: false };
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", release);

    const gasTimer = setInterval(() => setGas((g) => (g.join() === lastGas.join() ? g : lastGas.slice())), 120);

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const st = stateRef.current;
      const lv = st.level;
      if (!lv) return;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const now = serverNow();
      const n = st.players.length;
      const slot = st.players.findIndex((p) => p.id === myId);

      if (st.levelIndex !== levelIdx) {
        levelIdx = st.levelIndex;
        buf.length = 0;
        particles.length = 0;
        cam.ready = false;
      }

      // own controls: the aim is steered locally, the server only clamps it
      const dir = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
      aim = Math.max(-AIM_MAX, Math.min(AIM_MAX, aim + dir * AIM_RATE * dt));
      if (slot >= 0 && st.phase === "play") {
        const fart = input.current.fart;
        if (fart !== sent.fart || (Math.abs(aim - sent.aim) > 0.02 && ts - sent.at > 40)) {
          sent = { aim, fart, at: ts };
          socket.emit("toot:input", { aim: Math.round(aim * 100) / 100, fart });
        }
        if (fart && (lastGas[slot] ?? 100) > 0 && ts - lastOwnSfx > 450) {
          lastOwnSfx = ts;
          playSfx("fart");
        }
      }

      // the vehicle is shown ~110ms in the past, interpolated between two snapshots
      const rt = now - 110;
      let pose: Pose = { x: lv.spawn.x, y: lv.spawn.y - st.vehicle.h / 2, a: 0, gt: 0, dead: false, cp: -1, ps: [] };
      if (buf.length) {
        const first = buf[0];
        const newest = buf[buf.length - 1];
        let a = newest;
        let b = newest;
        let k = 0;
        if (rt <= first.t) {
          a = first;
          b = first;
        } else if (rt < newest.t) {
          let i = buf.length - 2;
          while (i > 0 && buf[i].t > rt) i--;
          a = buf[i];
          b = buf[i + 1];
          k = (rt - a.t) / Math.max(1, b.t - a.t);
        }
        pose = {
          x: a.x + (b.x - a.x) * k,
          y: a.y + (b.y - a.y) * k,
          a: a.a + (b.a - a.a) * k,
          gt: a.gt + (b.gt - a.gt) * k,
          dead: b.dead,
          cp: b.cp,
          ps: b.ps,
        };
      }
      lastGas = pose.ps.map((p) => p.gas);

      // gas puffs and other players' fart sounds
      const ca = Math.cos(pose.a);
      const sa = Math.sin(pose.a);
      pose.ps.forEach((p, i) => {
        const pw = i === slot ? (input.current.fart && (lastGas[i] ?? 0) > 0 ? 1 : 0) : p.p;
        if (pw > 0.1 && !pose.dead) {
          const sx = slotX(i, n, st.vehicle.w);
          const oy = st.vehicle.h / 2;
          const px = pose.x + sx * ca - oy * sa;
          const py = pose.y + sx * sa + oy * ca;
          const am = i === slot ? aim : p.aim;
          const ex = Math.sin(am) * ca - Math.cos(am) * sa;
          const ey = Math.sin(am) * sa + Math.cos(am) * ca;
          for (let c = 0; c < 2 && particles.length < 400; c++) {
            const speed = 160 + Math.random() * 120;
            particles.push({
              x: px, y: py,
              vx: ex * speed + (Math.random() - 0.5) * 50,
              vy: ey * speed + (Math.random() - 0.5) * 50 - 10,
              age: 0, life: 0.6 + Math.random() * 0.5,
              size: 6 + pw * 8, hue: 70 + Math.random() * 40,
            });
          }
        }
        if (i !== slot && p.p > 0.3 && ts - (lastOtherSfx[i] ?? 0) > 450) {
          lastOtherSfx[i] = ts;
          playSfx("fart", 0.6);
        }
      });
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 - 20 * dt;
        if (p.age > p.life) particles.splice(i, 1);
      }

      // camera follows the vehicle
      const tx = Math.max(-200, Math.min(lv.length + 600 - VIEW_W, pose.x - VIEW_W * 0.4));
      const ty = Math.max(-100, Math.min(lv.height + 100 - VIEW_H, pose.y - VIEW_H * 0.55));
      if (!cam.ready) {
        cam.x = tx;
        cam.y = ty;
        cam.ready = true;
      } else {
        cam.x += (tx - cam.x) * 0.15;
        cam.y += (ty - cam.y) * 0.15;
      }

      drawTootScene(ctx, {
        level: lv, vehicle: st.vehicle, players: st.players, pose, cam, particles,
        mySlot: slot, aimOwn: aim, th, time: ts,
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(gasTimer);
      clearTimeout(bannerTimer);
      socket.off("toot:snap", onSnap);
      socket.off("toot:event", onEvent);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", release);
    };
  }, [myId]);

  // timer + 3-2-1-GO
  const now = useServerTime(100);
  const remaining = state.startAt - now;
  const label = state.phase === "countdown" || state.phase === "play" ? countdownLabel(remaining) : "";
  useEffect(() => {
    if (label === "3" || label === "2" || label === "1") playSfx("tick");
    else if (label === "GO!") playSfx("roundStart");
  }, [label]);
  const elapsed = state.phase === "play" ? Math.max(0, now - state.startAt) : state.stats.timeMs;
  const cooldown = Math.max(0, state.rightReadyAt - now);

  const hold = (key: "left" | "right" | "fart") => ({
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault();
      input.current[key] = true;
    },
    onPointerUp: () => {
      input.current[key] = false;
    },
    onPointerLeave: () => {
      input.current[key] = false;
    },
    onPointerCancel: () => {
      input.current[key] = false;
    },
  });

  return (
    <div className="toot-wrap mx-auto select-none">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-border bg-card px-3 py-2 text-sm font-semibold">
        <span>
          {state.vehicle.emoji} {level.name} · {state.levelIndex + 1}/{state.levelCount}
        </span>
        <span>⏱ {(elapsed / 1000).toFixed(1)}s</span>
        <span>💀 {state.stats.deaths}</span>
      </div>

      <div
        className="mb-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${state.players.length}, minmax(0, 1fr))` }}
      >
        {state.players.map((p, i) => (
          <div key={p.id} className="rounded-xl border-2 border-border bg-card px-2 py-1 text-xs">
            <div className="truncate font-semibold">{p.id === myId ? `${p.name} (you)` : p.name}</div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full" style={{ width: `${gas[i] ?? 100}%`, background: p.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-3xl border-2 border-border bg-card shadow-[4px_4px_0_0_var(--border)]"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        />
        {banner && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-2">
            <div className="rounded-2xl border-2 border-border bg-card/95 px-4 py-2 text-center font-display text-base font-bold sm:text-lg">
              {banner}
            </div>
          </div>
        )}
        {label && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              key={label}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border-2 border-border bg-card/90 px-8 py-3 font-display text-5xl font-bold shadow-[4px_4px_0_0_var(--border)]"
            >
              {label}
            </motion.div>
          </div>
        )}
      </div>

      <div className="mt-3 flex touch-none gap-3">
        <div
          onPointerDown={straighten}
          className={`${small} flex-1 ${stuck ? "ring-4 ring-ring" : ""} ${cooldown > 0 ? "opacity-50" : ""}`}
        >
          ↺ Straighten (R){cooldown > 0 ? ` ${Math.ceil(cooldown / 1000)}s` : ""}
        </div>
        <div onPointerDown={backToCheckpoint} className={`${small} flex-1 ${stuck ? "ring-4 ring-ring" : ""}`}>
          ⟲ Back to checkpoint (C)
        </div>
      </div>

      {mySlot >= 0 && (
        <div className="mt-3 flex touch-none gap-3">
          <div {...hold("left")} className={`${btn} flex-1 bg-secondary text-3xl text-secondary-foreground`}>
            ◀
          </div>
          <div {...hold("right")} className={`${btn} flex-1 bg-secondary text-3xl text-secondary-foreground`}>
            ▶
          </div>
          <div {...hold("fart")} className={`${btn} flex-[2] bg-primary text-3xl text-primary-foreground`}>
            💨 FART
          </div>
        </div>
      )}
      <p className="mt-2 hidden text-center text-sm text-muted-foreground sm:block">
        A / D (or ← →) aim · hold Space to fart · R straighten · C back to checkpoint
      </p>
    </div>
  );
}