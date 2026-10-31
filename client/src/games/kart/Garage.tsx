import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/Sticker";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sound";
import type { KartSettings, KartState } from "@/types";
import { AVATARS, COLORS } from "./avatars";
import { KartPreview } from "./KartPreview";

const card =
  "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

function Seg<T extends string>({
  label,
  value,
  options,
  onChange,
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
          <Button
            key={v}
            size="sm"
            variant={value === v ? "default" : "outline"}
            onClick={() => onChange(v)}
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function Garage({ state, myId }: { state: KartState; myId: string }) {
  const me = state.players.find((p) => p.id === myId);
  const other = state.players.find((p) => p.id !== myId);
  if (!me) return null;

  const customize = (patch: { avatar?: string; color?: string }) => {
    socket.emit("kart:customize", {
      avatar: patch.avatar ?? me.avatar,
      color: patch.color ?? me.color,
    });
    playSfx("click");
  };
  const setSettings = (patch: Partial<KartSettings>) => {
    socket.emit("kart:settings", patch);
    playSfx("click");
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold">🔧 Garage</h1>
        <p className="text-muted-foreground">
          Pick your driver and paint your kart.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className={card}>
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display text-lg font-bold">{me.name} (you)</p>
            <Badge variant={me.ready ? "default" : "outline"}>
              {me.ready ? "Ready ✅" : "Not ready"}
            </Badge>
          </div>
          <KartPreview avatarId={me.avatar} color={me.color} />

          <p className="mb-1 mt-3 text-sm font-semibold">Driver</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                title={a.name}
                onClick={() => customize({ avatar: a.id })}
                className={`flex aspect-square items-center justify-center rounded-2xl border-2 border-border transition hover:-translate-y-0.5 ${
                  me.avatar === a.id ? "bg-primary" : "bg-card"
                }`}
              >
                <Sticker src={a.file} fallback={a.fallback} size={36} />
              </button>
            ))}
          </div>

          <p className="mb-1 mt-3 text-sm font-semibold">Kart color</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                aria-label={c}
                onClick={() => customize({ color: c })}
                className={`h-9 w-9 rounded-full border-2 border-border transition hover:scale-110 ${
                  me.color === c ? "ring-4 ring-ring" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </Card>

        <Card className={card}>
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display text-lg font-bold">
              {other?.name ?? "Partner"}
            </p>
            <Badge variant={other?.ready ? "default" : "outline"}>
              {other?.ready ? "Ready ✅" : "Choosing…"}
            </Badge>
          </div>
          {other ? (
            <KartPreview avatarId={other.avatar} color={other.color} />
          ) : (
            <p className="py-16 text-center text-muted-foreground">
              Waiting for your partner… 🐾
            </p>
          )}
        </Card>
      </section>

      <Card className={`${card} flex flex-col gap-4`}>
        <h2 className="font-display text-xl font-bold">⚙️ Track settings</h2>
        <Seg
          label="Track length"
          value={state.settings.length}
          options={[
            ["short", "Short"],
            ["normal", "Normal"],
            ["long", "Long"],
          ]}
          onChange={(v) => setSettings({ length: v })}
        />
        <Seg
          label="Difficulty"
          value={state.settings.difficulty}
          options={[
            ["chill", "Chill"],
            ["normal", "Normal"],
            ["hard", "Hard"],
            ["insane", "Insane 🔥"],
          ]}
          onChange={(v) => setSettings({ difficulty: v })}
        />
        <Seg
          label="Item boxes (banana traps, shields, nitro)"
          value={state.settings.items ? "on" : "off"}
          options={[
            ["on", "On"],
            ["off", "Off"],
          ]}
          onChange={(v) => setSettings({ items: v === "on" })}
        />
        <p className="text-xs text-muted-foreground">
          Every coin you collect takes 0.1s off your final time.
        </p>
      </Card>

      <div className="flex flex-col items-center gap-2 pb-6">
        <Button
          size="lg"
          variant={me.ready ? "secondary" : "default"}
          onClick={() => {
            socket.emit("kart:ready", !me.ready);
            playSfx("click");
          }}
        >
          {me.ready ? "Ready ✅ (cancel)" : "I'm ready to race!"}
        </Button>
        {me.ready && !other?.ready && (
          <p className="text-sm text-muted-foreground">
            Waiting for your partner…
          </p>
        )}
      </div>
    </main>
  );
}
