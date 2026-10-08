import hangulCharData from '../data';
import { composeSyllable, decomposeSyllable, layoutSyllable } from '../syllable';
import parseCharData from '../../parseCharData';
import strokeMatches from '../../strokeMatches';
import { Point } from '../../typings/types';
import { BOUNDS, sloppy, trace } from '../testUtils';

const ALL_SYLLABLES = Array.from({ length: 11172 }, (_, i) =>
  String.fromCharCode(0xac00 + i),
);

/** Every initial and vowel combination, with no final and with a range of final shapes. */
const LAYOUT_SAMPLE = ALL_SYLLABLES.filter((char) => {
  const { final } = decomposeSyllable(char)!;
  return final === null || 'ㄱㄹㅂㅇㅎㄲㄺㄼㅄ'.includes(final);
});

const distanceToSegment = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq
    ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq))
    : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/** Smallest distance between two polylines (sampled finely enough for this purpose). */
const polylineDistance = (first: number[][], second: number[][]) => {
  const points = trace(first, 10);
  const segments = second.slice(1).map((end, i) => [second[i], end]);
  let min = Infinity;
  points.forEach((p) =>
    segments.forEach(([[ax, ay], [bx, by]]) => {
      min = Math.min(min, distanceToSegment(p, { x: ax, y: ay }, { x: bx, y: by }));
    }),
  );
  return min;
};

describe('decomposeSyllable', () => {
  it('splits syllables into initial, vowel and final', () => {
    expect(decomposeSyllable('가')).toEqual({ initial: 'ㄱ', vowel: 'ㅏ', final: null });
    expect(decomposeSyllable('한')).toEqual({ initial: 'ㅎ', vowel: 'ㅏ', final: 'ㄴ' });
    expect(decomposeSyllable('뷁')).toEqual({ initial: 'ㅂ', vowel: 'ㅞ', final: 'ㄺ' });
    expect(decomposeSyllable('힣')).toEqual({ initial: 'ㅎ', vowel: 'ㅣ', final: 'ㅎ' });
  });

  it('returns null for anything that is not a single syllable', () => {
    [
      '',
      'A',
      'ㄱ',
      '我',
      '가나',
      String.fromCharCode(0xac00 - 1),
      String.fromCharCode(0xd7a4),
    ].forEach((char) => expect(decomposeSyllable(char)).toBeNull());
  });
});

describe('composeSyllable', () => {
  it('returns null for non-syllables', () => {
    expect(composeSyllable('A')).toBeNull();
  });

  it('builds every syllable from its jamo, in order, within the character bounds', () => {
    const problems: string[] = [];
    ALL_SYLLABLES.forEach((char) => {
      const { initial, vowel, final } = decomposeSyllable(char)!;
      const data = composeSyllable(char)!;
      const expectedStrokes = [initial, vowel, final]
        .filter((jamo): jamo is string => !!jamo)
        .reduce((sum, jamo) => sum + hangulCharData[jamo].strokes.length, 0);
      if (
        data.strokes.length !== expectedStrokes ||
        data.medians.length !== expectedStrokes
      ) {
        problems.push(
          `${char}: ${data.strokes.length} strokes, expected ${expectedStrokes}`,
        );
      }
      data.medians.forEach((median) =>
        median.forEach(([x, y]) => {
          if (x < BOUNDS.minX || x > BOUNDS.maxX || y < BOUNDS.minY || y > BOUNDS.maxY) {
            problems.push(`${char}: point ${x},${y} out of bounds`);
          }
        }),
      );
    });
    expect(problems).toEqual([]);
  });

  it('keeps strokes of different jamo from touching', () => {
    const problems: string[] = [];
    LAYOUT_SAMPLE.forEach((char) => {
      const { parts, strokeWidth } = layoutSyllable(char)!;
      // a mixed vowel's two parts belong together, so compare by role
      const roles = ['initial', 'vowel', 'final'].map((role) =>
        parts
          .filter((part) => part.role === role)
          .reduce<number[][][]>((acc, part) => acc.concat(part.medians), []),
      );
      roles.forEach((first, i) =>
        roles.slice(i + 1).forEach((second) => {
          first.forEach((a) =>
            second.forEach((b) => {
              const gap = polylineDistance(a, b) - strokeWidth;
              if (gap < 10) problems.push(`${char}: gap ${Math.round(gap)}`);
            }),
          );
        }),
      );
    });
    expect(problems).toEqual([]);
  });
});

describe('syllable stroke recognition', () => {
  // one of each layout, with and without finals, plus some crowded blocks
  Array.from(
    '가각개객고곡과곽괘괙구국궈궤귀그긔한글빨닭뷁홍쌍앉않훑의꽉웬왕짧밟흙',
  ).forEach((char) => {
    const data = composeSyllable(char)!;
    const character = parseCharData(char, data);
    const match = (points: Point[], strokeNum: number) =>
      strokeMatches({ points } as any, character, strokeNum, { isOutlineVisible: true });

    it(`${char}: accepts each stroke drawn along its median, in order`, () => {
      data.medians.forEach((median, strokeNum) => {
        expect([strokeNum, match(trace(median), strokeNum)]).toEqual([
          strokeNum,
          { isMatch: true, meta: { isStrokeBackwards: false } },
        ]);
      });
    });

    it(`${char}: accepts imprecise versions of each stroke`, () => {
      data.medians.forEach((median, strokeNum) => {
        expect([strokeNum, match(trace(sloppy(median)), strokeNum).isMatch]).toEqual([
          strokeNum,
          true,
        ]);
      });
    });

    it(`${char}: flags strokes drawn backwards`, () => {
      data.medians.forEach((median, strokeNum) => {
        expect([strokeNum, match(trace([...median].reverse()), strokeNum)]).toEqual([
          strokeNum,
          { isMatch: false, meta: { isStrokeBackwards: true } },
        ]);
      });
    });

    it(`${char}: rejects a later stroke drawn too early`, () => {
      data.medians.forEach((median, strokeNum) => {
        data.medians.slice(strokeNum + 1).forEach((later, offset) => {
          expect([
            strokeNum,
            strokeNum + 1 + offset,
            match(trace(later), strokeNum).isMatch,
          ]).toEqual([strokeNum, strokeNum + 1 + offset, false]);
        });
      });
    });
  });
});
