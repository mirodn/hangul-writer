import { buildCharacterData } from './strokeGeometry';

/** ㅂ (bieup, U+3142): 4 strokes. */
export default buildCharacterData([
  // 1: left side, top to bottom
  [
    [240, 730],
    [240, 70],
  ],
  // 2: right side, top to bottom
  [
    [780, 730],
    [780, 70],
  ],
  // 3: middle bar, left to right
  [
    [240, 400],
    [780, 400],
  ],
  // 4: bottom bar, left to right
  [
    [240, 70],
    [780, 70],
  ],
]);
