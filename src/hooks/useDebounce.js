import { useEffect, useState } from 'react'

/** Delays a fast-changing value (search input) so the catalog isn't re-filtered per keystroke. */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
