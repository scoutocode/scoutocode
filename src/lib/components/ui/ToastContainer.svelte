<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toastStore, type ToastType } from '../../stores/toast.svelte';

  const icons: Record<ToastType, string> = {
    error: '!',
    success: '✓',
    warning: '!',
    info: 'i',
  };

  function handleDismiss(id: string) {
    toastStore.dismiss(id);
  }
</script>

<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none items-center">
  {#each toastStore.toasts as toast (toast.id)}
    <button
      class="toast toast-{toast.type} pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
             min-w-[300px] max-w-[500px] cursor-pointer transition-transform hover:-translate-x-1
             backdrop-blur-sm border-l-4"
      transition:fly={{ y: 20, duration: 300 }}
      onclick={() => handleDismiss(toast.id)}
    >
      <span class="toast-icon w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
        {icons[toast.type]}
      </span>
      <span class="flex-1 text-left text-[15px] leading-relaxed">{toast.message}</span>
      <span class="text-xl leading-none opacity-60 hover:opacity-100 transition-opacity">×</span>
    </button>
  {/each}
</div>

<style>
  .toast-error {
    background: rgba(254, 226, 226, 0.95);
    border-color: #dc2626;
    color: #7f1d1d;
  }
  .toast-error .toast-icon {
    background: #dc2626;
    color: white;
  }

  .toast-success {
    background: rgba(220, 252, 231, 0.95);
    border-color: #16a34a;
    color: #14532d;
  }
  .toast-success .toast-icon {
    background: #16a34a;
    color: white;
  }

  .toast-warning {
    background: rgba(254, 243, 199, 0.95);
    border-color: #ea580c;
    color: #7c2d12;
  }
  .toast-warning .toast-icon {
    background: #ea580c;
    color: white;
  }

  .toast-info {
    background: rgba(219, 234, 254, 0.95);
    border-color: #3b82f6;
    color: #1e3a8a;
  }
  .toast-info .toast-icon {
    background: #3b82f6;
    color: white;
  }

  @media (prefers-color-scheme: dark) {
    .toast-error {
      background: rgba(127, 29, 29, 0.95);
      color: #fecaca;
    }
    .toast-success {
      background: rgba(20, 83, 45, 0.95);
      color: #bbf7d0;
    }
    .toast-warning {
      background: rgba(124, 45, 18, 0.95);
      color: #fed7aa;
    }
    .toast-info {
      background: rgba(30, 58, 138, 0.95);
      color: #dbeafe;
    }
  }
</style>
