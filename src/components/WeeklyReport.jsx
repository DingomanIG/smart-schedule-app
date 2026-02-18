import { useState, useEffect } from 'react'
import { BarChart3, Calendar, TrendingUp } from 'lucide-react'
import { getEvents } from '../services/schedule'
import ContactForm from './ContactForm'
import GiscusComments from './GiscusComments'
import { useLanguage } from '../hooks/useLanguage'

export default function WeeklyReport({ userId }) {
  const { t } = useLanguage()
  const [weekEvents, setWeekEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeekData = async () => {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      try {
        const events = await getEvents(userId, startOfWeek, endOfWeek)
        setWeekEvents(events)
      } catch (err) {
        console.error('주간 일정 조회 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeekData()
  }, [userId])

  const categoryCount = weekEvents.reduce((acc, evt) => {
    const cat = evt.category || 'general'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const categoryLabels = {
    meeting: t('catMeeting'),
    personal: t('catPersonal'),
    work: t('catWork'),
    health: t('catHealth'),
    other: t('catOther'),
    general: t('catGeneral'),
  }

  return (
    <div className="p-4 space-y-6">
      {/* 주간 요약 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
          {t('weekSummary')}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('totalEvents')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weekEvents.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('categories')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(categoryCount).length}
              </p>
            </div>
          </div>
        )}

        {/* 카테고리별 일정 수 */}
        {!loading && weekEvents.length > 0 && (
          <div className="mt-3 space-y-2">
            {Object.entries(categoryCount).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {categoryLabels[cat] || cat}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-blue-600 rounded"
                    style={{ width: `${Math.max(count * 40, 20)}px` }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && weekEvents.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">{t('noEventsThisWeek')}</p>
        )}
      </div>

      {/* 구분선 */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 문의하기 */}
      <ContactForm />

      {/* 구분선 */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* 댓글 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('leaveFeedback')}</h2>
        <GiscusComments />
      </div>
    </div>
  )
}
