import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/socket";
import { syncClock } from "@/lib/clock";
import { playSfx, startGameMusic, stopGameMusic } from "@/theme/sounds";
import type { TankShot, TanksState, TankTerrain } from "@/types";
import { TankBattle } from "./TankBattle";
import { TankGarage, TankShop } from "./TankMenus";

function useTanks() {
  const [state, setState] = useState<TanksState | null>(null);
  const [terrain, setTerrain] = useState<TankTerrain | null>(null);
  const [shot, setShot] = useState<TankShot | null>(null);

  useEffect(() => {
    socket.on("tanks:state", setState);
    socket.on("tanks:terrain", setTerrain);
    socket.on("tanks:shot", setShot);
    socket.emit("tanks:request-state");
    return () => {
      socket.off("tanks:state", setState);
      socket.off("tanks:terrain", setTerrain);
      socket.off("tanks:shot", setShot);
    };
  }, []);

  return { state, terrain, shot };
}

export default function TankDuel({ myId }: { myId: string }) {
  const { state, terrain, shot } = useTanks();

  useEffect(() => {
    syncClock();
    const id = setInterval(() => syncClock(3), 20_000);
    return () => clearInterval(id);
  }, []);

  // each map has its own music
  const musicKey =
    !state || state.phase === "garage" || state.phase === "shop" ? "tanks:garage" : `tanks:${state.garage.map}`;
  useEffect(() => {
    startGameMusic(musicKey);
  }, [musicKey]);
  useEffect(() => () => stopGameMusic(), []);

  if (!state) {
    return <div className="flex min-h-[60vh] items-center justify-center font-display text-xl">Loading… 🐱</div>;
  }
  if (state.phase === "garage") return <TankGarage state={state} myId={myId} />;
  if (state.phase === "shop" && state.shop) return <TankShop state={state} myId={myId} />;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-3 px-3 py-4">
      <TankBattle state={state} terrain={terrain} shot={shot} myId={myId} />
      {state.phase === "over" && <Over state={state} myId={myId} />}
    </main>
  );
}

function Over({ state, myId }: { state: TanksState; myId: string }) {
  const [a, b] = state.players;
  const winner = a.score === b.score ? null : a.score > b.score ? a : b;
  const won = winner?.id === myId;

  useEffect(() => {
    playSfx(winner ? (won ? "win" : "lose") : "draw");
    if (won) confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    // run once when the result appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-6 text-center shadow-[4px_4px_0_0_var(--border)]">
        <div className="text-6xl">{winner ? (won ? "🏆" : "😿") : "🤝"}</div>
        <h2 className="mt-2 font-display text-3xl font-bold">
          {winner ? (won ? "You win!" : `${winner.name} wins`) : "It's a draw!"}
        </h2>
        <div className="my-4 flex flex-col gap-2">
          {state.players.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-2xl border-2 border-border px-4 py-2">
              <span className="font-display font-bold" style={{ color: p.color }}>
                {p.id === myId ? `${p.name} (you)` : p.name}
              </span>
              <span className="font-display text-xl">{p.score}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => socket.emit("tanks:again")}>Rematch</Button>
          <Button variant="outline" onClick={() => socket.emit("room:back")}>Back to lobby</Button>
        </div>
      </Card>
    </div>
  );
}
