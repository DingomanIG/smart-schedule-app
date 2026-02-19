import { useState, useEffect, useRef } from 'react'
import {
  Plus, X, Trash2, AlertTriangle, Pencil,
  User, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getEvents, deleteEvent, addBatchEvents, updateEvent } from '../services/schedule'
import { getHelperProfile, saveHelperProfile } from '../services/helperProfile'
import { WORK_CATEGORY_STYLES } from '../data/workDefaults'
import { useLanguage } from '../hooks/useLanguage'
import { Timestamp } from 'firebase/firestore'


const CATEGORY_TABS = [
  { key: 'all', labelKey: 'all' },
  { key: 'deepwork', labelKey: 'workCategoryDeepwork' },
  { key: 'meeting', labelKey: 'workCategoryMeeting' },
  { key: 'planning', labelKey: 'workCategoryPlanning' },
  { key: 'admin', labelKey: 'workCategoryAdmin' },
  { key: 'break', labelKey: 'workCategoryBreak' },
]

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 06:00 ~ 20:00 (프로필 설정용)
const HOURS12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function toTimeStr(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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

export default function WorkScheduleView({ userId, onEventCreated }) {
  const { t } = useLanguage()

  // 프로필 상태
  const [profile, setProfile] = useState({
    workType: 'office',
    workStart: '09:00',
    workEnd: '18:00',
    focusPeak: 'morning',
    worksWeekends: false,
  })

  // 이벤트 상태
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [activeCategory, setActiveCategory] = useState('all')

  // 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addStart, setAddStart] = useState('09:00')
  const [addEnd, setAddEnd] = useState('10:00')
  const [addCategory, setAddCategory] = useState('deepwork')

  // 이름/시간 수정
  const [editingEventId, setEditingEventId] = useState(null)
  const [editField, setEditField] = useState(null) // 'title' | 'time'
  const [editTitle, setEditTitle] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const editRef = useRef(null)

  // 프로필 패널
  const [showProfile, setShowProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(null)

  // 삭제 확인
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // 프로필 로드
  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const saved = await getHelperProfile(userId, 'H04')
      if (saved) {
        setProfile(prev => ({ ...prev, ...saved }))
      }
    })()
  }, [userId])

  // 이벤트 로드
  useEffect(() => {
    if (!userId || !selectedDate) return
    ;(async () => {
      setLoading(true)
      try {
        const dayStart = new Date(selectedDate + 'T00:00:00')
        const dayEnd = new Date(selectedDate + 'T23:59:59')
        const allEvents = await getEvents(userId, dayStart, dayEnd)
        const WORK_CATS = ['deepwork', 'meeting', 'admin', 'planning', 'communication', 'break', 'deadline']
        const workEvents = allEvents.filter(e =>
          e.helperId === 'H04' || (e.createdVia === 'helper' && WORK_CATS.includes(e.category))
        )
        setEvents(workEvents)
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    })()
  }, [userId, selectedDate])

  // 프로필 저장
  const handleSaveProfile = async (newProfile) => {
    const updated = { ...profile, ...newProfile }
    setProfile(updated)
    await saveHelperProfile(userId, 'H04', updated)
  }

  // 이벤트 추가
  const handleAddEvent = async () => {
    if (!addTitle.trim()) return
    const [sh, sm] = addStart.split(':').map(Number)
    const [eh, em] = addEnd.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    const duration = endMin > startMin ? endMin - startMin : 60

    const eventData = [{
      title: addTitle,
      time: addStart,
      duration,
      category: addCategory,
    }]

    await addBatchEvents(userId, eventData, selectedDate, 'H04')
    setShowAddForm(false)
    setAddTitle('')
    setAddStart('09:00')
    setAddEnd('10:00')
    setAddCategory('deepwork')
    onEventCreated?.()
    // 이벤트 새로고침
    const dayStart = new Date(selectedDate + 'T00:00:00')
    const dayEnd = new Date(selectedDate + 'T23:59:59')
    const allEvents = await getEvents(userId, dayStart, dayEnd)
    const WORK_CATS = ['deepwork', 'meeting', 'admin', 'planning', 'communication', 'break', 'deadline']
    setEvents(allEvents.filter(e =>
      e.helperId === 'H04' || (e.createdVia === 'helper' && WORK_CATS.includes(e.category))
    ))
  }

  // 이름 수정 시작
  const startEditTitle = (event) => {
    setEditingEventId(event.id)
    setEditField('title')
    setEditTitle(event.title)
  }

  // 시간 수정 시작
  const startEditTime = (event) => {
    const st = event.startTime?.toDate?.()
    const et = event.endTime?.toDate?.()
    setEditingEventId(event.id)
    setEditField('time')
    setEditStart(st ? `${String(st.getHours()).padStart(2,'0')}:${String(st.getMinutes()).padStart(2,'0')}` : '09:00')
    setEditEnd(et ? `${String(et.getHours()).padStart(2,'0')}:${String(et.getMinutes()).padStart(2,'0')}` : '10:00')
  }

  const cancelEdit = () => {
    setEditingEventId(null)
    setEditField(null)
    setEditTitle('')
    setEditStart('')
    setEditEnd('')
  }

  const saveEditTitle = async (event) => {
    if (!editTitle.trim()) return
    try {
      await updateEvent(event.id, { title: editTitle.trim() })
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, title: editTitle.trim() } : e))
      onEventCreated?.()
    } catch { /* ignore */ }
    cancelEdit()
  }

  const saveEditTime = async (event) => {
    if (!editStart) return
    try {
      const [sh, sm] = editStart.split(':').map(Number)
      const [eh, em] = editEnd ? editEnd.split(':').map(Number) : [sh + 1, sm]
      const oldStart = event.startTime.toDate()
      const newStart = new Date(oldStart)
      newStart.setHours(sh, sm, 0, 0)
      const upd = { startTime: Timestamp.fromDate(newStart) }
      const newEnd = new Date(oldStart)
      newEnd.setHours(eh, em, 0, 0)
      if (newEnd <= newStart) newEnd.setDate(newEnd.getDate() + 1)
      upd.endTime = Timestamp.fromDate(newEnd)
      await updateEvent(event.id, upd)
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...upd } : e))
      onEventCreated?.()
    } catch { /* ignore */ }
    cancelEdit()
  }

  // 프로필 수정
  const startEditProfile = () => {
    setProfileDraft({ ...profile })
    setEditingProfile(true)
  }
  const cancelEditProfile = () => {
    setEditingProfile(false)
    setProfileDraft(null)
  }
  const saveProfileDraft = async () => {
    if (!profileDraft) return
    try {
      setProfile(profileDraft)
      await saveHelperProfile(userId, 'H04', profileDraft)
    } catch { /* ignore */ }
    setEditingProfile(false)
    setProfileDraft(null)
  }

  // 이벤트 토글 (활성/비활성)
  const handleToggle = async (eventId, currentDisabled) => {
    const newDisabled = !currentDisabled
    try {
      await updateEvent(eventId, { disabled: newDisabled })
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, disabled: newDisabled } : e))
      onEventCreated?.()
    } catch { /* ignore */ }
  }

  // 이벤트 삭제
  const handleDelete = async (eventId) => {
    await deleteEvent(eventId)
    setDeleteConfirm(null)
    setEvents(prev => prev.filter(e => e.id !== eventId))
    onEventCreated?.()
  }

  // 필터링
  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter(e => e.category === activeCategory)

  // 정렬 (시간순)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aTime = a.startTime?.toDate?.() || new Date(0)
    const bTime = b.startTime?.toDate?.() || new Date(0)
    return aTime - bTime
  })

  // 카테고리별 건수
  const categoryCounts = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 카테고리 필터 + 추가 버튼 */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 shrink-0 overflow-x-auto">
        {CATEGORY_TABS.filter(tab => tab.key === 'all' || categoryCounts[tab.key]).map(tab => {
          const count = tab.key === 'all' ? events.length : (categoryCounts[tab.key] || 0)
          const catStyle = tab.key !== 'all' && WORK_CATEGORY_STYLES[tab.key]
            ? WORK_CATEGORY_STYLES[tab.key].badge
            : ''
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === tab.key
                  ? 'bg-indigo-500 text-white'
                  : catStyle || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              } hover:opacity-80`}
            >
              {tab.key}
              {tab.key !== 'all' && count > 0 && (
                <span className={`text-[10px] ${
                  activeCategory === tab.key ? 'text-indigo-200' : 'opacity-60'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${
            showAddForm
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-500'
          }`}
        >
          {showAddForm ? <X size={12} /> : <Plus size={12} />}
        </button>
      </div>

      {/* 이벤트 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {/* 추가 폼 */}
        {showAddForm && (
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{t('workAddEvent')}</span>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={14} />
              </button>
            </div>
            <input
              type="text"
              placeholder={t('workEventTitlePlaceholder')}
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-indigo-400"
              autoFocus
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
                    <option value="AM">{t('am') || '오전'}</option><option value="PM">{t('pm') || '오후'}</option>
                  </select>
                  <select value={sp.hour} onChange={(e) => setTime(setAddStart, addStart, 'hour', e.target.value)} className={sel}>
                    {HOURS12.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">:</span>
                  <select value={sp.minute} onChange={(e) => setTime(setAddStart, addStart, 'minute', e.target.value)} className={sel}>
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">~</span>
                  <select value={ep.period} onChange={(e) => setTime(setAddEnd, addEnd, 'period', e.target.value)} className={sel}>
                    <option value="AM">{t('am') || '오전'}</option><option value="PM">{t('pm') || '오후'}</option>
                  </select>
                  <select value={ep.hour} onChange={(e) => setTime(setAddEnd, addEnd, 'hour', e.target.value)} className={sel}>
                    {HOURS12.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">:</span>
                  <select value={ep.minute} onChange={(e) => setTime(setAddEnd, addEnd, 'minute', e.target.value)} className={sel}>
                    {MINUTES.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select value={addCategory} onChange={(e) => setAddCategory(e.target.value)} className={sel}>
                    {Object.keys(WORK_CATEGORY_STYLES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <span className="flex-1" />
                  <button onClick={handleAddEvent} disabled={!addTitle.trim()} className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    {t('workAddConfirm')}
                  </button>
                </div>
              </>)
            })()}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t('loading')}</p>
        ) : sortedEvents.length === 0 && !showAddForm ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('workNoEvents')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('workNoEventsHint')}</p>
          </div>
        ) : (
          sortedEvents.map(event => {
            const style = WORK_CATEGORY_STYLES[event.category] || WORK_CATEGORY_STYLES.admin
            const startTime = event.startTime?.toDate?.()
            const endTime = event.endTime?.toDate?.()
            const startFmt = startTime ? startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''
            const endFmt = endTime ? endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''

            const isDisabled = !!event.disabled
            const isEditingTime = editingEventId === event.id && editField === 'time'

            return (
              <div
                key={event.id}
                className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isDisabled ? 'opacity-50' : ''}`}
              >
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] w-14 text-center px-1.5 py-0.5 rounded-full font-medium shrink-0 ${style.badge}`}>
                      {event.category}
                    </span>
                    {/* Title - click to edit */}
                    {editingEventId === event.id && editField === 'title' ? (
                      <input
                        ref={editRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditTitle(event)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        onBlur={() => saveEditTitle(event)}
                        className="flex-1 min-w-0 text-sm font-medium px-1 py-0 rounded border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-gray-800 dark:text-gray-100 outline-none"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditTitle(event)}
                        className="flex-1 min-w-0 text-left text-sm font-semibold group flex items-center gap-1 text-gray-800 dark:text-gray-100 truncate"
                        title={t('editTitle') || '이름 수정'}
                      >
                        <span className="truncate">{event.title}</span>
                        <Pencil size={10} className="shrink-0 opacity-0 group-hover:opacity-40" />
                      </button>
                    )}

                    {/* Time - click to edit */}
                    {isEditingTime ? (
                      (() => {
                        const sel = "text-[11px] px-0.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-800 dark:[&>option]:text-gray-100"
                        const HOURS24 = Array.from({ length: 24 }, (_, i) => i)
                        const [esH, esM] = (editStart || '09:00').split(':').map(Number)
                        const [eeH, eeM] = (editEnd || '10:00').split(':').map(Number)
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
                            <button onClick={() => saveEditTime(event)} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 ml-1">
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
                        onClick={() => startEditTime(event)}
                        className="w-[130px] text-left text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                        title={t('bulkEditTime') || '시간 수정'}
                      >
                        {startFmt}{endFmt ? `~${endFmt}` : ''}
                      </button>
                    )}

                    <button
                      onClick={() => handleToggle(event.id, isDisabled)}
                      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${
                        !isDisabled
                          ? 'bg-indigo-500 dark:bg-indigo-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      title={!isDisabled ? (t('deactivateHint') || '비활성화') : (t('activateHint') || '활성화')}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        !isDisabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(event.id)}
                      className="shrink-0 p-0.5 rounded transition-colors text-gray-300 dark:text-gray-600 hover:text-red-400"
                      title={t('delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 프로필 패널 */}
      <div className="border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="flex items-center gap-1">
            <User size={12} />
            {t('profileStatus') || '프로필 정보'}
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
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0">근무형태</span>
                      <select value={profileDraft.workType} onChange={(e) => upd('workType', e.target.value)} className={sel}>
                        <option value="office">사무실</option>
                        <option value="remote">재택</option>
                        <option value="hybrid">하이브리드</option>
                        <option value="freelance">프리랜서</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0">출근</span>
                      <input type="time" value={profileDraft.workStart} onChange={(e) => upd('workStart', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0">퇴근</span>
                      <input type="time" value={profileDraft.workEnd} onChange={(e) => upd('workEnd', e.target.value)} className={inp} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0">{t('workWeekendLabel')}</span>
                      <select value={profileDraft.worksWeekends ? 'yes' : 'no'} onChange={(e) => upd('worksWeekends', e.target.value === 'yes')} className={sel}>
                        <option value="yes">{t('workWeekendYes')}</option>
                        <option value="no">{t('workWeekendNo')}</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0">집중</span>
                      <select value={profileDraft.focusPeak} onChange={(e) => upd('focusPeak', e.target.value)} className={sel}>
                        <option value="morning">오전</option>
                        <option value="afternoon">오후</option>
                        <option value="none">없음</option>
                      </select>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={saveProfileDraft} className="px-2.5 py-1 text-[11px] rounded bg-indigo-500 text-white hover:bg-indigo-600">저장</button>
                      <button onClick={cancelEditProfile} className="px-2.5 py-1 text-[11px] rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">취소</button>
                    </div>
                  </div>
                )
              })()
            ) : (
              <>
                <p>근무: {profile.workType === 'office' ? '사무실' : profile.workType === 'remote' ? '재택' : profile.workType === 'hybrid' ? '하이브리드' : '프리랜서'} | {profile.workStart}~{profile.workEnd}</p>
                <p>{t('workWeekendLabel')}: {profile.worksWeekends ? t('workWeekendYes') : t('workWeekendNo')} | 집중: {profile.focusPeak === 'morning' ? '오전' : profile.focusPeak === 'afternoon' ? '오후' : '없음'}</p>
                <button onClick={startEditProfile} className="mt-1 flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400 hover:underline">
                  <Pencil size={10} /> 프로필 수정
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 w-full max-w-xs shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{t('workDeleteConfirm')}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-1.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
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
