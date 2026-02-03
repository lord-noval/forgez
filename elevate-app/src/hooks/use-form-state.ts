"use client";

import { useState, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  globalError: string | null;
}

interface UseFormStateOptions<T> {
  initialData: T;
  validate?: (data: T) => Partial<Record<keyof T, string>> | null;
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseFormStateReturn<T> {
  // State
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  globalError: string | null;
  isDirty: boolean;

  // Actions
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  clearErrors: () => void;
  setGlobalError: (error: string | null) => void;
  reset: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;

  // Helpers
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
  };
  hasError: <K extends keyof T>(field: K) => boolean;
  getError: <K extends keyof T>(field: K) => string | undefined;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFormState<T extends object>({
  initialData,
  validate,
  onSubmit,
  onSuccess,
  onError,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isSuccess: false,
    globalError: null,
  });

  const [isDirty, setIsDirty] = useState(false);

  // Set a single field value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
      isSuccess: false,
    }));
    setIsDirty(true);
  }, []);

  // Set multiple field values
  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...values },
      isSuccess: false,
    }));
    setIsDirty(true);
  }, []);

  // Set error for a specific field
  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  // Clear error for a specific field
  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
      globalError: null,
    }));
  }, []);

  // Set global error
  const setGlobalError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      globalError: error,
    }));
  }, []);

  // Reset form to initial state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      errors: {},
      isSubmitting: false,
      isSuccess: false,
      globalError: null,
    });
    setIsDirty(false);
  }, [initialData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Run validation if provided
    if (validate) {
      const validationErrors = validate(state.data);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setState((prev) => ({
          ...prev,
          errors: validationErrors as Partial<Record<keyof T, string>>,
        }));

        // Scroll to and focus the first error field
        const firstErrorField = Object.keys(validationErrors)[0];
        if (firstErrorField) {
          // Try to find the element by name attribute first
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement | null;
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => element.focus(), 300); // Delay focus to allow scroll to complete
          }
        }

        return;
      }
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      globalError: null,
    }));

    try {
      await onSubmit(state.data);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        isSuccess: true,
        errors: {},
      }));
      setIsDirty(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        isSuccess: false,
        globalError: errorMessage,
      }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.data, validate, onSubmit, onSuccess, onError]);

  // Helper to get field props for form inputs
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    value: state.data[field] as T[K],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setValue(field, value as T[K]);
    },
    onBlur: () => {
      // Could add field-level validation on blur here
    },
  }), [state.data, setValue]);

  // Check if field has an error
  const hasError = useCallback(<K extends keyof T>(field: K) => {
    return !!state.errors[field];
  }, [state.errors]);

  // Get error message for a field
  const getError = useCallback(<K extends keyof T>(field: K) => {
    return state.errors[field];
  }, [state.errors]);

  return {
    // State
    data: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isSuccess: state.isSuccess,
    globalError: state.globalError,
    isDirty,

    // Actions
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setGlobalError,
    reset,
    handleSubmit,

    // Helpers
    getFieldProps,
    hasError,
    getError,
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

export const validators = {
  required: (value: unknown, fieldName: string = "This field") => {
    if (value === undefined || value === null || value === "") {
      return `${fieldName} is required`;
    }
    return undefined;
  },

  email: (value: string) => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  },

  minLength: (value: string, min: number, fieldName: string = "This field") => {
    if (!value) return undefined;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (value: string, max: number, fieldName: string = "This field") => {
    if (!value) return undefined;
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return undefined;
  },

  url: (value: string) => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return "Please enter a valid URL";
    }
  },

  matches: (value: string, pattern: RegExp, message: string) => {
    if (!value) return undefined;
    if (!pattern.test(value)) {
      return message;
    }
    return undefined;
  },
};
