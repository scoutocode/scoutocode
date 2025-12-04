<script lang="ts">
  import {
    NUMERIC_CAESAR_PRESETS,
    computeNumericShift,
    computeShiftFromLetterAndNumber,
  } from '../../src/lib/scoutocode';

  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  // État local de l'UI
  let selectedPreset = $state('none');
  let showAdvancedConfig = $state(false);

  // Affichage dans le message explicatif
  let displayFrom = $state('A');
  let displayToNumber = $state(1);

  // Champs éditables pour l'outil rapide
  let editableFrom = $state('A');
  let editableTo = $state(1);

  // Shift actuel
  const shift = $derived((config.shift as number) ?? 0);

  // Fonction pour calculer la lettre décalée
  function getShiftedLetter(letter: string, shift: number): string {
    const code = letter.toUpperCase().charCodeAt(0);
    if (code < 65 || code > 90) return letter;

    let newCode = code + shift;
    while (newCode < 65) newCode += 26;
    while (newCode > 90) newCode -= 26;

    return String.fromCharCode(newCode);
  }

  // Fonction pour convertir une lettre en nombre
  function letterToNumber(letter: string): number {
    const code = letter.toUpperCase().charCodeAt(0);
    if (code < 65 || code > 90) return 0;
    return code - 65 + 1;
  }

  function updateDisplayFromPreset(presetId: string) {
    const preset = NUMERIC_CAESAR_PRESETS.find(p => p.id === presetId);
    if (!preset) {
      displayFrom = 'A';
      const shifted = getShiftedLetter('A', shift);
      displayToNumber = letterToNumber(shifted);
      editableFrom = displayFrom;
      editableTo = displayToNumber;
      return;
    }

    displayFrom = preset.origin;
    displayToNumber = preset.destNumber;

    editableFrom = displayFrom;
    editableTo = displayToNumber;
  }

  function handlePresetChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const presetId = target.value;

    selectedPreset = presetId;

    if (presetId === 'none') {
      return;
    }

    if (presetId === 'custom') {
      showAdvancedConfig = true;
      return;
    }

    const preset = NUMERIC_CAESAR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const newShift = computeNumericShift(preset);
      onchange('shift', newShift);
      showAdvancedConfig = false;
      updateDisplayFromPreset(presetId);
    }
  }

  function toggleAdvancedConfig() {
    showAdvancedConfig = !showAdvancedConfig;
  }

  function handleQuickToolApply() {
    const origin = editableFrom.toUpperCase();

    if (!origin || origin.length !== 1 || !editableTo) {
      return;
    }

    const originCode = origin.charCodeAt(0);

    if (originCode < 65 || originCode > 90 || editableTo < 1 || editableTo > 26) {
      return;
    }

    const newShift = computeShiftFromLetterAndNumber(origin, editableTo);
    onchange('shift', newShift);
    selectedPreset = 'custom';

    displayFrom = origin;
    displayToNumber = editableTo;
  }

  function handleManualShiftChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newShift = parseInt(target.value, 10);
    onchange('shift', newShift);
    selectedPreset = 'custom';

    const shifted = getShiftedLetter(displayFrom, newShift);
    displayToNumber = letterToNumber(shifted);
    editableFrom = displayFrom;
    editableTo = displayToNumber;
  }
</script>

<div class="space-y-4">
  <!-- Sélecteur de preset -->
  <div>
    <select
      value={selectedPreset}
      onchange={handlePresetChange}
      class="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer
             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {#if selectedPreset === 'none'}
        <option value="none">Choisissez un décalage</option>
      {/if}
      {#each NUMERIC_CAESAR_PRESETS as preset}
        <option value={preset.id}>{preset.name}</option>
      {/each}
      <option value="custom">Personnalisé...</option>
    </select>
  </div>

  <!-- Info box -->
  {#if selectedPreset !== 'none'}
    <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
      <p class="text-sm text-gray-700">
        Un <strong>{displayFrom}</strong> dans le message en clair devient un <strong>{displayToNumber}</strong> dans le message codé.<br/>
        Pour le décoder, l'ingénieux se dira quand il voit un <strong>{displayToNumber}</strong>, ça signifie <strong>{displayFrom}</strong>.
      </p>
      <div class="mt-3">
        <button
          type="button"
          onclick={toggleAdvancedConfig}
          class="text-sm text-primary hover:underline"
        >
          {#if showAdvancedConfig}
            ❌ Fermer le réglage du décalage
          {:else}
            ⚙️ Modifier le décalage
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- Panneau de configuration avancée -->
  {#if showAdvancedConfig}
    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <!-- Outil rapide -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-xs text-gray-500 mb-1">En clair</label>
          <input
            type="text"
            bind:value={editableFrom}
            placeholder="A"
            maxlength={1}
            class="w-full p-2 border border-gray-300 rounded-lg text-center uppercase
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div class="text-gray-400 text-xl pb-2">→</div>
        <div class="flex-1">
          <label class="block text-xs text-gray-500 mb-1">En codé</label>
          <input
            type="number"
            bind:value={editableTo}
            placeholder="11"
            min={1}
            max={26}
            class="w-full p-2 border border-gray-300 rounded-lg text-center
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onclick={handleQuickToolApply}
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Calculer le décalage
        </button>
      </div>

      <!-- Décalage manuel -->
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-700">Décalage manuel</label>
        <input
          type="number"
          value={shift}
          oninput={handleManualShiftChange}
          min={-25}
          max={25}
          class="w-24 p-2 border border-gray-300 rounded-lg text-center
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  {/if}
</div>

<style>
  input[type="text"] {
    text-transform: uppercase;
  }
</style>
