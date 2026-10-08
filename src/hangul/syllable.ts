import { CharacterJson } from '../typings/types';
import hangulCharData from './data';
import { buildCharacterData, fitMedians, Median, Rect } from './data/strokeGeometry';

// Unicode composes every syllable as 0xAC00 + (initial * 21 + vowel) * 28 + final
const SYLLABLE_START = 0xac00;
const SYLLABLE_COUNT = 11172;
const VOWEL_COUNT = 21;
const FINAL_COUNT = 28;
const INITIALS = Array.from('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ');
const VOWELS = Array.from('ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ');
const FINALS = [''].concat(
  Array.from('ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'),
);

/**
 * Stroke width at full jamo size. Each syllable uses one width, scaled down with its most
 * shrunken jamo so crowded blocks (e.g. 훑) get thinner strokes, as in real typefaces.
 */
const BASE_STROKE_WIDTH = 80;
const MIN_STROKE_WIDTH = 36;
const MAX_STROKE_WIDTH = 64;
/** How much more one axis of a jamo may be stretched than the other when fitted. */
const MAX_DISTORTION = 1.5;
/** Finals sit in a wide, flat strip, so they may be flattened further, except round ones. */
const FINAL_MAX_DISTORTION = 2.5;
const ROUND_JAMO = 'ㅇㅎ';

export type SyllableParts = { initial: string; vowel: string; final: string | null };

/** Splits a precomposed syllable (가–힣) into its jamo, or returns null for anything else. */
export function decomposeSyllable(char: string): SyllableParts | null {
  const index = char.length === 1 ? char.charCodeAt(0) - SYLLABLE_START : -1;
  if (index < 0 || index >= SYLLABLE_COUNT) {
    return null;
  }
  return {
    initial: INITIALS[Math.floor(index / (VOWEL_COUNT * FINAL_COUNT))],
    vowel: VOWELS[Math.floor(index / FINAL_COUNT) % VOWEL_COUNT],
    final: FINALS[index % FINAL_COUNT] || null,
  };
}

/**
 * Where the vowel sits relative to the initial consonant:
 * - vertical: to its right (가); "wide" vowels have two verticals (개)
 * - horizontal: below it (고)
 * - mixed: wrapping around it, below and to the right (과)
 */
type VowelShape = 'vertical' | 'verticalWide' | 'horizontal' | 'mixed' | 'mixedWide';

const VOWEL_SHAPES: Record<string, VowelShape> = {
  ㅏ: 'vertical',
  ㅑ: 'vertical',
  ㅓ: 'vertical',
  ㅕ: 'vertical',
  ㅣ: 'vertical',
  ㅐ: 'verticalWide',
  ㅒ: 'verticalWide',
  ㅔ: 'verticalWide',
  ㅖ: 'verticalWide',
  ㅗ: 'horizontal',
  ㅛ: 'horizontal',
  ㅜ: 'horizontal',
  ㅠ: 'horizontal',
  ㅡ: 'horizontal',
  ㅘ: 'mixed',
  ㅚ: 'mixed',
  ㅝ: 'mixed',
  ㅟ: 'mixed',
  ㅢ: 'mixed',
  ㅙ: 'mixedWide',
  ㅞ: 'mixedWide',
};

/** Mixed vowels are placed as two parts: the horizontal one below the initial, then the vertical one. */
const MIXED_VOWEL_PARTS: Record<string, string[]> = {
  ㅘ: ['ㅗ', 'ㅏ'],
  ㅙ: ['ㅗ', 'ㅐ'],
  ㅚ: ['ㅗ', 'ㅣ'],
  ㅝ: ['ㅜ', 'ㅓ'],
  ㅞ: ['ㅜ', 'ㅔ'],
  ㅟ: ['ㅜ', 'ㅣ'],
  ㅢ: ['ㅡ', 'ㅣ'],
};

/** Finals made of two side-by-side consonants get a wider area. */
const WIDE_FINALS = 'ㄲㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄㅆ';

const rect = (left: number, right: number, bottom: number, top: number): Rect => ({
  left,
  right,
  bottom,
  top,
});

/**
 * Target areas for the strokes' centrelines (in the 1024-unit, y-up character space).
 * Neighbouring areas are kept ~120 units apart so strokes of different jamo don't touch.
 * `vowel` lists one area per vowel part (two for mixed vowels).
 */
type Layout = { initial: Rect; vowel: Rect[] };

const LAYOUTS: Record<VowelShape, { open: Layout; closed: Layout }> = {
  vertical: {
    open: { initial: rect(90, 470, 120, 780), vowel: [rect(590, 900, -60, 840)] },
    closed: { initial: rect(90, 470, 360, 800), vowel: [rect(590, 900, 290, 840)] },
  },
  verticalWide: {
    open: { initial: rect(90, 420, 120, 780), vowel: [rect(540, 920, -60, 840)] },
    closed: { initial: rect(90, 420, 360, 800), vowel: [rect(540, 920, 290, 840)] },
  },
  horizontal: {
    open: { initial: rect(170, 854, 450, 830), vowel: [rect(90, 934, -50, 330)] },
    closed: { initial: rect(190, 834, 580, 830), vowel: [rect(90, 934, 290, 460)] },
  },
  mixed: {
    open: {
      initial: rect(110, 560, 480, 830),
      vowel: [rect(90, 620, -40, 360), rect(740, 900, -60, 840)],
    },
    closed: {
      initial: rect(110, 560, 620, 830),
      vowel: [rect(90, 620, 290, 500), rect(740, 900, 290, 840)],
    },
  },
  mixedWide: {
    open: {
      initial: rect(100, 470, 480, 830),
      vowel: [rect(80, 540, -40, 360), rect(640, 930, -60, 840)],
    },
    closed: {
      initial: rect(100, 470, 620, 830),
      vowel: [rect(80, 540, 290, 500), rect(640, 930, 290, 840)],
    },
  },
};

const FINAL_AREA = rect(170, 854, -70, 170);
const WIDE_FINAL_AREA = rect(110, 914, -70, 170);

type JamoData = Readonly<Record<string, CharacterJson>>;

/** One placed jamo of a syllable; mixed vowels contribute two parts (e.g. ㅘ → ㅗ, ㅏ). */
export type PlacedJamo = {
  jamo: string;
  role: 'initial' | 'vowel' | 'final';
  medians: Median[];
};
export type SyllableLayout = { parts: PlacedJamo[]; strokeWidth: number };

/**
 * Places a syllable's jamo in a block layout, in standard stroke order: initial, vowel,
 * then final. Returns null for non-syllables.
 */
export function layoutSyllable(
  char: string,
  jamoData: JamoData = hangulCharData,
): SyllableLayout | null {
  const syllable = decomposeSyllable(char);
  if (!syllable) {
    return null;
  }
  const { initial, vowel, final } = syllable;
  const layout = LAYOUTS[VOWEL_SHAPES[vowel]][final ? 'closed' : 'open'];

  const parts: PlacedJamo[] = [];
  let minScale = 1;
  const place = (
    jamo: string,
    role: PlacedJamo['role'],
    area: Rect,
    maxDistortion = MAX_DISTORTION,
  ) => {
    const fitted = fitMedians(jamoData[jamo].medians, area, maxDistortion);
    parts.push({ jamo, role, medians: fitted.medians });
    minScale = Math.min(minScale, fitted.scale);
  };

  place(initial, 'initial', layout.initial);
  (MIXED_VOWEL_PARTS[vowel] || [vowel]).forEach((part, i) =>
    place(part, 'vowel', layout.vowel[i]),
  );
  if (final) {
    const area = WIDE_FINALS.includes(final) ? WIDE_FINAL_AREA : FINAL_AREA;
    const maxDistortion = ROUND_JAMO.includes(final)
      ? MAX_DISTORTION
      : FINAL_MAX_DISTORTION;
    place(final, 'final', area, maxDistortion);
  }

  const strokeWidth = Math.max(
    MIN_STROKE_WIDTH,
    Math.min(MAX_STROKE_WIDTH, Math.round(BASE_STROKE_WIDTH * minScale)),
  );
  return { parts, strokeWidth };
}

/** Builds stroke data for a precomposed syllable (가–힣), or returns null for anything else. */
export function composeSyllable(
  char: string,
  jamoData: JamoData = hangulCharData,
): CharacterJson | null {
  const layout = layoutSyllable(char, jamoData);
  if (!layout) {
    return null;
  }
  const medians = layout.parts.reduce<Median[]>(
    (acc, part) => acc.concat(part.medians),
    [],
  );
  return buildCharacterData(medians, layout.strokeWidth);
}
