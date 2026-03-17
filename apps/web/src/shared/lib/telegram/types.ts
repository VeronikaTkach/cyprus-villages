export interface ITelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface ITelegramWebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: ITelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready(): void;
  expand(): void;
  close(): void;
}
