import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { MessageSquare, CalendarDays, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import SEO from './components/SEO'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
import CalendarView from './components/CalendarView'
import WeeklyReport from './components/WeeklyReport'
import AdSenseAd from './components/AdSenseAd'
import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'

const tabs = [
  { id: 'chat', label: '채팅', icon: MessageSquare },
  { id: 'calendar', label: '캘린더', icon: CalendarDays },
  { id: 'report', label: '리포트', icon: BarChart3 },
]

function MainApp() {
  const { user, loading, login, register, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO />
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">스마트 스케줄</h1>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
        {/* 탭 네비게이션 */}
        <nav className="max-w-3xl mx-auto px-4 flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full">
        {activeTab === 'chat' && <ChatInterface userId={user.uid} />}
        {activeTab === 'calendar' && <CalendarView userId={user.uid} />}
        {activeTab === 'report' && <WeeklyReport userId={user.uid} />}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full px-4 py-3 space-y-3">
        <AdSenseAd slot="footer-banner" />
        <nav className="flex items-center justify-center gap-4 text-xs text-gray-400 pb-2">
          <Link to="/about" className="hover:text-gray-600">서비스 소개</Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-600">개인정보처리방침</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-gray-600">이용약관</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600">문의하기</Link>
        </nav>
      </footer>
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
