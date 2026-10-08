import { buildCharacterData } from './strokeGeometry';

/** ㅊ (chieut, U+314A): 4 strokes, print form: a short top stroke, a bar and ㅅ beneath. */
export default buildCharacterData([
  // 1: short top stroke, left to right
  [[430, 830], [600, 830]],
  // 2: bar, left to right
  [[220, 670], [800, 670]],
  // 3: from the middle of the bar, falling to the lower left
  [[512, 670], [470, 540], [390, 370], [290, 210], [180, 60]],
  // 4: from just below the start of stroke 3, falling to the lower right
  [[491, 605], [580, 430], [700, 250], [850, 60]],
]);
