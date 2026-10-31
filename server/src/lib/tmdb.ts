import type { Movie } from "../data/movies.js";

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w780";
const TTL_MS = 6 * 60 * 60 * 1000; // memory only, refetched after 6 hours
const TIMEOUT_MS = 4000;
const MAX_IMAGES = 10;

/** Release years used to find the right TMDB entry. For new movies add `year` (or `tmdbId`) in movies.ts. */
const YEARS: Record<string, number> = {
  "3-idiots": 2009, dangal: 2016, sholay: 1975, ddlj: 1995, lagaan: 2001, k3g: 2001,
  znmd: 2011, "gully-boy": 2019, pk: 2014, dhoom: 2004, kkhh: 1998, "chak-de": 2007,
  "jab-we-met": 2007, queen: 2014, bajrangi: 2015, andhadhun: 2018, tzp: 2007,
  swades: 2004, "munna-bhai": 2003,
};

interface SearchResult {
  results: { id: number; title: string; release_date?: string }[];
}
interface ImageItem {
  file_path: string;
  vote_average: number;
}
interface ImagesResult {
  backdrops?: ImageItem[];
  posters?: ImageItem[];
}

// memory only, never written to disk
const cache = new Map<string, { urls: string[]; fetchedAt: number }>();
const inflight = new Map<string, Promise<string[]>>();
const recentlyUsed = new Map<string, Set<string>>();

const top = (items: ImageItem[] | undefined, n: number) =>
  [...(items ?? [])]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, n)
    .map((i) => IMG + i.file_path);

async function api<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const token = process.env.TMDB_TOKEN;
  if (!token) return null;
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      signal: ctrl.signal,
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchImages(m: Movie): Promise<string[]> {
  let id = m.tmdbId;

  if (!id) {
    const year = m.year ?? YEARS[m.id];
    if (!year) return [];
    const found = await api<SearchResult>("/search/movie", {
      query: m.title.replace(/[!.]/g, ""),
      year: String(year),
      language: "en-US",
    });
    const hit = found?.results.find((r) => r.release_date?.startsWith(String(year)));
    if (!hit) {
      console.log(`[tmdb] no match for ${m.title}`);
      return [];
    }
    console.log(`[tmdb] ${m.title} -> ${hit.title} (${hit.release_date})`);
    id = hit.id;
  }

  // text-free images first, so the title is never printed on the picture
  let images = await api<ImagesResult>(`/movie/${id}/images`, { include_image_language: "null" });
  let urls = [...top(images?.backdrops, 8), ...top(images?.posters, 2)];
  if (!urls.length) {
    images = await api<ImagesResult>(`/movie/${id}/images`);
    urls = top(images?.backdrops, 6);
  }
  return urls.slice(0, MAX_IMAGES);
}

/** True if a frame round could work for this movie (a local image exists or one can be fetched). */
export const canHaveFrame = (m: Movie) =>
  !!m.frame || (!!process.env.TMDB_TOKEN && !!(m.tmdbId ?? m.year ?? YEARS[m.id]));

async function imagesFor(m: Movie): Promise<string[]> {
  const cached = cache.get(m.id);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.urls;

  let pending = inflight.get(m.id);
  if (!pending) {
    pending = fetchImages(m)
      .then((urls) => {
        if (!urls.length) return cached?.urls ?? [];
        cache.set(m.id, { urls, fetchedAt: Date.now() });
        return urls;
      })
      .finally(() => inflight.delete(m.id));
    inflight.set(m.id, pending);
  }
  return pending;
}

/** Returns a frame URL for the movie, preferring images that were not shown recently. */
export async function pickFrame(m: Movie): Promise<string | null> {
  if (m.frame) return `/frames/${m.frame}`;
  const urls = await imagesFor(m);
  if (!urls.length) return null;

  let used = recentlyUsed.get(m.id) ?? new Set<string>();
  let fresh = urls.filter((u) => !used.has(u));
  if (!fresh.length) {
    used = new Set();
    fresh = urls;
  }
  const url = fresh[Math.floor(Math.random() * fresh.length)];
  used.add(url);
  recentlyUsed.set(m.id, used);
  return url;
}