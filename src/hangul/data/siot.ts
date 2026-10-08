import { buildCharacterData } from './strokeGeometry';

/** ㅅ (siot, U+3145): 2 strokes. */
export default buildCharacterData([
  // 1: falling to the lower left
  [
    [520, 730],
    [480, 560],
    [400, 380],
    [300, 220],
    [180, 80],
  ],
  // 2: from the middle of stroke 1, falling to the lower right
  [
    [445, 470],
    [560, 330],
    [690, 190],
    [840, 80],
  ],
]);
