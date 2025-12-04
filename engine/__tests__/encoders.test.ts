import { describe, it, expect } from 'vitest';
import { parseText, renderMessage } from '../parser';
import { runEncoder, getEncoderDef, ENCODER_DEFS } from '../../encoders';

describe('binary encoder', () => {
  const def = getEncoderDef('binary')!;

  it('encode A en 1', () => {
    const msg = parseText('A');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('1');
  });

  it('encode B en 10', () => {
    const msg = parseText('B');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('10');
  });

  it('encode ABC en 1 10 11', () => {
    const msg = parseText('ABC');
    runEncoder(def, msg);
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' ' }
    });
    expect(result.content).toBe('1 10 11');
  });

  it('encode Z en 11010', () => {
    const msg = parseText('Z');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('11010');
  });

  it('gère les minuscules', () => {
    const msg = parseText('abc');
    runEncoder(def, msg);
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' ' }
    });
    expect(result.content).toBe('1 10 11');
  });

  it('gère les accents', () => {
    const msg = parseText('É');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('101'); // E = 5
  });

  it('swapSymbols intervertit 0 et 1', () => {
    const msg = parseText('A'); // A = 1
    runEncoder(def, msg, { swapSymbols: true });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('0');  // inversé
  });

  it('swapSymbols sur ABC', () => {
    const msg = parseText('ABC'); // A=1 B=10 C=11
    runEncoder(def, msg, { swapSymbols: true });
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' ' }
    });
    expect(result.content).toBe('0 01 00');  // inversé
  });

  it('swapSymbols false par défaut', () => {
    const msg = parseText('B');
    runEncoder(def, msg, {}); // config vide
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('10');  // pas inversé
  });
});

describe('morse encoder', () => {
  const def = getEncoderDef('morse')!;

  it('encode S en ...', () => {
    const msg = parseText('S');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('...');
  });

  it('encode O en ---', () => {
    const msg = parseText('O');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('---');
  });

  it('encode SOS', () => {
    const msg = parseText('SOS');
    runEncoder(def, msg);
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' / ' }
    });
    expect(result.content).toBe('... / --- / ...');
  });

  it('gère les accents', () => {
    const msg = parseText('É');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('.'); // E
  });

  it('encode les chiffres', () => {
    const msg = parseText('1');
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('.----');
  });

  it('swapSymbols intervertit . et -', () => {
    const msg = parseText('A'); // A = .-
    runEncoder(def, msg, { swapSymbols: true });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('-.');  // inversé
  });

  it('swapSymbols sur SOS', () => {
    const msg = parseText('SOS'); // S=... O=--- S=...
    runEncoder(def, msg, { swapSymbols: true });
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' / ' }
    });
    expect(result.content).toBe('--- / ... / ---');  // inversé
  });

  it('swapSymbols false par défaut', () => {
    const msg = parseText('A');
    runEncoder(def, msg, {}); // config vide
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('.-');  // pas inversé
  });
});

describe('caesar encoder', () => {
  const def = getEncoderDef('caesar')!;

  it('décalage 0 ne change rien', () => {
    const msg = parseText('HELLO');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('HELLO');
  });

  it('décalage 1: A -> B', () => {
    const msg = parseText('A');
    runEncoder(def, msg, { shift: 1 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('B');
  });

  it('décalage 3: HELLO -> KHOOR', () => {
    const msg = parseText('HELLO');
    runEncoder(def, msg, { shift: 3 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('KHOOR');
  });

  it('décalage négatif: B -> A', () => {
    const msg = parseText('B');
    runEncoder(def, msg, { shift: -1 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('A');
  });

  it('boucle autour de Z: Z + 1 -> A', () => {
    const msg = parseText('Z');
    runEncoder(def, msg, { shift: 1 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('A');
  });

  it('préserve la ponctuation', () => {
    const msg = parseText('Hello, world!');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('Hello, world!');
  });

  it('préserve la casse', () => {
    const msg = parseText('HeLLo');
    runEncoder(def, msg, { shift: 1 });
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('IfMMp');
  });
});

describe('numeric-caesar encoder', () => {
  const def = getEncoderDef('numeric-caesar')!;

  it('sans décalage: A -> 1', () => {
    const msg = parseText('A');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('1');
  });

  it('sans décalage: Z -> 26', () => {
    const msg = parseText('Z');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('26');
  });

  it('sans décalage: ABC -> 1 / 2 / 3', () => {
    const msg = parseText('ABC');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' / ' }
    });
    expect(result.content).toBe('1 / 2 / 3');
  });

  it('cassis: K -> 6 (shift=-5)', () => {
    // K est la 11ème lettre, avec shift=-5 on obtient F (6ème)
    const msg = parseText('K');
    runEncoder(def, msg, { shift: -5 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('6');
  });

  it('cassette: K -> 7 (shift=-4)', () => {
    const msg = parseText('K');
    runEncoder(def, msg, { shift: -4 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('7');
  });

  it('detroit: D -> 3 (shift=-1)', () => {
    const msg = parseText('D');
    runEncoder(def, msg, { shift: -1 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('3');
  });

  it('indienne: N -> 1 (shift=-13)', () => {
    // N est la 14ème lettre, avec shift=-13 on obtient A (1ère)
    const msg = parseText('N');
    runEncoder(def, msg, { shift: -13 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('1');
  });

  it('gère les accents', () => {
    const msg = parseText('É');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('5'); // E = 5
  });

  it('préserve la séparation des mots', () => {
    const msg = parseText('AB CD');
    runEncoder(def, msg, { shift: 0 });
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' / ', word: ' // ' }
    });
    expect(result.content).toBe('1 / 2 // 3 / 4');
  });
});

describe('roman-digits encoder', () => {
  const def = getEncoderDef('roman-digits')!;

  // Note: roman-digits travaille sur les nombres binaires produits par binary
  // A=1 (binaire "1") -> I
  // B=2 (binaire "10") -> X (car 10 en table = X)
  // C=3 (binaire "11") -> XI

  it('convertit 1 en I', () => {
    const msg = parseText('A'); // A -> "1" (binary) -> "I" (roman)
    runEncoder(getEncoderDef('binary')!, msg);
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('I');
  });

  it('convertit binaire 10 en X', () => {
    const msg = parseText('B'); // B -> "10" (binary) -> "X" (roman, car table["10"]="X")
    runEncoder(getEncoderDef('binary')!, msg);
    runEncoder(def, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('X');
  });

  it('chaîne binary -> roman pour ABC', () => {
    const msg = parseText('ABC');
    runEncoder(getEncoderDef('binary')!, msg);
    // A=1->"1"->I, B=2->"10"->X, C=3->"11"->XI
    runEncoder(def, msg);
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' ' }
    });
    expect(result.content).toBe('I X XI');
  });
});

describe('camouflages digits', () => {
  it('emoji-digits: 0-9 -> emojis', () => {
    const msg = parseText('ABC');
    runEncoder(getEncoderDef('numeric-caesar')!, msg, { shift: 0 });
    runEncoder(getEncoderDef('emoji-digits')!, msg);
    const result = renderMessage(msg, {
      spacing: msg.metadata.spacing,
      separators: { letter: msg.metadata.separators?.letter },
    });
    // A=1, B=2, C=3 avec séparateur ' '
    expect(result.content).toBe('1️⃣ 2️⃣ 3️⃣');
  });

  it('clock: 1-12 -> emojis horloge', () => {
    const msg = parseText('A'); // A=1
    runEncoder(getEncoderDef('numeric-caesar')!, msg, { shift: 0 });
    runEncoder(getEncoderDef('clock')!, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('🕐');
  });
});

describe('camouflages two-symbols', () => {
  it('empty-full: 0->◻ 1->◼', () => {
    const msg = parseText('ABC');
    runEncoder(getEncoderDef('binary')!, msg);
    // Vérifie que les symbols sont dans le metadata
    expect(msg.metadata.symbols).toEqual(['0', '1']);
    runEncoder(getEncoderDef('empty-full')!, msg);
    // empty-full produit twoSymbols → DEFAULT_SPACING = 'separators'
    expect(msg.metadata.spacing).toBe('separators');
    const result = renderMessage(msg, {
      spacing: 'separators',
      separators: { letter: ' ' },
    });
    expect(result.content).toBe('◼ ◼◻ ◼◼');
  });

  it('cards: 0->♥/♦ 1->♠/♣', () => {
    const msg = parseText('A'); // A=1 en binaire
    runEncoder(getEncoderDef('binary')!, msg);
    runEncoder(getEncoderDef('cards')!, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    // 1 est remplacé par ♠️ ou ♣️ (variation aléatoire par lettre)
    expect(result.content).toBe('♠️');
  });

  it('morse avec empty-full: .-  -> ◻◼', () => {
    const msg = parseText('A'); // A = .- en morse
    runEncoder(getEncoderDef('morse')!, msg);
    expect(msg.metadata.symbols).toEqual(['.', '-']);
    runEncoder(getEncoderDef('empty-full')!, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'separators' });
    expect(result.content).toBe('◻◼');
  });

  it('les symbols sont préservés dans metadata après twoSymbols', () => {
    const msg = parseText('A');
    runEncoder(getEncoderDef('binary')!, msg);
    expect(msg.metadata.symbols).toEqual(['0', '1']);
    // On peut chaîner avec un autre encodeur twoSymbols (camouflage)
    runEncoder(getEncoderDef('empty-full')!, msg);
    // empty-full met à jour les symbols avec ses propres valeurs
    expect(msg.metadata.symbols).toEqual(['◻', '◼']);
  });
});

describe('camouflages letters', () => {
  it('lowercase: convertit en minuscules', () => {
    const msg = parseText('HELLO');
    runEncoder(getEncoderDef('caesar')!, msg, { shift: 0 });
    runEncoder(getEncoderDef('lowercase')!, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('hello');
  });

  it('uppercase: convertit en majuscules', () => {
    const msg = parseText('hello');
    runEncoder(getEncoderDef('caesar')!, msg, { shift: 0 });
    runEncoder(getEncoderDef('uppercase')!, msg);
    const result = renderMessage(msg, { format: 'text', spacing: 'preserve' });
    expect(result.content).toBe('HELLO');
  });
});

describe('metadata après encodage', () => {
  it('binary met à jour producedBy et symbols', () => {
    const msg = parseText('A');
    runEncoder(getEncoderDef('binary')!, msg);
    expect(msg.metadata.producedBy).toBe('binary');
    expect(msg.metadata.symbols).toEqual(['0', '1']);
    expect(msg.metadata.spacing).toBe('separators');
    // separators sont calculés automatiquement via autoSeparators
    expect(msg.metadata.autoSeparators).toBeDefined();
  });

  it('camouflage met à jour les metadata', () => {
    const msg = parseText('ABC');
    runEncoder(getEncoderDef('binary')!, msg);
    expect(msg.metadata.producedBy).toBe('binary');
    runEncoder(getEncoderDef('empty-full')!, msg);
    // empty-full met à jour producedBy et symbols
    expect(msg.metadata.producedBy).toBe('empty-full');
    expect(msg.metadata.spacing).toBe('separators');
    expect(msg.metadata.symbols).toEqual(['◻', '◼']);
  });
});

describe('encoder definitions', () => {
  it('tous les encodeurs ont un id unique', () => {
    const ids = ENCODER_DEFS.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('spacing est optionnel ou valide', () => {
    for (const def of ENCODER_DEFS) {
      // spacing est maintenant optionnel (résolu selon producedType)
      if (def.spacing !== undefined) {
        expect(['preserve', 'separators']).toContain(def.spacing);
      }
    }
  });

  it('spacing est auto-calculé ou explicite', () => {
    // spacing est maintenant optionnel - calculé automatiquement selon producedType
    // Ce test vérifie juste que les valeurs explicites sont valides
    for (const def of ENCODER_DEFS) {
      if (def.spacing !== undefined) {
        expect(['preserve', 'separators'], `${def.id} a un spacing invalide`).toContain(def.spacing);
      }
    }
  });
});
