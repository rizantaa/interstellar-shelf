import { Container } from './Container.jsx'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line py-8">
      <Container className="flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-sm font-semibold text-ink">Shelf</span> · a film &amp;
          book catalog demo built with React, Vite and Tailwind CSS.
        </p>
        <p>
          Covers and synopses: Wikipedia &amp; Open Library. Ratings are approximate sample values.
        </p>
      </Container>
    </footer>
  )
}
