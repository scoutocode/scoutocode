// invert/index.ts - Encodeur Alphabet Inversé (A↔Z, B↔Y, etc.)

import { Message, TextSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

export const invertDef: EncoderDef = {
  id: 'invert',
  name: 'Alphabet Inversé',
  description: 'A↔Z, B↔Y, etc.',
  requires: { type: 'lettersAndDigits' },
  produces: { type: 'lettersAndDigits' },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const invertNumbers = (config?.invertNumbers as boolean) ?? true;

    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);

      // Inverser les lettres latines (A↔Z, B↔Y, etc.)
      if (char.baseLatinLetter) {
        const rank = char.alphabetRank;
        if (rank !== null) {
          // Inversion : A(1) ↔ Z(26), B(2) ↔ Y(25), etc.
          const invertedRank = 27 - rank;
          const inverted = Char.fromAlphabetRank(invertedRank, char.isUppercase);
          letter.setSubLetters([new TextSubLetter(inverted.value)]);
        }
        return;
      }

      // Inverser les chiffres si demandé (0↔9, 1↔8, etc.)
      if (invertNumbers && char.isDigit) {
        const code = char.value.charCodeAt(0);
        // 0-9 (48-57) → 9-0
        const invertedCode = 105 - code; // 48+57 = 105
        letter.setSubLetters([new TextSubLetter(String.fromCharCode(invertedCode))]);
      }
    });
  },
  spacing: 'preserve',
  category: 'shift',
};
