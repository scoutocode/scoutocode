<script lang="ts">
  import type { CustomCamouflageConfig, RandomVariationLevel } from './types';

  interface Props {
    /** Labels pour les symboles (ex: "Ti (point)", "Ta (trait)") */
    symbol0Label?: string;
    symbol1Label?: string;
    /** Valeurs controlées */
    symbol0?: string;
    symbol1?: string;
    variationLevel?: RandomVariationLevel;
    /** Callbacks */
    onsymbol0change?: (value: string) => void;
    onsymbol1change?: (value: string) => void;
    onvariationchange?: (value: RandomVariationLevel) => void;
    onapply: (config: CustomCamouflageConfig) => void;
  }

  let {
    symbol0Label = 'Premier symbole',
    symbol1Label = 'Second symbole',
    symbol0 = '',
    symbol1 = '',
    variationLevel = 'subletter',
    onsymbol0change,
    onsymbol1change,
    onvariationchange,
    onapply,
  }: Props = $props();

  // État local du formulaire (synchronisé avec les props)
  let symbol0Input = $state(symbol0);
  let symbol1Input = $state(symbol1);
  let variationLevelInput = $state<RandomVariationLevel>(variationLevel);

  // Synchroniser avec les props quand elles changent
  $effect(() => {
    symbol0Input = symbol0;
  });
  $effect(() => {
    symbol1Input = symbol1;
  });
  $effect(() => {
    variationLevelInput = variationLevel;
  });

  // Validation
  const isValid = $derived(symbol0Input.trim() !== '' && symbol1Input.trim() !== '');

  /**
   * Parse une valeur de symbole : string unique ou liste séparée par virgules
   */
  function parseSymbolValue(value: string): string | string[] {
    const trimmed = value.trim();
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return trimmed;
  }

  function handleApply() {
    if (!isValid) return;

    const config: CustomCamouflageConfig = {
      symbol0: parseSymbolValue(symbol0Input),
      symbol1: parseSymbolValue(symbol1Input),
      variationLevel: variationLevelInput,
    };

    onapply(config);
  }
</script>

<div class="space-y-4">
  <!-- Symboles personnalisés -->
  <div>
    <h4 class="text-sm font-semibold text-gray-700 mb-2">Symboles personnalisés</h4>
    <p class="text-xs text-gray-500 mb-3 italic">
      Pour une liste aléatoire, séparez par des virgules (ex: A,E,I,O,U)
    </p>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label for="symbol0" class="block text-sm font-medium text-gray-600 mb-1">
          {symbol0Label}
        </label>
        <input
          id="symbol0"
          type="text"
          bind:value={symbol0Input}
          placeholder="Ex: . ou A,E,I"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label for="symbol1" class="block text-sm font-medium text-gray-600 mb-1">
          {symbol1Label}
        </label>
        <input
          id="symbol1"
          type="text"
          bind:value={symbol1Input}
          placeholder="Ex: - ou B,C,D"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  </div>

  <!-- Niveau de variation -->
  <div>
    <label for="variation-level" class="block text-sm font-medium text-gray-600 mb-1">
      Niveau de variation aléatoire
    </label>
    <select
      id="variation-level"
      bind:value={variationLevelInput}
      class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer
             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      <option value="subletter">Sous-lettre (maximum)</option>
      <option value="letter">Lettre</option>
      <option value="word">Mot</option>
      <option value="phrase">Phrase</option>
      <option value="message">Message (minimum)</option>
    </select>
  </div>

  <!-- Bouton Appliquer -->
  <button
    type="button"
    onclick={handleApply}
    disabled={!isValid}
    class="w-full py-3 text-sm font-semibold text-white rounded-lg transition-colors
           bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    Appliquer le camouflage
  </button>
</div>
