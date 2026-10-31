import type { MovieSettings, PuzzleType } from "../../../shared/movie.js";

export const ALL_TYPES: PuzzleType[] = ["emoji", "clues", "scramble", "line", "frame", "song"];

export const DEFAULT_SETTINGS: MovieSettings = {
  rounds: 8,
  roundSeconds: 20,
  coopSeconds: 90,
  coopTarget: 10,
  types: [...ALL_TYPES],
  hints: true,
  reveal: "blur",
};

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

export function applySettings(current: MovieSettings, patch: Partial<MovieSettings>): MovieSettings {
  const next: MovieSettings = { ...current, types: [...current.types] };
  if (patch.rounds !== undefined) next.rounds = clamp(patch.rounds, 3, 20, current.rounds);
  if (patch.roundSeconds !== undefined) next.roundSeconds = clamp(patch.roundSeconds, 8, 300, current.roundSeconds);
  if (patch.coopSeconds !== undefined) next.coopSeconds = clamp(patch.coopSeconds, 30, 300, current.coopSeconds);
  if (patch.coopTarget !== undefined) next.coopTarget = clamp(patch.coopTarget, 3, 15, current.coopTarget);
  if (patch.hints !== undefined) next.hints = !!patch.hints;
  if (patch.reveal && ["blur", "zoom", "both"].includes(patch.reveal)) next.reveal = patch.reveal;
  if (Array.isArray(patch.types)) {
    const types = ALL_TYPES.filter((t) => patch.types!.includes(t));
    if (types.length) next.types = types;
  }
  return next;
}