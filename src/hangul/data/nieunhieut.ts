import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import nieun from './nieun';
import hieut from './hieut';

/** ㄶ (nieunhieut, U+3136): consonant cluster, nieun then hieut side by side. */
export default buildCharacterData(sideBySideMedians(nieun.medians, hieut.medians));
