import { buildCharacterData } from './strokeGeometry';

/** ㅁ (mieum, U+3141): 3 strokes. */
export default buildCharacterData([
  // 1: left side, top to bottom
  [
    [230, 700],
    [230, 80],
  ],
  // 2: ㄱ — top, then right side down
  [
    [230, 700],
    [790, 700],
    [790, 80],
  ],
  // 3: bottom bar, left to right
  [
    [230, 80],
    [790, 80],
  ],
]);
