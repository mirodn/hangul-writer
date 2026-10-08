import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import hieut from './hieut';

/** ㅀ (rieulhieut, U+3140): consonant cluster, rieul then hieut side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, hieut.medians));
