import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Clock, MapPin, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getEventSource } from '../utils/eventClassifier'

const CATEGORY_COLOR_MAP = {
  chat:      { bg: 'bg-blue-500', border: 'border-blue-600', activeBg: 'bg-blue-600', activeBorder: 'border-blue-700' },
  daily:     { bg: 'bg-blue-500', border: 'border-blue-600', activeBg: 'bg-blue-600', activeBorder: 'border-blue-700' },
  petcare:   { bg: 'bg-teal-500', border: 'border-teal-600', activeBg: 'bg-teal-600', activeBorder: 'border-teal-700' },
  work:      { bg: 'bg-indigo-500', border: 'border-indigo-600', activeBg: 'bg-indigo-600', activeBorder: 'border-indigo-700' },
  childcare: { bg: 'bg-pink-500', border: 'border-pink-600', activeBg: 'bg-pink-600', activeBorder: 'border-pink-700' },
  majorEvent:{ bg: 'bg-purple-500', border: 'border-purple-600', activeBg: 'bg-purple-600', activeBorder: 'border-purple-700' },
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

const formatHourLabel = (hour) => {
  if (hour === 0) return 'AM 12시'
  if (hour < 12) return `AM ${hour}시`
  if (hour === 12) return 'PM 12시'
  return `PM ${hour - 12}시`
}

const formatEventTimeRange = (startTimestamp, endTimestamp) => {
  const start = startTimestamp?.toDate?.()
  if (!start) return ''

  const startH = start.getHours()
  const startM = start.getMinutes()
  const startPeriod = startH < 12 ? 'AM' : 'PM'
  const startDisplay = startH === 0 ? 12 : startH > 12 ? startH - 12 : startH
  const startStr = startM > 0
    ? `${startPeriod} ${startDisplay}:${String(startM).padStart(2, '0')}`
    : `${startPeriod} ${startDisplay}시`

  if (!endTimestamp?.toDate) return startStr

  const end = endTimestamp.toDate()
  const endH = end.getHours()
  const endM = end.getMinutes()
  const endDisplay = endH === 0 ? 12 : endH > 12 ? endH - 12 : endH
  const endStr = endM > 0
    ? `${endDisplay}:${String(endM).padStart(2, '0')}`
    : `${endDisplay}시`

  return `${startStr} ~ ${endStr}`
}

// 이벤트의 시작/종료 시간(소수 시간)을 반환
const getEventHoursForDate = (event, date, rangeStart, rangeEnd) => {
  const start = event.startTime?.toDate?.()
  if (!start) return null
  const end = event.endTime?.toDate?.()
  if (!end) {
    const startH = start.getHours() + start.getMinutes() / 60
    if (startH + 1 <= rangeStart || startH >= rangeEnd) return null
    return { start: Math.max(startH, rangeStart), end: Math.min(startH + 1, rangeEnd) }
  }

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  if (end <= dayStart || start >= dayEnd) return null

  const clippedStart = start < dayStart ? dayStart : start
  const clippedEnd = end > dayEnd ? dayEnd : end

  const startH = clippedStart.getHours() + clippedStart.getMinutes() / 60
  const endH = clippedEnd <= dayStart ? 0 : (clippedEnd >= dayEnd ? rangeEnd : clippedEnd.getHours() + clippedEnd.getMinutes() / 60)

  const resultStart = Math.max(startH, rangeStart)
  const resultEnd = Math.min(endH, rangeEnd)
  if (resultStart >= resultEnd) return null

  return { start: resultStart, end: resultEnd }
}

// 겹치는 이벤트 그룹 계산 → 각 이벤트에 column, totalColumns 할당
const layoutEvents = (dayEvents, date, rangeStart, rangeEnd) => {
  const items = dayEvents
    .map((evt) => {
      const hours = getEventHoursForDate(evt, date, rangeStart, rangeEnd)
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

export default function DayView({ selectedDate, setSelectedDate, events, onDelete, onMoveEvent, onResizeEvent, startHour = 0, endHour = 24 }) {
  const totalHours = endHour - startHour
  const fullHours = Array.from({ length: totalHours + 1 }, (_, i) => i + startHour)
  const HOUR_HEIGHT = 48
  const [popup, setPopup] = useState(null)
  const scrollRef = useRef(null)
  const gridRef = useRef(null)
  const isDraggingRef = useRef(false)
  const [dropTimeIndicator, setDropTimeIndicator] = useState(null)

  // 리사이즈 상태
  const resizeRef = useRef(null) // { eventId, eventStartHour }
  const [resizeIndicator, setResizeIndicator] = useState(null) // { hour }
  const resizeIndicatorRef = useRef(null)

  const isToday = toLocalDateStr(selectedDate) === toLocalDateStr(new Date())

  const dateStr = selectedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  // 현재 시간 바
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 선택된 이벤트 Delete 키로 삭제
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && popup && onDelete) {
        onDelete(popup.id)
        setPopup(null)
      }
      if (e.key === 'Escape' && popup) {
        setPopup(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [popup, onDelete])

  // 리사이즈 드래그 핸들러 (마우스 이벤트)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current) return
      e.preventDefault()
      const gridEl = gridRef.current
      if (!gridEl) return
      const rect = gridEl.getBoundingClientRect()
      const y = e.clientY - rect.top
      const rawHour = startHour + y / HOUR_HEIGHT
      // 10분 단위 스냅
      const snapped = Math.round(rawHour * 6) / 6
      const minEnd = resizeRef.current.eventStartHour + 10 / 60
      const clamped = Math.max(minEnd, Math.min(endHour, snapped))
      const val = { hour: clamped }
      resizeIndicatorRef.current = val
      setResizeIndicator(val)
    }

    const handleMouseUp = () => {
      if (!resizeRef.current) return
      const { eventId } = resizeRef.current
      const indicator = resizeIndicatorRef.current
      resizeRef.current = null
      resizeIndicatorRef.current = null
      setResizeIndicator(null)
      if (indicator && onResizeEvent) {
        const dateStr = toLocalDateStr(selectedDate)
        onResizeEvent(eventId, dateStr, indicator.hour)
      }
      // 클릭 방지 해제 지연
      setTimeout(() => { isDraggingRef.current = false }, 50)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [startHour, endHour, selectedDate, onResizeEvent])

  const handleResizeStart = (e, eventId, eventStartHour) => {
    e.stopPropagation()
    e.preventDefault()
    isDraggingRef.current = true
    resizeRef.current = { eventId, eventStartHour }
  }

  // 오늘이면 현재 시간 부근으로 자동 스크롤
  useEffect(() => {
    if (scrollRef.current && isToday) {
      const nowH = now.getHours()
      const scrollTo = Math.max(0, (nowH - startHour - 1) * HOUR_HEIGHT)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [selectedDate])

  const dayEvents = events.filter((evt) => {
    const start = evt.startTime?.toDate?.()
    if (!start) return false
    const end = evt.endTime?.toDate?.() || new Date(start.getTime() + 3600000)
    const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return start < dayEnd && end > dayStart
  })

  const laid = layoutEvents(dayEvents, selectedDate, startHour, endHour)

  const goDay = (offset) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + offset)
    setSelectedDate(next)
  }

  const handleEventClick = (evt, e) => {
    e.stopPropagation()
    if (isDraggingRef.current) return
    setPopup(popup?.id === evt.id ? null : evt)
  }

  return (
    <div className="flex flex-col h-full gap-1">
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

      {/* 타임라인 그리드 */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto thin-scrollbar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
        onClick={() => setPopup(null)}
      >
        <div className="relative">
          <div className="grid grid-cols-[52px_1fr] relative" style={{ height: `${totalHours * HOUR_HEIGHT}px` }}>
            {/* 시간 라벨 컬럼 */}
            <div className="relative border-r border-gray-200 dark:border-gray-700">
              {fullHours.map((hour) => {
                if (hour === startHour) return null
                const top = (hour - startHour) * HOUR_HEIGHT
                return (
                  <span
                    key={hour}
                    className="absolute right-2 text-[11px] text-gray-400 dark:text-gray-500 leading-none whitespace-nowrap"
                    style={{ top: `${top - 6}px` }}
                  >
                    {formatHourLabel(hour)}
                  </span>
                )
              })}
            </div>

            {/* 이벤트 영역 */}
            <div
              ref={gridRef}
              className="relative"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                const rect = e.currentTarget.getBoundingClientRect()
                const y = e.clientY - rect.top
                const rawHour = startHour + y / HOUR_HEIGHT
                const snapped = Math.round(rawHour * 6) / 6
                const clamped = Math.max(startHour, Math.min(endHour - 10/60, snapped))
                setDropTimeIndicator({ hour: clamped })
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDropTimeIndicator(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDropTimeIndicator(null)
                const eventId = e.dataTransfer.getData('text/plain')
                if (!eventId || !onMoveEvent) return
                const rect = e.currentTarget.getBoundingClientRect()
                const y = e.clientY - rect.top
                const rawHour = startHour + y / HOUR_HEIGHT
                const snappedHour = Math.round(rawHour * 6) / 6
                const clampedHour = Math.max(startHour, Math.min(endHour - 10/60, snappedHour))
                onMoveEvent(eventId, toLocalDateStr(selectedDate), clampedHour)
              }}
            >
              {/* 시간 그리드 라인 */}
              {fullHours.map((hour) => {
                const top = (hour - startHour) * HOUR_HEIGHT
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700"
                    style={{ top: `${top}px` }}
                  />
                )
              })}

              {/* 이벤트 블록 */}
              {laid.map((item) => {
                const isResizing = resizeRef.current?.eventId === item.evt.id
                const resizedHeight = isResizing && resizeIndicator
                  ? Math.max((resizeIndicator.hour - item.start) * HOUR_HEIGHT, 24)
                  : null
                const top = (item.start - startHour) * HOUR_HEIGHT
                const height = resizedHeight ?? Math.max((item.end - item.start) * HOUR_HEIGHT, 24)
                const width = `calc(${100 / item.totalColumns}% - 4px)`
                const left = `calc(${(item.column / item.totalColumns) * 100}% + 2px)`
                const isActive = popup?.id === item.evt.id
                const categoryType = getEventSource(item.evt)
                const colors = CATEGORY_COLOR_MAP[categoryType] || CATEGORY_COLOR_MAP.daily

                return (
                  <div
                    key={item.evt.id}
                    draggable={!resizeRef.current}
                    onDragStart={(e) => {
                      if (resizeRef.current) { e.preventDefault(); return }
                      e.dataTransfer.setData('text/plain', item.evt.id)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                      isDraggingRef.current = true
                      e.stopPropagation()
                    }}
                    onDragEnd={() => {
                      setTimeout(() => { isDraggingRef.current = false }, 50)
                      setDropTimeIndicator(null)
                    }}
                    className={`absolute rounded-md px-2 py-1 overflow-hidden cursor-grab active:cursor-grabbing border group ${
                      resizeRef.current ? '' : 'transition-all'
                    } ${
                      isActive
                        ? `${colors.activeBg} ${colors.activeBorder} shadow-md z-20 ring-2 ring-white/60 dark:ring-white/40`
                        : `${colors.bg} ${colors.border} hover:brightness-110 hover:shadow-sm z-10`
                    }`}
                    style={{ top: `${top}px`, height: `${height}px`, width, left, minHeight: '24px' }}
                    onClick={(e) => handleEventClick(item.evt, e)}
                  >
                    <p className="text-[11px] font-bold text-white truncate leading-tight">
                      {item.evt.title}
                    </p>
                    {height >= 36 && (
                      <p className="text-[10px] text-white/80 leading-tight truncate mt-0.5">
                        {formatEventTimeRange(item.evt.startTime, item.evt.endTime)}
                      </p>
                    )}
                    {height >= 54 && item.evt.location && (
                      <p className="text-[10px] text-white/70 leading-tight truncate mt-0.5">
                        {item.evt.location}
                      </p>
                    )}
                    {/* 하단 리사이즈 핸들 */}
                    {onResizeEvent && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => handleResizeStart(e, item.evt.id, item.start)}
                      >
                        <div className="mx-auto mt-0.5 w-6 h-1 rounded-full bg-white/60" />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* 드롭 시간 인디케이터 */}
              {dropTimeIndicator && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${(dropTimeIndicator.hour - startHour) * HOUR_HEIGHT}px`, transform: 'translateY(-50%)' }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full -ml-1" />
                  <div className="flex-1 border-t-2 border-blue-500 border-dashed" />
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-1 rounded shadow-sm ml-0.5">
                    {`${String(Math.floor(dropTimeIndicator.hour)).padStart(2, '0')}:${String(Math.round((dropTimeIndicator.hour % 1) * 60)).padStart(2, '0')}`}
                  </span>
                </div>
              )}

              {/* 리사이즈 시간 인디케이터 */}
              {resizeIndicator && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${(resizeIndicator.hour - startHour) * HOUR_HEIGHT}px`, transform: 'translateY(-50%)' }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full -ml-1" />
                  <div className="flex-1 border-t-2 border-green-500 border-dashed" />
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-1 rounded shadow-sm ml-0.5">
                    {`${String(Math.floor(resizeIndicator.hour)).padStart(2, '0')}:${String(Math.round((resizeIndicator.hour % 1) * 60)).padStart(2, '0')}`}
                  </span>
                </div>
              )}

              {/* 현재 시간 바 (오늘만) */}
              {isToday && (() => {
                const nowH = now.getHours() + now.getMinutes() / 60
                if (nowH < startHour || nowH > endHour) return null
                const top = (nowH - startHour) * HOUR_HEIGHT
                return (
                  <div
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{ top: `${top}px`, transform: 'translateY(-50%)', zIndex: 25 }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shrink-0" />
                      <div className="flex-1 border-t-2 border-red-500" />
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 이벤트 상세 팝업 (화면 중앙) */}
      {popup && createPortal(
        <>
          <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setPopup(null)} />
          <div
            className="fixed z-[9999] w-72 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white pr-2">{popup.title}</p>
              <div className="flex items-center gap-1 shrink-0">
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
            <div className="space-y-1.5">
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
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
