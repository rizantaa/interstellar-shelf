import { Link } from 'react-router-dom'
import { summarize } from '../../lib/format.js'
import { CoverImage } from './CoverImage.jsx'
import { RatingBadge } from './RatingBadge.jsx'
import { SaveButton } from '../saved/SaveButton.jsx'

export function ItemCard({ item }) {
  return (
    <article className="group relative">
      <Link
        to={`/${item.type}/${encodeURIComponent(item.id)}`}
        className="block rounded-2xl focus-visible:outline-none"
      >
        <div className="card-shadow relative overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 group-hover:-translate-y-1 group-hover:border-accent/40">
          <CoverImage item={item} className="aspect-2/3 w-full" />

          <RatingBadge item={item} className="absolute right-2 top-2" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition group-hover:opacity-100" />
          <p className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-2 text-xs text-white/90 opacity-0 transition group-hover:opacity-100">
            {item.description || 'No description available.'}
          </p>
        </div>
      </Link>

      <div className="absolute right-2 bottom-2 z-10">
        <SaveButton item={item} />
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink">
          <Link to={`/${item.type}/${encodeURIComponent(item.id)}`} className="hover:text-accent">
            {item.title}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted">{item.creator}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted/80">{summarize(item)}</p>
      </div>
    </article>
  )
}
