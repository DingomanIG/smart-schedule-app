import { Check, X, Clock, Minus, Briefcase } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { WORK_CATEGORY_STYLES, WORK_CATEGORY_LABELS } from '../data/workDefaults'

export default function WorkScheduleCard({
  events = [],
  days = [],
  onConfirmAll,
  onRemoveItem,
  onCancel,
  confirmed,
  cancelled,
}) {
  const { t } = useLanguage()

  const isMultiDay = days.length > 1
  const totalEvents = isMultiDay ? days.reduce((sum, d) => sum + d.events.length, 0) : events.length

  // 통계 계산
  const deepworkEvents = events.filter(e => e.category === 'deepwork' || e.category === 'deadline')
  const meetingEvents = events.filter(e => e.category === 'meeting')
  const deepworkMinutes = deepworkEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
  const deepworkHours = Math.floor(deepworkMinutes / 60)
  const deepworkRemainMin = deepworkMinutes % 60

  if (confirmed) {
    return (
      <div className="mt-2 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/20">
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
          {t('helperWorkBatchSaved')}
        </p>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-xl p-3 opacity-50">
        <p className="text-sm text-gray-400 dark:text-gray-500">{t('cancelled')}</p>
      </div>
    )
  }

  return (
    <div className="mt-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-xl p-3 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
          <Briefcase size={14} className="text-indigo-500" />
          {t('helperWorkScheduleTitle')}
        </p>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {isMultiDay ? `${days.length}${t('helperDayUnit')} · ${totalEvents}${t('helperEventCount')}` : `${events.length}${t('helperEventCount')}`}
        </span>
      </div>

      {/* 멀티데이 날짜 범위 */}
      {isMultiDay && (
        <div className="text-[11px] text-gray-500 dark:text-gray-400 px-2 mb-1.5">
          <div>{days[0].date} ~ {days[days.length - 1].date}</div>
          <div className="text-gray-400 dark:text-gray-500">({events.length}{t('helperEventCount')} x {days.length}{t('helperDayUnit')})</div>
        </div>
      )}

      {/* 멀티데이 템플릿 라벨 */}
      {isMultiDay && (
        <div className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium px-2 mb-1">
          {t('helperTemplateDayLabel')}
        </div>
      )}

      {/* 이벤트 목록 */}
      <div className="max-h-72 overflow-y-auto space-y-1 mb-2">
        {events.map((event, idx) => {
          const style = WORK_CATEGORY_STYLES[event.category] || WORK_CATEGORY_STYLES.admin
          const labelKey = WORK_CATEGORY_LABELS[event.category]
          return (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock size={11} className="text-gray-400 shrink-0" />
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-10 shrink-0">
                  {event.time}
                </span>
                <span className="text-sm text-gray-900 dark:text-white truncate">
                  {event.title}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {event.duration}{t('minuteUnit')}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                  {labelKey ? t(labelKey) : event.category}
                </span>
              </div>
              <button
                onClick={() => onRemoveItem(idx)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-0.5 shrink-0"
                title={t('helperRemoveItem')}
              >
                <Minus size={12} />
              </button>
            </div>
          )
        })}
      </div>

      {/* 요약 통계 */}
      {(deepworkEvents.length > 0 || meetingEvents.length > 0) && (
        <div className="text-[11px] text-gray-500 dark:text-gray-400 px-2 mb-2">
          {deepworkEvents.length > 0 && (
            <span>
              {t('workCategoryDeepwork')} {deepworkEvents.length}{t('workBlockUnit')} ({deepworkHours > 0 ? `${deepworkHours}${t('workHourUnit')}` : ''}{deepworkRemainMin > 0 ? `${deepworkRemainMin}${t('minuteUnit')}` : ''})
            </span>
          )}
          {deepworkEvents.length > 0 && meetingEvents.length > 0 && (
            <span className="mx-1">·</span>
          )}
          {meetingEvents.length > 0 && (
            <span>{t('workCategoryMeeting')} {meetingEvents.length}{t('workMeetingUnit')}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onConfirmAll}
          disabled={events.length === 0}
          className="flex items-center justify-center gap-1 bg-indigo-600 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
        >
          <Check size={12} /> {t('helperRegisterAll')}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
        >
          <X size={12} /> {t('cancel')}
        </button>
      </div>
    </div>
  )
}
