/**
 * Open Library provider — NOT WIRED UP YET.
 *
 * Open Library needs no key: https://openlibrary.org/developers/api
 * It is the natural live replacement for the bundled books.json.
 *
 * Wire-up checklist:
 *   1. Implement the five functions below, mapping responses into the normalised
 *      item shape documented in ./index.js (covers: covers.openlibrary.org/b/id/{id}-L.jpg)
 *   2. Decide how movies are served once books come from here — either run a
 *      per-type provider split or keep both sources behind one facade
 *   3. Switch ACTIVE in ./index.js
 */
const notImplemented = () => {
  throw new Error('The Open Library provider is not implemented yet. See lib/dataSource/openlibrary.js.')
}

export const getItems = notImplemented
export const getItem = notImplemented
export const getGenres = notImplemented
export const getSimilar = notImplemented
export const getFeatured = notImplemented
