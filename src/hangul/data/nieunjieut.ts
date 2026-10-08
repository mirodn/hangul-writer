import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import nieun from './nieun';
import jieut from './jieut';

/** ㄵ (nieunjieut, U+3135): consonant cluster, nieun then jieut side by side. */
export default buildCharacterData(sideBySideMedians(nieun.medians, jieut.medians));
