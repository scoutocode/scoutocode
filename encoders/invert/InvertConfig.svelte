<script lang="ts">
  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  const invertNumbers = $derived((config.invertNumbers as boolean) ?? false);
</script>

<div class="space-y-4">
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={invertNumbers}
      onchange={(e) => onchange('invertNumbers', (e.target as HTMLInputElement).checked)}
      class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span class="text-sm text-gray-700">Inverser aussi les chiffres 0↔9, 1↔8</span>
  </label>
</div>
