import { useState, useCallback, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BarChart3, LogOut, X, Moon, Sun, BookOpen, MessageSquare, CalendarCheck } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import { useLanguage } from './hooks/useLanguage'
import SEO from './components/SEO'
import LanguageToggle from './components/LanguageToggle'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
import DailyScheduleView from './components/DailyScheduleView'
import CalendarView from './components/CalendarView'
import WeeklyReport from './components/WeeklyReport'

import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import GuidePage from './pages/GuidePage'
import PricingPage from './pages/PricingPage'
import BlogListPage from './pages/BlogListPage'
import IntroductionBlog from './pages/blog/IntroductionBlog'
import FeaturesBlog from './pages/blog/FeaturesBlog'
import UseCasesBlog from './pages/blog/UseCasesBlog'
import AITechnologyBlog from './pages/blog/AITechnologyBlog'
import ProductivityBlog from './pages/blog/ProductivityBlog'
import ComparisonBlog from './pages/blog/ComparisonBlog'
import TipsBlog from './pages/blog/TipsBlog'
import FutureBlog from './pages/blog/FutureBlog'
import TutorialPage from './pages/TutorialPage'
import ReviewsPage from './pages/ReviewsPage'
import AIGuidePage from './pages/AIGuidePage'
import ComparisonPage from './pages/ComparisonPage'

function MainApp() {
  const { user, loading, login, register, loginWithGoogle, logout } = useAuth()
  const { dark, toggle } = useDarkMode()
  const { t } = useLanguage()
  const [showReport, setShowReport] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)
  const [chatMode, setChatMode] = useState('chat')
  const [splitPercent, setSplitPercent] = useState(() => {
    const saved = localStorage.getItem('splitPercent')
    return saved ? Number(saved) : 65
  })
  const dragging = useRef(false)
  const mainRef = useRef(null)

  const handleEventCreated = () => {
    setCalendarKey((k) => k + 1)
  }

  const onDragStart = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onDragMove = (e) => {
      if (!dragging.current || !mainRef.current) return
      const rect = mainRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(75, Math.max(30, pct))
      setSplitPercent(clamped)
    }
    const onDragEnd = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem('splitPercent', String(splitPercent))
    }
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    return () => {
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
    }
  }, [splitPercent])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onLogin={login} onRegister={register} onGoogleLogin={loginWithGoogle} />
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <SEO />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 min-w-[130px]">{t('appTitle')}</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={toggle}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 text-sm transition-colors min-w-[72px]"
              title={dark ? t('lightMode') : t('darkMode')}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              {t('darkMode')}
            </button>
            <Link
              to="/blog"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 text-sm min-w-[60px]"
            >
              <BookOpen size={16} />
              {t('blog')}
            </Link>
            <button
              onClick={() => setShowReport(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 text-sm min-w-[60px]"
            >
              <BarChart3 size={16} />
              {t('report')}
            </button>
            <button
              onClick={logout}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center gap-1 text-sm min-w-[72px]"
            >
              <LogOut size={16} />
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Split Layout: 모바일=상하, PC=좌우 (리사이즈 가능) */}
      <main ref={mainRef} className="flex-1 flex flex-col lg:flex-row w-full min-h-0">
        {/* 캘린더: 모바일 상단 60% / PC 좌측 (사용자 조절) */}
        <section
          className="h-[60%] lg:h-full flex flex-col min-h-0"
          style={{ width: undefined }}
          // lg 이상에서만 splitPercent 적용 (CSS media query 대신 inline style)
        >
          <div className="flex-1 overflow-y-auto">
            <CalendarView userId={user.uid} refreshKey={calendarKey} />
          </div>
        </section>

        {/* 드래그 핸들 (PC만 표시) */}
        <div
          onMouseDown={onDragStart}
          className="hidden lg:flex items-center justify-center w-1.5 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-800 bg-gray-200 dark:bg-gray-700 transition-colors group shrink-0"
        >
          <div className="w-0.5 h-8 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-blue-500 transition-colors" />
        </div>

        {/* 채팅/일상스케줄: 모바일 하단 40% / PC 우측 (나머지) */}
        <section className="h-[40%] lg:h-full lg:min-w-[280px] flex-1 flex flex-col min-h-0">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 px-2 pt-1">
            <button
              onClick={() => setChatMode('chat')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                chatMode === 'chat'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-b-0 border-gray-200 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare size={13} />
              {t('chatMode')}
            </button>
            <button
              onClick={() => setChatMode('schedule')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                chatMode === 'schedule'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-b-0 border-gray-200 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <CalendarCheck size={13} />
              {t('dailyScheduleMode')}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {chatMode === 'chat' ? (
              <ChatInterface userId={user.uid} onEventCreated={handleEventCreated} />
            ) : (
              <DailyScheduleView userId={user.uid} onEventCreated={handleEventCreated} />
            )}
          </div>
        </section>
      </main>

      {/* PC 레이아웃 비율 적용 (lg breakpoint = 1024px) */}
      <style>{`
        @media (min-width: 1024px) {
          main > section:first-child { width: ${splitPercent}% !important; flex-shrink: 0; }
        }
      `}</style>

      {/* Footer */}
      <footer className="w-full px-4 py-2 shrink-0">
        <nav className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          <Link to="/about" className="hover:text-gray-600 dark:hover:text-gray-300">{t('about')}</Link>
          <span>|</span>
          <Link to="/blog" className="hover:text-gray-600 dark:hover:text-gray-300">{t('blog')}</Link>
          <span>|</span>
          <Link to="/faq" className="hover:text-gray-600 dark:hover:text-gray-300">{t('faq')}</Link>
          <span>|</span>
          <Link to="/guide" className="hover:text-gray-600 dark:hover:text-gray-300">{t('guide')}</Link>
          <span>|</span>
          <Link to="/pricing" className="hover:text-gray-600 dark:hover:text-gray-300">{t('pricing')}</Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">{t('privacy')}</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">{t('terms')}</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600 dark:hover:text-gray-300">{t('contact')}</Link>
        </nav>
      </footer>

      {/* WeeklyReport Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('weeklyReport')}</h2>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <WeeklyReport userId={user.uid} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/introduction" element={<IntroductionBlog />} />
        <Route path="/blog/features" element={<FeaturesBlog />} />
        <Route path="/blog/use-cases" element={<UseCasesBlog />} />
        <Route path="/blog/ai-technology" element={<AITechnologyBlog />} />
        <Route path="/blog/productivity" element={<ProductivityBlog />} />
        <Route path="/blog/comparison" element={<ComparisonBlog />} />
        <Route path="/blog/tips" element={<TipsBlog />} />
        <Route path="/blog/future" element={<FutureBlog />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/ai-guide" element={<AIGuidePage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
      </Routes>
    </BrowserRouter>
  )
}
