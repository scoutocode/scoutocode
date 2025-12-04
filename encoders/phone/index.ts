// phone/index.ts - Encodeur Clavier Portable

import { EncoderDef } from '../types';

// Table de conversion téléphone portable (T9)
// A-C sur 2, D-F sur 3, G-I sur 4, J-L sur 5, M-O sur 6, P-S sur 7, T-V sur 8, W-Z sur 9
const PHONE_TABLE: Record<string, string> = {
  'A': '2', 'B': '22', 'C': '222',
  'D': '3', 'E': '33', 'F': '333',
  'G': '4', 'H': '44', 'I': '444',
  'J': '5', 'K': '55', 'L': '555',
  'M': '6', 'N': '66', 'O': '666',
  'P': '7', 'Q': '77', 'R': '777', 'S': '7777',
  'T': '8', 'U': '88', 'V': '888',
  'W': '9', 'X': '99', 'Y': '999', 'Z': '9999',
};

export const phoneDef: EncoderDef = {
  id: 'phone',
  name: 'Clavier de portable',
  description: 'Touches de téléphone antique',
  requires: { type: 'letters' },
  produces: { type: 'digits', range: { min: 2, max: 9999 } },
  table: {
    level: 'letter',
    replacements: PHONE_TABLE,
    normalize: { uppercase: true, baseLatinLetter: true },
  },
  spacing: 'separators',
  category: 'digits',
};
