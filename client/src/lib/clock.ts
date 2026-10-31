import { useEffect, useState } from "react";
import { socket } from "@/socket";

let offset = 0;

/** Current time on the server's clock. */
export const serverNow = () => Date.now() + offset;

/** Estimates the offset to the server clock using the lowest-latency sample. */
export async function syncClock(samples = 5) {
  let best = { rtt: Infinity, offset };
  for (let i = 0; i < samples; i++) {
    const t0 = Date.now();
    const serverTime = await new Promise<number>((resolve) => socket.emit("time:sync", resolve));
    const t1 = Date.now();
    const rtt = t1 - t0;
    if (rtt < best.rtt) best = { rtt, offset: serverTime + rtt / 2 - t1 };
    await new Promise((r) => setTimeout(r, 120));
  }
  offset = best.offset;
}

/** Re-renders every `intervalMs` with the current server time. */
export function useServerTime(intervalMs = 100) {
  const [t, setT] = useState(serverNow());
  useEffect(() => {
    const id = setInterval(() => setT(serverNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}