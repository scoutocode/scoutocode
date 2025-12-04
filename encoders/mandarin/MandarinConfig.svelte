<script lang="ts">
  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  const useSimpleVariant = $derived((config.useSimpleVariant as boolean) ?? false);
</script>

<div class="space-y-4">
  <!-- Explication du code -->
  <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
    <p class="text-sm text-gray-700">
      Il faut compter le nombre de lignes horizontales puis verticales.<br />
      Chaque ligne horizontale nous fait avancer dans l'alphabet en passant de voyelle en voyelle.
      Puis, on avance d'autant de lettres qu'il y a de lignes verticales.
    </p>
  </div>

  <!-- Option pour le code simple -->
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={useSimpleVariant}
      onchange={(e) => onchange('useSimpleVariant', (e.target as HTMLInputElement).checked)}
      class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span class="text-sm text-gray-700">Utiliser une version simplifiée des symboles</span>
  </label>
</div>
