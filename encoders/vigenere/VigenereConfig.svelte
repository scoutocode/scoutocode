<script lang="ts">
  interface Props {
    config: Record<string, unknown>;
    onchange: (key: string, value: unknown) => void;
  }

  let { config, onchange }: Props = $props();

  const key = $derived((config.key as string) ?? '');
  const isDecodingKey = $derived((config.isDecodingKey as boolean) ?? false);
</script>

<div class="space-y-4">
  <!-- Info box -->
  <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg">
    <p class="text-sm text-gray-700">
      Chaque lettre de votre clef indique de combien décaler la lettre correspondante du message.<br/>
      Par exemple, avec la clef <strong>ABRI</strong> : la 1<sup>re</sup> lettre est décalée de <strong>A</strong> (0 position, pas de décalage),
      la 2<sup>e</sup> de <strong>B</strong> (1 position), la 3<sup>e</sup> de <strong>R</strong> (17 positions), la 4<sup>e</sup> de <strong>I</strong> (8 positions), etc.
      La clef se répète tout au long du message.<br/><br/>
      Dans le cadre d'un jeu, il est conseillé que la clé serve à décoder le texte plutôt que faire faire l'opération inverse aux participants.
    </p>
  </div>

  <!-- Key input -->
  <div class="flex items-center gap-3">
    <label for="vigenere-key" class="text-sm font-medium text-gray-700 whitespace-nowrap">
      Clef
    </label>
    <input
      id="vigenere-key"
      type="text"
      value={key}
      oninput={(e) => onchange('key', (e.target as HTMLInputElement).value.toUpperCase())}
      placeholder=""
      class="flex-1 p-2 border border-gray-300 rounded-lg uppercase
             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>

  <!-- Decoding key checkbox -->
  <label class="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={isDecodingKey}
      onchange={(e) => onchange('isDecodingKey', (e.target as HTMLInputElement).checked)}
      class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
    />
    <span class="text-sm text-gray-700">La clé sera utilisée pour le décodage</span>
  </label>
</div>

<style>
  input[type="text"] {
    text-transform: uppercase;
  }
</style>
