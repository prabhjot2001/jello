import { useEffect, useRef } from "react";
import { drawKart, readTheme } from "./engine";

/** A small animated preview of a kart with its avatar. */
export function KartPreview({ avatarId, color }: { avatarId: string; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const props = useRef({ avatarId, color });
  props.current = { avatarId, color };

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 520;
    canvas.height = 300;
    const th = readTheme();
    let raf = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, 520, 300);
      ctx.setTransform(2.4, 0, 0, 2.4, 0, 0);
     drawKart(ctx, 108, 112, { ...props.current, y: 0, vy: 0, crashT: 0, wheel: ts / 120, flags: 0 }, th, ts);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="mx-auto w-full max-w-[260px]" style={{ aspectRatio: "520 / 300" }} />;
}