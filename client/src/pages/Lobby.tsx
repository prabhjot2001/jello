import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { playSfx } from "@/theme/sound";
import { socket } from "@/socket";
import { useRoom } from "@/store/useRoom";
import { usePlayerStore } from "@/store/player";
import { GAMES } from "@/games/registry";
import MovieGame from "@/games/movie/MovieGame";
import { MovieSettingsPanel } from "@/games/movie/MovieSettingsPanel";
import KartRace from "@/games/kart/KartRace";

const stickerCard =
  "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";

export default function Lobby() {
  const { code = "" } = useParams();
  const { name, setName } = usePlayerStore();
  const [draft, setDraft] = useState("");

  // direct link se aaye aur naam nahi hai toh pehle naam pooch
  if (name.trim().length < 2) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
        <Card className={stickerCard}>
          <h1 className="font-display text-2xl font-bold">
            Room {code.toUpperCase()} 🐾
          </h1>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Enter your name
          </p>
          <Input
            value={draft}
            maxLength={16}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            className="mt-3 w-full"
            onClick={() => draft.trim().length >= 2 && setName(draft.trim())}
          >
            Continue
          </Button>
        </Card>
      </div>
    );
  }
  return <LobbyInner code={code.toUpperCase()} />;
}

function LobbyInner({ code }: { code: string }) {
  const navigate = useNavigate();
  const { room, myId, error } = useRoom(code);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-3xl font-bold">Oops 🙀</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/")}>← Home</Button>
      </div>
    );
  }
  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center font-display text-xl">
        Connecting… 🐱
      </div>
    );
  }

  const me = room.players.find((p) => p.id === myId);
  const other = room.players.find((p) => p.id !== myId);
  const game = GAMES.find((g) => g.id === room.gameId);
  const canStart =
    room.players.length === 2 &&
    room.players.every((p) => p.ready) &&
    !!room.gameId;

  // game start ho gaya (abhi placeholder)
  if (room.phase === "playing") {
    if (room.gameId === "movie-guess")
      return <MovieGame room={room} myId={myId} />;
    if (room.gameId === "kart-race") return <KartRace myId={myId} />;
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-6xl">{game?.emoji}</div>
        <h1 className="font-display text-3xl font-bold">{game?.title}</h1>
        <p className="text-muted-foreground">
          This game isn't available yet. Room sync is working perfectly! 🎉
        </p>
        <Button onClick={() => socket.emit("room:back")}>
          ← Back to Lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/games")}>
          ← Games
        </Button>
      </header>

      {/* room code */}
      <section className="text-center">
        <p className="text-sm text-muted-foreground">Room code</p>
        <button
          className="font-display text-6xl font-bold tracking-widest"
          onClick={() => {
            navigator.clipboard?.writeText(code);
            playSfx("pop");
          }}
          title="Copy"
        >
          {code}
        </button>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap to copy and share it with your friends
        </p>
      </section>

      {/* players */}
      <section className="grid gap-4 sm:grid-cols-2">
        <PlayerCard name={me?.name ?? ""} ready={!!me?.ready} label="You" />
        {other ? (
          <PlayerCard name={other.name} ready={other.ready} label="Partner" />
        ) : (
          <Card
            className={`${stickerCard} flex items-center justify-center border-dashed text-muted-foreground`}
          >
            Waiting for your friends … 🐾
          </Card>
        )}
      </section>

      {/* game select */}
      {/* chosen game */}
      {room.gameId === "movie-guess" && (
        <section className="grid gap-3 sm:grid-cols-2">
          {(
            [
              [
                "versus",
                "⚔️ Versus",
                "Race each other. The fastest correct guess wins the round.",
              ],
              [
                "coop",
                "🤝 Couple Challenge",
                "Solve 10 movies together in 90 seconds.",
              ],
            ] as const
          ).map(([id, title, text]) => (
            <button
              key={id}
              onClick={() => {
                socket.emit("room:set-mode", id);
                playSfx("click");
              }}
              className={`${stickerCard} text-left transition hover:-translate-y-1 ${
                room.mode === id ? "bg-primary" : ""
              }`}
            >
              <div className="font-display font-bold">{title}</div>
              <div className="text-xs text-muted-foreground">{text}</div>
            </button>
          ))}
          {/* todo */}
          {room.gameId === "movie-guess" && <MovieSettingsPanel room={room} />}
        </section>
      )}
      <section className={`${stickerCard} flex items-center gap-4`}>
        <span className="text-4xl">{game?.emoji}</span>
        <div>
          <p className="text-xs text-muted-foreground">Game</p>
          <p className="font-display text-xl font-bold">
            {game?.title ?? "..."}
          </p>
        </div>
      </section>

      {/* actions */}
      <section className="flex flex-wrap items-center justify-center gap-3 pb-6">
        <Button
          size="lg"
          variant={me?.ready ? "secondary" : "default"}
          disabled={!room.gameId}
          onClick={() => {
            socket.emit("room:ready", !me?.ready);
            playSfx("click");
          }}
        >
          {me?.ready ? "Ready ✅ (cancel)" : "I'm Ready!"}
        </Button>
        <Button
          size="lg"
          disabled={!canStart}
          onClick={() => {
            socket.emit("room:start");
            playSfx("win");
          }}
        >
          Start Game 🚀
        </Button>
      </section>
    </div>
  );
}

function PlayerCard({
  name,
  ready,
  label,
}: {
  name: string;
  ready: boolean;
  label: string;
}) {
  return (
    <Card className={stickerCard}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-xl font-bold">{name}</p>
        </div>
        <Badge variant={ready ? "default" : "outline"}>
          {ready ? "Ready ✅" : "Not ready"}
        </Badge>
      </div>
    </Card>
  );
}
