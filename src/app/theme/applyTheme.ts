export type Theme = 'light' | 'dark'

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}
