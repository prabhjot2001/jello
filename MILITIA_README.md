# Cat Militia — overwrite zip

Extract over your project root (files keep their paths), then `npm run dev`.

New: `client/src/games/militia/*`, `server/src/games/militia.ts`, `shared/militia.ts`
Edited (complete files): `shared/events.ts`, `server/src/index.ts`, `server/src/games/limits.ts`,
`client/src/types.ts`, `client/src/games/registry.ts`, `client/src/pages/Lobby.tsx`, `client/src/theme/sounds.ts`

Controls
- Phone (landscape): left stick runs, push up = jetpack; right stick aims, push to the edge = shoot; buttons 💣 grenade, 🔁 swap, ⟳ reload.
- Laptop: A/D run, W/Space/↑ jetpack, mouse aim, left click shoot, right click or G grenade, Q swap, R reload.

Optional sound files in `client/public/sfx/`:
mil-pistol-1, mil-smg-1, mil-shotgun-1, mil-sniper-1, mil-rocket-1, mil-boom-1, mil-boom-2, mil-reload-1, mil-pick-1, mil-empty-1 (.mp3)
Music: add files under `GAME_MUSIC.militia` in `sounds.ts`.
