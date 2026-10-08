import { buildCharacterData, doubledMedians } from './strokeGeometry';
import jieut from './jieut';

/** ㅉ (ssangjieut, U+3149): 4 strokes — two narrow copies of the single consonant, left first. */
export default buildCharacterData(doubledMedians(jieut.medians));
