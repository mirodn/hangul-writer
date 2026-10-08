import { buildCharacterData } from './strokeGeometry';

/** ㅈ (jieut, U+3148): 2 strokes. */
export default buildCharacterData([
  // 1: top bar, then falling to the lower left
  [
    [220, 720],
    [770, 720],
    [600, 540],
    [420, 330],
    [190, 80],
  ],
  // 2: from the middle of stroke 1, falling to the lower right
  [
    [510, 430],
    [650, 270],
    [840, 80],
  ],
]);
