// numeric-caesar/index.ts - Codes numériques (décalage + conversion en nombres)

import { Message, TextSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

export * from './numeric-caesar.presets';

export const numericCaesarDef: EncoderDef = {
  id: 'numeric-caesar',
  name: 'Conversion en nombres et décalage',
  description: '',
  requires: { type: 'letters' },
  produces: { type: 'digits', range: { min: 1, max: 26 } },
  encode: (message: Message, config?: Record<string, unknown>) => {
    if (config?.shift === undefined) {
      throw new Error('Veuillez choisir un décalage');
    }
    const shift = config.shift as number;

    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);

      // Vérifier que c'est une lettre latine
      if (!char.baseLatinLetter) return;

      // Décaler la lettre
      const shifted = char.shifted(shift);

      // Convertir en nombre (A=1, B=2, etc.)
      const number = shifted.alphabetRank;
      if (number === null) return;

      // Remplacer par le nombre en string
      const numStr = number.toString();
      letter.setSubLetters([...numStr].map(d => new TextSubLetter(d)));
    });
  },
  spacing: 'separators',
  category: 'digits',
};
