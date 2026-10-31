import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/socket";
// import { playSfx } from "@/theme/sound";
import { syncClock } from "@/lib/clock";
import type { KartState } from "@/types";
import { Garage } from "./Garage";
import { RaceCanvas } from "./RaceCanvas";
import { useKartState } from "./useKartState";
import {
  playSfx,
  preloadSfx,
  startGameMusic,
  stopGameMusic,
  type SfxName,
} from "@/theme/sound";

const card =
  "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";

const KART_SFX: SfxName[] = [
  "jump",
  "duck",
  "hit",
  "finish",
  "coin",
  "boost",
  "itemPick",
  "shield",
  "throwItem",
  "trapped",
  "tick",
  "roundStart",
  "reveal",
  "oppScore",
  "win",
  "lose",
  "meme",
];

export default function KartRace({ myId }: { myId: string }) {
  const state = useKartState();

  useEffect(() => {
    syncClock();
    const id = setInterval(() => syncClock(3), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    preloadSfx(KART_SFX);
  }, []);

  // race music only while racing: theme music plays in the garage and on the result screen
  const phase = state?.phase;
  useEffect(() => {
    if (phase === "countdown" || phase === "race") startGameMusic("kart");
    else stopGameMusic();
  }, [phase]);
  useEffect(() => () => stopGameMusic(), []);

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-display text-xl">
        Loading… 🐱
      </div>
    );
  }
  if (state.phase === "garage") return <Garage state={state} myId={myId} />;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-3 px-3 py-4">
      <RaceCanvas state={state} myId={myId} />
      {state.phase === "final" && <KartResult state={state} myId={myId} />}
    </main>
  );
}

function KartResult({ state, myId }: { state: KartState; myId: string }) {
  const won = state.winnerId === myId;

  useEffect(() => {
    playSfx(won ? "win" : "lose");
    if (won) {
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#FFB5C8", "#C9B3F5", "#9FE3C4", "#FFF3C4", "#D6ECFF"],
      });
    }
    // run once when the result appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (ms: number | null) =>
    ms === null ? "DNF" : `${(ms / 1000).toFixed(2)}s`;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <Card className={`${card} w-full max-w-sm text-center`}>
        <div className="text-6xl">{won ? "🏆" : "😿"}</div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          {won ? "You win!" : "You lost this one"}
        </h2>
        <p className="mb-4 text-muted-foreground">
          {won
            ? "Fastest kart in the cat kingdom."
            : "Time to plan your revenge."}
        </p>

        <div className="mb-4 flex flex-col gap-2">
          {state.results.map((r, i) => (
            <div
              key={r.id}
              className={`rounded-2xl border-2 border-border px-4 py-2 text-left ${
                r.id === myId ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">
                  {i + 1}. {r.id === myId ? `${r.name} (you)` : r.name}
                </span>
                <span className="font-display">{fmt(r.timeMs)}</span>
              </div>
              <div className="text-xs opacity-80">
                {r.rawMs !== null
                  ? `${(r.rawMs / 1000).toFixed(2)}s − 🪙${r.coins} × 0.1s`
                  : `🪙${r.coins} collected`}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => socket.emit("kart:again")}>
            Race again
          </Button>
          <Button variant="outline" onClick={() => socket.emit("room:back")}>
            Back to lobby
          </Button>
        </div>
      </Card>
    </div>
  );
}
