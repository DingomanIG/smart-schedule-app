import { useState, useRef, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

const MINUTE_OPTIONS = [5, 10, 15, 30, 60]

export default function NotificationSettings({
  permission,
  settings,
  loading,
  requestPermission,
  updateSettings,
  isSupported,
  t,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive = settings.notificationsEnabled && permission === 'granted'

  const handleToggle = async () => {
    if (!settings.notificationsEnabled) {
      // 켜기
      if (permission === 'default') {
        const result = await requestPermission()
        if (result !== 'granted') return
      }
      if (permission === 'denied') return
      updateSettings({ notificationsEnabled: true })
    } else {
      // 끄기
      updateSettings({ notificationsEnabled: false })
    }
  }

  const handleMinutesChange = (e) => {
    updateSettings({ notificationMinutesBefore: Number(e.target.value) })
  }

  const minuteLabel = (min) => {
    const map = { 5: t('notification5min'), 10: t('notification10min'), 15: t('notification15min'), 30: t('notification30min'), 60: t('notification1hr') }
    return map[min] || `${min}min`
  }

  if (loading) return null

  return (
    <div className="relative" ref={ref}>
      {/* Bell 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 text-sm transition-colors min-w-[60px] relative"
        title={t('notificationSettings')}
      >
        {isActive ? <Bell size={16} /> : <BellOff size={16} />}
        {t('notificationLabel')}
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
        )}
        {!isActive && settings.notificationsEnabled && permission !== 'granted' && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('notificationSettings')}
          </h3>

          {!isSupported ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('notificationNotSupported')}
            </p>
          ) : (
            <>
              {/* 토글 */}
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('notificationEnable')}
                </span>
                <div
                  role="switch"
                  aria-checked={settings.notificationsEnabled}
                  tabIndex={0}
                  onClick={handleToggle}
                  onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                    settings.notificationsEnabled
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                      settings.notificationsEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </label>

              {/* 시간 선택 */}
              {settings.notificationsEnabled && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('notificationBefore')}
                  </label>
                  <select
                    value={settings.notificationMinutesBefore}
                    onChange={handleMinutesChange}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MINUTE_OPTIONS.map((min) => (
                      <option key={min} value={min}>
                        {minuteLabel(min)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 권한 안내 */}
              {permission === 'default' && settings.notificationsEnabled && (
                <button
                  onClick={requestPermission}
                  className="w-full text-xs bg-blue-600 text-white rounded-md px-3 py-1.5 hover:bg-blue-700 transition-colors"
                >
                  {t('notificationAllow')}
                </button>
              )}
              {permission === 'denied' && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {t('notificationPermissionDenied')}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
