import { Link } from 'react-router-dom'
import { ArrowLeft, PlayCircle, CheckCircle, MessageCircle, Calendar, BarChart3 } from 'lucide-react'

export default function TutorialPage() {
  const steps = [
    {
      title: '1단계: 회원가입 및 로그인',
      icon: <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />,
      description: '이메일과 비밀번호로 간편하게 가입하세요',
      details: [
        '구글 계정으로 빠른 회원가입 가능',
        '데모 모드로 먼저 체험해보기',
        '안전한 Firebase 인증 시스템',
      ],
    },
    {
      title: '2단계: 채팅으로 일정 등록',
      icon: <MessageCircle className="text-blue-600 dark:text-blue-400" size={24} />,
      description: '자연어로 편하게 말하듯이 일정을 입력하세요',
      details: [
        '"내일 오후 3시 회의" → 자동으로 일정 생성',
        '"매주 월요일 9시 팀 미팅" → 반복 일정 자동 등록',
        '"다음 주 금요일 저녁 약속" → 날짜/시간 자동 파싱',
      ],
    },
    {
      title: '3단계: 캘린더에서 확인',
      icon: <Calendar className="text-blue-600 dark:text-blue-400" size={24} />,
      description: '등록된 일정을 캘린더에서 한눈에 확인하세요',
      details: [
        '주간/월간 뷰로 일정 한눈에 보기',
        '일정 클릭으로 상세 정보 확인',
        '우선순위별 색상 구분',
      ],
    },
    {
      title: '4단계: 리포트로 분석',
      icon: <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />,
      description: '주간 리포트로 시간 사용 패턴을 분석하세요',
      details: [
        '카테고리별 시간 분석',
        '가장 바쁜 요일 확인',
        '생산성 향상 인사이트',
      ],
    },
  ]

  const tips = [
    {
      title: '💡 팁 1: 구체적으로 말하기',
      content: '"회의"보다는 "팀 기획 회의"처럼 구체적으로 입력하면 자동 분류가 더 정확해요',
    },
    {
      title: '💡 팁 2: 시간 표현 자유롭게',
      content: '"3시", "오후 3시", "15:00" 모두 인식 가능해요',
    },
    {
      title: '💡 팁 3: 반복 일정 활용',
      content: '"매주", "매일", "격주" 등의 표현으로 반복 일정을 한 번에 등록하세요',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">메인으로 돌아가기</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-4">
            <PlayCircle size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">시작 가이드</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            스마트 스케줄 사용법
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            4단계로 배우는 AI 스케줄러 완벽 활용법
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎯 활용 팁
          </h2>
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tip.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tip.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            지금 시작하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-center gap-3 text-sm text-gray-400 dark:text-gray-500 flex-wrap">
          <Link to="/about" className="hover:text-gray-600 dark:hover:text-gray-300">서비스 소개</Link>
          <span>|</span>
          <Link to="/faq" className="hover:text-gray-600 dark:hover:text-gray-300">FAQ</Link>
          <span>|</span>
          <Link to="/guide" className="hover:text-gray-600 dark:hover:text-gray-300">사용 가이드</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600 dark:hover:text-gray-300">문의하기</Link>
        </nav>
      </footer>
    </div>
  )
}
