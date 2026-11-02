/** How many players each game supports. The room uses this for joining and for the Start button. */
export const GAME_LIMITS: Record<string, { min: number; max: number }> = {
  "movie-guess": { min: 2, max: 2 },
  "kart-race": { min: 2, max: 2 },
  "toot-raft": { min: 1, max: 4 },
};

export const limitsFor = (gameId: string | null) => GAME_LIMITS[gameId ?? ""] ?? { min: 2, max: 2 };