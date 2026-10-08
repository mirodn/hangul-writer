import { buildCharacterData } from './strokeGeometry';

/** ㅏ (a, U+314F): 2 strokes. */
export default buildCharacterData([
  // 1: long vertical, top to bottom
  [
    [440, 760],
    [440, 20],
  ],
  // 2: short bar to the right
  [
    [440, 420],
    [680, 420],
  ],
]);
