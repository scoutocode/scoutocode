// morse/index.ts

import { Message, TextSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';
import { MORSE_CAMOUFLAGES } from './morse.camouflages';

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
  'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
};

/**
 * Intervertit deux symboles dans une chaîne
 */
function swapSymbols(text: string, symbol1: string, symbol2: string): string {
  const temp = '\u0000'; // caractère temporaire
  return text
    .replaceAll(symbol1, temp)
    .replaceAll(symbol2, symbol1)
    .replaceAll(temp, symbol2);
}

export const morseDef: EncoderDef = {
  id: 'morse',
  name: 'Morse',
  description: '',
  requires: { type: 'lettersAndDigits' },
  produces: { type: 'twoSymbols', symbols: ['.', '-'] },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const doSwap = (config?.swapSymbols as boolean) ?? false;

    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);
      const lookupKey = char.baseLatinLetterOrDigit?.toUpperCase();

      if (!lookupKey) return;

      let morse = MORSE_MAP[lookupKey];
      if (!morse) return;

      // Appliquer le swap si demandé
      if (doSwap) {
        morse = swapSymbols(morse, '.', '-');
      }

      letter.setSubLetters([...morse].map(symbol => new TextSubLetter(symbol)));
    });
  },
  spacing: 'separators',
  category: 'symbols',
  customCamouflages: MORSE_CAMOUFLAGES,
};
