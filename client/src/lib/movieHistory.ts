const KEY = "movie-seen";

export function loadSeen(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function rememberMovie(id: string) {
  const list = loadSeen().filter((x) => x !== id);
  list.push(id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-300)));
  } catch {
    // storage is optional
  }
}
