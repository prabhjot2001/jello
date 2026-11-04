import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/Sticker";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sound";
import { totalStars } from "@/lib/tootProgress";
import type { TootPlayer, TootState, TootVehicleInfo } from "@/types";
import { AVATARS } from "../kart/avatars";
import { readTheme } from "../kart/engine";
import { drawAvatar, drawVehicle, slotX } from "./tootRender";

const card = "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

/** A small animated preview of the chosen vehicle with everyone's cats on it. */
function VehiclePreview({ vehicle, players }: { vehicle: TootVehicleInfo; players: TootPlayer[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const props = useRef({ vehicle, players });
  props.current = { vehicle, players };

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 640;
    canvas.height = 340;
    const th = readTheme();
    let raf = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      const { vehicle: v, players: ps } = props.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, 640, 340);
      const k = Math.min(2, 520 / v.w);
      ctx.setTransform(k, 0, 0, k, 320, 240);
      ctx.translate(0, Math.sin(ts / 400) * 3);
      drawVehicle(ctx, v, th.ink, ts);
      ps.forEach((p, i) => drawAvatar(ctx, p.avatar, slotX(i, ps.length, v.w), -v.h / 2 - 26, 52));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="mx-auto w-full max-w-[360px]" style={{ aspectRatio: "640 / 340" }} />;
}

function StatBar({ label, value }: { label: string; value: number }) {
  // vehicle stats range from about 0.8 to 1.5
  const pct = Math.max(8, Math.min(100, ((value - 0.7) / 0.8) * 100));
  return (
    <div className="flex items-center gap-1 text-[10px]">
      <span className="w-12">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TootGarage({ state, myId }: { state: TootState; myId: string }) {
  const [toast, setToast] = useState("");
  const stars = totalStars();
  const ready = !!state.garage.ready[myId];
  const myAvatar = state.garage.avatars[myId];

  const say = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">🔧 Toot Garage</h1>
        <p className="text-muted-foreground">Pick your character, a map and a vehicle for the whole team.</p>
        <p className="mt-1 text-sm font-semibold">⭐ {stars} stars earned</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className={card}>
          <VehiclePreview vehicle={state.vehicle} players={state.players} />
          <p className="mt-2 text-center font-display text-lg font-bold">{state.vehicle.name}</p>
        </Card>

        <Card className={card}>
          <h2 className="mb-2 font-display text-xl font-bold">🐱 Your character</h2>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                title={a.name}
                onClick={() => {
                  socket.emit("toot:pick", { avatar: a.id });
                  playSfx("click");
                }}
                className={`flex aspect-square items-center justify-center rounded-2xl border-2 border-border transition hover:-translate-y-0.5 ${
                  myAvatar === a.id ? "bg-primary" : "bg-card"
                }`}
              >
                <Sticker src={a.file} fallback={a.fallback} size={36} />
              </button>
            ))}
          </div>

          <h2 className="mb-2 mt-4 font-display text-xl font-bold">Players</h2>
          <div className="flex flex-col gap-1">
            {state.players.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border-2 border-border px-3 py-1 text-sm">
                <span className="font-semibold" style={{ color: p.color }}>
                  {p.id === myId ? `${p.name} (you)` : p.name}
                </span>
                <Badge variant={state.garage.ready[p.id] ? "default" : "outline"}>
                  {state.garage.ready[p.id] ? "Ready ✅" : "Choosing…"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className={card}>
        <h2 className="mb-3 font-display text-xl font-bold">🗺️ Choose a map</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.maps.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                socket.emit("toot:pick", { map: m.id });
                playSfx("click");
              }}
              className={`rounded-2xl border-2 border-border p-3 text-left transition hover:-translate-y-0.5 ${
                state.garage.map === m.id ? "ring-4 ring-ring" : ""
              }`}
              style={{ background: `linear-gradient(${m.theme.skyTop}, ${m.theme.skyBottom})` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-3xl">{m.emoji}</span>
                <span className="font-display font-bold text-white drop-shadow">{m.name}</span>
              </div>
              <p className="mt-1 text-xs text-white/90">{m.tagline}</p>
              <p className="mt-1 text-[11px] text-white/80">⚠️ {m.hazards}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className={card}>
        <h2 className="mb-3 font-display text-xl font-bold">🚀 Choose a vehicle</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {state.vehicles.map((v) => {
            const locked = v.premium && stars < v.unlockStars;
            return (
              <button
                key={v.id}
                onClick={() => {
                  if (locked) return say(`🔒 ${v.name} unlocks at ${v.unlockStars} ⭐. You have ${stars}.`);
                  socket.emit("toot:pick", { vehicle: v.id });
                  playSfx("click");
                }}
                className={`rounded-2xl border-2 border-border bg-card p-3 text-left transition hover:-translate-y-0.5 ${
                  state.garage.vehicle === v.id ? "ring-4 ring-ring" : ""
                } ${locked ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{v.emoji}</span>
                  {v.premium && <Badge>{locked ? `🔒 ${v.unlockStars}⭐` : "⭐ Premium"}</Badge>}
                </div>
                <div className="mt-1 font-display text-sm font-bold">{v.name}</div>
                <StatBar label="Power" value={v.power} />
                <StatBar label="Control" value={v.control} />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Earn stars by clearing levels with few wipeouts (0 to 1 wipeouts = 3 stars). Premium vehicles have more power
          and more control.
        </p>
      </Card>

      <div className="flex flex-col items-center gap-2 pb-6">
        {toast && <p className="text-sm font-semibold">{toast}</p>}
        <Button
          size="lg"
          variant={ready ? "secondary" : "default"}
          onClick={() => {
            socket.emit("toot:ready", !ready);
            playSfx("click");
          }}
        >
          {ready ? "Ready ✅ (cancel)" : "Start the run!"}
        </Button>
        {ready && <p className="text-sm text-muted-foreground">Waiting for the others to be ready…</p>}
      </div>
    </main>
  );
}