<script lang="ts">
  import { getCompatibleCamouflages, type Message, type EncoderInfo } from '../../scoutocode';

  interface Props {
    message: Message;
    value: string;
    onchange: (id: string) => void;
  }

  let { message, value, onchange }: Props = $props();

  // Récupérer les camouflages compatibles avec le message actuel
  const compatible = $derived(getCompatibleCamouflages(message));

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange(target.value);
  }
</script>

{#if compatible.length > 0}
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <label class="block text-sm font-semibold text-gray-700 mb-2">
      Camouflage (optionnel)
    </label>
    <select
      {value}
      onchange={handleChange}
      class="w-full p-3 text-base border border-gray-300 rounded-lg bg-white cursor-pointer
             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      <option value="">(Aucun)</option>
      {#each compatible as cam}
        <option value={cam.id}>
          {cam.name} - {cam.description}
        </option>
      {/each}
    </select>
  </div>
{/if}
