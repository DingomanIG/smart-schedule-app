import { useState, useEffect } from 'react'
import { CURRENT_VERSION } from '../data/versionHistory'

const STORAGE_KEY = 'lastSeenVersion'

export function useVersionCheck() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    if (lastSeen !== CURRENT_VERSION) {
      setShowUpdate(true)
    }
  }, [])

  const dismissUpdate = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
    setShowUpdate(false)
  }

  return { showUpdate, dismissUpdate, currentVersion: CURRENT_VERSION }
}
