import { Point } from '../typings/types';

// coordinate space shared by all character data (see Positioner)
export const BOUNDS = { minX: 0, maxX: 1024, minY: -124, maxY: 900 };

/** Flattens an absolute M/L/Q/C/Z path (the subset used by character data) into a polygon. */
export const pathToPolygon = (path: string, samples = 16): Point[] => {
  const tokens = path.match(/[MLQCZ]|-?\d+(\.\d+)?/g)!;
  const polygon: Point[] = [];
  let i = 0;
  const num = () => Number(tokens[i++]);
  const pt = () => ({ x: num(), y: num() });
  while (i < tokens.length) {
    const cmd = tokens[i++];
    const from = polygon[polygon.length - 1];
    if (cmd === 'M' || cmd === 'L') {
      polygon.push(pt());
    } else if (cmd === 'Q' || cmd === 'C') {
      const ctrl = cmd === 'Q' ? [from, pt(), pt()] : [from, pt(), pt(), pt()];
      for (let s = 1; s <= samples; s++) {
        // de Casteljau evaluation
        let level = ctrl;
        while (level.length > 1) {
          level = level.slice(1).map((p, k) => ({
            x: level[k].x + (p.x - level[k].x) * (s / samples),
            y: level[k].y + (p.y - level[k].y) * (s / samples),
          }));
        }
        polygon.push(level[0]);
      }
    }
  }
  return polygon;
};

/** Nonzero winding rule, matching how SVG fills the outline by default. */
export const isInsidePolygon = ({ x, y }: Point, polygon: Point[]) => {
  let winding = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    const side = (b.x - a.x) * (y - a.y) - (x - a.x) * (b.y - a.y);
    if (a.y <= y && b.y > y && side > 0) winding++;
    if (a.y > y && b.y <= y && side < 0) winding--;
  }
  return winding !== 0;
};

/** Simulates a hand-drawn stroke: densely samples a polyline through the given corners. */
export const trace = (corners: number[][], step = 15): Point[] => {
  const points: Point[] = [{ x: corners[0][0], y: corners[0][1] }];
  for (let c = 1; c < corners.length; c++) {
    const [x0, y0] = corners[c - 1];
    const [x1, y1] = corners[c];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let s = 1; s <= n; s++) {
      points.push({ x: x0 + ((x1 - x0) * s) / n, y: y0 + ((y1 - y0) * s) / n });
    }
  }
  return points;
};

/** Simulates an imprecise learner: the stroke is shifted and slightly squashed. */
export const sloppy = (median: number[][]) =>
  median.map(([x, y]) => [512 + (x - 512) * 0.94 + 25, 400 + (y - 400) * 1.04 - 20]);
