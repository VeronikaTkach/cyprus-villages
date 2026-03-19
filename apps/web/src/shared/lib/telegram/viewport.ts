// Telegram Mini App viewport adapter
// MVP1: safe no-op implementations
// MVP2: integrate with Telegram.WebApp viewport API

import { getTelegramWebApp, isTelegramWebApp } from './index';

export function getTelegramViewportHeight(): number | null {
  if (!isTelegramWebApp()) return null;
  return getTelegramWebApp()?.viewportHeight ?? null;
}

export function getTelegramViewportStableHeight(): number | null {
  if (!isTelegramWebApp()) return null;
  return getTelegramWebApp()?.viewportStableHeight ?? null;
}

export function expandTelegramViewport(): void {
  if (!isTelegramWebApp()) return;
  getTelegramWebApp()?.expand();
}
