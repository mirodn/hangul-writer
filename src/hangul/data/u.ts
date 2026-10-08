import { buildCharacterData } from './strokeGeometry';

/** ㅜ (u, U+315C): 2 strokes. */
export default buildCharacterData([
  // 1: long bar, left to right
  [
    [180, 560],
    [840, 560],
  ],
  // 2: short vertical, down from the bar
  [
    [512, 560],
    [512, 150],
  ],
]);
