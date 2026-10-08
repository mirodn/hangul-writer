import { buildCharacterData } from './strokeGeometry';

/** ㅈ (jieut, U+3148): 3 strokes, print form: a bar with ㅅ beneath. */
export default buildCharacterData([
  // 1: top bar, left to right
  [[220, 720], [800, 720]],
  // 2: from the middle of the bar, falling to the lower left
  [[512, 720], [470, 580], [390, 400], [290, 230], [180, 80]],
  // 3: from just below the start of stroke 2, falling to the lower right
  [[491, 650], [580, 470], [700, 280], [850, 80]],
]);
