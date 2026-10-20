import { formatPages, formatRating, formatRuntime, formatYear, pluralTypeLabel } from '../../lib/format.js'
import { Badge } from '../ui/Badge.jsx'

export function MetaRow({ item }) {
  const facts = [
    formatYear(item.year),
    item.type === 'movie' ? formatRuntime(item.extra?.runtime) : formatPages(item.extra?.pages),
    formatRating(item.rating) && `★ ${formatRating(item.rating)}${item.type === 'movie' ? '/10' : '/5'}`,
  ].filter(Boolean)

  return (
    <div className="space-y-3">
      <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <div className="flex items-center gap-2">
          <dt className="sr-only">{pluralTypeLabel(item.type)} type</dt>
          <dd>
            <Badge tone="outline">{item.type === 'movie' ? 'Film' : 'Book'}</Badge>
          </dd>
        </div>
        {facts.map((fact) => (
          <div key={fact} className="flex items-center gap-2">
            <dt className="sr-only">Detail</dt>
            <dd>{fact}</dd>
          </div>
        ))}
      </dl>

      {item.genres?.length ? (
        <div className="flex flex-wrap gap-2">
          {item.genres.map((genre) => (
            <Badge key={genre} tone="accent">
              {genre}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
