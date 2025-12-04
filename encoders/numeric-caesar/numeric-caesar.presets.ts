// numeric-caesar.presets.ts - Presets pour les codes numériques

export interface NumericCaesarPreset {
  id: string;
  name: string;
  origin: string;      // Lettre source (ex: "K" dans "Cassis K=6")
  destNumber: number;  // Nombre destination (ex: 6)
}

/**
 * Calcule le shift à partir d'un preset numérique
 * Le shift fait que origin devient la lettre correspondant à destNumber
 */
export function computeShift(preset: NumericCaesarPreset): number {
  const originCode = preset.origin.toUpperCase().charCodeAt(0) - 64; // A=1, B=2, etc.
  return preset.destNumber - originCode;
}

/**
 * Calcule le shift à partir d'une lettre et d'un nombre
 */
export function computeShiftFromLetterAndNumber(origin: string, destNumber: number): number {
  const originCode = origin.toUpperCase().charCodeAt(0) - 64; // A=1, B=2, etc.
  return destNumber - originCode;
}

/**
 * Presets Codes Numériques
 */
export const NUMERIC_CAESAR_PRESETS: NumericCaesarPreset[] = [
  {
    id: 'numbers-only',
    name: 'Conversion sans décalage - A=1',
    origin: 'A',
    destNumber: 1,
  },
  {
    id: 'cassis',
    name: 'Cassis - K=6',
    origin: 'K',
    destNumber: 6,
  },
  {
    id: 'cassette',
    name: 'Cassette - K=7',
    origin: 'K',
    destNumber: 7,
  },
  {
    id: 'detroit',
    name: 'Détroit - D=3',
    origin: 'D',
    destNumber: 3,
  },
  {
    id: 'indienne',
    name: 'Indienne - 1 dit N',
    origin: 'N',
    destNumber: 1,
  },
  {
    id: 'sizaine',
    name: 'Sizaine - 6=N',
    origin: 'N',
    destNumber: 6,
  },
];

/**
 * Trouve un preset par son ID
 */
export function getPresetById(id: string): NumericCaesarPreset | undefined {
  return NUMERIC_CAESAR_PRESETS.find(p => p.id === id);
}

/**
 * Preset enrichi avec le shift calculé (pour les formulaires)
 */
export interface NumericCaesarPresetWithShift extends NumericCaesarPreset {
  shift: number;
  label: string;
  [key: string]: unknown;
}

/**
 * Retourne les presets avec shift calculé, pour le form schema
 */
export function getPresetsForForm(): NumericCaesarPresetWithShift[] {
  return NUMERIC_CAESAR_PRESETS.map(p => ({
    ...p,
    shift: computeShift(p),
    label: p.name,
  }));
}
