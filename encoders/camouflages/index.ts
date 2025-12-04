// camouflages/index.ts - Export de tous les camouflages

import { EncoderDef } from '../types';

// Camouflages par classe
export * from './digits';
export * from './letters';
export * from './two-symbols';

// Import des listes pour l'agrégation
import { DIGIT_CAMOUFLAGES } from './digits';
import { LETTER_CAMOUFLAGES } from './letters';
import { TWO_SYMBOLS_CAMOUFLAGES } from './two-symbols';

// Liste complète de tous les camouflages
export const ALL_CAMOUFLAGES: EncoderDef[] = [
  ...DIGIT_CAMOUFLAGES,
  ...LETTER_CAMOUFLAGES,
  ...TWO_SYMBOLS_CAMOUFLAGES,
];
