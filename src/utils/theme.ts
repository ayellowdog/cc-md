import type { Theme } from '../types'

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
  localStorage.setItem('cc-md-theme', theme)
}

export function getInitialTheme(): Theme {
  const stored = localStorage.getItem('cc-md-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
