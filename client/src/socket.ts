import { io, type Socket } from "socket.io-client";
import type { ClientToServer, ServerToClient } from "@/types";

const url = import.meta.env.VITE_SERVER_URL as string | undefined;
const options = { transports: ["websocket"] };

export const socket: Socket<ServerToClient, ClientToServer> =
  url || !import.meta.env.PROD ? io(url ?? "http://localhost:3001", options) : io(options);