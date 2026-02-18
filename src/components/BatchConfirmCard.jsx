import { Check, X, Calendar, Clock, Minus } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

const CATEGORY_STYLES = {
  routine:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  meal:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  commute:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  leisure:  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  personal: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  health:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
}

export default function BatchConfirmCard({
  batchDays = [],
  onConfirmAll,
  onRemoveItem,
  onCancel,
  confirmed,
  cancelled,
}) {
  const { t } = useLanguage()
  const totalEvents = batchDays.reduce((sum, day) => sum + day.events.length, 0)
  const isMultiDay = batchDays.length > 1

  if (confirmed) {
    return (
      <div className="mt-2 border-2 border-green-200 dark:border-green-700 rounded-xl p-3 bg-green-50 dark:bg-green-900/20">
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          {t('helperBatchSaved')}
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
    <div className="mt-2 border-2 border-green-300 dark:border-green-600 rounded-xl p-3 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">
          {t('helperScheduleTitle')}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isMultiDay && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {batchDays.length}{t('helperDayUnit')}
            </span>
          )}
          {!isMultiDay && batchDays[0] && (
            <>
              <Calendar size={12} />
              <span>{batchDays[0].date}</span>
            </>
          )}
          <span className="text-green-600 dark:text-green-400 font-medium">
            {totalEvents}{t('helperEventCount')}
          </span>
        </div>
      </div>

      {/* Event list */}
      <div className="max-h-72 overflow-y-auto space-y-1 mb-3">
        {batchDays.map((day, dayIdx) => (
          <div key={dayIdx}>
            {isMultiDay && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-1.5 px-1 mt-1 first:mt-0 border-b border-gray-100 dark:border-gray-700">
                <Calendar size={11} />
                <span className="font-medium">{day.date}</span>
                <span className="text-gray-400 dark:text-gray-500">({day.events.length}{t('helperEventCount')})</span>
              </div>
            )}
            {day.events.map((event, eventIdx) => (
              <div
                key={eventIdx}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
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
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${CATEGORY_STYLES[event.category] || CATEGORY_STYLES.personal}`}>
                    {event.category}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveItem(dayIdx, eventIdx)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-0.5 transition-opacity"
                  title={t('helperRemoveItem')}
                >
                  <Minus size={12} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onConfirmAll}
          disabled={totalEvents === 0}
          className="flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
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
