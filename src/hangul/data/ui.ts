import { buildCharacterData } from './strokeGeometry';

/** ㅢ (ui, U+3162): 2 strokes — ㅡ + ㅣ. */
export default buildCharacterData([
  // 1: ㅡ bar, left to right
  [
    [120, 380],
    [640, 380],
  ],
  // 2: ㅣ vertical, top to bottom
  [
    [730, 800],
    [730, -10],
  ],
]);
