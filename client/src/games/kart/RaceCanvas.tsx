import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { socket } from "@/socket";
import { maybeMeme, playSfx } from "@/theme/sound";
import { serverNow, useServerTime } from "@/lib/clock";
import type { KartAttack, KartPeer, KartState } from "@/types";
import {
  addBanana, applyNitro, applyShield, buildTrack, drawScene, flagsOf, H, ITEM_EMOJI, makeBanana,
  newSim, pressDuck, pressJump, readTheme, rollItem, step, STEP, W,
  type Hurdle, type Item,
} from "./engine";

function countdownLabel(remainingMs: number) {
  if (remainingMs > 3000) return "Get ready…";
  if (remainingMs > 2000) return "3";
  if (remainingMs > 1000) return "2";
  if (remainingMs > 0) return "1";
  if (remainingMs > -800) return "GO!";
  return "";
}

const btn =
  "flex h-24 items-center justify-center rounded-3xl border-2 border-border font-display font-bold shadow-[4px_4px_0_0_var(--border)] active:translate-y-1 sm:h-16";

export function RaceCanvas({ state, myId }: { state: KartState; myId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef(newSim());
  const stateRef = useRef(state);
  stateRef.current = state;

  const track = useMemo(
    () => buildTrack(state.seed, state.trackLength, state.settings.difficulty, state.settings.items),
    [state.seed, state.trackLength, state.settings.difficulty, state.settings.items]
  );
  const trackRef = useRef(track);
  trackRef.current = track;

  const actions = useRef({ jump: () => {}, duck: () => {}, item: () => {} });
  const [hud, setHud] = useState<{ item: Item | null }>({ item: null });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = W * 2;
    canvas.height = H * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const th = readTheme();
    const sim = simRef.current;
    const buf: KartPeer[] = [];
    const oppExtras: Hurdle[] = [];
    let acc = 0;
    let last = performance.now();
    let lastSend = 0;
    let lastCoinSfx = 0;
    let sentFinish = false;
    let peerC = 0;
    let peerCrashAt = -1e9;
    let oppX = 0;
    let raf = 0;

    const jump = () => {
      if (stateRef.current.phase !== "final") pressJump(sim);
    };
       const duck = () => {
      if (stateRef.current.phase === "final") return;
      const wasDucking = sim.duckT > 0;
      pressDuck(sim);
      if (!wasDucking) playSfx("duck");
    };
    const triggerItem = () => {
      if (stateRef.current.phase === "final" || !sim.item || sim.finished) return;
      const item = sim.item;
      sim.item = null;
           if (item === "shield") {
        applyShield(sim);
        playSfx("shield");
      } else if (item === "nitro") {
        applyNitro(sim);
        playSfx("boost");
      } else {
        // banana trap: placed on the partner's track, ahead of where they are now
        const x = Math.round(oppX + 700);
        oppExtras.push(makeBanana(x));
        socket.emit("kart:attack", { kind: "banana", x });
        playSfx("throwItem");
      }
    };
    actions.current = { jump, duck, item: triggerItem };

    const onPeer = (p: KartPeer) => {
      if (p.id === myId) return;
      buf.push(p);
      if (buf.length > 40) buf.shift();
      if (p.c > peerC) {
        peerC = p.c;
        peerCrashAt = performance.now();
        playSfx("oppScore");
        maybeMeme(0.25);
      }
    };
    const onAttack = (a: KartAttack) => {
      addBanana(sim, a.x);
     playSfx("trapped");
      maybeMeme(0.5);
    };
    socket.on("kart:peer", onPeer);
    socket.on("kart:attack", onAttack);

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        duck();
      } else if (e.code === "KeyE" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        triggerItem();
      }
    };
    window.addEventListener("keydown", onKey);

    const hudTimer = setInterval(() => setHud((h) => (h.item === sim.item ? h : { item: sim.item })), 100);

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const st = stateRef.current;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const now = serverNow();
      const length = st.trackLength;
      const difficulty = st.settings.difficulty;

      // own kart: simulated locally, starts exactly at the synced GO time
      if (st.phase !== "final" && now >= st.startAt) {
        acc += dt;
             while (acc >= STEP) {
          acc -= STEP;
          const ev = step(sim, STEP, trackRef.current, length, difficulty);
          if (ev.jumped) playSfx("jump");
          if (ev.crashed) {
            playSfx("hit");
            maybeMeme(0.3);
          }
          if (ev.shielded) playSfx("shield");
          if (ev.boosted) playSfx("boost");
          if (ev.coins && ts - lastCoinSfx > 90) {
            lastCoinSfx = ts;
            playSfx("coin");
          }
          if (ev.box) {
            sim.item = rollItem(oppX - sim.x);
            playSfx("itemPick");
          }
          if (ev.finished && !sentFinish) {
            sentFinish = true;
            playSfx("finish");
            const overshootMs = sim.speed > 0 ? ((sim.x - length) / sim.speed) * 1000 : 0;
            socket.emit("kart:finish", {
              t: Math.round(now - st.startAt - Math.max(0, overshootMs)),
              coins: sim.coins,
            });
          }
        }
        if (ts - lastSend >= 50) {
          lastSend = ts;
          socket.volatile.emit("kart:update", {
            t: now,
            x: Math.round(sim.x * 10) / 10,
            y: Math.round(sim.y),
            c: sim.crashes,
            k: sim.coins,
            f: flagsOf(sim),
          });
        }
      }

      // partner kart: interpolated ~110ms in the past for smooth motion
      const rt = now - 110;
      let ox = 0;
      let oy = 0;
      let ovy = 0;
      let oCoins = 0;
      let oFlags = 0;
      if (buf.length) {
        const first = buf[0];
        const lastS = buf[buf.length - 1];
        oCoins = lastS.k;
        oFlags = lastS.f;
        if (rt <= first.t) {
          ox = first.x;
          oy = first.y;
        } else if (rt >= lastS.t) {
          const prev = buf[buf.length - 2];
          const v =
            st.phase !== "final" && prev
              ? Math.min(750, Math.max(0, ((lastS.x - prev.x) / Math.max(1, lastS.t - prev.t)) * 1000))
              : 0;
          ox = lastS.x + v * (Math.min(250, rt - lastS.t) / 1000);
          oy = lastS.y;
        } else {
          let i = buf.length - 2;
          while (i > 0 && buf[i].t > rt) i--;
          const a = buf[i];
          const b = buf[i + 1];
          const k = (rt - a.t) / Math.max(1, b.t - a.t);
          ox = a.x + (b.x - a.x) * k;
          oy = a.y + (b.y - a.y) * k;
          ovy = ((b.y - a.y) / Math.max(1, b.t - a.t)) * 1000;
        }
      }
      ox = Math.min(ox, length + 200);
      oppX = ox;

      const meP = st.players.find((p) => p.id === myId);
      const opP = st.players.find((p) => p.id !== myId);
      drawScene(ctx, {
        opp: {
          name: opP?.name ?? "Partner",
          avatarId: opP?.avatar ?? "doge",
          color: opP?.color ?? "#9FE3C4",
          x: ox, y: oy, vy: ovy,
          crashT: Math.max(0, 0.9 - (ts - peerCrashAt) / 1000),
          wheel: ox / 12,
          coins: oCoins,
          flags: oFlags,
          finished: ox >= length,
          t: Math.max(0, (rt - st.startAt) / 1000),
          extras: oppExtras,
        },
        me: {
          name: `${meP?.name ?? "You"} (you)`,
          avatarId: meP?.avatar ?? "troll",
          color: meP?.color ?? "#FFB5C8",
          x: sim.x, y: sim.y, vy: sim.vy,
          crashT: sim.crashT,
          wheel: sim.wheel,
          coins: sim.coins,
          flags: flagsOf(sim),
          finished: sim.finished,
          t: sim.t,
          extras: sim.extras,
          knocked: sim.hit,
          coinTaken: sim.coinTaken,
          boxTaken: sim.boxTaken,
          extraHit: sim.extraHit,
        },
        track: trackRef.current,
        length,
        th,
        time: ts,
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(hudTimer);
      socket.off("kart:peer", onPeer);
      socket.off("kart:attack", onAttack);
      window.removeEventListener("keydown", onKey);
    };
  }, [myId]);

  // 3-2-1-GO overlay + sounds
  const now = useServerTime(100);
  const label = state.phase === "final" ? "" : countdownLabel(state.startAt - now);
  useEffect(() => {
    if (label === "3" || label === "2" || label === "1") playSfx("tick");
    else if (label === "GO!") playSfx("roundStart");
  }, [label]);

  return (
    <div
      className="kart-wrap mx-auto touch-none select-none"
      onPointerDown={() => actions.current.jump()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-3xl border-2 border-border bg-card shadow-[4px_4px_0_0_var(--border)]"
          style={{ aspectRatio: `${W} / ${H}` }}
        />
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

      <div className="kart-jump mt-3 flex gap-3">
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            actions.current.duck();
          }}
          className={`${btn} flex-1 bg-secondary text-xl text-secondary-foreground`}
        >
          ⬇ DUCK
        </div>
        {state.settings.items && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              actions.current.item();
            }}
            className={`${btn} flex-1 flex-col bg-accent text-lg text-accent-foreground sm:flex-row sm:gap-2`}
          >
            <span className="text-3xl leading-none">{hud.item ? ITEM_EMOJI[hud.item] : "·"}</span>
            ITEM
          </div>
        )}
        <div className={`${btn} flex-[2] bg-primary text-3xl text-primary-foreground sm:text-2xl`}>🐾 JUMP</div>
      </div>
      <p className="mt-2 hidden text-center text-sm text-muted-foreground sm:block">
        Space / ↑ jump · ↓ / S duck · E / Shift use item
      </p>
    </div>
  );
}