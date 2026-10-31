import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sound";
import type { MovieState } from "@/types";

const card =
  "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";

export function Result({ state, myId }: { state: MovieState; myId: string }) {
  const f = state.final!;
  const coop = state.mode === "coop";
  const won = coop
    ? (f.solved ?? 0) / (state.coop?.target || 10) >= 0.6
    : f.winnerId === myId;
  const draw = !coop && f.winnerId === null;

  useEffect(() => {
    playSfx(won ? "win" : draw || coop ? "draw" : "lose");
    if (won) {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#FFB5C8", "#C9B3F5", "#9FE3C4", "#FFF3C4", "#D6ECFF"],
      });
    }
    // run once when the result screen appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emoji = coop ? "🎉" : won ? "🏆" : draw ? "🤝" : "😿";
  const title = coop
    ? f.tier
    : won
      ? "You win!"
      : draw
        ? "It's a draw!"
        : "You lost this one";
  const subtitle = coop
    ? `You solved ${f.solved} of ${state.coop?.target} movies together.`
    : won
      ? "Fastest fingers in the cat kingdom."
      : draw
        ? "Perfectly matched. Rematch?"
        : "Time to plan your revenge.";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="text-7xl">{emoji}</div>
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>

      <Card className={`${card} w-full`}>
        <p className="mb-3 text-sm text-muted-foreground">
          {coop ? "Movies solved" : "Final score"}
        </p>
        <div className="flex gap-3">
          {state.scores.map((s) => (
            <div
              key={s.id}
              className={`flex-1 rounded-2xl border-2 border-border p-3 ${
                s.id === myId ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              <div className="truncate text-xs">
                {s.id === myId ? `${s.name} (you)` : s.name}
              </div>
              <div className="font-display text-3xl font-bold">{s.score}</div>
            </div>
          ))}
        </div>
      </Card>

      <Button size="lg" onClick={() => socket.emit("room:back")}>
        Back to lobby
      </Button>
    </main>
  );
}
