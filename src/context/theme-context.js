import { createContext } from 'react'

/** Kept separate from the provider so Fast Refresh keeps working on ThemeContext.jsx. */
export const ThemeContext = createContext(null)
