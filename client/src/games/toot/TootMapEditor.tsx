import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sticker } from "@/components/Sticker";
import { decodeMap, deleteMap, encodeMap, loadSaved, saveMap, type SavedMap } from "@/lib/customMaps";
import type { TootCustomMap, TootKindInfo, TootMapInfo } from "@/types";
import { hazardSticker } from "./stickers";

type Item = TootCustomMap["items"][number];

const SCALE = 0.5; // canvas pixels per world pixel
const CW = 800;
const CH = 450;
const VIEW_WORLD = CW / SCALE;
const WORLD_H = 900;
const MIN_X = 900;
const END_PAD = 800;
const ZONE = 400;
const MAX_ITEMS = 160;

const card = "rounded-3xl border-2 border-border bg-card p-4 shadow-[4px_4px_0_0_var(--border)]";
const snap = (n: number) => Math.round(n / 20) * 20;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const blockedFor = (len: number, x: number, w: number) =>
  [0, len / 3, (2 * len) / 3, len].some((z) => x < z + ZONE && x + w > z - ZONE);

/** The area an item covers, in world pixels. Must match the server. */
function itemBox(info: TootKindInfo, it: Item) {
  const [, x, y, size] = it;
  switch (info.anchor) {
    case "floorPillar":
      return { x, y: WORLD_H - size, w: info.w, h: size };
    case "ceilPillar":
      return { x, y: 0, w: info.w, h: size };
    case "gate":
      return { x, y: 0, w: info.w, h: WORLD_H };
    case "island":
      return { x, y, w: size, h: 34 };
    case "strip":
      return { x, y: WORLD_H - info.h, w: size, h: info.h };
    case "ground":
      return { x, y: WORLD_H - 2 * info.h, w: 2 * size + 2 * info.h, h: 2 * info.h };
    case "hang":
      return { x, y: 0, w: 2 * info.h, h: 230 + size };
    case "float":
      return { x, y: y - info.h - size, w: 2 * info.h + 2 * info.ax, h: 2 * (info.h + size) };
    case "swing":
      return { x, y: 0, w: size * 1.6, h: size + info.h };
  }
}

export function TootMapEditor({
  kinds, maps, onUse, onClose,
}: {
  kinds: TootKindInfo[];
  maps: TootMapInfo[];
  onUse: (spec: TootCustomMap) => void;
  onClose: () => void;
}) {
  const [spec, setSpec] = useState<TootCustomMap>({
    v: 1, name: "My map", theme: maps[0]?.id ?? "sewer", length: 9000, items: [],
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [tool, setTool] = useState<string | null>(null);
  const [viewX, setViewX] = useState(0);
  const [saved, setSaved] = useState<SavedMap[]>(() => loadSaved());
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [msg, setMsg] = useState("");
  const [codeText, setCodeText] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [tick, setTick] = useState(0);
  const history = useRef<Item[][]>([]);
  const drag = useRef<{ i: number; dx: number; dy: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const kindOf = (id: string) => kinds.find((k) => k.id === id);
  const say = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2600);
  };

  // sticker images load a moment after the first draw
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (++n > 12) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const commit = (items: Item[]) => {
    history.current.push(spec.items);
    if (history.current.length > 50) history.current.shift();
    setSpec((s) => ({ ...s, items }));
  };

  /* ---------- drawing ---------- */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = CW * 2;
    canvas.height = CH * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const theme = maps.find((m) => m.id === spec.theme)?.theme;
    const rock = theme?.rock || "#D8CBF0";
    const edge = theme?.rockEdge || "#4A3566";
    const sx = (wx: number) => (wx - viewX) * SCALE;
    const sy = (wy: number) => wy * SCALE;

    const sky = ctx.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, theme?.skyTop || "#D4F5E6");
    sky.addColorStop(1, theme?.skyBottom || "#FFF4E6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, CH);

    // areas that must stay free
    const len = spec.length;
    const zones: [number, number, string][] = [
      [0, MIN_X, "Start"],
      [len / 3 - ZONE, len / 3 + ZONE, "Checkpoint"],
      [(2 * len) / 3 - ZONE, (2 * len) / 3 + ZONE, "Checkpoint"],
      [len - END_PAD, len, "Finish"],
    ];
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    for (const [a, b, label] of zones) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(sx(a), 0, (b - a) * SCALE, CH);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(label, sx((a + b) / 2), 20);
    }
    ctx.fillStyle = rock;
    ctx.fillRect(0, 0, CW, 6);
    ctx.fillRect(0, CH - 6, CW, 6);

    spec.items.forEach((it, i) => {
      const info = kindOf(it[0]);
      if (!info) return;
      const b = itemBox(info, it);

      if (info.group === "rock") {
        ctx.fillStyle = rock;
        ctx.strokeStyle = edge;
        ctx.lineWidth = 2;
        const block = (x: number, y: number, w: number, h: number) => {
          ctx.fillRect(sx(x), sy(y), w * SCALE, h * SCALE);
          ctx.strokeRect(sx(x), sy(y), w * SCALE, h * SCALE);
        };
        if (info.anchor === "gate") {
          block(it[1], 0, info.w, it[2] - it[3] / 2);
          block(it[1], it[2] + it[3] / 2, info.w, WORLD_H - (it[2] + it[3] / 2));
        } else {
          block(b.x, b.y, b.w, b.h);
        }
      } else {
        ctx.fillStyle = "rgba(255,70,110,0.2)";
        ctx.strokeStyle = "rgba(255,70,110,0.8)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(sx(b.x), sy(b.y), b.w * SCALE, b.h * SCALE);
        ctx.strokeRect(sx(b.x), sy(b.y), b.w * SCALE, b.h * SCALE);
        const cx = sx(b.x + b.w / 2);
        const cy = sy(b.y + b.h / 2);
        const icon = clamp(b.h * SCALE, 24, 44);
        const img = hazardSticker(info.id);
        if (img) {
          const ar = img.naturalWidth / img.naturalHeight;
          ctx.drawImage(img, cx - (icon * ar) / 2, cy - icon / 2, icon * ar, icon);
        } else {
          ctx.font = `${icon}px sans-serif`;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(info.emoji, cx, cy);
        }
      }

      if (selected === i) {
        ctx.strokeStyle = "#7C4DFF";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(sx(b.x) - 3, sy(b.y) - 3, b.w * SCALE + 6, b.h * SCALE + 6);
        ctx.setLineDash([]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, selected, viewX, tick, maps, kinds]);

  /* ---------- pointer: place, select, drag ---------- */
  const toWorld = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      wx: viewX + (((e.clientX - r.left) * CW) / r.width) / SCALE,
      wy: (((e.clientY - r.top) * CH) / r.height) / SCALE,
    };
  };

  const down = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { wx, wy } = toWorld(e);

    if (tool) {
      const info = kindOf(tool);
      if (!info) return;
      if (spec.items.length >= MAX_ITEMS) return say(`You can place up to ${MAX_ITEMS} items.`);
      const it: Item = [
        info.id,
        clamp(snap(wx), MIN_X, spec.length - END_PAD),
        info.usesY ? clamp(snap(wy), 100, 800) : 0,
        info.def,
      ];
      const b = itemBox(info, it);
      if (blockedFor(spec.length, b.x, b.w)) return say("Keep the start, checkpoints and finish free.");
      commit([...spec.items, it]);
      setSelected(spec.items.length);
      setTool(null);
      return;
    }

    for (let i = spec.items.length - 1; i >= 0; i--) {
      const info = kindOf(spec.items[i][0]);
      if (!info) continue;
      const b = itemBox(info, spec.items[i]);
      if (wx >= b.x - 10 && wx <= b.x + b.w + 10 && wy >= b.y - 10 && wy <= b.y + b.h + 10) {
        setSelected(i);
        drag.current = { i, dx: wx - spec.items[i][1], dy: wy - spec.items[i][2] };
        history.current.push(spec.items);
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }
    setSelected(null);
  };

  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    const { wx, wy } = toWorld(e);
    setSpec((s) => {
      const it = s.items[d.i];
      const info = it && kindOf(it[0]);
      if (!it || !info) return s;
      const next: Item = [
        it[0],
        clamp(snap(wx - d.dx), MIN_X, s.length - END_PAD),
        info.usesY ? clamp(snap(wy - d.dy), 100, 800) : 0,
        it[3],
      ];
      const b = itemBox(info, next);
      if (blockedFor(s.length, b.x, b.w)) return s;
      const items = s.items.slice();
      items[d.i] = next;
      return { ...s, items };
    });
  };

  const up = () => {
    drag.current = null;
  };

  /* ---------- actions ---------- */
  const sel = selected !== null ? spec.items[selected] : undefined;
  const selInfo = sel ? kindOf(sel[0]) : undefined;

  const resize = (value: number) => {
    if (selected === null) return;
    setSpec((s) => {
      const it = s.items[selected];
      if (!it) return s;
      const items = s.items.slice();
      items[selected] = [it[0], it[1], it[2], value];
      return { ...s, items };
    });
  };

  const remove = () => {
    if (selected === null) return;
    commit(spec.items.filter((_, i) => i !== selected));
    setSelected(null);
  };

  const duplicate = () => {
    if (!sel || !selInfo || spec.items.length >= MAX_ITEMS) return;
    const copy: Item = [sel[0], clamp(sel[1] + 200, MIN_X, spec.length - END_PAD), sel[2], sel[3]];
    const b = itemBox(selInfo, copy);
    if (blockedFor(spec.length, b.x, b.w)) return say("No room for a copy there.");
    commit([...spec.items, copy]);
    setSelected(spec.items.length);
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    setSpec((s) => ({ ...s, items: prev }));
    setSelected(null);
  };

  const setLength = (len: number) => {
    setSpec((s) => ({
      ...s,
      length: len,
      items: s.items.map((it): Item => [it[0], Math.min(it[1], len - END_PAD), it[2], it[3]]),
    }));
    setViewX((v) => clamp(v, 0, Math.max(0, len - VIEW_WORLD)));
  };

  const save = () => {
    const r = saveMap(spec, currentId);
    setCurrentId(r.id);
    setSaved(r.list);
    say("Saved on this device.");
  };

  const exportCode = async () => {
    const code = encodeMap(spec);
    try {
      await navigator.clipboard.writeText(code);
      say("Map code copied. Paste it anywhere to share it.");
    } catch {
      setCodeText(code);
      setShowCode(true);
      say("Copy the code from the box.");
    }
  };

  const importCode = () => {
    const m = decodeMap(codeText);
    if (!m) return say("That code is not valid.");
    history.current = [];
    setSpec(m);
    setSelected(null);
    setCurrentId(undefined);
    setViewX(0);
    setShowCode(false);
    say("Map imported.");
  };

  const groups: [string, "rock" | "hazard"][] = [["Rocks", "rock"], ["Hazards", "hazard"]];

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background p-3">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">🛠️ Map editor</h1>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <Card className={card}>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={spec.name}
              maxLength={24}
              onChange={(e) => setSpec((s) => ({ ...s, name: e.target.value }))}
              className="h-9 w-48 rounded-lg border-2 border-border bg-card px-2 text-sm font-semibold"
              aria-label="Map name"
            />
            <label className="flex items-center gap-2 text-sm">
              Length {Math.round(spec.length / 100) / 10}k
              <input
                type="range" min={5000} max={20000} step={500} value={spec.length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </label>
          </div>
          <p className="mb-1 mt-3 text-sm font-semibold">Background</p>
          <div className="flex flex-wrap gap-2">
            {maps.map((m) => (
              <Button
                key={m.id} size="sm" variant={spec.theme === m.id ? "default" : "outline"}
                onClick={() => setSpec((s) => ({ ...s, theme: m.id }))}
              >
                {m.emoji} {m.name}
              </Button>
            ))}
          </div>
        </Card>

        <div>
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className={`w-full touch-none rounded-2xl border-2 border-border ${tool ? "cursor-crosshair" : ""}`}
            style={{ aspectRatio: `${CW} / ${CH}` }}
          />
          <input
            type="range" min={0} max={Math.max(0, spec.length - VIEW_WORLD)} step={100} value={viewX}
            onChange={(e) => setViewX(Number(e.target.value))}
            className="mt-2 w-full" aria-label="Scroll the track"
          />
          <p className="text-center text-xs text-muted-foreground">
            {tool
              ? `Tap the track to place: ${kindOf(tool)?.label}`
              : "Pick a hurdle below, then tap the track. Drag items to move them. Use the slider to scroll."}
          </p>
        </div>

        {sel && selInfo && (
          <Card className={card}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display font-bold">
                {selInfo.emoji} {selInfo.label}
              </span>
              <label className="flex flex-1 items-center gap-2 text-sm">
                {selInfo.sizeLabel}
                <input
                  type="range" min={selInfo.min} max={selInfo.max} step={10} value={sel[3]}
                  onPointerDown={() => history.current.push(spec.items)}
                  onChange={(e) => resize(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-10 text-right">{sel[3]}</span>
              </label>
              <Button size="sm" variant="outline" onClick={duplicate}>
                Duplicate
              </Button>
              <Button size="sm" variant="destructive" onClick={remove}>
                Delete
              </Button>
            </div>
          </Card>
        )}

        <Card className={card}>
          {groups.map(([title, group]) => (
            <div key={group} className="mb-2">
              <p className="mb-1 text-sm font-semibold">{title}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {kinds
                  .filter((k) => k.group === group)
                  .map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setTool(tool === k.id ? null : k.id)}
                      className={`flex flex-col items-center rounded-xl border-2 border-border px-1 py-2 text-center text-[11px] leading-tight transition hover:-translate-y-0.5 ${
                        tool === k.id ? "bg-primary text-primary-foreground" : "bg-card"
                      }`}
                    >
                      <Sticker src={`hazards/${k.id}.png`} fallback={k.emoji} size={30} />
                      {k.label}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </Card>

        <Card className={card}>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={undo}>
              ↶ Undo
            </Button>
            <Button size="sm" variant="outline" onClick={() => commit([])}>
              Clear all
            </Button>
            <Button size="sm" variant="secondary" onClick={save}>
              💾 Save on this device
            </Button>
            <Button size="sm" variant="outline" onClick={exportCode}>
              📋 Copy map code
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCode((v) => !v)}>
              ⬇ Import code
            </Button>
            <Button size="sm" onClick={() => onUse(spec)}>
              ✅ Use in this room
            </Button>
          </div>
          {msg && <p className="mt-2 text-sm font-semibold">{msg}</p>}
          {showCode && (
            <div className="mt-2 flex flex-col gap-2">
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                placeholder="Paste a map code here (starts with T1.)"
                className="h-24 w-full rounded-xl border-2 border-border bg-card p-2 text-xs"
              />
              <Button size="sm" onClick={importCode}>
                Import this code
              </Button>
            </div>
          )}
        </Card>

        {saved.length > 0 && (
          <Card className={card}>
            <p className="mb-2 font-display font-bold">My maps (saved on this device)</p>
            <div className="flex flex-col gap-2">
              {saved.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border-2 border-border px-3 py-1 text-sm"
                >
                  <span>
                    {m.spec.name} · {m.spec.items.length} items · {Math.round(m.spec.length / 100) / 10}k
                  </span>
                  <span className="flex gap-2">
                    <Button
                      size="sm" variant="outline"
                      onClick={() => {
                        history.current = [];
                        setSpec(m.spec);
                        setCurrentId(m.id);
                        setSelected(null);
                        setViewX(0);
                      }}
                    >
                      Load
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setSaved(deleteMap(m.id))}>
                      Delete
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
