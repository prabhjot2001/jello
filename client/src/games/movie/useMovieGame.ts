import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { maybeMeme, playSfx } from "@/theme/sound";
import type { MovieEvent, MovieState } from "@/types";

export interface FeedItem {
  id: number;
  name: string;
  text: string;
  mine: boolean;
}

export function useMovieGame(myId: string) {
  const [state, setState] = useState<MovieState | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [shake, setShake] = useState(0);
  const prev = useRef<MovieState | null>(null);
  const wrongStreak = useRef(0);
  const feedId = useRef(0);

  useEffect(() => {
    const onState = (s: MovieState) => {
      const p = prev.current;
      const newRound =
        s.phase === "round" &&
        (!p || p.phase !== "round" || (s.mode === "versus" && p.round !== s.round));

      if (newRound) {
        playSfx("roundStart");
        setFeed([]);
      } else if (p && p.phase === "round" && s.phase === "round") {
        const moreClues = (s.puzzle?.clues?.length ?? 0) > (p.puzzle?.clues?.length ?? 0);
        const newHint = !!s.puzzle?.hint && !p.puzzle?.hint;
        if (moreClues || newHint) playSfx("reveal");
      }
      prev.current = s;
      setState(s);
    };

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
          if (e.text) {
            const item = { id: feedId.current++, name: e.name, text: e.text, mine: e.playerId === myId };
            setFeed((f) => [...f.slice(-3), item]);
          }
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
    socket.on("movie:event", onEvent);
    socket.emit("movie:request-state");
    return () => {
      socket.off("movie:state", onState);
      socket.off("movie:event", onEvent);
    };
  }, [myId]);

  return { state, feed, shake };
}