import type { TerrainOp } from "../../../shared/tanks.js";

export const FIELD_W = 1600;
export const FIELD_H = 560;
const BEDROCK = 8; // the bottom rows can never be dug away

/** The battlefield as a grid of solid/empty pixels. Only whole numbers are used, so every change is exact. */
export class Terrain {
  private mask = new Uint8Array(FIELD_W * FIELD_H);
  readonly ops: TerrainOp[] = [];

  constructor(heights: number[]) {
    for (let x = 0; x < FIELD_W; x++) {
      const top = Math.max(0, Math.min(FIELD_H, Math.round(heights[x])));
      for (let y = top; y < FIELD_H; y++) this.mask[y * FIELD_W + x] = 1;
    }
  }

  solid(x: number, y: number): boolean {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= FIELD_W || y < 0) return false;
    if (y >= FIELD_H) return true;
    return this.mask[y * FIELD_W + x] === 1;
  }

  private put(x: number, y: number, on: boolean) {
    if (x < 0 || x >= FIELD_W || y < 0 || y >= FIELD_H) return;
    if (!on && y >= FIELD_H - BEDROCK) return;
    this.mask[y * FIELD_W + x] = on ? 1 : 0;
  }

  apply(op: TerrainOp): TerrainOp {
    const [t, a, b, c, d] = op;
    const on = t === "a" || t === "R" || t === "e";
    if (t === "c" || t === "a") {
      for (let y = b - c; y <= b + c; y++) {
        for (let x = a - c; x <= a + c; x++) {
          if ((x - a) ** 2 + (y - b) ** 2 <= c * c) this.put(x, y, on);
        }
      }
    } else if (t === "r" || t === "R") {
      for (let y = b; y < b + d; y++) for (let x = a; x < a + c; x++) this.put(x, y, on);
    } else if (t === "e" || t === "E") {
      for (let y = b - d; y <= b + d; y++) {
        for (let x = a - c; x <= a + c; x++) {
          if ((x - a) ** 2 * d * d + (y - b) ** 2 * c * c <= c * c * d * d) this.put(x, y, on);
        }
      }
    }
    this.ops.push(op);
    return op;
  }

  circle(add: boolean, x: number, y: number, r: number) {
    return this.apply([add ? "a" : "c", Math.round(x), Math.round(y), Math.max(1, Math.round(r)), 0]);
  }

  rect(add: boolean, x: number, y: number, w: number, h: number) {
    return this.apply([add ? "R" : "r", Math.round(x), Math.round(y), Math.round(w), Math.round(h)]);
  }

  /** The first solid pixel going down from fromY. */
  surfaceY(x: number, fromY = 0) {
    let y = Math.max(0, Math.round(fromY));
    while (y < FIELD_H && !this.solid(x, y)) y++;
    return y;
  }
}
