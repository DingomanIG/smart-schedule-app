import { Check, X, Clock, Minus, Copy } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { CARE_TYPE_STYLES } from '../data/petCareDefaults'

export default function PetCareCard({
  petInfo,
  events = [],
  days = [],
  onConfirmAll,
  onRemoveItem,
  onCancel,
  confirmed,
  cancelled,
}) {
  const { t } = useLanguage()

  const petIcon = petInfo?.petType === 'dog' ? '🐶' : '🐱'
  const petName = petInfo?.petName || ''
  const isMultiDay = days.length > 1
  const totalEvents = isMultiDay ? days.reduce((sum, d) => sum + d.events.length, 0) : events.length

  if (confirmed) {
    return (
      <div className="mt-2 border-2 border-teal-200 dark:border-teal-700 rounded-xl p-3 bg-teal-50 dark:bg-teal-900/20">
        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
          {t('petCareBatchSaved')}
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
    <div className="mt-2 border-2 border-teal-300 dark:border-teal-600 rounded-xl p-3 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">
          {petIcon} {petName}{t('petCareScheduleOf')}
        </p>
        <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
          {isMultiDay && `${days.length}${t('helperDayUnit')} · `}{totalEvents}{t('helperEventCount')}
        </span>
      </div>

      {/* 멀티데이 요약 */}
      {isMultiDay && (
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2 px-1">
          <Copy size={11} />
          <span>{days[0].date} ~ {days[days.length - 1].date}</span>
          <span className="text-gray-400 dark:text-gray-500">
            ({events.length}{t('helperEventCount')} × {days.length}{t('helperDayUnit')})
          </span>
        </div>
      )}

      {/* 1일치 템플릿 이벤트 목록 */}
      <div className="max-h-72 overflow-y-auto space-y-1 mb-3">
        {isMultiDay && (
          <div className="text-[10px] text-gray-400 dark:text-gray-500 px-2 pb-1">
            {t('helperTemplateDayLabel')}
          </div>
        )}
        {events.map((event, idx) => {
          const style = CARE_TYPE_STYLES[event.careType] || CARE_TYPE_STYLES.health
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
                  {event.careType}
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onConfirmAll}
          disabled={events.length === 0}
          className="flex items-center justify-center gap-1 bg-teal-600 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
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
