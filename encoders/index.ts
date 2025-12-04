// encoders/index.ts - Registry et exports des encodeurs

import { Message } from '../engine/types';
import { getSpacingForType, buildSeparators, SeparatorLevel, DEFAULT_SIGNS } from '../engine/separators';
import { EncoderDef, MessageClass, checkRequires, resolveSymbolPair, SymbolPairResolved } from './types';
import { ENCODER_DEFS, getEncoderDef, listEncoderIds } from './definitions';
import { getEncodeFunction, runEncoder as runEncoderEngine, analyzeMessage } from './engine';
import { getPresetsForForm } from './caesar/caesar.presets';

// ===========================================================================
// Exports
// ===========================================================================

// Types
export type { EncoderDef, MessageClass, SymbolPairInput, SymbolPairResolved } from './types';
export { getLevelForType, checkRequires, resolveSymbolPair } from './types';

// Définitions
export { ENCODER_DEFS, getEncoderDef, listEncoderIds } from './definitions';

// Engine (export runEncoderEngine sous le nom runEncoderDef pour usage interne)
export { getEncodeFunction, hasPreprocess, runPreprocess, applyCustomSymbolPair } from './engine';
export type { CustomSymbolPairConfig } from './engine';
export { runEncoder as runEncoderDef } from './engine';

// Errors
export type { EncoderErrorCode } from './errors';
export { EncoderError, missingSymbolsError, incompatibleInputError, encoderNotFoundError } from './errors';

// Caesar specifics
export {
  CAESAR_PRESETS,
  computeShift,
  computeShiftFromLetters,
  getShiftedLetter,
  getPresetById,
  getPresetsForForm,
  getPresetSelectOptions,
} from './caesar';
export type { CaesarPreset, CaesarPresetWithShift } from './caesar';

// Numeric Caesar specifics
export {
  NUMERIC_CAESAR_PRESETS,
  computeShift as computeNumericShift,
  computeShiftFromLetterAndNumber,
  getPresetById as getNumericPresetById,
  getPresetsForForm as getNumericPresetsForForm,
} from './numeric-caesar';
export type { NumericCaesarPreset, NumericCaesarPresetWithShift } from './numeric-caesar';

// ===========================================================================
// Registry
// ===========================================================================

export interface EncoderInfo {
  id: string;
  name: string;
  description: string;
  encode: (message: Message, config?: Record<string, unknown>) => void;

  // Preprocess (pour encodeurs qui travaillent sur le texte brut)
  preprocess?: (text: string, config?: Record<string, unknown>) => string;

  // Presets (pour caesar)
  getPresets?: () => Array<Record<string, unknown> & { id: string }>;

  // Rendu
  spacing?: 'preserve' | 'separators';
  separatorSigns?: string[];
  separatorLevel?: SeparatorLevel;

  // Classification
  requires?: EncoderDef['requires'];
  produces?: EncoderDef['produces'];

  // Métadonnées
  category?: string;
  cosmeticOnly?: boolean;
  preview?: string | [string, string];
  helpText?: string;

  // SymbolPair résolu (pour camouflages twoSymbols)
  // Rempli par getCompatibleCamouflages avec les symboles source du message
  resolvedSymbolMap?: SymbolPairResolved;

  // Niveau de variation aléatoire (pour camouflages avec symbolPair)
  randomVariationLevel?: 'subletter' | 'letter' | 'word';
}

/**
 * Convertit un EncoderDef en EncoderInfo
 * @param sourceSymbols - Si fourni, résout symbolPair avec ces symboles source
 */
function defToInfo(def: EncoderDef, sourceSymbols?: [string, string]): EncoderInfo {
  const info: EncoderInfo = {
    id: def.id,
    name: def.name,
    description: def.description || '',
    encode: getEncodeFunction(def),
    preprocess: def.preprocess,
    spacing: def.spacing,
    separatorSigns: def.separatorSigns,
    separatorLevel: def.separatorLevel,
    requires: def.requires,
    produces: def.produces,
    category: def.category,
    cosmeticOnly: def.cosmeticOnly,
    preview: def.preview,
    helpText: def.helpText,
    randomVariationLevel: def.randomVariationLevel,
  };

  // Résoudre symbolPair si sourceSymbols fourni
  if (def.symbolPair && sourceSymbols) {
    info.resolvedSymbolMap = resolveSymbolPair(def.symbolPair, sourceSymbols);
  }

  return info;
}

/**
 * Construit le registry à partir des définitions
 */
function buildRegistry(): Record<string, EncoderInfo> {
  const registry: Record<string, EncoderInfo> = {};

  for (const def of ENCODER_DEFS) {
    registry[def.id] = defToInfo(def);
  }

  // Ajouter getPresets pour caesar
  if (registry['caesar']) {
    registry['caesar'].getPresets = getPresetsForForm;
  }

  return registry;
}

export const ENCODER_REGISTRY: Record<string, EncoderInfo> = buildRegistry();

/**
 * Récupère un encodeur par son ID
 */
export function getEncoder(id: string): EncoderInfo | undefined {
  return ENCODER_REGISTRY[id];
}

/**
 * Liste tous les encodeurs disponibles
 */
export function listEncoders(): string[] {
  return Object.keys(ENCODER_REGISTRY);
}

/**
 * Exécute un encodeur sur un message
 * Accepte un EncoderInfo, EncoderDef, ou un ID d'encodeur
 */
export function runEncoder(
  encoder: EncoderInfo | EncoderDef | string,
  message: Message,
  config?: Record<string, unknown>
): void {
  // Si c'est un objet avec 'id' (EncoderDef ou EncoderInfo)
  if (typeof encoder === 'object' && 'id' in encoder) {
    // D'abord essayer de trouver dans ENCODER_DEFS (encodeurs enregistrés)
    const def = getEncoderDef(encoder.id);
    if (def) {
      runEncoderEngine(def, message, config);
      return;
    }

    // Sinon, c'est un EncoderInfo non-enregistré (ex: customCamouflage)
    // Utiliser directement la fonction encode et mettre à jour les metadata
    const info = encoder as EncoderInfo;

    // Passer resolvedSymbolMap dans la config si disponible
    const fullConfig = info.resolvedSymbolMap
      ? { ...config, resolvedSymbolMap: info.resolvedSymbolMap }
      : config;

    info.encode(message, fullConfig);

    // Analyser la structure et le contenu
    const { autoLevel, autoSeparators, requiresSeparators, contentType } = analyzeMessage(message);

    // Affiner producedType : si déclaré lettersAndDigits mais contenu réel = letters
    let producedType = info.produces?.type;
    if (producedType === 'lettersAndDigits' && contentType === 'letters') {
      producedType = 'letters';
    }

    // Combiner : info.separatorLevel (override) ou autoLevel
    const finalLevel = info.separatorLevel ?? autoLevel;

    // Combiner : info.separatorSigns (override) ou signes par défaut
    const finalSigns = info.separatorSigns ?? DEFAULT_SIGNS;

    // Construire les séparateurs finaux
    const finalSeparators = buildSeparators(finalSigns, finalLevel);

    // Créer un nouvel objet metadata (remplace complètement l'ancien)
    const newMetadata: typeof message.metadata = {
      producedBy: info.id,
      producedType,
      autoSeparators: finalSeparators,
    };

    // Symbols pour twoSymbols
    if (info.produces?.type === 'twoSymbols' && info.produces.symbols) {
      newMetadata.symbols = info.produces.symbols;
    }

    // Spacing : explicite > défaut selon producedType, forcé à separators si structure complexe
    let resolvedSpacing = info.spacing ?? getSpacingForType(info.produces?.type);
    if (requiresSeparators && resolvedSpacing === 'preserve') {
      resolvedSpacing = 'separators';
    }
    newMetadata.spacing = resolvedSpacing;

    message.metadata = newMetadata;
    return;
  }

  // C'est un ID string
  const def = getEncoderDef(encoder);
  if (!def) {
    throw new Error(`Encodeur introuvable: ${encoder}`);
  }
  runEncoderEngine(def, message, config);
}

// ===========================================================================
// Filtrage des camouflages compatibles
// ===========================================================================

/**
 * Retourne les camouflages compatibles avec l'état actuel du message.
 * Se base sur message.metadata pour déterminer ce que le message contient.
 * Inclut les camouflages spécifiques de l'encodeur (customCamouflages) en premier.
 * Résout les symbolPair avec les symboles source du message.
 */
export function getCompatibleCamouflages(message: Message): EncoderInfo[] {
  const compatible: EncoderInfo[] = [];
  const producedBy = message.metadata.producedBy;
  const sourceSymbols = message.metadata.symbols as [string, string] | undefined;

  // Récupérer l'encodeur source pour customCamouflages et range
  const sourceEncoder = producedBy ? getEncoderDef(producedBy) : null;

  // Construire produces effectif : utiliser producedType raffiné des metadata
  // mais conserver range de la définition de l'encodeur
  const produces: MessageClass | undefined = message.metadata.producedType
    ? {
        type: message.metadata.producedType as MessageClass['type'],
        range: sourceEncoder?.produces?.range,
      }
    : sourceEncoder?.produces;

  // 1. Ajouter les camouflages spécifiques de l'encodeur en premier
  if (sourceEncoder?.customCamouflages) {
    for (const cam of sourceEncoder.customCamouflages) {
      compatible.push(defToInfo(cam, sourceSymbols));
    }
  }

  // 2. Ajouter les camouflages génériques compatibles
  const camouflages = ENCODER_DEFS.filter(def => def.isCamouflage);

  for (const def of camouflages) {
    // Utiliser checkRequires qui vérifie type ET range
    if (checkRequires(def.requires, produces)) {
      compatible.push(defToInfo(def, sourceSymbols));
    }
  }

  return compatible;
}

/**
 * Retourne les camouflages compatibles avec un encodeur donné.
 * Utilise produces de l'encodeur pour déterminer la compatibilité.
 * Inclut les camouflages spécifiques de l'encodeur (customCamouflages) en premier.
 * Résout les symbolPair avec les symboles de produces.symbols.
 */
export function getCompatibleCamouflagesForEncoder(encoderId: string): EncoderInfo[] {
  const encoder = getEncoderDef(encoderId);
  if (!encoder) return [];

  const compatible: EncoderInfo[] = [];
  const sourceSymbols = encoder.produces?.symbols;

  // 1. Ajouter les camouflages spécifiques de l'encodeur en premier
  if (encoder.customCamouflages) {
    for (const cam of encoder.customCamouflages) {
      compatible.push(defToInfo(cam, sourceSymbols));
    }
  }

  // 2. Ajouter les camouflages génériques compatibles
  const camouflages = ENCODER_DEFS.filter(def => def.isCamouflage);

  for (const def of camouflages) {
    if (checkRequires(def.requires, encoder.produces)) {
      compatible.push(defToInfo(def, sourceSymbols));
    }
  }

  return compatible;
}

/**
 * Retourne le camouflage par défaut pour un message (si défini).
 * Cherche dans les customCamouflages de l'encodeur celui avec isDefaultCamouflage: true
 */
export function getDefaultCamouflage(message: Message): EncoderInfo | undefined {
  const producedBy = message.metadata.producedBy;
  if (!producedBy) return undefined;

  const encoder = getEncoderDef(producedBy);
  if (!encoder?.customCamouflages) return undefined;

  const sourceSymbols = message.metadata.symbols as [string, string] | undefined;
  const defaultCam = encoder.customCamouflages.find(cam => cam.isDefaultCamouflage);

  if (defaultCam) {
    return defToInfo(defaultCam, sourceSymbols);
  }

  return undefined;
}

