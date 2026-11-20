import { useEffect, useRef, useState, type ReactNode } from "react";
import { socket } from "@/socket";

/**
 * Wraps a running game: covers the whole screen (no navbar/footer), locks page scroll,
 * and asks before the player leaves by accident (browser/phone back button, refresh, or the exit button).
 */
export function GameShell({ children }: { children: ReactNode }) {
  const [asking, setAsking] = useState(false);
  const leaving = useRef(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // trap the back button: keep one extra history entry and ask instead of leaving
  useEffect(() => {
    history.pushState({ gameGuard: true }, "");
    const onPop = () => {
      if (leaving.current) return;
      history.pushState({ gameGuard: true }, "");
      setAsking(true);
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (leaving.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);

  const leave = () => {
    leaving.current = true;
    setAsking(false);
    socket.emit("room:back");
  };

  const toggleFullscreen = () => {
    const el = document.documentElement;
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void el.requestFullscreen?.();
    } catch {
      /* not supported (iOS Safari) */
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto overscroll-none bg-background">
      {children}

      <div className="fixed right-2 top-2 z-[60] flex gap-2">
        {"requestFullscreen" in document.documentElement && (
          <button
            aria-label="Toggle fullscreen"
            onClick={toggleFullscreen}
            className="h-9 w-9 rounded-full border-2 border-border bg-card/80 text-sm backdrop-blur"
          >
            ⛶
          </button>
        )}
        <button
          aria-label="Leave game"
          onClick={() => setAsking(true)}
          className="h-9 w-9 rounded-full border-2 border-border bg-card/80 text-sm backdrop-blur"
        >
          ✕
        </button>
      </div>

      {asking && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-6 text-center shadow-[4px_4px_0_0_var(--border)]">
            <div className="text-4xl">🐱❓</div>
            <h2 className="mt-2 font-display text-xl">Leave the game?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This ends the match for everyone and takes you back to the room.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                className="rounded-full border-2 border-border bg-primary px-5 py-2 font-display text-primary-foreground"
                onClick={() => setAsking(false)}
              >
                Keep playing
              </button>
              <button className="rounded-full border-2 border-border bg-card px-5 py-2 font-display" onClick={leave}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
