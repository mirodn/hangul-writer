import { buildCharacterData } from './strokeGeometry';

/** ㅗ (o, U+3157): 2 strokes. */
export default buildCharacterData([
  // 1: short vertical, down onto the bar
  [
    [512, 560],
    [512, 250],
  ],
  // 2: long bar, left to right
  [
    [180, 230],
    [840, 230],
  ],
]);
