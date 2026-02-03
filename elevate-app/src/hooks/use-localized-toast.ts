"use client";

import { useTranslations } from "next-intl";
import { useToast, type ToastOptions } from "@/stores/toast-store";

/**
 * A hook that provides localized toast notifications.
 * Wraps the base toast store with translations from common.toast namespace.
 *
 * @example
 * const toast = useLocalizedToast();
 *
 * // Use predefined messages
 * toast.saved();           // "Changes saved successfully"
 * toast.created();         // "Created successfully"
 * toast.networkError();    // "Network error. Check your connection."
 *
 * // Or use custom messages
 * toast.success("Custom success message");
 * toast.error("Custom error message");
 */
export function useLocalizedToast() {
  const t = useTranslations("common.toast");
  const toast = useToast();

  return {
    // Raw methods for custom messages
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    dismiss: toast.dismiss,
    clearAll: toast.clearAll,

    // Success shortcuts
    saved: (options?: ToastOptions) =>
      toast.success(t("success.saved"), {
        title: t("success.title"),
        ...options,
      }),

    created: (options?: ToastOptions) =>
      toast.success(t("success.created"), {
        title: t("success.title"),
        ...options,
      }),

    updated: (options?: ToastOptions) =>
      toast.success(t("success.updated"), {
        title: t("success.title"),
        ...options,
      }),

    deleted: (options?: ToastOptions) =>
      toast.success(t("success.deleted"), {
        title: t("success.title"),
        ...options,
      }),

    uploaded: (options?: ToastOptions) =>
      toast.success(t("success.uploaded"), {
        title: t("success.title"),
        ...options,
      }),

    sent: (options?: ToastOptions) =>
      toast.success(t("success.sent"), {
        title: t("success.title"),
        ...options,
      }),

    copied: (options?: ToastOptions) =>
      toast.success(t("success.copied"), {
        title: t("success.title"),
        duration: 2000,
        ...options,
      }),

    // Error shortcuts
    genericError: (options?: ToastOptions) =>
      toast.error(t("error.generic"), {
        title: t("error.title"),
        ...options,
      }),

    networkError: (options?: ToastOptions) =>
      toast.error(t("error.network"), {
        title: t("error.title"),
        ...options,
      }),

    unauthorizedError: (options?: ToastOptions) =>
      toast.error(t("error.unauthorized"), {
        title: t("error.title"),
        ...options,
      }),

    notFoundError: (options?: ToastOptions) =>
      toast.error(t("error.notFound"), {
        title: t("error.title"),
        ...options,
      }),

    validationError: (options?: ToastOptions) =>
      toast.error(t("error.validation"), {
        title: t("error.title"),
        ...options,
      }),

    uploadError: (options?: ToastOptions) =>
      toast.error(t("error.upload"), {
        title: t("error.title"),
        ...options,
      }),

    saveError: (options?: ToastOptions) =>
      toast.error(t("error.save"), {
        title: t("error.title"),
        ...options,
      }),

    // Warning shortcuts
    unsavedChanges: (options?: ToastOptions) =>
      toast.warning(t("warning.unsavedChanges"), {
        title: t("warning.title"),
        duration: 0, // Don't auto-dismiss
        ...options,
      }),

    sessionExpiring: (options?: ToastOptions) =>
      toast.warning(t("warning.sessionExpiring"), {
        title: t("warning.title"),
        duration: 0,
        ...options,
      }),

    limitReached: (options?: ToastOptions) =>
      toast.warning(t("warning.limitReached"), {
        title: t("warning.title"),
        ...options,
      }),

    deprecated: (options?: ToastOptions) =>
      toast.warning(t("warning.deprecated"), {
        title: t("warning.title"),
        ...options,
      }),

    // Info shortcuts
    welcome: (options?: ToastOptions) =>
      toast.info(t("info.welcome"), {
        title: t("info.title"),
        ...options,
      }),

    newFeature: (options?: ToastOptions) =>
      toast.info(t("info.newFeature"), {
        title: t("info.title"),
        ...options,
      }),

    offline: (options?: ToastOptions) =>
      toast.info(t("info.offline"), {
        title: t("info.title"),
        duration: 0,
        ...options,
      }),

    syncing: (options?: ToastOptions) =>
      toast.info(t("info.syncing"), {
        title: t("info.title"),
        ...options,
      }),
  };
}
