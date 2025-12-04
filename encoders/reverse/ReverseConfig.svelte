<script lang="ts">
  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  const preserveCase = $derived((config.preserveCase as boolean) ?? true);
</script>

<div class="space-y-4">
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={preserveCase}
      onchange={(e) => onchange('preserveCase', (e.target as HTMLInputElement).checked)}
      class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span class="text-sm text-gray-700">Conserver la casse et la ponctuation</span>
  </label>
</div>
