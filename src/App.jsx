import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BarChart3, LogOut, X, Moon, Sun, BookOpen } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useDarkMode } from './hooks/useDarkMode'
import SEO from './components/SEO'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
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
  const { user, loading, login, register, logout } = useAuth()
  const { dark, toggle } = useDarkMode()
  const [showReport, setShowReport] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)

  const handleEventCreated = () => {
    setCalendarKey((k) => k + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onLogin={login} onRegister={register} />
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <SEO />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">스마트 스케줄</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-sm transition-colors"
              title={dark ? '라이트 모드' : '다크 모드'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              다크모드
            </button>
            <Link
              to="/blog"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-sm"
            >
              <BookOpen size={16} />
              블로그
            </Link>
            <button
              onClick={() => setShowReport(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 text-sm"
            >
              <BarChart3 size={16} />
              리포트
            </button>
            <button
              onClick={logout}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 text-sm"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Split Layout */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full min-h-0">
        {/* 상단: 캘린더 (60% desktop / 55% tablet / 50% mobile) */}
        <section className="h-[65%] border-b-2 border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <CalendarView userId={user.uid} refreshKey={calendarKey} />
          </div>
        </section>

        {/* 하단: 채팅 (40% desktop / 45% tablet / 50% mobile) */}
        <section className="h-[35%] flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ChatInterface userId={user.uid} onEventCreated={handleEventCreated} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full px-4 py-2 shrink-0">
        <nav className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          <Link to="/about" className="hover:text-gray-600 dark:hover:text-gray-300">서비스 소개</Link>
          <span>|</span>
          <Link to="/blog" className="hover:text-gray-600 dark:hover:text-gray-300">블로그</Link>
          <span>|</span>
          <Link to="/faq" className="hover:text-gray-600 dark:hover:text-gray-300">FAQ</Link>
          <span>|</span>
          <Link to="/guide" className="hover:text-gray-600 dark:hover:text-gray-300">사용 가이드</Link>
          <span>|</span>
          <Link to="/pricing" className="hover:text-gray-600 dark:hover:text-gray-300">요금제</Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">개인정보처리방침</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">이용약관</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600 dark:hover:text-gray-300">문의하기</Link>
        </nav>
      </footer>

      {/* WeeklyReport Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">주간 리포트</h2>
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
