<script lang="ts">
  import { renderMessage, type Message, type RenderOutput } from '../../scoutocode';
  import { copyToClipboard, copyHtmlWithImagesToClipboard } from '../../utils/clipboard';

  interface Props {
    message: Message;
    version?: number; // Force re-render quand changé
  }

  let { message, version = 0 }: Props = $props();

  // Niveaux de zoom (index dans le tableau)
  const TEXT_SIZES = [12, 14, 16, 18, 20, 22, 24];  // Pour texte brut
  const HTML_SIZES = [16, 20, 24, 28, 32, 36, 40];  // Pour images/symboles
  const DEFAULT_TEXT_LEVEL = 2;  // 16px
  const DEFAULT_HTML_LEVEL = 1;  // 20px

  let zoomLevel = $state(DEFAULT_TEXT_LEVEL);

  // État pour le rendu (recalculé via effect)
  // format: 'auto' → html si visual, sinon text
  let rendered = $state<RenderOutput>({ kind: 'text', content: '' });

  // Recalculer le rendu quand message ou version change
  $effect(() => {
    // Accéder à version pour créer la dépendance
    void version;

    // format: 'auto' détecte automatiquement selon producedType
    rendered = renderMessage(message, {
      spacing: message.metadata.spacing,
      separators: message.metadata.separators,
    });
  });

  // Détecter si le contenu est HTML (avec images)
  const isHtml = $derived(rendered.kind === 'html');

  // Taille en pixels selon le mode
  const sizes = $derived(isHtml ? HTML_SIZES : TEXT_SIZES);
  const fontSize = $derived(sizes[zoomLevel]);

  // Réinitialiser le zoom au niveau par défaut quand le mode change
  $effect(() => {
    zoomLevel = isHtml ? DEFAULT_HTML_LEVEL : DEFAULT_TEXT_LEVEL;
  });

  let copied = $state(false);
  let htmlContainer: HTMLElement | undefined = $state();

  function handleKeydown(e: KeyboardEvent) {
    // Ctrl+A ou Cmd+A : sélectionner uniquement le contenu de ce conteneur
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (htmlContainer) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(htmlContainer);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  function zoomIn() {
    if (zoomLevel < sizes.length - 1) zoomLevel++;
  }

  function zoomOut() {
    if (zoomLevel > 0) zoomLevel--;
  }

  async function handleCopy() {
    let success: boolean;

    if (isHtml && htmlContainer) {
      // Copie HTML avec images base64 et tailles préservées
      success = await copyHtmlWithImagesToClipboard(htmlContainer);
    } else {
      // Copie texte simple
      success = await copyToClipboard(rendered.content);
    }

    if (success) {
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-700">Message codé</h3>
    <div class="flex items-center gap-2">
      <!-- Contrôles de zoom -->
      <div class="flex items-center gap-1 mr-2">
        <button
          onclick={zoomOut}
          disabled={zoomLevel <= 0}
          class="w-7 h-7 flex items-center justify-center text-lg font-bold border border-gray-300 rounded
                 hover:border-primary hover:text-primary transition-colors
                 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Réduire"
        >
          −
        </button>
        <button
          onclick={zoomIn}
          disabled={zoomLevel >= sizes.length - 1}
          class="w-7 h-7 flex items-center justify-center text-lg font-bold border border-gray-300 rounded
                 hover:border-primary hover:text-primary transition-colors
                 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Agrandir"
        >
          +
        </button>
      </div>
      <button
        onclick={handleCopy}
        class="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg
               hover:border-primary hover:text-primary transition-colors"
      >
        {copied ? '✓ Copié !' : '📋 Copier'}
      </button>
    </div>
  </div>

  <!-- Zone de contenu redimensionnable -->
  <div
    bind:this={htmlContainer}
    tabindex="0"
    onkeydown={handleKeydown}
    class="p-4 font-mono bg-gray-50 h-48 overflow-auto resize-y focus:outline-none {isHtml ? 'result-html' : 'whitespace-pre-wrap break-words'}"
    style="font-size: {fontSize}px;"
  >
    {#if isHtml}
      {@html rendered.content}
    {:else}
      {rendered.content}
    {/if}
  </div>
</div>

<style>
  .result-html {
    line-height: 1.4;
  }

  .result-html :global(.code-symbol) {
    height: 1em;
    width: auto;
    vertical-align: middle;
    display: inline-block;
  }
</style>
