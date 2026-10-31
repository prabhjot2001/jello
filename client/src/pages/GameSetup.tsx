import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { playSfx } from "@/theme/sound";
import { socket } from "@/socket";
import { usePlayerStore } from "@/store/player";
import { GAMES } from "@/games/registry";

const stickerCard =
  "rounded-3xl border-2 border-border bg-card p-6 shadow-[4px_4px_0_0_var(--border)]";

export default function GameSetup() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { name, setName } = usePlayerStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return <Navigate to="/games" replace />;

  const needName = () => {
    if (name.trim().length < 2) {
      setError("Enter your name first 🐾");
      return true;
    }
    setError("");
    return false;
  };

  const createRoom = () => {
    if (needName()) return;
    if (!socket.connected) {
      setError("Not connected with server! Please try again later");
      return;
    }
    socket.emit("room:create", { name: name.trim() }, (r) => {
      socket.emit("room:select-game", game.id);
      playSfx("pop");
      navigate(`/room/${r.code}`);
    });
  };

  const joinRoom = () => {
    if (needName()) return;
    if (code.length !== 4) {
      setError("Room code 4 letters ka hota hai");
      return;
    }
    playSfx("pop");
    navigate(`/room/${code}`);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
     <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate("/games")}>
  ← All games
</Button>

      <section className="text-center">
        <div className="text-6xl">{game.emoji}</div>
        <h1 className="mt-2 font-display text-4xl font-bold">{game.title}</h1>
        <p className="mt-1 text-muted-foreground">{game.tagline}</p>
      </section>

      <Card className={stickerCard}>
        <label className="mb-2 block font-display font-semibold">Your name</label>
        <Input
          value={name}
          maxLength={16}
          placeholder="e.g. Prabhjot"
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}
      </Card>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className={stickerCard}>
          <h2 className="font-display text-xl font-bold">🏠 Create Room</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            You'll get a code to share with your friends
          </p>
          <Button className="w-full" onClick={createRoom}>Create Room</Button>
        </Card>

        <Card className={stickerCard}>
          <h2 className="font-display text-xl font-bold">🔑 Join Room</h2>
          <div className="mt-3 flex gap-2">
            <Input
              value={code}
              maxLength={4}
              placeholder="Enter room code here"
              className="text-center font-display text-lg uppercase tracking-widest"
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <Button variant="secondary" onClick={joinRoom}>Join</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}