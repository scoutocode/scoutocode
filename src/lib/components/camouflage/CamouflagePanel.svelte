<script lang="ts">
  import { getCompatibleCamouflages, type Message, type EncoderInfo } from '../../scoutocode';
  import {
    type CamouflageDisplayInfo,
    type CustomCamouflageConfig,
    type RandomVariationLevel,
    toCamouflageDisplayInfo,
  } from './types';
  import CamouflageGrid from './CamouflageGrid.svelte';
  import CustomCamouflageForm from './CustomCamouflageForm.svelte';

  interface Props {
    message: Message;
    selectedCamouflageId?: string;
    onselect: (encoder: EncoderInfo) => void;
    onreset?: () => void;
    oncustom?: (config: CustomCamouflageConfig) => void;
  }

  let { message, selectedCamouflageId = 'original', onselect, onreset, oncustom }: Props = $props();

  // Onglet actif (pour twoSymbols seulement)
  type Tab = 'presets' | 'custom';
  let activeTab = $state<Tab>('presets');

  // Camouflage sélectionné ('original' = message de base)
  let selectedId = $state<string>(selectedCamouflageId);

  // Synchroniser avec le prop quand il change
  $effect(() => {
    selectedId = selectedCamouflageId;
  });

  // Récupérer les camouflages compatibles
  const compatible = $derived(getCompatibleCamouflages(message));
  const camouflages = $derived(compatible.map(toCamouflageDisplayInfo));

  // État du formulaire personnalisé (synchronisé avec le camouflage sélectionné)
  let customSymbol0 = $state<string>(message.metadata.symbols?.[0] ?? '');
  let customSymbol1 = $state<string>(message.metadata.symbols?.[1] ?? '');
  let customVariationLevel = $state<RandomVariationLevel>('subletter');
  let customSeparators = $state<{ letter?: string; word?: string; phrase?: string }>({});

  // Option "Original" - toujours en premier
  const originalOption = $derived<CamouflageDisplayInfo>({
    id: 'original',
    name: 'Original',
    preview: message.metadata.symbols,
    cosmeticOnly: true,
    encoder: null as unknown as EncoderInfo, // Pas utilisé pour original
  });

  // Séparer cosmétiques et avec difficulté, avec "Original" en premier des cosmétiques
  const cosmetic = $derived([originalOption, ...camouflages.filter(c => c.cosmeticOnly)]);
  const withDifficulty = $derived(camouflages.filter(c => !c.cosmeticOnly));

  // Détecter si c'est du twoSymbols (permet la personnalisation)
  const isTwoSymbols = $derived(message.metadata.symbols !== undefined);

  // Labels pour les symboles (si twoSymbols)
  const symbol0Label = $derived(
    message.metadata.symbols?.[0] === '.'
      ? 'Ti (point)'
      : `Symbole "${message.metadata.symbols?.[0] ?? '0'}"`
  );
  const symbol1Label = $derived(
    message.metadata.symbols?.[1] === '-'
      ? 'Ta (trait)'
      : `Symbole "${message.metadata.symbols?.[1] ?? '1'}"`
  );

  /**
   * Extrait les symboles depuis un EncoderInfo (resolvedSymbolMap ou produces.symbols)
   */
  function extractSymbolsFromEncoder(encoder: EncoderInfo): [string, string] | undefined {
    // Priorité au resolvedSymbolMap
    if (encoder.resolvedSymbolMap) {
      const keys = Object.keys(encoder.resolvedSymbolMap);
      if (keys.length >= 2) {
        const sym0 = encoder.resolvedSymbolMap[keys[0]];
        const sym1 = encoder.resolvedSymbolMap[keys[1]];
        const str0 = Array.isArray(sym0) ? sym0.join(',') : sym0;
        const str1 = Array.isArray(sym1) ? sym1.join(',') : sym1;
        return [str0, str1];
      }
    }
    // Fallback sur produces.symbols
    if (encoder.produces?.symbols) {
      return encoder.produces.symbols;
    }
    return undefined;
  }

  /**
   * Met à jour le formulaire personnalisé avec les valeurs d'un camouflage
   */
  function updateCustomFormFromCamouflage(cam: CamouflageDisplayInfo) {
    if (cam.id === 'original') {
      // Original = symboles de base du message
      customSymbol0 = message.metadata.symbols?.[0] ?? '';
      customSymbol1 = message.metadata.symbols?.[1] ?? '';
      customVariationLevel = 'subletter';
      customSeparators = {};
    } else {
      const encoder = cam.encoder;
      const symbols = extractSymbolsFromEncoder(encoder);
      if (symbols) {
        customSymbol0 = symbols[0];
        customSymbol1 = symbols[1];
      }
      // Extraire le niveau de variation
      customVariationLevel = encoder.randomVariationLevel ?? 'subletter';
      // Extraire les séparateurs
      customSeparators = encoder.separators ? { ...encoder.separators } : {};
    }
  }

  function handleSelect(cam: CamouflageDisplayInfo) {
    selectedId = cam.id;
    updateCustomFormFromCamouflage(cam);
    if (cam.id === 'original') {
      onreset?.();
    } else {
      onselect(cam.encoder);
    }
  }

  function handleCustomApply(config: CustomCamouflageConfig) {
    selectedId = 'custom';
    oncustom?.(config);
  }

  function switchToCustom() {
    activeTab = 'custom';
  }

  // Initialiser le formulaire avec le camouflage sélectionné au montage
  $effect(() => {
    if (selectedCamouflageId && selectedCamouflageId !== 'original' && selectedCamouflageId !== 'custom') {
      const cam = camouflages.find(c => c.id === selectedCamouflageId);
      if (cam) {
        updateCustomFormFromCamouflage(cam);
      }
    }
  });
</script>

{#if camouflages.length > 0 || isTwoSymbols}
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <!-- Onglets (seulement pour twoSymbols) -->
    {#if isTwoSymbols}
      <div class="flex gap-2 mb-4 border-b-2 border-gray-200">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium -mb-0.5 border-b-2 transition-colors
                 {activeTab === 'presets'
                   ? 'text-primary border-primary'
                   : 'text-gray-500 border-transparent hover:text-primary'}"
          onclick={() => activeTab = 'presets'}
        >
          Préréglages
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium -mb-0.5 border-b-2 transition-colors
                 {activeTab === 'custom'
                   ? 'text-primary border-primary'
                   : 'text-gray-500 border-transparent hover:text-primary'}"
          onclick={() => activeTab = 'custom'}
        >
          Personnalisation
        </button>
      </div>
    {/if}

    <!-- Contenu Préréglages -->
    {#if activeTab === 'presets' || !isTwoSymbols}
      <!-- Apparence classique (cosmétiques) -->
      {#if cosmetic.length > 0}
        <CamouflageGrid
          title="Apparence"
          camouflages={cosmetic}
          {selectedId}
          onselect={handleSelect}
        />
      {/if}

      <!-- Camouflages avec difficulté -->
      {#if withDifficulty.length > 0}
        <CamouflageGrid
          title="Camouflages"
          camouflages={withDifficulty}
          {selectedId}
          onselect={handleSelect}
        >
          <!-- Bouton Personnalisé (slot) -->
          {#if isTwoSymbols && oncustom}
            <button
              type="button"
              class="flex flex-col items-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg
                     cursor-pointer transition-all hover:border-primary hover:bg-sky-50"
              onclick={switchToCustom}
            >
              <div class="text-2xl text-primary">+</div>
              <span class="text-xs font-medium text-gray-600">Personnalisé</span>
            </button>
          {/if}
        </CamouflageGrid>
      {/if}

      <!-- Message si aucun camouflage -->
      {#if cosmetic.length === 0 && withDifficulty.length === 0}
        <p class="text-sm text-gray-500 text-center py-4">
          Aucun camouflage disponible pour ce type de message.
        </p>
      {/if}
    {/if}

    <!-- Contenu Personnalisation -->
    {#if activeTab === 'custom' && isTwoSymbols}
      <CustomCamouflageForm
        {symbol0Label}
        {symbol1Label}
        symbol0={customSymbol0}
        symbol1={customSymbol1}
        variationLevel={customVariationLevel}
        separators={customSeparators}
        onapply={handleCustomApply}
      />
    {/if}
  </div>
{/if}
