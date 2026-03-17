// Telegram Mini App bridge — thin adapter layer
// All Telegram-specific logic must be placed here (see CLAUDE.md)
// On MVP1 web: safe no-op implementations

import type { ITelegramThemeParams, ITelegramWebApp } from './types';

export type { ITelegramThemeParams, ITelegramWebApp };

type TWindow = Window & { Telegram?: { WebApp?: ITelegramWebApp } };

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as TWindow).Telegram?.WebApp);
}

export function getTelegramWebApp(): ITelegramWebApp | null {
  if (!isTelegramWebApp()) return null;
  return (window as TWindow).Telegram?.WebApp ?? null;
}

export function getTelegramThemeParams(): ITelegramThemeParams | null {
  return getTelegramWebApp()?.themeParams ?? null;
}

export function getTelegramColorScheme(): 'light' | 'dark' {
  return getTelegramWebApp()?.colorScheme ?? 'light';
}
