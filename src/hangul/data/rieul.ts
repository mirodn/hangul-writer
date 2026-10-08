import { buildCharacterData } from './strokeGeometry';

/** ㄹ (rieul, U+3139): 3 strokes. */
export default buildCharacterData([
  // 1: ㄱ — right, then down to the middle
  [
    [220, 730],
    [780, 730],
    [780, 420],
  ],
  // 2: middle bar, left to right
  [
    [240, 420],
    [780, 420],
  ],
  // 3: ㄴ — down, then right
  [
    [240, 420],
    [240, 70],
    [820, 70],
  ],
]);
