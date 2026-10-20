import { useState } from 'react'
import { coverGradient, initials } from '../../lib/format.js'
import { BookIcon, FilmIcon } from '../ui/icons.jsx'

/**
 * Cover art with a designed fallback: remote posters occasionally 404 or are
 * blocked, and a gradient with the title's initials still reads as intentional.
 */
export function CoverImage({ item, className = '', sizes = '(min-width: 1280px) 18vw, 45vw' }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(item.coverUrl) && !failed

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={showImage ? undefined : { backgroundImage: coverGradient(item) }}
    >
      {showImage ? (
        <img
          src={item.coverUrl}
          alt={`Cover of ${item.title}`}
          loading="lazy"
          decoding="async"
          sizes={sizes}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-white/90">
          <span className="font-display text-3xl font-semibold tracking-wide">
            {initials(item.title)}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-white/60">
            {item.type === 'movie' ? 'Film' : 'Book'}
          </span>
        </div>
      )}

      <span className="pointer-events-none absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white/85 backdrop-blur-sm">
        {item.type === 'movie' ? <FilmIcon size={13} /> : <BookIcon size={13} />}
      </span>
    </div>
  )
}
