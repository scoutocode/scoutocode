// mandarin/index.ts - Encodeur Mandarin (symboles chinois)

import { Message, ImageSubLetter } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

export const mandarinDef: EncoderDef = {
  id: 'mandarin',
  name: 'Mandarin',
  description: 'Symboles chinois',
  requires: { type: 'letters' },
  produces: { type: 'visual' },
  encode: (message: Message, config?: Record<string, unknown>) => {
    const useSimpleVariant = (config?.useSimpleVariant as boolean) ?? false;
    const folder = useSimpleVariant ? 'simple-mandarin' : 'mandarin';

    message.traverseLetters((letter) => {
      const currentValue = letter.getSubLetters()
        .map(s => s.kind === 'text' ? s.value : '')
        .join('');

      const char = Char.fromChar(currentValue);
      const normalized = char.baseLatinLetterOrDigit;

      if (normalized && /^[a-zA-Z]$/.test(normalized)) {
        const fileName = normalized.toLowerCase();
        letter.setSubLetters([new ImageSubLetter(folder, fileName)]);
      }
    });
  },
  spacing: 'separators',
  category: 'visual',
};
