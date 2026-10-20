/**
 * Pure catalog logic: searching, sorting and "more like this".
 * No data source knowledge lives here — see lib/dataSource.
 */

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'year-desc', label: 'Newest first' },
  { value: 'year-asc', label: 'Oldest first' },
  { value: 'title', label: 'Title (A–Z)' },
]

export const DEFAULT_SORT = 'rating'

export function normalizeSort(value) {
  return SORT_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_SORT
}

/** Turns an item into the lowercase blob a free-text query is matched against. */
export function searchableText(item) {
  return [item.title, item.creator, item.year, ...(item.genres ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function matchesQuery(item, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = searchableText(item)
  return needle.split(/\s+/).every((word) => haystack.includes(word))
}

export function matchesGenre(item, genre) {
  if (!genre) return true
  return (item.genres ?? []).some((value) => value.toLowerCase() === genre.toLowerCase())
}

export function sortItems(items, sort) {
  const copy = [...items]
  switch (normalizeSort(sort)) {
    case 'year-desc':
      return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    case 'year-asc':
      return copy.sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  }
}

export function filterItems(items, { query = '', genre = '', sort = DEFAULT_SORT } = {}) {
  return sortItems(
    items.filter((item) => matchesQuery(item, query) && matchesGenre(item, genre)),
    sort,
  )
}

/** Same type first, ranked by shared genres, then by rating. */
export function similarItems(item, pool, limit = 5) {
  if (!item) return []
  const genres = new Set(item.genres ?? [])

  return pool
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => ({
      candidate,
      overlap: (candidate.genres ?? []).filter((genre) => genres.has(genre)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || (b.candidate.rating ?? 0) - (a.candidate.rating ?? 0))
    .slice(0, limit)
    .map((entry) => entry.candidate)
}
