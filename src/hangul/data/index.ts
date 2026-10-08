import { CharacterJson } from '../../typings/types';
import giyeok from './giyeok';
import nieun from './nieun';
import digeut from './digeut';
import rieul from './rieul';
import mieum from './mieum';
import bieup from './bieup';
import siot from './siot';
import ieung from './ieung';
import jieut from './jieut';
import chieut from './chieut';
import kieuk from './kieuk';
import tieut from './tieut';
import pieup from './pieup';
import hieut from './hieut';
import a from './a';
import ya from './ya';
import eo from './eo';
import yeo from './yeo';
import o from './o';
import yo from './yo';
import u from './u';
import yu from './yu';
import eu from './eu';
import i from './i';
import ssanggiyeok from './ssanggiyeok';
import ssangdigeut from './ssangdigeut';
import ssangbieup from './ssangbieup';
import ssangsiot from './ssangsiot';
import ssangjieut from './ssangjieut';
import ae from './ae';
import yae from './yae';
import e from './e';
import ye from './ye';
import wa from './wa';
import wae from './wae';
import oe from './oe';
import wo from './wo';
import we from './we';
import wi from './wi';
import ui from './ui';
import giyeoksiot from './giyeoksiot';
import nieunjieut from './nieunjieut';
import nieunhieut from './nieunhieut';
import rieulgiyeok from './rieulgiyeok';
import rieulmieum from './rieulmieum';
import rieulbieup from './rieulbieup';
import rieulsiot from './rieulsiot';
import rieultieut from './rieultieut';
import rieulpieup from './rieulpieup';
import rieulhieut from './rieulhieut';
import bieupsiot from './bieupsiot';

/**
 * Registry of bundled Hangul character data, keyed by the character itself.
 * Jamo use the Hangul Compatibility Jamo block (U+3130–U+318F), which is what keyboards produce.
 * To add a character: create a data module next to this file and register it here.
 */
const hangulCharData: Readonly<Record<string, CharacterJson>> = {
  // basic consonants
  ㄱ: giyeok,
  ㄴ: nieun,
  ㄷ: digeut,
  ㄹ: rieul,
  ㅁ: mieum,
  ㅂ: bieup,
  ㅅ: siot,
  ㅇ: ieung,
  ㅈ: jieut,
  ㅊ: chieut,
  ㅋ: kieuk,
  ㅌ: tieut,
  ㅍ: pieup,
  ㅎ: hieut,
  // basic vowels
  ㅏ: a,
  ㅑ: ya,
  ㅓ: eo,
  ㅕ: yeo,
  ㅗ: o,
  ㅛ: yo,
  ㅜ: u,
  ㅠ: yu,
  ㅡ: eu,
  ㅣ: i,
  // double (tense) consonants
  ㄲ: ssanggiyeok,
  ㄸ: ssangdigeut,
  ㅃ: ssangbieup,
  ㅆ: ssangsiot,
  ㅉ: ssangjieut,
  // compound vowels
  ㅐ: ae,
  ㅒ: yae,
  ㅔ: e,
  ㅖ: ye,
  ㅘ: wa,
  ㅙ: wae,
  ㅚ: oe,
  ㅝ: wo,
  ㅞ: we,
  ㅟ: wi,
  ㅢ: ui,
  // consonant clusters (only used as final consonants)
  ㄳ: giyeoksiot,
  ㄵ: nieunjieut,
  ㄶ: nieunhieut,
  ㄺ: rieulgiyeok,
  ㄻ: rieulmieum,
  ㄼ: rieulbieup,
  ㄽ: rieulsiot,
  ㄾ: rieultieut,
  ㄿ: rieulpieup,
  ㅀ: rieulhieut,
  ㅄ: bieupsiot,
};

export default hangulCharData;
