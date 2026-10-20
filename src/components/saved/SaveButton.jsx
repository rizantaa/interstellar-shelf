import { useSaved } from '../../hooks/useSaved.js'
import { BookmarkIcon } from '../ui/icons.jsx'

/**
 * Toggles an item in the saved list. Rendered both as an overlay on a card (where
 * it must not trigger the surrounding link) and as a full button on the detail page.
 */
export function SaveButton({ item, variant = 'overlay', className = '' }) {
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(item.type, item.id)

  const handleClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggle(item.type, item.id)
  }

  const label = saved
    ? `Remove ${item.title} from your ${item.type === 'movie' ? 'watchlist' : 'reading list'}`
    : `Save ${item.title} to your ${item.type === 'movie' ? 'watchlist' : 'reading list'}`

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition ${
          saved
            ? 'border-transparent bg-accent text-accent-ink'
            : 'border-white/25 bg-black/45 text-white/85 hover:bg-black/65'
        } ${className}`}
      >
        <BookmarkIcon size={15} filled={saved} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition ${
        saved
          ? 'bg-accent text-accent-ink hover:brightness-110'
          : 'border border-line bg-surface text-ink hover:bg-surface-2'
      } ${className}`}
    >
      <BookmarkIcon size={17} filled={saved} />
      {saved ? 'Saved' : item.type === 'movie' ? 'Add to watchlist' : 'Add to reading list'}
    </button>
  )
}
