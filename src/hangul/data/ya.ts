import { buildCharacterData } from './strokeGeometry';

/** ㅑ (ya, U+3151): 3 strokes. */
export default buildCharacterData([
  // 1: long vertical, top to bottom
  [
    [420, 760],
    [420, 20],
  ],
  // 2: upper short bar to the right
  [
    [420, 530],
    [660, 530],
  ],
  // 3: lower short bar to the right
  [
    [420, 280],
    [660, 280],
  ],
]);
