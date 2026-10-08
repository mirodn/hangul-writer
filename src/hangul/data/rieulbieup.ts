import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import bieup from './bieup';

/** ㄼ (rieulbieup, U+313C): consonant cluster, rieul then bieup side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, bieup.medians));
