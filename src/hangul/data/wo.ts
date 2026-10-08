import { buildCharacterData } from './strokeGeometry';

/** ㅝ (wo, U+315D): 4 strokes — ㅜ + ㅓ. */
export default buildCharacterData([
  // 1: ㅜ bar, left to right
  [
    [90, 520],
    [560, 520],
  ],
  // 2: ㅜ short vertical, down from the bar
  [
    [320, 520],
    [320, 100],
  ],
  // 3: ㅓ short bar, left to right, meeting the vertical
  [
    [470, 320],
    [730, 320],
  ],
  // 4: ㅓ vertical, top to bottom
  [
    [730, 800],
    [730, -10],
  ],
]);
