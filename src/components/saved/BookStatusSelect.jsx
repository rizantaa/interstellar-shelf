import { BOOK_STATUS, BOOK_STATUS_ORDER } from '../../lib/format.js'

export function BookStatusSelect({ value, onChange, size = 'md' }) {
  return (
    <div
      role="group"
      aria-label="Reading status"
      className="inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-surface p-1"
    >
      {BOOK_STATUS_ORDER.map((status) => {
        const isActive = status === value
        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            aria-pressed={isActive}
            className={`rounded-full px-3 font-medium transition ${
              size === 'sm' ? 'h-7 text-xs' : 'h-9 text-sm'
            } ${
              isActive
                ? 'bg-accent text-accent-ink'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {BOOK_STATUS[status]}
          </button>
        )
      })}
    </div>
  )
}
