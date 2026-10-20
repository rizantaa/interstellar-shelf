/**
 * Local data source — the shipped default.
 *
 * Reads the bundled JSON snapshots in src/data and does all filtering in memory.
 * The shape it returns is the normalised item shape documented in ./index.js.
 */
import movies from '../../data/movies.json'
import books from '../../data/books.json'
import { filterItems, normalizeSort, similarItems } from '../catalog.js'

const CATALOG = {
  movie: movies,
  book: books,
}

function pool(type) {
  return CATALOG[type] ?? []
}

export function getItems({ type, query = '', genre = '', sort } = {}) {
  return filterItems(pool(type), { query, genre, sort: normalizeSort(sort) })
}

export function getItem(type, id) {
  return pool(type).find((item) => item.id === id) ?? null
}

export function getGenres(type) {
  const genres = new Set()
  pool(type).forEach((item) => (item.genres ?? []).forEach((genre) => genres.add(genre)))
  return [...genres].sort((a, b) => a.localeCompare(b))
}

export function getSimilar(item, limit = 5) {
  return similarItems(item, pool(item.type), limit)
}

export function getFeatured(type) {
  return [...pool(type)].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? null
}
