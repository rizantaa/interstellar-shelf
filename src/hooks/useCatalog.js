import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGenres, getItems } from '../lib/dataSource/index.js'
import { DEFAULT_SORT, normalizeSort } from '../lib/catalog.js'
import { useDebounce } from './useDebounce.js'

const TYPES = ['movie', 'book']
const DEFAULT_TYPE = 'movie'

/**
 * Single source of truth for the browse view. Filter state lives in the URL so a
 * filtered list can be linked and survives a refresh; the text input itself is
 * local state and only reaches the URL after the debounce settles.
 */
export function useCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()

  const typeParam = searchParams.get('type')
  const type = TYPES.includes(typeParam) ? typeParam : DEFAULT_TYPE
  const genre = searchParams.get('genre') ?? ''
  const sort = normalizeSort(searchParams.get('sort') ?? DEFAULT_SORT)
  const query = searchParams.get('q') ?? ''

  const [queryInput, setQueryInput] = useState(query)
  const debouncedQuery = useDebounce(queryInput, 300)

  // Adjust state during render (not in an effect) when the URL changes from elsewhere:
  // back button, a shared link, or the reset button.
  const [lastQuery, setLastQuery] = useState(query)
  if (query !== lastQuery) {
    setLastQuery(query)
    setQueryInput(query)
  }

  const updateParam = useCallback(
    (patch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          Object.entries(patch).forEach(([key, value]) => {
            if (!value) next.delete(key)
            else next.set(key, value)
          })
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Push the settled query into the URL.
  useEffect(() => {
    if (debouncedQuery !== query) updateParam({ q: debouncedQuery })
  }, [debouncedQuery, query, updateParam])

  const genres = useMemo(() => getGenres(type), [type])

  const items = useMemo(
    () => getItems({ type, query: debouncedQuery, genre, sort }),
    [type, debouncedQuery, genre, sort],
  )

  const setType = useCallback(
    (nextType) => {
      if (!TYPES.includes(nextType)) return
      // Genres are per type, so drop a filter that would not exist on the other tab.
      updateParam({ type: nextType === DEFAULT_TYPE ? '' : nextType, genre: '' })
    },
    [updateParam],
  )

  const setGenre = useCallback(
    (next) => updateParam({ genre: next === genre ? '' : next }),
    [genre, updateParam],
  )

  const setSort = useCallback(
    (next) => updateParam({ sort: normalizeSort(next) === DEFAULT_SORT ? '' : next }),
    [updateParam],
  )

  const setQuery = useCallback((next) => setQueryInput(next), [])

  const reset = useCallback(() => {
    setQueryInput('')
    updateParam({ q: '', genre: '', sort: '' })
  }, [updateParam])

  const isFiltering = Boolean(queryInput.trim() || genre)
  const isPending = debouncedQuery.trim() !== query.trim()

  return {
    type,
    genres,
    items,
    query: queryInput,
    genre,
    sort,
    total: items.length,
    isFiltering,
    isLoading: isPending,
    setType,
    setQuery,
    setGenre,
    setSort,
    reset,
  }
}
