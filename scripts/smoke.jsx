/**
 * Render smoke test — catches runtime errors that a successful build will not,
 * e.g. bad imports, undefined destructuring or broken route params.
 *
 * Run with: npm run smoke
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import { SavedProvider } from '../src/context/SavedContext.jsx'
import { ThemeProvider } from '../src/context/ThemeContext.jsx'

const ROUTES = [
  { path: '/', expect: 'Inception' },
  { path: '/?type=book', expect: 'Dune' },
  { path: '/?type=movie&genre=Animation', expect: 'Spirited Away' },
  { path: '/?type=book&q=harari', expect: 'Sapiens' },
  { path: '/movie/movie-parasite', expect: 'Bong Joon-ho' },
  { path: '/book/book-dune', expect: 'Frank Herbert' },
  { path: '/saved', expect: 'Nothing saved yet' },
  { path: '/movie/does-not-exist', expect: '404' },
  { path: '/nonsense/path', expect: '404' },
]

function render(path) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <SavedProvider>
          <App />
        </SavedProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

let failures = 0

for (const { path, expect } of ROUTES) {
  try {
    const html = render(path)
    const ok = html.includes(expect)
    if (!ok) failures += 1
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${path}  (${html.length} bytes, expected "${expect}")`)
  } catch (error) {
    failures += 1
    console.log(`ERROR ${path}  ${error.message}`)
  }
}

console.log(failures ? `\n${failures} route(s) failed` : '\nall routes rendered')
process.exit(failures ? 1 : 0)
