// camouflages/letters.ts - Camouflages pour la classe letters

import { Message } from '../../engine/types';
import { EncoderDef } from '../types';

// =============================================================================
// Camouflages de casse
// =============================================================================

export const lowercaseDef: EncoderDef = {
  id: 'lowercase',
  name: 'Minuscules',
  description: 'Convertit toutes les lettres en minuscules',
  requires: { type: ['letters', 'lettersAndDigits'] },
  produces: { type: 'letters' },
  encode: (message: Message) => {
    message.traverseSubLetters((sub) => {
      if (sub.kind === 'text') {
        sub.setValue(sub.value.toLowerCase());
      }
    });
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: true,
  category: 'letters',
  preview: 'abc',
};

export const uppercaseDef: EncoderDef = {
  id: 'uppercase',
  name: 'Majuscules',
  description: 'Convertit toutes les lettres en majuscules',
  requires: { type: ['letters', 'lettersAndDigits'] },
  produces: { type: 'letters' },
  encode: (message: Message) => {
    message.traverseSubLetters((sub) => {
      if (sub.kind === 'text') {
        sub.setValue(sub.value.toUpperCase());
      }
    });
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: true,
  category: 'letters',
  preview: 'ABC',
};

// Note: Les encodeurs visuels pour letters (stars, mandarin, templars, tictactoc)
// sont déjà définis comme encodeurs principaux.
// Ils pourraient aussi être marqués isCamouflage: true si besoin.

// Note: L'app originale avait un camouflage "normal" (pas de transformation).
// C'était une solution UX pour permettre de revenir à "pas de camouflage".
// Côté UI, cette option devrait être gérée comme un choix "Aucun" dans le sélecteur,
// pas comme un encodeur à part entière.

// =============================================================================
// Export groupé
// =============================================================================

export const LETTER_CAMOUFLAGES: EncoderDef[] = [
  lowercaseDef,
  uppercaseDef,
];
