import { buildCharacterData } from './strokeGeometry';

/** ㅙ (wae, U+3159): 5 strokes — ㅗ + ㅐ. */
export default buildCharacterData([
  // 1: ㅗ short vertical, down onto the bar
  [
    [290, 500],
    [290, 270],
  ],
  // 2: ㅗ bar, left to right
  [
    [80, 250],
    [540, 250],
  ],
  // 3: ㅐ left vertical, top to bottom
  [
    [590, 780],
    [590, 10],
  ],
  // 4: ㅐ short bar between the verticals
  [
    [590, 420],
    [800, 420],
  ],
  // 5: ㅐ right vertical, top to bottom
  [
    [800, 810],
    [800, -20],
  ],
]);
