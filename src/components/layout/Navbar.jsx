import { Link, useSearchParams } from 'react-router-dom'
import { Container } from './Container.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { BookmarkIcon } from '../ui/icons.jsx'
import { useSaved } from '../../hooks/useSaved.js'

function BrandMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M4 5h5v14H5a1 1 0 0 1-1-1Z" />
        <path d="M9 5h5v14H9zM14 5h4a1 1 0 0 1 1 1v13h-5z" />
      </svg>
    </span>
  )
}

export function Navbar() {
  const [searchParams] = useSearchParams()
  const saved = useSaved()
  const total = saved.count('movie') + saved.count('book')

  const links = [
    { to: '/?type=movie', label: 'Movies', matches: searchParams.get('type') !== 'book' },
    { to: '/?type=book', label: 'Books', matches: searchParams.get('type') === 'book' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-lg font-semibold text-ink">Shelf</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={link.matches ? 'page' : undefined}
              className={`rounded-full px-3.5 py-2 text-sm transition ${
                link.matches ? 'bg-surface-2 font-medium text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/saved"
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm text-ink transition hover:bg-surface-2"
          >
            <BookmarkIcon size={16} filled={total > 0} />
            <span className="hidden sm:inline">Saved</span>
            {total > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-ink">
                {total}
              </span>
            ) : null}
          </Link>
          <ThemeToggle />
        </div>
      </Container>

      {/* Mobile tab row — the desktop nav links are hidden below sm. */}
      <nav className="flex gap-2 border-t border-line/70 px-4 py-2 sm:hidden" aria-label="Catalog sections">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 rounded-full px-3 py-2 text-center text-sm transition ${
              link.matches ? 'bg-accent text-accent-ink' : 'bg-surface text-muted'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
