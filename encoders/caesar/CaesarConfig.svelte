<script lang="ts">
  import {
    getPresetsForForm,
    computeShiftFromLetters,
    getShiftedLetter,
  } from '../../src/lib/scoutocode';

  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  // Presets
  const presets = getPresetsForForm();

  // État local de l'UI
  let selectedPreset = $state('none');
  let showAdvancedConfig = $state(false);
  let isInverted = $state(false);

  // Affichage dans le message explicatif
  let displayFrom = $state('A');
  let displayTo = $state('A');

  // Champs éditables pour l'outil rapide (indépendants jusqu'à validation)
  let editableFrom = $state('A');
  let editableTo = $state('A');

  // Shift actuel
  const shift = $derived((config.shift as number) ?? 0);

  // Mise à jour de l'affichage depuis un preset
  function updateDisplayFromPreset(presetId: string, inverted: boolean) {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
      displayFrom = 'A';
      displayTo = getShiftedLetter('A', shift);
      editableFrom = displayFrom;
      editableTo = displayTo;
      return;
    }

    const origin = preset.origin;
    const destination = getShiftedLetter(origin, preset.shift);

    if (inverted) {
      displayFrom = destination;
      displayTo = origin;
    } else {
      displayFrom = origin;
      displayTo = destination;
    }

    editableFrom = displayFrom;
    editableTo = displayTo;
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

    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onchange('shift', preset.shift);
      isInverted = false;
      showAdvancedConfig = false;
      updateDisplayFromPreset(presetId, false);
    }
  }

  function invertShift() {
    onchange('shift', -shift);
    isInverted = !isInverted;

    // Échanger les valeurs affichées et éditables
    const temp = displayFrom;
    displayFrom = displayTo;
    displayTo = temp;

    editableFrom = displayFrom;
    editableTo = displayTo;
  }

  function toggleAdvancedConfig() {
    showAdvancedConfig = !showAdvancedConfig;
  }

  function handleQuickToolApply() {
    const origin = editableFrom.toUpperCase();
    const dest = editableTo.toUpperCase();

    if (!origin || !dest || origin.length !== 1 || dest.length !== 1) {
      return;
    }

    const originCode = origin.charCodeAt(0);
    const destCode = dest.charCodeAt(0);

    if (originCode < 65 || originCode > 90 || destCode < 65 || destCode > 90) {
      return;
    }

    const newShift = destCode - originCode;
    onchange('shift', newShift);
    selectedPreset = 'custom';
    isInverted = false;

    displayFrom = origin;
    displayTo = dest;
  }

  function handleManualShiftChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newShift = parseInt(target.value, 10);
    onchange('shift', newShift);
    selectedPreset = 'custom';
    isInverted = false;

    displayTo = getShiftedLetter(displayFrom, newShift);
    editableFrom = displayFrom;
    editableTo = displayTo;
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
      {#each presets as preset}
        <option value={preset.id}>{preset.name}</option>
      {/each}
      <option value="custom">Personnalisé...</option>
    </select>
  </div>

  <!-- Info box -->
  {#if selectedPreset !== 'none'}
    <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
      <p class="text-sm text-gray-700">
        Un <strong>{displayFrom}</strong> dans le message en clair devient un <strong>{displayTo}</strong> dans le message codé.<br/>
        Pour le décoder, l'ingénieux se dira quand il voit un <strong>{displayTo}</strong>, ça signifie <strong>{displayFrom}</strong>.
      </p>
      <div class="flex gap-3 mt-3">
        <button
          type="button"
          onclick={invertShift}
          class="text-sm text-primary hover:underline"
        >
          ↔️ Inverser le sens
        </button>
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
            type="text"
            bind:value={editableTo}
            placeholder="K"
            maxlength={1}
            class="w-full p-2 border border-gray-300 rounded-lg text-center uppercase
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
