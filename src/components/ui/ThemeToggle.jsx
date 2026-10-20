import { useTheme } from '../../hooks/useTheme.js'
import { MoonIcon, SunIcon } from './icons.jsx'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
