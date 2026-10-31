import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import type {
  ClientToServer,
  ServerToClient,
  RoomState,
} from "../../shared/events.js";
import { createRoom, joinRoom, getRoom, leaveRoom } from "./rooms.js";
import {
  getMovieGame,
  startMovieGame,
  stopMovieGame,
} from "./games/movieGuess.js";
import { applySettings } from "./games/movieSettings.js";
import { getKartGame, startKartGame, stopKartGame } from "./games/kartRace.js";

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true }));

// production: serve the built client from this same server
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/socket.io")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const httpServer = createServer(app);
const io = new Server<ClientToServer, ServerToClient>(httpServer, {
  cors: { origin: "*" },
  transports: ["websocket"],
});

const clean = (s: string) => (s ?? "").trim().slice(0, 16) || "Player";

io.on("connection", (socket) => {
  const broadcast = (room: RoomState) =>
    io.to(room.code).emit("room:state", room);

  const leave = () => {
    const room = leaveRoom(socket.id);
    if (room) {
      stopMovieGame(room.code);
      stopKartGame(room.code);
      socket.leave(room.code);
      broadcast(room);
    }
  };

  socket.on("time:sync", (ack) => ack(Date.now()));

  socket.on("room:create", ({ name }, ack) => {
    const room = createRoom(socket.id, clean(name));
    socket.join(room.code);
    ack({ ok: true, code: room.code });
  });

  socket.on("room:join", ({ code, name }, ack) => {
    const roomCode = (code ?? "").trim().toUpperCase();
    const res = joinRoom(socket.id, roomCode, clean(name));
    if ("error" in res) return ack({ ok: false, error: res.error });
    socket.join(res.room.code);
    broadcast(res.room);
    ack({ ok: true, state: res.room, you: socket.id });
  });

  socket.on("room:leave", leave);
  socket.on("disconnect", leave);

  socket.on("room:ready", (ready) => {
    const room = getRoom(socket.id);
    const me = room?.players.find((p) => p.id === socket.id);
    if (!room || !me) return;
    me.ready = ready;
    broadcast(room);
  });

  socket.on("room:select-game", (gameId) => {
    const room = getRoom(socket.id);
    if (!room || room.phase !== "lobby") return;
    room.gameId = gameId;
    room.players.forEach((p) => (p.ready = false));
    broadcast(room);
  });

  socket.on("room:set-mode", (mode) => {
    const room = getRoom(socket.id);
    if (!room || room.phase !== "lobby") return;
    if (mode !== "versus" && mode !== "coop") return;
    room.mode = mode;
    room.players.forEach((p) => (p.ready = false));
    broadcast(room);
  });

  socket.on("room:set-settings", (patch) => {
    const room = getRoom(socket.id);
    if (!room || room.phase !== "lobby") return;
    room.settings = applySettings(room.settings, patch ?? {});
    room.players.forEach((p) => (p.ready = false));
    broadcast(room);
  });

  socket.on("room:start", () => {
    const room = getRoom(socket.id);
    if (!room || !room.gameId) return;
    if (room.players.length !== 2 || !room.players.every((p) => p.ready))
      return;
    room.phase = "playing";
    broadcast(room);
    if (room.gameId === "movie-guess") startMovieGame(io, room);
    if (room.gameId === "kart-race") startKartGame(io, room);
  });

  socket.on("room:back", () => {
    const room = getRoom(socket.id);
    if (!room) return;
    stopMovieGame(room.code);
    stopKartGame(room.code);
    room.phase = "lobby";
    room.players.forEach((p) => (p.ready = false));
    broadcast(room);
  });

  /* ----- movie guess ----- */

  socket.on("movie:request-state", () => {
    const room = getRoom(socket.id);
    const game = room && getMovieGame(room.code);
    if (game?.ready) socket.emit("movie:state", game.publicState());
    if (game) socket.emit("movie:state", game.publicState());
  });

  socket.on("movie:guess", (text) => {
    const room = getRoom(socket.id);
    if (room) getMovieGame(room.code)?.guess(socket.id, text);
  });

  socket.on("movie:skip", () => {
    const room = getRoom(socket.id);
    if (room) getMovieGame(room.code)?.skip(socket.id);
  });

  /* ----- kart race ----- */

  const kart = () => {
    const room = getRoom(socket.id);
    return room ? getKartGame(room.code) : undefined;
  };

  socket.on("kart:request-state", () => {
    const game = kart();
    if (game) socket.emit("kart:state", game.publicState());
  });
  socket.on("kart:customize", ({ avatar, color }) =>
    kart()?.customize(socket.id, avatar, color),
  );
  socket.on("kart:settings", (patch) => kart()?.setSettings(patch ?? {}));
  socket.on("kart:ready", (ready) => kart()?.setReady(socket.id, !!ready));
  socket.on("kart:finish", (p) => kart()?.finish(socket.id, p));
  socket.on("kart:attack", (a) => {
    const room = getRoom(socket.id);
    const attack = room && getKartGame(room.code)?.attack(socket.id, a);
    if (room && attack) socket.to(room.code).emit("kart:attack", attack);
  });
  socket.on("kart:again", () => kart()?.again());
  socket.on("kart:update", (snap) => {
    const room = getRoom(socket.id);
    const peer = room && getKartGame(room.code)?.snapshot(socket.id, snap);
    if (room && peer) socket.to(room.code).volatile.emit("kart:peer", peer);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`server on :${PORT}`));
