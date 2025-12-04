// text-model.ts

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function removeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const LIGATURE_MAP: Record<string, string> = {
  'œ': 'oe', 'Œ': 'OE',
  'æ': 'ae', 'Æ': 'AE',
  'ﬁ': 'fi', 'ﬂ': 'fl',
};

/**
 * Expanse les ligatures (œ → oe, æ → ae, ﬁ → fi, etc.)
 * Ne touche pas aux accents ni aux autres caractères.
 */
export function expandLigatures(text: string): string {
  return text.replace(/./gu, ch => LIGATURE_MAP[ch] ?? ch);
}

const SENTENCE_SEPARATORS = new Set([
  '.', ':', '!', '?', ';', '\n', '\r'
]);

export type CharClass =
  | 'letter'          // Lettre latine (avec ou sans accent)
  | 'digit'           // Chiffre 0-9
  | 'letterOrDigit'   // Lettre latine ou chiffre
  | 'wordSeparator'   // Tout ce qui n'est pas lettre/chiffre/sentenceSeparator
  | 'sentenceSeparator';

// ---------------------------------------------------------------------------
// Char : représentation robuste d'un caractère latin accentué ou non
// ---------------------------------------------------------------------------

export class Char {
  readonly value: string; // un graphème (peut contenir plusieurs code points)

  private constructor(value: string) {
    if (value.length === 0) {
      throw new Error(`Char must be created from a non-empty string`);
    }
    this.value = value;
  }

  // -------------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------------

  /** Création depuis une chaîne */
  static fromChar(ch: string): Char {
    return new Char(ch);
  }

  /** Création depuis un rang dans l'alphabet (1–26), avec casse */
  static fromAlphabetRank(rank: number, uppercase: boolean = true): Char {
    if (rank < 1 || rank > 26 || !Number.isInteger(rank)) {
      throw new Error(`alphabetRank must be an integer between 1 and 26, got ${rank}`);
    }
    const base = uppercase ? 65 : 97; // 'A' / 'a'
    return new Char(String.fromCharCode(base + (rank - 1)));
  }

  toString(): string {
    return this.value;
  }

  // -------------------------------------------------------------------------
  // Classification
  // -------------------------------------------------------------------------

  /**
   * Vérifie si c'est une lettre de l'alphabet latin (avec ou sans accent).
   * Utilise baseLatinLetter pour déterminer si le caractère normalisé est A-Z.
   */
  get isLatinLetter(): boolean {
    return this.baseLatinLetter !== null;
  }

  get isDigit(): boolean {
    const code = this.value.charCodeAt(0);
    return code >= 48 && code <= 57; // 0–9
  }

  get isLetterOrDigit(): boolean {
    return this.isLatinLetter || this.isDigit;
  }

  get isUppercase(): boolean {
    return this.value === this.value.toUpperCase() && this.value !== this.value.toLowerCase();
  }

  get isLowercase(): boolean {
    return this.value === this.value.toLowerCase() && this.value !== this.value.toUpperCase();
  }

  // -------------------------------------------------------------------------
  // Accents & normalisation
  // -------------------------------------------------------------------------

  /** Indique si le caractère est accentué (au sens Unicode NFD) */
  get isAccented(): boolean {
    const decomposed = this.value.normalize('NFD');
    return /[\u0300-\u036f]/.test(decomposed);
  }

  /**
   * Version sans accent (en respectant la casse d'origine), ou null
   * si ce n'est pas une lettre latine.
   *   'é' → 'e'
   *   'É' → 'E'
   */
  get baseLatinLetter(): string | null {
    const stripped = removeAccents(this.value);
    if (!stripped) return null;

    const ch = stripped[0];
    const code = ch.charCodeAt(0);

    const isLetter =
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122);

    if (!isLetter) return null;

    return this.isUppercase ? ch.toUpperCase() : ch.toLowerCase();
  }

  /**
   * Version normalisée pour lookup : lettre latine de base ou chiffre.
   * Utile pour les encodeurs qui acceptent lettersAndDigits.
   *   'é' → 'e'
   *   'É' → 'E'
   *   '5' → '5'
   */
  get baseLatinLetterOrDigit(): string | null {
    if (this.isDigit) return this.value;
    return this.baseLatinLetter;
  }

  /** Normalisation sans accent + majuscules */
  get normalizedUpper(): Char {
    return Char.fromChar(removeAccents(this.value).toUpperCase());
  }

  /** Normalisation sans accent + minuscules */
  get normalizedLower(): Char {
    return Char.fromChar(removeAccents(this.value).toLowerCase());
  }

  /** Même caractère mais en majuscule brute (sans toucher aux accents) */
  get upper(): Char {
    return Char.fromChar(this.value.toUpperCase());
  }

  /** Même caractère mais en minuscule brute (sans toucher aux accents) */
  get lower(): Char {
    return Char.fromChar(this.value.toLowerCase());
  }

  // -------------------------------------------------------------------------
  // Rang alphabetique (basé sur baseLatinLetter)
  // -------------------------------------------------------------------------

  /**
   * Rang 1–26 (A/a=1 … Z/z=26), basé sur la version normalisée sans accent.
   *   'é' → 5
   *   'B' → 2
   *   'ç' → 3
   */
  get alphabetRank(): number | null {
    const base = this.baseLatinLetter;
    if (!base) return null;
    const code = base.charCodeAt(0);

    if (code >= 65 && code <= 90) return code - 65 + 1;
    if (code >= 97 && code <= 122) return code - 97 + 1;
    return null;
  }

  // -------------------------------------------------------------------------
  // Décalage de l'alphabet (César…)
  // -------------------------------------------------------------------------

  /** Décalage circulaire dans l'alphabet, même casse. */
  shifted(shift: number): Char {
    const rank = this.alphabetRank;
    if (rank == null) return this; // pas une lettre latine

    const mod = (n: number, m: number) => ((n % m) + m) % m;

    const zeroBased = rank - 1;      // 0–25
    const shiftedZero = mod(zeroBased + shift, 26);
    const newRank = shiftedZero + 1; // 1–26

    return Char.fromAlphabetRank(newRank, this.isUppercase);
  }

  // -------------------------------------------------------------------------
  // Séparateurs typographiques
  // -------------------------------------------------------------------------

  get isSentenceSeparator(): boolean {
    return SENTENCE_SEPARATORS.has(this.value);
  }

  /** Tout ce qui n'est pas lettre/chiffre et pas séparateur de phrase */
  get isWordSeparator(): boolean {
    return !this.isLetterOrDigit && !this.isSentenceSeparator;
  }

  // -------------------------------------------------------------------------
  // Match par classes (pour le generic encoder)
  // -------------------------------------------------------------------------

  matches(cls: CharClass): boolean {
    switch (cls) {
      case 'letter':            return this.isLatinLetter;
      case 'digit':             return this.isDigit;
      case 'letterOrDigit':     return this.isLetterOrDigit;
      case 'wordSeparator':     return this.isWordSeparator;
      case 'sentenceSeparator': return this.isSentenceSeparator;
    }
  }
}

// Segmenter pour découper proprement les graphèmes Unicode
const graphemeSegmenter = new Intl.Segmenter('fr', { granularity: 'grapheme' });

/**
 * Découpe une string en graphèmes Unicode.
 * Utiliser cette fonction plutôt que [...str] ou for...of sur une string.
 */
export function toGraphemes(str: string): string[] {
  return [...graphemeSegmenter.segment(str)].map(s => s.segment);
}

export class Text {
  readonly raw: string;
  private _graphemes: string[] | null = null;

  constructor(raw: string) {
    this.raw = raw ?? '';
  }

  /** Graphèmes (lazy) */
  private get graphemes(): string[] {
    if (this._graphemes === null) {
      this._graphemes = toGraphemes(this.raw);
    }
    return this._graphemes;
  }

  /** Le texte est-il vide ou seulement des espaces ? */
  get isBlank(): boolean {
    return this.raw.trim().length === 0;
  }

  /** Itération sur les Char (par graphème Unicode) */
  *chars(): IterableIterator<Char> {
    for (const g of this.graphemes) {
      yield Char.fromChar(g);
    }
  }

  /** Accès positionnel si besoin */
  charAt(index: number): Char | null {
    const g = this.graphemes[index];
    return g ? Char.fromChar(g) : null;
  }

  /** Longueur en graphèmes */
  get length(): number {
    return this.graphemes.length;
  }
}
