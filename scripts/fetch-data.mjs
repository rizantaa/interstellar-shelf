/**
 * One-off generator for src/data/{movies,books}.json
 *
 * - Movie covers + synopses come from the Wikipedia REST API (summary endpoint).
 * - Book covers + page counts come from the Open Library search/works API.
 * - Genres, directors, runtimes, page counts and ratings are curated by hand (README).
 *
 * The two APIs both rate-limit and both return "best guess" matches, so this script:
 *   1. throttles + retries (429/5xx) and caches every response in .cache/fetch-data.json,
 *      which makes re-runs fast and keeps us inside Wikipedia's limits;
 *   2. restricts book searches to English editions, otherwise a query can resolve to a
 *      Japanese/Swedish/French edition with a translated title;
 *   3. validates title/creator/year and reports MISMATCH instead of silently accepting
 *      the wrong record (exit code 1, JSON still written so the bad rows can be seen).
 *
 * Run with: node scripts/fetch-data.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'film-book-catalog/1.0 (personal portfolio project)'
const CACHE_FILE = resolve(ROOT, '.cache/fetch-data.json')
const WIKI_DELAY_MS = 700

const MOVIES = [
  // --- original batch ---
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

  // --- expansion: fills Horror and History, thickens Romance / Animation / Crime ---
  { title: 'Get Out', wiki: 'Get Out', year: 2017, creator: 'Jordan Peele', runtime: 104, rating: 7.8, genres: ['Horror', 'Mystery', 'Thriller'] },
  { title: 'Hereditary', wiki: 'Hereditary (film)', year: 2018, creator: 'Ari Aster', runtime: 127, rating: 7.3, genres: ['Horror', 'Drama', 'Mystery'] },
  { title: 'Before Sunrise', wiki: 'Before Sunrise', year: 1995, creator: 'Richard Linklater', runtime: 101, rating: 8.1, genres: ['Romance', 'Drama'] },
  { title: 'La La Land', wiki: 'La La Land (film)', year: 2016, creator: 'Damien Chazelle', runtime: 128, rating: 8.0, genres: ['Romance', 'Drama', 'Music'] },
  { title: "Schindler's List", wiki: "Schindler's List", year: 1993, creator: 'Steven Spielberg', runtime: 195, rating: 9.0, genres: ['History', 'Drama'] },
  { title: 'Oppenheimer', wiki: 'Oppenheimer (film)', year: 2023, creator: 'Christopher Nolan', runtime: 180, rating: 8.3, genres: ['History', 'Drama', 'Thriller'] },
  { title: 'The Big Lebowski', wiki: 'The Big Lebowski', year: 1998, creator: 'Joel Coen', runtime: 117, rating: 8.1, genres: ['Comedy', 'Crime'] },
  { title: 'Everything Everywhere All at Once', wiki: 'Everything Everywhere All at Once', year: 2022, creator: 'Daniel Kwan', runtime: 139, rating: 7.8, genres: ['Comedy', 'Sci-Fi', 'Adventure'] },
  { title: 'Toy Story', wiki: 'Toy Story', year: 1995, creator: 'John Lasseter', runtime: 81, rating: 8.3, genres: ['Animation', 'Adventure', 'Comedy'] },
  { title: 'Spider-Man: Into the Spider-Verse', wiki: 'Spider-Man: Into the Spider-Verse', year: 2018, creator: 'Bob Persichetti', runtime: 117, rating: 8.4, genres: ['Animation', 'Action', 'Adventure'] },
  { title: 'John Wick', wiki: 'John Wick (film)', year: 2014, creator: 'Chad Stahelski', runtime: 101, rating: 7.4, genres: ['Action', 'Thriller', 'Crime'] },
  { title: 'Gladiator', wiki: 'Gladiator (2000 film)', year: 2000, creator: 'Ridley Scott', runtime: 155, rating: 8.5, genres: ['Action', 'Drama', 'History'] },
  { title: 'Goodfellas', wiki: 'Goodfellas', year: 1990, creator: 'Martin Scorsese', runtime: 145, rating: 8.7, genres: ['Crime', 'Drama'] },
  { title: 'Se7en', wiki: 'Seven (1995 film)', altTitles: ['Seven'], year: 1995, creator: 'David Fincher', runtime: 127, rating: 8.6, genres: ['Crime', 'Mystery', 'Thriller'] },
  { title: 'Blade Runner 2049', wiki: 'Blade Runner 2049', year: 2017, creator: 'Denis Villeneuve', runtime: 164, rating: 8.0, genres: ['Sci-Fi', 'Drama', 'Mystery'] },
  { title: 'The Matrix', wiki: 'The Matrix', year: 1999, creator: 'Lana Wachowski', runtime: 136, rating: 8.7, genres: ['Sci-Fi', 'Action'] },
  { title: 'The Prestige', wiki: 'The Prestige (film)', year: 2006, creator: 'Christopher Nolan', runtime: 130, rating: 8.5, genres: ['Drama', 'Mystery', 'Sci-Fi'] },
  { title: 'Forrest Gump', wiki: 'Forrest Gump', year: 1994, creator: 'Robert Zemeckis', runtime: 142, rating: 8.8, genres: ['Drama', 'Romance'] },
]

const BOOKS = [
  // --- original batch ---
  { title: 'Dune', creator: 'Frank Herbert', year: 1965, rating: 4.7, genres: ['Sci-Fi', 'Adventure', 'Fantasy'] },
  { title: 'Nineteen Eighty-Four', display: '1984', creator: 'George Orwell', year: 1949, rating: 4.7, genres: ['Sci-Fi', 'Drama', 'Politics'] },
  { title: 'To Kill a Mockingbird', creator: 'Harper Lee', year: 1960, rating: 4.8, genres: ['Drama', 'History'] },
  { title: 'The Hobbit', creator: 'J. R. R. Tolkien', year: 1937, rating: 4.8, genres: ['Fantasy', 'Adventure'] },
  { title: 'The Name of the Wind', creator: 'Patrick Rothfuss', year: 2007, rating: 4.6, genres: ['Fantasy', 'Adventure'] },
  { title: 'Sapiens: A Brief History of Humankind', display: 'Sapiens', creator: 'Yuval Noah Harari', year: 2011, rating: 4.5, genres: ['History', 'Science', 'Politics'] },
  { title: 'The Midnight Library', creator: 'Matt Haig', year: 2020, rating: 4.4, genres: ['Drama', 'Fantasy'] },
  { title: 'Project Hail Mary', creator: 'Andy Weir', year: 2021, rating: 4.8, genres: ['Sci-Fi', 'Adventure', 'Science'] },
  { title: 'Norwegian Wood', creator: 'Haruki Murakami', year: 1987, rating: 4.4, genres: ['Romance', 'Drama'] },
  { title: 'The Left Hand of Darkness', wiki: 'The Left Hand of Darkness', creator: 'Ursula K. Le Guin', year: 1969, rating: 4.5, genres: ['Sci-Fi', 'Drama'] },
  { title: 'Educated', creator: 'Tara Westover', year: 2018, rating: 4.6, genres: ['History', 'Drama'] },
  { title: 'The Silent Patient', wiki: 'The Silent Patient', creator: 'Alex Michaelides', year: 2019, rating: 4.2, genres: ['Mystery', 'Thriller'] },

  // --- expansion: adds Crime, Biography and Philosophy ---
  { title: 'Foundation', creator: 'Isaac Asimov', year: 1951, rating: 4.6, genres: ['Sci-Fi'] },
  { title: 'Neuromancer', creator: 'William Gibson', year: 1984, rating: 4.3, genres: ['Sci-Fi', 'Thriller'] },
  { title: 'The Three-Body Problem', query: 'three body problem cixin', creator: 'Liu Cixin', year: 2008, rating: 4.5, genres: ['Sci-Fi', 'Science'] },
  { title: 'A Game of Thrones', creator: 'George R. R. Martin', year: 1996, rating: 4.7, genres: ['Fantasy', 'Adventure'] },
  { title: 'Mistborn: The Final Empire', display: 'Mistborn', altTitles: ['The Final Empire'], creator: 'Brandon Sanderson', year: 2006, rating: 4.6, genres: ['Fantasy', 'Adventure'] },
  { title: 'The Lies of Locke Lamora', wiki: 'The Lies of Locke Lamora', creator: 'Scott Lynch', year: 2006, rating: 4.5, genres: ['Fantasy', 'Crime', 'Adventure'] },
  { title: 'Gone Girl', wiki: 'Gone Girl (novel)', creator: 'Gillian Flynn', year: 2012, rating: 4.4, genres: ['Mystery', 'Thriller'] },
  { title: 'The Girl with the Dragon Tattoo', creator: 'Stieg Larsson', year: 2005, rating: 4.4, genres: ['Mystery', 'Thriller', 'Crime'] },
  { title: 'And Then There Were None', creator: 'Agatha Christie', year: 1939, rating: 4.6, genres: ['Mystery', 'Crime'] },
  { title: 'Normal People', creator: 'Sally Rooney', year: 2018, rating: 4.2, genres: ['Romance', 'Drama'] },
  { title: 'The Great Gatsby', creator: 'F. Scott Fitzgerald', year: 1925, rating: 4.4, genres: ['Drama', 'Romance'] },
  { title: 'Kafka on the Shore', creator: 'Haruki Murakami', year: 2002, rating: 4.4, genres: ['Drama', 'Fantasy'] },
  { title: 'Guns, Germs, and Steel', creator: 'Jared Diamond', year: 1997, rating: 4.4, genres: ['History', 'Science'] },
  { title: 'The Diary of a Young Girl', creator: 'Anne Frank', year: 1947, rating: 4.7, genres: ['History', 'Biography'] },
  { title: 'Cosmos', creator: 'Carl Sagan', year: 1980, rating: 4.6, genres: ['Science', 'History'] },
  { title: 'Thinking, Fast and Slow', creator: 'Daniel Kahneman', year: 2011, rating: 4.4, genres: ['Science', 'Philosophy'] },
  { title: 'Steve Jobs', creator: 'Walter Isaacson', year: 2011, rating: 4.5, genres: ['Biography', 'History'] },
  { title: 'The Stranger', altTitles: ['The Outsider'], creator: 'Albert Camus', year: 1942, rating: 4.4, genres: ['Philosophy', 'Drama'] },
]

/* ------------------------------------------------------------------ helpers */

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const trim = (text, max = 420) => {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, clean.lastIndexOf(' ', max))}…`
}

/** Strips HTML tags and markdown links that come through in Open Library blurbs. */
const cleanText = (value = '') =>
  String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[(source|\d+)\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Lowercase, accent-free, punctuation-free, leading article removed. */
const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(the|a|an) /, '')
    .trim()

const titleMatches = (expected, actual, alts = []) =>
  [expected, ...alts].some((candidate) => {
    const a = normalize(candidate)
    const b = normalize(actual)
    if (!a || !b) return false
    return a === b || b.startsWith(`${a} `) || a.startsWith(`${b} `)
  })

/** Accepts surname-only or reordered names ("Liu Cixin" vs "Cixin Liu"). */
const creatorMatches = (expected, actualList = []) => {
  const parts = normalize(expected).split(' ').filter((part) => part.length > 2)
  if (!parts.length) return true
  return actualList.some((actual) => {
    const words = normalize(actual).split(' ')
    return parts.filter((part) => words.includes(part)).length >= Math.min(2, parts.length)
  })
}

const yearMatches = (expected, actual, tolerance) => {
  if (!expected || !actual) return true
  return Math.abs(Number(actual) - Number(expected)) <= tolerance
}

/* -------------------------------------------------------------- http + cache */

let cache = {}
try {
  cache = JSON.parse(await readFile(CACHE_FILE, 'utf8'))
} catch {
  cache = {}
}

async function getJson(url, { key = url, attempt = 0, throttle = false } = {}) {
  if (cache[key]) return cache[key]

  // Only pace requests that actually hit the network, and only the first attempt.
  if (throttle && attempt === 0) await sleep(WIKI_DELAY_MS)

  const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })

  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    const wait = 1500 * 2 ** attempt
    console.log(`  ..        ${response.status} for ${key} — retrying in ${wait}ms`)
    await sleep(wait)
    return getJson(url, { key, attempt: attempt + 1 })
  }

  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`)

  const json = await response.json()
  cache[key] = json
  return json
}

async function saveCache() {
  await mkdir(dirname(CACHE_FILE), { recursive: true })
  await writeFile(CACHE_FILE, JSON.stringify(cache), 'utf8')
}

/* ------------------------------------------------------------------ fetchers */

async function fetchMovie(item) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.wiki)}`
  const data = await getJson(url, { key: `wiki:${item.wiki}`, throttle: true })

  const pageTitle = data.title ?? item.wiki
  const cover = data.thumbnail?.source?.replace(/\/\d+px-/, '/600px-/')?.split('?')[0] ?? null

  // Titles that contain a year ("Blade Runner 2049") break naive "first number" parsing,
  // so accept any year mentioned in the lead paragraph.
  const years = [...(data.extract ?? '').matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]))
  const yearOk = years.length === 0 || years.some((year) => yearMatches(item.year, year, 1))

  const problems = []
  if (!titleMatches(item.title, pageTitle, item.altTitles)) problems.push(`title "${pageTitle}"`)
  if (!yearOk) problems.push(`year ${years[0]}`)
  if (!cover) problems.push('no cover')

  return {
    record: {
      id: `movie-${slugify(item.title)}`,
      type: 'movie',
      title: item.title,
      creator: item.creator,
      year: item.year,
      genres: item.genres,
      rating: item.rating,
      coverUrl: cover,
      description: trim(cleanText(data.extract)),
      extra: { runtime: item.runtime },
    },
    problems,
  }
}

const BOOK_FIELDS =
  'key,title,author_name,first_publish_year,cover_i,number_of_pages_median,author_key'

/**
 * Open Library stores works under their original-language title: a perfectly correct match
 * for "Norwegian Wood" can come back as 「ノルウェイの森」 by 「村上春樹」. Resolving the author
 * record gives us the English name plus every alternate spelling, which is what we validate on.
 */
async function resolveAuthorNames(authorKeys = []) {
  const names = []

  for (const key of authorKeys.slice(0, 3)) {
    try {
      const author = await getJson(`https://openlibrary.org/authors/${key}.json`, {
        key: `ol-author:${key}`,
      })
      names.push(author.name, author.personal_name, ...(author.alternate_names ?? []))
    } catch {
      // author lookup is best effort
    }
  }

  return names.filter(Boolean)
}

async function fetchBook(item) {
  const query = item.query ?? `${item.title} ${item.creator}`
  const search = await getJson(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=${BOOK_FIELDS}`,
    { key: `ol-search-v3:${query}` },
  )

  const candidates = []

  for (const doc of (search.docs ?? []).slice(0, 8)) {
    let authorNames = doc.author_name ?? []
    let authorOk = creatorMatches(item.creator, authorNames)

    if (!authorOk && doc.author_key?.length) {
      authorNames = [...authorNames, ...(await resolveAuthorNames(doc.author_key))]
      authorOk = creatorMatches(item.creator, authorNames)
    }

    candidates.push({
      doc,
      authorNames,
      authorOk,
      titleOk: titleMatches(item.title, doc.title, item.altTitles),
      distance: doc.first_publish_year ? Math.abs(doc.first_publish_year - item.year) : 999,
    })
  }

  // The author is the strongest signal (titles get translated), then the closest year,
  // then an English title match, then having a usable cover.
  candidates.sort(
    (a, b) =>
      Number(b.authorOk) - Number(a.authorOk) ||
      a.distance - b.distance ||
      Number(b.titleOk) - Number(a.titleOk) ||
      Number(Boolean(b.doc.cover_i)) - Number(Boolean(a.doc.cover_i)),
  )

  const best = candidates[0] ?? {
    doc: {},
    authorNames: [],
    titleOk: false,
    authorOk: false,
    distance: 999,
  }
  const hit = best.doc

  let description = ''
  if (hit.key) {
    try {
      const work = await getJson(`https://openlibrary.org${hit.key}.json`, { key: `ol-work:${hit.key}` })
      const raw = work.description
      if (typeof raw === 'string') description = raw
      else if (raw?.value) description = raw.value
    } catch {
      // description is optional
    }
  }

  // Open Library blurbs are community-entered: some are empty, some are one-liners like
  // "Best book ever". Anything shorter than a sentence (or a quoted forum comment) is
  // discarded and, when we know the Wikipedia article, replaced with its lead paragraph.
  description = cleanText(description)
  if (description.length < 80 || /^(comment by|review by|best book)/i.test(description)) description = ''

  const warnings = []
  if (!description && item.wiki) {
    try {
      const summary = await getJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.wiki)}`,
        { key: `wiki:${item.wiki}`, throttle: true },
      )
      if (titleMatches(item.title, summary.title ?? '', item.altTitles)) {
        description = cleanText(summary.extract ?? '')
      } else {
        warnings.push(`Wikipedia page "${summary.title}" did not look like this book`)
      }
    } catch {
      warnings.push('no description available')
    }
  }

  if (!description) warnings.push('no description')
  description = description.trim()

  const problems = []

  if (!hit.title) {
    problems.push('no result')
  } else if (!best.authorOk && !best.titleOk) {
    problems.push(`no match for "${hit.title}" by ${best.authorNames.join(', ') || 'unknown'}`)
  }

  // The curated year is what we display, so a different edition year is only worth a note.
  if (best.distance > 10) {
    warnings.push(`Open Library first published ${hit.first_publish_year} (curated ${item.year})`)
  }

  return {
    record: {
      id: `book-${slugify(item.title)}`,
      type: 'book',
      title: item.display ?? item.title,
      creator: item.creator,
      year: item.year ?? hit.first_publish_year ?? null,
      genres: item.genres,
      rating: item.rating,
      coverUrl: hit.cover_i ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null,
      description: trim(description),
      extra: { pages: hit.number_of_pages_median ?? null },
    },
    problems,
    warnings,
  }
}

async function collect(type, items, fetcher) {
  const out = []
  const issues = []
  const warnings = []

  for (const item of items) {
    try {
      const { record, problems, warnings: notes = [] } = await fetcher(item)
      out.push(record)

      if (problems.length) {
        issues.push(`${record.id}: ${problems.join(', ')} (expected "${item.title}" / ${item.creator} / ${item.year})`)
        console.log(`  MISMATCH  ${type} ${item.title} -> ${problems.join(', ')}`)
      } else {
        console.log(`  ok        ${type} ${item.title}`)
      }

      if (notes.length) {
        warnings.push(`${record.id}: ${notes.join(', ')}`)
        console.log(`  note      ${type} ${item.title} -> ${notes.join(', ')}`)
      }
    } catch (error) {
      issues.push(`${type} ${item.title}: fetch failed (${error.message})`)
      console.log(`  FAILED    ${type} ${item.title} -> ${error.message}`)
      out.push({
        id: `${type}-${slugify(item.title)}`,
        type,
        title: item.display ?? item.title,
        creator: item.creator,
        year: item.year ?? null,
        genres: item.genres,
        rating: item.rating,
        coverUrl: null,
        description: '',
        extra: type === 'movie' ? { runtime: item.runtime ?? null } : { pages: null },
      })
    }
  }

  return { out, issues, warnings }
}

/* --------------------------------------------------------------------- main */

const movieResult = await collect('movie', MOVIES, fetchMovie)
const bookResult = await collect('book', BOOKS, fetchBook)

const all = [...movieResult.out, ...bookResult.out]
const issues = [...movieResult.issues, ...bookResult.issues]
const warnings = [...movieResult.warnings, ...bookResult.warnings]

const duplicateIds = all.filter((item, index) => all.findIndex((other) => other.id === item.id) !== index)
const missingCovers = all.filter((item) => !item.coverUrl)

await mkdir(resolve(ROOT, 'src/data'), { recursive: true })
await writeFile(resolve(ROOT, 'src/data/movies.json'), `${JSON.stringify(movieResult.out, null, 2)}\n`, 'utf8')
await writeFile(resolve(ROOT, 'src/data/books.json'), `${JSON.stringify(bookResult.out, null, 2)}\n`, 'utf8')
await saveCache()

console.log(`\nmovies: ${movieResult.out.length}, books: ${bookResult.out.length}`)
console.log(`missing covers: ${missingCovers.length}${missingCovers.length ? ` (${missingCovers.map((item) => item.id).join(', ')})` : ''}`)
console.log(`duplicate ids: ${duplicateIds.length}`)
console.log(`notes: ${warnings.length}`)

if (warnings.length) {
  console.log(`\n${warnings.length} note(s):`)
  warnings.forEach((warning) => console.log(`  - ${warning}`))
}

if (issues.length) {
  console.log(`\n${issues.length} record(s) need a look:`)
  issues.forEach((issue) => console.log(`  - ${issue}`))
  process.exitCode = 1
} else {
  console.log('\nall records validated')
}
