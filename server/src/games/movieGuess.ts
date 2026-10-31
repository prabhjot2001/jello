import type { Server } from "socket.io";
import type {
  ClientToServer,
  ServerToClient,
  RoomState,
  Player,
} from "../../../shared/events.js";
import type {
  MovieEvent,
  MovieMode,
  MovieSettings,
  MovieState,
  PublicPuzzle,
  PuzzleType,
  Scoring,
} from "../../../shared/movie.js";
// import { MOVIES, type Movie } from "../data/movies.js";
import { canHaveFrame, pickFrame } from "../lib/tmdb.js";
import { ALL_MOVIES, type Movie } from "../data/movies.js";

type IO = Server<ClientToServer, ServerToClient>;

const MAX_TIEBREAKS = 3;
const COUNTDOWN_MS = 3000;
const REVEAL_MS = 4000;
const GUESS_COOLDOWN_MS = 300;
const MAX_POINTS = 100;
const MIN_POINTS = 40;
const CLUE_POINTS = [100, 70, 40];
const LINE_ANSWER_FACTOR = 0.6;
const COOP_TYPES: PuzzleType[] = ["emoji", "scramble", "line"];

/** Round length = roundSeconds * factor (20s base gives 20/24/25/25/30/30). */
const TYPE_FACTOR: Record<PuzzleType, number> = {
  emoji: 1,
  clues: 1.2,
  scramble: 1.25,
  line: 1.25,
  frame: 1.5,
  song: 1.5,
};

const TIERS: [number, string][] = [
  [1, "Bollywood Legend 👑"],
  [0.8, "Movie Buff Cat 🎬"],
  [0.6, "Popcorn Pro 🍿"],
  [0.4, "Curious Kitten 🐱"],
  [0, "Sleepy Kitten 😴"],
];

/* ---------- helpers ---------- */

const seenByRoom = new Map<string, Set<string>>();
const seenFor = (code: string) => {
  let s = seenByRoom.get(code);
  if (!s) {
    s = new Set();
    seenByRoom.set(code, s);
  }
  return s;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/^(the|a|an)\s+/, "")
    .replace(/[^a-z0-9]/g, "");

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

function isMatch(guess: string, targets: string[]): boolean {
  const g = norm(guess);
  if (g.length < 2) return false;
  return targets.some((raw) => {
    const t = norm(raw);
    if (g === t) return true;
    const tolerance = t.length >= 12 ? 2 : t.length >= 6 ? 1 : 0;
    return tolerance > 0 && distance(g, t) <= tolerance;
  });
}

const titleTargets = (m: Movie) => [m.title, ...(m.aliases ?? [])];

function makeHint(title: string): string {
  return title
    .split(/\s+/)
    .map((w) =>
      w
        .split("")
        .map((c, i) => (i > 0 && /[A-Za-z0-9]/.test(c) ? "_" : c))
        .join(""),
    )
    .join("  ");
}

/* ---------- puzzle planning ---------- */

interface Prepared {
  movie: Movie;
  type: PuzzleType;
  tiles?: string[];
  wordLengths?: number[];
  image?: string;
  focusX?: number;
  focusY?: number;
}

const cleanLetters = (title: string) =>
  title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .split("");

function availableTypes(m: Movie, allowed: PuzzleType[]): PuzzleType[] {
  return allowed.filter((t) => {
    if (t === "line") return !!m.line;
    if (t === "frame") return canHaveFrame(m);
    if (t === "song") return !!m.audio;
    if (t === "scramble") return cleanLetters(m.title).length >= 5;
    return true;
  });
}

function scrambleOf(letters: string[]): string[] {
  if (new Set(letters).size < 2) return letters;
  let s = shuffle(letters);
  for (let k = 0; k < 10 && s.join("") === letters.join(""); k++)
    s = shuffle(letters);
  return s;
}

function buildItem(
  movie: Movie,
  type: PuzzleType,
  index: number,
  decoysFromIndex: number,
): Prepared {
  const item: Prepared = { movie, type };

  if (type === "scramble") {
    const letters = cleanLetters(movie.title);
    item.wordLengths = movie.title
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-z0-9]/g, "").length)
      .filter((n) => n > 0);
    let tiles = scrambleOf(letters);
    if (index >= decoysFromIndex) {
      const spare = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        .split("")
        .filter((c) => !letters.includes(c));
      tiles = shuffle([...tiles, ...shuffle(spare).slice(0, 2)]);
    }
    item.tiles = tiles;
  }

  if (type === "frame") {
    item.focusX = 0.5;
    item.focusY = 0.5;
  }
  return item;
}

function planPuzzles(
  count: number,
  wanted: PuzzleType[],
  decoysFromIndex: number,
  seen: Set<string>,
  markCount = count
): Prepared[] {
  let allowed = wanted;
  let eligible = ALL_MOVIES.filter((m) => availableTypes(m, allowed).length > 0);
  if (!eligible.length) {
    allowed = ["emoji"];
    eligible = [...ALL_MOVIES];
  }

  // prefer movies this room has not played yet; start a new cycle when they run out
  const fresh = eligible.filter((m) => !seen.has(m.id));
  let pool: Movie[];
  if (fresh.length >= count) {
    pool = shuffle(fresh);
  } else {
    pool = [...shuffle(fresh), ...shuffle(eligible.filter((m) => seen.has(m.id)))];
    seen.clear();
  }

  const used: Partial<Record<PuzzleType, number>> = {};
  const plan: Prepared[] = [];
  for (let i = 0; i < count; i++) {
    const movie = pool[i % pool.length];
    const types = availableTypes(movie, allowed);
    const least = Math.min(...types.map((t) => used[t] ?? 0));
    const candidates = types.filter((t) => (used[t] ?? 0) === least);
    const type = candidates[Math.floor(Math.random() * candidates.length)];
    used[type] = (used[type] ?? 0) + 1;
    plan.push(buildItem(movie, type, i, decoysFromIndex));
  }
  plan.slice(0, markCount).forEach((p) => seen.add(p.movie.id));
  return plan;
}

/** Fetches images only for this game's frame rounds. A round with no usable image falls back to another type. */
async function resolveFrames(
  plan: Prepared[],
  wanted: PuzzleType[],
  decoysFromIndex: number,
) {
  const fallbackTypes = wanted.filter((t) => t !== "frame");
  const frameRounds = plan
    .map((p, i) => (p.type === "frame" ? i : -1))
    .filter((i) => i >= 0);

  // max 4 requests at a time, to stay friendly to the API
  for (let b = 0; b < frameRounds.length; b += 4) {
    await Promise.all(
      frameRounds.slice(b, b + 4).map(async (i) => {
        const item = plan[i];
        const url = await pickFrame(item.movie);
        if (url) {
          item.image = url;
          return;
        }
        const options = availableTypes(item.movie, fallbackTypes);
        const type = options.length
          ? options[Math.floor(Math.random() * options.length)]
          : "emoji";
        plan[i] = buildItem(item.movie, type, i, decoysFromIndex);
      }),
    );
  }
}

/* ---------- the game ---------- */

export class MovieGame {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private plan: Prepared[] = [];
  private idx = 0;
  private totalRounds = 0;
  private tiebreaks = 0;
  private phase: MovieState["phase"] = "countdown";
  private startedAt = 0;
  private endsAt = 0;
  private stage = 0;
  private hint: string | undefined;
  private reveal: MovieState["reveal"] = null;
  private final: MovieState["final"] = null;
  private scores = new Map<string, number>();
  private solved = 0;
  private skipped = 0;
  private lastAnswer: string | null = null;
  private lastGuessAt = new Map<string, number>();
  private readonly mode: MovieMode;
  private readonly settings: MovieSettings;

  constructor(
    private io: IO,
    private room: RoomState,
  ) {
    this.mode = room.mode;
    this.settings = { ...room.settings, types: [...room.settings.types] };
    this.totalRounds = this.settings.rounds;
  }

  /* ----- lifecycle ----- */

  ready = false;
  private destroyed = false;

  async start() {
    this.room.players.forEach((p) => this.scores.set(p.id, 0));
    const s = this.settings;
    let wanted: PuzzleType[] = s.types;
    let decoysFrom = Math.ceil(s.rounds / 2);
    const seen = seenFor(this.room.code);
    if (this.mode === "versus") {
      this.plan = planPuzzles(s.rounds + MAX_TIEBREAKS, wanted, decoysFrom, seen, s.rounds);
    } else {
      const types = s.types.filter((t) => COOP_TYPES.includes(t));
      wanted = types.length ? types : ["emoji"];
      decoysFrom = 999;
      this.plan = planPuzzles(s.coopTarget + 5, wanted, decoysFrom, seen, s.coopTarget);
    }

    await resolveFrames(this.plan, wanted, decoysFrom);
    if (this.destroyed) return;

    this.ready = true;
    this.phase = "countdown";
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + COUNTDOWN_MS;
    this.emitState();
    this.later(COUNTDOWN_MS, () =>
      this.mode === "versus" ? this.beginRound() : this.beginCoop(),
    );
  }

  destroy() {
    this.destroyed = true;
    this.clearTimers();
  }

  publicState(): MovieState {
    const showPuzzle = this.phase === "round" || this.phase === "reveal";
    return {
      mode: this.mode,
      phase: this.phase,
      round:
        this.mode === "versus"
          ? Math.min(this.idx + 1, this.totalRounds)
          : this.solved,
      totalRounds:
        this.mode === "versus" ? this.totalRounds : this.settings.coopTarget,
      suddenDeath:
        this.mode === "versus" && this.tiebreaks > 0 && this.phase !== "final",
      puzzle: showPuzzle ? this.publicPuzzle() : null,
      scoring: this.scoring(),
      startedAt: this.startedAt,
      endsAt: this.endsAt,
      scores: this.room.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: this.scores.get(p.id) ?? 0,
      })),
      reveal: this.reveal,
      coop:
        this.mode === "coop"
          ? {
              solved: this.solved,
              target: this.settings.coopTarget,
              skipped: this.skipped,
              lastAnswer: this.lastAnswer,
            }
          : null,
      final: this.final,
    };
  }

  /* ----- player actions ----- */

  guess(playerId: string, raw: string) {
    if (this.phase !== "round") return;
    const player = this.room.players.find((p) => p.id === playerId);
    const item = this.plan[this.idx];
    if (!player || !item) return;

    const text = String(raw ?? "")
      .trim()
      .slice(0, 80);
    if (!text) return;

    const now = Date.now();
    if (now - (this.lastGuessAt.get(playerId) ?? 0) < GUESS_COOLDOWN_MS) return;
    this.lastGuessAt.set(playerId, now);

    const titleHit = isMatch(text, titleTargets(item.movie));
    const lineHit =
      !titleHit &&
      item.type === "line" &&
      !!item.movie.line &&
      isMatch(text, item.movie.line.answers);

    if (!titleHit && !lineHit) {
      this.emit({
        kind: "wrong",
        playerId,
        name: player.name,
        text: this.mode === "coop" ? text : undefined,
      });
      return;
    }

    if (this.mode === "coop") return this.coopCorrect(player);

    const base = this.pointsNow();
    this.endRound(
      playerId,
      lineHit ? Math.round(base * LINE_ANSWER_FACTOR) : base,
      lineHit,
    );
  }

  skip(playerId: string) {
    if (this.mode !== "coop" || this.phase !== "round") return;
    const player = this.room.players.find((p) => p.id === playerId);
    const item = this.plan[this.idx];
    if (!player || !item) return;
    this.skipped++;
    this.lastAnswer = item.movie.title;
    this.idx++;
    this.emit({ kind: "skip", name: player.name });
    if (this.idx >= this.plan.length) return this.finishCoop();
    this.emitState();
  }

  /* ----- versus flow ----- */

  private beginRound() {
    this.clearTimers();
    const item = this.plan[this.idx];
    const dur = Math.round(
      this.settings.roundSeconds * 1000 * TYPE_FACTOR[item.type],
    );
    this.phase = "round";
    this.stage = 0;
    this.hint = undefined;
    this.reveal = null;
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + dur;

    if (item.type === "clues") {
      this.later(dur / 3, () => this.setStage(1));
      this.later((dur * 2) / 3, () => this.setStage(2));
    } else if (this.settings.hints) {
      this.later(dur * 0.5, () => {
        this.hint = makeHint(item.movie.title);
        this.emitState();
      });
    }
    this.later(dur, () => this.endRound(null, 0, false));
    this.emitState();
  }

  private setStage(stage: number) {
    this.stage = stage;
    this.emitState();
  }

  private endRound(winnerId: string | null, points: number, partial: boolean) {
    if (this.phase !== "round") return;
    this.clearTimers();
    const item = this.plan[this.idx];
    if (winnerId)
      this.scores.set(winnerId, (this.scores.get(winnerId) ?? 0) + points);

    this.phase = "reveal";
    this.reveal = { title: item.movie.title, winnerId, points };
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + REVEAL_MS;
    this.emitState();

    if (winnerId) {
      const name = this.room.players.find((p) => p.id === winnerId)?.name ?? "";
      this.emit({ kind: "correct", playerId: winnerId, name, points, partial });
    } else {
      this.emit({ kind: "timeout" });
    }
    this.later(REVEAL_MS, () => this.afterReveal());
  }

  private afterReveal() {
    this.idx++;
    if (this.idx < this.totalRounds) return this.beginRound();

    const [a, b] = this.room.players.map((p) => this.scores.get(p.id) ?? 0);
    if (a === b && this.tiebreaks < MAX_TIEBREAKS) {
      this.tiebreaks++;
      this.totalRounds++;
      return this.beginRound();
    }
    this.finishVersus();
  }

  private finishVersus() {
    this.clearTimers();
    const ranked = this.room.players
      .map((p) => ({ id: p.id, score: this.scores.get(p.id) ?? 0 }))
      .sort((x, y) => y.score - x.score);
    const winnerId =
      ranked.length > 1 && ranked[0].score === ranked[1].score
        ? null
        : (ranked[0]?.id ?? null);
    this.phase = "final";
    this.final = { winnerId, tier: null, solved: null };
    this.emitState();
    this.emit({ kind: "final", winnerId });
  }

  /* ----- co-op flow ----- */

  private beginCoop() {
    this.clearTimers();
    this.phase = "round";
    this.idx = 0;
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + this.settings.coopSeconds * 1000;
    this.later(this.settings.coopSeconds * 1000, () => this.finishCoop());
    this.emitState();
  }

  private coopCorrect(player: Player) {
    const item = this.plan[this.idx];
    this.solved++;
    this.lastAnswer = item.movie.title;
    this.scores.set(player.id, (this.scores.get(player.id) ?? 0) + 1);
    this.idx++;
    this.emit({
      kind: "correct",
      playerId: player.id,
      name: player.name,
      points: 1,
      partial: false,
    });
    if (this.solved >= this.settings.coopTarget || this.idx >= this.plan.length)
      return this.finishCoop();
    this.emitState();
  }

  private finishCoop() {
    if (this.phase === "final") return;
    this.clearTimers();
    const ratio = this.solved / this.settings.coopTarget;
    const tier = TIERS.find(([min]) => ratio >= min)![1];
    this.phase = "final";
    this.final = { winnerId: null, tier, solved: this.solved };
    this.emitState();
    this.emit({ kind: "final", winnerId: null });
  }

  /* ----- internals ----- */

  private scoring(): Scoring | null {
    if (this.mode !== "versus" || this.phase !== "round") return null;
    const item = this.plan[this.idx];
    if (item.type === "clues") {
      return { max: 100, min: 40, stageValues: CLUE_POINTS, stage: this.stage };
    }
    return { max: MAX_POINTS, min: MIN_POINTS };
  }

  private pointsNow(): number {
    const s = this.scoring();
    if (!s) return 0;
    if (s.stageValues) return s.stageValues[this.stage];
    const t = clamp01(
      (Date.now() - this.startedAt) / (this.endsAt - this.startedAt),
    );
    return Math.round(s.max - (s.max - s.min) * t);
  }

  private publicPuzzle(): PublicPuzzle | null {
    const item = this.plan[this.idx];
    if (!item) return null;
    const m = item.movie;
    const base: PublicPuzzle = { type: item.type, hint: this.hint };
    switch (item.type) {
      case "emoji":
        return { ...base, emojis: m.emojis };
      case "clues":
        return {
          ...base,
          clues: m.clues.slice(0, this.phase === "reveal" ? 3 : this.stage + 1),
        };
      case "scramble":
        return { ...base, tiles: item.tiles, wordLengths: item.wordLengths };
      case "line":
        return { ...base, line: m.line!.text };
      case "frame":
        return {
          ...base,
          image: item.image,
          focusX: item.focusX,
          focusY: item.focusY,
          reveal: this.settings.reveal,
        };
      case "song":
        return { ...base, audio: `/clips/${m.audio}` };
    }
  }

  private emitState() {
    this.io.to(this.room.code).emit("movie:state", this.publicState());
  }

  private emit(event: MovieEvent) {
    this.io.to(this.room.code).emit("movie:event", event);
  }

  private later(ms: number, fn: () => void) {
    this.timers.push(setTimeout(fn, ms));
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}

/* ---------- registry of running games ---------- */

const games = new Map<string, MovieGame>();

export function startMovieGame(io: IO, room: RoomState) {
  games.get(room.code)?.destroy();
  const game = new MovieGame(io, room);
  games.set(room.code, game);
  game.start().catch((e) => console.error("[movie] start failed", e));
}

export const getMovieGame = (code: string) => games.get(code);

export function stopMovieGame(code: string) {
  games.get(code)?.destroy();
  games.delete(code);
}
