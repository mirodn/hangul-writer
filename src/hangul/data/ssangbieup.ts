import { buildCharacterData, doubledMedians } from './strokeGeometry';
import bieup from './bieup';

/** ㅃ (ssangbieup, U+3143): 8 strokes — two narrow copies of the single consonant, left first. */
export default buildCharacterData(
  // wider gap than other doubles: ㅂ's verticals would otherwise sit too close to tell apart
  doubledMedians(bieup.medians, { left: 100, right: 924, gap: 200 }),
);
