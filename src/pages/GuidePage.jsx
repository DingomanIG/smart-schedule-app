import { Link } from 'react-router-dom'
import { Home, MessageCircle, Calendar, BarChart3, Check } from 'lucide-react'

export default function GuidePage() {
  const steps = [
    {
      title: '1단계: 회원가입',
      icon: <Check className="text-blue-600" size={24} />,
      content: '이메일과 비밀번호로 5초 만에 가입하세요. Google 계정으로도 간편하게 가입할 수 있습니다.'
    },
    {
      title: '2단계: 채팅으로 일정 등록',
      icon: <MessageCircle className="text-blue-600" size={24} />,
      content: '자연어로 일정을 말하면 AI가 자동으로 분석합니다. 예: "내일 오후 2시 회의", "다음주 월요일 10시 병원"'
    },
    {
      title: '3단계: 캘린더 확인',
      icon: <Calendar className="text-blue-600" size={24} />,
      content: '등록된 일정을 캘린더에서 한눈에 확인하세요. 일/주/월 단위로 전환하며 일정을 관리할 수 있습니다.'
    },
    {
      title: '4단계: 주간 리포트',
      icon: <BarChart3 className="text-blue-600" size={24} />,
      content: '한 주 동안의 일정을 분석한 리포트를 확인하세요. 생산성 트렌드를 파악하고 개선할 수 있습니다.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home size={20} />
            <span className="font-semibold">홈으로</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">스마트 스케줄 사용 가이드</h1>
          <p className="text-xl text-gray-600">
            3분이면 마스터할 수 있는 간단한 일정 관리
          </p>
        </div>
      </section>

      {/* Steps */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0">{step.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">{step.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">💡 활용 팁</h2>
          <div className="grid md:grid-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">구체적으로 말하기</h3>
              <p className="text-gray-700 mb-2">
                <strong className="text-green-600">좋은 예:</strong> "내일 오후 2시 강남역에서 김대리님과 회의"
              </p>
              <p className="text-gray-700">
                <strong className="text-red-600">나쁜 예:</strong> "회의"
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">자연스럽게 말하기</h3>
              <p className="text-gray-700">
                "모레 점심 먹고 2시쯤 병원 가야함" 같은 자연스러운 표현도 AI가 정확하게 이해합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">시간대 명시하기</h3>
              <p className="text-gray-700">
                "오전 10시", "오후 3시" 처럼 오전/오후를 명확히 하면 더 정확합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">수정은 언제든지</h3>
              <p className="text-gray-700">
                캘린더에서 일정을 클릭하면 언제든 수정하거나 삭제할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 bg-blue-600 rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요!</h2>
          <p className="text-xl mb-8 opacity-90">
            가입부터 첫 일정 등록까지 1분이면 충분합니다.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-700">서비스 소개</Link>
            <span>|</span>
            <Link to="/faq" className="hover:text-gray-700">FAQ</Link>
            <span>|</span>
            <Link to="/contact" className="hover:text-gray-700">문의하기</Link>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            © 2026 스마트 스케줄. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
