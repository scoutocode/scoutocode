<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CamouflageDisplayInfo } from './types';
  import CamouflageButton from './CamouflageButton.svelte';

  interface Props {
    title: string;
    camouflages: CamouflageDisplayInfo[];
    selectedId?: string;
    onselect: (camouflage: CamouflageDisplayInfo) => void;
    children?: Snippet;
  }

  let { title, camouflages, selectedId, onselect, children }: Props = $props();
</script>

{#if camouflages.length > 0}
  <div class="mb-4">
    <h4 class="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {#each camouflages as cam (cam.id)}
        <CamouflageButton
          camouflage={cam}
          selected={selectedId === cam.id}
          onclick={() => onselect(cam)}
        />
      {/each}
      {#if children}{@render children()}{/if}
    </div>
  </div>
{/if}
