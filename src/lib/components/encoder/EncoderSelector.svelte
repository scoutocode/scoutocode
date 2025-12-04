<script lang="ts">
  import { ENCODER_DEFS, getEncoder } from '../../scoutocode';
  import { hasCustomConfig, getConfigComponent } from '../../../../encoders/configs';

  interface Props {
    value: string;
    onchange: (id: string) => void;
    config: Record<string, unknown>;
    onconfigchange: (key: string, value: unknown) => void;
  }

  let { value, onchange, config, onconfigchange }: Props = $props();

  // Filtrer les encodeurs primaires (pas les camouflages)
  const primaryEncoders = ENCODER_DEFS.filter(e => e.isPrimary !== false && !e.isCamouflage);

  // Encoder sélectionné
  const encoder = $derived(value ? getEncoder(value) : null);

  // Composant de config personnalisé ou null
  const customConfigComponent = $derived(value ? getConfigComponent(value) : null);

  // Vérifier si l'encodeur a une config (personnalisée ou helpText)
  const hasConfig = $derived(
    encoder && (hasCustomConfig(value) || encoder.helpText)
  );

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange(target.value);
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
  <select
    {value}
    onchange={handleChange}
    class="w-full p-3 text-base font-medium border border-gray-300 rounded-lg bg-white cursor-pointer
           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
  >
    <option value="">Choisissez un code...</option>
    {#each primaryEncoders as enc}
      <option value={enc.id}>
        {enc.name}{enc.description ? ` - ${enc.description}` : ''}
      </option>
    {/each}
  </select>

  {#if hasConfig && encoder}
    <div class="mt-4 pt-4 border-t border-gray-200">
      {#if customConfigComponent}
        <svelte:component
          this={customConfigComponent}
          {encoder}
          {config}
          onchange={onconfigchange}
        />
      {:else if encoder.helpText}
        <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
          <p class="text-sm text-gray-700">{encoder.helpText}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
