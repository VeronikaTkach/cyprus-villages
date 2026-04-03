import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// @testing-library/react registers cleanup automatically when imported directly,
// but our re-export wrapper (@/test/render) can prevent the side effect from firing.
// Registering it explicitly here guarantees the DOM is reset between every test.
afterEach(cleanup);

// Mantine uses ResizeObserver for responsive components; jsdom doesn't provide it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mantine's MantineProvider calls window.matchMedia in a layout effect to detect
// the system colour scheme. jsdom doesn't implement matchMedia, so we stub it with
// a minimal implementation that always reports no preference.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
