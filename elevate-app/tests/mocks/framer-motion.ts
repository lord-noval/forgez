import { vi } from 'vitest';
import type { ComponentType, PropsWithChildren } from 'react';

// Mock motion components - replace with simple HTML elements
export const motion = {
  div: 'div',
  span: 'span',
  button: 'button',
  ul: 'ul',
  li: 'li',
  nav: 'nav',
  section: 'section',
  article: 'article',
  main: 'main',
  header: 'header',
  footer: 'footer',
  aside: 'aside',
  form: 'form',
  input: 'input',
  label: 'label',
  p: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  a: 'a',
  img: 'img',
  svg: 'svg',
  path: 'path',
  circle: 'circle',
  rect: 'rect',
  g: 'g',
} as unknown as Record<string, ComponentType<PropsWithChildren<Record<string, unknown>>>>;

// AnimatePresence just renders children
export const AnimatePresence = ({ children }: PropsWithChildren) => children;

// Motion value mocks
export const useMotionValue = (initial: number = 0) => ({
  get: vi.fn(() => initial),
  set: vi.fn(),
  onChange: vi.fn(() => () => {}),
  isAnimating: vi.fn(() => false),
});

export const useTransform = () => ({
  get: vi.fn(() => 0),
  set: vi.fn(),
});

export const useSpring = (value: unknown) => ({
  get: vi.fn(() => (typeof value === 'number' ? value : 0)),
  set: vi.fn(),
});

export const useVelocity = () => ({
  get: vi.fn(() => 0),
  set: vi.fn(),
});

// Animation controls mock
export const useAnimation = () => ({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  set: vi.fn(),
  mount: vi.fn(),
  unmount: vi.fn(),
});

// Variants mock
export const useReducedMotion = () => false;

// InView hook mock
export const useInView = () => true;

// Scroll hooks mock
export const useScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

export const useViewportScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

// Drag hooks mock
export const useDragControls = () => ({
  start: vi.fn(),
});

// Cycle hook mock
export const useCycle = <T,>(...values: T[]): [T, () => void] => {
  let index = 0;
  return [values[index], () => { index = (index + 1) % values.length; }];
};

// Presence mock
export const usePresence = () => [true, vi.fn()] as const;
export const useIsPresent = () => true;

// Motion config provider mock
export const MotionConfig = ({ children }: PropsWithChildren) => children;

// LazyMotion mock
export const LazyMotion = ({ children }: PropsWithChildren<{ features?: unknown }>) => children;
export const domAnimation = {};
export const domMax = {};

// Reorder mock
export const Reorder = {
  Group: ({ children }: PropsWithChildren<{ axis?: string; values?: unknown[]; onReorder?: (values: unknown[]) => void }>) => children,
  Item: 'div' as unknown as ComponentType<PropsWithChildren<{ value: unknown }>>,
};

// LayoutGroup mock
export const LayoutGroup = ({ children }: PropsWithChildren<{ id?: string }>) => children;

// Motion value utilities
export const motionValue = (initial: number = 0) => ({
  get: () => initial,
  set: vi.fn(),
  onChange: vi.fn(() => () => {}),
});

export const animate = vi.fn().mockResolvedValue({
  stop: vi.fn(),
  then: vi.fn().mockResolvedValue(undefined),
});

export const transform = (value: number, inputRange: number[], outputRange: number[]): number => {
  const inputMin = inputRange[0];
  const inputMax = inputRange[inputRange.length - 1];
  const outputMin = outputRange[0];
  const outputMax = outputRange[outputRange.length - 1];

  const normalized = (value - inputMin) / (inputMax - inputMin);
  return outputMin + normalized * (outputMax - outputMin);
};

// Easing functions mock
export const easeIn = (t: number) => t * t;
export const easeOut = (t: number) => t * (2 - t);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

// SVG motion components
export const m = motion;
