import { buildCharacterData, sideBySideMedians } from './strokeGeometry';
import bieup from './bieup';
import siot from './siot';

/** ㅄ (bieupsiot, U+3144): consonant cluster, bieup then siot side by side. */
export default buildCharacterData(sideBySideMedians(bieup.medians, siot.medians));
