import { buildCharacterData } from './strokeGeometry';

/** ㅟ (wi, U+315F): 3 strokes — ㅜ + ㅣ. */
export default buildCharacterData([
  // 1: ㅜ bar, left to right
  [
    [120, 520],
    [630, 520],
  ],
  // 2: ㅜ short vertical, down from the bar
  [
    [375, 520],
    [375, 100],
  ],
  // 3: ㅣ vertical, top to bottom
  [
    [720, 800],
    [720, -10],
  ],
]);
