/**
 * TMDB provider — NOT WIRED UP YET.
 *
 * To use it:
 *   1. Create a free key at https://www.themoviedb.org/settings/api
 *   2. Add VITE_TMDB_API_KEY to a local .env file (never commit it)
 *   3. Implement getItems/getItem/getSimilar below and switch ACTIVE in ./index.js
 *
 * Remember to map TMDB's response into the normalised item shape (see ./index.js).
 * Bookmarks only store ids, so switching providers changes which ids exist —
 * old saves in localStorage will simply stop resolving.
 */
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const notImplemented = () => {
  throw new Error(
    API_KEY
      ? 'The TMDB provider is not implemented yet. See lib/dataSource/tmdb.js.'
      : 'Missing VITE_TMDB_API_KEY. See lib/dataSource/tmdb.js.',
  )
}

export const getItems = notImplemented
export const getItem = notImplemented
export const getGenres = notImplemented
export const getSimilar = notImplemented
export const getFeatured = notImplemented
