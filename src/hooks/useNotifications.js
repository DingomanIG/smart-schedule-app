import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../services/firebase'
import { getEvents } from '../services/schedule'

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  notificationMinutesBefore: 10,
}

const REFETCH_INTERVAL = 5 * 60 * 1000 // 5분

export function useNotifications(userId, refreshKey, lang) {
  const [permission, setPermission] = useState('default')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const swRegistration = useRef(null)
  const timers = useRef([])
  const intervalRef = useRef(null)
  const notifiedSet = useRef(new Set())

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator

  const isDemo = userId === 'demo'

  // SW 등록
  useEffect(() => {
    if (!isSupported || isDemo) return
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        swRegistration.current = reg
      })
      .catch(() => {})
  }, [isSupported, isDemo])

  // 권한 상태 확인
  useEffect(() => {
    if (!isSupported) return
    setPermission(Notification.permission)
  }, [isSupported])

  // Firestore에서 설정 로드
  useEffect(() => {
    if (isDemo || !isFirebaseConfigured || !userId) {
      setLoading(false)
      return
    }

    getDoc(doc(db, 'users', userId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setSettings({
            notificationsEnabled: data.notificationsEnabled ?? false,
            notificationMinutesBefore: data.notificationMinutesBefore ?? 10,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, isDemo])

  // 권한 요청
  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [isSupported])

  // 설정 저장
  const updateSettings = useCallback(
    async (partial) => {
      const next = { ...settings, ...partial }
      setSettings(next)

      if (!isDemo && isFirebaseConfigured && userId) {
        try {
          await setDoc(
            doc(db, 'users', userId),
            {
              notificationsEnabled: next.notificationsEnabled,
              notificationMinutesBefore: next.notificationMinutesBefore,
            },
            { merge: true }
          )
        } catch {
          // Firestore 저장 실패 시 무시 (로컬 상태는 유지)
        }
      }
    },
    [settings, userId, isDemo]
  )

  // 알림 표시
  const showNotification = useCallback(
    (event) => {
      const startTime = event.startTime.toDate()
      const timeStr = startTime.toLocaleTimeString(lang === 'ko' ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const body =
        lang === 'ko'
          ? `${timeStr}${('notificationStartsAt' in {} ? '' : '에 시작합니다')}`
          : `Starts at ${timeStr}`

      if (swRegistration.current) {
        swRegistration.current.showNotification(event.title, {
          body,
          icon: '/og-image.png',
          tag: event.id,
          data: { url: '/' },
        })
      } else if (isSupported) {
        new Notification(event.title, { body, icon: '/og-image.png', tag: event.id })
      }
    },
    [lang, isSupported]
  )

  // 이벤트 조회 및 스케줄링
  const scheduleNotifications = useCallback(async () => {
    if (isDemo || !userId || !settings.notificationsEnabled || permission !== 'granted') return

    // 이전 타이머 정리
    timers.current.forEach(clearTimeout)
    timers.current = []

    try {
      const now = new Date()
      const endOfTomorrow = new Date(now)
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 2)
      endOfTomorrow.setHours(0, 0, 0, 0)

      const events = await getEvents(userId, now, endOfTomorrow)
      const minutesBefore = settings.notificationMinutesBefore
      const offsetMs = minutesBefore * 60 * 1000

      events.forEach((event) => {
        if (event.disabled || event.completed) return
        if (notifiedSet.current.has(event.id)) return

        const startTime = event.startTime.toDate()
        const notifyAt = startTime.getTime() - offsetMs
        const delay = notifyAt - Date.now()

        if (delay > 0) {
          const timer = setTimeout(() => {
            notifiedSet.current.add(event.id)
            showNotification(event)
          }, delay)
          timers.current.push(timer)
        }
      })
    } catch {
      // 이벤트 조회 실패 시 무시
    }
  }, [userId, isDemo, settings.notificationsEnabled, settings.notificationMinutesBefore, permission, showNotification])

  // 스케줄링 실행 (설정 변경, 이벤트 변경 시)
  useEffect(() => {
    if (!settings.notificationsEnabled || permission !== 'granted' || isDemo) return

    scheduleNotifications()

    // 5분마다 재조회
    intervalRef.current = setInterval(scheduleNotifications, REFETCH_INTERVAL)

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [scheduleNotifications, refreshKey, settings.notificationsEnabled, permission, isDemo])

  // 자정에 notifiedSet 초기화
  useEffect(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()

    const timer = setTimeout(() => {
      notifiedSet.current.clear()
    }, msUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  return {
    permission,
    settings,
    loading,
    requestPermission,
    updateSettings,
    isSupported,
  }
}
