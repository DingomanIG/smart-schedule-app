import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, LogOut, X, Moon, Sun, BookOpen, MessageSquare, CalendarCheck, Bell, Flag, PawPrint, Briefcase, Baby } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import { useLanguage } from './hooks/useLanguage'
import { useNotifications } from './hooks/useNotifications'
import SEO from './components/SEO'
import LanguageToggle from './components/LanguageToggle'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
import DailyScheduleView from './components/DailyScheduleView'
import MajorEventsView from './components/MajorEventsView'
import WorkScheduleView from './components/WorkScheduleView'
import ChildcareScheduleView from './components/ChildcareScheduleView'
import CalendarView from './components/CalendarView'
import WeeklyReport from './components/WeeklyReport'
import NotificationSettings from './components/NotificationSettings'

// 정적 페이지 lazy loading
const AboutPage = lazy(() => import('./pages/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const IntroductionBlog = lazy(() => import('./pages/blog/IntroductionBlog'))
const FeaturesBlog = lazy(() => import('./pages/blog/FeaturesBlog'))
const UseCasesBlog = lazy(() => import('./pages/blog/UseCasesBlog'))
const AITechnologyBlog = lazy(() => import('./pages/blog/AITechnologyBlog'))
const ProductivityBlog = lazy(() => import('./pages/blog/ProductivityBlog'))
const ComparisonBlog = lazy(() => import('./pages/blog/ComparisonBlog'))
const TipsBlog = lazy(() => import('./pages/blog/TipsBlog'))
const FutureBlog = lazy(() => import('./pages/blog/FutureBlog'))
const TutorialPage = lazy(() => import('./pages/TutorialPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const AIGuidePage = lazy(() => import('./pages/AIGuidePage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function MainApp() {
  const { user, loading, login, register, loginWithGoogle, logout } = useAuth()
  const { dark, toggle } = useDarkMode()
  const { lang, t } = useLanguage()
  const [showReport, setShowReport] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)
  const [chatMode, setChatMode] = useState('chat')
  const [now, setNow] = useState(new Date())
  const [currentEvent, setCurrentEvent] = useState(null)
  const notifications = useNotifications(user?.uid, calendarKey, lang)
  const nowTimerRef = useRef(null)
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

  // 현재 시간 매분 업데이트
  useEffect(() => {
    const updateNow = () => setNow(new Date())
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000
    const timeout = setTimeout(() => {
      updateNow()
      nowTimerRef.current = setInterval(updateNow, 60000)
    }, msUntilNextMinute)
    return () => {
      clearTimeout(timeout)
      if (nowTimerRef.current) clearInterval(nowTimerRef.current)
    }
  }, [])

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
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 min-w-[130px]">{t('appTitle')}</h1>
            {currentEvent && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg max-w-[200px] text-xs">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-700 dark:text-green-300 truncate font-medium" title={currentEvent.title}>
                  {currentEvent.title}
                </span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
              <span className="font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                {now.toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })} {now.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <NotificationSettings {...notifications} t={t} />
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
            <CalendarView userId={user.uid} refreshKey={calendarKey} now={now} onCurrentEventChange={setCurrentEvent} />
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
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 shrink-0 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setChatMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'chat'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <MessageSquare size={13} />
              {t('chatMode')}
            </button>
            <button
              onClick={() => setChatMode('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'schedule'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <CalendarCheck size={13} />
              {t('dailyScheduleMode')}
            </button>
            <button
              onClick={() => setChatMode('major')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'major'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Flag size={13} />
              {t('majorEventsMode')}
            </button>
            <button
              onClick={() => setChatMode('petcare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'petcare'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <PawPrint size={13} />
              {t('petCareMode')}
            </button>
            <button
              onClick={() => setChatMode('work')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'work'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Briefcase size={13} />
              {t('workScheduleMode')}
            </button>
            <button
              onClick={() => setChatMode('childcare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
                chatMode === 'childcare'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Baby size={13} />
              {t('childcareMode')}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0">
            {chatMode === 'chat' ? (
              <ChatInterface userId={user.uid} onEventCreated={handleEventCreated} />
            ) : chatMode === 'schedule' ? (
              <DailyScheduleView key="daily" userId={user.uid} onEventCreated={handleEventCreated} />
            ) : chatMode === 'major' ? (
              <MajorEventsView userId={user.uid} onEventCreated={handleEventCreated} />
            ) : chatMode === 'work' ? (
              <WorkScheduleView userId={user.uid} onEventCreated={handleEventCreated} />
            ) : chatMode === 'childcare' ? (
              <ChildcareScheduleView userId={user.uid} onEventCreated={handleEventCreated} />
            ) : (
              <DailyScheduleView key="petcare" userId={user.uid} onEventCreated={handleEventCreated} petCareMode />
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
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-500 dark:text-gray-400">로딩 중...</p></div>}>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
