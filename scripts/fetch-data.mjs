/**
 * One-off generator for src/data/{movies,books}.json
 *
 * - Movie covers + descriptions come from the Wikipedia REST API (summary endpoint).
 * - Book covers + page counts come from the Open Library search/works API.
 * - Genres, directors, runtimes and ratings are curated by hand (see notes in README).
 *
 * Run with: node scripts/fetch-data.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'film-book-catalog/1.0 (personal portfolio project)'

const MOVIES = [
  { title: 'Inception', wiki: 'Inception', year: 2010, creator: 'Christopher Nolan', runtime: 148, rating: 8.8, genres: ['Sci-Fi', 'Thriller', 'Action'] },
  { title: 'Interstellar', wiki: 'Interstellar (film)', year: 2014, creator: 'Christopher Nolan', runtime: 169, rating: 8.7, genres: ['Sci-Fi', 'Drama', 'Adventure'] },
  { title: 'The Dark Knight', wiki: 'The Dark Knight', year: 2008, creator: 'Christopher Nolan', runtime: 152, rating: 9.0, genres: ['Action', 'Crime', 'Drama'] },
  { title: 'Parasite', wiki: 'Parasite (2019 film)', year: 2019, creator: 'Bong Joon-ho', runtime: 132, rating: 8.5, genres: ['Thriller', 'Drama', 'Comedy'] },
  { title: 'Spirited Away', wiki: 'Spirited Away', year: 2001, creator: 'Hayao Miyazaki', runtime: 125, rating: 8.6, genres: ['Animation', 'Adventure', 'Fantasy'] },
  { title: 'Pulp Fiction', wiki: 'Pulp Fiction', year: 1994, creator: 'Quentin Tarantino', runtime: 154, rating: 8.9, genres: ['Crime', 'Drama', 'Thriller'] },
  { title: 'The Grand Budapest Hotel', wiki: 'The Grand Budapest Hotel', year: 2014, creator: 'Wes Anderson', runtime: 99, rating: 8.1, genres: ['Comedy', 'Adventure', 'Drama'] },
  { title: 'Whiplash', wiki: 'Whiplash (2014 film)', year: 2014, creator: 'Damien Chazelle', runtime: 106, rating: 8.5, genres: ['Drama', 'Music'] },
  { title: 'Arrival', wiki: 'Arrival (film)', year: 2016, creator: 'Denis Villeneuve', runtime: 116, rating: 7.9, genres: ['Sci-Fi', 'Drama', 'Mystery'] },
  { title: 'The Shawshank Redemption', wiki: 'The Shawshank Redemption', year: 1994, creator: 'Frank Darabont', runtime: 142, rating: 9.3, genres: ['Drama', 'Crime'] },
  { title: 'Mad Max: Fury Road', wiki: 'Mad Max: Fury Road', year: 2015, creator: 'George Miller', runtime: 120, rating: 8.1, genres: ['Action', 'Adventure', 'Sci-Fi'] },
  { title: 'Your Name', wiki: 'Your Name', year: 2016, creator: 'Makoto Shinkai', runtime: 106, rating: 8.4, genres: ['Animation', 'Romance', 'Fantasy'] },
]

const BOOKS = [
  { title: 'Dune', creator: 'Frank Herbert', rating: 4.7, genres: ['Sci-Fi', 'Adventure', 'Fantasy'] },
  { title: 'Nineteen Eighty-Four', display: '1984', creator: 'George Orwell', rating: 4.7, genres: ['Sci-Fi', 'Drama', 'Politics'] },
  { title: 'To Kill a Mockingbird', creator: 'Harper Lee', rating: 4.8, genres: ['Drama', 'History'] },
  { title: 'The Hobbit', creator: 'J. R. R. Tolkien', rating: 4.8, genres: ['Fantasy', 'Adventure'] },
  { title: 'The Name of the Wind', creator: 'Patrick Rothfuss', rating: 4.6, genres: ['Fantasy', 'Adventure'] },
  { title: 'Sapiens: A Brief History of Humankind', display: 'Sapiens', creator: 'Yuval Noah Harari', rating: 4.5, genres: ['History', 'Science', 'Politics'] },
  { title: 'The Midnight Library', creator: 'Matt Haig', rating: 4.4, genres: ['Drama', 'Fantasy'] },
  { title: 'Project Hail Mary', creator: 'Andy Weir', rating: 4.8, genres: ['Sci-Fi', 'Adventure', 'Science'] },
  { title: 'Norwegian Wood', creator: 'Haruki Murakami', rating: 4.4, genres: ['Romance', 'Drama'] },
  { title: 'The Left Hand of Darkness', creator: 'Ursula K. Le Guin', rating: 4.5, genres: ['Sci-Fi', 'Drama'] },
  { title: 'Educated', creator: 'Tara Westover', rating: 4.6, genres: ['History', 'Drama'] },
  { title: 'The Silent Patient', creator: 'Alex Michaelides', rating: 4.2, genres: ['Mystery', 'Thriller'] },
]

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const trim = (text, max = 420) => {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, clean.lastIndexOf(' ', max))}…`
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`)
  return response.json()
}

async function fetchMovie(item) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.wiki)}`
  const data = await getJson(url)
  // Wikipedia hands back a small thumbnail; ask the CDN for a bigger render.
  const cover = data.thumbnail?.source?.replace(/\/\d+px-/, '/600px-/')?.split('?')[0] ?? null

  return {
    id: `movie-${slugify(item.title)}`,
    type: 'movie',
    title: item.title,
    creator: item.creator,
    year: item.year,
    genres: item.genres,
    rating: item.rating,
    coverUrl: cover,
    description: trim(data.extract),
    extra: { runtime: item.runtime },
  }
}

async function fetchBook(item) {
  const query = `${item.title} ${item.creator}`
  const search = await getJson(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median`,
  )
  const hit = search.docs?.[0] ?? {}
  let description = ''
  let year = hit.first_publish_year ?? null

  if (hit.key) {
    try {
      const work = await getJson(`https://openlibrary.org${hit.key}.json`)
      const raw = work.description
      if (typeof raw === 'string') description = raw
      else if (raw?.value) description = raw.value
      year = year ?? work.first_publish_date?.match(/\d{4}/)?.[0] ?? null
    } catch {
      // description is optional
    }
  }

  return {
    id: `book-${slugify(item.title)}`,
    type: 'book',
    title: item.display ?? hit.title ?? item.title,
    creator: item.creator,
    year: year ? Number(year) : null,
    genres: item.genres,
    rating: item.rating,
    coverUrl: hit.cover_i ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null,
    description: trim(description),
    extra: { pages: hit.number_of_pages_median ?? null },
  }
}

async function collect(label, items, fetcher) {
  const out = []
  for (const item of items) {
    try {
      out.push(await fetcher(item))
      console.log(`  ok   ${label} ${item.title}`)
    } catch (error) {
      console.log(`  FAIL ${label} ${item.title} -> ${error.message}`)
      out.push({
        id: `${label}-${slugify(item.title)}`,
        type: label,
        title: item.display ?? item.title,
        creator: item.creator,
        year: item.year ?? null,
        genres: item.genres,
        rating: item.rating,
        coverUrl: null,
        description: '',
        extra: label === 'movie' ? { runtime: item.runtime ?? null } : { pages: null },
      })
    }
  }
  return out
}

const movies = await collect('movie', MOVIES, fetchMovie)
const books = await collect('book', BOOKS, fetchBook)

await mkdir(resolve(ROOT, 'src/data'), { recursive: true })
await writeFile(resolve(ROOT, 'src/data/movies.json'), `${JSON.stringify(movies, null, 2)}\n`, 'utf8')
await writeFile(resolve(ROOT, 'src/data/books.json'), `${JSON.stringify(books, null, 2)}\n`, 'utf8')

const missingCovers = [...movies, ...books].filter((item) => !item.coverUrl).length
console.log(`\nmovies: ${movies.length}, books: ${books.length}, missing covers: ${missingCovers}`)
