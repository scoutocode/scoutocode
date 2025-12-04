<script lang="ts">
  import { removeAccents, replaceNumbers, toUpperCase, toLowerCase } from '../../utils/text';

  interface Props {
    value: string;
    onchange: (value: string) => void;
  }

  let { value, onchange }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    onchange(target.value);
  }

  function handleClear() {
    onchange('');
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      onchange(text);
    } catch (err) {
      console.error('Erreur presse-papier:', err);
    }
  }

  function handleAction(action: string) {
    switch (action) {
      case 'paste':
        handlePaste();
        break;
      case 'removeAccents':
        onchange(removeAccents(value).toUpperCase());
        break;
      case 'replaceNumbers':
        onchange(replaceNumbers(value));
        break;
      case 'uppercase':
        onchange(toUpperCase(value));
        break;
      case 'lowercase':
        onchange(toLowerCase(value));
        break;
      case 'testText':
        onchange('"Une difficulté n\'en est plus une, à partir du moment où vous en souriez, où vous l\'affrontez."\nBaden-Powell');
        break;
    }
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-700">Texte à coder</h3>
    <div class="flex items-center gap-2">
      <select
        onchange={(e) => {
          const action = (e.target as HTMLSelectElement).value;
          if (action) handleAction(action);
          (e.target as HTMLSelectElement).value = '';
        }}
        class="text-sm text-gray-500 bg-transparent border-none cursor-pointer hover:text-sky-500"
      >
        <option value="">Modifs rapides</option>
        <option value="paste">Coller</option>
        <option value="removeAccents">Enlever accents</option>
        <option value="replaceNumbers">Nombres en lettres</option>
        <option value="uppercase">Majuscules</option>
        <option value="lowercase">Minuscules</option>
        <option value="testText">Texte de test</option>
      </select>
      {#if value}
        <button
          onclick={handleClear}
          class="text-2xl text-gray-400 hover:text-red-500 transition-colors"
          title="Vider"
        >
          ×
        </button>
      {/if}
    </div>
  </div>
  <textarea
    {value}
    oninput={handleInput}
    placeholder="Entrez votre message ici..."
    class="w-full min-h-48 p-4 font-mono text-base resize-y border-none outline-none"
  ></textarea>
</div>
