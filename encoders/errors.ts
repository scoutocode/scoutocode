// encoders/errors.ts - Erreurs typées pour les encodeurs

/**
 * Types d'erreurs d'encodage
 */
export type EncoderErrorCode =
  | 'MISSING_SYMBOLS'      // Camouflage twoSymbols sans symboles source
  | 'INCOMPATIBLE_INPUT'   // Type d'entrée incompatible avec requires
  | 'NO_CONTENT'           // Pas de contenu encodable
  | 'INVALID_CONFIG'       // Configuration invalide
  | 'ENCODER_NOT_FOUND';   // Encodeur introuvable

/**
 * Erreur d'encodage avec code typé
 */
export class EncoderError extends Error {
  readonly code: EncoderErrorCode;
  readonly encoderId?: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: EncoderErrorCode,
    message: string,
    options?: { encoderId?: string; details?: Record<string, unknown> }
  ) {
    super(message);
    this.name = 'EncoderError';
    this.code = code;
    this.encoderId = options?.encoderId;
    this.details = options?.details;
  }
}

/**
 * Crée une erreur MISSING_SYMBOLS
 */
export function missingSymbolsError(encoderId?: string): EncoderError {
  return new EncoderError(
    'MISSING_SYMBOLS',
    'Camouflage twoSymbols: symboles source manquants. ' +
    'Appliquez d\'abord un encodeur qui produit des symboles (binary, morse, etc.)',
    { encoderId }
  );
}

/**
 * Traductions françaises des types de message
 */
const TYPE_LABELS: Record<string, string> = {
  letters: 'lettres',
  digits: 'chiffres',
  lettersAndDigits: 'lettres ou chiffres',
  twoSymbols: 'symboles binaires',
  symbols: 'symboles',
  visual: 'images',
};

function translateType(type: string): string {
  return TYPE_LABELS[type] || type;
}

function translateTypes(types: string | string[]): string {
  if (Array.isArray(types)) {
    return types.map(translateType).join(' ou ');
  }
  return translateType(types);
}

/**
 * Crée une erreur INCOMPATIBLE_INPUT
 */
export function incompatibleInputError(
  encoderName: string,
  expected: string | string[],
  got?: string
): EncoderError {
  const expectedStr = translateTypes(expected);
  const gotStr = got ? translateType(got) : undefined;
  return new EncoderError(
    'INCOMPATIBLE_INPUT',
    `Pour coder en ${encoderName}, le texte doit contenir uniquement des ${expectedStr}.` +
    (gotStr ? ` Vous devez retirer les ${gotStr}.` : ''),
    { details: { expected, got } }
  );
}

/**
 * Crée une erreur NO_CONTENT
 */
export function noContentError(encoderId: string): EncoderError {
  return new EncoderError(
    'NO_CONTENT',
    'Aucun contenu à encoder. Entrez du texte contenant des lettres ou des chiffres.',
    { encoderId }
  );
}

/**
 * Crée une erreur ENCODER_NOT_FOUND
 */
export function encoderNotFoundError(encoderId: string): EncoderError {
  return new EncoderError(
    'ENCODER_NOT_FOUND',
    `Encodeur introuvable: "${encoderId}"`,
    { encoderId }
  );
}
