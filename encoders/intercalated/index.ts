// intercalated/index.ts - Encodeur Lettres Intercalées

import { Message, Letter, WordToken } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

/**
 * Génère des lettres aléatoires
 */
function generateRandomLetters(count: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < count; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

/**
 * Génère des chiffres aléatoires
 */
function generateRandomDigits(count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Applique la casse appropriée au pattern
 */
function applyCaseToPattern(pattern: string, isUpperContext: boolean): string {
  return isUpperContext ? pattern.toUpperCase() : pattern.toLowerCase();
}

export const intercalatedDef: EncoderDef = {
  id: 'intercalated',
  name: 'Ajout de lettres parasites',
  description: '',
  requires: { type: 'lettersAndDigits' },
  produces: { type: 'lettersAndDigits' },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const useRandomLetters = (config?.useRandomLetters as boolean) ?? true;
    const randomCount = (config?.randomCount as number) ?? 1;
    const pattern = (config?.pattern as string) ?? 'X';

    message.traverseWords((word) => {
      const letters = word.getLetters();
      if (letters.length <= 1) return;

      const newLetters: Letter[] = [];

      for (let i = 0; i < letters.length; i++) {
        const currentLetter = letters[i];
        const currentRaw = currentLetter.getRawChar();

        // Ajouter la lettre originale
        newLetters.push(currentLetter);

        // Intercaler entre les lettres (pas après la dernière)
        if (i < letters.length - 1 && currentRaw) {
          const currentChar = Char.fromChar(currentRaw);
          const nextLetter = letters[i + 1];
          const nextRaw = nextLetter.getRawChar();
          const nextChar = nextRaw ? Char.fromChar(nextRaw) : null;

          let parasites: string;

          if (useRandomLetters) {
            // Mode aléatoire : chiffres entre deux chiffres, lettres sinon
            if (currentChar.isDigit && nextChar?.isDigit) {
              parasites = generateRandomDigits(randomCount);
            } else {
              parasites = generateRandomLetters(randomCount);
              // Adapter la casse au contexte : majuscule seulement si les DEUX lettres sont en majuscule
              if (currentChar.isUppercase && (nextChar?.isUppercase ?? false)) {
                parasites = parasites.toUpperCase();
              } else {
                parasites = parasites.toLowerCase();
              }
            }
          } else {
            // Mode manuel : utiliser le pattern
            if (currentChar.isLatinLetter && nextChar?.isLatinLetter) {
              // Entre deux lettres : adapter la casse
              const isUpperContext = currentChar.isUppercase && (nextChar?.isUppercase ?? false);
              parasites = applyCaseToPattern(pattern, isUpperContext);
            } else {
              parasites = pattern;
            }
          }

          // Créer une Letter pour chaque caractère parasite
          for (const p of parasites) {
            newLetters.push(new Letter(p));
          }
        }
      }

      word.setLetters(newLetters);
    });
  },
  spacing: 'preserve',
  category: 'misc',
};
