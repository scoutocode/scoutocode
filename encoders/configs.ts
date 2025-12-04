// Registry des composants de configuration personnalisés par encodeur

import type { Component } from 'svelte';
import BinaryConfig from './binary/BinaryConfig.svelte';
import CaesarConfig from './caesar/CaesarConfig.svelte';
import IntercalatedConfig from './intercalated/IntercalatedConfig.svelte';
import InvertConfig from './invert/InvertConfig.svelte';
import MandarinConfig from './mandarin/MandarinConfig.svelte';
import MorseConfig from './morse/MorseConfig.svelte';
import NumericCaesarConfig from './numeric-caesar/NumericCaesarConfig.svelte';
import ReverseConfig from './reverse/ReverseConfig.svelte';
import VigenereConfig from './vigenere/VigenereConfig.svelte';

// Type pour les props des composants de config
export interface ConfigComponentProps {
  encoder?: unknown;
  config: Record<string, unknown>;
  onchange: (key: string, value: unknown) => void;
}

// Registry des configs personnalisées
export const CONFIG_COMPONENTS: Record<string, Component<ConfigComponentProps>> = {
  binary: BinaryConfig as unknown as Component<ConfigComponentProps>,
  caesar: CaesarConfig as unknown as Component<ConfigComponentProps>,
  intercalated: IntercalatedConfig as unknown as Component<ConfigComponentProps>,
  invert: InvertConfig as unknown as Component<ConfigComponentProps>,
  mandarin: MandarinConfig as unknown as Component<ConfigComponentProps>,
  morse: MorseConfig as unknown as Component<ConfigComponentProps>,
  'numeric-caesar': NumericCaesarConfig as unknown as Component<ConfigComponentProps>,
  reverse: ReverseConfig as unknown as Component<ConfigComponentProps>,
  vigenere: VigenereConfig as unknown as Component<ConfigComponentProps>,
};

/**
 * Vérifie si un encodeur a une config personnalisée
 */
export function hasCustomConfig(encoderId: string): boolean {
  return encoderId in CONFIG_COMPONENTS;
}

/**
 * Récupère le composant de config pour un encodeur
 */
export function getConfigComponent(encoderId: string): Component<ConfigComponentProps> | null {
  return CONFIG_COMPONENTS[encoderId] || null;
}
