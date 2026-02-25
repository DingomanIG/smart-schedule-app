import { useState, useEffect, useRef } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Clock, MapPin, Trash2, GripVertical, CheckCircle2, Circle, Eye, EyeOff, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getEvents, deleteEvent, moveEvent, updateEvent, toggleEventCompleted, createEvent } from '../services/schedule'
import { Timestamp } from 'firebase/firestore'
import { getMonthHolidayMap, generateAnniversaryDates } from '../data/koreanHolidays'
import { getCategoryProfile } from '../services/categoryProfile'
import { lunarToSolar } from '../utils/lunarConverter'
import DayView from './DayView'
import WeekView from './WeekView'
import { useLanguage } from '../hooks/useLanguage'
import { useCalendarVisibility } from '../hooks/useCalendarVisibility'
import { getEventSource } from '../utils/eventClassifier'

// 월간 뷰 소스별 뱃지 색상 (chat+daily는 동일 파란색이므로 'general'로 병합)
const SOURCE_BADGE_COLORS = {
  general:   'bg-blue-500',
  petcare:   'bg-teal-500',
  work:      'bg-indigo-500',
  childcare: 'bg-pink-500',
}
const SOURCE_BADGE_ORDER = ['general', 'petcare', 'work', 'childcare']

// 월간 뷰 일정 카드 테두리 색상 (소스별)
const SOURCE_BORDER_COLORS = {
  chat:      'border-gray-200 dark:border-gray-700',
  daily:     'border-blue-300 dark:border-blue-700',
  petcare:   'border-teal-300 dark:border-teal-700',
  work:      'border-indigo-300 dark:border-indigo-700',
  childcare: 'border-pink-300 dark:border-pink-700',
}

const VIEW_MODES_KO = [
  { key: 'day', label: '일간' },
  { key: 'week', label: '주간' },
  { key: 'month', label: '월간' },
]

const VIEW_MODES_EN = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

const toLocalDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarView({ userId, refreshKey, now: nowProp, onCurrentEventChange, onEventCreated }) {
  const { lang, t } = useLanguage()
  const VIEW_MODES = lang === 'en' ? VIEW_MODES_EN : VIEW_MODES_KO
  const [viewMode, setViewMode] = useState('month')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [monthEvents, setMonthEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [draggingEvent, setDraggingEvent] = useState(null)
  const [holidayMap, setHolidayMap] = useState(() =>
    getMonthHolidayMap(new Date().getFullYear(), new Date().getMonth() + 1)
  )
  const [birthdayMap, setBirthdayMap] = useState(new Map())
  const [anniversaryMap, setAnniversaryMap] = useState(new Map())
  const [eventMap, setEventMap] = useState(new Map())
  const [weekViewRange, setWeekViewRange] = useState({ startHour: 0, endHour: 24 })
  const [activeStartDate, setActiveStartDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  const [localNow, setLocalNow] = useState(new Date())
  const nowTimerRef = useRef(null)
  const [quickAddDate, setQuickAddDate] = useState(null)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [qaStartAmpm, setQaStartAmpm] = useState('AM')
  const [qaStartHour, setQaStartHour] = useState(9)
  const [qaStartMin, setQaStartMin] = useState(0)
  const [qaEndAmpm, setQaEndAmpm] = useState('AM')
  const [qaEndHour, setQaEndHour] = useState(10)
  const [qaEndMin, setQaEndMin] = useState(0)
  const lastClickRef = useRef({ date: null, time: 0 })
  const now = nowProp || localNow
  const { visibility, toggleVisibility } = useCalendarVisibility()

  // 현재 시간 매분 업데이트 (fallback when no prop)
  useEffect(() => {
    if (nowProp) return
    const updateNow = () => setLocalNow(new Date())
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      updateNow()
      nowTimerRef.current = setInterval(updateNow, 60000)
    }, msUntilNextMinute)
    return () => {
      clearTimeout(timeout)
      if (nowTimerRef.current) clearInterval(nowTimerRef.current)
    }
  }, [nowProp])

  // 현재 진행 중인 일정 찾기
  const currentEvent = monthEvents.find((evt) => {
    const start = evt.startTime?.toDate?.()
    if (!start) return false
    const end = evt.endTime?.toDate?.() || new Date(start.getTime() + 3600000)
    return start <= now && now < end
  })

  // 현재 일정을 부모에게 전달
  useEffect(() => {
    onCurrentEventChange?.(currentEvent || null)
  }, [currentEvent?.id])

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

  // 일정 종료 시간 리사이즈 핸들러
  const handleResizeEvent = async (eventId, dateStr, newEndHour) => {
    const event = monthEvents.find((e) => e.id === eventId)
    if (!event) return
    const [year, month, day] = dateStr.split('-').map(Number)
    const newEnd = new Date(year, month - 1, day)
    newEnd.setHours(Math.floor(newEndHour), Math.round((newEndHour % 1) * 60), 0, 0)
    try {
      await updateEvent(eventId, { endTime: Timestamp.fromDate(newEnd) })
      await fetchMonthEvents(selectedDate)
    } catch (err) {
      console.error('일정 리사이즈 오류:', err)
    }
  }

  // 현재 보이는 월의 전체 일정 가져오기
  const fetchMonthEvents = async (activeDate) => {
    const start = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
    const end = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0, 23, 59, 59)
    try {
      const data = await getEvents(userId, start, end)
      setMonthEvents(data.filter((e) => !e.disabled))
    } catch (err) {
      console.error('일정 조회 오류:', err)
    }
  }

  // 필터 토글 기반 표시 이벤트 파생
  const visibleEvents = monthEvents.filter((evt) => {
    const source = getEventSource(evt)
    return visibility[source] !== false
  })

  // 선택된 날짜의 일정 필터링
  useEffect(() => {
    const dateStr = toLocalDateStr(selectedDate)
    const filtered = visibleEvents.filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? toLocalDateStr(evt.startTime.toDate())
        : ''
      return evtDate === dateStr
    })
    setEvents(filtered)
  }, [selectedDate, monthEvents, visibility])

  // 초기 로드 및 월 변경 시
  useEffect(() => {
    setLoading(true)
    fetchMonthEvents(selectedDate).finally(() => setLoading(false))
  }, [userId, refreshKey])

  // 생일/기념일/행사 데이터 로드
  useEffect(() => {
    const loadMajorEvents = async () => {
      try {
        const profile = await getCategoryProfile(userId, 'H12')
        if (!profile) return

        // 생일
        if (profile.birthdays?.length > 0) {
          const map = new Map()
          const thisYear = new Date().getFullYear()
          profile.birthdays.forEach((b) => {
            const [mm, dd] = b.date.split('-')
            const month = parseInt(mm)
            const day = parseInt(dd)
            const mmdd = `${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
            for (let y = thisYear - 1; y <= thisYear + 1; y++) {
              if (b.calendarType === 'lunar') {
                const solarDate = lunarToSolar(y, month, day)
                if (solarDate) map.set(solarDate, b.name)
              } else {
                map.set(`${y}-${mmdd}`, b.name)
              }
            }
          })
          setBirthdayMap(map)
        }

        // 기념일
        if (profile.anniversaries?.length > 0) {
          const map = new Map()
          profile.anniversaries.forEach((a) => {
            const allDates = generateAnniversaryDates(a.startDate)
            const dates = a.show100Days === false ? allDates.filter((d) => !d.label.match(/^\d+일$/)) : allDates
            dates.forEach((d) => {
              map.set(d.date, { name: a.name, label: d.label, labelEn: d.labelEn })
            })
          })
          setAnniversaryMap(map)
        }

        // 행사
        if (profile.events?.length > 0) {
          const map = new Map()
          profile.events.forEach((e) => {
            const allDates = generateAnniversaryDates(e.startDate)
            const dates = e.show100Days === false ? allDates.filter((d) => !d.label.match(/^\d+일$/)) : allDates
            dates.forEach((d) => {
              map.set(d.date, { name: e.name, label: d.label, labelEn: d.labelEn })
            })
          })
          setEventMap(map)
        }
      } catch { /* demo mode */ }
    }
    loadMajorEvents()
  }, [userId, refreshKey])

  // 수면 시간 기반 주간 뷰 표시 범위 로드 (일상 카드의 수면 이벤트에서 추출)
  useEffect(() => {
    const loadSleepRange = () => {
      // monthEvents에서 수면 이벤트 찾기 (helper로 생성된 routine 카테고리, 제목에 '수면' 포함)
      const sleepEvent = monthEvents.find(
        (evt) => evt.createdVia === 'category' && evt.title?.includes('수면') && evt.startTime?.toDate
      )
      if (sleepEvent) {
        const bedHour = sleepEvent.startTime.toDate().getHours()
        const wakeHour = sleepEvent.endTime?.toDate?.()?.getHours() ?? NaN
        if (!isNaN(wakeHour)) {
          const start = Math.max(0, wakeHour - 1)
          const end = Math.min(24, bedHour + 1)
          setWeekViewRange({ startHour: start, endHour: Math.max(end, start + 1) })
          return
        }
      }
      // 수면 이벤트 없으면 프로필 폴백
      getCategoryProfile(userId, 'H01').then((profile) => {
        if (profile?.wakeUp) {
          const wakeHour = parseInt(profile.wakeUp.split(':')[0], 10)
          const bedHour = profile.bedTime ? parseInt(profile.bedTime.split(':')[0], 10) : NaN
          if (!isNaN(wakeHour)) {
            const start = Math.max(0, wakeHour - 1)
            const end = !isNaN(bedHour) ? Math.min(24, bedHour + 1) : 24
            setWeekViewRange({ startHour: start, endHour: Math.max(end, start + 1) })
          }
        }
      }).catch(() => { /* demo mode */ })
    }
    loadSleepRange()
  }, [userId, refreshKey, monthEvents])

  const handleActiveStartDateChange = ({ activeStartDate: asd }) => {
    setActiveStartDate(asd)
    fetchMonthEvents(asd)
    setHolidayMap(getMonthHolidayMap(asd.getFullYear(), asd.getMonth() + 1))
  }

  const goMonth = (offset) => {
    const next = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + offset, 1)
    setActiveStartDate(next)
    fetchMonthEvents(next)
    setHolidayMap(getMonthHolidayMap(next.getFullYear(), next.getMonth() + 1))
  }

  const goToday = () => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    setActiveStartDate(first)
    setSelectedDate(now)
    fetchMonthEvents(first)
    setHolidayMap(getMonthHolidayMap(now.getFullYear(), now.getMonth() + 1))
  }

  const monthYearLabel = lang === 'en'
    ? `${activeStartDate.toLocaleString('en-US', { month: 'long' })} ${activeStartDate.getFullYear()}`
    : `${activeStartDate.getFullYear()}년 ${activeStartDate.getMonth() + 1}월`

  const handleToggleCompleted = async (eventId, currentCompleted) => {
    try {
      await toggleEventCompleted(eventId, currentCompleted)
      setMonthEvents((prev) =>
        prev.map((e) => e.id === eventId ? { ...e, completed: !currentCompleted } : e)
      )
    } catch (err) {
      console.error('완료 토글 오류:', err)
    }
  }

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId)
      setMonthEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (err) {
      console.error('삭제 오류:', err)
    }
  }

  // 날짜 클릭 (싱글=선택, 더블=빠른 등록)
  const handleDateClick = (date) => {
    const now = Date.now()
    const last = lastClickRef.current
    if (last.date && toLocalDateStr(last.date) === toLocalDateStr(date) && now - last.time < 400) {
      // 더블클릭 → 빠른 등록 모달
      setQuickAddDate(date)
      setQuickAddTitle('')
      setQaStartAmpm('AM')
      setQaStartHour(9)
      setQaStartMin(0)
      setQaEndAmpm('AM')
      setQaEndHour(10)
      setQaEndMin(0)
      lastClickRef.current = { date: null, time: 0 }
    } else {
      lastClickRef.current = { date, time: now }
      setSelectedDate(date)
    }
  }

  // AM/PM + 12h → 24h 변환
  const to24Hour = (ampm, hour) => {
    if (ampm === 'AM') return hour === 12 ? 0 : hour
    return hour === 12 ? 12 : hour + 12
  }

  // 빠른 일정 등록
  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim() || !quickAddDate) return
    const startH = to24Hour(qaStartAmpm, qaStartHour)
    const endH = to24Hour(qaEndAmpm, qaEndHour)
    const startTotal = startH * 60 + qaStartMin
    const endTotal = endH * 60 + qaEndMin
    const duration = endTotal > startTotal ? endTotal - startTotal : 60
    const timeStr = `${String(startH).padStart(2, '0')}:${String(qaStartMin).padStart(2, '0')}`
    try {
      await createEvent(userId, {
        title: quickAddTitle.trim(),
        date: toLocalDateStr(quickAddDate),
        time: timeStr,
        duration,
      })
      setQuickAddDate(null)
      await fetchMonthEvents(activeStartDate)
      onEventCreated?.()
    } catch (err) {
      console.error('빠른 일정 등록 오류:', err)
    }
  }

  // 주간/일간 뷰에서 날짜 변경 시 월 데이터 갱신
  const handleDateChange = (date) => {
    setSelectedDate(date)
    // 월이 바뀌면 데이터 다시 로드
    if (date.getMonth() !== selectedDate.getMonth() || date.getFullYear() !== selectedDate.getFullYear()) {
      fetchMonthEvents(date)
    }
  }

  // 공휴일 날짜 빨간색 표시
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null
    const dateStr = toLocalDateStr(date)
    if (holidayMap.has(dateStr)) return 'holiday-tile'
    return null
  }

  // 일정 개수 배지 + 공휴일 표시 + 드롭존 표시
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const dateStr = toLocalDateStr(date)
    const holidayName = holidayMap.get(dateStr)
    const birthdayName = birthdayMap.get(dateStr)
    const anniversaryInfo = anniversaryMap.get(dateStr)
    const eventInfo = eventMap.get(dateStr)
    const dayEvents = visibleEvents.filter((evt) => {
      const evtDate = evt.startTime?.toDate?.()
        ? toLocalDateStr(evt.startTime.toDate())
        : ''
      return evtDate === dateStr
    })
    const showMajor = visibility.major !== false

    // 소스별 카운트 (chat+daily → general 병합)
    const sourceCounts = {}
    dayEvents.forEach((evt) => {
      const source = getEventSource(evt)
      const visualKey = (source === 'chat' || source === 'daily') ? 'general' : source
      sourceCounts[visualKey] = (sourceCounts[visualKey] || 0) + 1
    })
    return (
      <>
        {holidayName && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-full px-0.5" title={holidayName}>
            <span className="block text-[12px] leading-tight text-red-500 dark:text-red-400 truncate text-center font-medium">
              {holidayName}
            </span>
          </div>
        )}
        {showMajor && !holidayName && birthdayName && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-full px-0.5" title={`${birthdayName} 생일`}>
            <span className="block text-[12px] leading-tight text-pink-500 dark:text-pink-400 truncate text-center font-medium">
              {birthdayName} 생일
            </span>
          </div>
        )}
        {showMajor && !holidayName && !birthdayName && anniversaryInfo && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-full px-0.5" title={`${anniversaryInfo.name} ${lang === 'ko' ? anniversaryInfo.label : anniversaryInfo.labelEn}`}>
            <span className="block text-[12px] leading-tight text-purple-500 dark:text-purple-400 truncate text-center font-medium">
              {anniversaryInfo.name} {lang === 'ko' ? anniversaryInfo.label : anniversaryInfo.labelEn}
            </span>
          </div>
        )}
        {showMajor && !holidayName && !birthdayName && !anniversaryInfo && eventInfo && (
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-full px-0.5" title={`${eventInfo.name} ${lang === 'ko' ? eventInfo.label : eventInfo.labelEn}`}>
            <span className="block text-[12px] leading-tight text-orange-500 dark:text-orange-400 truncate text-center font-medium">
              {eventInfo.name} {lang === 'ko' ? eventInfo.label : eventInfo.labelEn}
            </span>
          </div>
        )}
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-[2px] max-w-full px-0.5">
            {SOURCE_BADGE_ORDER
              .filter((key) => sourceCounts[key])
              .map((key) => (
                <span
                  key={key}
                  className={`min-w-[14px] h-[14px] px-[3px] ${SOURCE_BADGE_COLORS[key]} text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none`}
                >
                  {sourceCounts[key] > 99 ? '99' : sourceCounts[key]}
                </span>
              ))
            }
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
    return d.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* 뷰 전환 버튼 */}
      <div className="flex gap-1 shrink-0">
        {VIEW_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center min-w-[64px] ${viewMode === key
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 캘린더 표시 필터 */}
      <div className="flex gap-1 shrink-0 flex-wrap">
        {[
          { key: 'chat',      label: t('filterChat'),      active: 'bg-blue-500 text-white',      inactive: 'bg-blue-500/20 text-blue-400/50' },
          { key: 'daily',     label: t('filterDaily'),     active: 'bg-blue-500 text-white',      inactive: 'bg-blue-500/20 text-blue-400/50' },
          { key: 'petcare',   label: t('filterPetCare'),   active: 'bg-teal-500 text-white',      inactive: 'bg-teal-500/20 text-teal-400/50' },
          { key: 'work',      label: t('filterWork'),      active: 'bg-indigo-500 text-white',    inactive: 'bg-indigo-500/20 text-indigo-400/50' },
          { key: 'childcare', label: t('filterChildcare'), active: 'bg-pink-500 text-white',      inactive: 'bg-pink-500/20 text-pink-400/50' },
          { key: 'major',     label: t('filterMajor'),     active: 'bg-red-500 text-white',       inactive: 'bg-red-500/20 text-red-400/50' },
        ].map(({ key, label, active, inactive }) => {
          const isVisible = visibility[key] !== false
          return (
            <button
              key={key}
              onClick={() => toggleVisibility(key)}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${
                isVisible ? active : inactive
              }`}
              title={isVisible ? `${label} 숨기기` : `${label} 표시`}
            >
              {isVisible
                ? <Eye size={10} className="shrink-0" />
                : <EyeOff size={10} className="shrink-0" />
              }
              {label}
            </button>
          )
        })}
      </div>

      {/* 월간 뷰 */}
      {viewMode === 'month' && (
        <>
          {/* 월 네비게이션 (주간 뷰와 동일) */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={goToday}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {lang === 'en' ? 'Today' : '오늘'}
            </button>
            <button onClick={() => goMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={() => goMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200 ml-1">{monthYearLabel}</span>
          </div>

          <div className="calendar-wrapper">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              activeStartDate={activeStartDate}
              onActiveStartDateChange={handleActiveStartDateChange}
              tileContent={tileContent}
              tileClassName={tileClassName}
              formatDay={(locale, date) => date.getDate()}
              locale={lang === 'en' ? 'en-US' : 'ko-KR'}
              calendarType="gregory"
              showNavigation={false}
              showFixedNumberOfWeeks
            />
          </div>

          {/* 선택된 날짜 일정 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {events.length > 0 && (() => {
                const completedCount = events.filter(e => e.completed).length
                const totalCount = events.length
                const rate = Math.round((completedCount / totalCount) * 100)
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {completedCount}/{totalCount}{lang === 'ko' ? '개' : ''}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            rate === 100 ? 'bg-green-500' : rate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        rate === 100 ? 'text-green-500 dark:text-green-400' : rate >= 50 ? 'text-blue-500 dark:text-blue-400' : 'text-amber-500 dark:text-amber-400'
                      }`}>
                        {rate}%
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 animate-pulse">
                    <div className="flex items-start gap-2">
                      <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-600 rounded mt-0.5" />
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('noEvents')}</p>
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
                    className={`bg-white dark:bg-gray-800 border rounded-xl px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing transition-opacity ${
                      SOURCE_BORDER_COLORS[getEventSource(evt)] || 'border-gray-200 dark:border-gray-700'
                    } ${draggingEvent?.id === evt.id ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      <button
                        onClick={() => handleToggleCompleted(evt.id, !!evt.completed)}
                        className="shrink-0 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        title={evt.completed ? t('markIncomplete') : t('markComplete')}
                      >
                        {evt.completed
                          ? <CheckCircle2 size={16} className="text-green-500 dark:text-green-400" />
                          : <Circle size={16} />
                        }
                      </button>
                      <p className={`text-sm font-semibold truncate ${evt.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{evt.title}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <Clock size={11} />
                        <span>{formatTime(evt.startTime)}{evt.endTime ? ` ~ ${formatTime(evt.endTime)}` : ''}</span>
                      </div>
                      {evt.location && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          <MapPin size={11} />
                          <span className="truncate max-w-[100px]">{evt.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-1 shrink-0"
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
            events={visibleEvents}
            onDelete={handleDelete}
            onMoveEvent={handleMoveEvent}
            onResizeEvent={handleResizeEvent}
            startHour={weekViewRange.startHour}
            endHour={weekViewRange.endHour}
          />
        </div>
      )}

      {/* 일간 뷰 */}
      {viewMode === 'day' && (
        <div className="flex-1 min-h-0">
          <DayView
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            events={visibleEvents}
            onDelete={handleDelete}
            onMoveEvent={handleMoveEvent}
            onResizeEvent={handleResizeEvent}
            startHour={weekViewRange.startHour}
            endHour={weekViewRange.endHour}
          />
        </div>
      )}

      {/* 빠른 일정 등록 모달 (더블클릭) */}
      {quickAddDate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setQuickAddDate(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-5 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('quickAddHeading')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {quickAddDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setQuickAddDate(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && quickAddTitle.trim()) handleQuickAdd() }}
              placeholder={t('quickAddTitlePlaceholder')}
              autoFocus
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />

            {/* 시간 드롭다운: 시작 ~ 종료 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 시작 시간 */}
              <select value={qaStartAmpm} onChange={(e) => setQaStartAmpm(e.target.value)} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                <option value="AM">{lang === 'en' ? 'AM' : '오전'}</option>
                <option value="PM">{lang === 'en' ? 'PM' : '오후'}</option>
              </select>
              <select value={qaStartHour} onChange={(e) => setQaStartHour(Number(e.target.value))} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                {[12,1,2,3,4,5,6,7,8,9,10,11].map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-gray-400 dark:text-gray-500 text-xs">:</span>
              <select value={qaStartMin} onChange={(e) => setQaStartMin(Number(e.target.value))} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                {[0,10,20,30,40,50].map((m) => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
              </select>

              <span className="text-gray-400 dark:text-gray-500 text-sm mx-1">~</span>

              {/* 종료 시간 */}
              <select value={qaEndAmpm} onChange={(e) => setQaEndAmpm(e.target.value)} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                <option value="AM">{lang === 'en' ? 'AM' : '오전'}</option>
                <option value="PM">{lang === 'en' ? 'PM' : '오후'}</option>
              </select>
              <select value={qaEndHour} onChange={(e) => setQaEndHour(Number(e.target.value))} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                {[12,1,2,3,4,5,6,7,8,9,10,11].map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="text-gray-400 dark:text-gray-500 text-xs">:</span>
              <select value={qaEndMin} onChange={(e) => setQaEndMin(Number(e.target.value))} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500">
                {[0,10,20,30,40,50].map((m) => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setQuickAddDate(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleQuickAdd}
                disabled={!quickAddTitle.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('quickAddSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
