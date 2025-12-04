// parser.ts - Parsing de texte en structure Message

import {
  Message,
  Phrase,
  WordToken,
  RawToken,
  Letter,
  SeparatorKind,
} from './types';
import { Char, Text, expandLigatures } from './text-model';
import { resolveSeparators, type SeparatorsConfig } from './separators';

// ---------------------------------------------------------------------------
// Segmentation bas niveau
// ---------------------------------------------------------------------------

interface SegmentLetters {
  kind: 'letters';
  text: string;
}

interface SegmentSeparator {
  kind: 'separator';
  text: string;
  hasSentenceSeparator: boolean;
}

type Segment = SegmentLetters | SegmentSeparator;

/**
 * Découpe le texte en segments :
 * - segments de lettres/chiffres consécutifs
 * - segments de séparateurs consécutifs (avec flags sentence/word)
 */
function segmentText(text: Text): Segment[] {
  const segments: Segment[] = [];

  let currentKind: 'letters' | 'separator' | null = null;
  let buffer = '';
  let hasSentenceSeparator = false;

  const flush = () => {
    if (!currentKind || buffer === '') return;

    if (currentKind === 'letters') {
      segments.push({ kind: 'letters', text: buffer });
    } else {
      segments.push({
        kind: 'separator',
        text: buffer,
        hasSentenceSeparator,
      });
    }

    buffer = '';
    currentKind = null;
    hasSentenceSeparator = false;
  };

  for (const ch of text.chars()) {
    if (ch.isLetterOrDigit) {
      if (currentKind !== 'letters') {
        flush();
        currentKind = 'letters';
      }
      buffer += ch.value;
    } else if (ch.isSentenceSeparator) {
      if (currentKind !== 'separator') {
        flush();
        currentKind = 'separator';
      }
      buffer += ch.value;
      hasSentenceSeparator = true;
    } else if (ch.isWordSeparator) {
      if (currentKind !== 'separator') {
        flush();
        currentKind = 'separator';
      }
      buffer += ch.value;
    }
  }

  flush();
  return segments;
}

// ---------------------------------------------------------------------------
// Classification des séparateurs
// ---------------------------------------------------------------------------

function classifySeparator(seg: SegmentSeparator): SeparatorKind {
  if (seg.hasSentenceSeparator) return 'sentence';
  return 'word';
}

// ---------------------------------------------------------------------------
// Construction du Message
// ---------------------------------------------------------------------------

/**
 * Construit un WordToken à partir d'un texte.
 * Chaque graphème devient une Letter (lazy - pas de SubLetter créée).
 */
function buildWordToken(text: string): WordToken {
  const word = new WordToken();
  const t = new Text(text);
  for (const char of t.chars()) {
    const letter = new Letter(char.value);
    word.addLetter(letter);
  }
  return word;
}

/**
 * Parse un texte en Message.
 *
 * 1. Expanse les ligatures (œ → oe, æ → ae, etc.)
 * 2. Segmente le texte en blocs lettres/séparateurs
 * 3. Construit les phrases en coupant sur les séparateurs de phrase
 * 4. Les séparateurs sont classifiés (sentence/word)
 */
export function parseText(input: string): Message {
  const expanded = expandLigatures(input);
  const text = new Text(expanded);
  const segments = segmentText(text);
  const message = new Message();

  let currentPhrase = new Phrase();

  const pushPhraseIfNotEmpty = () => {
    if (currentPhrase.getTokens().length > 0) {
      message.addPhrase(currentPhrase);
      currentPhrase = new Phrase();
    }
  };

  for (const seg of segments) {
    if (seg.kind === 'letters') {
      const word = buildWordToken(seg.text);
      currentPhrase.addWord(word);
    } else {
      const sepKind = classifySeparator(seg);
      currentPhrase.addRaw(seg.text, sepKind);

      if (sepKind === 'sentence') {
        pushPhraseIfNotEmpty();
      }
    }
  }

  pushPhraseIfNotEmpty();
  return message;
}

// ---------------------------------------------------------------------------
// Rendu et debug
// ---------------------------------------------------------------------------

export type RenderFormat = 'auto' | 'html' | 'text';

export interface RenderSeparators {
  subLetter?: string;
  letter?: string;
  word?: string;
  phrase?: string;
}

export interface RenderOptions {
  spacing?: 'preserve' | 'separators';
  format?: RenderFormat;
  separators?: RenderSeparators;
  /** Résout le chemin d'une image (pour format html) */
  resolveImagePath?: (folder: string, name: string) => string;
}

export interface RenderOutput {
  kind: 'html' | 'text';
  content: string;
}

/** Résolveur par défaut pour les images (mode html) */
const defaultImageResolver = (folder: string, name: string) =>
  `./assets/codes/${folder}/${name}.svg`;

/**
 * Rend une SubLetter selon le format
 * Note: pas d'échappement HTML ici, c'est à l'UI de gérer via {@html} ou interpolation
 */
function renderSubLetter(
  sub: import('./types').SubLetter,
  format: RenderFormat,
  resolveImagePath: (folder: string, name: string) => string
): string {
  if (sub.kind === 'text') {
    return sub.value;
  }
  // ImageSubLetter
  if (format === 'text') {
    return `[${sub.folder}/${sub.name}]`;
  }
  const src = resolveImagePath(sub.folder, sub.name);
  return `<img src="${src}" alt="${sub.name}" class="code-symbol" />`;
}

/**
 * Rend une lettre en chaîne
 */
function renderLetter(
  letter: Letter,
  subLetterSeparator: string,
  format: RenderFormat,
  resolveImagePath: (folder: string, name: string) => string
): string {
  const subStrings: string[] = [];
  for (const sub of letter.getSubLetters()) {
    subStrings.push(renderSubLetter(sub, format, resolveImagePath));
  }
  return subStrings.join(subLetterSeparator);
}

/**
 * Convertit un Message en RenderOutput.
 *
 * Modes spacing :
 * - 'preserve' : garde les séparateurs originaux (RawTokens)
 * - 'separators' : utilise les séparateurs fournis en options
 *
 * Modes format :
 * - 'auto' : html si producedType === 'visual', sinon text (défaut)
 * - 'html' : génère du HTML avec <img> pour les images
 * - 'text' : génère du texte brut avec [folder/name] pour les images
 */
export function renderMessage(message: Message, options: RenderOptions = {}): RenderOutput {
  const {
    spacing = 'separators',
    format: formatOption = 'auto',
    separators: explicitSeparators,
    resolveImagePath = defaultImageResolver,
  } = options;

  // Résoudre le format : auto → html si visual, sinon text
  const format: 'html' | 'text' =
    formatOption === 'auto'
      ? (message.metadata.producedType === 'visual' ? 'html' : 'text')
      : formatOption;

  // Résoudre les séparateurs avec priorité :
  // 1. explicitSeparators (passés en options)
  // 2. message.metadata.separators (override de l'encodeur)
  // 3. message.metadata.autoSeparators (calculé automatiquement)
  // 4. défauts selon producedType (fallback legacy)
  const baseDefaults = resolveSeparators(undefined, message.metadata.producedType);
  const autoSeps = message.metadata.autoSeparators ?? baseDefaults;
  const encoderSeps = message.metadata.separators ?? {};
  const resolved = {
    subLetter: explicitSeparators?.subLetter ?? encoderSeps.subLetter ?? autoSeps.subLetter,
    letter: explicitSeparators?.letter ?? encoderSeps.letter ?? autoSeps.letter,
    word: explicitSeparators?.word ?? encoderSeps.word ?? autoSeps.word,
    phrase: explicitSeparators?.phrase ?? encoderSeps.phrase ?? autoSeps.phrase,
  };

  // En mode HTML, convertir \n en <br> et \u00A0 en &nbsp;
  const toHtml = (s: string) =>
    format === 'html'
      ? s.replace(/\u00A0/g, '&nbsp;').replace(/\n/g, '<br>')
      : s;

  const subLetterSeparator = toHtml(resolved.subLetter);
  const letterSeparator = toHtml(resolved.letter);
  const wordSeparator = toHtml(resolved.word);
  const phraseSeparator = toHtml(resolved.phrase);

  let content: string;

  if (spacing === 'preserve') {
    // Mode preserve : on parcourt tous les tokens dans l'ordre
    const parts: string[] = [];

    for (const phrase of message.getPhrases()) {
      for (const token of phrase.getTokens()) {
        if (token.kind === 'raw') {
          const raw = token as RawToken;
          parts.push(raw.text);
        } else {
          const word = token as WordToken;
          for (const letter of word.getLetters()) {
            parts.push(renderLetter(letter, subLetterSeparator, format, resolveImagePath));
          }
        }
      }
    }

    content = parts.join('');
  } else {
    // Mode separators : on utilise les séparateurs configurés
    const phraseStrings: string[] = [];

    for (const phrase of message.getPhrases()) {
      const tokenStrings: string[] = [];

      for (const token of phrase.getTokens()) {
        if (token.kind === 'raw') {
          continue;
        }

        const word = token as WordToken;
        const letterStrings: string[] = [];

        for (const letter of word.getLetters()) {
          letterStrings.push(renderLetter(letter, subLetterSeparator, format, resolveImagePath));
        }

        tokenStrings.push(letterStrings.join(letterSeparator));
      }

      phraseStrings.push(tokenStrings.join(wordSeparator));
    }

    content = phraseStrings.join(phraseSeparator);
  }

  return { kind: format, content };
}

/**
 * Affiche la structure complète d'un message (debug).
 */
export function debugMessage(message: Message): string {
  const lines: string[] = [];

  lines.push(`Message: ${message.getPhrases().length} phrase(s), ${message.getWordCount()} mot(s), ${message.getLetterCount()} lettre(s)`);
  lines.push('');

  message.traversePhrases((phrase, { phraseIndex }) => {
    lines.push(`  Phrase ${phraseIndex}:`);

    for (const token of phrase.getTokens()) {
      if (token.kind === 'raw') {
        const raw = token as RawToken;
        const escaped = raw.text.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        lines.push(`    [RAW:${raw.separatorKind}] "${escaped}"`);
      } else {
        const word = token as WordToken;
        const letters = word.getLetters().map(l => {
          const subs = l.getSubLetters().map(s =>
            s.kind === 'text' ? s.value : `[${s.folder}/${s.name}]`
          );
          return subs.length > 1 ? `(${subs.join(',')})` : subs[0];
        });
        lines.push(`    [WORD] ${letters.join('')}`);
      }
    }
  });

  return lines.join('\n');
}
