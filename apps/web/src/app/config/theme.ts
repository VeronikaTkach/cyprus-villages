import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // ── Primary colour ──────────────────────────────────────────
  // Teal stays as the Mantine primary for now; olive-sage accent
  // is applied to individual components via --cv-primary CSS vars
  // starting in Phase 2 (shell) and Phase 3 (cards).
  primaryColor: 'teal',

  // ── Typography ──────────────────────────────────────────────
  // IBM Plex Sans for UI text; Fraunces (serif) for headings.
  // Both are loaded via Google Fonts in layout.tsx.
  fontFamily: "'IBM Plex Sans', -apple-system, system-ui, sans-serif",
  headings: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: '500',
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.15' }, // ~34px
      h2: { fontSize: '1.625rem', lineHeight: '1.15' }, // ~26px
      h3: { fontSize: '1.25rem',  lineHeight: '1.2'  }, // ~20px
      h4: { fontSize: '1.0625rem', lineHeight: '1.3' }, // ~17px
    },
  },

  // ── Font sizes — design scale ────────────────────────────────
  // xs=12  sm=13.5  md=15.5  lg=17  xl=20
  // Mantine uses these values for size="xs" / size="sm" etc.
  fontSizes: {
    xs: '0.75rem',      // 12px
    sm: '0.844rem',     // ~13.5px
    md: '0.969rem',     // ~15.5px
    lg: '1.0625rem',    // ~17px
    xl: '1.25rem',      // 20px
  },

  // ── Radius — design scale ────────────────────────────────────
  // sm=6  md=10  lg=14  xl=20
  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  defaultRadius: 'md',

  // ── Spacing — 8 px base ──────────────────────────────────────
  // xs=4  sm=8  md=16  lg=24  xl=48
  // These map to the --cv-s-* tokens at common increments.
  spacing: {
    xs: '0.25rem',  // 4px  (--cv-s-1)
    sm: '0.5rem',   // 8px  (--cv-s-2)
    md: '1rem',     // 16px (--cv-s-4)
    lg: '1.5rem',   // 24px (--cv-s-6)
    xl: '3rem',     // 48px (--cv-s-12)
  },

  // ── Components ───────────────────────────────────────────────
  components: {
    Container: {
      defaultProps: {
        // 1120px matches --cv-container-base from tokens.css
        size: '1120px',
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
    Card: {
      defaultProps: {
        // Cards use hairline border only — no shadow.
        // shadow is not set here because the design removes it;
        // individual Card usages still pass shadow="sm" until
        // Phase 3 migrates them one by one.
        radius: 'md',
      },
    },
  },
});
