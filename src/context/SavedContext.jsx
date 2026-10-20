import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { SavedContext } from './saved-context.js'

const STORAGE_KEY = 'fbc:saved:v1'
const DEFAULT_BOOK_STATUS = 'want'

const EMPTY = { movie: {}, book: {} }

function hydrate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      movie: parsed?.movie && typeof parsed.movie === 'object' ? parsed.movie : {},
      book: parsed?.book && typeof parsed.book === 'object' ? parsed.book : {},
    }
  } catch {
    return EMPTY
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const bucket = state[action.itemType]
      if (bucket[action.id]) {
        const { [action.id]: _removed, ...rest } = bucket
        return { ...state, [action.itemType]: rest }
      }
      return {
        ...state,
        [action.itemType]: {
          ...bucket,
          [action.id]: {
            savedAt: Date.now(),
            ...(action.itemType === 'book' ? { status: DEFAULT_BOOK_STATUS } : {}),
          },
        },
      }
    }
    case 'remove': {
      const { [action.id]: _removed, ...rest } = state[action.itemType]
      return { ...state, [action.itemType]: rest }
    }
    case 'set-status': {
      const entry = state.book[action.id]
      if (!entry) return state
      return {
        ...state,
        book: { ...state.book, [action.id]: { ...entry, status: action.status } },
      }
    }
    default:
      return state
  }
}

export function SavedProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, hydrate)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* quota or private mode — saves stay in memory for this session */
    }
  }, [state])

  /** Ids of the newest saves first, so the Saved page mirrors how you added them. */
  const savedIds = useCallback(
    (itemType) =>
      Object.entries(state[itemType] ?? {})
        .sort(([, a], [, b]) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
        .map(([id]) => id),
    [state],
  )

  const isSaved = useCallback((itemType, id) => Boolean(state[itemType]?.[id]), [state])

  const bookStatus = useCallback(
    (id) => state.book?.[id]?.status ?? DEFAULT_BOOK_STATUS,
    [state],
  )

  const value = useMemo(
    () => ({
      state,
      savedIds,
      isSaved,
      bookStatus,
      count: (itemType) => Object.keys(state[itemType] ?? {}).length,
      toggle: (itemType, id) => dispatch({ type: 'toggle', itemType, id }),
      remove: (itemType, id) => dispatch({ type: 'remove', itemType, id }),
      setStatus: (id, status) => dispatch({ type: 'set-status', id, status }),
    }),
    [state, savedIds, isSaved, bookStatus],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}
