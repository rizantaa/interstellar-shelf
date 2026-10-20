/** Presentation helpers shared by every catalog view. */

export const TYPE_LABEL = {
  movie: 'Movie',
  book: 'Book',
}

export const TYPE_LABEL_PLURAL = {
  movie: 'Movies',
  book: 'Books',
}

export const BOOK_STATUS = {
  want: 'Want to read',
  reading: 'Reading',
  finished: 'Finished',
}

export const BOOK_STATUS_ORDER = ['want', 'reading', 'finished']

export function typeLabel(type) {
  return TYPE_LABEL[type] ?? 'Item'
}

export function pluralTypeLabel(type) {
  return TYPE_LABEL_PLURAL[type] ?? 'Items'
}

/** 148 -> "2h 28m" */
export function formatRuntime(minutes) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function formatPages(pages) {
  return pages ? `${pages} pages` : null
}

export function formatRating(rating) {
  return typeof rating === 'number' ? rating.toFixed(1) : null
}

export function formatYear(year) {
  return year ? String(year) : null
}

/** The one-line facts shown under a title in a card. */
export function summarize(item) {
  const parts = [formatYear(item.year), formatRating(item?.rating) && `★ ${formatRating(item.rating)}`]
  if (item.type === 'movie') parts.push(formatRuntime(item?.extra?.runtime))
  else parts.push(formatPages(item?.extra?.pages))
  return parts.filter(Boolean).join(' · ')
}

/** Deterministic gradient so a missing cover still looks intentional. */
export function coverGradient(item) {
  const seed = String(item?.title ?? 'shelf')
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360
  }
  const second = (hash + 48) % 360
  return `linear-gradient(150deg, hsl(${hash} 45% 32%), hsl(${second} 55% 14%))`
}

export function initials(title) {
  return String(title ?? '')
    .replace(/^(The|A|An)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
