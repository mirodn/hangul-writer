import { CharDataLoaderFn } from '../typings/types';
import hangulCharData from './data';
import { composeSyllable } from './syllable';

/**
 * Serves bundled jamo data and composes syllables (가–힣) on demand.
 * This is the default `charDataLoader`; pass your own to load other data.
 */
const hangulCharDataLoader: CharDataLoaderFn = (char, onLoad, onError) => {
  const data = hangulCharData[char] || composeSyllable(char);
  if (data) {
    onLoad(data);
  } else {
    onError(new Error(`No Hangul character data for "${char}"`));
  }
};

export default hangulCharDataLoader;
