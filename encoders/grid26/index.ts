// grid26/index.ts - Grille 26 (images représentant les rangs 1-26)

import { EncoderDef } from '../types';

export const grid26Def: EncoderDef = {
  id: 'grid26',
  name: 'Grille 26',
  description: 'Images de grilles représentant les rangs A=1 à Z=26',
  requires: { type: 'letters' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'grid26',
    level: 'letter',
    fileNameTransform: ['letterToRank'],
  },
  category: 'visual',
  isCamouflage: true,
};
