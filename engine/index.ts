// index.ts - API publique du moteur Scoutocode
//
// Ce fichier définit ce qui est accessible aux consommateurs.
// Tout ce qui n'est pas exporté ici est considéré comme interne.

// =============================================================================
// Parsing et rendu
// =============================================================================

export { parseText, renderMessage, debugMessage } from './parser';
export type { RenderOptions, RenderOutput, RenderFormat, RenderSeparators } from './parser';

// Séparateurs et spacing
export { SEPARATORS, DEFAULT_SEPARATORS, getSeparatorsForType, resolveSeparators } from './separators';
export { DEFAULT_SPACING, getSpacingForType } from './separators';
export type { SeparatorsConfig, Spacing } from './separators';

// =============================================================================
// Exécution des encodeurs
// =============================================================================

export { runEncoder, getCompatibleCamouflages, getCompatibleCamouflagesForEncoder, getDefaultCamouflage } from '../encoders';

// =============================================================================
// Registry des encodeurs (lecture)
// =============================================================================

export { ENCODER_DEFS, ENCODER_REGISTRY, getEncoder, listEncoders } from '../encoders';

// =============================================================================
// Types essentiels
// =============================================================================

// Message et sa structure
export {
  Message,
  Phrase,
  WordToken,
  RawToken,
  Letter,
  TextSubLetter,
  ImageSubLetter
} from './types';

export type {
  SubLetter,
  MessageMetadata
} from './types';

// Positions pour les traversals
export type {
  PhrasePosition,
  WordPosition,
  LetterPosition,
  SubLetterPosition
} from './types';

// Encodeurs
export type { EncoderDef, EncoderInfo, MessageClass } from '../encoders';

// =============================================================================
// Erreurs
// =============================================================================

export { EncoderError } from '../encoders';
export type { EncoderErrorCode } from '../encoders';

// =============================================================================
// Caesar specifics (pour les formulaires UI)
// =============================================================================

export {
  getPresetsForForm,
  computeShiftFromLetters,
  getShiftedLetter,
} from '../encoders';

// =============================================================================
// Numeric Caesar specifics (pour les formulaires UI)
// =============================================================================

export {
  NUMERIC_CAESAR_PRESETS,
  computeNumericShift,
  computeShiftFromLetterAndNumber,
} from '../encoders';

// =============================================================================
// Custom camouflage
// =============================================================================

export { applyCustomSymbolPair } from '../encoders';
