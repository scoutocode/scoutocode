// caesar.presets.ts - Presets pour le codeur César (décalage)

export interface CaesarPreset {
  id: string;
  name: string;
  origin: string;      // Lettre source (ex: "A" dans "A vaut K")
  destination: string; // Lettre destination (ex: "K")
}

/**
 * Calcule le shift à partir d'un preset
 */
export function computeShift(preset: CaesarPreset): number {
  return preset.destination.toUpperCase().charCodeAt(0) - preset.origin.toUpperCase().charCodeAt(0);
}

/**
 * Calcule le shift à partir de deux lettres
 */
export function computeShiftFromLetters(origin: string, destination: string): number {
  return destination.toUpperCase().charCodeAt(0) - origin.toUpperCase().charCodeAt(0);
}

/**
 * Retourne la lettre décalée
 */
export function getShiftedLetter(letter: string, shift: number): string {
  const code = letter.toUpperCase().charCodeAt(0);
  if (code < 65 || code > 90) return letter;
  let newCode = code + shift;
  while (newCode < 65) newCode += 26;
  while (newCode > 90) newCode -= 26;
  return String.fromCharCode(newCode);
}

/**
 * Presets César
 * Le shift est calculé comme: destination - origin
 */
export const CAESAR_PRESETS: CaesarPreset[] = [
  {
    id: 'a-vote',
    name: 'A voté - A vaut T',
    origin: 'A',
    destination: 'T',
  },
  {
    id: 'acheter',
    name: 'Acheter - HT',
    origin: 'H',
    destination: 'T',
  },
  {
    id: 'age',
    name: 'Agé - AG',
    origin: 'A',
    destination: 'G',
  },
  {
    id: 'avocat',
    name: 'Avocat - A vaut K',
    origin: 'A',
    destination: 'K',
  },
  {
    id: 'casse',
    name: 'Cassé - KC',
    origin: 'K',
    destination: 'C',
  },
  {
    id: 'chaos',
    name: 'Chaos - KO',
    origin: 'K',
    destination: 'O',
  },
  {
    id: 'deesse',
    name: 'Déesse - DS',
    origin: 'D',
    destination: 'S',
  },
  {
    id: 'eiffel',
    name: 'Eiffel - FL',
    origin: 'F',
    destination: 'L',
  },
  {
    id: 'happe',
    name: 'Happé - AP',
    origin: 'A',
    destination: 'P',
  },
  {
    id: 'helene',
    name: 'Hélène - LN',
    origin: 'L',
    destination: 'N',
  },
  {
    id: 'herge',
    name: 'Hergé - RG',
    origin: 'R',
    destination: 'G',
  },
  {
    id: 'herve',
    name: 'Hervé - RV',
    origin: 'R',
    destination: 'V',
  },
  {
    id: 'jy-vais',
    name: "J'y vais - JV",
    origin: 'J',
    destination: 'V',
  },
  {
    id: 'oeufs-pourris',
    name: 'Œufs pourris - E pour I',
    origin: 'E',
    destination: 'I',
  },
  {
    id: 'pete',
    name: 'Pété - PT',
    origin: 'P',
    destination: 'T',
  },
  {
    id: 'rot13',
    name: 'Rot13 - Code qui s\'annule en le refaisant',
    origin: 'A',
    destination: 'N',
  },
];

/**
 * Trouve un preset par son ID
 */
export function getPresetById(id: string): CaesarPreset | undefined {
  return CAESAR_PRESETS.find(p => p.id === id);
}

/**
 * Preset enrichi avec le shift calculé (pour les formulaires)
 */
export interface CaesarPresetWithShift extends CaesarPreset {
  shift: number;
  label: string;  // pour affichage dans select
  [key: string]: unknown;  // index signature pour compatibilité avec Record
}

/**
 * Retourne les presets avec shift calculé, pour le form schema
 */
export function getPresetsForForm(): CaesarPresetWithShift[] {
  return CAESAR_PRESETS.map(p => ({
    ...p,
    shift: computeShift(p),
    label: p.name,
  }));
}

/**
 * Retourne les options de select pour le formulaire
 */
export function getPresetSelectOptions(): { value: string; label: string }[] {
  return CAESAR_PRESETS.map(p => ({
    value: p.id,
    label: p.name,
  }));
}
