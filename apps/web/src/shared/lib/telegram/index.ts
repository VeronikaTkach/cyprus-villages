// Telegram Mini App bridge — thin adapter layer
// All Telegram-specific logic must be placed here (see CLAUDE.md)
// On MVP1 web: safe no-op implementations

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as Window & { Telegram?: unknown }).Telegram);
}

export function getTelegramWebApp() {
  if (!isTelegramWebApp()) return null;
  return (window as Window & { Telegram?: { WebApp?: unknown } }).Telegram
    ?.WebApp ?? null;
}
