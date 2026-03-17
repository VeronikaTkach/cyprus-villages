'use client';

import { useState } from 'react';
import { getTelegramColorScheme } from './index';

export function useTelegramColorScheme(): 'light' | 'dark' {
  const [colorScheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return getTelegramColorScheme();
  });

  return colorScheme;
}
