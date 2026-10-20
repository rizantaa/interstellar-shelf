import { useEffect } from 'react'

const BASE = 'Shelf'

/** Keeps the browser tab in sync with the current view. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — Film & Book Catalog`
  }, [title])
}
