import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { BarChart3, LogOut, X } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import SEO from './components/SEO'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
import CalendarView from './components/CalendarView'
import WeeklyReport from './components/WeeklyReport'

import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'

function MainApp() {
  const { user, loading, login, register, logout } = useAuth()
  const [showReport, setShowReport] = useState(false)
  const [calendarKey, setCalendarKey] = useState(0)

  const handleEventCreated = () => {
    setCalendarKey((k) => k + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onLogin={login} onRegister={register} />
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <SEO />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">스마트 스케줄</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReport(true)}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm"
            >
              <BarChart3 size={16} />
              리포트
            </button>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
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
        <section className="h-1/2 md:h-[55%] lg:h-[60%] border-b border-gray-300 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-white border-b border-gray-100 shrink-0">
            <h2 className="text-sm font-semibold text-gray-700">캘린더</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <CalendarView userId={user.uid} refreshKey={calendarKey} />
          </div>
        </section>

        {/* 하단: 채팅 (40% desktop / 45% tablet / 50% mobile) */}
        <section className="h-1/2 md:h-[45%] lg:h-[40%] flex flex-col min-h-0">
          <div className="px-4 py-2 bg-white border-b border-gray-100 shrink-0">
            <h2 className="text-sm font-semibold text-gray-700">채팅</h2>
          </div>
          <div className="flex-1 min-h-0">
            <ChatInterface userId={user.uid} onEventCreated={handleEventCreated} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full px-4 py-2 shrink-0">
        <nav className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link to="/about" className="hover:text-gray-600">서비스 소개</Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-600">개인정보처리방침</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-gray-600">이용약관</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600">문의하기</Link>
        </nav>
      </footer>

      {/* WeeklyReport Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">주간 리포트</h2>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
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
      </Routes>
    </BrowserRouter>
  )
}
