// binary/index.ts

import { Message, TextSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';
import { BINARY_CAMOUFLAGES } from './binary.camouflages';

// Générer la table A=1, B=10, C=11, ..., Z=11010
const BINARY_MAP: Record<string, string> = {};
for (let i = 0; i < 26; i++) {
  const letter = String.fromCharCode(65 + i); // A-Z
  const rank = i + 1; // 1-26
  BINARY_MAP[letter] = rank.toString(2);
}

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

export const binaryDef: EncoderDef = {
  id: 'binary',
  name: 'Binaire',
  description: '',
  requires: { type: 'letters' },
  produces: { type: 'twoSymbols', symbols: ['0', '1'] },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const doSwap = (config?.swapSymbols as boolean) ?? false;

    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);
      const lookupKey = char.baseLatinLetterOrDigit?.toUpperCase();

      if (!lookupKey) return;

      let binary = BINARY_MAP[lookupKey];
      if (!binary) return;

      // Appliquer le swap si demandé
      if (doSwap) {
        binary = swapSymbols(binary, '0', '1');
      }

      letter.setSubLetters([...binary].map(symbol => new TextSubLetter(symbol)));
    });
  },
  category: 'digits',
  customCamouflages: BINARY_CAMOUFLAGES,
};
