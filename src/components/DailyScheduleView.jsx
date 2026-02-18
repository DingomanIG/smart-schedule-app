import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Clock, Trash2, Pencil,
  CheckCircle2, Circle, User, ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getEvents, deleteEvent, toggleEventCompleted, updateEvent } from '../services/schedule'
import { getHelperProfile } from '../services/helperProfile'
import { useLanguage } from '../hooks/useLanguage'
import { Timestamp } from 'firebase/firestore'

const CATEGORY_STYLES = {
  routine:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  meal:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  commute:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  leisure:  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  personal: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  health:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  general:  'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
}

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

export default function DailyScheduleView({ userId, onEventCreated }) {
  const { lang, t } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [helperProfile, setHelperProfile] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  // Bulk edit state: which group (title key) is being edited, and which field
  const [editingGroup, setEditingGroup] = useState(null) // title key
  const [editField, setEditField] = useState(null) // 'title' | 'time'
  const [editValue, setEditValue] = useState('') // string for title
  const [editStart, setEditStart] = useState('') // HH:MM for time
  const [editEnd, setEditEnd] = useState('') // HH:MM for time
  const editRef = useRef(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const farPast = new Date(2020, 0, 1)
      const farFuture = new Date(2030, 11, 31)
      const allEvents = await getEvents(userId, farPast, farFuture)
      const helperEvents = allEvents
        .filter((evt) => evt.createdVia === 'helper')
        .sort((a, b) => {
          const aTime = a.startTime?.toDate?.()?.getTime() || 0
          const bTime = b.startTime?.toDate?.()?.getTime() || 0
          return aTime - bTime
        })
      setEvents(helperEvents)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  useEffect(() => {
    getHelperProfile(userId, 'H01').then(setHelperProfile).catch(() => setHelperProfile(null))
  }, [userId])

  useEffect(() => {
    if (editingGroup && editRef.current) editRef.current.focus()
  }, [editingGroup, editField])

  // Toggle single event
  const handleToggle = async (eventId, currentCompleted) => {
    try {
      await toggleEventCompleted(eventId, currentCompleted)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, completed: !currentCompleted } : e)))
      onEventCreated?.()
    } catch { /* ignore */ }
  }

  // Toggle ALL events in a group
  const handleToggleAll = async (groupEvents) => {
    const allActive = groupEvents.every((e) => !e.completed)
    try {
      await Promise.all(groupEvents.map((e) => toggleEventCompleted(e.id, !allActive)))
      const ids = new Set(groupEvents.map((e) => e.id))
      setEvents((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, completed: allActive } : e)))
      onEventCreated?.()
    } catch { /* ignore */ }
  }

  // Delete single event
  const handleDelete = async (eventId) => {
    if (deletingId === eventId) {
      try {
        await deleteEvent(eventId)
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        setDeletingId(null)
        onEventCreated?.()
      } catch { /* ignore */ }
    } else {
      setDeletingId(eventId)
    }
  }

  // Start bulk edit
  const startBulkEdit = (titleKey, field, groupEvents) => {
    setEditingGroup(titleKey)
    setEditField(field)
    setDeletingId(null)
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

  // Save bulk edit - applies to ALL events in the group
  const saveBulkEdit = async (groupEvents) => {
    if (!editingGroup || !editField) return
    try {
      if (editField === 'title' && editValue.trim()) {
        const newTitle = editValue.trim()
        await Promise.all(groupEvents.map((e) => updateEvent(e.id, { title: newTitle })))
        const ids = new Set(groupEvents.map((e) => e.id))
        setEvents((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, title: newTitle } : e)))
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
            // 종료가 시작보다 이전이면 다음날로
            if (newEnd <= newStart) newEnd.setDate(newEnd.getDate() + 1)
            upd.endTime = Timestamp.fromDate(newEnd)
          } else if (e.endTime?.toDate) {
            // 종료시간 입력 없으면 기존 duration 유지
            const duration = e.endTime.toDate().getTime() - oldStart.getTime()
            upd.endTime = Timestamp.fromDate(new Date(newStart.getTime() + duration))
          }
          await updateEvent(e.id, upd)
          return { id: e.id, ...upd }
        }))
        const updateMap = Object.fromEntries(updates.map((u) => [u.id, u]))
        setEvents((prev) => prev.map((e) => (updateMap[e.id] ? { ...e, ...updateMap[e.id] } : e)))
        onEventCreated?.()
      }
    } catch { /* ignore */ }
    cancelEdit()
  }

  const handleEditKeyDown = (e, groupEvents) => {
    if (e.key === 'Enter') saveBulkEdit(groupEvents)
    if (e.key === 'Escape') cancelEdit()
  }

  const completedCount = events.filter((e) => e.completed).length
  const dateLocale = lang === 'ko' ? 'ko-KR' : 'en-US'
  const prefs = helperProfile?.preferences

  // Group events by title
  const grouped = {}
  events.forEach((evt) => {
    const key = evt.title
    if (!grouped[key]) grouped[key] = { events: [], category: evt.category }
    grouped[key].events.push(evt)
  })

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Summary Bar */}
      {!loading && events.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <span className="flex items-center gap-1">
            <ClipboardList size={12} />
            {events.length}{t('eventsCount')}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            {completedCount}/{events.length} {t('completedCount')}
          </span>
        </div>
      )}

      {/* Event List - grouped by title */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <ClipboardList size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noHelperEvents')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('noHelperEventsHint')}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([titleKey, group]) => {
            const catStyle = CATEGORY_STYLES[group.category] || CATEGORY_STYLES.general
            const isEditing = editingGroup === titleKey
            const allCompleted = group.events.every((e) => e.completed)
            const someCompleted = group.events.some((e) => e.completed)

            return (
              <div key={titleKey} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Group Header */}
                <div className={`px-3 py-2 ${allCompleted ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  {/* Row 1: toggle + category + title + count */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAll(group.events)}
                      className="shrink-0"
                      title={allCompleted ? t('markIncomplete') : t('markComplete')}
                    >
                      {allCompleted ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : someCompleted ? (
                        <CheckCircle2 size={16} className="text-green-300 dark:text-green-700" />
                      ) : (
                        <Circle size={16} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${catStyle}`}>
                      {group.category}
                    </span>

                    {isEditing && editField === 'title' ? (
                      <input
                        ref={editRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                        onBlur={() => saveBulkEdit(group.events)}
                        className="flex-1 text-sm font-medium px-1 py-0 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100 outline-none min-w-0"
                      />
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'title', group.events)}
                        className={`flex-1 min-w-0 text-left text-sm font-medium group flex items-center gap-1 ${allCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}
                        title={t('editTitle')}
                      >
                        <span className="truncate">{titleKey}</span>
                        <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-40" />
                      </button>
                    )}

                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                      {group.events.length}{t('eventsCount')}
                    </span>
                  </div>

                  {/* Row 2: bulk time edit */}
                  {isEditing && editField === 'time' ? (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-6 flex-wrap">
                      <input
                        ref={editRef}
                        type="time"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                        className="text-xs font-mono px-1.5 py-1 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 outline-none"
                      />
                      <span className="text-gray-400 text-xs">~</span>
                      <input
                        type="time"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                        className="text-xs font-mono px-1.5 py-1 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 outline-none"
                      />
                      <button
                        onClick={() => saveBulkEdit(group.events)}
                        className="text-[10px] px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {t('confirm')}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-[10px] px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center mt-1 ml-6">
                      <button
                        onClick={() => startBulkEdit(titleKey, 'time', group.events)}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1"
                        title={t('bulkEditTime')}
                      >
                        <Clock size={10} />
                        {t('bulkEditTime')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Individual event rows */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {group.events.map((evt) => {
                    const isDeleting = deletingId === evt.id
                    const dateStr = shortDate(evt.startTime, dateLocale)
                    const timeStr = formatTime(evt.startTime)
                    const endStr = formatTime(evt.endTime)

                    return (
                      <div
                        key={evt.id}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
                          evt.completed ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Per-event toggle */}
                        <button
                          onClick={() => handleToggle(evt.id, evt.completed)}
                          className="shrink-0"
                        >
                          {evt.completed ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                          ) : (
                            <Circle size={14} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </button>

                        {/* Date */}
                        <span className="text-gray-400 dark:text-gray-500 w-[72px] shrink-0">
                          {dateStr}
                        </span>

                        {/* Time */}
                        <span className="text-gray-500 dark:text-gray-400 font-mono shrink-0">
                          {timeStr}{endStr ? `~${endStr}` : ''}
                        </span>

                        <span className="flex-1" />

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className={`shrink-0 p-0.5 rounded transition-colors ${
                            isDeleting
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                              : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
                          }`}
                          title={isDeleting ? t('deleteConfirmHint') : t('delete')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
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
          <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
            {prefs ? (
              <>
                <p>{t('profileWakeUp')}: {prefs.wakeUp} | {t('profileBedTime')}: {prefs.bedTime}</p>
                <p>{t('profileMeals')}: {prefs.meals?.breakfast || '-'}, {prefs.meals?.lunch || '-'}, {prefs.meals?.dinner || '-'}</p>
                <p>{t('profileCommute')}: {prefs.commute?.hasCommute ? `${prefs.commute.startTime}~${prefs.commute.endTime}` : '-'}</p>
                {prefs.routines?.length > 0 && <p>{t('profileRoutines')}: {prefs.routines.join(', ')}</p>}
              </>
            ) : (
              <p className="text-gray-400 dark:text-gray-500">{t('noProfile')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
