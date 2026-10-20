import { SlidersIcon } from '../ui/icons.jsx'

export function GenreFilter({ genres, value, onChange }) {
  if (!genres.length) return null

  return (
    <div className="flex items-center gap-2">
      <span className="hidden shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted sm:inline-flex">
        <SlidersIcon size={14} />
        Genre
      </span>
      <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Filter by genre">
        <button
          type="button"
          onClick={() => onChange('')}
          aria-pressed={!value}
          className={`h-9 shrink-0 rounded-full border px-3.5 text-sm transition ${
            !value
              ? 'border-transparent bg-accent text-accent-ink'
              : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink'
          }`}
        >
          All genres
        </button>
        {genres.map((genre) => {
          const isActive = genre.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={genre}
              type="button"
              onClick={() => onChange(genre)}
              aria-pressed={isActive}
              className={`h-9 shrink-0 rounded-full border px-3.5 text-sm transition ${
                isActive
                  ? 'border-transparent bg-accent text-accent-ink'
                  : 'border-line bg-surface text-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {genre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
