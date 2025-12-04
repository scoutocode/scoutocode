/**
 * Store de notifications toast en Svelte 5
 */

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// État réactif avec rune
let toasts = $state<Toast[]>([]);

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function add(type: ToastType, message: string, duration = 4000): string {
  const id = generateId();
  toasts = [...toasts, { id, type, message }];

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }

  return id;
}

function dismiss(id: string): void {
  toasts = toasts.filter(t => t.id !== id);
}

function clear(): void {
  toasts = [];
}

export const toastStore = {
  get toasts() { return toasts; },

  success: (message: string, duration?: number) => add('success', message, duration),
  error: (message: string, duration?: number) => add('error', message, duration),
  warning: (message: string, duration?: number) => add('warning', message, duration),
  info: (message: string, duration?: number) => add('info', message, duration),

  dismiss,
  clear,
};
