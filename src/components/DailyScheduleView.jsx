import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Trash2, Pencil, AlertTriangle,
  User, ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getEvents, deleteEvent, updateEvent } from '../services/schedule'
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

const CATEGORY_TABS = [
  { key: 'all',      label: 'all' },
  { key: 'routine',  label: 'routine' },
  { key: 'meal',     label: 'meal' },
  { key: 'commute',  label: 'commute' },
  { key: 'leisure',  label: 'leisure' },
  { key: 'personal', label: 'personal' },
  { key: 'health',   label: 'health' },
]

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
  const [showProfile, setShowProfile] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all') // { type: 'single'|'group', eventId?, titleKey?, groupEvents?, count }

  const [editingGroup, setEditingGroup] = useState(null)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
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
        setEvents((prev) => prev.filter((e) => e.id !== deleteConfirm.eventId))
      } else {
        await Promise.all(deleteConfirm.groupEvents.map((e) => deleteEvent(e.id)))
        const ids = new Set(deleteConfirm.groupEvents.map((e) => e.id))
        setEvents((prev) => prev.filter((e) => !ids.has(e.id)))
      }
      onEventCreated?.()
    } catch { /* ignore */ }
    setDeleteConfirm(null)
  }

  // Toggle disabled (hide from calendar) for all events in a group
  const handleToggleGroup = async (groupEvents) => {
    const allDisabled = groupEvents.every((e) => e.disabled)
    const newDisabled = !allDisabled
    try {
      await Promise.all(groupEvents.map((e) => updateEvent(e.id, { disabled: newDisabled })))
      const ids = new Set(groupEvents.map((e) => e.id))
      setEvents((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, disabled: newDisabled } : e)))
      onEventCreated?.()
    } catch { /* ignore */ }
  }

  const startBulkEdit = (titleKey, field, groupEvents) => {
    setEditingGroup(titleKey)
    setEditField(field)
    if (field === 'title') {
      setEditValue(groupEvents[0].title)
    } else if (field === 'time') {
      // Use the most common time as default
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
            if (newEnd <= newStart) newEnd.setDate(newEnd.getDate() + 1)
            upd.endTime = Timestamp.fromDate(newEnd)
          } else if (e.endTime?.toDate) {
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

  const dateLocale = lang === 'ko' ? 'ko-KR' : 'en-US'
  const prefs = helperProfile?.preferences

  // Group events by title
  const grouped = {}
  events.forEach((evt) => {
    const key = evt.title
    if (!grouped[key]) grouped[key] = { events: [], category: evt.category }
    grouped[key].events.push(evt)
  })

  // Filter groups by category
  const filteredGroups = categoryFilter === 'all'
    ? Object.entries(grouped)
    : Object.entries(grouped).filter(([, g]) => g.category === categoryFilter)

  // Count per category for badge
  const categoryCounts = {}
  Object.values(grouped).forEach((g) => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + g.events.length
  })

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Category Filter Tabs */}
      {!loading && events.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
          {CATEGORY_TABS
            .filter(({ key }) => key === 'all' || categoryCounts[key])
            .map(({ key, label }) => {
              const style = key !== 'all' && CATEGORY_STYLES[key] ? CATEGORY_STYLES[key] : ''
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === key
                      ? 'bg-blue-500 text-white'
                      : style || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } hover:opacity-80`}
                >
                  {label}
                  {key !== 'all' && categoryCounts[key] && (
                    <span className={`text-[10px] ${
                      categoryFilter === key ? 'text-blue-200' : 'opacity-60'
                    }`}>
                      {categoryCounts[key]}
                    </span>
                  )}
                </button>
              )
            })}
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
          filteredGroups.map(([titleKey, group]) => {
            const catStyle = CATEGORY_STYLES[group.category] || CATEGORY_STYLES.general
            const isEditing = editingGroup === titleKey

            // Find the most common time (majority time)
            const timeCounts = {}
            group.events.forEach((e) => {
              const key = `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}`
              timeCounts[key] = (timeCounts[key] || 0) + 1
            })
            const mainTimeKey = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0][0]


            // Events that differ from the main time
            const outliers = group.events.filter((e) => {
              const key = `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}`
              return key !== mainTimeKey
            })

            const mainStartFmt = formatTime(group.events.find((e) => `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}` === mainTimeKey).startTime)
            const mainEndFmt = formatTime(group.events.find((e) => `${toHHMM(e.startTime)}~${toHHMM(e.endTime)}` === mainTimeKey).endTime)

            const isGroupDisabled = group.events.every((e) => e.disabled)

            return (
              <div key={titleKey} className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isGroupDisabled ? 'opacity-50' : ''}`}>
                {/* Header: title + time + active/inactive + count + delete */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${catStyle}`}>
                      {group.category}
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
                        className="flex-1 text-sm font-medium px-1 py-0 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100 outline-none min-w-0"
                      />
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'title', group.events)}
                        className="min-w-0 text-left text-sm font-medium group flex items-center gap-1 text-gray-800 dark:text-gray-100"
                        title={t('editTitle')}
                      >
                        <span className="truncate">{titleKey}</span>
                        <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-40" />
                      </button>
                    )}

                    {/* Time display - click to bulk edit */}
                    {isEditing && editField === 'time' ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          ref={editRef}
                          type="time"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                          className="text-xs font-mono px-1 py-0.5 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 outline-none"
                        />
                        <span className="text-gray-400 text-xs">~</span>
                        <input
                          type="time"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, group.events)}
                          className="text-xs font-mono px-1 py-0.5 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 outline-none"
                        />
                        <button
                          onClick={() => saveBulkEdit(group.events)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600"
                        >
                          {t('confirm')}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'time', group.events)}
                        className="text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        title={t('bulkEditTime')}
                      >
                        {mainStartFmt}{mainEndFmt ? `~${mainEndFmt}` : ''}
                      </button>
                    )}

                    {/* Active/Inactive toggle switch */}
                    {(() => {
                      const isActive = !group.events.every((e) => e.disabled)
                      return (
                        <button
                          onClick={() => handleToggleGroup(group.events)}
                          className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-500 dark:bg-blue-600'
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

                    <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                      {group.events.length}{t('eventsCount')}
                    </span>

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

                {/* Only show outlier events (different time from main) */}
                {outliers.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {outliers.map((evt) => {
                      const dateStr = shortDate(evt.startTime, dateLocale)
                      const timeStr = formatTime(evt.startTime)
                      const endStr = formatTime(evt.endTime)

                      return (
                        <div
                          key={evt.id}
                          className="flex items-center gap-2 px-3 py-1 text-xs bg-amber-50/50 dark:bg-amber-900/10"
                        >
                          <span className="text-amber-500 dark:text-amber-400 text-[10px] shrink-0">*</span>
                          <span className="text-gray-400 dark:text-gray-500 shrink-0">
                            {dateStr}
                          </span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={16} />
                <span className="font-semibold text-sm">
                  {deleteConfirm.type === 'group' ? (t('deleteGroupTitle') || '전체 삭제') : (t('deleteTitle') || '일정 삭제')}
                </span>
              </div>
            </div>

            {/* Body */}
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

            {/* Actions */}
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
