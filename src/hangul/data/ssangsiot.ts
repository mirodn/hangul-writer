import { buildCharacterData, doubledMedians } from './strokeGeometry';
import siot from './siot';

/** ㅆ (ssangsiot, U+3146): 4 strokes — two narrow copies of the single consonant, left first. */
export default buildCharacterData(doubledMedians(siot.medians));
