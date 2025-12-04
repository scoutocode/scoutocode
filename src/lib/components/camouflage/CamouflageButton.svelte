<script lang="ts">
  import type { CamouflageDisplayInfo } from './types';

  interface Props {
    camouflage: CamouflageDisplayInfo;
    selected?: boolean;
    onclick: () => void;
  }

  let { camouflage, selected = false, onclick }: Props = $props();
</script>

<button
  type="button"
  class="flex flex-col items-center gap-2 p-3 bg-white border-2 rounded-lg cursor-pointer
         transition-all hover:border-primary hover:bg-sky-50 hover:-translate-y-0.5 hover:shadow-md
         active:translate-y-0 {selected ? 'border-primary bg-sky-50' : 'border-gray-200'}"
  {onclick}
>
  <!-- Aperçu -->
  {#if camouflage.preview}
    {#if Array.isArray(camouflage.preview)}
      <div class="flex items-center gap-2 text-2xl font-bold text-gray-800">
        <span>{camouflage.preview[0]}</span>
        <span class="text-gray-300">/</span>
        <span>{camouflage.preview[1]}</span>
      </div>
    {:else}
      <div class="text-2xl font-bold text-gray-800">
        {camouflage.preview}
      </div>
    {/if}
  {:else}
    <div class="text-2xl">
      {camouflage.name.charAt(0)}
    </div>
  {/if}

  <!-- Nom -->
  <span class="text-xs font-medium text-gray-600 text-center leading-tight">
    {camouflage.name}
  </span>
</button>
