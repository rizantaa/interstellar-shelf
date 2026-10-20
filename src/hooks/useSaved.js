import { useContext } from 'react'
import { SavedContext } from '../context/saved-context.js'

export function useSaved() {
  const context = useContext(SavedContext)
  if (!context) throw new Error('useSaved must be used inside <SavedProvider>')
  return context
}
