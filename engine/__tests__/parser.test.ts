import { describe, it, expect } from 'vitest';
import { parseText, renderMessage } from '../parser';

describe('parseText', () => {
  it('parse un mot simple', () => {
    const msg = parseText('HELLO');
    expect(msg.getPhrases()).toHaveLength(1);
    expect(msg.getWordCount()).toBe(1);
    expect(msg.getLetterCount()).toBe(5);
  });

  it('parse plusieurs mots', () => {
    const msg = parseText('HELLO WORLD');
    expect(msg.getWordCount()).toBe(2);
    expect(msg.getLetterCount()).toBe(10);
  });

  it('parse plusieurs phrases', () => {
    const msg = parseText('Bonjour. Comment vas-tu?');
    expect(msg.getPhrases()).toHaveLength(2);
  });

  it('préserve les séparateurs dans les RawTokens', () => {
    const msg = parseText('Hello, world!');
    const phrase = msg.getPhrases()[0];
    const tokens = phrase.getTokens();

    // word, raw, word, raw
    expect(tokens).toHaveLength(4);
    expect(tokens[0].kind).toBe('word');
    expect(tokens[1].kind).toBe('raw');
    expect(tokens[2].kind).toBe('word');
    expect(tokens[3].kind).toBe('raw');
  });

  it('expanse les ligatures', () => {
    const msg = parseText('cœur');
    expect(msg.getLetterCount()).toBe(5); // c-o-e-u-r
  });

  it('gère les accents', () => {
    const msg = parseText('été');
    expect(msg.getLetterCount()).toBe(3);
  });
});

describe('renderMessage', () => {
  describe('mode separators', () => {
    it('utilise les séparateurs par défaut selon producedType', () => {
      const msg = parseText('ABC');
      // Sans producedType défini, utilise _default qui a letter: '\u00A0/ '
      const result = renderMessage(msg, { spacing: 'separators', format: 'text' });
      expect(result.content).toBe('A\u00A0/ B\u00A0/ C');
      expect(result.kind).toBe('text');
    });

    it('utilise les séparateurs explicites (prioritaires sur défauts)', () => {
      const msg = parseText('ABC');
      const result = renderMessage(msg, {
        spacing: 'separators',
        format: 'text',
        separators: { letter: '-' }
      });
      expect(result.content).toBe('A-B-C');
    });

    it('utilise les séparateurs de mots explicites', () => {
      const msg = parseText('AB CD');
      const result = renderMessage(msg, {
        spacing: 'separators',
        format: 'text',
        separators: { letter: '', word: ' / ' }
      });
      expect(result.content).toBe('AB / CD');
    });
  });

  describe('mode preserve', () => {
    it('préserve la ponctuation', () => {
      const msg = parseText('Hello, world!');
      const result = renderMessage(msg, { spacing: 'preserve', format: 'text' });
      expect(result.content).toBe('Hello, world!');
    });

    it('préserve les espaces multiples', () => {
      const msg = parseText('Hello   world');
      const result = renderMessage(msg, { spacing: 'preserve', format: 'text' });
      expect(result.content).toBe('Hello   world');
    });

    it('préserve les séparateurs de phrase', () => {
      const msg = parseText('Bonjour. Au revoir!');
      const result = renderMessage(msg, { spacing: 'preserve', format: 'text' });
      expect(result.content).toBe('Bonjour. Au revoir!');
    });
  });

  describe('mode html', () => {
    it('retourne kind html', () => {
      const msg = parseText('Test');
      const result = renderMessage(msg, { spacing: 'separators', format: 'html' });
      expect(result.kind).toBe('html');
    });

    it('ne fait pas d\'échappement HTML (délégué à l\'UI)', () => {
      const msg = parseText('A B');
      const result = renderMessage(msg, { spacing: 'preserve', format: 'html' });
      // Pas d'échappement - c'est à l'UI de gérer via {@html} ou interpolation
      expect(result.content).toBe('A B');
    });
  });
});
