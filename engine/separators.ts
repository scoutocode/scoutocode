// separators.ts - Configuration des séparateurs par défaut selon le type produit

import type { MessageClass } from './encoders/types';

// ===========================================================================
// Types
// ===========================================================================

export interface SeparatorsConfig {
  subLetter: string;
  letter: string;
  word: string;
  phrase: string;
}

/** Niveau de départ des séparateurs */
export type SeparatorLevel = 'subLetter' | 'letter' | 'word';

// ===========================================================================
// Constantes
// ===========================================================================

// Espace insécable (non-breaking space) pour éviter les retours à la ligne avant les signes
const NBSP = '\u00A0';

/** Signes par défaut pour les séparateurs */
export const DEFAULT_SIGNS = ['/', '//', '///'];

// ===========================================================================
// Construction des séparateurs
// ===========================================================================

/**
 * Formate un signe avec NBSP avant et espace après.
 * Si le signe est vide ou uniquement des espaces, le retourne tel quel.
 */
function formatSign(sign: string): string {
  if (sign.trim() === '') return sign;
  return `${NBSP}${sign} `;
}

/**
 * Formate le signe de phrase avec NBSP avant et \n après.
 * Si le signe est vide ou uniquement des espaces, le retourne tel quel.
 */
function formatPhraseSign(sign: string): string {
  if (sign.trim() === '') return sign;
  return `${NBSP}${sign}\n`;
}

/**
 * Construit un SeparatorsConfig à partir de signes et d'un niveau de départ.
 *
 * @param signs - Liste de signes (ex: ['/', '//', '///'])
 * @param level - Niveau de départ ('subLetter', 'letter', ou 'word')
 * @returns SeparatorsConfig avec les signes assignés aux bons niveaux
 *
 * Exemple avec signs=['/', '//', '///'] et level='letter':
 * - subLetter: '' (vide, avant le niveau de départ)
 * - letter: '⍽/ ' (premier signe)
 * - word: '⍽// ' (deuxième signe)
 * - phrase: '⍽///\n' (troisième signe avec \n)
 */
export function buildSeparators(
  signs: string[] = DEFAULT_SIGNS,
  level: SeparatorLevel = 'letter'
): SeparatorsConfig {
  const levels: SeparatorLevel[] = ['subLetter', 'letter', 'word'];
  const startIndex = levels.indexOf(level);

  // Niveaux avant le niveau de départ sont vides
  // Niveaux à partir du niveau de départ utilisent les signes
  const result: SeparatorsConfig = {
    subLetter: '',
    letter: '',
    word: '',
    phrase: '',
  };

  let signIndex = 0;

  for (let i = 0; i < levels.length; i++) {
    const currentLevel = levels[i];
    if (i >= startIndex && signIndex < signs.length) {
      result[currentLevel] = formatSign(signs[signIndex]);
      signIndex++;
    }
  }

  // Phrase utilise le signe suivant (ou le dernier disponible) avec \n
  const phraseSign = signs[signIndex] ?? signs[signs.length - 1] + '/';
  result.phrase = formatPhraseSign(phraseSign);

  return result;
}

// ===========================================================================
// Presets de séparateurs (pour compatibilité)
// ===========================================================================

/**
 * Presets de séparateurs pré-construits.
 * @deprecated Préférer buildSeparators(signs, level) pour plus de flexibilité
 */
export const SEPARATORS = {
  /** Slashes depuis subLetter */
  slashesFromSubLetter: buildSeparators(DEFAULT_SIGNS, 'subLetter'),

  /** Slashes depuis letter */
  slashesFromLetter: buildSeparators(DEFAULT_SIGNS, 'letter'),

  /** Slashes depuis word */
  slashesFromWord: buildSeparators(DEFAULT_SIGNS, 'word'),

  /** Espaces entre lettres, slashes entre mots (cas spécial) */
  spacedWithSlashes: {
    subLetter: '',
    letter: ' ',
    word: `${NBSP}/ `,
    phrase: `${NBSP}//\n`,
  } as SeparatorsConfig,

  /** Tout collé sauf phrases */
  compact: {
    subLetter: '',
    letter: '',
    word: ' ',
    phrase: '\n',
  } as SeparatorsConfig,
} as const;

// ===========================================================================
// Spacing par défaut selon le type produit
// ===========================================================================

export type Spacing = 'preserve' | 'separators';

export const DEFAULT_SPACING: Record<MessageClass['type'] | '_default', Spacing> = {
  letters: 'preserve',
  digits: 'separators',
  lettersAndDigits: 'preserve',
  twoSymbols: 'separators',
  symbols: 'separators',
  visual: 'separators',
  _default: 'separators',
};

/**
 * Retourne le spacing par défaut pour un type de message
 */
export function getSpacingForType(type?: MessageClass['type']): Spacing {
  if (type && type in DEFAULT_SPACING) {
    return DEFAULT_SPACING[type];
  }
  return DEFAULT_SPACING._default;
}

// ===========================================================================
// Séparateurs par défaut selon le type produit (legacy)
// ===========================================================================

export const DEFAULT_SEPARATORS: Record<MessageClass['type'] | '_default', SeparatorsConfig> = {
  visual: SEPARATORS.slashesFromWord,
  symbols: SEPARATORS.spacedWithSlashes,
  digits: SEPARATORS.spacedWithSlashes,
  letters: SEPARATORS.spacedWithSlashes,
  lettersAndDigits: SEPARATORS.spacedWithSlashes,
  twoSymbols: SEPARATORS.spacedWithSlashes,
  _default: SEPARATORS.slashesFromLetter,
};

/**
 * Retourne les séparateurs par défaut pour un type de message
 */
export function getSeparatorsForType(type?: MessageClass['type']): SeparatorsConfig {
  if (type && type in DEFAULT_SEPARATORS) {
    return DEFAULT_SEPARATORS[type];
  }
  return DEFAULT_SEPARATORS._default;
}

/**
 * Résout les séparateurs finaux en combinant :
 * 1. Les séparateurs explicites (prioritaires)
 * 2. Les défauts selon le type produit
 */
export function resolveSeparators(
  explicit?: Partial<SeparatorsConfig>,
  producedType?: MessageClass['type']
): SeparatorsConfig {
  const defaults = getSeparatorsForType(producedType);
  return {
    subLetter: explicit?.subLetter ?? defaults.subLetter,
    letter: explicit?.letter ?? defaults.letter,
    word: explicit?.word ?? defaults.word,
    phrase: explicit?.phrase ?? defaults.phrase,
  };
}
