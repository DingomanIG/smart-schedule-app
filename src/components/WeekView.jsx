import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Trash2, X } from 'lucide-react'

const START_HOUR = 0
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR
const HALF_HOURS = Array.from({ length: TOTAL_HOURS * 2 + 1 }, (_, i) => START_HOUR + i * 0.5)
const FULL_HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR)
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

const WORK_CATS = ['deepwork', 'meeting', 'admin', 'planning', 'communication', 'break', 'deadline']
const CHILDCARE_CATS = ['feeding', 'sleep', 'play', 'bath', 'diaper', 'outing', 'hospital', 'development']

// 이벤트의 도우미 타입을 판별 (helperId 우선, category 폴백)
const getHelperType = (evt) => {
  if (evt.createdVia !== 'helper') return null
  if (evt.helperId === 'H03') return 'pet'
  if (evt.helperId === 'H04') return 'work'
  if (evt.helperId === 'H06') return 'childcare'
  if (evt.helperId === 'H12') return 'majorEvents'
  if (evt.helperId === 'H01') return 'daily'
  // helperId 없을 때 category 기반 폴백
  if (evt.category === '펫 케어') return 'pet'
  if (WORK_CATS.includes(evt.category)) return 'work'
  if (evt.category === '육아' || CHILDCARE_CATS.includes(evt.category)) return 'childcare'
  return 'daily'
}

const HELPER_COLOR_MAP = {
  daily:       { active: 'bg-blue-600 border-blue-700 shadow-md z-20',    normal: 'bg-blue-500 border-blue-600 hover:bg-blue-600 hover:shadow-sm z-10' },
  pet:         { active: 'bg-teal-600 border-teal-700 shadow-md z-20',    normal: 'bg-teal-500 border-teal-600 hover:bg-teal-600 hover:shadow-sm z-10' },
  work:        { active: 'bg-indigo-600 border-indigo-700 shadow-md z-20', normal: 'bg-indigo-500 border-indigo-600 hover:bg-indigo-600 hover:shadow-sm z-10' },
  childcare:   { active: 'bg-pink-600 border-pink-700 shadow-md z-20',    normal: 'bg-pink-500 border-pink-600 hover:bg-pink-600 hover:shadow-sm z-10' },
  majorEvents: { active: 'bg-red-600 border-red-700 shadow-md z-20',      normal: 'bg-red-500 border-red-600 hover:bg-red-600 hover:shadow-sm z-10' },
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

const getWeekDates = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return dt
  })
}

// 특정 날짜 기준으로 이벤트의 시작/종료 시간(소수 시간)을 반환
// 자정을 넘는 이벤트는 해당 날짜에 보이는 부분만 잘라서 반환
const getEventHoursForDate = (event, date) => {
  const start = event.startTime?.toDate?.()
  if (!start) return null
  const end = event.endTime?.toDate?.()
  if (!end) {
    // endTime이 없으면 기존 로직 (startTime 날짜에만 표시)
    const startHour = start.getHours() + start.getMinutes() / 60
    return { start: startHour, end: startHour + 1 }
  }

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  // 이벤트가 이 날짜와 겹치지 않으면 null
  if (end <= dayStart || start >= dayEnd) return null

  const clippedStart = start < dayStart ? dayStart : start
  const clippedEnd = end > dayEnd ? dayEnd : end

  const startHour = clippedStart.getHours() + clippedStart.getMinutes() / 60
  const endHour = clippedEnd <= dayStart ? 0 : (clippedEnd >= dayEnd ? END_HOUR : clippedEnd.getHours() + clippedEnd.getMinutes() / 60)

  return {
    start: Math.max(startHour, START_HOUR),
    end: Math.min(endHour, END_HOUR),
  }
}

// 겹치는 이벤트 그룹 계산 → 각 이벤트에 column, totalColumns 할당
const layoutEvents = (dayEvents, date) => {
  const items = dayEvents
    .map((evt) => {
      const hours = getEventHoursForDate(evt, date)
      if (!hours) return null
      return { evt, ...hours }
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const groups = []
  let currentGroup = []
  let groupEnd = -1

  for (const item of items) {
    if (currentGroup.length === 0 || item.start < groupEnd) {
      currentGroup.push(item)
      groupEnd = Math.max(groupEnd, item.end)
    } else {
      groups.push(currentGroup)
      currentGroup = [item]
      groupEnd = item.end
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)

  const result = []
  for (const group of groups) {
    const columns = []
    const groupStartIdx = result.length
    for (const item of group) {
      let placed = false
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col]
        if (item.start >= lastInCol.end) {
          columns[col] = item
          result.push({ ...item, column: col, totalColumns: 0 })
          placed = true
          break
        }
      }
      if (!placed) {
        result.push({ ...item, column: columns.length, totalColumns: 0 })
        columns.push(item)
      }
    }
    const totalCols = columns.length
    for (let i = groupStartIdx; i < result.length; i++) {
      result[i].totalColumns = totalCols
    }
  }
  return result
}

export default function WeekView({ selectedDate, setSelectedDate, events, onDelete, onMoveEvent }) {
  const [popup, setPopup] = useState(null)
  const [dropTargetCol, setDropTargetCol] = useState(null)
  const [dropTimeIndicator, setDropTimeIndicator] = useState(null) // { col, hour }
  const isDraggingRef = useRef(false)
  const weekDates = getWeekDates(selectedDate)
  const today = toLocalDateStr(new Date())

  const weekLabel = `${weekDates[0].getMonth() + 1}월 ${weekDates[0].getDate()}일 ~ ${weekDates[6].getMonth() + 1}월 ${weekDates[6].getDate()}일`

  const goWeek = (offset) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + offset * 7)
    setSelectedDate(next)
  }

  const getEventsForDate = (date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return events.filter((evt) => {
      const start = evt.startTime?.toDate?.()
      if (!start) return false
      const end = evt.endTime?.toDate?.() || new Date(start.getTime() + 3600000)
      // 이벤트 시간 범위가 이 날짜와 겹치면 포함
      return start < dayEnd && end > dayStart
    })
  }

  const handleEventClick = (evt, e) => {
    e.stopPropagation()
    if (isDraggingRef.current) return
    setPopup(popup?.id === evt.id ? null : evt)
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* 주 네비게이션 */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => goWeek(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{weekLabel}</span>
        <button onClick={() => goWeek(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* 주간 그리드 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto flex-1 min-h-0 thin-scrollbar" onClick={() => setPopup(null)}>
        {/* 요일 헤더 (sticky) */}
        <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-30">
          <div />
          {weekDates.map((date, i) => {
            const isToday = toLocalDateStr(date) === today
            const dayEventCount = getEventsForDate(date).length
            return (
              <div
                key={i}
                className={`text-center py-1.5 text-xs border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={(e) => { e.stopPropagation(); setSelectedDate(date) }}
              >
                <div className={`font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {DAY_LABELS[i]}
                </div>
                <div className={`${isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto text-[11px] font-bold' : 'text-[11px] text-gray-500 dark:text-gray-400'}`}>
                  {date.getDate()}
                </div>
                {dayEventCount > 0 && (
                  <div className="flex justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 시간 그리드 */}
        <div className="relative">
          <div className="grid grid-cols-[40px_repeat(7,1fr)] relative" style={{ height: `${TOTAL_HOURS * 48}px` }}>
            {/* 시간 라벨 컬럼 */}
            <div className="relative">
              {FULL_HOURS.map((hour) => {
                const top = (hour - START_HOUR) * 48
                return (
                  <span
                    key={hour}
                    className="absolute text-[10px] text-gray-400 dark:text-gray-500 pl-1 leading-none"
                    style={{ top: `${top - 5}px` }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </span>
                )
              })}
            </div>

            {/* 7개 컬럼 */}
            {weekDates.map((date, colIdx) => {
              const dayEvents = getEventsForDate(date)
              const laid = layoutEvents(dayEvents, date)
              const isToday = toLocalDateStr(date) === today

              return (
                <div
                  key={colIdx}
                  className={`relative border-l border-gray-200 dark:border-gray-700 ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''} ${dropTargetCol === colIdx ? 'bg-blue-100/30 dark:bg-blue-900/20' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDropTargetCol(colIdx)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawHour = y / 48
                    const snapped = Math.round(rawHour * 6) / 6
                    const clamped = Math.max(0, Math.min(23 + 50/60, snapped))
                    setDropTimeIndicator({ col: colIdx, hour: clamped })
                  }}
                  onDragEnter={() => setDropTargetCol(colIdx)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDropTargetCol(null)
                      setDropTimeIndicator(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDropTargetCol(null)
                    setDropTimeIndicator(null)
                    const eventId = e.dataTransfer.getData('text/plain')
                    if (!eventId || !onMoveEvent) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawHour = y / 48
                    const snappedHour = Math.round(rawHour * 6) / 6
                    const clampedHour = Math.max(0, Math.min(23 + 50/60, snappedHour))
                    onMoveEvent(eventId, toLocalDateStr(date), clampedHour)
                  }}
                >
                  {/* 시간 그리드 라인 */}
                  {FULL_HOURS.map((hour) => {
                    const top = (hour - START_HOUR) * 48
                    return (
                      <div key={hour}>
                        <div
                          className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700"
                          style={{ top: `${top}px` }}
                        />
                        {hour < END_HOUR && (
                          <div
                            className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800 border-dashed"
                            style={{ top: `${top + 24}px` }}
                          />
                        )}
                      </div>
                    )
                  })}

                  {/* 이벤트 블록 */}
                  {laid.map((item) => {
                    const top = (item.start - START_HOUR) * 48
                    const height = Math.max((item.end - item.start) * 48, 22)
                    const width = `calc(${100 / item.totalColumns}% - 3px)`
                    const left = `calc(${(item.column / item.totalColumns) * 100}% + 1.5px)`
                    const isActive = popup?.id === item.evt.id
                    const helperType = getHelperType(item.evt)

                    const startH = Math.floor(item.start)
                    const startM = Math.round((item.start - startH) * 60)
                    const timeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`

                    const colors = helperType
                      ? HELPER_COLOR_MAP[helperType] || HELPER_COLOR_MAP.daily
                      : { active: 'bg-blue-600 border-blue-700 shadow-md z-20', normal: 'bg-blue-500 border-blue-600 hover:bg-blue-600 hover:shadow-sm z-10' }
                    const colorClasses = isActive ? colors.active : colors.normal

                    return (
                      <div
                        key={item.evt.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.evt.id)
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                          isDraggingRef.current = true
                          e.stopPropagation()
                        }}
                        onDragEnd={() => {
                          setTimeout(() => { isDraggingRef.current = false }, 50)
                          setDropTimeIndicator(null)
                          setDropTargetCol(null)
                        }}
                        className={`absolute rounded-sm px-1 py-px overflow-hidden cursor-grab active:cursor-grabbing transition-all border ${colorClasses}`}
                        style={{ top: `${top}px`, height: `${height}px`, width, left, minHeight: '22px' }}
                        onClick={(e) => handleEventClick(item.evt, e)}
                      >
                        <p className="text-[10px] font-bold text-white truncate leading-tight">
                          {item.evt.title}
                        </p>
                        {height >= 32 && (
                          <p className="text-[9px] text-white/75 leading-tight truncate">
                            {timeStr}
                          </p>
                        )}
                      </div>
                    )
                  })}

                  {/* 드롭 시간 인디케이터 */}
                  {dropTimeIndicator && dropTimeIndicator.col === colIdx && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      style={{ top: `${dropTimeIndicator.hour * 48}px`, transform: 'translateY(-50%)' }}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full -ml-1" />
                      <div className="flex-1 border-t-2 border-blue-500 border-dashed" />
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-1 rounded shadow-sm ml-0.5">
                        {`${String(Math.floor(dropTimeIndicator.hour)).padStart(2, '0')}:${String(Math.round((dropTimeIndicator.hour % 1) * 60)).padStart(2, '0')}`}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 이벤트 상세 팝업 */}
      {popup && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{popup.title}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              <span>
                {formatTime(popup.startTime)}
                {popup.endTime && ` ~ ${formatTime(popup.endTime)}`}
              </span>
            </div>
            {popup.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={12} />
                <span>{popup.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(popup.id); setPopup(null) }}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-1"
            >
              <Trash2 size={14} />
            </button>
            <button onClick={() => setPopup(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
