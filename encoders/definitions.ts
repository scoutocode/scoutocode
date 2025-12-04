// encoders/definitions.ts - Agrégation de toutes les définitions d'encodeurs

import { EncoderDef } from './types';
import { binaryDef } from './binary';
import { morseDef } from './morse';
import { caesarDef } from './caesar';
import { numericCaesarDef } from './numeric-caesar';
import { phoneDef } from './phone';
import { vigenereDef } from './vigenere';
import { invertDef } from './invert';
import { intercalatedDef } from './intercalated';
import { reverseDef } from './reverse';
import { starsDef } from './stars';
import { mandarinDef } from './mandarin';
import { templarsDef } from './templars';
import { tictactocDef } from './tictactoc';
import { grid26Def } from './grid26';
import { ALL_CAMOUFLAGES } from './camouflages';

// ===========================================================================
// Liste de tous les encodeurs
// ===========================================================================

export const ENCODER_DEFS: EncoderDef[] = [
  // Encodeurs principaux
  binaryDef,
  morseDef,
  caesarDef,
  numericCaesarDef,
  phoneDef,
  vigenereDef,
  invertDef,
  intercalatedDef,
  reverseDef,
  starsDef,
  mandarinDef,
  templarsDef,
  tictactocDef,
  grid26Def,
  // Camouflages (incluant roman-digits)
  ...ALL_CAMOUFLAGES,
];

/**
 * Récupère une définition d'encodeur par son ID
 */
export function getEncoderDef(id: string): EncoderDef | undefined {
  return ENCODER_DEFS.find(e => e.id === id);
}

/**
 * Liste tous les IDs d'encodeurs
 */
export function listEncoderIds(): string[] {
  return ENCODER_DEFS.map(e => e.id);
}
