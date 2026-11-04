const KEY = "toot-stars";

type Best = Record<string, number>;

function read(): Best {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Best;
  } catch {
    return {};
  }
}

/** Stars for a cleared level: fewer wipeouts means more stars. */
export const starsFor = (deaths: number) => (deaths <= 1 ? 3 : deaths <= 4 ? 2 : 1);

/** Total of the best stars per level, so replaying cannot farm stars. */
export const totalStars = () => Object.values(read()).reduce((a, b) => a + b, 0);

export function recordStars(mapId: string, level: number, stars: number) {
  const best = read();
  const key = `${mapId}:${level}`;
  if ((best[key] ?? 0) >= stars) return;
  best[key] = stars;
  try {
    localStorage.setItem(KEY, JSON.stringify(best));
  } catch {
    // storage is optional
  }
}