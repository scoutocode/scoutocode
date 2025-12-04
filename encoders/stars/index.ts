// stars/index.ts - Encodeur Code des Étoiles

import { EncoderDef } from '../types';

export const starsDef: EncoderDef = {
  id: 'stars',
  name: 'Étoiles',
  description: '',
  requires: { type: 'letters' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'stars',
  },
  spacing: 'separators',
  category: 'visual',
  helpText: 'Comptez le nombre de sommets pour trouver la lettre. Seule exception : A est un cercle.',
};
