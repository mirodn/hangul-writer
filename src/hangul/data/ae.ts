import { buildCharacterData } from './strokeGeometry';

/** ㅐ (ae, U+3150): 3 strokes — ㅏ + ㅣ. */
export default buildCharacterData([
  // 1: left vertical, top to bottom
  [
    [360, 760],
    [360, 20],
  ],
  // 2: short bar from the left vertical to the right one
  [
    [360, 420],
    [640, 420],
  ],
  // 3: right vertical, top to bottom
  [
    [640, 790],
    [640, -10],
  ],
]);
