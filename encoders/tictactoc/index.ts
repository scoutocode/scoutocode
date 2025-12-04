// tictactoc/index.ts - Encodeur TicTacToc

import { EncoderDef } from '../types';

export const tictactocDef: EncoderDef = {
  id: 'tictactoc',
  name: 'TicTacToc',
  description: '',
  requires: { type: 'letters' },
  produces: { type: 'visual' },
  visualAssets: {
    folder: 'tictactoc',
  },
  spacing: 'separators',
  category: 'visual',
};
