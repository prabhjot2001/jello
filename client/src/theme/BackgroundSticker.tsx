import { useMemo } from "react";
import { THEMES } from "./themes";
import { useThemeStore } from "./store";

export function BackgroundStickers() {
  const themeId = useThemeStore((s) => s.themeId);
  const stickers = THEMES.find((t) => t.id === themeId)!.stickers;

  const items = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      src: stickers[i % stickers.length],
      left: Math.random() * 92, top: Math.random() * 92,
      size: 48 + Math.random() * 56,
      rotate: Math.random() * 40 - 20,
      dur: 6 + Math.random() * 6,
      delay: -Math.random() * 6,
    })),
    [themeId]
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((s, i) => (
        <img
          key={i}
          src={`/stickers/${s.src}`}
          alt=""
          className="absolute opacity-15"
          style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size,
            ["--r" as string]: `${s.rotate}deg`,
            animation: `float-around ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}