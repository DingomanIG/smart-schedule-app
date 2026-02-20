import { Link } from 'react-router-dom'
import { Home, Check, X } from 'lucide-react'
import SEO from '../components/SEO'

export default function PricingPage() {
  const plans = [
    {
      name: '무료',
      price: '₩0',
      period: '영구 무료',
      description: '기본 기능으로 시작하기',
      features: [
        { text: '월 30개 일정 등록', included: true },
        { text: 'AI 자연어 파싱', included: true },
        { text: '캘린더 뷰 (일/주/월)', included: true },
        { text: '주간 리포트', included: true },
        { text: '반복 일정', included: false },
        { text: '팀 협업', included: false },
        { text: '외부 캘린더 연동', included: false },
        { text: 'AI 시간 추천', included: false },
        { text: '광고 없음', included: false }
      ],
      cta: '무료로 시작',
      ctaLink: '/',
      highlight: false
    },
    {
      name: '프리미엄',
      price: '₩4,900',
      period: '/ 월',
      description: '모든 기능 + 무제한 사용',
      features: [
        { text: '무제한 일정 등록', included: true },
        { text: 'AI 자연어 파싱', included: true },
        { text: '캘린더 뷰 (일/주/월)', included: true },
        { text: '주간 리포트', included: true },
        { text: '반복 일정', included: true },
        { text: '팀 협업 (최대 5명)', included: true },
        { text: '외부 캘린더 연동', included: true },
        { text: 'AI 시간 추천', included: true },
        { text: '광고 없음', included: true }
      ],
      cta: '곧 출시 예정',
      ctaLink: null,
      highlight: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="요금제" description="스마트 스케줄 무료, 프리미엄, 팀 요금제를 비교하고 나에게 맞는 플랜을 선택하세요." path="/pricing" />
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home size={20} />
            <span className="font-semibold">홈으로</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            간단한 요금제
          </h1>
          <p className="text-xl text-gray-600">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-8 ${
                plan.highlight
                  ? 'border-2 border-blue-600 shadow-xl'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  추천
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>

              {plan.ctaLink ? (
                <Link
                  to={plan.ctaLink}
                  className={`block text-center py-3 rounded-lg font-semibold mb-8 transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold mb-8 bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              )}

              <ul className="space-y-4">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="text-green-600 shrink-0 mt-0.5" size={20} />
                    ) : (
                      <X className="text-gray-300 shrink-0 mt-0.5" size={20} />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">자주 묻는 질문</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">프리미엄은 언제 출시되나요?</h3>
              <p className="text-gray-700">
                2026년 4월 출시 예정입니다. 출시 알림을 받으시려면 이메일을 남겨주세요.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">무료 플랜에서 프리미엄으로 전환하면?</h3>
              <p className="text-gray-700">
                기존 데이터는 모두 유지되며, 추가 기능이 즉시 활성화됩니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">환불 정책은 어떻게 되나요?</h3>
              <p className="text-gray-700">
                구독 후 7일 이내 100% 환불이 가능합니다. 언제든 해지할 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
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
