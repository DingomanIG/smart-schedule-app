import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target)
    const json = Object.fromEntries(formData.entries())
    json.access_key = accessKey

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        e.target.reset()
      } else {
        setError('전송에 실패했습니다. 다시 시도해주세요.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">문의가 전송되었습니다!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">빠른 시일 내에 답변 드리겠습니다.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          새 문의 작성
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">문의하기</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
          <input
            type="email"
            name="email"
            required
            placeholder="email@example.com"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
          <input
            type="text"
            name="subject"
            required
            placeholder="문의 제목"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">내용</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="문의 내용을 입력해주세요"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={16} />
          {loading ? '전송 중...' : '전송'}
        </button>
      </form>

      {!accessKey && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
          Web3Forms 키가 설정되지 않았습니다. .env에 VITE_WEB3FORMS_KEY를 추가해주세요.
        </p>
      )}
    </div>
  )
}
