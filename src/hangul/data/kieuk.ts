import { buildCharacterData } from './strokeGeometry';

/** ㅋ (kieuk, U+314B): 2 strokes. */
export default buildCharacterData([
  // 1: ㄱ — right, then down with a slight leftward sweep
  [
    [200, 710],
    [780, 710],
    [780, 430],
    [770, 320],
    [748, 210],
    [705, 80],
  ],
  // 2: middle bar, left to right, rising slightly
  [
    [230, 380],
    [750, 420],
  ],
]);
