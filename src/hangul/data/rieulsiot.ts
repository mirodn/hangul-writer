import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import siot from './siot';

/** ㄽ (rieulsiot, U+313D): consonant cluster, rieul then siot side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, siot.medians));
