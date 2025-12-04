/**
 * Types pour l'UI de camouflage
 */

import type { EncoderInfo } from '../../scoutocode';

/**
 * Niveau de variation aléatoire pour les symboles multiples
 */
export type RandomVariationLevel = 'subletter' | 'letter' | 'word' | 'phrase' | 'message';

/**
 * Configuration de camouflage personnalisé (pour twoSymbols)
 */
export interface CustomCamouflageConfig {
  symbol0: string | string[];
  symbol1: string | string[];
  variationLevel: RandomVariationLevel;
}

/**
 * Informations d'affichage pour un camouflage
 */
export interface CamouflageDisplayInfo {
  id: string;
  name: string;
  description?: string;
  /** Aperçu pour le bouton (1 ou 2 éléments) */
  preview?: string | [string, string];
  /** Camouflage cosmétique (ne change pas la difficulté) */
  cosmeticOnly?: boolean;
  /** Encoder info source */
  encoder: EncoderInfo;
}

/**
 * Extrait l'aperçu depuis un EncoderInfo
 */
export function getPreview(encoder: EncoderInfo): string | [string, string] | undefined {
  // Priorité au preview explicite
  if (encoder.preview) {
    return encoder.preview;
  }

  const def = encoder as any; // Access raw def properties

  // Fallback sur symbolPair
  if (def.symbolPair) {
    const s0 = Array.isArray(def.symbolPair[0]) ? def.symbolPair[0][0] : def.symbolPair[0];
    const s1 = Array.isArray(def.symbolPair[1]) ? def.symbolPair[1][0] : def.symbolPair[1];
    return [s0, s1];
  }

  // Fallback sur produces.symbols
  if (def.produces?.symbols) {
    return def.produces.symbols;
  }

  return undefined;
}

/**
 * Convertit un EncoderInfo en CamouflageDisplayInfo
 */
export function toCamouflageDisplayInfo(encoder: EncoderInfo): CamouflageDisplayInfo {
  return {
    id: encoder.id,
    name: encoder.name,
    description: encoder.description,
    preview: getPreview(encoder),
    cosmeticOnly: encoder.cosmeticOnly,
    encoder,
  };
}
