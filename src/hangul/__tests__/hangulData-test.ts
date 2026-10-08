import hangulCharData from '../data';
import parseCharData from '../../parseCharData';
import strokeMatches from '../../strokeMatches';
import { ellipseMedian } from '../data/strokeGeometry';
import { Point } from '../../typings/types';
import { BOUNDS, isInsidePolygon, pathToPolygon, sloppy, trace } from '../testUtils';

describe('Hangul character data', () => {
  Object.entries(hangulCharData).forEach(([char, data]) => {
    describe(char, () => {
      it('has one median per stroke outline', () => {
        expect(data.strokes.length).toBeGreaterThan(0);
        expect(data.medians.length).toBe(data.strokes.length);
      });

      it('keeps every outline and median point inside the character bounds', () => {
        const outlinePoints = data.strokes.map((path) => pathToPolygon(path));
        const medianPoints = data.medians.map((median) =>
          median.map(([x, y]) => ({ x, y })),
        );
        const points = ([] as Point[]).concat(...outlinePoints, ...medianPoints);
        points.forEach(({ x, y }) => {
          expect(x).toBeGreaterThanOrEqual(BOUNDS.minX);
          expect(x).toBeLessThanOrEqual(BOUNDS.maxX);
          expect(y).toBeGreaterThanOrEqual(BOUNDS.minY);
          expect(y).toBeLessThanOrEqual(BOUNDS.maxY);
        });
      });

      it('keeps each median inside its stroke outline', () => {
        data.strokes.forEach((path, strokeNum) => {
          const polygon = pathToPolygon(path);
          data.medians[strokeNum].forEach(([x, y]) => {
            expect(isInsidePolygon({ x, y }, polygon)).toBe(true);
          });
        });
      });

      it('parses into a Character', () => {
        const character = parseCharData(char, data);
        expect(character.symbol).toBe(char);
        expect(character.strokes.length).toBe(data.strokes.length);
      });
    });
  });
});

describe('Hangul stroke recognition', () => {
  Object.entries(hangulCharData).forEach(([char, data]) => {
    const character = parseCharData(char, data);
    const match = (points: Point[], strokeNum: number) =>
      strokeMatches({ points } as any, character, strokeNum, { isOutlineVisible: true });

    data.medians.forEach((median, strokeNum) => {
      describe(`${char} stroke ${strokeNum + 1}`, () => {
        it('accepts the stroke drawn along its median', () => {
          expect(match(trace(median), strokeNum)).toEqual({
            isMatch: true,
            meta: { isStrokeBackwards: false },
          });
        });

        it('accepts an imprecise version of the stroke', () => {
          expect(match(trace(sloppy(median)), strokeNum).isMatch).toBe(true);
        });

        it('rejects the stroke drawn backwards and flags it', () => {
          expect(match(trace([...median].reverse()), strokeNum)).toEqual({
            isMatch: false,
            meta: { isStrokeBackwards: true },
          });
        });

        data.medians.forEach((otherMedian, otherNum) => {
          if (otherNum === strokeNum) return;
          it(`rejects stroke ${otherNum + 1} drawn in its place`, () => {
            expect(match(trace(otherMedian), strokeNum).isMatch).toBe(false);
          });
        });
      });
    });
  });
});

describe('ㄱ stroke recognition', () => {
  const character = parseCharData('ㄱ', hangulCharData['ㄱ']);
  const match = (points: Point[]) =>
    strokeMatches({ points } as any, character, 0, { isOutlineVisible: true });

  it('accepts a clean right-then-down stroke', () => {
    const result = match(
      trace([
        [210, 700],
        [775, 700],
        [775, 430],
        [700, 80],
      ]),
    );
    expect(result).toEqual({ isMatch: true, meta: { isStrokeBackwards: false } });
  });

  it('accepts a sloppy, slightly offset stroke', () => {
    const result = match(
      trace([
        [250, 660],
        [740, 690],
        [790, 400],
        [740, 130],
      ]),
    );
    expect(result.isMatch).toBe(true);
  });

  it('accepts a straight vertical without the leftward sweep', () => {
    expect(
      match(
        trace([
          [210, 700],
          [775, 700],
          [775, 80],
        ]),
      ).isMatch,
    ).toBe(true);
  });

  it('rejects the stroke drawn backwards and flags it', () => {
    const result = match(
      trace([
        [700, 80],
        [775, 430],
        [775, 700],
        [210, 700],
      ]),
    );
    expect(result).toEqual({ isMatch: false, meta: { isStrokeBackwards: true } });
  });

  it('rejects only the horizontal part', () => {
    expect(
      match(
        trace([
          [210, 700],
          [775, 700],
        ]),
      ).isMatch,
    ).toBe(false);
  });

  it('rejects only the vertical part', () => {
    expect(
      match(
        trace([
          [775, 700],
          [700, 80],
        ]),
      ).isMatch,
    ).toBe(false);
  });

  it('rejects ㄴ (down, then right)', () => {
    expect(
      match(
        trace([
          [230, 700],
          [230, 100],
          [780, 100],
        ]),
      ).isMatch,
    ).toBe(false);
  });
});

describe('ㅇ stroke recognition', () => {
  const character = parseCharData('ㅇ', hangulCharData['ㅇ']);
  const match = (points: Point[]) =>
    strokeMatches({ points } as any, character, 0, { isOutlineVisible: true });

  it('accepts a fully closed circle drawn counterclockwise from the top', () => {
    const circle = ellipseMedian(512, 400, 290, 310, { sweep: 360, segments: 48 });
    expect(match(trace(circle)).isMatch).toBe(true);
  });

  it('rejects a clockwise circle and flags it as backwards', () => {
    const circle = ellipseMedian(512, 400, 290, 310, { sweep: -360, segments: 48 });
    expect(match(trace(circle))).toEqual({
      isMatch: false,
      meta: { isStrokeBackwards: true },
    });
  });
});
