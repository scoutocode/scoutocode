// morse/morse.camouflages.ts - Camouflages spécifiques au Morse

import { EncoderDef } from '../types';

export const MORSE_CAMOUFLAGES: EncoderDef[] = [
  {
    id: 'morse-stylized',
    name: 'Stylisé',
    description: 'Points et traits stylisés',
    requires: { type: 'twoSymbols' },
    produces: { type: 'twoSymbols', symbols: ['•', '⸺'] },
    symbolPair: { '.': '•', '-': '⸺' },
    isCamouflage: true,
    isDefaultCamouflage: true,
    cosmeticOnly: true,
    category: 'two-symbols',
    preview: ['•', '⸺'],
  },
  {
    id: 'morse-seems-binary',
    name: 'Apparence binaire',
    description: 'Remplace par 0 et 1',
    requires: { type: 'twoSymbols' },
    produces: { type: 'twoSymbols', symbols: ['0', '1'] },
    symbolPair: { '.': '0', '-': '1' },
    isCamouflage: true,
    cosmeticOnly: false,
    category: 'two-symbols',
    preview: ['0', '1'],
  },
  {
    id: 'morse-ti-ta',
    name: 'Ti / Ta',
    description: 'Ti pour les points, Ta pour les traits',
    requires: { type: 'twoSymbols' },
    produces: { type: 'symbols' },
    symbolPair: { '.': 'Ti', '-': 'Ta' },
    isCamouflage: true,
    cosmeticOnly: true,
    category: 'two-symbols',
    preview: ['Ti', 'Ta'],

    separatorLevel: 'letter',
    separatorSigns: ['/', '//', '///'],
  },
];

