<script lang="ts">
  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  const useRandomLetters = $derived((config.useRandomLetters as boolean) ?? true);
  const randomCount = $derived((config.randomCount as number) ?? 1);
  const pattern = $derived((config.pattern as string) ?? 'X');
</script>

<div class="space-y-4">
  <!-- Explication du code -->
  <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
    <p class="text-sm text-gray-700">
      Des lettres parasites sont insérées entre chaque lettre du message.<br/>
      Pour décoder, il suffit de retirer ces lettres intercalées.
    </p>
  </div>

  <!-- Option lettres aléatoires -->
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={useRandomLetters}
      onchange={(e) => onchange('useRandomLetters', (e.target as HTMLInputElement).checked)}
      class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span class="text-sm text-gray-700">Lettres aléatoires</span>
  </label>

  {#if useRandomLetters}
    <!-- Nombre de lettres aléatoires -->
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
        Nombre de lettres
      </label>
      <input
        type="number"
        value={randomCount}
        oninput={(e) => {
          const value = parseInt((e.target as HTMLInputElement).value);
          if (value >= 1 && value <= 10) {
            onchange('randomCount', value);
          }
        }}
        min={1}
        max={10}
        class="w-20 p-2 border border-gray-300 rounded-lg text-center
               focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  {:else}
    <!-- Lettres à intercaler manuellement -->
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
        Lettres à intercaler
      </label>
      <input
        type="text"
        value={pattern}
        oninput={(e) => {
          const value = (e.target as HTMLInputElement).value.toUpperCase();
          onchange('pattern', value);
        }}
        placeholder="AS"
        class="flex-1 p-2 border border-gray-300 rounded-lg uppercase
               focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  {/if}
</div>

<style>
  input[type="text"] {
    text-transform: uppercase;
  }
</style>
