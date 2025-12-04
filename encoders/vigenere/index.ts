// vigenere/index.ts - Encodeur Vigenère (Clef)

import { Message, TextSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

export const vigenereDef: EncoderDef = {
  id: 'vigenere',
  name: 'Vigenère',
  description: 'Clé de codage',
  requires: { type: 'letters' },
  produces: { type: 'letters' },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const keyRaw = (config?.key as string) ?? '';
    const isDecodingKey = (config?.isDecodingKey as boolean) ?? true;

    // Normaliser la clef : majuscules, lettres uniquement
    const key = keyRaw.toUpperCase().replace(/[^A-Z]/g, '');
    if (key.length === 0) {
      throw new Error('Veuillez choisir votre clef');
    }

    // Direction : -1 si clef de décodage (on inverse pour produire le texte codé)
    const direction = isDecodingKey ? -1 : 1;

    let letterIndex = 0;

    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);

      // Ne traiter que les lettres latines
      if (!char.baseLatinLetter) return;

      // Calculer le décalage depuis la clef
      const keyChar = key[letterIndex % key.length];
      const shift = direction * (keyChar.charCodeAt(0) - 65); // A=0, B=1, etc.

      // Appliquer le décalage
      const shifted = char.shifted(shift);

      letter.setSubLetters([new TextSubLetter(shifted.value)]);
      letterIndex++;
    });
  },
  spacing: 'preserve',
  category: 'shift',
};
