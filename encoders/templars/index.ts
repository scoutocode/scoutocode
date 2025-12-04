// templars/index.ts - Encodeur Templiers

import { EncoderDef } from '../types';

export const templarsDef: EncoderDef = {
  id: 'templars',
  name: 'Templiers',
  description: '',
  requires: { type: 'letters' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'templars',
  },
  spacing: 'separators',
  category: 'visual',
};
