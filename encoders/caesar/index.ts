// caesar/index.ts - Encodeur César (décalage)

import { Message } from '../../engine/types';
import { Char } from '../../engine/text-model';
import { EncoderDef } from '../types';

// Réexporter les presets
export type { CaesarPreset, CaesarPresetWithShift } from './caesar.presets';
export {
  CAESAR_PRESETS,
  computeShift,
  computeShiftFromLetters,
  getShiftedLetter,
  getPresetById,
  getPresetsForForm,
  getPresetSelectOptions,
} from './caesar.presets';

export const caesarDef: EncoderDef = {
  id: 'caesar',
  name: 'César',
  description: 'Décalage des lettres',
  requires: { type: 'letters' },
  produces: { type: 'letters' },
  encode: (message: Message, config?: Record<string, unknown>) => {
    if (config?.shift === undefined) {
      throw new Error('Veuillez choisir un décalage');
    }
    const shift = config.shift as number;
    message.traverseLetters((letter) => {
      const textSubs = letter.getTextSubLetters();
      if (textSubs.length === 0) return;

      const char = Char.fromChar(textSubs[0].value);
      if (!char.isLatinLetter) return;

      const shifted = char.shifted(shift);
      textSubs[0].setValue(shifted.value);
    });
  },
  spacing: 'preserve',
  category: 'shift',
};
