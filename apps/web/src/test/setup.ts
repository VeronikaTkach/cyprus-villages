import '@testing-library/jest-dom/vitest';

// Mantine uses ResizeObserver for responsive components; jsdom doesn't provide it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
