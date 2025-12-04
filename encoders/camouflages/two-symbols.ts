// camouflages/two-symbols.ts - Camouflages pour la classe twoSymbols
//
// Ces camouflages remplacent les deux symboles produits par un encodeur
// (ex: 0/1 pour binaire, ./- pour morse) par d'autres symboles.
//
// La propriété `symbolPair` définit [remplacement0, remplacement1].
// Chaque élément peut être :
// - une string : remplacement fixe
// - un tableau de strings : variation aléatoire parmi les options
//
// Usage: lors du chaînage, passer config.sourceSymbols = [symbol0, symbol1]
// provenant de produces.symbols de l'encodeur précédent.

import { EncoderDef } from '../types';

// =============================================================================
// Camouflages simples (symboles fixes)
// =============================================================================

export const emptyFullDef: EncoderDef = {
  id: 'empty-full',
  name: 'Vide / Plein',
  description: 'Remplace par des carrés vides et pleins',
  requires: { type: 'twoSymbols' },
  produces: { type: 'twoSymbols', symbols: ['◻', '◼'] },
  symbolPair: ['◻', '◼'],
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['◻', '◼'],
};

export const heightDef: EncoderDef = {
  id: 'height',
  name: 'Hauteur',
  description: 'Remplace par des barres de hauteur différente',
  requires: { type: 'twoSymbols' },
  produces: { type: 'twoSymbols', symbols: ['▃', '▇'] },
  symbolPair: ['▃', '▇'],
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
};

// =============================================================================
// Camouflages avec variation aléatoire
// =============================================================================

export const mathDef: EncoderDef = {
  id: 'math',
  name: 'Maths',
  description: 'Remplace par des symboles mathématiques',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['-', '÷', '+', 'x'],
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['÷', '3'],
};

export const shapesDef: EncoderDef = {
  id: 'shapes',
  name: 'Rond/Angles',
  description: 'Remplace par des formes rondes et angulaires',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['⬤', '⬬', '⬮'],
    ['⬟', '█', '◼', '▲'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['⬤', '▲'],
};

export const arrowsDef: EncoderDef = {
  id: 'arrows',
  name: 'Horiz/Vert',
  description: 'Remplace par des flèches horizontales et verticales',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['←', '→', '↔'],
    ['↑', '↓', '↕'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['↔', '↕'],
};

export const cardsDef: EncoderDef = {
  id: 'cards',
  name: 'Rouge/Noir',
  description: 'Remplace par des symboles de cartes',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['♥️', '♦️'],
    ['♠️', '♣️'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['♥️', '♠️'],
};

export const sunMoonDef: EncoderDef = {
  id: 'sun-moon',
  name: 'Jour/Nuit',
  description: 'Remplace par des symboles jour et nuit',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['☀️', '🌞', '🔆'],
    ['🌙', '🌜', '⭐'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['☀️', '🌙'],
};

export const natureDef: EncoderDef = {
  id: 'nature',
  name: 'Nature',
  description: 'Remplace par des émojis nature',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['🌿', '🌲', '🌳', '☘️', '🌱'],
    ['🐞', '🐜', '🐝', '🐛', '🦋'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['🌿', '🐞'],
};

export const musicDef: EncoderDef = {
  id: 'music',
  name: 'Simple/Double',
  description: 'Remplace par des notes de musique',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['♩', '♭'],
    ['♫', '♬'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['♩', '♫'],
};

export const moodDef: EncoderDef = {
  id: 'mood',
  name: 'Humeur',
  description: 'Remplace par des émojis humeur',
  requires: { type: 'twoSymbols' },
  produces: { type: 'symbols' },
  symbolPair: [
    ['😊', '😀', '😃'],
    ['😢', '😞', '😔'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['😊', '😢'],
};

export const vowelsConsonantsDef: EncoderDef = {
  id: 'vowels-consonants',
  name: 'Voyelles/Consonnes',
  description: 'Remplace par des voyelles et consonnes aléatoires',
  requires: { type: 'twoSymbols' },
  produces: { type: 'letters' },
  symbolPair: [
    ['E', 'A', 'I', 'O', 'U', 'Y'],
    ['C', 'B', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['A', 'C'],
};

export const lowercaseUppercaseDef: EncoderDef = {
  id: 'lowercase-uppercase',
  name: 'Min/Maj',
  description: 'Remplace par des minuscules et majuscules aléatoires',
  requires: { type: 'twoSymbols' },
  produces: { type: 'letters' },
  symbolPair: [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['a', 'C'],
};

export const evenOddDef: EncoderDef = {
  id: 'even-odd',
  name: 'Pairs/Impairs',
  description: 'Remplace par des chiffres pairs et impairs',
  requires: { type: 'twoSymbols' },
  produces: { type: 'digits' },
  symbolPair: [
    ['0', '2', '4', '6', '8'],
    ['1', '3', '5', '7', '9'],
  ],
  randomVariationLevel: 'letter',
  isPrimary: false,
  isCamouflage: true,
  category: 'two-symbols',
  preview: ['4', '1'],
};

// =============================================================================
// Export groupé
// =============================================================================

export const TWO_SYMBOLS_CAMOUFLAGES: EncoderDef[] = [
  // Fixes
  emptyFullDef,
  heightDef,
  // Avec variation
  mathDef,
  shapesDef,
  arrowsDef,
  cardsDef,
  sunMoonDef,
  natureDef,
  musicDef,
  moodDef,
  vowelsConsonantsDef,
  lowercaseUppercaseDef,
  evenOddDef,
];
