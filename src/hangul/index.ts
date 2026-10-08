import HanziWriter from '../HanziWriter';
import { HanziWriterOptions } from '../typings/types';
import hangulCharDataLoader from './hangulCharDataLoader';
import hangulCharData from './data';
import { composeSyllable, decomposeSyllable } from './syllable';

/** Same as `HanziWriter.create`, preconfigured to load bundled Hangul character data. */
export function create(
  element: string | HTMLElement,
  character: string,
  options: Partial<HanziWriterOptions> = {},
) {
  return HanziWriter.create(element, character, {
    charDataLoader: hangulCharDataLoader,
    ...options,
  });
}

export {
  HanziWriter,
  hangulCharDataLoader,
  hangulCharData,
  composeSyllable,
  decomposeSyllable,
};
