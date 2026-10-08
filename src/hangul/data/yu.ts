import { buildCharacterData } from './strokeGeometry';

/** ㅠ (yu, U+3160): 3 strokes. */
export default buildCharacterData([
  // 1: long bar, left to right
  [
    [180, 560],
    [840, 560],
  ],
  // 2: left short vertical, down from the bar
  [
    [390, 560],
    [390, 150],
  ],
  // 3: right short vertical, down from the bar
  [
    [634, 560],
    [634, 150],
  ],
]);
