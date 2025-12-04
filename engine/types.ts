// types.ts -------------------------------------------------------------

export type SubLetter = TextSubLetter | ImageSubLetter;

export class TextSubLetter {
  kind: 'text' = 'text';
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  setValue(newValue: string): void {
    this.value = newValue;
  }
}

export class ImageSubLetter {
  kind: 'image' = 'image';
  folder: string;
  name: string;

  constructor(folder: string, name: string) {
    this.folder = folder;
    this.name = name;
  }

  setImage(folder: string, name: string): void {
    this.folder = folder;
    this.name = name;
  }
}

export class Letter {
  private _raw: string | null = null;
  private _subLetters: SubLetter[] | null = null;

  constructor(init: SubLetter[] | string = []) {
    if (typeof init === 'string') {
      this._raw = init;
    } else {
      this._subLetters = init;
    }
  }

  /** Indique si les subletters ont été matérialisées */
  get isMaterialized(): boolean {
    return this._subLetters !== null;
  }

  /** Accès lazy aux subletters - matérialise si nécessaire */
  get subLetters(): SubLetter[] {
    if (this._subLetters === null) {
      // _raw est un graphème complet, on crée une seule TextSubLetter
      this._subLetters = this._raw
        ? [new TextSubLetter(this._raw)]
        : [];
      this._raw = null;
    }
    return this._subLetters;
  }

  getSubLetters(): SubLetter[] {
    return this.subLetters;
  }

  getTextSubLetters(): TextSubLetter[] {
    return this.subLetters.filter(
      (sl): sl is TextSubLetter => sl.kind === 'text'
    );
  }

  getImageSubLetters(): ImageSubLetter[] {
    return this.subLetters.filter(
      (sl): sl is ImageSubLetter => sl.kind === 'image'
    );
  }

  addSubLetter(sub: SubLetter): void {
    this.subLetters.push(sub);
  }

  setSubLetters(subLetters: SubLetter[] | string): void {
    if (typeof subLetters === 'string') {
      // Convertir la string en TextSubLetters (un par graphème)
      this._subLetters = [...subLetters].map(ch => new TextSubLetter(ch));
    } else {
      this._subLetters = subLetters;
    }
    this._raw = null;
  }

  /** Accès au caractère brut sans matérialiser (si disponible) */
  getRawChar(): string | null {
    if (this._raw !== null) {
      return this._raw;
    }
    // Si déjà matérialisé avec une seule TextSubLetter, on peut la retourner
    if (this._subLetters && this._subLetters.length === 1 && this._subLetters[0].kind === 'text') {
      return this._subLetters[0].value;
    }
    return null;
  }
}

export type SeparatorKind = 'sentence' | 'word';

export interface Token {
  kind: 'word' | 'raw';
}

export class RawToken implements Token {
  kind: 'raw' = 'raw';
  text: string;
  separatorKind: SeparatorKind;

  constructor(text: string, separatorKind: SeparatorKind = 'word') {
    this.text = text;
    this.separatorKind = separatorKind;
  }

  setText(text: string): void {
    this.text = text;
  }

  setSeparatorKind(separatorKind: SeparatorKind): void {
    this.separatorKind = separatorKind;
  }
}

export class WordToken implements Token {
  kind: 'word' = 'word';
  letters: Letter[] = [];

  constructor(letters: Letter[] = []) {
    this.letters = letters;
  }

  getLetters(): Letter[] {
    return this.letters;
  }

  addLetter(letter: Letter): void {
    this.letters.push(letter);
  }

  setLetters(letters: Letter[]): void {
    this.letters = letters;
  }
}

export class Phrase {
  tokens: Token[] = [];

  constructor(tokens: Token[] = []) {
    this.tokens = tokens;
  }

  getTokens(): Token[] {
    return this.tokens;
  }

  getWords(): WordToken[] {
    return this.tokens.filter((t): t is WordToken => t.kind === 'word');
  }

  getRawTokens(): RawToken[] {
    return this.tokens.filter((t): t is RawToken => t.kind === 'raw');
  }

  addToken(token: Token): void {
    this.tokens.push(token);
  }

  addWord(word: WordToken): void {
    this.tokens.push(word);
  }

  addRaw(text: string, separatorKind: SeparatorKind = 'word'): void {
    this.tokens.push(new RawToken(text, separatorKind));
  }
}

// ---------------------------------------------------------------------
// Positions & indices
// ---------------------------------------------------------------------

export interface PhrasePosition {
  phraseIndex: number;
}

export interface WordPosition {
  phraseIndex: number;
  wordIndexInPhrase: number;
  wordIndexInMessage: number;
}

export interface LetterPosition {
  phraseIndex: number;
  wordIndexInPhrase: number;
  wordIndexInMessage: number;
  letterIndexInWord: number;
  letterIndexInMessage: number;
}

export interface SubLetterPosition {
  phraseIndex: number;
  wordIndexInPhrase: number;
  wordIndexInMessage: number;
  letterIndexInWord: number;
  letterIndexInMessage: number;
  subLetterIndexInLetter: number;
  subLetterIndexInMessage: number;
}

// ---------------------------------------------------------------------
// Message metadata (pour le chaînage et le rendu)
// ---------------------------------------------------------------------

export interface MessageMetadata {
  producedBy?: string;  // ID de l'encodeur qui a produit ce message
  producedType?: 'letters' | 'digits' | 'lettersAndDigits' | 'twoSymbols' | 'symbols' | 'visual';  // Type produit
  symbols?: [string, string];  // Pour twoSymbols: les deux symboles utilisés
  spacing?: 'preserve' | 'separators';  // Mode d'espacement
  separators?: {  // Séparateurs explicites (override)
    subLetter?: string;
    letter?: string;
    word?: string;
    phrase?: string;
  };
  // Séparateurs auto-calculés basés sur la structure
  autoSeparators?: {
    subLetter: string;
    letter: string;
    word: string;
    phrase: string;
  };
}

// ---------------------------------------------------------------------
// Message + traversals
// ---------------------------------------------------------------------

export class Message {
  phrases: Phrase[] = [];
  metadata: MessageMetadata = {};

  constructor(phrases: Phrase[] = [], metadata: MessageMetadata = {}) {
    this.phrases = phrases;
    this.metadata = metadata;
  }

  getPhrases(): Phrase[] {
    return this.phrases;
  }

  addPhrase(phrase: Phrase): void {
    this.phrases.push(phrase);
  }

  traversePhrases(cb: (phrase: Phrase, pos: PhrasePosition) => void): void {
    for (let phraseIndex = 0; phraseIndex < this.phrases.length; phraseIndex++) {
      cb(this.phrases[phraseIndex], { phraseIndex });
    }
  }

  traverseWords(cb: (word: WordToken, pos: WordPosition) => void): void {
    let wordIndexInMessage = 0;

    this.traversePhrases((phrase, { phraseIndex }) => {
      let wordIndexInPhrase = 0;

      for (const token of phrase.tokens) {
        if (token.kind !== 'word') continue;
        const word = token as WordToken;

        cb(word, {
          phraseIndex,
          wordIndexInPhrase,
          wordIndexInMessage,
        });

        wordIndexInPhrase++;
        wordIndexInMessage++;
      }
    });
  }

  traverseLetters(cb: (letter: Letter, pos: LetterPosition) => void): void {
    let letterIndexInMessage = 0;
    let wordIndexInMessage = 0;

    this.traversePhrases((phrase, { phraseIndex }) => {
      let wordIndexInPhrase = 0;

      for (const token of phrase.tokens) {
        if (token.kind !== 'word') continue;
        const word = token as WordToken;

        let letterIndexInWord = 0;

        for (const letter of word.letters) {
          cb(letter, {
            phraseIndex,
            wordIndexInPhrase,
            wordIndexInMessage,
            letterIndexInWord,
            letterIndexInMessage,
          });

          letterIndexInWord++;
          letterIndexInMessage++;
        }

        wordIndexInPhrase++;
        wordIndexInMessage++;
      }
    });
  }

  traverseSubLetters(cb: (subLetter: SubLetter, pos: SubLetterPosition) => void): void {
    let subLetterIndexInMessage = 0;
    let letterIndexInMessage = 0;
    let wordIndexInMessage = 0;

    this.traversePhrases((phrase, { phraseIndex }) => {
      let wordIndexInPhrase = 0;

      for (const token of phrase.tokens) {
        if (token.kind !== 'word') continue;
        const word = token as WordToken;

        let letterIndexInWord = 0;

        for (const letter of word.letters) {
          let subLetterIndexInLetter = 0;

          for (const subLetter of letter.subLetters) {
            cb(subLetter, {
              phraseIndex,
              wordIndexInPhrase,
              wordIndexInMessage,
              letterIndexInWord,
              letterIndexInMessage,
              subLetterIndexInLetter,
              subLetterIndexInMessage,
            });

            subLetterIndexInLetter++;
            subLetterIndexInMessage++;
          }

          letterIndexInWord++;
          letterIndexInMessage++;
        }

        wordIndexInPhrase++;
        wordIndexInMessage++;
      }
    });
  }

  getWordCount(): number {
    let count = 0;
    this.traverseWords(() => count++);
    return count;
  }

  getLetterCount(): number {
    let count = 0;
    this.traverseLetters(() => count++);
    return count;
  }

  getSubLetterCount(): number {
    let count = 0;
    this.traverseSubLetters(() => count++);
    return count;
  }
}
