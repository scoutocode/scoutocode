<script lang="ts">
  import InputPanel from './lib/components/encoder/InputPanel.svelte';
  import EncoderSelector from './lib/components/encoder/EncoderSelector.svelte';
  import ResultPanel from './lib/components/encoder/ResultPanel.svelte';
  import CamouflagePanel from './lib/components/camouflage/CamouflagePanel.svelte';
  import type { CustomCamouflageConfig } from './lib/components/camouflage/types';
  import ToastContainer from './lib/components/ui/ToastContainer.svelte';
  import {
    parseText,
    runEncoder,
    getEncoder,
    getDefaultCamouflage,
    applyCustomSymbolPair,
    type Message,
    type EncoderInfo,
    EncoderError,
  } from './lib/scoutocode';
  import { toastStore } from './lib/stores/toast.svelte';

  // État de l'application
  let inputText = $state('');
  let encoderId = $state('');
  let config = $state<Record<string, unknown>>({});

  // Message de base (après encodage principal, avant camouflage)
  let baseMessage = $state<Message | null>(null);
  // Message affiché (après camouflage éventuel)
  let message = $state<Message | null>(null);
  let messageVersion = $state(0); // Pour forcer le re-render après camouflage
  // ID du camouflage actuellement sélectionné
  let selectedCamouflageId = $state<string>('original');

  // Dérivés
  const encoder = $derived(encoderId ? getEncoder(encoderId) : null);
  const hasEncoded = $derived(message !== null);

  // Reset quand l'encodeur change
  $effect(() => {
    if (encoderId) {
      config = {};
      baseMessage = null;
      message = null;
    }
  });

  /**
   * Crée une copie du message en ré-encodant depuis le texte original
   */
  function createMessageCopy(): Message | null {
    if (!encoder || !inputText.trim()) return null;

    try {
      let text = inputText;
      if (encoder.preprocess) {
        text = encoder.preprocess(text, config);
      }
      const msg = parseText(text);
      runEncoder(encoder, msg, config);
      return msg;
    } catch {
      return null;
    }
  }

  function handleEncode() {
    if (!encoder || !inputText.trim()) {
      toastStore.warning('Veuillez entrer un texte et choisir un encodeur.');
      return;
    }

    try {
      // Preprocess si nécessaire
      let text = inputText;
      if (encoder.preprocess) {
        text = encoder.preprocess(text, config);
      }

      // Parser et encoder
      const msg = parseText(text);
      runEncoder(encoder, msg, config);

      baseMessage = msg;

      // Appliquer le camouflage par défaut si défini
      const defaultCam = getDefaultCamouflage(msg);
      if (defaultCam) {
        // Créer une copie pour le camouflage
        const camouflagedMsg = createMessageCopy();
        if (camouflagedMsg) {
          runEncoder(defaultCam, camouflagedMsg);
          message = camouflagedMsg;
          selectedCamouflageId = defaultCam.id;
        } else {
          message = msg;
          selectedCamouflageId = 'original';
        }
      } else {
        message = msg;
        selectedCamouflageId = 'original';
      }
    } catch (err) {
      if (err instanceof EncoderError) {
        toastStore.error(err.message);
      } else if (err instanceof Error) {
        toastStore.error(err.message);
      } else {
        toastStore.error('Erreur inconnue');
      }
      baseMessage = null;
      message = null;
    }
  }

  function handleCamouflageSelect(camouflageEncoder: EncoderInfo) {
    if (!baseMessage) return;

    try {
      // Créer une nouvelle copie du message de base
      const msg = createMessageCopy();
      if (!msg) return;

      // Appliquer le camouflage sur la copie
      runEncoder(camouflageEncoder, msg);
      message = msg;
      messageVersion++;
      selectedCamouflageId = camouflageEncoder.id;
    } catch (err) {
      if (err instanceof EncoderError) {
        toastStore.error(err.message);
      }
    }
  }

  function handleCamouflageReset() {
    if (!baseMessage) return;

    // Revenir au message de base
    const msg = createMessageCopy();
    if (msg) {
      message = msg;
      messageVersion++;
      selectedCamouflageId = 'original';
    }
  }

  function handleCustomCamouflage(customConfig: CustomCamouflageConfig) {
    if (!baseMessage) return;

    try {
      // Créer une nouvelle copie du message de base
      const msg = createMessageCopy();
      if (!msg) return;

      // Mapper le niveau de variation (les noms diffèrent légèrement)
      const variationLevel = customConfig.variationLevel === 'phrase' || customConfig.variationLevel === 'message'
        ? 'word' // Simplifier phrase/message vers word
        : customConfig.variationLevel;

      // Appliquer le camouflage personnalisé
      applyCustomSymbolPair(msg, {
        symbol0: customConfig.symbol0,
        symbol1: customConfig.symbol1,
        variationLevel,
      });

      message = msg;
      messageVersion++;
      selectedCamouflageId = 'custom';
    } catch (err) {
      if (err instanceof EncoderError) {
        toastStore.error(err.message);
      } else {
        console.error('Erreur camouflage personnalisé:', err);
      }
    }
  }

  function updateConfig(key: string, value: unknown) {
    config = { ...config, [key]: value };
  }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 text-center">
      <img
        src="./logo.svg"
        alt="Scoutocode"
        class="mx-auto transition-all {hasEncoded ? 'h-10' : 'h-20'}"
      />
      {#if !hasEncoded}
        <p class="text-sm text-gray-500 mt-1">Encodeur de messages scout</p>
      {/if}
    </div>
  </header>

  <!-- Main -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
    <InputPanel
      value={inputText}
      onchange={(v) => inputText = v}
    />

    <EncoderSelector
      value={encoderId}
      onchange={(id) => encoderId = id}
      {config}
      onconfigchange={updateConfig}
    />

    <!-- Bouton Coder -->
    <button
      onclick={handleEncode}
      disabled={!encoder || !inputText.trim()}
      class="w-full py-4 text-lg font-semibold text-white rounded-lg transition-all
             disabled:bg-gray-400 disabled:cursor-not-allowed
             bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg"
    >
      Coder le message
    </button>

    <!-- Résultat -->
    {#if message && baseMessage}
      <ResultPanel {message} version={messageVersion} />

      <CamouflagePanel
        message={baseMessage}
        {selectedCamouflageId}
        onselect={handleCamouflageSelect}
        onreset={handleCamouflageReset}
        oncustom={handleCustomCamouflage}
      />
    {/if}
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 py-4">
    <div class="max-w-7xl mx-auto px-4 text-sm text-gray-500">
      <p class="text-center mb-2">
        Outil de codage de messages pour les scouts et guides. Morse, K7, Avocat, code des templiers et bien d'autres pour vos grands jeux et activités.
      </p>
      <div class="flex items-center justify-between">
        <span>Scoutocode v3.0 · AGPL-3.0</span>
        <a
          href="https://github.com/scoutocode/scoutocode"
          target="_blank"
          rel="noopener"
          class="text-primary hover:underline"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
</div>

<ToastContainer />
