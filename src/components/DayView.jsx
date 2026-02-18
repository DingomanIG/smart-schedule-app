import { useState } from 'react'
import { Clock, MapPin, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react'

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

const CATEGORY_STYLES = {
  개인: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  업무: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  건강: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  학습: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  기타: 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
}

const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatTime = (timestamp) => {
  if (!timestamp?.toDate) return ''
  const d = timestamp.toDate()
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function DayView({ selectedDate, setSelectedDate, events, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  const isToday = toLocalDateStr(selectedDate) === toLocalDateStr(new Date())

  const dateStr = selectedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const dayEvents = events
    .filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? toLocalDateStr(evt.startTime.toDate())
        : ''
      return evtDate === toLocalDateStr(selectedDate)
    })
    .sort((a, b) => {
      const aTime = a.startTime?.toDate?.()?.getTime() || 0
      const bTime = b.startTime?.toDate?.()?.getTime() || 0
      return aTime - bTime
    })

  const goDay = (offset) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + offset)
    setSelectedDate(next)
  }

  const handleDelete = (eventId) => {
    if (deletingId === eventId) {
      onDelete(eventId)
      setDeletingId(null)
    } else {
      setDeletingId(eventId)
    }
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* 날짜 네비게이션 */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <button onClick={() => goDay(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
          <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="text-center">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {dateStr}
          </span>
          {isToday && (
            <span className="ml-1.5 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
              오늘
            </span>
          )}
        </div>
        <button onClick={() => goDay(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
          <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* 요약 */}
      <div className="flex items-center gap-3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 shrink-0">
        <span>일정 <strong className="text-gray-700 dark:text-gray-200">{dayEvents.length}</strong>개</span>
      </div>

      {/* 카드 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 thin-scrollbar">
        {dayEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-300 dark:text-gray-600">일정이 없습니다</p>
          </div>
        ) : (
          dayEvents.map((evt) => {
            const priority = evt.priority || 'medium'
            const category = evt.category || '기타'
            const isHelper = evt.createdVia === 'helper'
            const priorityBar = isHelper ? 'bg-emerald-500' : (PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium)
            const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES['기타']
            const isConfirmingDelete = deletingId === evt.id

            return (
              <div
                key={evt.id}
                className={`flex rounded-xl overflow-hidden bg-white dark:bg-gray-800 border shadow-sm ${
                  isHelper
                    ? 'border-emerald-300 dark:border-emerald-700'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* 우선순위 바 */}
                <div className={`w-[4px] shrink-0 ${priorityBar}`} />

                {/* 내용 */}
                <div className="flex-1 p-3 min-w-0">
                  {/* 상단: 카테고리 + 삭제 */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryStyle}`}>
                      <Tag size={10} />
                      {category}
                    </span>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className={`p-1 rounded transition-colors ${
                        isConfirmingDelete
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                          : 'text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400'
                      }`}
                      title={isConfirmingDelete ? '한번 더 누르면 삭제' : '삭제'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* 제목 */}
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {evt.title}
                  </p>

                  {/* 시간 + 장소 */}
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={12} className="shrink-0" />
                      <span>
                        {formatTime(evt.startTime)}
                        {evt.endTime && ` ~ ${formatTime(evt.endTime)}`}
                      </span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* 삭제 확인 메시지 */}
                  {isConfirmingDelete && (
                    <p className="text-[10px] text-red-500 mt-1.5">한번 더 누르면 삭제됩니다</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
