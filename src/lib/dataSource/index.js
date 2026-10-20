/**
 * Data source registry.
 *
 * UI code (pages, components, hooks) must only ever import from this file, never
 * from a concrete provider. Swapping the bundled JSON for a live API is therefore
 * a one-line change here.
 *
 * Every provider implements the same five functions and returns items in this shape:
 *
 *   {
 *     id: string,                 // unique across the whole catalog, e.g. "movie-inception"
 *     type: 'movie' | 'book',
 *     title: string,
 *     creator: string,            // director for films, author for books
 *     year: number | null,
 *     genres: string[],
 *     rating: number | null,      // films: 0-10, books: 0-5
 *     coverUrl: string | null,    // null is fine — ItemCard renders a gradient fallback
 *     description: string,
 *     extra: { runtime } | { pages }
 *   }
 */
import * as local from './local.js'

/** @type {'local' | 'tmdb' | 'openlibrary'} */
const ACTIVE = 'local'

const providers = {
  local,
  // tmdb,
  // openlibrary,
}

const provider = providers[ACTIVE]

export function getItems(options) {
  return provider.getItems(options)
}

export function getItem(type, id) {
  return provider.getItem(type, id)
}

export function getGenres(type) {
  return provider.getGenres(type)
}

export function getSimilar(item, limit) {
  return provider.getSimilar(item, limit)
}

export function getFeatured(type) {
  return provider.getFeatured(type)
}
