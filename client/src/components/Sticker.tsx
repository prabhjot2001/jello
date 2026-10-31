import { useState, type CSSProperties } from "react";

interface Props {
  src: string;
  fallback: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Sticker({ src, fallback, size = 64, className = "", style }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}>
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={`/stickers/${src}`}
      alt=""
      width={size}
      draggable={false}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}