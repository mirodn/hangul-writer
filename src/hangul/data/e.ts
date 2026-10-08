import { buildCharacterData } from './strokeGeometry';

/** ㅔ (e, U+3154): 3 strokes — ㅓ + ㅣ. */
export default buildCharacterData([
  // 1: short bar, left to right, meeting the left vertical
  [
    [270, 420],
    [500, 420],
  ],
  // 2: left vertical, top to bottom
  [
    [500, 760],
    [500, 20],
  ],
  // 3: right vertical, top to bottom
  [
    [730, 790],
    [730, -10],
  ],
]);
