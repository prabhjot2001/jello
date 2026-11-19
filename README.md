# Games for Meows (Couple Arcade)

Realtime multiplayer game hub for two (or more) players. Cat/pastel theme, works on laptop and phone.

Games: **Emoji Movies Guess** (versus + co-op, chat, TMDB frames), **Kart Dash**, **Toot Raft** (1-4 players, custom map editor), **Cat Tanks** (Pocket-Tanks style artillery).

## Run locally
```bash
npm install && npm --prefix client install && npm --prefix server install
npm run dev          # server :3001 + client :5173
```
Optional `server/.env`: `TMDB_TOKEN=...` (movie frames), `PORT=3001`.

## Deploy (Render, single free web service)
- Build: `npm --prefix client install --include=dev && npm --prefix client run build && npm --prefix server install --include=dev`
- Start: `npm --prefix server start`
- Env: `TMDB_TOKEN`, Node 22. The server serves `client/dist`.

## Your assets (all optional, missing files stay silent / use fallbacks)
| Folder (`client/public/`) | What |
|---|---|
| `sfx/` | sound effects; file names are listed in `client/src/theme/sounds.ts` (`SFX`) |
| `music/game/` | game music; names listed in `GAME_MUSIC` (`kart`, `movie:versus`, `toot:<map>`, `tanks:<map>` ...) |
| `stickers/vehicles/<id>.png` | poop broom car tuktuk cycle toilet heel guitar undies bra carpet plane ufo (face right) |
| `stickers/hazards/<id>.png` | poop fire spikes pinkspikes thorns roach dog dino spider bat ghost saw chainsaw hammer blade fly (face left) |
| `stickers/tanks/tank1..8.png` | tank bodies, face right, no barrel |
| `stickers/` | background/meme stickers |

Custom Toot maps: saved in the browser, shared with the room via the server, and via share codes (`T1.…`). No database.
