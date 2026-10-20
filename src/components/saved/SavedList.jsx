import { Link } from 'react-router-dom'
import { useSaved } from '../../hooks/useSaved.js'
import { summarize } from '../../lib/format.js'
import { Badge } from '../ui/Badge.jsx'
import { CloseIcon } from '../ui/icons.jsx'
import { CoverImage } from '../catalog/CoverImage.jsx'
import { BookStatusSelect } from './BookStatusSelect.jsx'

export function SavedList({ items }) {
  const { remove, bookStatus, setStatus } = useSaved()

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-3 sm:flex-nowrap"
        >
          <Link
            to={`/${item.type}/${encodeURIComponent(item.id)}`}
            className="shrink-0"
            aria-label={`Open ${item.title}`}
          >
            <CoverImage item={item} className="h-24 w-16 rounded-lg" sizes="64px" />
          </Link>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-ink">
              <Link to={`/${item.type}/${encodeURIComponent(item.id)}`} className="hover:text-accent">
                {item.title}
              </Link>
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.creator}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-muted/80">
              {summarize(item)}
            </p>
          </div>

          {item.type === 'book' ? (
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <BookStatusSelect
                size="sm"
                value={bookStatus(item.id)}
                onChange={(status) => setStatus(item.id, status)}
              />
              <Badge tone="outline" className="hidden sm:inline-flex">
                Saved
              </Badge>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => remove(item.type, item.id)}
            aria-label={`Remove ${item.title} from your saved list`}
            title="Remove"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-accent/40 hover:bg-surface-2 hover:text-ink"
          >
            <CloseIcon size={15} />
          </button>
        </li>
      ))}
    </ul>
  )
}
