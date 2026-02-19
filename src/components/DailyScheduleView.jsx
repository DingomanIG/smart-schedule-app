import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Trash2, Pencil, AlertTriangle, Plus, X,
  User, ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getEvents, deleteEvent, updateEvent, addBatchEvents } from '../services/schedule'
import { getHelperProfile, saveHelperProfile } from '../services/helperProfile'
import { CARE_TYPE_STYLES } from '../data/petCareDefaults'
import { useLanguage } from '../hooks/useLanguage'
import { Timestamp } from 'firebase/firestore'

const PET_CARE_TYPES = [
  { key: 'feeding',  icon: '🍽️', label: 'feeding',  ko: '식사/급식' },
  { key: 'water',    icon: '💧', label: 'water',    ko: '급수' },
  { key: 'walk',     icon: '🚶', label: 'walk',     ko: '산책' },
  { key: 'toilet',   icon: '🧹', label: 'toilet',   ko: '화장실/배변' },
  { key: 'play',     icon: '🎾', label: 'play',     ko: '놀이' },
  { key: 'grooming', icon: '✨', label: 'grooming', ko: '그루밍' },
  { key: 'health',   icon: '🩺', label: 'health',   ko: '건강관리' },
  { key: 'medicine', icon: '💊', label: 'medicine', ko: '투약' },
]

const CATEGORY_STYLES = {
  routine:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  meal:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  commute:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  leisure:  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  personal: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  health:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  general:  'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
  '펫 케어': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
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

// 24시간 ↔ 12시간 변환 (드롭다운용)
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

// 타이틀에서 이모지 제거 (펫 케어 카드 표시용)
function stripEmojis(str) {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()
}

// 타이틀 이모지로 careType 추출
const ICON_TO_CARE = { '🍽': 'feeding', '💧': 'water', '🚶': 'walk', '🧹': 'toilet', '🎾': 'play', '✨': 'grooming', '🩺': 'health', '💊': 'medicine', '🪥': 'health', '✂': 'grooming' }
function detectCareType(title) {
  for (const [icon, type] of Object.entries(ICON_TO_CARE)) {
    if (title.includes(icon)) return type
  }
  return 'health'
}

// careType별 뱃지 스타일
const CARE_BADGE_STYLES = {
  feeding:  'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300',
  water:    'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300',
  walk:     'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  toilet:   'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  play:     'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  grooming: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  health:   'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  medicine: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
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

export default function DailyScheduleView({ userId, onEventCreated, petCareMode = false }) {
  const { lang, t } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [helperProfile, setHelperProfile] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all') // { type: 'single'|'group', eventId?, titleKey?, groupEvents?, count }

  const [editingGroup, setEditingGroup] = useState(null)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const editRef = useRef(null)

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('09:30')
  const [addCategory, setAddCategory] = useState('routine')
  const [addDays, setAddDays] = useState(7)
  const addTitleRef = useRef(null)
  // Pet care add form state
  const [addPetName, setAddPetName] = useState('')
  const [addCareName, setAddCareName] = useState('')
  const [addCareType, setAddCareType] = useState('feeding')
  const addPetNameRef = useRef(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const farPast = new Date(2020, 0, 1)
      const farFuture = new Date(2030, 11, 31)
      const allEvents = await getEvents(userId, farPast, farFuture)
      const helperEvents = allEvents
        .filter((evt) => {
          if (evt.createdVia !== 'helper') return false
          const isPet = evt.category === '펫 케어'
          return petCareMode ? isPet : !isPet
        })
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
    getHelperProfile(userId, petCareMode ? 'H11' : 'H01').then(setHelperProfile).catch(() => setHelperProfile(null))
  }, [userId])

  useEffect(() => {
    if (editingGroup && editRef.current) editRef.current.focus()
  }, [editingGroup, editField])

  const startEditProfile = () => {
    if (petCareMode && helperProfile) {
      // 다중 펫 호환: pets 배열이 없으면 레거시 단일 펫에서 변환
      const pets = helperProfile.pets || [{ petType: helperProfile.petType || 'dog', petName: helperProfile.petName || '', petAge: helperProfile.petAge || '', petSize: helperProfile.petSize || '', petIndoor: helperProfile.petIndoor ?? true }]
      setProfileDraft({ pets, wakeUp: helperProfile.wakeUp || '07:00', simultaneous: helperProfile.simultaneous ?? true })
    } else if (!petCareMode && helperProfile?.preferences) {
      const p = helperProfile.preferences
      setProfileDraft({ wakeUp: p.wakeUp || '07:00', bedTime: p.bedTime || '23:00', breakfast: p.meals?.breakfast || '', lunch: p.meals?.lunch || '', dinner: p.meals?.dinner || '', commuteStart: p.commute?.startTime || '', commuteEnd: p.commute?.endTime || '', hasCommute: p.commute?.hasCommute ?? false, routines: p.routines?.join(', ') || '' })
    }
    setEditingProfile(true)
  }

  const saveProfile = async () => {
    if (!profileDraft) return
    try {
      if (petCareMode) {
        await saveHelperProfile(userId, 'H11', profileDraft)
        setHelperProfile(profileDraft)
      } else {
        const prefs = {
          wakeUp: profileDraft.wakeUp, bedTime: profileDraft.bedTime,
          meals: { breakfast: profileDraft.breakfast, lunch: profileDraft.lunch, dinner: profileDraft.dinner },
          commute: { hasCommute: profileDraft.hasCommute, startTime: profileDraft.commuteStart, endTime: profileDraft.commuteEnd },
          routines: profileDraft.routines ? profileDraft.routines.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean) : [],
        }
        await saveHelperProfile(userId, 'H01', prefs)
        setHelperProfile({ preferences: prefs })
      }
    } catch { /* ignore */ }
    setEditingProfile(false)
    setProfileDraft(null)
  }

  const cancelEditProfile = () => { setEditingProfile(false); setProfileDraft(null) }

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

  // Add new schedule
  const handleAdd = async () => {
    if (petCareMode) {
      if (!addPetName.trim() || !addCareName.trim() || !addStart) return
      const title = `${addPetName.trim()} ${addCareName.trim()}`
      const [sh, sm] = addStart.split(':').map(Number)
      const [eh, em] = addEnd ? addEnd.split(':').map(Number) : [sh, sm + 15]
      const duration = (eh * 60 + em) - (sh * 60 + sm)
      for (let i = 0; i < addDays; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        await addBatchEvents(userId, [{ title, time: addStart, duration: duration > 0 ? duration : 15, category: '펫 케어', careType: addCareType }], dateStr)
      }
      setShowAddForm(false)
      setAddPetName('')
      setAddCareName('')
      setAddCareType('feeding')
      setAddStart('09:00')
      setAddEnd('09:15')
      setAddDays(7)
      fetchEvents()
      onEventCreated?.()
      return
    }
    if (!addTitle.trim() || !addStart) return
    const [sh, sm] = addStart.split(':').map(Number)
    const [eh, em] = addEnd ? addEnd.split(':').map(Number) : [sh, sm + 30]
    const duration = (eh * 60 + em) - (sh * 60 + sm)
    for (let i = 0; i < addDays; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      await addBatchEvents(userId, [{ title: addTitle.trim(), time: addStart, duration: duration > 0 ? duration : 30, category: addCategory }], dateStr)
    }
    setShowAddForm(false)
    setAddTitle('')
    setAddStart('09:00')
    setAddEnd('09:30')
    setAddCategory('routine')
    setAddDays(7)
    fetchEvents()
    onEventCreated?.()
  }

  useEffect(() => {
    if (showAddForm) {
      if (petCareMode && addPetNameRef.current) addPetNameRef.current.focus()
      else if (addTitleRef.current) addTitleRef.current.focus()
    }
  }, [showAddForm])

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
    if (!grouped[key]) grouped[key] = { events: [], category: evt.category, careType: petCareMode ? (evt.careType || detectCareType(evt.title)) : null }
    grouped[key].events.push(evt)
  })

  // Filter groups by category (or careType in petCareMode)
  const filteredGroups = categoryFilter === 'all'
    ? Object.entries(grouped)
    : petCareMode
      ? Object.entries(grouped).filter(([, g]) => g.careType === categoryFilter)
      : Object.entries(grouped).filter(([, g]) => g.category === categoryFilter)

  // Count per category/careType for badge
  const categoryCounts = {}
  Object.values(grouped).forEach((g) => {
    const countKey = petCareMode ? g.careType : g.category
    categoryCounts[countKey] = (categoryCounts[countKey] || 0) + g.events.length
  })

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Category Filter Tabs */}
      {!loading && events.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
          {(petCareMode
            ? [{ key: 'all', label: 'all' }, ...PET_CARE_TYPES.filter((ct) => categoryCounts[ct.key])]
            : CATEGORY_TABS.filter(({ key }) => key === 'all' || categoryCounts[key])
          ).map(({ key, label }) => {
              const style = petCareMode
                ? (CARE_BADGE_STYLES[key] || '')
                : (key !== 'all' && CATEGORY_STYLES[key] ? CATEGORY_STYLES[key] : '')
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === key
                      ? (petCareMode ? 'bg-teal-500 text-white' : 'bg-blue-500 text-white')
                      : style || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } hover:opacity-80`}
                >
                  {label}
                  {key !== 'all' && categoryCounts[key] && (
                    <span className={`text-[10px] ${
                      categoryFilter === key ? (petCareMode ? 'text-teal-200' : 'text-blue-200') : 'opacity-60'
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
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-500'
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
        {showAddForm && petCareMode && (
          <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400">펫 케어 추가</span>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
            <input
              ref={addPetNameRef}
              type="text"
              placeholder="반려동물 이름 (예: 초코, 나비)"
              value={addPetName}
              onChange={(e) => setAddPetName(e.target.value)}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-teal-400"
            />
            <input
              type="text"
              placeholder="펫 케어 이름 (예: 산책, 밥주기)"
              value={addCareName}
              onChange={(e) => setAddCareName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-teal-400"
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
                  <select value={addCareType} onChange={(e) => setAddCareType(e.target.value)} className={sel}>
                    {PET_CARE_TYPES.map((ct) => (
                      <option key={ct.key} value={ct.key}>{ct.label}</option>
                    ))}
                  </select>
                  <select value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className={sel}>
                    {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="text-xs text-gray-500 dark:text-gray-400">일</span>
                  <span className="flex-1" />
                  <button onClick={handleAdd} disabled={!addPetName.trim() || !addCareName.trim()} className="px-3 py-1 text-xs font-medium rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    추가
                  </button>
                </div>
              </>)
            })()}
          </div>
        )}
        {showAddForm && !petCareMode && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">일상 추가</span>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
            <input
              ref={addTitleRef}
              type="text"
              placeholder="일상 이름"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-400"
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
                    {CATEGORY_TABS.filter((c) => c.key !== 'all').map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                  <select value={addDays} onChange={(e) => setAddDays(Number(e.target.value))} className={sel}>
                    {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="text-xs text-gray-500 dark:text-gray-400">일간</span>
                  <span className="flex-1" />
                  <button onClick={handleAdd} disabled={!addTitle.trim()} className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
            <ClipboardList size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noHelperEvents')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('noHelperEventsHint')}</p>
            <button onClick={() => setShowAddForm(true)} className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <Plus size={14} />
              일정 추가
            </button>
          </div>
        ) : (
          filteredGroups.map(([titleKey, group]) => {
            const catStyle = petCareMode
              ? (CARE_BADGE_STYLES[group.careType] || CARE_BADGE_STYLES.health)
              : (CATEGORY_STYLES[group.category] || CATEGORY_STYLES.general)
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
                    <span className={`text-[10px] w-14 text-center px-1.5 py-0.5 rounded-full font-medium shrink-0 ${catStyle}`}>
                      {petCareMode ? (group.careType || 'pet care') : group.category}
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
                        className="flex-1 min-w-0 text-sm font-medium px-1 py-0 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startBulkEdit(titleKey, 'title', group.events)}
                        className="flex-1 min-w-0 text-left text-sm font-semibold group flex items-center gap-1 text-gray-800 dark:text-gray-100 truncate"
                        title={t('editTitle')}
                      >
                        <span className="truncate">{petCareMode ? stripEmojis(titleKey) : titleKey}</span>
                        <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-40" />
                      </button>
                    )}

                    {/* Time display - click to bulk edit */}
                    {isEditing && editField === 'time' ? (
                      (() => {
                        const sel = "text-[11px] px-0.5 py-0.5 rounded border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100"
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
                            <button onClick={() => saveBulkEdit(group.events)} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 ml-1">
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
                        className="w-[130px] text-left text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
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
          <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {editingProfile && profileDraft ? (
              (() => {
                const inp = "w-full text-xs px-1.5 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none"
                const sel = "text-xs px-1.5 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none cursor-pointer"
                const upd = (key, val) => setProfileDraft(prev => ({ ...prev, [key]: val }))
                const updPet = (idx, key, val) => setProfileDraft(prev => {
                  const pets = [...(prev.pets || [])]
                  pets[idx] = { ...pets[idx], [key]: val }
                  return { ...prev, pets }
                })
                const removePet = (idx) => setProfileDraft(prev => ({ ...prev, pets: prev.pets.filter((_, i) => i !== idx) }))
                const addPet = () => setProfileDraft(prev => ({ ...prev, pets: [...(prev.pets || []), { petType: 'dog', petName: '', petAge: '', petSize: 'medium', petIndoor: true }] }))
                return petCareMode ? (
                  <div className="space-y-2">
                    {(profileDraft.pets || []).map((pet, idx) => (
                      <div key={idx} className="p-2 rounded border border-teal-200 dark:border-teal-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">반려동물 {idx + 1}</span>
                          {(profileDraft.pets || []).length > 1 && (
                            <button onClick={() => removePet(idx)} className="text-[10px] text-red-400 hover:text-red-500">삭제</button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 shrink-0">이름</span>
                          <input value={pet.petName} onChange={(e) => updPet(idx, 'petName', e.target.value)} className={inp} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 shrink-0">종류</span>
                          <select value={pet.petType} onChange={(e) => updPet(idx, 'petType', e.target.value)} className={sel}>
                            <option value="dog">🐶 강아지</option><option value="cat">🐱 고양이</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-10 shrink-0">나이</span>
                          <input value={pet.petAge} onChange={(e) => updPet(idx, 'petAge', e.target.value)} placeholder="예: 24개월" className={inp} />
                        </div>
                        {pet.petType === 'dog' && (
                          <div className="flex items-center gap-2">
                            <span className="w-10 shrink-0">크기</span>
                            <select value={pet.petSize} onChange={(e) => updPet(idx, 'petSize', e.target.value)} className={sel}>
                              <option value="small">소형</option><option value="medium">중형</option><option value="large">대형</option>
                            </select>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="w-10 shrink-0">실내</span>
                          <select value={pet.petIndoor ? 'true' : 'false'} onChange={(e) => updPet(idx, 'petIndoor', e.target.value === 'true')} className={sel}>
                            <option value="true">실내</option><option value="false">실외</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button onClick={addPet} className="text-[11px] text-teal-500 hover:underline">+ 반려동물 추가</button>
                    <div className="flex items-center gap-2">
                      <span className="w-10 shrink-0">기상</span>
                      <input type="time" value={profileDraft.wakeUp || '07:00'} onChange={(e) => upd('wakeUp', e.target.value)} className={inp} />
                    </div>
                    {(profileDraft.pets || []).length >= 2 && (
                      <div className="flex items-center gap-2">
                        <span className="w-10 shrink-0">동시</span>
                        <select value={profileDraft.simultaneous ? 'true' : 'false'} onChange={(e) => upd('simultaneous', e.target.value === 'true')} className={sel}>
                          <option value="true">함께 케어</option><option value="false">따로 케어</option>
                        </select>
                      </div>
                    )}
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={saveProfile} className="px-2.5 py-1 text-[11px] rounded bg-teal-500 text-white hover:bg-teal-600">저장</button>
                      <button onClick={cancelEditProfile} className="px-2.5 py-1 text-[11px] rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">기상</span>
                      <input type="time" value={profileDraft.wakeUp} onChange={(e) => upd('wakeUp', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">취침</span>
                      <input type="time" value={profileDraft.bedTime} onChange={(e) => upd('bedTime', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">아침</span>
                      <input type="time" value={profileDraft.breakfast} onChange={(e) => upd('breakfast', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">점심</span>
                      <input type="time" value={profileDraft.lunch} onChange={(e) => upd('lunch', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">저녁</span>
                      <input type="time" value={profileDraft.dinner} onChange={(e) => upd('dinner', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">출근</span>
                      <input type="time" value={profileDraft.commuteStart} onChange={(e) => upd('commuteStart', e.target.value)} className={inp} />
                      <span>~</span>
                      <input type="time" value={profileDraft.commuteEnd} onChange={(e) => upd('commuteEnd', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0">루틴</span>
                      <input value={profileDraft.routines} onChange={(e) => upd('routines', e.target.value)} placeholder="운동, 독서, 명상" className={inp} />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={saveProfile} className="px-2.5 py-1 text-[11px] rounded bg-blue-500 text-white hover:bg-blue-600">저장</button>
                      <button onClick={cancelEditProfile} className="px-2.5 py-1 text-[11px] rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">취소</button>
                    </div>
                  </div>
                )
              })()
            ) : (
              <>
                {petCareMode ? (
                  helperProfile ? (
                    (() => {
                      const pets = helperProfile.pets || [{ petType: helperProfile.petType, petName: helperProfile.petName, petAge: helperProfile.petAge, petSize: helperProfile.petSize }]
                      return <>
                        {pets.map((p, i) => (
                          <p key={i}>{p.petType === 'dog' ? '🐶' : '🐱'} {p.petName} {p.petAge ? `(${p.petAge}개월)` : ''} {p.petType === 'dog' && p.petSize ? `· ${p.petSize === 'small' ? '소형' : p.petSize === 'large' ? '대형' : '중형'}` : ''}</p>
                        ))}
                        {pets.length >= 2 && <p>동시 케어: {helperProfile.simultaneous !== false ? '함께' : '따로'}</p>}
                      </>
                    })()
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500">{t('noProfile')}</p>
                  )
                ) : prefs ? (
                  <>
                    <p>{t('profileWakeUp')}: {prefs.wakeUp} | {t('profileBedTime')}: {prefs.bedTime}</p>
                    <p>{t('profileMeals')}: {prefs.meals?.breakfast || '-'}, {prefs.meals?.lunch || '-'}, {prefs.meals?.dinner || '-'}</p>
                    <p>{t('profileCommute')}: {prefs.commute?.hasCommute ? `${prefs.commute.startTime}~${prefs.commute.endTime}` : '-'}</p>
                    {prefs.routines?.length > 0 && <p>{t('profileRoutines')}: {prefs.routines.join(', ')}</p>}
                  </>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500">{t('noProfile')}</p>
                )}
                {(helperProfile || prefs) && (
                  <button onClick={startEditProfile} className="mt-1 flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400 hover:underline">
                    <Pencil size={10} /> 프로필 수정
                  </button>
                )}
              </>
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
