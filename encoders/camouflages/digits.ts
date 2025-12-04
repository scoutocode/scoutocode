// camouflages/digits.ts - Camouflages pour la classe digits

import { EncoderDef } from '../types';

// =============================================================================
// Camouflages de substitution
// =============================================================================

export const emojiDigitsDef: EncoderDef = {
  id: 'emoji-digits',
  name: 'Chiffres Entourés',
  description: 'Remplace les chiffres par des émojis entourés',
  requires: { type: 'digits' },
  produces: { type: 'symbols' },
  table: {
    level: 'subletter',
    replacements: {
      '0': '0️⃣',
      '1': '1️⃣',
      '2': '2️⃣',
      '3': '3️⃣',
      '4': '4️⃣',
      '5': '5️⃣',
      '6': '6️⃣',
      '7': '7️⃣',
      '8': '8️⃣',
      '9': '9️⃣',
    },
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: true,
  category: 'digits',
  preview: '1️⃣2️⃣',
};

export const clockDef: EncoderDef = {
  id: 'clock',
  name: 'Horloge',
  description: 'Remplace les chiffres par des émojis horloge',
  requires: { type: 'digits', range: { min: 0, max: 9 } },
  produces: { type: 'symbols' },
  table: {
    level: 'subletter',
    replacements: {
      '0': '🕛', // 12h = 0
      '1': '🕐',
      '2': '🕑',
      '3': '🕒',
      '4': '🕓',
      '5': '🕔',
      '6': '🕕',
      '7': '🕖',
      '8': '🕗',
      '9': '🕘',
    },
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: false,
  category: 'digits',
  preview: '🕐🕑',
};

export const alphabetAJDef: EncoderDef = {
  id: 'alphabet-A-J',
  name: '0-9 en A-J',
  description: 'Remplace les chiffres 0-9 par les lettres A-J',
  requires: { type: 'digits', range: { min: 0, max: 9 } },
  produces: { type: 'letters' },
  table: {
    level: 'subletter',
    replacements: {
      '0': 'A',
      '1': 'B',
      '2': 'C',
      '3': 'D',
      '4': 'E',
      '5': 'F',
      '6': 'G',
      '7': 'H',
      '8': 'I',
      '9': 'J',
    },
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: false,
  category: 'digits',
  preview: ['0→A', '9→J'],
};

const ROMAN_MAP: Record<string, string> = {
  '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
  '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
  '11': 'XI', '12': 'XII', '13': 'XIII', '14': 'XIV', '15': 'XV',
  '16': 'XVI', '17': 'XVII', '18': 'XVIII', '19': 'XIX', '20': 'XX',
  '21': 'XXI', '22': 'XXII', '23': 'XXIII', '24': 'XXIV', '25': 'XXV',
  '26': 'XXVI',
};

export const romanDigitsDef: EncoderDef = {
  id: 'roman-digits',
  name: 'Chiffres romains',
  description: 'Convertit les nombres 1-26 en chiffres romains',
  requires: { type: 'digits', range: { min: 1, max: 26 } },
  produces: { type: 'letters' },
  table: {
    level: 'letter',
    replacements: ROMAN_MAP,
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: true,
  category: 'digits',
  preview: 'VI',
};

// =============================================================================
// Camouflages visuels
// =============================================================================

export const gridDef: EncoderDef = {
  id: 'grid',
  name: 'Grille',
  description: 'Affiche les chiffres dans une grille visuelle',
  requires: { type: 'digits' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'grid',
    level: 'subletter',
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: false,
  category: 'visual',
  preview: '⊞',
};

export const polygonsDef: EncoderDef = {
  id: 'polygons',
  name: 'Polygones',
  description: 'Affiche les chiffres sous forme de polygones',
  requires: { type: 'digits' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'polygons',
    level: 'subletter',
  },
  isPrimary: false,
  isCamouflage: true,
  cosmeticOnly: false,
  category: 'visual',
  preview: '△▢',
};

// =============================================================================
// Export groupé
// =============================================================================

export const DIGIT_CAMOUFLAGES: EncoderDef[] = [
  emojiDigitsDef,
  clockDef,
  alphabetAJDef,
  romanDigitsDef,
  gridDef,
  polygonsDef,
];
