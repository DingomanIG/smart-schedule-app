import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Clock, MapPin, Trash2 } from 'lucide-react'
import { getEvents, deleteEvent } from '../services/schedule'

export default function CalendarView({ userId }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [monthEvents, setMonthEvents] = useState([])
  const [loading, setLoading] = useState(false)

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
    const dateStr = selectedDate.toISOString().split('T')[0]
    const filtered = monthEvents.filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? evt.startTime.toDate().toISOString().split('T')[0]
        : ''
      return evtDate === dateStr
    })
    setEvents(filtered)
  }, [selectedDate, monthEvents])

  // 초기 로드 및 월 변경 시
  useEffect(() => {
    setLoading(true)
    fetchMonthEvents(selectedDate).finally(() => setLoading(false))
  }, [userId])

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

  // 일정이 있는 날짜에 점 표시
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const dateStr = date.toISOString().split('T')[0]
    const hasEvent = monthEvents.some((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? evt.startTime.toDate().toISOString().split('T')[0]
        : ''
      return evtDate === dateStr
    })
    return hasEvent ? (
      <div className="flex justify-center">
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />
      </div>
    ) : null
  }

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return ''
    const d = timestamp.toDate()
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 space-y-4">
      {/* 캘린더 */}
      <div className="calendar-wrapper">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          onActiveStartDateChange={handleActiveStartDateChange}
          tileContent={tileContent}
          locale="ko-KR"
          calendarType="gregory"
        />
      </div>

      {/* 선택된 날짜 일정 목록 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {selectedDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>

        {loading ? (
          <p className="text-sm text-gray-400">로딩 중...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-400">일정이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{evt.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{formatTime(evt.startTime)}</span>
                    {evt.endTime && (
                      <span>~ {formatTime(evt.endTime)}</span>
                    )}
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(evt.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
