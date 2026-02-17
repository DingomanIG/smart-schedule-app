import { useState } from 'react'
import { LogIn, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function AuthForm({ onLogin, onRegister }) {
  const { dark, toggle } = useDarkMode()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await onLogin(email, password)
      } else {
        await onRegister(email, password)
      }
    } catch (err) {
      const messages = {
        'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'auth/email-already-in-use': '이미 등록된 이메일입니다.',
        'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
      }
      setError(messages[err.code] || '오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-end mb-2">
          <button
            onClick={toggle}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
            title={dark ? '라이트 모드' : '다크 모드'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">스마트 스케줄</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI로 일정을 쉽게 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              minLength={6}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  )
}
