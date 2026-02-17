import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Clock, MapPin, Trash2, GripVertical } from 'lucide-react'
import { getEvents, deleteEvent, moveEvent } from '../services/schedule'
import DayView from './DayView'
import WeekView from './WeekView'

const VIEW_MODES = [
  { key: 'day', label: '일간' },
  { key: 'week', label: '주간' },
  { key: 'month', label: '월간' },
]

const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarView({ userId, refreshKey }) {
  const [viewMode, setViewMode] = useState('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [monthEvents, setMonthEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [draggingEvent, setDraggingEvent] = useState(null)

  // 일정 이동 핸들러
  const handleMoveEvent = async (eventId, newDateStr, newHour = null) => {
    const event = monthEvents.find((e) => e.id === eventId)
    if (!event) return
    const oldDateStr = toLocalDateStr(event.startTime.toDate())
    if (oldDateStr === newDateStr && newHour === null) return
    try {
      await moveEvent(eventId, event, newDateStr, newHour)
      await fetchMonthEvents(selectedDate)
    } catch (err) {
      console.error('일정 이동 오류:', err)
    }
    setDraggingEvent(null)
  }

  // 현재 보이는 월의 전체 일정 가져오기
  const fetchMonthEvents = async (activeDate) => {
    const start = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
    const end = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0, 23, 59, 59)
    try {
      const data = await getEvents(userId, start, end)
      setMonthEvents(data)
    } catch (err) {
      console.error('일정 조회 오류:', err)
    }
  }

  // 선택된 날짜의 일정 필터링
  useEffect(() => {
    const dateStr = toLocalDateStr(selectedDate)
    const filtered = monthEvents.filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? toLocalDateStr(evt.startTime.toDate())
        : ''
      return evtDate === dateStr
    })
    setEvents(filtered)
  }, [selectedDate, monthEvents])

  // 초기 로드 및 월 변경 시
  useEffect(() => {
    setLoading(true)
    fetchMonthEvents(selectedDate).finally(() => setLoading(false))
  }, [userId, refreshKey])

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    fetchMonthEvents(activeStartDate)
  }

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId)
      setMonthEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  // 날짜 선택 시 일간 뷰로 전환
  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  // 주간/일간 뷰에서 날짜 변경 시 월 데이터 갱신
  const handleDateChange = (date) => {
    setSelectedDate(date)
    // 월이 바뀌면 데이터 다시 로드
    if (date.getMonth() !== selectedDate.getMonth() || date.getFullYear() !== selectedDate.getFullYear()) {
      fetchMonthEvents(date)
    }
  }

  // 일정 개수 배지 + 드롭존 표시
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const dateStr = toLocalDateStr(date)
    const count = monthEvents.filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? toLocalDateStr(evt.startTime.toDate())
        : ''
      return evtDate === dateStr
    }).length
    const label = count > 99 ? '99' : String(count)
    return (
      <>
        {count > 0 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2" title={`${count}개 일정`}>
            <span className="min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {label}
            </span>
          </div>
        )}
        {draggingEvent && (
          <div
            className="absolute inset-0 z-10 rounded-lg transition-colors"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              e.currentTarget.classList.add('calendar-drop-hover')
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('calendar-drop-hover')
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('calendar-drop-hover')
              const eventId = e.dataTransfer.getData('text/plain')
              handleMoveEvent(eventId, dateStr)
            }}
          />
        )}
      </>
    )
  }

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return ''
    const d = timestamp.toDate()
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* 뷰 전환 버튼 */}
      <div className="flex gap-1 shrink-0">
        {VIEW_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 월간 뷰 */}
      {viewMode === 'month' && (
        <>
          <div className="calendar-wrapper">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              tileContent={tileContent}
              locale="ko-KR"
              calendarType="gregory"
            />
          </div>

          {/* 선택된 날짜 일정 목록 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            {loading ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">로딩 중...</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">일정이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', evt.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                      setDraggingEvent(evt)
                    }}
                    onDragEnd={() => setDraggingEvent(null)}
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start justify-between cursor-grab active:cursor-grabbing transition-opacity ${
                      draggingEvent?.id === evt.id ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{evt.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        <span>{formatTime(evt.startTime)}</span>
                        {evt.endTime && (
                          <span>~ {formatTime(evt.endTime)}</span>
                        )}
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={12} />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 주간 뷰 */}
      {viewMode === 'week' && (
        <div className="flex-1 min-h-0">
          <WeekView
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            events={monthEvents}
            onDelete={handleDelete}
            onMoveEvent={handleMoveEvent}
          />
        </div>
      )}

      {/* 일간 뷰 */}
      {viewMode === 'day' && (
        <div className="flex-1 min-h-0">
          <DayView
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            events={monthEvents}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
