import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import pieup from './pieup';

/** ㄿ (rieulpieup, U+313F): consonant cluster, rieul then pieup side by side. */
export default buildCharacterData(
  // ㅍ gets most of the width: at half width its two posts sit too close to tell apart
  sideBySideMedians(rieul.medians, pieup.medians, { left: 100, right: 924, split: 0.38 }),
);
