import { CharDataLoaderFn } from '../typings/types';
import hangulCharData from './data';
import { composeSyllable } from './syllable';

/**
 * A `charDataLoader` that serves bundled jamo data and composes syllables (가–힣) on demand,
 * instead of fetching from the Hanzi CDN. Drop-in compatible with HanziWriter's option.
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
