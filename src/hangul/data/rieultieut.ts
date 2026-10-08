import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import rieul from './rieul';
import tieut from './tieut';

/** ㄾ (rieultieut, U+313E): consonant cluster, rieul then tieut side by side. */
export default buildCharacterData(sideBySideMedians(rieul.medians, tieut.medians));
