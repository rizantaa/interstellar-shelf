import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../components/layout/Container.jsx'
import { CoverImage } from '../components/catalog/CoverImage.jsx'
import { ItemGrid } from '../components/catalog/ItemGrid.jsx'
import { MetaRow } from '../components/catalog/MetaRow.jsx'
import { RatingBadge } from '../components/catalog/RatingBadge.jsx'
import { SectionHeader } from '../components/catalog/SectionHeader.jsx'
import { BookStatusSelect } from '../components/saved/BookStatusSelect.jsx'
import { SaveButton } from '../components/saved/SaveButton.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ArrowLeftIcon } from '../components/ui/icons.jsx'
import { getItem, getSimilar } from '../lib/dataSource/index.js'
import { typeLabel } from '../lib/format.js'
import { useSaved } from '../hooks/useSaved.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { NotFound } from './NotFound.jsx'

const VALID_TYPES = ['movie', 'book']

export function Detail() {
  const { type, id } = useParams()
  const saved = useSaved()

  const item = VALID_TYPES.includes(type) ? getItem(type, id) : null
  const similar = useMemo(() => (item ? getSimilar(item, 5) : []), [item])

  useDocumentTitle(item?.title)

  if (!item) {
    return (
      <NotFound
        title="Title not found"
        description="That id is not in the catalog. It may have been removed, or the link is wrong."
      />
    )
  }

  const isSaved = saved.isSaved(item.type, item.id)

  return (
    <>
      <div className="relative">
        {item.coverUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-20 blur-3xl"
            style={{ backgroundImage: `url(${item.coverUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 to-canvas" />

        <Container className="relative pt-6">
          <Link
            to={item.type === 'movie' ? '/?type=movie' : '/?type=book'}
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"
          >
            <ArrowLeftIcon size={16} />
            Back to {item.type === 'movie' ? 'movies' : 'books'}
          </Link>

          <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,14rem)_1fr] lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-12">
            <div className="relative mx-auto w-40 sm:mx-0 sm:w-full">
              <CoverImage
                item={item}
                className="card-shadow aspect-2/3 w-full rounded-2xl border border-line"
                sizes="(min-width: 1024px) 272px, 160px"
              />
              <RatingBadge item={item} className="absolute right-3 top-3" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {typeLabel(item.type)}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
                {item.title}
              </h1>
              <p className="mt-3 text-base text-muted">
                {item.type === 'movie' ? 'Directed by ' : 'Written by '}
                <span className="text-ink">{item.creator}</span>
              </p>

              <div className="mt-6">
                <MetaRow item={item} />
              </div>

              <div className="mt-6 max-w-3xl">
                <h2 className="text-lg font-semibold text-ink">About</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description ||
                    'No synopsis is available for this title yet. The catalog data was generated from Wikipedia and Open Library, and some entries have no summary.'}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <SaveButton item={item} variant="full" />
                {item.type === 'book' && isSaved ? (
                  <BookStatusSelect
                    value={saved.bookStatus(item.id)}
                    onChange={(status) => saved.setStatus(item.id, status)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {similar.length ? (
        <Container className="pt-16">
          <SectionHeader
            title="More like this"
            description={`Other ${item.type === 'movie' ? 'films' : 'books'} sharing a genre with ${item.title}.`}
            action={
              <Button
                as={Link}
                to={item.type === 'movie' ? '/?type=movie' : '/?type=book'}
                variant="ghost"
                size="sm"
              >
                See all
              </Button>
            }
          />
          <ItemGrid items={similar} />
        </Container>
      ) : null}
    </>
  )
}
