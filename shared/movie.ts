export type MovieMode = "versus" | "coop";
export type PuzzleType =
  | "emoji"
  | "clues"
  | "scramble"
  | "line"
  | "frame"
  | "song";
export type RevealStyle = "blur" | "zoom" | "both";

export interface MovieSettings {
  rounds: number;
  roundSeconds: number;
  coopSeconds: number;
  coopTarget: number;
  types: PuzzleType[];
  hints: boolean;
  reveal: RevealStyle;
}

export interface PublicPuzzle {
  type: PuzzleType;
  emojis?: string;
  clues?: string[];
  tiles?: string[];
  wordLengths?: number[];
  line?: string;
  image?: string;
  focusX?: number;
  focusY?: number;
  reveal?: RevealStyle;
  audio?: string;
  hint?: string;
}

export interface Scoring {
  max: number;
  min: number;
  stageValues?: number[];
  stage?: number;
}

export interface ScoreRow {
  id: string;
  name: string;
  score: number;
}

export interface MovieState {
  mode: MovieMode;
  phase: "countdown" | "round" | "reveal" | "final";
  round: number;
  totalRounds: number;
  suddenDeath: boolean;
  puzzle: PublicPuzzle | null;
  scoring: Scoring | null;
  startedAt: number;
  endsAt: number;
  scores: ScoreRow[];
  reveal: { title: string; winnerId: string | null; points: number } | null;
  coop: {
    solved: number;
    target: number;
    skipped: number;
    lastAnswer: string | null;
  } | null;
  final: {
    winnerId: string | null;
    tier: string | null;
    solved: number | null;
  } | null;
}

export type MovieEvent =
  | {
      kind: "correct";
      playerId: string;
      name: string;
      points: number;
      partial: boolean;
    }
  | { kind: "wrong"; playerId: string; name: string; text?: string }
  | { kind: "timeout" }
  | { kind: "skip"; name: string }
  | { kind: "final"; winnerId: string | null };
