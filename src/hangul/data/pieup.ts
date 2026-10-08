import { buildCharacterData } from './strokeGeometry';

/** ㅍ (pieup, U+314D): 4 strokes. */
export default buildCharacterData([
  // 1: top bar, left to right
  [
    [200, 720],
    [820, 720],
  ],
  // 2: left post, top to bottom
  [
    [370, 720],
    [390, 100],
  ],
  // 3: right post, top to bottom
  [
    [650, 720],
    [630, 100],
  ],
  // 4: bottom bar, left to right
  [
    [180, 90],
    [840, 90],
  ],
]);
