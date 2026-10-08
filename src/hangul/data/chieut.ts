import { buildCharacterData } from './strokeGeometry';

/** ㅊ (chieut, U+314A): 3 strokes. */
export default buildCharacterData([
  // 1: short top bar, left to right
  [
    [430, 810],
    [600, 810],
  ],
  // 2: bar, then falling to the lower left
  [
    [220, 650],
    [770, 650],
    [600, 480],
    [420, 290],
    [190, 60],
  ],
  // 3: from the middle of stroke 2, falling to the lower right
  [
    [515, 390],
    [650, 230],
    [840, 60],
  ],
]);
