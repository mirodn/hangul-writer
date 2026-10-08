import { buildCharacterData } from './strokeGeometry';

/** ㅌ (tieut, U+314C): 3 strokes. */
export default buildCharacterData([
  // 1: top bar, left to right
  [
    [220, 730],
    [800, 730],
  ],
  // 2: middle bar, left to right
  [
    [260, 410],
    [780, 410],
  ],
  // 3: ㄴ — down, then right
  [
    [240, 730],
    [240, 70],
    [820, 70],
  ],
]);
