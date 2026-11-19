import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { maybeMeme, playSfx } from "@/theme/sounds";
import { rememberMovie } from "@/lib/movieHistory";
import type { MovieChat, MovieEvent, MovieState } from "@/types";

export function useMovieGame(myId: string) {
  const [state, setState] = useState<MovieState | null>(null);
  const [chat, setChat] = useState<MovieChat[]>([]);
  const [shake, setShake] = useState(0);
  const prev = useRef<MovieState | null>(null);
  const wrongStreak = useRef(0);
  const localId = useRef(0);

  useEffect(() => {
    const addLocal = (text: string) =>
      setChat((c) => [...c.slice(-99), { id: -++localId.current, playerId: "", name: "", text, kind: "system" }]);

    const onState = (s: MovieState) => {
      const p = prev.current;
      const newRound =
        s.phase === "round" &&
        (!p || p.phase !== "round" || (s.mode === "versus" && p.round !== s.round));

      if (newRound) {
        playSfx("roundStart");
        if (s.mode === "versus") addLocal(`Round ${s.round} of ${s.totalRounds}${s.suddenDeath ? " (sudden death!)" : ""}`);
      } else if (p && p.phase === "round" && s.phase === "round") {
        const moreClues = (s.puzzle?.clues?.length ?? 0) > (p.puzzle?.clues?.length ?? 0);
        const newHint = !!s.puzzle?.hint && !p.puzzle?.hint;
        if (moreClues || newHint) playSfx("reveal");
      }
      if (s.phase === "reveal" && s.reveal && p?.phase !== "reveal") rememberMovie(s.reveal.id);
      prev.current = s;
      setState(s);
    };

    const onChat = (m: MovieChat) => setChat((c) => [...c.slice(-99), m]);

    const onEvent = (e: MovieEvent) => {
      switch (e.kind) {
        case "correct":
          if (e.playerId === myId) {
            wrongStreak.current = 0;
            playSfx("correct");
          } else {
            playSfx("oppScore");
            maybeMeme(0.25);
          }
          break;
        case "wrong":
          if (e.playerId === myId) {
            setShake((n) => n + 1);
            playSfx("wrong");
            wrongStreak.current++;
            if (wrongStreak.current >= 3) {
              maybeMeme(0.5);
              wrongStreak.current = 0;
            }
          }
          break;
        case "close":
          addLocal("🔥 So close! Check your spelling.");
          break;
        case "timeout":
          playSfx("timeout");
          maybeMeme(0.6);
          break;
        case "skip":
          playSfx("pop");
          break;
      }
    };

    socket.on("movie:state", onState);
    socket.on("movie:chat", onChat);
    socket.on("movie:event", onEvent);
    socket.emit("movie:request-state");
    return () => {
      socket.off("movie:state", onState);
      socket.off("movie:chat", onChat);
      socket.off("movie:event", onEvent);
    };
  }, [myId]);

  return { state, chat, shake };
}
