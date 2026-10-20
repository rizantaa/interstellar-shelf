import { useMemo } from 'react'
import { Container } from '../components/layout/Container.jsx'
import { GenreFilter } from '../components/catalog/GenreFilter.jsx'
import { ItemGrid } from '../components/catalog/ItemGrid.jsx'
import { ItemHero } from '../components/catalog/ItemHero.jsx'
import { SearchBar } from '../components/catalog/SearchBar.jsx'
import { SortSelect } from '../components/catalog/SortSelect.jsx'
import { SectionHeader } from '../components/catalog/SectionHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { SkeletonGrid } from '../components/ui/Skeleton.jsx'
import { Tabs } from '../components/ui/Tabs.jsx'
import { BookIcon, FilmIcon, SearchOffIcon } from '../components/ui/icons.jsx'
import { getFeatured } from '../lib/dataSource/index.js'
import { pluralTypeLabel } from '../lib/format.js'
import { useCatalog } from '../hooks/useCatalog.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const TABS = [
  { value: 'movie', label: 'Movies', icon: <FilmIcon size={15} /> },
  { value: 'book', label: 'Books', icon: <BookIcon size={15} /> },
]

export function Home() {
  const catalog = useCatalog()
  const { type, items, query, genre, sort, total, isLoading, isFiltering, genres } = catalog

  // The hero always shows the top-rated title of the active tab, ignoring filters.
  const featured = useMemo(() => getFeatured(type), [type])

  useDocumentTitle(type === 'movie' ? 'Movies' : 'Books')

  return (
    <>
      {/* While searching, the hero competes with the results — hide it. */}
      {!isFiltering ? (
        <Container className="pt-8">
          <ItemHero item={featured} />
        </Container>
      ) : null}

      <Container className={isFiltering ? 'pt-8' : 'pt-10'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs tabs={TABS} value={type} onChange={catalog.setType} />
          <p className="text-sm text-muted" aria-live="polite">
            <span className="font-semibold text-ink">{total}</span>{' '}
            {total === 1 ? 'title' : 'titles'}
            {isFiltering ? ' match your filters' : ` in ${pluralTypeLabel(type)}`}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <SearchBar value={query} onChange={catalog.setQuery} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <GenreFilter genres={genres} value={genre} onChange={catalog.setGenre} />
            </div>
            <SortSelect value={sort} onChange={catalog.setSort} />
          </div>
        </div>

        <SectionHeader
          className="mt-10"
          title={isFiltering ? 'Results' : `Browse ${pluralTypeLabel(type).toLowerCase()}`}
          description={
            isFiltering
              ? 'Filtered from the curated catalog.'
              : 'A hand-picked, small catalog — search it, filter it, and save what you like.'
          }
          action={
            isFiltering ? (
              <Button variant="outline" size="sm" onClick={catalog.reset}>
                Clear filters
              </Button>
            ) : null
          }
        />

        {isLoading ? (
          <SkeletonGrid />
        ) : items.length ? (
          <ItemGrid items={items} />
        ) : (
          <EmptyState
            icon={<SearchOffIcon size={22} />}
            title="No titles found"
            description={`Nothing matches “${query || genre}”. Try a different keyword or clear the filters.`}
            action={
              <Button variant="outline" onClick={catalog.reset}>
                Clear filters
              </Button>
            }
          />
        )}
      </Container>
    </>
  )
}
