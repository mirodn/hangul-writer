import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import mieum from './mieum';

/** ㄻ (rieulmieum, U+313B): consonant cluster, rieul then mieum side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, mieum.medians));
