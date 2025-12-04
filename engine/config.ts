// config.ts - Configuration centralisée des paramètres utilisateur

/**
 * Séparateurs utilisés pour le rendu des messages encodés
 */
export interface SeparatorConfig {
  /** Séparateur entre subletters d'une même lettre (ex: "" ou ",") */
  subLetter: string;
  /** Séparateur entre lettres d'un même mot (ex: " " ou " / ") */
  letter: string;
  /** Séparateur entre mots (ex: "   " ou " | ") */
  word: string;
  /** Séparateur entre phrases (ex: "\n") */
  phrase: string;
}

/**
 * Configuration du codeur binaire
 */
export interface BinaryConfig {
  /** Symbole pour 0 (ex: "0", ".", "court") */
  zero: string;
  /** Symbole pour 1 (ex: "1", "-", "long") */
  one: string;
}

/**
 * Configuration du codeur morse
 */
export interface MorseConfig {
  /** Symbole pour point (ex: ".", "·", "ti") */
  dot: string;
  /** Symbole pour trait (ex: "-", "—", "ta") */
  dash: string;
}

/**
 * Configuration du codeur par décalage (César)
 */
export interface ShiftConfig {
  /** Valeur du décalage (ex: 3 pour César classique) */
  shift: number;
}

/**
 * Configuration globale
 */
export interface Config {
  separators: SeparatorConfig;
  binary: BinaryConfig;
  morse: MorseConfig;
  shift: ShiftConfig;
}

/**
 * Configuration par défaut
 */
export const DEFAULT_CONFIG: Config = {
  separators: {
    subLetter: '',
    letter: ' ',
    word: '   ',
    phrase: '\n',
  },
  binary: {
    zero: '0',
    one: '1',
  },
  morse: {
    dot: '.',
    dash: '-',
  },
  shift: {
    shift: 3,
  },
};

/**
 * Charge une configuration depuis un objet partiel (merge avec défauts)
 */
export function mergeConfig(partial: Partial<Config>): Config {
  return {
    separators: { ...DEFAULT_CONFIG.separators, ...partial.separators },
    binary: { ...DEFAULT_CONFIG.binary, ...partial.binary },
    morse: { ...DEFAULT_CONFIG.morse, ...partial.morse },
    shift: { ...DEFAULT_CONFIG.shift, ...partial.shift },
  };
}

/**
 * Charge une configuration depuis un fichier JSON
 */
export function loadConfigFromJson(json: string): Config {
  try {
    const partial = JSON.parse(json) as Partial<Config>;
    return mergeConfig(partial);
  } catch {
    return DEFAULT_CONFIG;
  }
}
