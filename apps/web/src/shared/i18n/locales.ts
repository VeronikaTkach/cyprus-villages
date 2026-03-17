import type { TLocale } from './index';

export type TLocaleMessages = {
  common: {
    loading: string;
    error: string;
    empty: string;
    back: string;
  };
  nav: {
    home: string;
    festivals: string;
    villages: string;
    map: string;
  };
};

export type TLocaleDict = Record<TLocale, TLocaleMessages>;

// Placeholder — will be populated in the i18n implementation stage
export const messages: TLocaleDict = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      empty: 'Nothing here yet',
      back: 'Back',
    },
    nav: {
      home: 'Home',
      festivals: 'Festivals',
      villages: 'Villages',
      map: 'Map',
    },
  },
  el: {
    common: {
      loading: 'Φόρτωση...',
      error: 'Κάτι πήγε στραβά',
      empty: 'Δεν υπάρχει τίποτα εδώ ακόμα',
      back: 'Πίσω',
    },
    nav: {
      home: 'Αρχική',
      festivals: 'Φεστιβάλ',
      villages: 'Χωριά',
      map: 'Χάρτης',
    },
  },
};
