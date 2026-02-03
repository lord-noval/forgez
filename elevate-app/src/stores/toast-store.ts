import { create } from "zustand";

// ============================================================================
// Toast Types
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info" | "achievement";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// Store State
// ============================================================================

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;

  // Convenience methods
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  achievement: (message: string, options?: ToastOptions) => string;
}

// ============================================================================
// Default Durations by Type
// ============================================================================

const defaultDurations: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  achievement: 6000,
};

// ============================================================================
// Toast Store
// ============================================================================

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (type, message, options = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = options.duration ?? defaultDurations[type];
    const dismissible = options.dismissible ?? true;

    const toast: Toast = {
      id,
      type,
      message,
      title: options.title,
      duration,
      dismissible,
      action: options.action,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss after duration (unless duration is 0)
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (message, options) => get().addToast("success", message, options),
  error: (message, options) => get().addToast("error", message, options),
  warning: (message, options) => get().addToast("warning", message, options),
  info: (message, options) => get().addToast("info", message, options),
  achievement: (message, options) => get().addToast("achievement", message, options),
}));

// ============================================================================
// useToast Hook (cleaner API)
// ============================================================================

export function useToast() {
  const { success, error, warning, info, achievement, removeToast, clearAll } = useToastStore();

  return {
    success,
    error,
    warning,
    info,
    achievement,
    dismiss: removeToast,
    clearAll,
  };
}
