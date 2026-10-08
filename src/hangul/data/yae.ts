import { buildCharacterData } from './strokeGeometry';

/** ㅒ (yae, U+3152): 4 strokes — ㅑ + ㅣ. */
export default buildCharacterData([
  // 1: left vertical, top to bottom
  [
    [360, 760],
    [360, 20],
  ],
  // 2: upper short bar, left to right
  [
    [360, 530],
    [640, 530],
  ],
  // 3: lower short bar, left to right
  [
    [360, 280],
    [640, 280],
  ],
  // 4: right vertical, top to bottom
  [
    [640, 790],
    [640, -10],
  ],
]);
