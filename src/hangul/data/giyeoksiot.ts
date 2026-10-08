import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import giyeok from './giyeok';
import siot from './siot';

/** ㄳ (giyeoksiot, U+3133): consonant cluster, giyeok then siot side by side. */
export default buildCharacterData(sideBySideMedians(giyeok.medians, siot.medians));
