import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Trash2, Pencil, AlertTriangle, Plus, X,
  User, Baby, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getEvents, deleteEvent, updateEvent, addBatchEvents } from '../services/schedule'
import { getHelperProfile, saveHelperProfile } from '../services/helperProfile'
import { CHILDCARE_CATEGORY_STYLES, AGE_GROUPS, getChildAgeGroup, calculateAgeMonths } from '../data/childcareDefaults'
import { useLanguage } from '../hooks/useLanguage'
import { Timestamp } from 'firebase/firestore'

const CHILDCARE_CATS = ['feeding', 'sleep', 'play', 'bath', 'diaper', 'outing', 'hospital', 'development']

const CHILDCARE_TABS = [
  { key: 'all', label: 'all' },
  { key: 'feeding', label: 'feeding' },
  { key: 'sleep', label: 'sleep' },
  { key: 'play', label: 'play' },
  { key: 'bath', label: 'bath' },
  { key: 'diaper', label: 'diaper' },
  { key: 'outing', label: 'outing' },
  { key: 'hospital', label: 'hospital' },
  { key: 'development', label: 'development' },
]

const BADGE_STYLES = {
  feeding: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  sleep: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  play: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  bath: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  diaper: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  outing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  hospital: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  development: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

function parse24to12(time) {
  const [h, m] = time.split(':').map(Number)
  return { period: h < 12 ? 'AM' : 'PM', hour: h === 0 ? 12 : h > 12 ? h - 12 : h, minute: m }
}
function compose12to24(period, hour, minute) {
  let h = hour
  if (period === 'AM' && hour === 12) h = 0
  else if (period === 'PM' && hour !== 12) h = hour + 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const HOURS24 = Array.from({ length: 24 }, (_, i) => i)
const DAY_OPTIONS = [1, 7, 30, 60]

const formatTime = (timestamp) => {
  if (!timestamp?.toDate) return ''
  const d = timestamp.toDate()
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const toHHMM = (timestamp) => {
  if (!timestamp?.toDate) return '00:00'
  const d = timestamp.toDate()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const shortDate = (timestamp, locale) => {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString(locale, { month: 'numeric', day: 'numeric', weekday: 'short' })
}

export default function ChildcareScheduleView({ userId, onEventCreated }) {
  const { lang, t } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [editingGroup, setEditingGroup] = useState(null)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const editRef = useRef(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('09:30')
  const [addCategory, setAddCategory] = useState('feeding')
  const [addDays, setAddDays] = useState(7)
  const addTitleRef = useRef(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const farPast = new Date(2020, 0, 1)
      const farFuture = new Date(2030, 11, 31)
      const allEvents = await getEvents(userId, farPast, farFuture)
      const filtered = allEvents
        .filter(e => e.helperId === 'H06' || (e.createdVia === 'helper' && CHILDCARE_CATS.includes(e.category)))
        .sort((a, b) => {
          const aTime = a.startTime?.toDate?.()?.getTime() || 0
          const bTime = b.startTime?.toDate?.()?.getTime() || 0
          return aTime - bTime
        })
      setEvents(filtered)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  useEffect(() => {
    if (userId) getHelperProfile(userId, 'H06').then(setProfile).catch(() => setProfile(null))
  }, [userId])

  useEffect(() => {
    if (editingGroup && editRef.current) editRef.current.focus()
  }, [editingGroup, editField])

  const requestDelete = (eventId) => {
    setDeleteConfirm({ type: 'single', eventId, count: 1 })
  }

  const requestDeleteGroup = (titleKey, groupEvents) => {
    setDeleteConfirm({ type: 'group', titleKey, groupEvents, count: groupEvents.length })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === 'single') {
        await deleteEvent(deleteConfirm.eventId)
        setEvents(prev => prev.filter(e => e.id !== deleteConfirm.eventId))
      } else {
        await Promise.all(deleteConfirm.groupEvents.map(e => deleteEvent(e.id)))
        const ids = new Set(deleteConfirm.groupEvents.map(e => e.id))
        setEvents(prev => prev.filter(e => !ids.has(e.id)))
      }
      onEventCreated?.()
    } catch { /* ignore */ }
    setDeleteConfirm(null)
  }

  const handleToggleGroup = async (groupEvents) => {
    const allDisabled = groupEvents.every(e => e.disabled)
    const newDisabled = !allDisabled
    try {
      await Promise.all(groupEvents.map(e => updateEvent(e.id, { disabled: newDisabled })))
      const ids = new Set(groupEvents.map(e => e.id))
      setEvents(prev => prev.map(e => ids.has(e.id) ? { ...e, disabled: newDisabled } : e))
      onEventCreated?.()
    } catch { /* ignore */ }
  }

  const startBulkEdit = (titleKey, field, groupEvents) => {
    setEditingGroup(titleKey)
    setEditField(field)
    if (field === 'title') {
      setEditValue(groupEvents[0].title)
    } else if (field === 'time') {
      setEditStart(toHHMM(groupEvents[0].startTime))
      setEditEnd(groupEvents[0].endTime ? toHHMM(groupEvents[0].endTime) : '')
    }
  }

  const cancelEdit = () => {
    setEditingGroup(null)
    setEditField(null)
    setEditValue('')
    setEditStart('')
    setEditEnd('')
  }

  const saveBulkEdit = async (groupEvents) => {
    if (!editingGroup || !editField) return
    try {
      if (editField === 'title' && editValue.trim()) {
        const newTitle = editValue.trim()
        await Promise.all(groupEvents.map(e => updateEvent(e.id, { title: newTitle })))
        const ids = new Set(groupEvents.map(e => e.id))
        setEvents(prev => prev.map(e => ids.has(e.id) ? { ...e, title: newTitle } : e))
        onEventCreated?.()
      } else if (editField === 'time' && editStart) {
        const [sh, sm] = editStart.split(':').map(Number)
        const [eh, em] = editEnd ? editEnd.split(':').map(Number) : [null, null]
        const updates = await Promise.all(groupEvents.map(async (e) => {
          const oldStart = e.startTime.toDate()
          const newStart = new Date(oldStart)
          newStart.setHours(sh, sm, 0, 0)
          const upd = { startTime: Timestamp.fromDate(newStart) }
          if (eh !== null) {
            const newEnd = new Date(oldStart)
            newEnd.setHours(eh, em, 0, 0)
            if (newEnd <= newStart) newEnd.setDate(newEnd.getDate() + 1)
            upd.endTime = Timestamp.fromDate(newEnd)
          } else if (e.endTime?.toDate) {
            const duration = e.endTime.toDate().getTime() - oldStart.getTime()
            upd.endTime = Timestamp.fromDate(new Date(newStart.getTime() + duration))
          }
          await updateEvent(e.id, upd)
          return { id: e.id, ...upd }
        }))
        const updateMap = Object.fromEntries(updates.map(u => [u.id, u]))
        setEvents(prev => prev.map(e => updateMap[e.id] ? { ...e, ...updateMap[e.id] } : e))
        onEventCreated?.()
      }
    } catch { /* ignore */ }
    cancelEdit()
  }

  const handleEditKeyDown = (e, groupEvents) => {
    if (e.key === 'Enter') saveBulkEdit(groupEvents)
    if (e.key === 'Escape') cancelEdit()
  }

  const handleAdd = async () => {
    if (!addTitle.trim() || !addStart) return
    const [sh, sm] = addStart.split(':').map(Number)
    const [eh, em] = addEnd ? addEnd.split(':').map(Number) : [sh, sm + 30]
    const duration = (eh * 60 + em) - (sh * 60 + sm)
    for (let i = 0; i < addDays; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      await addBatchEvents(userId, [{ title: addTitle.trim(), time: addStart, duration: duration > 0 ? duration : 30, category: '육아', careType: addCategory }], dateStr, 'H06')
    }
    setShowAddForm(false)
    setAddTitle('')
    setAddStart('09:00')
    setAddEnd('09:30')
    setAddCategory('feeding')
    setAddDays(7)
    fetchEvents()
    onEventCreated?.()
  }

  useEffect(() => {
    if (showAddForm && addTitleRef.current) addTitleRef.current.focus()
  }, [showAddForm])

  const dateLocale = lang === 'ko' ? 'ko-KR' : 'en-US'

  // Group events by title (careType 기반 — category는 항상 "육아")
  const grouped = {}
  events.forEach(evt => {
    const key = evt.title
    if (!grouped[key]) grouped[key] = { events: [], careType: evt.careType || 'feeding' }
    grouped[key].events.push(evt)
  })

  // Filter groups by careType
  const filteredGroups = categoryFilter === 'all'
    ? Object.entries(grouped)
    : Object.entries(grouped).filter(([, g]) => g.careType === categoryFilter)

  // Count per careType for badge
  const categoryCounts = {}
  Object.values(grouped).forEach(g => {
    categoryCounts[g.careType] = (categoryCounts[g.careType] || 0) + g.events.length
  })

  // Profile info
  const ageMonths = profile?.childBirthdate ? calculateAgeMonths(profile.childBirthdate) : null
  const ageGroupKey = ageMonths !== null ? getChildAgeGroup(ageMonths) : null
  const ageGroup = ageGroupKey ? AGE_GROUPS[ageGroupKey] : null

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Category Filter Tabs */}
      {!loading && events.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
          {CHILDCARE_TABS.filter(({ key }) => key === 'all' || categoryCounts[key]).map(({ key, label }) => {
            const style = key !== 'all' && BADGE_STYLES[key] ? BADGE_STYLES[key] : ''
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === key
                    ? 'bg-pink-500 text-white'
                    : style || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                } hover:opacity-80`}
              >
                {label}
                {key !== 'all' && categoryCounts[key] && (
                  <span className={`text-[10px] ${
                    categoryFilter === key ? 'text-pink-200' : 'opacity-60'
                  }`}>
                    {categoryCounts[key]}
                  </span>
                )}
              </button>
            )
          })}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
              showAddForm
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-500'
            }`}
            title="일정 추가"
          >
            {showAddForm ? <X size={12} /> : <Plus size={12} />}
          </button>
        </div>
      )}

      {/* Event List - grouped by title */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {/* Add Form */}
        {showAddForm && (
          <div className="rounded-lg border border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-900/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-pink-600 dark:text-pink-400">육아 일정 추가</span>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
            <input
              ref={addTitleRef}
              type="text"
              placeholder="일정 이름 (예: 회영이 아침 식사)"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-pink-400"
            />
            {(() => {
              const sel = "text-xs px-1 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100"
              const sp = parse24to12(addStart)
              const ep = parse24to12(addEnd)
              const setTime = (setter, cur, field, val) => {
                const p = parse24to12(cur)
                if (field === 'period') setter(compose12to24(val, p.hour, p.minute))
                else if (field === 'hour') setter(compose12to24(p.period, Number(val), p.minute))
                else setter(compose12to24(p.period, p.hour, Number(val)))
              }
              return (<>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <select value={sp.period} onChange={(e) => setTime(setAddStart, addStart, 'period', e.target.value)} className={sel}>
                    <option value="AM">오전</option><option value="PM">오후</option>
                  </select>
                  <select value={sp.hour} onChange={(e) => setTime(setAddStart, addStart, 'hour', e.target.value)} className={sel}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">:</span>
                  <select value={sp.minute} onChange={(e) => setTime(setAddStart, addStart, 'minute', e.target.value)} className={sel}>
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">~</span>
                  <select value={ep.period} onChange={(e) => setTime(setAddEnd, addEnd, 'period', e.target.value)} className={sel}>
                    <option value="AM">오전</option><option value="PM">오후</option>
                  </select>
                  <select value={ep.hour} onChange={(e) => setTime(setAddEnd, addEnd, 'hour', e.target.value)} className={sel}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">:</span>
                  <select value={ep.minute} onChange={(e) => setTime(setAddEnd, addEnd, 'minute', e.target.value)} className={sel}>
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className={sel}>
                    {CHILDCARE_CATS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className={sel}>
                    {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="text-xs text-gray-500 dark:text-gray-400">일간</span>
                  <span className="flex-1" />
                  <button onClick={handleAdd} disabled={!addTitle.trim()} className="px-3 py-1 text-xs font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    추가
                  </button>
                </div>
              </>)
            })()}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
          </div>
        ) : events.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <Baby size={32} className="text-pink-300 dark:text-pink-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('childcareNoEvents')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('childcareNoEventsHint')}</p>
            <button onClick={() => setShowAddForm(true)} className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors">
              <Plus size={14} />
              일정 추가
            </button>
          </div>
        ) : (
          filteredGroups.map(([titleKey, group]) => {
            const catStyle = BADGE_STYLES[group.careType] || BADGE_STYLES.feeding
            const isEditing = editingGroup === titleKey

            // Find the most common time
            const timeCounts = {}
            group.events.forEach(e => {
              const key = `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}`
              timeCounts[key] = (timeCounts[key] || 0) + 1
            })
            const mainTimeKey = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0][0]

            // Events that differ from the main time
            const outliers = group.events.filter(e => {
              const key = `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}`
              return key !== mainTimeKey
            })

            const mainEvt = group.events.find(e => `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}` === mainTimeKey)
            const mainStartFmt = formatTime(mainEvt.startTime)
            const mainEndFmt = formatTime(mainEvt.endTime)

            const isGroupDisabled = group.events.every(e => e.disabled)

            return (
              <div key={titleKey} className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isGroupDisabled ? 'opacity-50' : ''}`}>
                {/* Header */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${catStyle}`}>
                      {group.careType}
                    </span>

                    {/* Title - editable */}
                    {isEditing && editField === 'title' ? (
                      <input
                        ref={editRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                        onBlur={() => saveBulkEdit(group.events)}
                        className="flex-1 min-w-0 text-sm font-medium px-1 py-0 rounded border border-pink-300 dark:border-pink-600 bg-pink-50 dark:bg-pink-900/30 text-gray-800 dark:text-gray-100 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'title', group.events)}
                        className="flex-1 min-w-0 text-left text-sm font-semibold group flex items-center gap-1 text-gray-800 dark:text-gray-100 truncate"
                        title={t('editTitle')}
                      >
                        <span className="truncate">{titleKey}</span>
                        <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-40" />
                      </button>
                    )}

                    {/* Time display - click to bulk edit */}
                    {isEditing && editField === 'time' ? (
                      (() => {
                        const sel = "text-[11px] px-0.5 py-0.5 rounded border border-pink-300 dark:border-pink-600 bg-pink-50 dark:bg-gray-700 text-pink-700 dark:text-pink-300 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100"
                        const [esH, esM] = (editStart || '09:00').split(':').map(Number)
                        const [eeH, eeM] = (editEnd || '09:30').split(':').map(Number)
                        const set24 = (setter, h, m) => setter(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
                        return (
                          <div ref={editRef} className="flex items-center gap-0.5 shrink-0">
                            <select value={esH} onChange={(e) => set24(setEditStart, Number(e.target.value), esM)} className={sel}>
                              {HOURS24.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <span className="text-gray-400 text-[10px]">:</span>
                            <select value={esM} onChange={(e) => set24(setEditStart, esH, Number(e.target.value))} className={sel}>
                              {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                            </select>
                            <span className="text-gray-400 text-[10px] mx-0.5">~</span>
                            <select value={eeH} onChange={(e) => set24(setEditEnd, Number(e.target.value), eeM)} className={sel}>
                              {HOURS24.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <span className="text-gray-400 text-[10px]">:</span>
                            <select value={eeM} onChange={(e) => set24(setEditEnd, eeH, Number(e.target.value))} className={sel}>
                              {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                            </select>
                            <button onClick={() => saveBulkEdit(group.events)} className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500 text-white hover:bg-pink-600 ml-1">
                              {t('confirm')}
                            </button>
                            <button onClick={cancelEdit} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {t('cancel')}
                            </button>
                          </div>
                        )
                      })()
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'time', group.events)}
                        className="w-[130px] text-left text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                        title={t('bulkEditTime')}
                      >
                        {mainStartFmt}{mainEndFmt ? `~${mainEndFmt}` : ''}
                      </button>
                    )}

                    {/* Toggle switch */}
                    {(() => {
                      const isActive = !group.events.every(e => e.disabled)
                      return (
                        <button
                          onClick={() => handleToggleGroup(group.events)}
                          className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          title={isActive ? (t('deactivateHint') || '비활성화') : (t('activateHint') || '활성화')}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      )
                    })()}

                    <span className="w-1 shrink-0" />

                    {/* Group delete */}
                    <button
                      onClick={() => requestDeleteGroup(titleKey, group.events)}
                      className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                      title={t('delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Outlier events */}
                {outliers.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {outliers.map(evt => {
                      const dateStr = shortDate(evt.startTime, dateLocale)
                      const timeStr = formatTime(evt.startTime)
                      const endStr = formatTime(evt.endTime)
                      return (
                        <div
                          key={evt.id}
                          className="flex items-center gap-2 px-3 py-1 text-xs bg-amber-50/50 dark:bg-amber-900/10"
                        >
                          <span className="text-amber-500 dark:text-amber-400 text-[10px] shrink-0">*</span>
                          <span className="text-gray-400 dark:text-gray-500 shrink-0">{dateStr}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-mono shrink-0">
                            {timeStr}{endStr ? `~${endStr}` : ''}
                          </span>
                          <span className="flex-1" />
                          <button
                            onClick={() => requestDelete(evt.id)}
                            className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                            title={t('delete')}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Profile Panel */}
      <div className="border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="flex items-center gap-1">
            <User size={12} />
            {t('profileStatus')}
          </span>
          {showProfile ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
        {showProfile && (
          <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {profile ? (
              <>
                <p>{t('childcareChildName')}: {profile.childName} ({profile.childGender === 'boy' ? t('childcareGenderBoy') : t('childcareGenderGirl')})</p>
                <p>{t('childcareBirthdate')}: {profile.childBirthdate}</p>
                {ageMonths !== null && (
                  <p>{t('childcareAgeMonths')}: {ageMonths}{t('childcareMonthUnit')} ({ageGroup?.label})</p>
                )}
                {ageGroup && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">{ageGroup.feedingNote} / {ageGroup.napNote}</p>
                )}
              </>
            ) : (
              <p>{t('noProfile')}</p>
            )}
          </div>
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
                <span className="font-semibold text-sm">
                  {deleteConfirm.type === 'group' ? (t('deleteGroupTitle') || '전체 삭제') : (t('deleteTitle') || '일정 삭제')}
                </span>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {deleteConfirm.type === 'group'
                  ? `${deleteConfirm.count}개의 일정이 삭제됩니다.`
                  : '이 일정이 삭제됩니다.'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {deleteConfirm.type === 'group'
                  ? `정말 "${deleteConfirm.titleKey}" 일정을 삭제하시겠습니까?`
                  : '정말 삭제하시겠습니까?'}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 pb-4">
              <button
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                <Trash2 size={14} />
                {t('deleteBtn') || '삭제'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
              >
                {t('cancel') || '취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
