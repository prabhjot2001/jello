import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/Sticker";
import { socket } from "@/socket";
import { useServerTime } from "@/lib/clock";
import { playSfx } from "@/theme/sounds";
import type { TankSettings, TanksState } from "@/types";
import { TANK_SKINS } from "./tankArt";

const card = "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

function Seg<T extends string | number | boolean>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, text]) => (
          <Button key={String(v)} size="sm" variant={value === v ? "default" : "outline"} onClick={() => onChange(v)}>
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function TankGarage({ state, myId }: { state: TanksState; myId: string }) {
  const g = state.garage;
  const ready = !!g.ready[myId];
  const set = (patch: Partial<TankSettings>) => {
    socket.emit("tanks:settings", patch);
    playSfx("click");
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">🎯 Cat Tanks</h1>
        <p className="text-muted-foreground">Pick your tank and a map, then fight over 10 volleys each.</p>
      </header>

      <Card className={card}>
        <h2 className="mb-2 font-display text-xl font-bold">🪖 Your tank</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {TANK_SKINS.map((s) => (
            <button
              key={s.id}
              title={s.name}
              onClick={() => {
                socket.emit("tanks:pick", { tank: s.id });
                playSfx("click");
              }}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 border-border transition hover:-translate-y-0.5 ${
                g.tanks[myId] === s.id ? "ring-4 ring-ring" : ""
              }`}
              style={{ background: s.color }}
            >
              <Sticker src={`tanks/${s.id}.png`} fallback="🪖" size={44} />
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {state.players.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border-2 border-border px-3 py-1 text-sm">
              <span className="font-semibold" style={{ color: p.color }}>
                {p.id === myId ? `${p.name} (you)` : p.name}
              </span>
              <Badge variant={g.ready[p.id] ? "default" : "outline"}>{g.ready[p.id] ? "Ready ✅" : "Choosing…"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className={card}>
        <h2 className="mb-3 font-display text-xl font-bold">🗺️ Choose a map</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.maps.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                socket.emit("tanks:pick", { map: m.id });
                playSfx("click");
              }}
              className={`rounded-2xl border-2 border-border p-3 text-left transition hover:-translate-y-0.5 ${
                g.map === m.id ? "ring-4 ring-ring" : ""
              }`}
              style={{ background: `linear-gradient(${m.theme.skyTop}, ${m.theme.skyBottom})` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-3xl">{m.emoji}</span>
                <span className="font-display font-bold text-white drop-shadow">{m.name}</span>
              </div>
              <p className="mt-1 text-xs text-white drop-shadow">{m.tagline}</p>
              {m.gravity < 1 && <p className="text-[11px] text-white/90">⬇️ Low gravity</p>}
            </button>
          ))}
        </div>
      </Card>

      <Card className={`${card} flex flex-col gap-4`}>
        <h2 className="font-display text-xl font-bold">⚙️ Match settings</h2>
        <Seg label="Shots per player" value={g.settings.turns}
          options={[[5, "5"], [8, "8"], [10, "10"]]} onChange={(v) => set({ turns: v })} />
        <Seg label="Wind" value={g.settings.wind}
          options={[["off", "None"], ["low", "Low"], ["normal", "Normal"], ["high", "High"]]} onChange={(v) => set({ wind: v })} />
        <Seg label="Blast size" value={g.settings.blast}
          options={[["small", "Small"], ["normal", "Normal"], ["large", "Large"]]} onChange={(v) => set({ blast: v })} />
        <Seg label="Kickback (the tank slides back when firing)" value={g.settings.kick ? "on" : "off"}
          options={[["off", "Off"], ["on", "On"]]} onChange={(v) => set({ kick: v === "on" })} />
        <Seg label="Turn timer" value={g.settings.timer}
          options={[[0, "None"], [30, "30s"], [60, "60s"], [90, "90s"]]} onChange={(v) => set({ timer: v })} />
      </Card>

      <div className="flex flex-col items-center gap-2 pb-6">
        <Button
          size="lg"
          variant={ready ? "secondary" : "default"}
          onClick={() => {
            socket.emit("tanks:ready", !ready);
            playSfx("click");
          }}
        >
          {ready ? "Ready ✅ (cancel)" : "To the weapon shop!"}
        </Button>
        {ready && <p className="text-sm text-muted-foreground">Waiting for your rival…</p>}
      </div>
    </main>
  );
}

export function TankShop({ state, myId }: { state: TanksState; myId: string }) {
  const shop = state.shop!;
  const now = useServerTime(250);
  const mine = shop.picker === myId;
  const left = Math.max(0, Math.ceil((shop.endsAt - now) / 1000));
  const picker = state.players.find((p) => p.id === shop.picker);
  const info = (id: string) => state.weapons.find((w) => w.id === id);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">🛒 Weapon shop</h1>
        <p className={`font-semibold ${mine ? "text-primary" : "text-muted-foreground"}`}>
          {mine ? "Your pick!" : `${picker?.name ?? "Your rival"} is picking…`} ⏱ {left}s
        </p>
        <p className="text-sm text-muted-foreground">
          Each weapon can be used once. Everyone picks {state.garage.settings.turns} of {state.garage.settings.turns * 2}.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shop.pool.map((id) => {
          const w = info(id);
          if (!w) return null;
          return (
            <button
              key={id}
              disabled={!mine}
              onClick={() => {
                socket.emit("tanks:buy", id);
                playSfx("pop");
              }}
              className="rounded-2xl border-2 border-border bg-card p-3 text-left shadow-[3px_3px_0_0_var(--border)] transition enabled:hover:-translate-y-0.5 disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{w.emoji}</span>
                <span className="text-xs">{"★".repeat(w.power)}{"☆".repeat(5 - w.power)}</span>
              </div>
              <div className="font-display font-bold">{w.name}</div>
              <div className="text-xs text-muted-foreground">{w.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {state.players.map((p) => (
          <Card key={p.id} className={card}>
            <p className="mb-2 font-display font-bold" style={{ color: p.color }}>
              {p.id === myId ? `${p.name} (you)` : p.name} · {p.arsenal.length}/{state.garage.settings.turns}
            </p>
            <div className="flex flex-wrap gap-1 text-2xl">
              {p.arsenal.map((id) => (
                <span key={id} title={info(id)?.name}>
                  {info(id)?.emoji}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
