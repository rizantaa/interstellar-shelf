/**
 * Cover health check.
 *
 * The catalog hotlinks images from upload.wikimedia.org and covers.openlibrary.org.
 * Those URLs can rot, so this script requests every coverUrl and reports the ones that
 * no longer answer 200. Run it after regenerating data, or any time the grid looks patchy.
 *
 * Run with: node scripts/check-covers.mjs
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONCURRENCY = 8
const TIMEOUT_MS = 15000

async function load(file) {
  const raw = await readFile(resolve(ROOT, 'src/data', file), 'utf8')
  return JSON.parse(raw)
}

async function probe(item) {
  if (!item.coverUrl) return { item, status: 'no url' }

  const attempt = async (method) => {
    const response = await fetch(item.coverUrl, {
      method,
      headers: { 'User-Agent': 'film-book-catalog/1.0 (cover check)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    })
    // Drain the body so the socket is released; covers are small at this size.
    if (method === 'GET') await response.arrayBuffer()
    return response
  }

  try {
    let response = await attempt('HEAD')
    // Some CDNs reject HEAD outright — retry with GET before calling it dead.
    if (response.status === 405 || response.status === 403) response = await attempt('GET')
    return { item, status: response.ok ? 'ok' : `HTTP ${response.status}` }
  } catch (error) {
    return { item, status: `error: ${error.message}` }
  }
}

const items = [...(await load('movies.json')), ...(await load('books.json'))]

const results = []
let cursor = 0

async function worker() {
  while (cursor < items.length) {
    const item = items[cursor]
    cursor += 1
    results.push(await probe(item))
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const dead = results.filter((entry) => entry.status !== 'ok')

console.log(`checked ${results.length} covers · ${results.length - dead.length} ok · ${dead.length} broken`)

for (const entry of dead) {
  console.log(`  ${entry.status.padEnd(12)} ${entry.item.id}  ${entry.item.coverUrl ?? '(none)'}`)
}

if (dead.length) {
  console.log('\nReplace these coverUrls (or drop them — ItemCard falls back to a gradient).')
  process.exitCode = 1
}
