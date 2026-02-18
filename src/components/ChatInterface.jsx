import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Clock, MapPin, Check, X, Loader2, ArrowRight, Trash2 } from 'lucide-react'
import { parseSchedule, generateDailySchedule } from '../services/openai'
import { createEvent, getEvents, moveEvent, updateEvent, deleteEvent, deleteAllEvents, addBatchEvents } from '../services/schedule'
import { saveHelperProfile, getHelperProfile } from '../services/helperProfile'
import {
  parseTimeInput, parseMealsInput, parseCommuteInput,
  parseRoutinesInput, isDailyHelperTrigger, isHelperCancel
} from '../utils/helperParser'
import BatchConfirmCard from './BatchConfirmCard'
import HelperSelector from './HelperSelector'
import { useLanguage } from '../hooks/useLanguage'

const ONBOARDING_STEPS = [
  { key: 'wakeUp',   askKey: 'helperAskWakeUp',   parser: parseTimeInput },
  { key: 'bedTime',  askKey: 'helperAskBedTime',   parser: parseTimeInput },
  { key: 'meals',    askKey: 'helperAskMeals',     parser: parseMealsInput },
  { key: 'commute',  askKey: 'helperAskCommute',   parser: parseCommuteInput },
  { key: 'routines', askKey: 'helperAskRoutines',  parser: parseRoutinesInput },
]

export default function ChatInterface({ userId, onEventCreated }) {
  const { t } = useLanguage()

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('chatGreeting'),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastEventContext, setLastEventContext] = useState(null)
  const [helperState, setHelperState] = useState(null)
  const [pendingProfile, setPendingProfile] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchRecentEvents = async () => {
    try {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 7)
      const end = new Date(now)
      end.setDate(end.getDate() + 14)
      return await getEvents(userId, start, end)
    } catch {
      return []
    }
  }

  // === Helper: 온보딩 시작 ===
  const startHelperOnboarding = (type) => {
    setHelperState({ type, step: 0, answers: {} })
    const firstStep = ONBOARDING_STEPS[0]
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `${t('helperStart')}\n\n${t(firstStep.askKey)}\n${t('helperCancelHint')}` },
    ])
  }

  // === Helper: 시작 (프로필 확인 → 온보딩 or 일수 선택) ===
  const handleStartHelper = async (type) => {
    if (type !== 'daily') return

    setLoading(true)
    try {
      const existingProfile = await getHelperProfile(userId, 'H01')
      if (existingProfile) {
        setPendingProfile(existingProfile)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('helperAskDays'), action: 'select_days' },
        ])
      } else {
        startHelperOnboarding(type)
      }
    } catch {
      startHelperOnboarding(type)
    } finally {
      setLoading(false)
    }
  }

  // === Helper: 일수 선택 → 생성 ===
  const handleSelectDays = async (days) => {
    if (!pendingProfile) return
    const profile = pendingProfile
    setPendingProfile(null)
    setMessages((prev) => [
      ...prev.map((m) => m.action === 'select_days' ? { ...m, answered: true } : m),
      { role: 'user', content: `${days}${t('helperDayUnit')}` },
      { role: 'assistant', content: t('helperGenerating') },
    ])
    setLoading(true)
    await generateAndShowBatch(profile, days)
  }

  const parseDaysInput = (text) => {
    const s = text.trim()
    const weekMatch = s.match(/(\d+)\s*주/)
    if (weekMatch) return Math.min(parseInt(weekMatch[1]) * 7, 14)
    const dayMatch = s.match(/(\d+)/)
    if (dayMatch) {
      const n = parseInt(dayMatch[1])
      if (n >= 1 && n <= 14) return n
    }
    return null
  }

  // === Helper: 온보딩 답변 처리 ===
  const processHelperAnswer = async (text) => {
    // 취소 체크
    if (isHelperCancel(text)) {
      setHelperState(null)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperCancelled') },
      ])
      setLoading(false)
      return
    }

    const { step, answers } = helperState
    const currentStep = ONBOARDING_STEPS[step]
    const parsed = currentStep.parser(text)

    if (parsed === null) {
      // 파싱 실패 → 재질문
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${t('helperParseRetry')}\n\n${t(currentStep.askKey)}` },
      ])
      setLoading(false)
      return
    }

    const newAnswers = { ...answers, [currentStep.key]: parsed }
    const nextStep = step + 1

    if (nextStep < ONBOARDING_STEPS.length) {
      // 다음 질문
      setHelperState({ ...helperState, step: nextStep, answers: newAnswers })
      const nextStepInfo = ONBOARDING_STEPS[nextStep]
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${t(nextStepInfo.askKey)}\n${t('helperCancelHint')}` },
      ])
      setLoading(false)
    } else {
      // 온보딩 완료 → 프로필 저장 + 일수 선택
      setHelperState(null)

      try {
        await saveHelperProfile(userId, 'H01', newAnswers)
      } catch {
        // 프로필 저장 실패는 무시 (데모 모드)
      }

      setPendingProfile(newAnswers)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperAskDays'), action: 'select_days' },
      ])
      setLoading(false)
    }
  }

  // === Helper: GPT 스케줄 생성 + 배치 카드 표시 (멀티데이) ===
  const generateAndShowBatch = async (preferences, days = 1) => {
    try {
      const result = await generateDailySchedule(preferences)
      const batchDays = []
      const today = new Date()
      for (let i = 0; i < days; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        batchDays.push({ date: dateStr, events: result.events.map((e) => ({ ...e })) })
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t('helperScheduleGenerated'),
          action: 'create_batch',
          batchDays,
          confirmed: false,
          cancelled: false,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperGenerateError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  // === Helper: 배치 전체 등록 (멀티데이) ===
  const handleBatchConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.batchDays || msg.confirmed) return

    try {
      for (const day of msg.batchDays) {
        if (day.events.length > 0) {
          await addBatchEvents(userId, day.events, day.date)
        }
      }
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('helperBatchSaved') },
      ])
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    }
  }

  // === Helper: 배치 개별 항목 제거 (멀티데이) ===
  const handleBatchRemoveItem = (msgIndex, dayIdx, eventIdx) => {
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.batchDays) return m
        const newDays = m.batchDays.map((day, di) => {
          if (di !== dayIdx) return day
          return { ...day, events: day.events.filter((_, ei) => ei !== eventIdx) }
        }).filter((day) => day.events.length > 0)
        return { ...m, batchDays: newDays }
      })
    )
  }

  // === 기존: handleSend (도우미 인터셉트 추가) ===
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const currentInput = input
    const userMsg = { role: 'user', content: currentInput }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // 1. 온보딩 진행 중이면 인터셉트
      if (helperState !== null) {
        await processHelperAnswer(currentInput)
        return
      }

      // 1.5. 일수 선택 대기 중이면 인터셉트
      if (pendingProfile) {
        const days = parseDaysInput(currentInput)
        if (days) {
          const profile = pendingProfile
          setPendingProfile(null)
          setMessages((prev) => prev.map((m) =>
            m.action === 'select_days' ? { ...m, answered: true } : m
          ))
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('helperGenerating') },
          ])
          await generateAndShowBatch(profile, days)
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('helperAskDaysRetry') },
          ])
          setLoading(false)
        }
        return
      }

      // 2. 전체 삭제 감지 (테스트용)
      if (/(?:전부|전체|모두|모든|다)\s*삭제|(?:일정|스케줄).*(?:전부|전체|모두|다)\s*(?:삭제|지워|없애)/.test(currentInput)) {
        const recentEvents = await fetchRecentEvents()
        const allEvents = await (async () => {
          try {
            const now = new Date()
            const start = new Date(2020, 0, 1)
            const end = new Date(now.getFullYear() + 1, 11, 31)
            return await getEvents(userId, start, end)
          } catch { return recentEvents }
        })()
        if (allEvents.length === 0) {
          setMessages((prev) => [...prev, { role: 'assistant', content: t('chatNoEvents') }])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `${allEvents.length}${t('chatDeleteAllCount')}\n${t('chatConfirmDeleteAll')}`,
              action: 'delete_all',
              eventCount: allEvents.length,
              confirmed: false,
              cancelled: false,
            },
          ])
        }
        setLoading(false)
        return
      }

      // 3. 도우미 트리거 감지
      if (isDailyHelperTrigger(currentInput)) {
        await handleStartHelper('daily')
        return
      }

      // 3. 기존 parseSchedule 로직 (변경 없음)
      const recentEvents = await fetchRecentEvents()
      const parsed = await parseSchedule(currentInput, recentEvents, lastEventContext)

      if (!parsed) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatParseFail') },
        ])
        return
      }

      const { action, targetEventId } = parsed

      if (action === 'create') {
        const aiMsg = {
          role: 'assistant',
          content: t('chatConfirmSchedule'),
          parsed,
          action: 'create',
        }
        setMessages((prev) => [...prev, aiMsg])
        return
      }

      // move / update / delete — targetEvent 필요
      let targetEvent = null
      if (targetEventId) {
        targetEvent = recentEvents.find((e) => e.id === targetEventId)
      }

      if (!targetEvent) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatWhichEvent') },
        ])
        return
      }

      const st = targetEvent.startTime?.toDate ? targetEvent.startTime.toDate() : new Date(targetEvent.startTime)
      const targetInfo = {
        id: targetEvent.id,
        title: targetEvent.title,
        date: `${st.getFullYear()}-${String(st.getMonth() + 1).padStart(2, '0')}-${String(st.getDate()).padStart(2, '0')}`,
        time: `${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`,
      }

      if (action === 'move') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmMove'),
            action: 'move',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      } else if (action === 'delete') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmDelete'),
            action: 'delete',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      } else if (action === 'update') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: t('chatConfirmUpdate'),
            action: 'update',
            parsed,
            targetEvent,
            targetInfo,
          },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatError') },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (msg.confirmed) return

    try {
      const count = await deleteAllEvents(userId)
      setMessages((prev) =>
        prev.map((m, i) => i === msgIndex ? { ...m, confirmed: true } : m)
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatDeletedAll') },
      ])
      setLastEventContext(null)
      onEventCreated?.()
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    }
  }

  const handleConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.parsed) return

    const markConfirmed = () => {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
    }

    try {
      const action = msg.action || 'create'

      if (action === 'create') {
        await createEvent(userId, msg.parsed)
        markConfirmed()
        setLastEventContext({
          id: null,
          title: msg.parsed.title,
          date: msg.parsed.date,
          time: msg.parsed.time,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatSaved') },
        ])
      } else if (action === 'move') {
        const newHour = msg.parsed.time
          ? parseInt(msg.parsed.time.split(':')[0]) + parseInt(msg.parsed.time.split(':')[1]) / 60
          : null
        await moveEvent(msg.targetEvent.id, msg.targetEvent, msg.parsed.date, newHour)
        markConfirmed()
        setLastEventContext({
          id: msg.targetEvent.id,
          title: msg.targetEvent.title,
          date: msg.parsed.date,
          time: msg.parsed.time || msg.targetInfo.time,
        })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatMoved') },
        ])
      } else if (action === 'delete') {
        await deleteEvent(msg.targetEvent.id)
        markConfirmed()
        setLastEventContext(null)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatDeleted') },
        ])
      } else if (action === 'update') {
        const updates = msg.parsed.updates || {}
        await updateEvent(msg.targetEvent.id, updates)
        markConfirmed()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: t('chatUpdated') },
        ])
      }

      onEventCreated?.()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chatProcessError') },
      ])
    }
  }

  const handleCancel = (msgIndex) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === msgIndex ? { ...m, cancelled: true } : m
      )
    )
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: t('chatCancelled') },
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA] dark:bg-gray-900">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 text-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-[14px_2px_14px_14px]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-[2px_14px_14px_14px]'
                }`}
            >
              <span className="whitespace-pre-line">{msg.content}</span>

              {/* 파싱된 일정 카드 — create */}
              {msg.parsed && !msg.confirmed && !msg.cancelled && (!msg.action || msg.action === 'create') && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{msg.parsed.title}</p>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{msg.parsed.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Clock size={12} />
                    <span>{msg.parsed.time} ({msg.parsed.duration}{t('minuteUnit')})</span>
                  </div>
                  {msg.parsed.location && (
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                      <MapPin size={12} />
                      <span>{msg.parsed.location}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 min-w-[64px]"
                    >
                      <Check size={12} /> {t('save')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 전체 삭제 카드 — delete_all */}
              {msg.action === 'delete_all' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Trash2 size={14} /> {t('deleteAll')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteAllConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 min-w-[64px]"
                    >
                      <Trash2 size={12} /> {t('delete')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일수 선택 버튼 — select_days */}
              {msg.action === 'select_days' && !msg.answered && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSelectDays(d)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                      {d}{t('helperDayUnit')}
                    </button>
                  ))}
                </div>
              )}

              {/* 배치 카드 — create_batch (멀티데이) */}
              {msg.action === 'create_batch' && (
                <BatchConfirmCard
                  batchDays={msg.batchDays || []}
                  onConfirmAll={() => handleBatchConfirm(i)}
                  onRemoveItem={(dayIdx, eventIdx) => handleBatchRemoveItem(i, dayIdx, eventIdx)}
                  onCancel={() => handleCancel(i)}
                  confirmed={msg.confirmed}
                  cancelled={msg.cancelled}
                />
              )}

              {/* 일정 이동 카드 — move */}
              {msg.action === 'move' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <ArrowRight size={14} className="text-orange-500" /> {t('moveSchedule')}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <span>{msg.targetInfo.date} {msg.targetInfo.time}</span>
                    <ArrowRight size={10} />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {msg.parsed.date}{msg.parsed.time ? ` ${msg.parsed.time}` : ` ${t('keepTime')}`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-orange-600 min-w-[64px]"
                    >
                      <Check size={12} /> {t('confirm')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일정 삭제 카드 — delete */}
              {msg.action === 'delete' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    <Trash2 size={14} className="text-red-500" /> {t('deleteSchedule')}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>{msg.targetInfo.date} {msg.targetInfo.time}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-600 min-w-[64px]"
                    >
                      <Trash2 size={12} /> {t('delete')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* 일정 수정 카드 — update */}
              {msg.action === 'update' && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{t('updateSchedule')}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">"{msg.targetInfo.title}"</p>
                  {msg.parsed.updates && Object.entries(msg.parsed.updates).map(([key, val]) => (
                    <div key={key} className="text-xs text-gray-600 dark:text-gray-400">
                      {key}: <span className="text-purple-600 dark:text-purple-400 font-medium">{val}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleConfirm(i)}
                      className="flex items-center justify-center gap-1 bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-purple-600 min-w-[64px]"
                    >
                      <Check size={12} /> {t('edit')}
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 min-w-[64px]"
                    >
                      <X size={12} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {msg.confirmed && msg.action !== 'create_batch' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t('savedComplete')}</p>
              )}
              {msg.cancelled && msg.action !== 'create_batch' && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('cancelled')}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2.5 rounded-[2px_14px_14px_14px] text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              {helperState !== null ? t('helperGenerating') : t('analyzing')}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <HelperSelector onSelectHelper={handleStartHelper} disabled={loading} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatInputPlaceholder')}
            disabled={loading}
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
