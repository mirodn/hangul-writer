import { buildCharacterData, doubledMedians } from './strokeGeometry';
import giyeok from './giyeok';

/** ㄲ (ssanggiyeok, U+3132): 2 strokes — two narrow copies of the single consonant, left first. */
export default buildCharacterData(doubledMedians(giyeok.medians));
