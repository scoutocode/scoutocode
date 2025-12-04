// Wrapper autour de l'API engine/
// Centralise tous les imports pour le frontend

export {
  // Parsing et rendu
  parseText,
  renderMessage,

  // Encodeurs
  runEncoder,
  getEncoder,
  listEncoders,
  getCompatibleCamouflages,
  getCompatibleCamouflagesForEncoder,
  getDefaultCamouflage,
  ENCODER_REGISTRY,
  ENCODER_DEFS,

  // Caesar specifics
  getPresetsForForm,
  computeShiftFromLetters,
  getShiftedLetter,

  // Numeric Caesar specifics
  NUMERIC_CAESAR_PRESETS,
  computeNumericShift,
  computeShiftFromLetterAndNumber,

  // Custom camouflage
  applyCustomSymbolPair,

  // Types
  Message,

  // Erreurs
  EncoderError,
} from '../../engine';

export type {
  EncoderInfo,
  EncoderDef,
  MessageMetadata,
  RenderOptions,
  RenderOutput,
  RenderFormat,
} from '../../engine';
