import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,     // never retry in tests — fail fast
        gcTime: Infinity, // keep cached data for the test's lifetime
      },
    },
  });
}

function TestProviders({ children }: { children: React.ReactNode }) {
  const qc = makeQueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
}

/**
 * Drop-in replacement for @testing-library/react's `render`.
 * Wraps the rendered tree in MantineProvider and QueryClientProvider
 * so components that depend on either can be tested without additional setup.
 */
function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: TestProviders, ...options });
}

// Re-export everything so test files only need to import from '@/test/render'
export * from '@testing-library/react';
export { renderWithProviders as render };
