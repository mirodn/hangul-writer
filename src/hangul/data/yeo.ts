import { buildCharacterData } from './strokeGeometry';

/** ㅕ (yeo, U+3155): 3 strokes. */
export default buildCharacterData([
  // 1: upper short bar, left to right
  [
    [340, 530],
    [600, 530],
  ],
  // 2: lower short bar, left to right
  [
    [340, 280],
    [600, 280],
  ],
  // 3: long vertical, top to bottom
  [
    [600, 760],
    [600, 20],
  ],
]);
