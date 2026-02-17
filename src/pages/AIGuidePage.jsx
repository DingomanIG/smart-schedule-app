import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, Sparkles, Zap, Target, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react'

export default function AIGuidePage() {
  const features = [
    {
      icon: <Zap className="text-blue-600 dark:text-blue-400" size={24} />,
      title: '자동 날짜/시간 파싱',
      description: '"내일 오후 3시", "다음 주 금요일" 같은 자연어를 정확한 날짜/시간으로 자동 변환',
      examples: ['내일 오후 3시 → 2026-02-18 15:00', '다음 주 월요일 → 2026-02-24'],
    },
    {
      icon: <Target className="text-blue-600 dark:text-blue-400" size={24} />,
      title: '스마트 카테고리 분류',
      description: '입력된 내용을 분석해 자동으로 업무, 개인, 학습 등 카테고리 분류',
      examples: ['팀 회의 → 업무', '영화 보기 → 여가', '영어 공부 → 학습'],
    },
    {
      icon: <Calendar className="text-blue-600 dark:text-blue-400" size={24} />,
      title: '반복 일정 인식',
      description: '"매주", "매일", "격주" 등의 표현을 자동으로 인식해 반복 일정 생성',
      examples: ['매주 월요일 미팅 → 매주 반복', '매일 운동 → 매일 반복'],
    },
    {
      icon: <Clock className="text-blue-600 dark:text-blue-400" size={24} />,
      title: '우선순위 자동 설정',
      description: '긴급, 중요 등의 키워드를 감지해 우선순위를 자동으로 설정',
      examples: ['긴급 보고서 작성 → 높음', '여유 있게 책 읽기 → 낮음'],
    },
  ]

  const examples = [
    {
      input: '내일 오후 3시 클라이언트 미팅',
      output: {
        date: '2026-02-18',
        time: '15:00',
        title: '클라이언트 미팅',
        category: '업무',
        priority: '보통',
      },
    },
    {
      input: '매주 월요일 9시 팀 스탠드업',
      output: {
        date: '매주 월요일',
        time: '09:00',
        title: '팀 스탠드업',
        category: '업무',
        priority: '보통',
        repeat: '매주',
      },
    },
    {
      input: '다음 주 금요일 저녁 친구 약속',
      output: {
        date: '2026-02-28',
        time: '18:00',
        title: '친구 약속',
        category: '개인',
        priority: '낮음',
      },
    },
  ]

  const howItWorks = [
    {
      step: 1,
      title: '자연어 입력',
      description: '말하듯이 편하게 일정을 입력하세요',
      detail: '복잡한 양식 없이 "내일 오후 3시 회의"처럼 자연스럽게 입력',
    },
    {
      step: 2,
      title: 'AI 분석',
      description: 'GPT-4o-mini가 입력을 분석합니다',
      detail: '날짜, 시간, 카테고리, 우선순위를 자동으로 추출 및 분류',
    },
    {
      step: 3,
      title: '자동 등록',
      description: '캘린더에 바로 등록됩니다',
      detail: '확인 없이 자동으로 일정이 생성되고 알림도 설정됩니다',
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
            <Brain size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">AI 기술</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI 스케줄링 완벽 가이드
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            OpenAI GPT-4o-mini가 당신의 일정을 자동으로 이해하고 정리합니다
          </p>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            <Sparkles className="inline-block mr-2 text-blue-600 dark:text-blue-400" size={28} />
            AI 핵심 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {feature.description}
                    </p>
                    <div className="space-y-1">
                      {feature.examples.map((example, idx) => (
                        <div key={idx} className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          • {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            실제 입력 예시
          </h2>
          <div className="space-y-6">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Input */}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      입력
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium">
                        "{example.input}"
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="shrink-0 mt-8 text-blue-600 dark:text-blue-400" size={24} />

                  {/* Output */}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      AI 분석 결과
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="space-y-1 text-sm">
                        {Object.entries(example.output).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                            <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            작동 원리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI의 힘을 직접 경험해보세요
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            복잡한 설정 없이 바로 시작할 수 있습니다. 무료로 모든 AI 기능을 사용해보세요.
          </p>
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
