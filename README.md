# Shelf — Film & Book Catalog

A small, dependency-light catalog of films and books. Browse a curated set, search it,
filter by genre, sort it, and save titles to a watchlist or a reading list that persists
in the browser.

Built with **React 19 + Vite + Tailwind CSS v4**. No backend.

Repo: <https://github.com/rizantaa/interstellar-shelf>

## Features

- **Two catalogs, one UI** — Movies and Books share the same components (`ItemCard`,
  `ItemGrid`, the detail page, the saved list).
- **Search, filter, sort** — debounced text search (title, creator, year, genre), genre
  chips, and four sort modes. Filter state lives in the URL, so a filtered view is
  shareable and survives a refresh.
- **Detail pages** — cover, metadata, synopsis and a "More like this" row ranked by shared
  genres, then rating.
- **Watchlist + reading list** — stored in `localStorage` via `SavedContext`. Books carry a
  status (*Want to read / Reading / Finished*) and are grouped by it on the Saved page.
- **Dark & light theme** — class-based Tailwind dark mode, no flash on reload, respects
  the OS preference on first visit.
- **Graceful images** — a poster that fails to load falls back to a deterministic gradient
  built from the title, so the grid never looks broken.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run lint     # oxlint
```

## Project layout

```
src/
  components/
    layout/    Navbar, Footer, Container
    ui/        Button, Badge, Tabs, ThemeToggle, EmptyState, Skeleton, icons
    catalog/   SearchBar, GenreFilter, SortSelect, ItemCard, ItemGrid,
               ItemHero, CoverImage, MetaRow, RatingBadge, SectionHeader
    saved/     SaveButton, BookStatusSelect, SavedList
  context/     ThemeContext, SavedContext
  hooks/       useCatalog, useDebounce, useSaved, useTheme
  data/        movies.json, books.json      (generated, see below)
  lib/
    dataSource/  index.js (registry), local.js, tmdb.js, openlibrary.js
    catalog.js   search / filter / sort / similarity (pure)
    format.js    display helpers
  pages/       Home, Detail, Saved, NotFound
scripts/
  fetch-data.mjs   regenerates src/data/*.json
```

## Data

The bundled JSON was generated from public sources, not invented:

| Field | Source |
|---|---|
| Film covers + synopses | Wikipedia REST API (page summary) |
| Book covers + page counts | Open Library search + works API |
| Titles, creators, years, genres | Curated by hand in `scripts/fetch-data.mjs` |
| Ratings | **Approximate sample values**, not official scores |

Film ratings are on a 0–10 scale, book ratings on 0–5. Regenerate the snapshots with:

```bash
node scripts/fetch-data.mjs
```

## Swapping in a live API

All UI code reads data through `src/lib/dataSource/index.js` — never through a concrete
provider. Each provider implements five functions and returns the normalised item shape
documented in that file:

```js
getItems({ type, query, genre, sort })  // -> Item[]
getItem(type, id)                       // -> Item | null
getGenres(type)                         // -> string[]
getSimilar(item, limit)                 // -> Item[]
getFeatured(type)                       // -> Item | null
```

To go live: implement `tmdb.js` (films, needs `VITE_TMDB_API_KEY`) and/or
`openlibrary.js` (books, no key), then flip `ACTIVE` in `index.js`. Because saved items
are keyed by id, switching providers means previously saved ids may no longer resolve —
`SavedContext` simply drops the ones it cannot find.

## Deploy

The build output is a static SPA, so any static host works. `vercel.json` already
configures the SPA rewrite (so `/movie/movie-inception` opens directly instead of 404ing)
and long-lived caching for hashed assets.

```bash
npm run build
npx vercel          # first run links/creates the project and asks you to log in
npx vercel --prod   # promote to the production URL
```

Alternative without a CLI login: run `npm run build`, then drag the `dist` folder onto
<https://vercel.com/new>.

## Notes

- Only `userId`-free public endpoints are used, so there is nothing to configure or leak.
- Reviewer-facing caveat: the ratings are sample data. Everything else on the cards comes
  from the sources above.
