// reverse/index.ts - Encodeur Texte Renversé

import { Char, toGraphemes } from '../../engine/text-model';
import { EncoderDef } from '../types';

/**
 * Renverse un texte en préservant la casse et la ponctuation
 * Les caractères alphanumériques sont renversés, mais la casse
 * et la position de la ponctuation sont conservées.
 */
function reverseCamouflaged(text: string): string {
  const graphemes = toGraphemes(text);

  // 1. Extraire tous les caractères alphanumériques en minuscules
  const alphanumChars: string[] = [];
  for (const g of graphemes) {
    const char = Char.fromChar(g);
    if (char.isLetterOrDigit) {
      alphanumChars.push(g.toLowerCase());
    }
  }

  // 2. Renverser la liste
  alphanumChars.reverse();

  // 3. Reconstruire le texte en préservant casse et ponctuation
  let alphaIndex = 0;
  const result: string[] = [];

  for (const g of graphemes) {
    const char = Char.fromChar(g);
    if (char.isLetterOrDigit) {
      const reversedChar = alphanumChars[alphaIndex];
      // Appliquer la casse originale
      result.push(char.isUppercase ? reversedChar.toUpperCase() : reversedChar.toLowerCase());
      alphaIndex++;
    } else {
      // Garder la ponctuation/espace telle quelle
      result.push(g);
    }
  }

  return result.join('');
}

/**
 * Renverse simplement tout le texte
 */
function reverseSimple(text: string): string {
  const graphemes = toGraphemes(text);
  return graphemes.reverse().join('');
}

export const reverseDef: EncoderDef = {
  id: 'reverse',
  name: 'Texte Renversé',
  description: 'Dernière lettre en premier',
  requires: { type: 'lettersAndDigits' },
  produces: { type: 'lettersAndDigits' },
  preprocess: (text: string, config?: Record<string, unknown>) => {
    const preserveCase = (config?.preserveCase as boolean) ?? true;

    if (preserveCase) {
      return reverseCamouflaged(text);
    } else {
      return reverseSimple(text);
    }
  },
  spacing: 'preserve',
  category: 'misc',
};
