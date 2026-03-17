import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  headings: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
});
