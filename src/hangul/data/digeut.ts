import { buildCharacterData } from './strokeGeometry';

/** ㄷ (digeut, U+3137): 2 strokes. */
export default buildCharacterData([
  // 1: top bar, left to right
  [
    [220, 700],
    [800, 700],
  ],
  // 2: ㄴ — down, then right
  [
    [240, 700],
    [240, 90],
    [820, 90],
  ],
]);
