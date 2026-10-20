import { SORT_OPTIONS } from '../../lib/catalog.js'

export function SortSelect({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="sr-only sm:not-sr-only">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Sort results"
        className="h-10 rounded-full border border-line bg-surface px-3 pr-8 text-sm text-ink focus:border-accent focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
