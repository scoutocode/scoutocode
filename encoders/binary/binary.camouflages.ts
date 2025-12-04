// binary/binary.camouflages.ts - Camouflages spécifiques au Binaire

import { EncoderDef } from '../types';

export const BINARY_CAMOUFLAGES: EncoderDef[] = [
  {
    id: 'binary-enclosed',
    name: 'Entourés',
    description: 'Chiffres entourés',
    requires: { type: 'twoSymbols' },
    produces: { type: 'symbols' },
    symbolPair: { '0': '0️⃣', '1': '1️⃣' },
    isCamouflage: true,
    cosmeticOnly: true,
    category: 'two-symbols',
    preview: ['0️⃣', '1️⃣'],
  },
  {
    id: 'binary-seems-morse',
    name: 'Apparence morse',
    description: 'Remplace par des points et traits',
    requires: { type: 'twoSymbols' },
    produces: { type: 'twoSymbols', symbols: ['.', '-'] },
    symbolPair: { '0': '.', '1': '-' },
    isCamouflage: true,
    cosmeticOnly: false,
    category: 'two-symbols',
    preview: ['.', '-'],
  },
];
