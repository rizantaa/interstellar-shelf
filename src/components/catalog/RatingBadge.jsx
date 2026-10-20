import { formatRating, typeLabel } from '../../lib/format.js'

/** Scale differs by type: films are rated out of 10, books out of 5. */
export function RatingBadge({ item, className = '' }) {
  const rating = formatRating(item.rating)
  if (!rating) return null

  const outOf = item.type === 'movie' ? '10' : '5'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm ${className}`}
      title={`${typeLabel(item.type)} rating ${rating} of ${outOf}`}
    >
      <span aria-hidden="true">★</span>
      {rating}
    </span>
  )
}
