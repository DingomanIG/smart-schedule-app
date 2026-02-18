import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Clock, MapPin, Check, X, Loader2, ArrowRight, Trash2 } from 'lucide-react'
import { parseSchedule } from '../services/openai'
import { createEvent, getEvents, moveEvent, updateEvent, deleteEvent } from '../services/schedule'
import { useLanguage } from '../hooks/useLanguage'

export default function ChatInterface({ userId, onEventCreated }) {
  const { t } = useLanguage()

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('chatGreeting'),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastEventContext, setLastEventContext] = useState(null)
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

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const recentEvents = await fetchRecentEvents()
      const parsed = await parseSchedule(input, recentEvents, lastEventContext)

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
          id: null, // will be set if needed
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
              {msg.content}

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

              {msg.confirmed && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">{t('savedComplete')}</p>
              )}
              {msg.cancelled && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('cancelled')}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2.5 rounded-[2px_14px_14px_14px] text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> {t('analyzing')}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
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
