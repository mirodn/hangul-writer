import { buildCharacterData } from './strokeGeometry';

/** ㅞ (we, U+315E): 5 strokes — ㅜ + ㅔ. */
export default buildCharacterData([
  // 1: ㅜ bar, left to right
  [
    [70, 520],
    [470, 520],
  ],
  // 2: ㅜ short vertical, down from the bar
  [
    [270, 520],
    [270, 100],
  ],
  // 3: ㅔ short bar, left to right, meeting the left vertical
  [
    [400, 320],
    [600, 320],
  ],
  // 4: ㅔ left vertical, top to bottom
  [
    [600, 790],
    [600, 0],
  ],
  // 5: ㅔ right vertical, top to bottom
  [
    [810, 810],
    [810, -20],
  ],
]);
