import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Clock, MapPin, Check, X, Loader2 } from 'lucide-react'
import { parseSchedule } from '../services/openai'
import { createEvent } from '../services/schedule'

const initialMessage = {
  role: 'assistant',
  content: '안녕하세요! 일정을 말씀해주세요. 예: "내일 오후 2시 회의"',
}

export default function ChatInterface({ userId, onEventCreated }) {
  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const parsed = await parseSchedule(input)

      if (parsed) {
        const aiMsg = {
          role: 'assistant',
          content: `일정을 확인해주세요:`,
          parsed,
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '일정을 인식하지 못했습니다. 다시 말씀해주세요.' },
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (msgIndex) => {
    const msg = messages[msgIndex]
    if (!msg.parsed) return

    try {
      await createEvent(userId, msg.parsed)
      setMessages((prev) =>
        prev.map((m, i) =>
          i === msgIndex ? { ...m, confirmed: true } : m
        )
      )
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '일정이 저장되었습니다!' },
      ])
      onEventCreated?.()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '저장 중 오류가 발생했습니다.' },
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
      { role: 'assistant', content: '취소되었습니다. 다시 말씀해주세요.' },
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
              className={`max-w-[75%] px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-[14px_2px_14px_14px]'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-[2px_14px_14px_14px]'
              }`}
            >
              {msg.content}

              {/* 파싱된 일정 카드 */}
              {msg.parsed && !msg.confirmed && !msg.cancelled && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-3 space-y-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white">{msg.parsed.title}</p>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Calendar size={12} />
                    <span>{msg.parsed.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs">
                    <Clock size={12} />
                    <span>{msg.parsed.time} ({msg.parsed.duration}분)</span>
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
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700"
                    >
                      <Check size={12} /> 저장
                    </button>
                    <button
                      onClick={() => handleCancel(i)}
                      className="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <X size={12} /> 취소
                    </button>
                  </div>
                </div>
              )}

              {msg.confirmed && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">저장 완료</p>
              )}
              {msg.cancelled && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">취소됨</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2.5 rounded-[2px_14px_14px_14px] text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> 분석 중...
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
            placeholder="일정을 입력하세요..."
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
