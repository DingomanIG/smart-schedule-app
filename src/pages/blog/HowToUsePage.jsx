import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home size={20} />
            홈
          </Link>
          <Link to="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
            목록
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            채팅으로 일정 등록하는 방법
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>2026-02-17</span>
            <span>•</span>
            <span>5분 읽기</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            스마트 스케줄은 복잡한 입력 폼 대신, 자연스러운 대화로 일정을 관리할 수 있는 혁신적인 서비스입니다.
            이 글에서는 채팅으로 일정을 등록하는 방법을 단계별로 알아보겠습니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. 기본 사용법</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            채팅창에 "내일 오후 2시 회의"라고 입력하면 AI가 자동으로 날짜와 시간을 인식합니다.
            굳이 정확한 날짜 형식(YYYY-MM-DD)을 입력할 필요가 없습니다.
            "다음주 월요일", "모레", "이번 주 금요일" 같은 표현도 정확하게 이해합니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. 상세 정보 포함하기</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            더 자세한 정보를 포함하면 AI가 더 정확하게 파싱합니다.
            예를 들어, "내일 오후 2시 강남역 스타벅스에서 김대리님과 프로젝트 회의" 같이 입력하면
            장소와 참석자 정보까지 자동으로 저장됩니다.
            하지만 간단하게 "내일 2시 회의"만 입력해도 문제없이 작동합니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. 시간 표현 방법</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            시간은 다양한 방식으로 표현할 수 있습니다. "오후 2시", "14시", "2시", "오후 두시" 모두 인식됩니다.
            오전/오후를 명시하지 않으면 문맥을 보고 AI가 판단하지만,
            정확성을 위해 오전/오후를 명시하는 것을 권장합니다. "점심 먹고", "저녁에" 같은 표현도 적절한 시간으로 변환됩니다.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. 확인 및 수정</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            AI가 파싱한 결과는 일정 카드 형태로 표시됩니다.
            여기서 날짜, 시간, 제목을 확인하고 필요하면 수정할 수 있습니다.
            확인 버튼을 누르면 캘린더에 등록되고, 언제든 캘린더에서 수정하거나 삭제할 수 있습니다.
            실수로 잘못 등록해도 걱정하지 마세요.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. 활용 팁</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            여러 일정을 한 번에 등록하려면 각 일정을 따로 입력하세요.
            채팅 기록이 남아 있어서 나중에 언제 무엇을 등록했는지 확인할 수 있습니다.
            자주 사용하는 표현이 있다면 그대로 사용하세요. AI가 학습하여 더 정확해집니다.
            망설이지 말고 편하게 말하듯이 입력하는 것이 가장 좋은 방법입니다.
          </p>
        </div>
      </article>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <Link to="/blog" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← 블로그 목록으로
          </Link>
        </div>
      </footer>
    </div>
  )
}
