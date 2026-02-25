import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Clock, MapPin, Trash2, X } from 'lucide-react'
import { getEventSource } from '../utils/eventClassifier'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

const CATEGORY_COLOR_MAP = {
  chat:      { bg: 'bg-blue-500', border: 'border-blue-600', activeBg: 'bg-blue-600', activeBorder: 'border-blue-700' },
  daily:     { bg: 'bg-blue-500', border: 'border-blue-600', activeBg: 'bg-blue-600', activeBorder: 'border-blue-700' },
  petcare:   { bg: 'bg-teal-500', border: 'border-teal-600', activeBg: 'bg-teal-600', activeBorder: 'border-teal-700' },
  work:      { bg: 'bg-indigo-500', border: 'border-indigo-600', activeBg: 'bg-indigo-600', activeBorder: 'border-indigo-700' },
  childcare: { bg: 'bg-pink-500', border: 'border-pink-600', activeBg: 'bg-pink-600', activeBorder: 'border-pink-700' },
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

// 시간을 한국어 AM/PM 형식으로 변환 (예: "AM 9시", "PM 1시")
const formatHourLabel = (hour) => {
  if (hour === 0) return 'AM 12시'
  if (hour < 12) return `AM ${hour}시`
  if (hour === 12) return 'PM 12시'
  return `PM ${hour - 12}시`
}

// 이벤트 시간을 구글 캘린더 스타일로 표시 (예: "PM 1:15~ 4시")
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

  return `${startStr}~ ${endStr}`
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

export default function WeekView({ selectedDate, setSelectedDate, events, onDelete, onMoveEvent, onResizeEvent, startHour = 0, endHour = 24 }) {
  const totalHours = endHour - startHour
  const fullHours = Array.from({ length: totalHours + 1 }, (_, i) => i + startHour)
  const HOUR_HEIGHT = 48
  const [popup, setPopup] = useState(null)
  const popupRef = useRef(null)
  const [popupStyle, setPopupStyle] = useState({})
  const [dropTargetCol, setDropTargetCol] = useState(null)
  const [dropTimeIndicator, setDropTimeIndicator] = useState(null)
  const isDraggingRef = useRef(false)
  const weekDates = getWeekDates(selectedDate)
  const today = toLocalDateStr(new Date())

  // 리사이즈 상태
  const resizeRef = useRef(null) // { eventId, colIdx, eventStartHour }
  const [resizeIndicator, setResizeIndicator] = useState(null) // { col, hour }
  const resizeIndicatorRef = useRef(null)

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

  // 팝업 위치 계산 (이벤트 옆에 표시, 화면 밖으로 나가지 않게)
  useEffect(() => {
    if (!popup?._rect) {
      setPopupStyle({})
      return
    }
    requestAnimationFrame(() => {
      if (!popupRef.current) return
      const rect = popup._rect
      const el = popupRef.current
      const popupW = el.offsetWidth
      const popupH = el.offsetHeight
      let left = rect.right + 8
      let top = rect.top
      // 우측 공간 부족 시 왼쪽에 표시
      if (left + popupW > window.innerWidth - 16) {
        left = rect.left - popupW - 8
      }
      // 하단 공간 부족 시 위로 조정
      if (top + popupH > window.innerHeight - 16) {
        top = window.innerHeight - popupH - 16
      }
      top = Math.max(16, top)
      left = Math.max(16, left)
      setPopupStyle({ left: `${left}px`, top: `${top}px`, opacity: 1 })
    })
  }, [popup?.id])

  // 현재 시간 바
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 리사이즈 드래그 핸들러 (마우스 이벤트)
  const gridRef = useRef(null)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current) return
      e.preventDefault()
      const gridEl = gridRef.current
      if (!gridEl) return
      // 해당 컬럼의 DOM 위치 계산
      const cols = gridEl.querySelectorAll('[data-week-col]')
      const colEl = cols[resizeRef.current.colIdx]
      if (!colEl) return
      const rect = colEl.getBoundingClientRect()
      const y = e.clientY - rect.top
      const rawHour = startHour + y / HOUR_HEIGHT
      // 10분 단위 스냅
      const snapped = Math.round(rawHour * 6) / 6
      const minEnd = resizeRef.current.eventStartHour + 10 / 60
      const clamped = Math.max(minEnd, Math.min(endHour, snapped))
      const val = { col: resizeRef.current.colIdx, hour: clamped }
      resizeIndicatorRef.current = val
      setResizeIndicator(val)
    }

    const handleMouseUp = () => {
      if (!resizeRef.current) return
      const { eventId, colIdx } = resizeRef.current
      const indicator = resizeIndicatorRef.current
      resizeRef.current = null
      resizeIndicatorRef.current = null
      setResizeIndicator(null)
      if (indicator && onResizeEvent) {
        const date = weekDates[colIdx]
        const dateStr = toLocalDateStr(date)
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
  }, [startHour, endHour, weekDates, onResizeEvent])

  const handleResizeStart = (e, eventId, colIdx, eventStartHour) => {
    e.stopPropagation()
    e.preventDefault()
    isDraggingRef.current = true
    resizeRef.current = { eventId, colIdx, eventStartHour }
  }

  const yearMonth = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`

  const goWeek = (offset) => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + offset * 7)
    setSelectedDate(next)
  }

  const goToday = () => setSelectedDate(new Date())

  const getEventsForDate = (date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return events.filter((evt) => {
      const start = evt.startTime?.toDate?.()
      if (!start) return false
      const end = evt.endTime?.toDate?.() || new Date(start.getTime() + 3600000)
      return start < dayEnd && end > dayStart
    })
  }

  const handleEventClick = (evt, e) => {
    e.stopPropagation()
    if (isDraggingRef.current) return
    if (popup?.id === evt.id) {
      setPopup(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setPopupStyle({})
    setPopup({ ...evt, _rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom } })
  }

  return (
    <div className="flex flex-col h-full gap-1">
      {/* 주 네비게이션 */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={goToday}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          오늘
        </button>
        <button onClick={() => goWeek(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button onClick={() => goWeek(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
        </button>
        <span className="text-base font-semibold text-gray-800 dark:text-gray-200 ml-1">{yearMonth}</span>
      </div>

      {/* 주간 그리드 */}
      <div className="overflow-y-auto flex-1 min-h-0 thin-scrollbar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" onClick={() => setPopup(null)} onScroll={() => popup && setPopup(null)}>
        {/* 요일 헤더 (sticky) */}
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30 rounded-t-xl">
          {/* GMT+09 라벨 */}
          <div className="flex items-end justify-center pb-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">GMT+09</span>
          </div>
          {weekDates.map((date, i) => {
            const isToday = toLocalDateStr(date) === today
            const isSaturday = i === 5
            const isSunday = i === 6
            return (
              <div
                key={i}
                className="text-center py-2 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedDate(date) }}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isToday ? 'text-blue-600 dark:text-blue-400' :
                  isSaturday ? 'text-blue-500 dark:text-blue-400' :
                  isSunday ? 'text-red-500 dark:text-red-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {DAY_LABELS[i]}
                </div>
                <div className={`text-lg leading-none ${
                  isToday
                    ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold text-sm'
                    : isSaturday
                      ? 'text-blue-500 dark:text-blue-400 font-medium'
                      : isSunday
                        ? 'text-red-500 dark:text-red-400 font-medium'
                        : 'text-gray-800 dark:text-gray-200 font-medium'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* 시간 그리드 */}
        <div className="relative">
          <div ref={gridRef} className="grid grid-cols-[52px_repeat(7,1fr)] relative" style={{ height: `${totalHours * HOUR_HEIGHT}px` }}>
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

            {/* 7개 컬럼 */}
            {weekDates.map((date, colIdx) => {
              const dayEvents = getEventsForDate(date)
              const laid = layoutEvents(dayEvents, date, startHour, endHour)
              const isToday = toLocalDateStr(date) === today

              return (
                <div
                  key={colIdx}
                  data-week-col={colIdx}
                  className={`relative border-l border-gray-200 dark:border-gray-700 ${
                    dropTargetCol === colIdx ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDropTargetCol(colIdx)
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawHour = startHour + y / HOUR_HEIGHT
                    const snapped = Math.round(rawHour * 6) / 6
                    const clamped = Math.max(startHour, Math.min(endHour - 10/60, snapped))
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
                    const rawHour = startHour + y / HOUR_HEIGHT
                    const snappedHour = Math.round(rawHour * 6) / 6
                    const clampedHour = Math.max(startHour, Math.min(endHour - 10/60, snappedHour))
                    onMoveEvent(eventId, toLocalDateStr(date), clampedHour)
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
                          setDropTargetCol(null)
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
                        {/* 하단 리사이즈 핸들 */}
                        {onResizeEvent && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => handleResizeStart(e, item.evt.id, colIdx, item.start)}
                          >
                            <div className="mx-auto mt-0.5 w-6 h-1 rounded-full bg-white/60" />
                          </div>
                        )}
                      </div>
                    )
                  })}

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

                  {/* 드롭 시간 인디케이터 */}
                  {dropTimeIndicator && dropTimeIndicator.col === colIdx && (
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
                  {resizeIndicator && resizeIndicator.col === colIdx && (
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
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 이벤트 상세 팝업 */}
      {popup && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setPopup(null)} />
          <div
            ref={popupRef}
            className="fixed z-[9999] w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl"
            style={{ opacity: 0, transition: 'opacity 0.15s', ...popupStyle }}
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
