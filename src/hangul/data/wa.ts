import { buildCharacterData } from './strokeGeometry';

/** ㅘ (wa, U+3158): 4 strokes — ㅗ + ㅏ. */
export default buildCharacterData([
  // 1: ㅗ short vertical, down onto the bar
  [
    [340, 500],
    [340, 270],
  ],
  // 2: ㅗ bar, left to right
  [
    [110, 250],
    [640, 250],
  ],
  // 3: ㅏ vertical, top to bottom
  [
    [690, 800],
    [690, -10],
  ],
  // 4: ㅏ short bar to the right
  [
    [690, 420],
    [890, 420],
  ],
]);
