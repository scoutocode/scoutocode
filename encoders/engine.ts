// encoders/engine.ts - Moteur d'exécution des encodeurs

import { Message, ImageSubLetter } from '../engine/types';
import { Char } from '../engine/text-model';
import { EncoderDef, SymbolPairInput, SymbolPairResolved, resolveSymbolPair } from './types';
import { missingSymbolsError, incompatibleInputError, noContentError } from './errors';
import { getSeparatorsForType, getSpacingForType, SEPARATORS, SeparatorsConfig, SeparatorLevel, buildSeparators } from '../engine/separators';
import type { MessageClass } from './types';

// Segmenter pour compter les graphèmes (émojis, caractères combinés)
const segmenter = new Intl.Segmenter('fr', { granularity: 'grapheme' });

function countGraphemes(str: string): number {
  return [...segmenter.segment(str)].length;
}


/**
 * Vérifie si un type de message est compatible avec un type requis.
 * Gère les sous-ensembles : letters ⊂ lettersAndDigits, digits ⊂ lettersAndDigits
 */
function isTypeCompatible(
  messageType: MessageClass['type'],
  requiredType: MessageClass['type']
): boolean {
  if (messageType === requiredType) return true;

  // letters et digits sont des sous-ensembles de lettersAndDigits
  if (requiredType === 'lettersAndDigits') {
    return messageType === 'letters' || messageType === 'digits';
  }

  return false;
}

/**
 * Vérifie si le message satisfait les prérequis d'un encodeur
 */
function validateRequires(
  def: EncoderDef,
  message: Message,
  analysis: MessageAnalysis
): void {
  if (!def.requires) return;

  // Pas de contenu encodable
  if (!analysis.hasContent) {
    throw noContentError(def.id);
  }

  const acceptedTypes = Array.isArray(def.requires.type)
    ? def.requires.type
    : [def.requires.type];

  // Vérifier twoSymbols : on vérifie la présence des symbols dans metadata
  if (acceptedTypes.includes('twoSymbols')) {
    const symbols = message.metadata.symbols;
    if (!symbols || symbols.length !== 2) {
      throw missingSymbolsError(def.id);
    }
    // Si twoSymbols est accepté et les symbols existent, c'est compatible
    return;
  }

  // Vérifier si le type actuel est compatible avec un des types acceptés
  const isCompatible = acceptedTypes.some(accepted =>
    isTypeCompatible(analysis.contentType!, accepted)
  );

  if (!isCompatible) {
    throw incompatibleInputError(def.name, def.requires.type, analysis.contentType!);
  }
}

/**
 * Applique les normalisations configurées à une valeur
 */
function normalizeValue(
  value: string,
  normalize?: { uppercase?: boolean; baseLatinLetter?: boolean }
): string {
  if (!normalize) return value;

  let result = value;

  if (normalize.baseLatinLetter) {
    // Utiliser Char pour obtenir la lettre latine de base (ou chiffre)
    const char = Char.fromChar(value);
    const normalized = char.baseLatinLetterOrDigit;
    if (normalized) {
      result = normalized;
    }
  }

  if (normalize.uppercase) {
    result = result.toUpperCase();
  }

  return result;
}

type FileNameTransform = 'toLower' | 'toUpper' | 'letterToRank' | 'rankToLetter';

/**
 * Applique une transformation à un nom de fichier
 */
function applyTransform(value: string, transform: FileNameTransform): string | null {
  switch (transform) {
    case 'toLower':
      return value.toLowerCase();
    case 'toUpper':
      return value.toUpperCase();
    case 'letterToRank': {
      // a → 1, b → 2, ..., z → 26
      const char = Char.fromChar(value);
      const rank = char.alphabetRank;
      return rank !== null ? rank.toString() : null;
    }
    case 'rankToLetter': {
      // 1 → a, 2 → b, ..., 26 → z
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 26) return null;
      return String.fromCharCode(96 + num); // 97 = 'a'
    }
  }
}

/**
 * Génère une fonction encode à partir d'assets visuels
 * Remplace chaque lettre ou subletter par une ImageSubLetter
 */
function createVisualEncoder(visualAssets: NonNullable<EncoderDef['visualAssets']>): (message: Message, config?: Record<string, unknown>) => void {
  const { folder, level = 'letter', fileNameTransform = ['toLower'] } = visualAssets;

  // Fonction pour obtenir le nom de fichier avec les transformations
  const getFileName = (char: Char): string | null => {
    // Commencer avec la lettre/chiffre normalisé
    const normalized = char.baseLatinLetterOrDigit;
    if (!normalized) return null;

    // Appliquer les transformations en séquence
    let result: string | null = normalized;
    for (const transform of fileNameTransform) {
      if (result === null) return null;
      result = applyTransform(result, transform);
    }
    return result;
  };

  return (message: Message) => {
    if (level === 'subletter') {
      // Traiter chaque subletter individuellement (pour les chiffres)
      message.traverseLetters((letter) => {
        const newSubLetters: ImageSubLetter[] = [];

        for (const sub of letter.getSubLetters()) {
          if (sub.kind !== 'text') continue;

          // Chaque caractère devient une image
          const char = Char.fromChar(sub.value);
          const fileName = getFileName(char);

          if (fileName) {
            newSubLetters.push(new ImageSubLetter(folder, fileName));
          }
        }

        if (newSubLetters.length > 0) {
          letter.setSubLetters(newSubLetters);
        }
      });
    } else {
      // Niveau letter : une image par lettre entière
      message.traverseLetters((letter) => {
        // Récupérer la valeur actuelle de la lettre
        const currentValue = letter.getSubLetters()
          .map(s => s.kind === 'text' ? s.value : '')
          .join('');

        const char = Char.fromChar(currentValue);
        const fileName = getFileName(char);

        if (fileName) {
          letter.setSubLetters([new ImageSubLetter(folder, fileName)]);
        }
      });
    }
  };
}

/**
 * Génère une fonction encode à partir d'une table de remplacement
 */
function createTableEncoder(table: NonNullable<EncoderDef['table']>): (message: Message, config?: Record<string, unknown>) => void {
  const { level, replacements, normalize } = table;

  return (message: Message) => {
    if (level === 'letter') {
      // Remplace chaque lettre entière
      message.traverseLetters((letter) => {
        // Récupérer la valeur actuelle de la lettre (concaténation des subletters)
        const currentValue = letter.getSubLetters()
          .map(s => s.kind === 'text' ? s.value : '')
          .join('');

        const lookupKey = normalizeValue(currentValue, normalize);
        const replacement = replacements[lookupKey];
        if (replacement !== undefined) {
          letter.setSubLetters(replacement);
        }
      });
    } else {
      // Remplace chaque subletter individuellement
      message.traverseSubLetters((sub) => {
        if (sub.kind !== 'text') return;

        const lookupKey = normalizeValue(sub.value, normalize);
        const replacement = replacements[lookupKey];
        if (replacement !== undefined) {
          sub.setValue(replacement);
        }
      });
    }
  };
}

/**
 * Génère une fonction encode pour les camouflages twoSymbols
 * Remplace les deux symboles source par les symboles de symbolPair
 */
function createSymbolPairEncoder(
  symbolPair: SymbolPairInput,
  randomVariationLevel?: 'subletter' | 'letter' | 'word'
): (message: Message, config?: Record<string, unknown>) => void {
  return (message: Message, config?: Record<string, unknown>) => {
    // Les symboles source viennent du metadata du message (chaînage)
    // ou de config.sourceSymbols (fallback manuel)
    const sourceSymbols = message.metadata.symbols
      || config?.sourceSymbols as [string, string] | undefined;

    if (!sourceSymbols || sourceSymbols.length !== 2) {
      throw missingSymbolsError();
    }

    // Utiliser resolvedSymbolMap si fourni via config, sinon résoudre ici
    const symbolMap: SymbolPairResolved = config?.resolvedSymbolMap as SymbolPairResolved
      || resolveSymbolPair(symbolPair, sourceSymbols);

    const [src0, src1] = sourceSymbols;
    const replacement0 = symbolMap[src0];
    const replacement1 = symbolMap[src1];

    // Hash simple pour mélanger les bits
    const simpleHash = (x: number): number => {
      x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
      x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
      x = x ^ (x >>> 16);
      return x >>> 0; // non signé
    };

    // Fonction pour choisir un remplacement basé sur la position et un salt
    const pickReplacement = (replacements: string | string[], seed: number, salt: number): string => {
      if (typeof replacements === 'string') return replacements;
      if (replacements.length === 0) return '';

      const mixed = seed ^ (salt * 0x9e3779b9); // sel par symbole
      const salted = simpleHash(mixed);
      const index = salted % replacements.length;
      return replacements[index];
    };

    // Calcul du seed basé sur la position dans la structure
    const computeSeed = (
      phraseIdx: number,
      wordIdx: number,
      letterIdx: number,
      subLetterIdx: number
    ): number => {
      switch (randomVariationLevel) {
        case 'word':
          return phraseIdx * 100 + wordIdx;
        case 'letter':
          return phraseIdx * 10000 + wordIdx * 100 + letterIdx;
        default: // subletter
          return phraseIdx * 1000000 + wordIdx * 10000 + letterIdx * 100 + subLetterIdx;
      }
    };

    // Parcourir avec les indices de position
    let phraseIdx = 0;
    for (const phrase of message.getPhrases()) {
      let wordIdx = 0;
      for (const word of phrase.getWords()) {
        let letterIdx = 0;
        for (const letter of word.getLetters()) {
          let subLetterIdx = 0;
          for (const sub of letter.getSubLetters()) {
            if (sub.kind === 'text') {
              const seed = computeSeed(phraseIdx, wordIdx, letterIdx, subLetterIdx);
              if (sub.value === src0) {
                sub.setValue(pickReplacement(replacement0, seed, 0));
              } else if (sub.value === src1) {
                sub.setValue(pickReplacement(replacement1, seed, 1));
              }
            }
            subLetterIdx++;
          }
          letterIdx++;
        }
        wordIdx++;
      }
      phraseIdx++;
    }
  };
}

/**
 * Calcule la longueur d'une subletter (1 pour image, sinon nombre de graphèmes)
 */
function subLetterLength(sub: { kind: string; value?: string }): number {
  if (sub.kind === 'image') return 1;
  const value = (sub as { value?: string }).value ?? '';
  return countGraphemes(value);
}

/**
 * Résultat de l'analyse d'un message
 */
export interface MessageAnalysis {
  // Structure (pour séparateurs)
  autoLevel: SeparatorLevel;
  autoSeparators: SeparatorsConfig;
  requiresSeparators: boolean;
  // Contenu (pour compatibilité)
  contentType: MessageClass['type'] | null;
  hasContent: boolean;
}

/**
 * Analyse un message : structure et contenu.
 * - Structure : calcule les séparateurs automatiques selon le niveau d'extension
 * - Contenu : détermine le type réel (letters, digits, lettersAndDigits, symbols)
 */
export function analyzeMessage(message: Message): MessageAnalysis {
  let maxSubLettersPerLetter = 0;
  let maxSubLetterLength = 0;
  let hasLetters = false;
  let hasDigits = false;
  let hasOther = false;
  let hasContent = false;

  message.traverseLetters((letter) => {
    hasContent = true;
    const subLetters = letter.getSubLetters();

    // Max nombre de subletters par lettre
    if (subLetters.length > maxSubLettersPerLetter) {
      maxSubLettersPerLetter = subLetters.length;
    }

    // Parcours des subletters
    for (const sub of subLetters) {
      // Longueur
      const len = subLetterLength(sub);
      if (len > maxSubLetterLength) {
        maxSubLetterLength = len;
      }

      // Type de contenu
      if (sub.kind === 'image') {
        hasOther = true;
      } else {
        const char = Char.fromChar(sub.value);
        if (char.baseLatinLetter) {
          hasLetters = true;
        } else if (/^\d$/.test(sub.value)) {
          hasDigits = true;
        } else {
          hasOther = true;
        }
      }
    }
  });

  // Déterminer le niveau et les séparateurs selon la structure
  let autoLevel: SeparatorLevel;
  let autoSeparators: SeparatorsConfig;

  if (maxSubLetterLength > 1) {
    autoLevel = 'subLetter';
    autoSeparators = SEPARATORS.slashesFromSubLetter;
  } else if (maxSubLettersPerLetter > 1) {
    autoLevel = 'letter';
    autoSeparators = SEPARATORS.slashesFromLetter;
  } else {
    autoLevel = 'word';
    autoSeparators = SEPARATORS.spacedWithSlashes;
  }

  const requiresSeparators = maxSubLettersPerLetter > 1 || maxSubLetterLength > 1;

  // Déterminer le type de contenu
  let contentType: MessageClass['type'] | null = null;
  if (hasContent) {
    if (hasOther) {
      contentType = 'symbols';
    } else if (hasLetters && hasDigits) {
      contentType = 'lettersAndDigits';
    } else if (hasDigits) {
      contentType = 'digits';
    } else {
      contentType = 'letters';
    }
  }

  return { autoLevel, autoSeparators, requiresSeparators, contentType, hasContent };
}

/**
 * Retourne la fonction encode effective pour un encodeur
 * (soit celle définie, soit générée depuis la table, visualAssets ou symbolPair)
 */
export function getEncodeFunction(def: EncoderDef): (message: Message, config?: Record<string, unknown>) => void {
  if (def.encode) {
    return def.encode;
  }

  if (def.table) {
    return createTableEncoder(def.table);
  }

  if (def.visualAssets) {
    return createVisualEncoder(def.visualAssets);
  }

  if (def.symbolPair) {
    return createSymbolPairEncoder(def.symbolPair, def.randomVariationLevel);
  }

  // Encodeur sans transformation (juste métadonnées)
  return () => {};
}

/**
 * Exécute un encodeur sur un message
 * Met à jour message.metadata avec les infos de l'encodeur (pour le chaînage et le rendu)
 */
export function runEncoder(
  def: EncoderDef,
  message: Message,
  config?: Record<string, unknown>
): void {
  // Analyser le message avant encodage pour validation
  const preAnalysis = analyzeMessage(message);
  validateRequires(def, message, preAnalysis);

  const encode = getEncodeFunction(def);
  encode(message, config);

  // Analyser le message après encodage pour structure et contenu réel
  const { autoLevel, autoSeparators, requiresSeparators, contentType } = analyzeMessage(message);

  // Affiner producedType : si déclaré lettersAndDigits mais contenu réel = letters
  let producedType = def.produces?.type;
  if (producedType === 'lettersAndDigits' && contentType === 'letters') {
    producedType = 'letters';
  }

  // Créer un nouvel objet metadata (remplace complètement l'ancien)
  const newMetadata: typeof message.metadata = {
    producedBy: def.id,
    producedType,
    autoSeparators,
  };

  // Symbols pour twoSymbols
  if (def.produces?.type === 'twoSymbols' && def.produces.symbols) {
    newMetadata.symbols = def.produces.symbols;
  }

  // Spacing : explicite > signes définis > défaut selon producedType
  // Si requiresSeparators, forcer 'separators' même si l'encodeur dit 'preserve'
  const hasExplicitSeparators = def.separatorSigns || def.separatorLevel;
  let resolvedSpacing = def.spacing ?? (hasExplicitSeparators ? 'separators' : getSpacingForType(def.produces?.type));
  if (requiresSeparators && resolvedSpacing === 'preserve') {
    resolvedSpacing = 'separators';
  }
  newMetadata.spacing = resolvedSpacing;

  // Séparateurs explicites via separatorSigns + separatorLevel
  if (hasExplicitSeparators) {
    const level = def.separatorLevel ?? autoLevel;
    newMetadata.separators = buildSeparators(def.separatorSigns, level);
  }

  message.metadata = newMetadata;
}

/**
 * Vérifie si un encodeur utilise preprocess (incompatible avec le chaînage)
 */
export function hasPreprocess(def: EncoderDef): boolean {
  return !!def.preprocess;
}

/**
 * Applique le preprocess d'un encodeur sur un texte brut
 */
export function runPreprocess(
  def: EncoderDef,
  text: string,
  config?: Record<string, unknown>
): string {
  if (!def.preprocess) return text;
  return def.preprocess(text, config);
}

/**
 * Configuration pour un camouflage personnalisé twoSymbols
 */
export interface CustomSymbolPairConfig {
  symbol0: string | string[];
  symbol1: string | string[];
  variationLevel?: 'subletter' | 'letter' | 'word';
}

/**
 * Applique un camouflage personnalisé twoSymbols sur un message
 * Utilise les symboles source depuis message.metadata.symbols
 */
export function applyCustomSymbolPair(
  message: Message,
  config: CustomSymbolPairConfig
): void {
  const symbolPair: [string | string[], string | string[]] = [config.symbol0, config.symbol1];
  const encoder = createSymbolPairEncoder(symbolPair, config.variationLevel);
  encoder(message);
}
