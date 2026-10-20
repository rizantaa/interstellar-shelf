import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container.jsx'
import { SavedList } from '../components/saved/SavedList.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SectionHeader } from '../components/catalog/SectionHeader.jsx'
import { BookmarkIcon } from '../components/ui/icons.jsx'
import { getItem } from '../lib/dataSource/index.js'
import { BOOK_STATUS, BOOK_STATUS_ORDER } from '../lib/format.js'
import { useSaved } from '../hooks/useSaved.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

/** Resolves stored ids into items, dropping any id the current data source no longer knows. */
function useSavedItems(itemType, savedIds) {
  return useMemo(
    () =>
      savedIds(itemType)
        .map((id) => getItem(itemType, id))
        .filter(Boolean),
    [itemType, savedIds],
  )
}

export function Saved() {
  const saved = useSaved()
  const movies = useSavedItems('movie', saved.savedIds)
  const books = useSavedItems('book', saved.savedIds)

  useDocumentTitle('Saved')

  const isEmpty = !movies.length && !books.length

  const booksByStatus = BOOK_STATUS_ORDER.map((status) => ({
    status,
    items: books.filter((book) => saved.bookStatus(book.id) === status),
  })).filter((group) => group.items.length)

  return (
    <Container className="pt-10">
      <SectionHeader
        title="Saved"
        description="Your watchlist and reading list. Everything is stored in this browser only."
      />

      {isEmpty ? (
        <EmptyState
          icon={<BookmarkIcon size={22} />}
          title="Nothing saved yet"
          description="Browse the catalog and hit the bookmark on any film or book — it will show up here."
          action={
            <Button as={Link} to="/">
              Browse the catalog
            </Button>
          }
        />
      ) : (
        <div className="space-y-14">
          {movies.length ? (
            <section aria-labelledby="watchlist-heading">
              <h2 id="watchlist-heading" className="mb-4 text-lg font-semibold text-ink">
                Watchlist{' '}
                <span className="text-sm font-normal text-muted">({movies.length})</span>
              </h2>
              <SavedList items={movies} />
            </section>
          ) : null}

          {books.length ? (
            <section aria-labelledby="reading-list-heading">
              <h2 id="reading-list-heading" className="text-lg font-semibold text-ink">
                Reading list <span className="text-sm font-normal text-muted">({books.length})</span>
              </h2>

              <div className="mt-4 space-y-8">
                {booksByStatus.map((group) => (
                  <div key={group.status}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {BOOK_STATUS[group.status]} · {group.items.length}
                    </h3>
                    <SavedList items={group.items} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Container>
  )
}
