import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/socket";
import { serverNow, syncClock } from "@/lib/clock";
import { playSfx, startGameMusic, stopGameMusic } from "@/theme/sounds";
import type { MilitiaFire, MilitiaHit, MilitiaPeer, MilitiaState } from "@/types";
import { MilitiaWorld, type MilitiaInput } from "./engine";
import {
  drawHud, drawSticks, drawWorld, leftCentre, makeCamera, rightCentre, STICK_R, touchButtons,
  type StickState,
} from "./render";
import { WEAPONS } from "./weapons";

const COLORS = ["#FF8FB1", "#7FC8FF", "#FFD36B", "#9FE3C4", "#C9A7FF", "#FFA77F"];
const card = "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";
const isTouch = () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

function useMilitia() {
  const [state, setState] = useState<MilitiaState | null>(null);
  useEffect(() => {
    socket.on("militia:state", setState);
    socket.emit("militia:request-state");
    return () => {
      socket.off("militia:state", setState);
    };
  }, []);
  return state;
}

export default function CatMilitia({ myId }: { myId: string }) {
  const state = useMilitia();

  useEffect(() => {
    syncClock();
    const id = setInterval(() => syncClock(3), 20_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    startGameMusic("militia");
    return () => stopGameMusic();
  }, []);

  if (!state) {
    return <div className="flex min-h-[60vh] items-center justify-center font-display text-xl">Loading… 🐱</div>;
  }
  if (state.phase === "lobby") return <Lobby state={state} myId={myId} />;
  return <Arena state={state} myId={myId} />;
}

/* ------------------------------------------------------------------ */
/* Lobby                                                                */
/* ------------------------------------------------------------------ */

function Lobby({ state, myId }: { state: MilitiaState; myId: string }) {
  const me = state.players.find((p) => p.id === myId);
  const s = state.settings;
  const pill = (on: boolean) =>
    `rounded-full border-2 border-border px-4 py-1.5 font-display text-sm transition ${on ? "bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--border)]" : "bg-card hover:bg-muted"}`;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <h1 className="text-center font-display text-3xl">Cat Militia 🔫🐱</h1>
      <p className="text-center text-muted-foreground">
        Jetpack deathmatch. Grab crates, out-shoot your friends and be first to the kill limit.
      </p>

      <Card className={card}>
        <h2 className="mb-3 font-display text-xl">Map</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {state.maps.map((m) => (
            <button
              key={m.id}
              className={`rounded-2xl border-2 border-border p-3 text-center transition ${s.map === m.id ? "bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--border)]" : "bg-card hover:bg-muted"}`}
              onClick={() => {
                playSfx("click");
                socket.emit("militia:settings", { map: m.id });
              }}
            >
              <div className="text-3xl">{m.emoji}</div>
              <div className="font-display text-sm">{m.name}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Kills to win</div>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 30].map((k) => (
                <button key={k} className={pill(s.kills === k)} onClick={() => socket.emit("militia:settings", { kills: k })}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Match length</div>
            <div className="flex flex-wrap gap-2">
              {[3, 5, 8, 12].map((m) => (
                <button key={m} className={pill(s.minutes === m)} onClick={() => socket.emit("militia:settings", { minutes: m })}>
                  {m} min
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className={card}>
        <h2 className="mb-3 font-display text-xl">Your cat</h2>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={c}
              onClick={() => socket.emit("militia:color", c)}
              className={`h-10 w-10 rounded-full border-2 border-border transition ${me?.color === c ? "scale-110 shadow-[3px_3px_0_0_var(--border)]" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Card>

      <Card className={card}>
        <h2 className="mb-2 font-display text-xl">Controls</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="font-display">📱 Phone (two sticks)</div>
            <ul className="ml-4 list-disc text-muted-foreground">
              <li>Left stick: run left/right, push up to fly with the jetpack</li>
              <li>Right stick: aim, push to the edge to shoot</li>
              <li>Buttons: 💣 grenade, 🔁 swap weapon, ⟳ reload</li>
              <li>Play in landscape</li>
            </ul>
          </div>
          <div>
            <div className="font-display">💻 Laptop</div>
            <ul className="ml-4 list-disc text-muted-foreground">
              <li>A / D run, W, Space or ↑ jetpack</li>
              <li>Mouse aims, hold left click to shoot</li>
              <li>Right click or G grenade, Q swap, R reload</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {state.players.map((p) => (
            <span key={p.id} className="rounded-full border-2 border-border bg-card px-3 py-1">
              <span className="mr-1 inline-block h-3 w-3 rounded-full align-middle" style={{ background: p.color }} />
              {p.name} {p.ready ? "✅" : "…"}
            </span>
          ))}
        </div>
        <Button
          size="lg"
          className="font-display"
          onClick={() => {
            playSfx("click");
            socket.emit("militia:ready", !me?.ready);
          }}
        >
          {me?.ready ? "Not ready" : "Ready!"}
        </Button>
        {state.players.length < 2 && <p className="text-sm text-muted-foreground">Waiting for another player…</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Arena                                                                */
/* ------------------------------------------------------------------ */

interface Controls {
  keys: Set<string>;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
  mouseGrenade: boolean;
  left: StickState | null;
  right: StickState | null;
  aim: number;
  buttonIds: Map<number, string>;
}

function Arena({ state, myId }: { state: MilitiaState; myId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const winner = state.players.find((p) => p.id === state.winnerId);
  const rotateHint = useRotateHint();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const touch = isTouch();
    const feed: { text: string; at: number }[] = [];
    const nameOf = (id: string) => stateRef.current.players.find((p) => p.id === id)?.name ?? "?";

    const world = new MilitiaWorld(state.settings.map, myId, {
      fire: (f) => socket.emit("militia:fire", f),
      hit: (victim, dmg, w) => socket.emit("militia:hit", { victim, dmg, w }),
      pickup: (id) => socket.emit("militia:pickup", id),
      sfx: (n) => playSfx(n),
    });
    world.applyPlayers(state.players);
    world.applyCrates(state.crates);

    const c: Controls = {
      keys: new Set(), mouseX: 0, mouseY: 0, mouseDown: false, mouseGrenade: false,
      left: null, right: null, aim: 0, buttonIds: new Map(),
    };

    let cw = 0;
    let ch = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      cw = Math.max(320, Math.floor(r.width));
      ch = Math.max(200, Math.floor(r.height));
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);

    /* ----- socket ----- */
    let lastAlive = true;
    let lastPhase = stateRef.current.phase;
    let lastSpawn = -1;
    const onState = (s: MilitiaState) => {
      world.applyPlayers(s.players);
      world.applyCrates(s.crates);
      const me = s.players.find((p) => p.id === myId);
      if (!me) return;
      if (s.phase === "countdown" && lastPhase !== "countdown") {
        world.respawn(me.spawn);
        world.cooldown = 99;
        lastSpawn = me.spawn;
      }
      if (s.phase === "play" && lastPhase === "countdown") world.cooldown = 0.3;
      if (s.phase === "play" && me.alive && !lastAlive) world.respawn(me.spawn);
      if (!me.alive && lastAlive) world.die();
      lastAlive = me.alive;
      lastPhase = s.phase;
      world.hp = me.hp;
      if (s.phase === "over") {
        world.alive = false;
        if (s.winnerId === myId) {
          playSfx("win");
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } else if (s.winnerId) playSfx("lose");
      }
    };
    const onPeer = (p: MilitiaPeer) => world.onPeer(p);
    const onFire = (f: MilitiaFire) => world.onRemoteFire(f);
    const onHit = (h: MilitiaHit) => {
      if (h.victim === myId) {
        world.hp = h.hp;
        world.flash = 0.3;
        world.shake = Math.max(world.shake, 0.15);
        playSfx("hit");
      } else {
        const peer = world.peers.get(h.victim);
        if (peer) peer.hp = h.hp;
      }
      if (h.killed) {
        feed.push({ at: performance.now(), text: `${nameOf(h.attacker)} 🔫 ${nameOf(h.victim)}` });
        if (h.attacker === myId) playSfx("correct");
      }
    };
    socket.on("militia:state", onState);
    socket.on("militia:peer", onPeer);
    socket.on("militia:fire", onFire);
    socket.on("militia:hit", onHit);
    // the arena can mount after the countdown began
    {
      const me = state.players.find((p) => p.id === myId);
      if (me && state.phase !== "lobby" && state.phase !== "over") {
        world.respawn(me.spawn);
        lastSpawn = me.spawn;
        lastAlive = me.alive;
      }
    }

    /* ----- desktop input ----- */
    const keyMap = (e: KeyboardEvent) => e.key.toLowerCase();
    const onKeyDown = (e: KeyboardEvent) => {
      const k = keyMap(e);
      if (["w", "a", "s", "d", " ", "arrowup", "arrowleft", "arrowright", "arrowdown", "q", "r", "g", "e"].includes(k)) e.preventDefault();
      if (e.repeat) return;
      c.keys.add(k);
      if (k === "q" || k === "e") world.swap();
      if (k === "r") world.startReload();
      if (k === "g") world.throwGrenade();
    };
    const onKeyUp = (e: KeyboardEvent) => c.keys.delete(keyMap(e));
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", () => c.keys.clear());

    /* ----- pointer (mouse + touch) ----- */
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      canvas.setPointerCapture(e.pointerId);
      if (e.pointerType === "mouse") {
        c.mouseX = p.x;
        c.mouseY = p.y;
        if (e.button === 2) {
          world.throwGrenade();
        } else c.mouseDown = true;
        return;
      }
      // touch: buttons first, then the two sticks
      for (const b of touchButtons(cw, ch)) {
        if (Math.hypot(p.x - b.x, p.y - b.y) <= b.r + 10) {
          c.buttonIds.set(e.pointerId, b.id);
          if (b.id === "swap") world.swap();
          if (b.id === "reload") world.startReload();
          if (b.id === "grenade") world.throwGrenade();
          return;
        }
      }
      if (p.x < cw / 2) {
        if (!c.left) c.left = { id: e.pointerId, x: p.x, y: p.y };
      } else if (!c.right) c.right = { id: e.pointerId, x: p.x, y: p.y };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (e.pointerType === "mouse") {
        c.mouseX = p.x;
        c.mouseY = p.y;
        return;
      }
      if (c.left && c.left.id === e.pointerId) {
        c.left.x = p.x;
        c.left.y = p.y;
      }
      if (c.right && c.right.id === e.pointerId) {
        c.right.x = p.x;
        c.right.y = p.y;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        if (e.button !== 2) c.mouseDown = false;
        return;
      }
      if (c.left && c.left.id === e.pointerId) c.left = null;
      if (c.right && c.right.id === e.pointerId) c.right = null;
      c.buttonIds.delete(e.pointerId);
    };
    const noMenu = (e: Event) => e.preventDefault();
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("contextmenu", noMenu);

    /* ----- loop ----- */
    const stick = (s: StickState | null, centre: { x: number; y: number }) => {
      if (!s) return { x: 0, y: 0, m: 0 };
      const dx = s.x - centre.x;
      const dy = s.y - centre.y;
      const m = Math.hypot(dx, dy);
      const k = m > STICK_R ? STICK_R / m : 1;
      return { x: (dx * k) / STICK_R, y: (dy * k) / STICK_R, m: Math.min(1, m / STICK_R) };
    };

    let raf = 0;
    let last = performance.now();
    let sendAcc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const playing = s.phase === "play";

      // ----- gather input
      const input: MilitiaInput = { move: 0, jet: false, aim: c.aim, fire: false };
      let aimMag = 0;
      if (c.keys.has("a") || c.keys.has("arrowleft")) input.move -= 1;
      if (c.keys.has("d") || c.keys.has("arrowright")) input.move += 1;
      if (c.keys.has("w") || c.keys.has("arrowup") || c.keys.has(" ")) input.jet = true;
      if (c.mouseDown) input.fire = true;

      const cam = makeCamera(world, cw, ch, world.alive ? world.x : world.x, world.alive ? world.y : world.y);
      // mouse aim in world space
      if (!touch || c.mouseDown || c.mouseX) {
        const wx = cam.x + c.mouseX / cam.scale;
        const wy = cam.y + c.mouseY / cam.scale;
        if (c.mouseX || c.mouseY) c.aim = Math.atan2(wy - world.y, wx - world.x);
      }
      if (c.left) {
        const v = stick(c.left, leftCentre(cw, ch));
        if (Math.abs(v.x) > 0.18) input.move = v.x;
        if (v.y < -0.35) input.jet = true;
      }
      if (c.right) {
        const v = stick(c.right, rightCentre(cw, ch));
        aimMag = v.m;
        if (v.m > 0.2) c.aim = Math.atan2(v.y, v.x);
        if (v.m > 0.6) input.fire = true;
      }
      input.aim = c.aim;

      world.step(dt, input, playing);

      // ----- network
      sendAcc += dt;
      if (sendAcc >= 0.05 && world.alive && s.phase !== "lobby") {
        sendAcc = 0;
        socket.volatile.emit("militia:update", world.snapshot());
      }

      // ----- draw
      const me = s.players.find((p) => p.id === myId);
      const cam2 = makeCamera(world, cw, ch, world.x, world.y);
      drawWorld(ctx, world, cw, ch, cam2, now / 1000, me?.color ?? "#FF8FB1", "You");
      const t = serverNow();
      drawHud(ctx, world, cw, ch, {
        players: s.players,
        myId,
        timeLeft: s.phase === "play" ? (s.endsAt - t) / 1000 : s.settings.minutes * 60,
        target: s.settings.kills,
        feed,
        respawnIn: me && !me.alive ? Math.max(0, Math.ceil((me.respawnAt - t) / 1000)) : 0,
        touch,
        countdown: s.phase === "countdown" ? Math.max(0, Math.ceil((s.startAt - t) / 1000)) : 0,
      }, now);
      if (touch) drawSticks(ctx, cw, ch, c.left, c.right, aimMag);
    };
    raf = requestAnimationFrame(loop);
    void lastSpawn;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("contextmenu", noMenu);
      socket.off("militia:state", onState);
      socket.off("militia:peer", onPeer);
      socket.off("militia:fire", onFire);
      socket.off("militia:hit", onHit);
    };
    // the arena is rebuilt only when a new match starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startAt, myId]);

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-black">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      {rotateHint && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-8 text-center font-display text-xl text-white">
          Rotate your phone to landscape 📱↔️
        </div>
      )}
      {state.phase === "over" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
          <Card className={`${card} w-full max-w-md text-center`}>
            <div className="text-5xl">{winner ? (winner.id === myId ? "🏆" : "😿") : "🤝"}</div>
            <h2 className="mt-2 font-display text-2xl">
              {winner ? (winner.id === myId ? "You win!" : `${winner.name} wins!`) : "It's a tie!"}
            </h2>
            <ul className="my-4 space-y-1 text-sm">
              {[...state.players].sort((a, b) => b.kills - a.kills).map((p) => (
                <li key={p.id} className="flex justify-between rounded-xl border-2 border-border px-3 py-1">
                  <span>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: p.color }} />
                    {p.id === myId ? "You" : p.name}
                  </span>
                  <span>{p.kills} kills · {p.deaths} deaths</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-2">
              <Button className="font-display" onClick={() => socket.emit("militia:again")}>
                Play again
              </Button>
              <Button variant="outline" className="font-display" onClick={() => socket.emit("room:back")}>
                Back to lobby
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function useRotateHint() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const check = () => setPortrait(isTouch() && window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return portrait;
}

// keep the weapon table referenced for tree-shaking friendly debugging
export const MILITIA_WEAPON_IDS = Object.keys(WEAPONS);
