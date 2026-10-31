import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";
import { playSfx } from "@/theme/sound";
import { serverNow, syncClock, useServerTime } from "@/lib/clock";
import type { MovieState, RoomState } from "@/types";
import { useMovieGame, type FeedItem } from "./useMovieGame";
import { Result } from "./Result";

const card =
  "rounded-3xl border-2 border-border bg-card p-5 shadow-[4px_4px_0_0_var(--border)]";
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function pointsNow(state: MovieState, now: number): number {
  const s = state.scoring;
  if (!s) return 0;
  if (s.stageValues) return s.stageValues[s.stage ?? 0];
  const t = clamp01((now - state.startedAt) / (state.endsAt - state.startedAt));
  return Math.round(s.max - (s.max - s.min) * t);
}



export default function MovieGame({ myId }: { room: RoomState; myId: string }) {
  const { state, feed, shake } = useMovieGame(myId);
  const now = useServerTime();
  const lastTick = useRef(-1);

  useEffect(() => {
    syncClock();
    const id = setInterval(() => syncClock(3), 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    lastTick.current = -1;
  }, [state?.phase, state?.round]);

  useEffect(() => {
    if (!state || state.phase !== "round") return;
    const left = Math.ceil((state.endsAt - serverNow()) / 1000);
    const threshold = state.mode === "coop" ? 10 : 5;
    if (left > 0 && left <= threshold && left !== lastTick.current) {
      lastTick.current = left;
      playSfx("tick", 0.6);
    }
  }, [now, state]);

  
  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center font-display text-xl">
        Loading… 🐱
      </div>
    );
  }
  if (state.phase === "final") return <Result state={state} myId={myId} />;

  const coop = state.mode === "coop";

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <Header state={state} myId={myId} />

      {state.phase === "countdown" && <Countdown state={state} now={now} />}

      {state.phase === "round" && <TimerBar state={state} now={now} />}

      {state.puzzle &&
        (state.phase === "round" || state.phase === "reveal") && (
          <Card className={card}>
            <PuzzleView state={state} />
          </Card>
        )}

      {state.phase === "round" && <GuessBox coop={coop} shake={shake} />}
      {state.phase === "reveal" && <Reveal state={state} myId={myId} />}

      {coop && state.phase === "round" && (
        <CoopExtras lastAnswer={state.coop?.lastAnswer ?? null} feed={feed} />
      )}
    </main>
  );
}

/* ---------- header ---------- */

function Header({ state, myId }: { state: MovieState; myId: string }) {
  const coop = state.mode === "coop";
  const label = coop
    ? `Couple Challenge · ${state.coop?.solved ?? 0}/${state.coop?.target} solved`
    : state.suddenDeath
      ? "Sudden death!"
      : `Round ${state.round}/${state.totalRounds}`;

  return (
    <header className="flex flex-col gap-3">
      <div className="text-center font-display text-lg font-bold">{label}</div>
      <div className="flex gap-2">
        {state.scores.map((s) => (
          <div
            key={s.id}
            className={`flex-1 rounded-2xl border-2 border-border px-3 py-2 text-center ${
              s.id === myId ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <div className="truncate text-xs">
              {s.id === myId ? `${s.name} (you)` : s.name}
            </div>
            <div className="font-display text-2xl font-bold">{s.score}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ---------- countdown ---------- */

function Countdown({ state, now }: { state: MovieState; now: number }) {
  const n = Math.max(1, Math.ceil((state.endsAt - now) / 1000));
  const coop = state.mode === "coop";
  return (
    <Card
      className={`${card} flex flex-col items-center gap-2 py-10 text-center`}
    >
      <p className="font-display text-lg">Get ready!</p>
      <motion.div
        key={n}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-8xl font-bold"
      >
        {n}
      </motion.div>
      <p className="max-w-xs text-sm text-muted-foreground">
        {coop
          ? "Solve as many movies as you can together in 90 seconds. Either of you can answer."
          : "The first correct guess wins the round. Faster answers earn more points. Wrong guesses cost nothing."}
      </p>
    </Card>
  );
}

/* ---------- timer ---------- */

function TimerBar({ state, now }: { state: MovieState; now: number }) {
  const total = state.endsAt - state.startedAt;
  const left = Math.max(0, state.endsAt - now);
  const frac = total > 0 ? left / total : 0;
  const urgent = left < (state.mode === "coop" ? 10_000 : 5_000);

  return (
    <div>
      <div className="h-4 overflow-hidden rounded-full border-2 border-border bg-card">
        <div
          className={`h-full transition-[width] duration-100 ease-linear ${
            urgent ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${frac * 100}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="font-semibold">
          {state.scoring ? `Worth ${pointsNow(state, now)} pts` : ""}
        </span>
        <span className="font-display font-bold">
          {Math.ceil(left / 1000)}s
        </span>
      </div>
    </div>
  );
}

/* ---------- puzzle ---------- */

function PuzzleView({ state }: { state: MovieState }) {
  const puzzle = state.puzzle!;
  const hint = puzzle.hint ? (
    <p className="mt-4 text-center font-display text-lg tracking-widest">
      <span className="mr-2 text-sm font-normal text-muted-foreground">
        Hint
      </span>
      {puzzle.hint}
    </p>
  ) : null;

  switch (puzzle.type) {
    case "emoji":
      return (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Which movie is this?
          </p>
          <div className="text-6xl leading-tight">{puzzle.emojis}</div>
          {hint}
        </div>
      );

    case "clues":
      return (
        <div>
          <p className="mb-3 text-center text-sm text-muted-foreground">
            Clues unlock over time. Earlier guesses earn more points.
          </p>
          <ol className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => {
              const clue = puzzle.clues?.[i];
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border-2 border-border px-4 py-3 ${
                    clue
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="mr-2 font-display font-bold">{i + 1}.</span>
                  {clue ?? "🔒 Locked"}
                </motion.li>
              );
            })}
          </ol>
        </div>
      );

    case "scramble": {
      const lengths = puzzle.wordLengths ?? [];
      const total = lengths.reduce((a, b) => a + b, 0);
      const hasDecoys = (puzzle.tiles?.length ?? 0) > total;
      return (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Unscramble the movie title.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {puzzle.tiles?.map((t, i) => (
              <span
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-secondary font-display text-xl font-bold text-secondary-foreground shadow-[2px_2px_0_0_var(--border)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Word lengths: {lengths.join(" + ")}
            {hasDecoys ? " · Watch out, some letters are decoys!" : ""}
          </p>
          {hint}
        </div>
      );
    }

    case "line":
      return (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Finish the famous line. The missing word earns 60% points, the movie
            name earns full points.
          </p>
          <p className="font-display text-3xl font-bold leading-snug">
            {puzzle.line}
          </p>
          {hint}
        </div>
      );

    case "frame":
      return <FrameView image={puzzle.image} hint={hint} />;

    case "song":
      return (
        <div className="text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Name the movie or the song.
          </p>
          <div className="text-5xl">🎵</div>
          <audio
            className="mx-auto mt-3 w-full"
            src={puzzle.audio}
            controls
            autoPlay
          />
          {hint}
        </div>
      );
  }
}

/* ---------- guessing ---------- */

function GuessBox({ coop, shake }: { coop: boolean; shake: number }) {
  const [text, setText] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    socket.emit("movie:guess", t);
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <motion.div
        key={shake}
        className="flex-1"
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : undefined}
        transition={{ duration: 0.3 }}
      >
        <Input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type the movie name…"
          maxLength={80}
          autoComplete="off"
          autoCapitalize="none"
          className="h-12 text-lg"
        />
      </motion.div>
      <Button type="submit" className="h-12 px-6">
        Guess
      </Button>
      {coop && (
        <Button
          type="button"
          variant="outline"
          className="h-12"
          onClick={() => socket.emit("movie:skip")}
        >
          Skip
        </Button>
      )}
    </form>
  );
}

function CoopExtras({
  lastAnswer,
  feed,
}: {
  lastAnswer: string | null;
  feed: FeedItem[];
}) {
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
      {lastAnswer && (
        <p>
          Last answer:{" "}
          <span className="font-semibold text-foreground">{lastAnswer}</span>
        </p>
      )}
      {feed.map((f) => (
        <p key={f.id}>
          {f.mine ? "You" : f.name}: {f.text} ❌
        </p>
      ))}
    </div>
  );
}

/* ---------- reveal ---------- */

function Reveal({ state, myId }: { state: MovieState; myId: string }) {
  const r = state.reveal!;
  const winner = state.scores.find((s) => s.id === r.winnerId);
  return (
    <Card className={`${card} text-center`}>
      <p className="text-sm text-muted-foreground">The answer was</p>
      <h2 className="font-display text-3xl font-bold">{r.title}</h2>
      <p className="mt-2 font-semibold">
        {winner
          ? winner.id === myId
            ? `You got it! +${r.points}`
            : `${winner.name} got it! +${r.points}`
          : "Nobody got it this time 😿"}
      </p>
    </Card>
  );
}

function FrameView({ image, hint }: { image?: string; hint: ReactNode }) {
  return (
    <div className="text-center">
      <p className="mb-3 text-sm text-muted-foreground">Which movie is this scene from?</p>
      <img
        src={image}
        alt=""
        draggable={false}
        className="mx-auto max-h-80 w-full rounded-2xl border-2 border-border bg-muted object-contain"
      />
      {hint}
    </div>
  );
}