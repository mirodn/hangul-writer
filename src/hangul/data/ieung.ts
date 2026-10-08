import { buildCharacterData, ellipseMedian } from './strokeGeometry';

/** ㅇ (ieung, U+3147): 1 stroke. */
export default buildCharacterData([
  // circle from the top, counterclockwise
  ellipseMedian(512, 400, 300, 255),
]);
