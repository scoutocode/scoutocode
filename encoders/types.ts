// encoders/types.ts - Types pour la définition des encodeurs

import { Message } from '../engine/types';
import { SeparatorLevel } from '../engine/separators';

// ===========================================================================
// Classification des messages
// ===========================================================================

/**
 * Classification du contenu d'un message après encodage.
 * Le level est implicite selon le type :
 * - letters, digits, lettersAndDigits → niveau letter
 * - twoSymbols, symbols, visual → niveau subletter
 */
export interface MessageClass {
  type: 'letters' | 'digits' | 'lettersAndDigits' | 'twoSymbols' | 'symbols' | 'visual';
  range?: { min: number; max: number };  // Pour digits
  symbols?: [string, string];            // Pour twoSymbols (ex: ['.', '-'])
}

// ===========================================================================
// SymbolPair - Remplacement de deux symboles
// ===========================================================================

/** Valeur de remplacement (string fixe ou tableau pour variation aléatoire) */
type SymbolReplacement = string | string[];

/**
 * Format d'entrée pour symbolPair :
 * - Tableau [repl0, repl1] : ordre implicite, résolu via sourceSymbols
 * - Objet { '.': '•', '-': '⸺' } : clés explicites
 */
export type SymbolPairInput =
  | [SymbolReplacement, SymbolReplacement]
  | Record<string, SymbolReplacement>;

/** Format résolu avec clés explicites */
export type SymbolPairResolved = Record<string, SymbolReplacement>;

/**
 * Résout un symbolPair en format avec clés explicites.
 * - Si déjà un objet avec clés, valide que les clés correspondent aux sourceSymbols
 * - Si tableau, ajoute les clés depuis sourceSymbols
 */
export function resolveSymbolPair(
  symbolPair: SymbolPairInput,
  sourceSymbols: [string, string]
): SymbolPairResolved {
  // Déjà un objet avec clés
  if (!Array.isArray(symbolPair)) {
    const keys = Object.keys(symbolPair);
    const valid = keys.every(k => sourceSymbols.includes(k));
    if (!valid) {
      throw new Error(
        `SymbolPair: clés invalides [${keys.join(', ')}], attendu [${sourceSymbols.join(', ')}]`
      );
    }
    return symbolPair;
  }

  // Tableau → ajouter les clés depuis sourceSymbols
  return {
    [sourceSymbols[0]]: symbolPair[0],
    [sourceSymbols[1]]: symbolPair[1],
  };
}

// ===========================================================================
// Définition d'un encodeur
// ===========================================================================

export interface EncoderDef {
  id: string;
  name: string;
  description?: string;

  // === Prérequis ===
  requires?: {
    type: MessageClass['type'] | MessageClass['type'][];
    range?: { min: number; max: number };
  };

  // === Ce que produit l'encodeur ===
  produces?: MessageClass;

  // === Transformation (une des trois options) ===

  // Option A: prétraitement sur le texte brut AVANT construction du Message
  // Incompatible avec le chaînage (doit être le premier/seul encodeur)
  preprocess?: (text: string, config?: Record<string, unknown>) => string;

  // Option B: fonction libre (reçoit Message + config)
  encode?: (message: Message, config?: Record<string, unknown>) => void;

  // Option C: table de remplacement
  table?: {
    level: 'letter' | 'subletter';
    replacements: Record<string, string>;

    // Normalisations appliquées avant lookup
    normalize?: {
      uppercase?: boolean;       // 'a' → 'A'
      baseLatinLetter?: boolean; // 'É' → 'E' (retire les accents)
    };
  };

  // Option D: assets visuels (produit des ImageSubLetter)
  visualAssets?: {
    folder: string;              // Nom du dossier dans public/assets/codes/
    level?: 'letter' | 'subletter'; // Niveau de traitement (défaut: 'letter')
    // Transformations appliquées au nom de fichier (défaut: ['toLower'])
    // - toLower: A → a
    // - toUpper: a → A
    // - letterToRank: a → 1, b → 2, ...
    // - rankToLetter: 1 → a, 2 → b, ...
    fileNameTransform?: Array<'toLower' | 'toUpper' | 'letterToRank' | 'rankToLetter'>;
  };

  // Option E: remplacement de deux symboles (pour camouflages twoSymbols)
  // Deux formats acceptés :
  // - Tableau [repl0, repl1] : ordre résolu via sourceSymbols du message
  // - Objet { '.': '•', '-': '⸺' } : clés explicites (recommandé pour customCamouflages)
  symbolPair?: SymbolPairInput;
  // Niveau de variation aléatoire pour symbolPair avec tableaux
  randomVariationLevel?: 'subletter' | 'letter' | 'word';

  // === Rendu ===
  spacing?: 'preserve' | 'separators';  // preserve = garde ponctuation originale, separators = utilise separators (défaut: selon producedType)

  // Configuration des séparateurs (décorrélés)
  separatorSigns?: string[];             // Liste de signes (défaut: ['/', '//', '///'])
  separatorLevel?: SeparatorLevel;       // Niveau de départ (défaut: auto-calculé selon structure)

  // === Métadonnées UI ===
  category?: string;               // Pour grouper (ex: "chiffres", "symboles")
  cosmeticOnly?: boolean;          // Ne change pas le sens, juste l'affichage
  isPrimary?: boolean;             // Afficher dans la liste principale (défaut: true)
  isCamouflage?: boolean;          // Peut être utilisé comme camouflage (défaut: false)
  preview?: string | [string, string]; // Aperçu pour le bouton (1 ou 2 éléments séparés par /)
  helpText?: string;               // Texte d'aide affiché dans la config

  // === Camouflages spécifiques ===
  customCamouflages?: EncoderDef[]; // Camouflages disponibles uniquement pour cet encodeur
  isDefaultCamouflage?: boolean;    // Si true, pré-sélectionné comme camouflage par défaut
}

// ===========================================================================
// Helpers pour MessageClass
// ===========================================================================

/**
 * Retourne le niveau naturel d'un type de message
 */
export function getLevelForType(type: MessageClass['type']): 'letter' | 'subletter' {
  switch (type) {
    case 'letters':
    case 'digits':
    case 'lettersAndDigits':
      return 'letter';
    case 'twoSymbols':
    case 'symbols':
    case 'visual':
      return 'subletter';
  }
}

/**
 * Vérifie si un requires est satisfait par un produces
 */
export function checkRequires(
  requires: EncoderDef['requires'],
  produces: MessageClass | undefined
): boolean {
  if (!requires) return true;
  if (!produces) return false;

  // Vérifier le type
  const acceptedTypes = Array.isArray(requires.type) ? requires.type : [requires.type];
  if (!acceptedTypes.includes(produces.type)) {
    return false;
  }

  // Vérifier le range si spécifié
  if (requires.range && produces.range) {
    if (produces.range.min < requires.range.min || produces.range.max > requires.range.max) {
      return false;
    }
  }

  return true;
}
