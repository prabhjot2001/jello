import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/socket";
import { syncClock } from "@/lib/clock";
import { playSfx, startGameMusic, stopGameMusic } from "@/theme/sound";
import type { TootCounts, TootPlayer, TootState } from "@/types";
import { TootCanvas } from "./TootCanvas";

const card = "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";

function useTootState() {
  const [state, setState] = useState<TootState | null>(null);
  useEffect(() => {
    socket.on("toot:state", setState);
    socket.emit("toot:request-state");
    return () => {
      socket.off("toot:state", setState);
    };
  }, []);
  return state;
}

export default function TootRaft({ myId }: { myId: string }) {
  const state = useTootState();

  useEffect(() => {
    syncClock();
    const id = setInterval(() => syncClock(3), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    startGameMusic("toot");
    return () => stopGameMusic();
  }, []);

  if (!state) {
    return <div className="flex min-h-[60vh] items-center justify-center font-display text-xl">Loading… 🐱</div>;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-3 px-3 py-4">
      <TootCanvas state={state} myId={myId} />
      {state.phase === "clear" && <ClearOverlay state={state} myId={myId} />}
      {state.phase === "final" && <FinalOverlay state={state} myId={myId} />}
    </main>
  );
}

function Stats({ players, counts, myId }: { players: TootPlayer[]; counts: TootCounts; myId: string }) {
  const worst = Math.max(0, ...players.map((p) => counts.blames[p.id] ?? 0));
  const gassiest = Math.max(0, ...players.map((p) => counts.farts[p.id] ?? 0));
  return (
    <div className="flex flex-col gap-2 text-left">
      {players.map((p) => {
        const blames = counts.blames[p.id] ?? 0;
        const farts = counts.farts[p.id] ?? 0;
        return (
          <div key={p.id} className="rounded-2xl border-2 border-border bg-card px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold" style={{ color: p.color }}>
                {p.id === myId ? `${p.name} (you)` : p.name}
              </span>
              <span className="text-sm">
                {blames > 0 && blames === worst ? "🫵 Raft tipper " : ""}
                {farts > 0 && farts === gassiest ? "💨 Gassiest" : ""}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Tipped the raft {blames}× · Farted {farts}×
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <Card className={`${card} w-full max-w-sm text-center`}>{children}</Card>
    </div>
  );
}

function ClearOverlay({ state, myId }: { state: TootState; myId: string }) {
  useEffect(() => {
    playSfx("win");
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  }, []);

  return (
    <Overlay>
      <div className="text-6xl">🏁</div>
      <h2 className="mt-2 font-display text-3xl font-bold">Level cleared!</h2>
      <p className="mb-4 text-muted-foreground">
        {state.level.name} · {(state.stats.timeMs / 1000).toFixed(1)}s · 💀 {state.stats.deaths}
      </p>
      <div className="mb-4">
        <Stats players={state.players} counts={state.stats} myId={myId} />
      </div>
      <Button size="lg" className="w-full" onClick={() => socket.emit("toot:next")}>
        {state.levelIndex + 1 < state.levelCount ? "Next level →" : "See final results"}
      </Button>
    </Overlay>
  );
}

function FinalOverlay({ state, myId }: { state: TootState; myId: string }) {
  useEffect(() => {
    playSfx("win");
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
  }, []);
  const totals = state.totals!;

  return (
    <Overlay>
      <div className="text-6xl">🏆</div>
      <h2 className="mt-2 font-display text-3xl font-bold">You made it!</h2>
      <p className="mb-4 text-muted-foreground">
        Total {(totals.timeMs / 1000).toFixed(1)}s · 💀 {totals.deaths}
      </p>
      <div className="mb-4">
        <Stats players={state.players} counts={totals} myId={myId} />
      </div>
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={() => socket.emit("toot:again")}>
          Play again
        </Button>
        <Button variant="outline" onClick={() => socket.emit("room:back")}>
          Back to lobby
        </Button>
      </div>
    </Overlay>
  );
}