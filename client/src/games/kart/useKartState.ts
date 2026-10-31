import { useEffect, useState } from "react";
import { socket } from "@/socket";
import type { KartState } from "@/types";

export function useKartState() {
  const [state, setState] = useState<KartState | null>(null);

  useEffect(() => {
    socket.on("kart:state", setState);
    socket.emit("kart:request-state");
    return () => {
      socket.off("kart:state", setState);
    };
  }, []);

  return state;
}