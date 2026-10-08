import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import giyeok from './giyeok';

/** ㄺ (rieulgiyeok, U+313A): consonant cluster, rieul then giyeok side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, giyeok.medians));
