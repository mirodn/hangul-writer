import { buildCharacterData } from './strokeGeometry';

/** ㅚ (oe, U+315A): 3 strokes — ㅗ + ㅣ. */
export default buildCharacterData([
  // 1: ㅗ short vertical, down onto the bar
  [
    [370, 500],
    [370, 270],
  ],
  // 2: ㅗ bar, left to right
  [
    [130, 250],
    [650, 250],
  ],
  // 3: ㅣ vertical, top to bottom
  [
    [720, 800],
    [720, -10],
  ],
]);
