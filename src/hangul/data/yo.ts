import { buildCharacterData } from './strokeGeometry';

/** ㅛ (yo, U+315B): 3 strokes. */
export default buildCharacterData([
  // 1: left short vertical, down onto the bar
  [
    [390, 560],
    [390, 250],
  ],
  // 2: right short vertical, down onto the bar
  [
    [634, 560],
    [634, 250],
  ],
  // 3: long bar, left to right
  [
    [180, 230],
    [840, 230],
  ],
]);
