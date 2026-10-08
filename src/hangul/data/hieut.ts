import { buildCharacterData, ellipseMedian } from './strokeGeometry';

/** ㅎ (hieut, U+314E): 3 strokes. */
export default buildCharacterData([
  // 1: short top bar, left to right
  [
    [430, 830],
    [600, 830],
  ],
  // 2: long bar, left to right
  [
    [220, 690],
    [800, 690],
  ],
  // 3: circle from the top, counterclockwise
  ellipseMedian(512, 330, 230, 210),
]);
