import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',

  // Mobile-first system font stack:
  // - iOS/macOS: San Francisco via -apple-system
  // - Android: Roboto via system-ui
  // - Fallback: generic sans-serif
  fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },

  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },

  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  components: {
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    NavLink: {
      defaultProps: {
        py: 'sm',
      },
    },
  },
});
