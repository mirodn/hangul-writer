import { buildCharacterData, doubledMedians } from './strokeGeometry';
import digeut from './digeut';

/** ㄸ (ssangdigeut, U+3138): 4 strokes — two narrow copies of the single consonant, left first. */
export default buildCharacterData(doubledMedians(digeut.medians));
