import React, { type ReactElement, type PropsWithChildren } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { WorldId } from '@/themes/types';

// Mock providers for testing
interface TestProvidersProps extends PropsWithChildren {
  initialWorld?: WorldId;
  initialRoute?: string;
}

// Simple provider wrapper for tests
function TestProviders({ children }: TestProvidersProps): ReactElement {
  return <>{children}</>;
}

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialWorld?: WorldId;
  initialRoute?: string;
}

// Custom render function
function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { initialWorld = 'cosmos', initialRoute = '/', ...renderOptions } = options;

  const user = userEvent.setup();

  const Wrapper = ({ children }: PropsWithChildren) => (
    <TestProviders initialWorld={initialWorld} initialRoute={initialRoute}>
      {children}
    </TestProviders>
  );

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent };

// Override render with custom render
export { customRender as render };

// Utility to wait for async state updates
export async function waitForStateUpdate(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility to create mock event
export function createMockEvent<T extends Record<string, unknown>>(overrides: T = {} as T) {
  return {
    preventDefault: () => {},
    stopPropagation: () => {},
    target: { value: '' },
    currentTarget: { value: '' },
    ...overrides,
  };
}

// Utility to mock form submission
export function createMockFormEvent(formData: Record<string, string> = {}) {
  const form = document.createElement('form');
  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  return {
    preventDefault: () => {},
    stopPropagation: () => {},
    target: form,
    currentTarget: form,
  };
}

// Utility to test accessibility
export async function checkA11y(container: HTMLElement): Promise<void> {
  // Basic accessibility checks
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt') && !img.getAttribute('role')) {
      console.warn('Image missing alt text:', img.outerHTML);
    }
  });

  const buttons = container.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      console.warn('Button missing accessible name:', button.outerHTML);
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach((input) => {
    const id = input.getAttribute('id');
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        console.warn('Input missing label:', input.outerHTML);
      }
    }
  });
}

// Test data generators
export function generateTestId(): string {
  return `test-${Math.random().toString(36).substring(2, 11)}`;
}

export function generateTestEmail(): string {
  return `test-${generateTestId()}@example.com`;
}

export function generateTestDate(daysFromNow: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

export function generateTestDateString(daysFromNow: number = 0): string {
  return generateTestDate(daysFromNow).toISOString().split('T')[0];
}

// DOM query helpers
export function getByTestIdSafe(container: HTMLElement, testId: string): HTMLElement | null {
  return container.querySelector(`[data-testid="${testId}"]`);
}

export function getAllByTestIdSafe(container: HTMLElement, testId: string): HTMLElement[] {
  return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`));
}

// Form testing helpers
export async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  fields: Record<string, string>,
  container: HTMLElement
): Promise<void> {
  for (const [name, value] of Object.entries(fields)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
}

export async function submitForm(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement
): Promise<void> {
  const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    await user.click(submitButton);
  }
}

// Snapshot testing helper
export function createSnapshot(element: HTMLElement): string {
  return element.innerHTML
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

// Mock timers helper
export function advanceTimersByTime(ms: number): void {
  jest.advanceTimersByTime(ms);
}

// CSS variable helper
export function getCSSVariable(element: HTMLElement, variable: string): string {
  return getComputedStyle(element).getPropertyValue(variable).trim();
}

// World theme testing helper
export function setWorldAttribute(world: WorldId): void {
  document.documentElement.setAttribute('data-world', world);
}

export function getWorldAttribute(): string | null {
  return document.documentElement.getAttribute('data-world');
}
