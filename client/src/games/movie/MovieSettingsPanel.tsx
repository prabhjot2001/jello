import { Button } from "@/components/ui/button";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sound";
import type { MovieSettings, PuzzleType, RoomState } from "@/types";
import { useEffect, useState } from "react";

const card =
  "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

const TYPES: [PuzzleType, string][] = [
  ["emoji", "🎭 Emoji"],
  ["clues", "💡 Clues"],
  ["scramble", "🔤 Scramble"],
  ["line", "🎤 Line"],
  ["frame", "🖼️ Frame"],
  ["song", "🎵 Song"],
];

function Seg<T extends string | number | boolean>({
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
            key={String(v)}
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

export function MovieSettingsPanel({ room }: { room: RoomState }) {
  const s = room.settings;
  const coop = room.mode === "coop";

  const set = (patch: Partial<MovieSettings>) => {
    socket.emit("room:set-settings", patch);
    playSfx("click");
  };

  const toggleType = (t: PuzzleType) => {
    const types = s.types.includes(t)
      ? s.types.filter((x) => x !== t)
      : [...s.types, t];
    if (types.length) set({ types });
  };

  return (
    <section className={`${card} flex flex-col gap-4`}>
      <h2 className="font-display text-xl font-bold">⚙️ Game settings</h2>

      {coop ? (
        <>
          <Seg
            label="Time limit"
            value={s.coopSeconds}
            options={[
              [60, "60s"],
              [90, "90s"],
              [120, "2 min"],
              [180, "3 min"],
            ]}
            onChange={(v) => set({ coopSeconds: v })}
          />
          <Seg
            label="Movies to solve"
            value={s.coopTarget}
            options={[
              [5, "5"],
              [10, "10"],
              [15, "15"],
            ]}
            onChange={(v) => set({ coopTarget: v })}
          />
        </>
      ) : (
        <>
          <Seg
            label="Rounds"
            value={s.rounds}
            options={[
              [5, "5"],
              [8, "8"],
              [10, "10"],
              [12, "12"],
            ]}
            onChange={(v) => set({ rounds: v })}
          />
          <div>
            <Seg
              label="Time per round"
              value={s.roundSeconds}
              options={[
                [10, "Fast · 10s"],
                [20, "20s"],
                [45, "45s"],
                [60, "1 min"],
                [120, "2 min"],
              ]}
              onChange={(v) => set({ roundSeconds: v })}
            />
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span>Custom:</span>
              <CustomNumber
                value={s.roundSeconds}
                min={8}
                max={300}
                onCommit={(n) => set({ roundSeconds: n })}
              />
              <span>seconds (8 to 300)</span>
            </div>
          </div>

          <Seg
            label="Hints"
            value={s.hints}
            options={[
              [true, "On"],
              [false, "Off"],
            ]}
            onChange={(v) => set({ hints: v })}
          />
        </>
      )}

      <div>
        <p className="mb-1 text-sm font-semibold">Round types</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(([t, text]) => (
            <Button
              key={t}
              size="sm"
              variant={s.types.includes(t) ? "default" : "outline"}
              onClick={() => toggleType(t)}
            >
              {text}
            </Button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {coop
            ? "Partner Challenge only uses Emoji, Scramble and Line rounds."
            : "Frame and Song rounds only appear for movies that have an image or audio clip."}
        </p>
      </div>

      {/* {!coop && s.types.includes("frame") && (
        <Seg label="Image reveal" value={s.reveal}
          options={[["blur", "Blur"], ["zoom", "Zoom out"], ["both", "Both (hard)"]]}
          onChange={(v) => set({ reveal: v })} />
      )} */}
    </section>
  );
}

function CustomNumber({
  value,
  min,
  max,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const n = Math.round(Number(text));
    if (Number.isFinite(n)) onCommit(Math.min(max, Math.max(min, n)));
    else setText(String(value));
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
      className="h-8 w-20 rounded-lg border-2 border-border bg-card px-2 text-center text-sm"
    />
  );
}
