// Telegram Mini App back button adapter
// MVP1: safe no-op implementations
// MVP2: integrate with Telegram.WebApp.BackButton API

import { isTelegramWebApp } from './index';

export function showTelegramBackButton(): void {
  if (!isTelegramWebApp()) return;
  // Telegram.WebApp.BackButton.show()
}

export function hideTelegramBackButton(): void {
  if (!isTelegramWebApp()) return;
  // Telegram.WebApp.BackButton.hide()
}

export function onTelegramBackButton(callback: () => void): void {
  if (!isTelegramWebApp()) return;
  // Telegram.WebApp.BackButton.onClick(callback)
  void callback;
}
