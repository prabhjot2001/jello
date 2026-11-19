import { Howl } from "howler";
import { useThemeStore } from "./store";

/* ------------------------------------------------------------------
   EDIT THIS: put files in client/public/sfx/ and list the file names.
   Each category picks one file at random (never the same one twice in a row).
   An empty list [] simply stays silent.
------------------------------------------------------------------- */
export const SFX = {
  // general
  click: ["click-1.mp3"],
  pop: ["pop.mp3"],
  meow: ["meow.mp3"],
  roundStart: ["whoosh.mp3"],
  reveal: ["reveal.mp3"],
  correct: ["correct-1.mp3", "correct-2.mp3"],
  wrong: ["wrong-1.mp3"],
  oppScore: ["aww.mp3"],
  timeout: ["timeout.mp3"],
  tick: ["tick.mp3"],
  win: ["win-1.mp3", "win-2.mp3", "win-3.mp3"],
  lose: ["lose-1.mp3", "lose-2.mp3", "lose-3.mp3"],
  draw: ["draw.mp3"],
  meme: ["meme-1.mp3", "meme-2.mp3"],

  // Kart Dash
  jump: ["jump-1.mp3", "jump-2.mp3", "jump-3.mp3", "jump-4.mp3"],
  duck: ["duck-1.mp3", "duck-2.mp3", "duck-3.mp3", "duck-4.mp3"],
  hit: ["hit-1.mp3", "bkl.mp3"],
  finish: ["finish-1.mp3", "finish-2.mp3", "finish-3.mp3"],
  coin: ["coin-1.mp3", "coin-2.mp3"],
  boost: ["boost-1.mp3", "boost-2.mp3"],
  itemPick: ["item-1.mp3", "item-2.mp3"],
  shield: ["shield-1.mp3", "shield-2.mp3"],
  throwItem: ["throw-1.mp3", "throw-2.mp3"],
  trapped: ["trapped-1.mp3", "trapped-2.mp3"],

    // Toot Raft
  fart:       ["fart-1.mp3", "fart-2.mp3", "fart-3.mp3", "fart-4.mp3"],
  splat:      ["splat-1.mp3", "splat-2.mp3"],
  checkpoint: ["checkpoint-1.mp3"],
  // Cat Tanks
  tFire:    ["tank-fire-1.mp3", "tank-fire-2.mp3"],
  tBoom:    ["boom-1.mp3", "boom-2.mp3", "boom-3.mp3"],
  tBoomBig: ["boom-big-1.mp3", "boom-big-2.mp3"],
  tDirt:    ["dirt-1.mp3"],
  tHit:     ["hit-confirm-1.mp3"],
  tTurn:    ["turn-1.mp3"],
} as const;

export type SfxName = keyof typeof SFX;

/** Optional per-category loudness (0..1). Anything not listed uses 0.7. */
const VOLUME: Partial<Record<SfxName, number>> = {
  jump: 0.55,
  duck: 0.55,
  hit: 0.9,
  finish: 0.9,
  coin: 0.35,
  boost: 0.7,
  tick: 0.5,
  fart: 0.8,
};


/* ---------- sound effects ---------- */

const cache = new Map<string, Howl>();
const lastPlayed = new Map<SfxName, string>();

function load(file: string): Howl {
  let h = cache.get(file);
  if (!h) {
    h = new Howl({
      src: [encodeURI(`/sfx/${file}`)],
      volume: 0.7,
      preload: true,
      onloaderror: () => {},
    });
    cache.set(file, h);
  }
  return h;
}

export function playSfx(name: SfxName, volumeMul = 1) {
  if (!useThemeStore.getState().sfxOn) return;
  const files = SFX[name] as readonly string[];
  if (!files.length) return;
  let pool = files.filter((f) => f !== lastPlayed.get(name));
  if (!pool.length) pool = [...files];
  const file = pool[Math.floor(Math.random() * pool.length)];
  lastPlayed.set(name, file);
  const h = load(file);
  h.volume(Math.min(1, (VOLUME[name] ?? 0.7) * volumeMul));
  h.play();
}

/** Loads sounds in advance so the first jump or crash has no delay. Pass names to load only some. */
export function preloadSfx(names?: readonly SfxName[]) {
  const keys = names ?? (Object.keys(SFX) as SfxName[]);
  keys.forEach((k) => (SFX[k] as readonly string[]).forEach(load));
}

let lastMeme = 0;
/** Plays a random meme sound with the given chance, at most once per cooldown. */
export function maybeMeme(chance: number, cooldownMs = 8000): boolean {
  const now = Date.now();
  if (now - lastMeme < cooldownMs || Math.random() > chance) return false;
  lastMeme = now;
  setTimeout(() => playSfx("meme"), 350);
  return true;
}

/* ---------- music: only game music, the app itself has no background music ---------- */

/**
 * EDIT THIS: put files in client/public/music/game/.
 * "toot:sewer" is used for that map. If its list is empty the game-wide key ("toot") is used.
 */
export const GAME_MUSIC: Record<string, readonly string[]> = {
  kart: ["kart-1.mp3", "kart-2.mp3"],
  "movie:versus": [],
  "movie:coop": [],
  movie: [],
  "toot:garage": [],
  "toot:sewer": ["sewer-1.mp3"],
  "toot:mansion": ["mansion-1.mp3"],
  "toot:jungle": ["jungle-1.mp3"],
  "toot:street": ["street-1.mp3"],
  "toot:factory": ["factory-1.mp3"],
  "toot:classic": ["classic-1.mp3"],
  toot: [],
  "tanks:garage": [],
  "tanks:hills": [],
  "tanks:canyon": [],
  "tanks:dunes": [],
  "tanks:peaks": [],
  "tanks:volcano": [],
  "tanks:moon": [],
  "tanks:islands": [],
  "tanks:plains": [],
  "tanks:candy": [],
  tanks: [],
};

let gameBgm: Howl | null = null;
let gameKey: string | null = null;
let lastGameFile = "";

function filesFor(key: string | null): readonly string[] {
  if (!key) return [];
  const own = GAME_MUSIC[key];
  if (own && own.length) return own;
  return GAME_MUSIC[key.split(":")[0]] ?? [];
}

function makeBgm(src: string, volume: number, onend: () => void, onfail: () => void): Howl {
  const h: Howl = new Howl({
    src: [encodeURI(src)],
    loop: false,
    volume,
    html5: true,
    onend,
    // browsers block audio until the first tap or click: retry as soon as it unlocks
    onplayerror: () => h.once("unlock", () => h.play()),
    onloaderror: () => onfail(),
  });
  return h;
}

function stopGame() {
  gameBgm?.unload();
  gameBgm = null;
}

function playNextGameTrack() {
  const files = filesFor(gameKey);
  if (!files.length) return;
  let pool = files.filter((f) => f !== lastGameFile);
  if (!pool.length) pool = [...files];
  const file = pool[Math.floor(Math.random() * pool.length)];
  lastGameFile = file;
  gameBgm?.unload();
  gameBgm = makeBgm(`/music/game/${file}`, useThemeStore.getState().volume, playNextGameTrack, () => {
    gameKey = null; // file missing: stay quiet
    syncMusic();
  });
  gameBgm.play();
}

/** Decides what should be playing right now. Safe to call any time. 🔇 means silence. */
export function syncMusic() {
  const { musicOn, volume } = useThemeStore.getState();
  if (!musicOn || !gameKey || filesFor(gameKey).length === 0) {
    stopGame();
    return;
  }
  if (!gameBgm) playNextGameTrack();
  else gameBgm.volume(volume);
}

export function setMusicVolume(v: number) {
  gameBgm?.volume(v);
}

/** Start the music for a game or a map. Calling it again with the same key does nothing. */
export function startGameMusic(key: string) {
  if (gameKey === key) {
    syncMusic();
    return;
  }
  gameKey = key;
  lastGameFile = "";
  stopGame();
  syncMusic();
}

export function stopGameMusic() {
  gameKey = null;
  syncMusic();
}
