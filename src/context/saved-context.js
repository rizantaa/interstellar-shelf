import { createContext } from 'react'

/** Kept separate from the provider so Fast Refresh keeps working on SavedContext.jsx. */
export const SavedContext = createContext(null)
