import { useState, useCallback } from 'react'

const STORAGE_KEY = 'calendarVisibility'

const DEFAULT_VISIBILITY = {
  chat: true,
  daily: true,
  petcare: true,
  work: true,
  childcare: true,
  major: true,
}

export function useCalendarVisibility() {
  const [visibility, setVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_VISIBILITY, ...JSON.parse(saved) }
      }
    } catch { /* corrupted data */ }
    return { ...DEFAULT_VISIBILITY }
  })

  const toggleVisibility = useCallback((type) => {
    setVisibility((prev) => {
      const next = { ...prev, [type]: !prev[type] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { visibility, toggleVisibility }
}
