import type { RoomState } from "../../shared/events.js";
import { DEFAULT_SETTINGS } from "./games/movieSettings.js";

const rooms = new Map<string, RoomState>();
const socketToRoom = new Map<string, string>();
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  let code = "";
  do {
    code = Array.from(
      { length: 4 },
      () => CHARS[Math.floor(Math.random() * CHARS.length)],
    ).join("");
  } while (rooms.has(code));
  return code;
}

export function createRoom(socketId: string, name: string): RoomState {
  const code = makeCode();

  const room: RoomState = {
    code,
    players: [{ id: socketId, name, ready: false }],
    gameId: null,
    mode: "versus",
    settings: { ...DEFAULT_SETTINGS, types: [...DEFAULT_SETTINGS.types] },
    phase: "lobby",
    limits: { min: 2, max: 2 },
  };
  rooms.set(code, room);
  socketToRoom.set(socketId, code);
  return room;
}

export function joinRoom(
  socketId: string,
  code: string,
  name: string,
): { room: RoomState } | { error: string } {
  const room = rooms.get(code);
    if (!room) return { error: "Room not found. Check the code." };
  if (room.players.some((p) => p.id === socketId)) return { room };
  if (room.players.length >= room.limits.max) return { error: "This room is full." };
  
  room.players.push({ id: socketId, name, ready: false });
  socketToRoom.set(socketId, code);
  return { room };
}

export function getRoom(socketId: string): RoomState | undefined {
  const code = socketToRoom.get(socketId);
  return code ? rooms.get(code) : undefined;
}

export function leaveRoom(socketId: string): RoomState | undefined {
  const code = socketToRoom.get(socketId);
  if (!code) return undefined;
  socketToRoom.delete(socketId);
  const room = rooms.get(code);
  if (!room) return undefined;

  room.players = room.players.filter((p) => p.id !== socketId);
  room.players.forEach((p) => (p.ready = false));
  room.phase = "lobby";

  // khali room 60 sec baad delete (refresh pe room na udde)
  if (room.players.length === 0) {
    setTimeout(() => {
      const r = rooms.get(code);
      if (r && r.players.length === 0) rooms.delete(code);
    }, 60_000);
  }
  return room;
}
