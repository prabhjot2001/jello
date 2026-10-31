import { useEffect, useState } from "react";
import { socket } from "@/socket";
import { usePlayerStore } from "@/store/player";
import type { RoomState } from "@/types";

export function useRoom(code: string) {
  const name = usePlayerStore((s) => s.name);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myId, setMyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const join = () =>
      socket.emit("room:join", { code, name }, (r) => {
        if (r.ok) {
          setRoom(r.state);
          setMyId(r.you);
          setError("");
        } else {
          setError(r.error);
        }
      });
    const onState = (s: RoomState) => setRoom(s);

    socket.on("room:state", onState);
    socket.on("connect", join); // reconnect pe dobara join
    if (socket.connected) join();

    return () => {
      socket.off("room:state", onState);
      socket.off("connect", join);
      socket.emit("room:leave");
    };
  }, [code, name]);

  return { room, myId, error };
}