import { LUCIDE_MOON, LUCIDE_MONITOR, LUCIDE_SUN } from '../constants/index.ts'

export type Theme = 'auto' | 'light' | 'dark'

export function applyTheme(rootEl: HTMLElement, theme: Theme): void {
  if (theme === 'auto') {
    delete rootEl.dataset.theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    rootEl.dataset.autoDark = String(prefersDark)
  } else {
    rootEl.dataset.theme = theme
    delete rootEl.dataset.autoDark
  }
}

export function getThemeIcon(theme: Theme): string {
  if (theme === 'dark') return LUCIDE_MOON
  if (theme === 'light') return LUCIDE_SUN
  return LUCIDE_MONITOR
}

export function createThemeToggle(initial: Theme, onChange: (theme: Theme) => void): HTMLButtonElement {
  let theme = initial

  const btn = document.createElement('button')
  btn.className = 'comark-theme-toggle'
  btn.title = 'Toggle dark mode'
  btn.innerHTML = getThemeIcon(theme)

  btn.addEventListener('click', () => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'light' : 'dark'
    } else if (theme === 'dark') {
      theme = 'light'
    } else {
      theme = 'dark'
    }
    btn.innerHTML = getThemeIcon(theme)
    onChange(theme)
  })

  return btn
}
