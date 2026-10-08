import { buildCharacterData } from './strokeGeometry';

/** ㅖ (ye, U+3156): 4 strokes — ㅕ + ㅣ. */
export default buildCharacterData([
  // 1: upper short bar, left to right
  [
    [260, 530],
    [490, 530],
  ],
  // 2: lower short bar, left to right
  [
    [260, 280],
    [490, 280],
  ],
  // 3: left vertical, top to bottom
  [
    [490, 760],
    [490, 20],
  ],
  // 4: right vertical, top to bottom
  [
    [730, 790],
    [730, -10],
  ],
]);
