import { CharacterJson } from '../../typings/types';

/**
 * Helpers for authoring Hangul character data from stroke centrelines (medians) alone.
 *
 * All coordinates use the engine's character space: a 1024-unit box
 * spanning x 0..1024 and y -124..900, with the y axis pointing UP.
 * A median lists a stroke's centreline points in drawing order.
 */
export type Median = number[][];

type Vec = { x: number; y: number };

const DEFAULT_STROKE_WIDTH = 80;
/** Caps miter joins at sharp corners, as a multiple of the half stroke width. */
const MAX_MITER = 3;
const MAX_MEDIAN_SPACING = 100;

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s });
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const unit = (a: Vec): Vec => scale(a, 1 / (Math.hypot(a.x, a.y) || 1));
const leftNormal = (a: Vec): Vec => ({ x: -a.y, y: a.x });
const fmt = ({ x, y }: Vec) => `${Math.round(x)} ${Math.round(y)}`;

/**
 * Builds a closed SVG outline of constant width around a median, with mitered corners
 * and rounded caps. The median is guaranteed to lie inside the outline.
 */
export function outlineFromMedian(median: Median, strokeWidth = DEFAULT_STROKE_WIDTH) {
  if (median.length < 2) {
    throw new Error('A median needs at least two points');
  }
  const half = strokeWidth / 2;
  const points = median.map(([x, y]) => ({ x, y }));
  const directions = points.slice(1).map((point, i) => unit(sub(point, points[i])));

  // offset of the outline's left edge from each median point
  const offsets = points.map((_, i) => {
    if (i === 0) return scale(leftNormal(directions[0]), half);
    if (i === points.length - 1) return scale(leftNormal(directions[i - 1]), half);
    const before = leftNormal(directions[i - 1]);
    const after = leftNormal(directions[i]);
    const miter = unit(add(before, after));
    return scale(miter, half / Math.max(dot(miter, after), 1 / MAX_MITER));
  });

  const left = points.map((point, i) => add(point, offsets[i]));
  const right = points.map((point, i) => sub(point, offsets[i]));

  // rounded cap: two quadratic curves bulging `half` beyond the median's end
  const cap = (from: Vec, to: Vec, end: Vec, direction: Vec) => {
    const reach = scale(direction, half);
    return `Q ${fmt(add(from, reach))} ${fmt(add(end, reach))} Q ${fmt(
      add(to, reach),
    )} ${fmt(to)}`;
  };
  const last = points.length - 1;
  const startDirection = scale(directions[0], -1);
  const endDirection = directions[last - 1];

  return [
    `M ${fmt(left[0])}`,
    ...left.slice(1).map((point) => `L ${fmt(point)}`),
    cap(left[last], right[last], points[last], endDirection),
    ...right
      .slice(0, last)
      .reverse()
      .map((point) => `L ${fmt(point)}`),
    cap(right[0], left[0], points[0], startDirection),
    'Z',
  ].join(' ');
}

/**
 * Inserts evenly spaced points so no two consecutive median points are further apart
 * than `maxSpacing`. Stroke matching measures distances to median *points*, and its
 * thresholds were tuned on data whose median points are typically 50–100 units apart.
 */
export function densifyMedian(median: Median, maxSpacing = MAX_MEDIAN_SPACING): Median {
  const dense = [median[0]];
  for (let i = 1; i < median.length; i++) {
    const [x0, y0] = median[i - 1];
    const [x1, y1] = median[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / maxSpacing));
    for (let s = 1; s <= steps; s++) {
      dense.push([
        Math.round(x0 + ((x1 - x0) * s) / steps),
        Math.round(y0 + ((y1 - y0) * s) / steps),
      ]);
    }
  }
  return dense;
}

/**
 * Builds character data from hand-authored medians: generates each stroke's outline
 * and densifies the medians for stroke matching.
 */
export function buildCharacterData(
  medians: Median[],
  strokeWidth = DEFAULT_STROKE_WIDTH,
): CharacterJson {
  return {
    strokes: medians.map((median) => outlineFromMedian(median, strokeWidth)),
    medians: medians.map((median) => densifyMedian(median)),
  };
}

/**
 * Median for an elliptical stroke (e.g. ㅇ). Angles are in degrees; 90 is the top, and
 * increasing angles run counterclockwise as seen on screen.
 * The default sweep stops just short of a full turn, so the ends meet without the median doubling back.
 */
export function ellipseMedian(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  { startAngle = 90, sweep = 355, segments = 24 } = {},
): Median {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const angle = ((startAngle + (sweep * i) / segments) * Math.PI) / 180;
    return [Math.round(cx + rx * Math.cos(angle)), Math.round(cy + ry * Math.sin(angle))];
  });
}

/** An axis-aligned target area; `bottom` < `top` since the y axis points up. */
export type Rect = { left: number; right: number; bottom: number; top: number };

const getBounds = (medians: Median[]) => {
  const points = medians.reduce<number[][]>((acc, median) => acc.concat(median), []);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

/**
 * Scales and moves medians so their bounding box fills `rect`. Each axis is scaled
 * independently, but one axis may be stretched at most `maxDistortion` times more than
 * the other (keeping e.g. ㅇ round); leftover space is split evenly. An axis without
 * extent (e.g. the width of ㅣ) is centred.
 * Also returns `scale`, the smaller of the two axis scales, i.e. how much the jamo shrank.
 */
export function fitMedians(
  medians: Median[],
  rect: Rect,
  maxDistortion = Infinity,
): { medians: Median[]; scale: number } {
  const { minX, maxX, minY, maxY } = getBounds(medians);
  const width = maxX - minX;
  const height = maxY - minY;
  const rectWidth = rect.right - rect.left;
  const rectHeight = rect.top - rect.bottom;

  let scaleX = width > 0 ? rectWidth / width : NaN;
  let scaleY = height > 0 ? rectHeight / height : NaN;
  if (isNaN(scaleX)) scaleX = isNaN(scaleY) ? 1 : scaleY;
  if (isNaN(scaleY)) scaleY = scaleX;
  scaleX = Math.min(scaleX, scaleY * maxDistortion);
  scaleY = Math.min(scaleY, scaleX * maxDistortion);

  const offsetX = rect.left + (rectWidth - width * scaleX) / 2;
  const offsetY = rect.bottom + (rectHeight - height * scaleY) / 2;
  return {
    medians: medians.map((median) =>
      median.map(([x, y]) => [
        Math.round(offsetX + (x - minX) * scaleX),
        Math.round(offsetY + (y - minY) * scaleY),
      ]),
    ),
    scale: Math.min(scaleX, scaleY),
  };
}

/**
 * Medians for two jamo squeezed horizontally side by side (e.g. ㄳ = ㄱ + ㅅ), left one
 * first. Each keeps its own height. `split` is the left jamo's share of the width.
 */
export function sideBySideMedians(
  leftMedians: Median[],
  rightMedians: Median[],
  { left = 140, right = 884, gap = 100, split = 0.5 } = {},
): Median[] {
  const available = right - left - gap;
  const squeezeInto = (medians: Median[], from: number, to: number) => {
    const { minY, maxY } = getBounds(medians);
    return fitMedians(medians, { left: from, right: to, bottom: minY, top: maxY })
      .medians;
  };
  const leftEnd = left + available * split;
  return squeezeInto(leftMedians, left, leftEnd).concat(
    squeezeInto(rightMedians, leftEnd + gap, right),
  );
}

/** Medians for a doubled (tense) consonant such as ㄲ: two copies of the single one. */
export function doubledMedians(
  medians: Median[],
  options?: { left?: number; right?: number; gap?: number },
) {
  return sideBySideMedians(medians, medians, options);
}
