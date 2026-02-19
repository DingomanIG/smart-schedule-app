import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Flag, Cake, Heart, Palmtree, Plus, X, Trash2,
  Calendar, ChevronDown, ChevronUp, AlertTriangle, PartyPopper,
} from 'lucide-react'
import {
  getHolidaysForYear, getDDay, analyzeVacationEfficiency,
  generateAnniversaryDates,
} from '../data/koreanHolidays'
import { getHelperProfile, saveHelperProfile } from '../services/helperProfile'
import { lunarToSolar } from '../utils/lunarConverter'
import { useLanguage } from '../hooks/useLanguage'

const TABS = [
  { key: 'holiday', icon: Flag, color: 'red' },
  { key: 'birthday', icon: Cake, color: 'pink' },
  { key: 'anniversary', icon: Heart, color: 'purple' },
  { key: 'event', icon: PartyPopper, color: 'orange' },
  { key: 'vacation', icon: Palmtree, color: 'green' },
]

const RELATION_OPTIONS = [
  { key: 'family', labelKo: '가족', labelEn: 'Family' },
  { key: 'friend', labelKo: '친구', labelEn: 'Friend' },
  { key: 'colleague', labelKo: '직장동료', labelEn: 'Colleague' },
  { key: 'lover', labelKo: '연인', labelEn: 'Lover' },
]

const formatDDay = (d, lang) => {
  if (d === 0) return lang === 'ko' ? 'D-Day' : 'Today'
  if (d > 0) return `D-${d}`
  return `D+${Math.abs(d)}`
}

export default function MajorEventsView({ userId, onEventCreated }) {
  const { lang, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('holiday')
  const [loading, setLoading] = useState(true)
  const [majorEvents, setMajorEvents] = useState({ birthdays: [], anniversaries: [], events: [] })
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedVacation, setExpandedVacation] = useState(null)
  const titleRef = useRef(null)

  // Add form state
  const [addName, setAddName] = useState('')
  const [addDate, setAddDate] = useState('')
  const [addRelation, setAddRelation] = useState('family')
  const [addCalendarType, setAddCalendarType] = useState('solar')
  const [addMemo, setAddMemo] = useState('')
  const [addShow100Days, setAddShow100Days] = useState(true)

  const currentYear = new Date().getFullYear()

  // Load major events from helperProfile (H12)
  const loadMajorEvents = useCallback(async () => {
    setLoading(true)
    try {
      const profile = await getHelperProfile(userId, 'H12')
      if (profile) {
        setMajorEvents({
          birthdays: profile.birthdays || [],
          anniversaries: profile.anniversaries || [],
          events: profile.events || [],
        })
      }
    } catch {
      // demo mode
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { loadMajorEvents() }, [loadMajorEvents])

  const saveMajorEvents = async (updated) => {
    setMajorEvents(updated)
    try {
      await saveHelperProfile(userId, 'H12', updated)
    } catch { /* demo mode */ }
    onEventCreated?.()
  }

  // Add birthday
  const handleAddBirthday = async () => {
    if (!addName.trim() || !addDate) return
    const newBirthday = {
      id: Date.now().toString(),
      name: addName.trim(),
      date: addDate, // MM-DD format
      calendarType: addCalendarType, // 'solar' or 'lunar'
      relation: addRelation,
      memo: addMemo.trim(),
    }
    const updated = {
      ...majorEvents,
      birthdays: [...majorEvents.birthdays, newBirthday],
    }
    await saveMajorEvents(updated)
    resetForm()
  }

  // Add anniversary
  const handleAddAnniversary = async () => {
    if (!addName.trim() || !addDate) return
    const newAnniversary = {
      id: Date.now().toString(),
      name: addName.trim(),
      startDate: addDate, // YYYY-MM-DD format
      show100Days: addShow100Days,
      memo: addMemo.trim(),
    }
    const updated = {
      ...majorEvents,
      anniversaries: [...majorEvents.anniversaries, newAnniversary],
    }
    await saveMajorEvents(updated)
    resetForm()
  }

  // Add event (행사)
  const handleAddEvent = async () => {
    if (!addName.trim() || !addDate) return
    const newEvent = {
      id: Date.now().toString(),
      name: addName.trim(),
      startDate: addDate, // YYYY-MM-DD format
      show100Days: addShow100Days,
      memo: addMemo.trim(),
    }
    const updated = {
      ...majorEvents,
      events: [...majorEvents.events, newEvent],
    }
    await saveMajorEvents(updated)
    resetForm()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const { type, id } = deleteConfirm
    const updated = {
      ...majorEvents,
      [type]: majorEvents[type].filter((item) => item.id !== id),
    }
    await saveMajorEvents(updated)
    setDeleteConfirm(null)
  }

  const resetForm = () => {
    setShowAddForm(false)
    setAddName('')
    setAddDate('')
    setAddRelation('family')
    setAddCalendarType('solar')
    setAddMemo('')
    setAddShow100Days(true)
  }

  useEffect(() => {
    if (showAddForm && titleRef.current) titleRef.current.focus()
  }, [showAddForm])

  // Holidays data
  const holidays = getHolidaysForYear(currentYear)
  const upcomingHolidays = holidays.filter((h) => getDDay(h.date) >= 0)
  const pastHolidays = holidays.filter((h) => getDDay(h.date) < 0)

  // Vacation efficiency
  const vacationResults = analyzeVacationEfficiency(currentYear)

  // Birthdays with this year's date + D-Day (음력→양력 변환 포함)
  const birthdaysWithDDay = majorEvents.birthdays.map((b) => {
    const [mm, dd] = b.date.split('-')
    const month = parseInt(mm)
    const day = parseInt(dd)

    let thisYearDate, nextYearDate
    if (b.calendarType === 'lunar') {
      thisYearDate = lunarToSolar(currentYear, month, day) || `${currentYear}-${b.date}`
      nextYearDate = lunarToSolar(currentYear + 1, month, day) || `${currentYear + 1}-${b.date}`
    } else {
      thisYearDate = `${currentYear}-${b.date}`
      nextYearDate = `${currentYear + 1}-${b.date}`
    }

    const dday = getDDay(thisYearDate)
    const displayDate = dday < 0 ? nextYearDate : thisYearDate
    const displayDDay = dday < 0 ? getDDay(nextYearDate) : dday
    return { ...b, displayDate, dday: displayDDay }
  }).sort((a, b) => a.dday - b.dday)

  // Anniversaries with auto-generated dates
  const anniversariesWithDates = majorEvents.anniversaries.map((a) => {
    const allDates = generateAnniversaryDates(a.startDate)
    const dates = a.show100Days === false ? allDates.filter((d) => !d.label.match(/^\d+일$/)) : allDates
    const upcomingDates = dates.filter((d) => getDDay(d.date) >= 0)
    const nextDate = upcomingDates[0] || null
    const totalDays = getDDay(a.startDate) * -1 // 시작일로부터 경과일
    return { ...a, generatedDates: dates, nextDate, totalDays }
  })

  // Events (행사) with D-Day - same structure as anniversaries
  const eventsWithDates = majorEvents.events.map((e) => {
    const allDates = generateAnniversaryDates(e.startDate)
    const dates = e.show100Days === false ? allDates.filter((d) => !d.label.match(/^\d+일$/)) : allDates
    const upcomingDates = dates.filter((d) => getDDay(d.date) >= 0)
    const nextDate = upcomingDates[0] || null
    const totalDays = getDDay(e.startDate) * -1
    return { ...e, generatedDates: dates, nextDate, totalDays }
  })

  const tabColor = {
    holiday: 'red',
    birthday: 'pink',
    anniversary: 'purple',
    event: 'orange',
    vacation: 'green',
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
        {TABS.map(({ key, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setShowAddForm(false) }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
              activeTab === key
                ? `bg-${color}-500 text-white`
                : `bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400`
            } hover:opacity-80`}
            style={activeTab === key ? { backgroundColor: color === 'red' ? '#ef4444' : color === 'pink' ? '#ec4899' : color === 'purple' ? '#a855f7' : color === 'orange' ? '#f97316' : '#22c55e' } : {}}
          >
            <Icon size={11} />
            {t(`majorTab_${key}`)}
          </button>
        ))}

        {/* Add button for birthday/anniversary tabs */}
        {(activeTab === 'birthday' || activeTab === 'anniversary' || activeTab === 'event') && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
              showAddForm
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500'
            }`}
          >
            {showAddForm ? <X size={12} /> : <Plus size={12} />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {/* Add Form */}
        {showAddForm && (activeTab === 'birthday' || activeTab === 'anniversary' || activeTab === 'event') && (
          <div className={`rounded-lg border p-3 space-y-2 ${
            activeTab === 'birthday'
              ? 'border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-900/10'
              : activeTab === 'event'
                ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
                : 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${
                activeTab === 'birthday' ? 'text-pink-600 dark:text-pink-400' : activeTab === 'event' ? 'text-orange-600 dark:text-orange-400' : 'text-purple-600 dark:text-purple-400'
              }`}>
                {activeTab === 'birthday' ? t('majorAddBirthday') : activeTab === 'event' ? t('majorAddEvent') : t('majorAddAnniversary')}
              </span>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
            <input
              ref={titleRef}
              type="text"
              placeholder={activeTab === 'birthday' ? t('majorNamePlaceholder') : activeTab === 'event' ? t('majorEventNamePlaceholder') : t('majorAnniversaryNamePlaceholder')}
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'birthday' ? handleAddBirthday() : activeTab === 'event' ? handleAddEvent() : handleAddAnniversary())}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400"
            />
            <div className="flex items-center gap-2">
              {activeTab === 'birthday' ? (
                <div className="flex items-center gap-1">
                  <select
                    value={addCalendarType}
                    onChange={(e) => setAddCalendarType(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="solar">양력</option>
                    <option value="lunar">음력</option>
                  </select>
                  <select
                    value={addDate ? addDate.split('-')[0] : ''}
                    onChange={(e) => {
                      const mm = e.target.value
                      const dd = addDate ? addDate.split('-')[1] : '01'
                      setAddDate(mm ? `${mm}-${dd || '01'}` : '')
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}월</option>
                    ))}
                  </select>
                  <select
                    value={addDate ? addDate.split('-')[1] : ''}
                    onChange={(e) => {
                      const mm = addDate ? addDate.split('-')[0] : '01'
                      const dd = e.target.value
                      setAddDate(dd ? `${mm || '01'}-${dd}` : '')
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="">일</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}일</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select
                    value={addDate ? addDate.split('-')[0] : ''}
                    onChange={(e) => {
                      const yyyy = e.target.value
                      const mm = addDate ? addDate.split('-')[1] : '01'
                      const dd = addDate ? addDate.split('-')[2] : '01'
                      setAddDate(yyyy ? `${yyyy}-${mm || '01'}-${dd || '01'}` : '')
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="">{lang === 'ko' ? '연도' : 'Year'}</option>
                    {Array.from({ length: 52 }, (_, i) => currentYear - 50 + i).map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={addDate ? addDate.split('-')[1] : ''}
                    onChange={(e) => {
                      const yyyy = addDate ? addDate.split('-')[0] : String(currentYear)
                      const mm = e.target.value
                      const dd = addDate ? addDate.split('-')[2] : '01'
                      setAddDate(mm ? `${yyyy || currentYear}-${mm}-${dd || '01'}` : '')
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="">{lang === 'ko' ? '월' : 'Month'}</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}{lang === 'ko' ? '월' : ''}</option>
                    ))}
                  </select>
                  <select
                    value={addDate ? addDate.split('-')[2] : ''}
                    onChange={(e) => {
                      const yyyy = addDate ? addDate.split('-')[0] : String(currentYear)
                      const mm = addDate ? addDate.split('-')[1] : '01'
                      const dd = e.target.value
                      setAddDate(dd ? `${yyyy || currentYear}-${mm || '01'}-${dd}` : '')
                    }}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="">{lang === 'ko' ? '일' : 'Day'}</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}{lang === 'ko' ? '일' : ''}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'birthday' && (
                <select
                  value={addRelation}
                  onChange={(e) => setAddRelation(e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
                >
                  {RELATION_OPTIONS.map((r) => (
                    <option key={r.key} value={r.key}>{lang === 'ko' ? r.labelKo : r.labelEn}</option>
                  ))}
                </select>
              )}
            </div>
            <input
              type="text"
              placeholder={t('majorMemoPlaceholder')}
              value={addMemo}
              onChange={(e) => setAddMemo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'birthday' ? handleAddBirthday() : activeTab === 'event' ? handleAddEvent() : handleAddAnniversary())}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400"
            />
            {(activeTab === 'anniversary' || activeTab === 'event') && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addShow100Days}
                  onChange={(e) => setAddShow100Days(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{t('majorShow100Days')}</span>
              </label>
            )}
            <div className="flex justify-end">
              <button
                onClick={activeTab === 'birthday' ? handleAddBirthday : activeTab === 'event' ? handleAddEvent : handleAddAnniversary}
                disabled={!addName.trim() || !addDate}
                className={`px-3 py-1 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  activeTab === 'birthday'
                    ? 'bg-pink-500 hover:bg-pink-600'
                    : activeTab === 'event'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {t('majorAddBtn')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* === Holiday Tab === */}
            {activeTab === 'holiday' && (
              <div className="space-y-1.5">
                {upcomingHolidays.length === 0 && pastHolidays.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('majorNoHolidays')}</p>
                ) : (
                  <>
                    {/* Upcoming */}
                    {upcomingHolidays.map((h) => {
                      const dday = getDDay(h.date)
                      const d = new Date(h.date + 'T00:00:00')
                      const weekday = lang === 'ko'
                        ? ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
                        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                      return (
                        <div
                          key={h.date + h.name}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            dday === 0
                              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                              : dday <= 7
                                ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10'
                                : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Flag size={12} className={`shrink-0 ${
                            h.isSubstitute ? 'text-blue-500' : 'text-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                              {lang === 'ko' ? h.name : h.nameEn}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                              {h.date.slice(5)} ({weekday})
                            </p>
                          </div>
                          <span className={`text-xs font-semibold shrink-0 ${
                            dday === 0 ? 'text-red-500' : dday <= 7 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {formatDDay(dday, lang)}
                          </span>
                        </div>
                      )
                    })}

                    {/* Past holidays (collapsed) */}
                    {pastHolidays.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-[11px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400">
                          {t('majorPastHolidays')} ({pastHolidays.length})
                        </summary>
                        <div className="mt-1 space-y-1">
                          {pastHolidays.map((h) => (
                            <div key={h.date + h.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-50">
                              <Flag size={10} className="shrink-0 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                                {lang === 'ko' ? h.name : h.nameEn}
                              </span>
                              <span className="text-[10px] text-gray-400">{h.date.slice(5)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </>
                )}
              </div>
            )}

            {/* === Birthday Tab === */}
            {activeTab === 'birthday' && (
              <div className="space-y-1.5">
                {birthdaysWithDDay.length === 0 && !showAddForm ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                    <Cake size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('majorNoBirthdays')}</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-1 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus size={14} />
                      {t('majorAddBirthday')}
                    </button>
                  </div>
                ) : (
                  birthdaysWithDDay.map((b) => {
                    const relation = RELATION_OPTIONS.find((r) => r.key === b.relation)
                    return (
                      <div
                        key={b.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          b.dday === 0
                            ? 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20'
                            : b.dday <= 7
                              ? 'border-pink-200 dark:border-pink-800 bg-pink-50/30 dark:bg-pink-900/10'
                              : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Cake size={12} className="shrink-0 text-pink-400" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{b.name}</p>
                            {relation && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 shrink-0">
                                {lang === 'ko' ? relation.labelKo : relation.labelEn}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {b.date} · {b.calendarType === 'lunar' ? '음력' : '양력'}
                            {b.memo && ` · ${b.memo}`}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold shrink-0 ${
                          b.dday === 0 ? 'text-pink-500' : b.dday <= 7 ? 'text-pink-400' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatDDay(b.dday, lang)}
                        </span>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'birthdays', id: b.id, name: b.name })}
                          className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* === Anniversary Tab === */}
            {activeTab === 'anniversary' && (
              <div className="space-y-2">
                {anniversariesWithDates.length === 0 && !showAddForm ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                    <Heart size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('majorNoAnniversaries')}</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-1 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                    >
                      <Plus size={14} />
                      {t('majorAddAnniversary')}
                    </button>
                  </div>
                ) : (
                  anniversariesWithDates.map((a) => (
                    <div key={a.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {/* Header */}
                      <div className="px-3 py-2 bg-purple-50/50 dark:bg-purple-900/10 flex items-center gap-2">
                        <Heart size={12} className="shrink-0 text-purple-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{a.name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {a.startDate} {t('majorStartDate')} · D+{a.totalDays}
                            {a.memo && ` · ${a.memo}`}
                          </p>
                        </div>
                        {a.nextDate && (
                          <span className="text-xs font-semibold text-purple-500 shrink-0">
                            {t('majorNext')}: {a.nextDate.label}
                          </span>
                        )}
                        <button
                          onClick={() => setDeleteConfirm({ type: 'anniversaries', id: a.id, name: a.name })}
                          className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {/* Upcoming dates */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {a.generatedDates
                          .filter((d) => getDDay(d.date) >= 0)
                          .slice(0, 5)
                          .map((d) => {
                            const dday = getDDay(d.date)
                            return (
                              <div key={d.date} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                                <span className={`font-medium ${
                                  dday === 0 ? 'text-purple-500' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {lang === 'ko' ? d.label : d.labelEn}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">{d.date.slice(5)}</span>
                                <span className="flex-1" />
                                <span className={`font-semibold ${
                                  dday === 0 ? 'text-purple-500' : dday <= 7 ? 'text-purple-400' : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                  {formatDDay(dday, lang)}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === Event (행사) Tab === */}
            {activeTab === 'event' && (
              <div className="space-y-2">
                {eventsWithDates.length === 0 && !showAddForm ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                    <PartyPopper size={28} className="text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('majorNoEvents')}</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-1 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      <Plus size={14} />
                      {t('majorAddEvent')}
                    </button>
                  </div>
                ) : (
                  eventsWithDates.map((e) => (
                    <div key={e.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="px-3 py-2 bg-orange-50/50 dark:bg-orange-900/10 flex items-center gap-2">
                        <PartyPopper size={12} className="shrink-0 text-orange-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{e.name}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {e.startDate} {t('majorStartDate')} · D+{e.totalDays}
                            {e.memo && ` · ${e.memo}`}
                          </p>
                        </div>
                        {e.nextDate && (
                          <span className="text-xs font-semibold text-orange-500 shrink-0">
                            {t('majorNext')}: {e.nextDate.label}
                          </span>
                        )}
                        <button
                          onClick={() => setDeleteConfirm({ type: 'events', id: e.id, name: e.name })}
                          className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {e.generatedDates
                          .filter((d) => getDDay(d.date) >= 0)
                          .slice(0, 5)
                          .map((d) => {
                            const dday = getDDay(d.date)
                            return (
                              <div key={d.date} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                                <span className={`font-medium ${
                                  dday === 0 ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {lang === 'ko' ? d.label : d.labelEn}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">{d.date.slice(5)}</span>
                                <span className="flex-1" />
                                <span className={`font-semibold ${
                                  dday === 0 ? 'text-orange-500' : dday <= 7 ? 'text-orange-400' : 'text-gray-400 dark:text-gray-500'
                                }`}>
                                  {formatDDay(dday, lang)}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === Vacation Tab === */}
            {activeTab === 'vacation' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-1 pb-1">
                  <Palmtree size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentYear}{t('majorVacationTitle')}
                  </span>
                </div>
                {vacationResults.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('majorNoVacation')}</p>
                ) : (
                  vacationResults.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setExpandedVacation(expandedVacation === i ? null : i)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                        expandedVacation === i
                          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 shrink-0 w-5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-100 truncate">
                            {t('majorVacDays', { n: v.vacationDays })} → {t('majorTotalDays', { n: v.totalDays })}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {v.startDate.slice(5)} ~ {v.endDate.slice(5)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-green-500 shrink-0">
                          x{v.efficiency.toFixed(1)}
                        </span>
                        {expandedVacation === i ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />}
                      </div>
                      {expandedVacation === i && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                          <p>{t('majorVacUse')}: {v.vacationDates.map((d) => d.slice(5)).join(', ')}</p>
                          <p>{t('majorVacPeriod')}: {v.startDate.slice(5)} ~ {v.endDate.slice(5)} ({v.totalDays}{t('majorDayUnit')})</p>
                          <p>{t('majorVacEfficiency')}: {t('majorVacDays', { n: v.vacationDays })} → {t('majorTotalDays', { n: v.totalDays })} ({t('majorVacRatio', { n: v.efficiency.toFixed(1) })})</p>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={16} />
                <span className="font-semibold text-sm">{t('majorDeleteTitle')}</span>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "{deleteConfirm.name}" {t('majorDeleteConfirm')}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 pb-4">
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                <Trash2 size={14} />
                {t('delete')}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
