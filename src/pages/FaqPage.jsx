import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Home } from 'lucide-react'

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: '기본 사용',
      items: [
        {
          q: '스마트 스케줄은 무료인가요?',
          a: '네, 기본 기능은 완전 무료입니다. 채팅으로 일정 등록, 캘린더 보기, 주간 리포트 등 핵심 기능을 모두 무료로 이용하실 수 있습니다.'
        },
        {
          q: '회원가입이 필요한가요?',
          a: '네, 일정을 저장하고 관리하기 위해서는 간단한 회원가입이 필요합니다. 이메일과 비밀번호만으로 5초 안에 가입할 수 있습니다.'
        },
        {
          q: '어떤 방식으로 일정을 등록하나요?',
          a: '채팅창에 자연어로 입력하면 됩니다. 예: "내일 오후 2시 회의", "다음주 월요일 10시 병원". AI가 자동으로 날짜와 시간을 파싱하여 캘린더에 등록합니다.'
        }
      ]
    },
    {
      category: 'AI 파싱',
      items: [
        {
          q: 'AI가 어떻게 일정을 이해하나요?',
          a: 'OpenAI GPT-4o-mini 모델을 사용하여 자연어를 분석합니다. "내일", "다음주", "오후 2시" 같은 표현을 정확한 날짜와 시간으로 변환합니다.'
        },
        {
          q: '파싱이 잘못되면 어떻게 하나요?',
          a: '일정 등록 전 확인 단계에서 날짜/시간을 수정할 수 있습니다. 또한 캘린더에서 등록된 일정을 언제든 수정/삭제할 수 있습니다.'
        },
        {
          q: '반복 일정도 등록 가능한가요?',
          a: '현재는 단일 일정만 지원하며, 반복 일정 기능은 프리미엄 플랜에서 제공될 예정입니다.'
        }
      ]
    },
    {
      category: '데이터 & 보안',
      items: [
        {
          q: '제 일정 데이터는 안전한가요?',
          a: 'Firebase Firestore를 사용하여 Google의 보안 인프라에 데이터를 저장합니다. 모든 데이터는 암호화되어 전송되며, 본인만 접근할 수 있습니다.'
        },
        {
          q: '데이터를 내보낼 수 있나요?',
          a: '현재는 지원하지 않지만, 향후 업데이트에서 iCalendar(.ics) 형식으로 내보내기 기능을 추가할 예정입니다.'
        },
        {
          q: '계정을 삭제하면 데이터도 삭제되나요?',
          a: '네, 계정 삭제 시 모든 일정 데이터가 영구적으로 삭제되며 복구할 수 없습니다.'
        }
      ]
    },
    {
      category: '기술 지원',
      items: [
        {
          q: '모바일에서도 사용할 수 있나요?',
          a: '네, 반응형 웹 디자인으로 제작되어 PC, 태블릿, 스마트폰 모두에서 최적화된 환경으로 이용하실 수 있습니다.'
        },
        {
          q: '어떤 브라우저를 지원하나요?',
          a: 'Chrome, Firefox, Safari, Edge 등 모든 최신 브라우저를 지원합니다. 최상의 경험을 위해 최신 버전 사용을 권장합니다.'
        },
        {
          q: '오프라인에서도 사용할 수 있나요?',
          a: '현재는 인터넷 연결이 필요합니다. 향후 PWA(Progressive Web App) 업데이트를 통해 오프라인 기능을 추가할 예정입니다.'
        }
      ]
    }
  ]

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
        <p className="text-lg text-gray-600 mb-12">
          스마트 스케줄 사용에 대해 궁금한 점을 빠르게 찾아보세요.
        </p>

        {faqs.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.category}</h2>
            <div className="space-y-4">
              {section.items.map((faq, idx) => {
                const globalIdx = sectionIdx * 100 + idx
                const isOpen = openIndex === globalIdx

                return (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggle(globalIdx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="text-blue-600 shrink-0" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400 shrink-0" size={20} />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">답변을 찾지 못하셨나요?</h3>
          <p className="text-gray-600 mb-4">언제든지 문의해 주세요. 빠르게 답변 드리겠습니다.</p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            문의하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-700">서비스 소개</Link>
            <span>|</span>
            <Link to="/privacy" className="hover:text-gray-700">개인정보처리방침</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-gray-700">이용약관</Link>
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
