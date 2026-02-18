import { useState } from 'react'
import { LogIn, Moon, Sun } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useLanguage } from '../hooks/useLanguage'
import LanguageToggle from './LanguageToggle'

export default function AuthForm({ onLogin, onRegister }) {
  const { dark, toggle } = useDarkMode()
  const { t } = useLanguage()
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
        'auth/invalid-credential': t('authInvalidCredential'),
        'auth/email-already-in-use': t('authEmailInUse'),
        'auth/weak-password': t('authWeakPassword'),
        'auth/invalid-email': t('authInvalidEmail'),
      }
      setError(messages[err.code] || t('authGenericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-end gap-2 mb-2">
          <LanguageToggle />
          <button
            onClick={toggle}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
            title={dark ? t('lightMode') : t('darkMode')}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('appTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
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
            {loading ? t('processing') : isLogin ? t('login') : t('signup')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isLogin ? t('noAccount') : t('hasAccount')}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isLogin ? t('signup') : t('login')}
          </button>
        </p>
      </div>
    </div>
  )
}
