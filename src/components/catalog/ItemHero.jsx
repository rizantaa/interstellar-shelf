import { Link } from 'react-router-dom'
import { summarize, typeLabel } from '../../lib/format.js'
import { Button } from '../ui/Button.jsx'
import { CoverImage } from './CoverImage.jsx'
import { RatingBadge } from './RatingBadge.jsx'
import { SaveButton } from '../saved/SaveButton.jsx'

/** Featured banner at the top of the home page for the active tab. */
export function ItemHero({ item }) {
  if (!item) return null

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      {item.coverUrl ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl"
          style={{ backgroundImage: `url(${item.coverUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-canvas/90 via-canvas/70 to-canvas/30" />

      <div className="relative grid gap-6 p-6 sm:grid-cols-[minmax(0,10rem)_1fr] sm:p-8 lg:gap-10 lg:p-10">
        <div className="relative mx-auto w-32 sm:mx-0 sm:w-full">
          <CoverImage
            item={item}
            className="card-shadow aspect-2/3 w-full rounded-2xl border border-line"
            sizes="240px"
          />
          <RatingBadge item={item} className="absolute right-2 top-2" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Featured {typeLabel(item.type).toLowerCase()}
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {item.title}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {item.creator}
            {summarize(item) ? ` · ${summarize(item)}` : ''}
          </p>
          <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted">
            {item.description || 'No description available for this title yet.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button as={Link} to={`/${item.type}/${encodeURIComponent(item.id)}`}>
              View details
            </Button>
            <SaveButton item={item} variant="full" />
          </div>
        </div>
      </div>
    </section>
  )
}
