import { buildCharacterData } from './strokeGeometry';

/** ㅅ (siot, U+3145): 2 strokes, an inverted V. */
export default buildCharacterData([
  // 1: from the apex, falling to the lower left
  [[512, 740], [470, 600], [390, 420], [290, 240], [180, 90]],
  // 2: from just below the apex, falling to the lower right
  [[491, 670], [580, 480], [700, 290], [850, 90]],
]);
