import { CloseIcon, SearchIcon } from '../ui/icons.jsx'

export function SearchBar({ value, onChange, placeholder = 'Search by title, creator or genre…' }) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search the catalog"
        className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-11 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          <CloseIcon size={14} />
        </button>
      ) : null}
    </div>
  )
}
