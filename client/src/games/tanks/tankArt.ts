import type { TankTheme, TerrainOp } from "@/types";

export const PIVOT_Y = 22; // keep in sync with the server
export const BARREL = 34;

export interface TankSkin {
  id: string;
  name: string;
  color: string;
}

/**
 * Your tank stickers: put client/public/stickers/tanks/<id>.png and list the id here.
 * Missing files fall back to a drawn tank in the skin's color.
 */
export const TANK_SKINS: TankSkin[] = [
  { id: "tank1", name: "Pinky", color: "#FF8FB1" },
  { id: "tank2", name: "Bluey", color: "#7FC8FF" },
  { id: "tank3", name: "Minty", color: "#9FE3C4" },
  { id: "tank4", name: "Sunny", color: "#FFE08A" },
  { id: "tank5", name: "Grapey", color: "#C9B3F5" },
  { id: "tank6", name: "Peachy", color: "#FFB38A" },
  { id: "tank7", name: "Limey", color: "#C8F28A" },
  { id: "tank8", name: "Snowy", color: "#E6EEF7" },
];

export const skinColor = (id: string) => TANK_SKINS.find((s) => s.id === id)?.color ?? "#9FE3C4";

const images = new Map<string, HTMLImageElement>();

/** The loaded sticker, or null while it loads or if the file does not exist. */
export function tankImage(id: string): HTMLImageElement | null {
  let img = images.get(id);
  if (!img) {
    img = new Image();
    img.src = `/stickers/tanks/${id}.png`;
    images.set(id, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A tank standing at (x, y) = its feet. The sticker (or drawn body) tilts with the ground, the barrel does not. */
export function drawTank(
  ctx: CanvasRenderingContext2D,
  o: { skin: string; x: number; y: number; tilt: number; face: 1 | -1; angle: number; flash: number; ink: string }
) {
  const img = tankImage(o.skin);
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.tilt);
  if (o.face < 0) ctx.scale(-1, 1);
  if (img) {
    const s = Math.min(72 / img.naturalWidth, 46 / img.naturalHeight);
    ctx.drawImage(img, (-img.naturalWidth * s) / 2, -img.naturalHeight * s, img.naturalWidth * s, img.naturalHeight * s);
  } else {
    const color = skinColor(o.skin);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = o.ink;
    ctx.fillStyle = "#3b2f4f";
    rr(ctx, -28, -12, 56, 12, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    rr(ctx, -20, -23, 40, 13, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -23, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // the barrel
  ctx.save();
  ctx.translate(o.x, o.y - PIVOT_Y);
  ctx.rotate((-o.angle * Math.PI) / 180);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = o.ink;
  ctx.fillStyle = "#555e6e";
  rr(ctx, 0, -3.5, BARREL, 7, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#555e6e";
  ctx.beginPath();
  ctx.arc(o.x, o.y - PIVOT_Y, 6, 0, Math.PI * 2);
  ctx.fill();

  if (o.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.6, o.flash)})`;
    ctx.beginPath();
    ctx.arc(o.x, o.y - 16, 30, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * The battlefield picture. `shape` is a black-and-transparent copy of the terrain, `look` is what is shown
 * (dirt gradient with a grass edge). Only the changed part is redrawn after an explosion.
 */
export class TerrainView {
  readonly look: HTMLCanvasElement;
  private shape: HTMLCanvasElement;
  private tmp: HTMLCanvasElement;
  private s: CanvasRenderingContext2D;
  private l: CanvasRenderingContext2D;
  private t: CanvasRenderingContext2D;

  readonly w: number;
  readonly h: number;
  private theme: TankTheme;

  constructor(w: number, h: number, theme: TankTheme) {
    this.w = w;
    this.h = h;
    this.theme = theme;
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    };
    this.look = mk();
    this.shape = mk();
    this.tmp = mk();
    this.s = this.shape.getContext("2d")!;
    this.l = this.look.getContext("2d")!;
    this.t = this.tmp.getContext("2d")!;
  }

  build(heights: number[], ops: TerrainOp[]) {
    const s = this.s;
    s.clearRect(0, 0, this.w, this.h);
    s.globalCompositeOperation = "source-over";
    s.fillStyle = "#000";
    s.beginPath();
    s.moveTo(0, this.h);
    for (let x = 0; x < this.w; x++) s.lineTo(x, heights[x]);
    s.lineTo(this.w, this.h);
    s.closePath();
    s.fill();
    for (const op of ops) this.shapeOp(op);
    this.redraw(0, 0, this.w, this.h);
  }

  apply(op: TerrainOp) {
    this.shapeOp(op);
    const [t, a, b, c, d] = op;
    if (t === "c" || t === "a") this.redraw(a - c - 8, b - c - 8, 2 * c + 16, 2 * c + 16);
    else if (t === "r" || t === "R") this.redraw(a - 8, b - 8, c + 16, d + 16);
    else this.redraw(a - c - 8, b - d - 8, 2 * c + 16, 2 * d + 16);
  }

  private shapeOp(op: TerrainOp) {
    const [t, a, b, c, d] = op;
    const s = this.s;
    const add = t === "a" || t === "R" || t === "e";
    s.globalCompositeOperation = add ? "source-over" : "destination-out";
    s.fillStyle = "#000";
    s.beginPath();
    if (t === "c" || t === "a") s.arc(a, b, c, 0, Math.PI * 2);
    else if (t === "r" || t === "R") s.rect(a, b, c, d);
    else s.ellipse(a, b, c, d, 0, 0, Math.PI * 2);
    s.fill();
    s.globalCompositeOperation = "source-over";
    s.fillRect(0, this.h - 8, this.w, 8); // bedrock
  }

  private redraw(x: number, y: number, w: number, h: number) {
    x = Math.max(0, Math.floor(x));
    y = Math.max(0, Math.floor(y));
    w = Math.min(this.w - x, Math.ceil(w));
    h = Math.min(this.h - y, Math.ceil(h));
    if (w <= 0 || h <= 0) return;

    const l = this.l;
    l.save();
    l.beginPath();
    l.rect(x, y, w, h);
    l.clip();
    l.clearRect(x, y, w, h);
    l.globalCompositeOperation = "source-over";
    l.drawImage(this.shape, x, y, w, h, x, y, w, h);
    l.globalCompositeOperation = "source-in";
    const g = l.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, this.theme.dirt);
    g.addColorStop(1, this.theme.dirtDark);
    l.fillStyle = g;
    l.fillRect(x, y, w, h);
    l.restore();

    // grass: the top band of every surface that faces up
    const t = this.t;
    t.globalCompositeOperation = "source-over";
    t.clearRect(0, 0, w, h);
    t.drawImage(this.shape, x, y, w, h, 0, 0, w, h);
    t.globalCompositeOperation = "destination-out";
    t.drawImage(this.shape, x, y - 6, w, h, 0, 0, w, h);
    t.globalCompositeOperation = "source-in";
    t.fillStyle = this.theme.grass;
    t.fillRect(0, 0, w, h);
    l.drawImage(this.tmp, 0, 0, w, h, x, y, w, h);
  }
}
