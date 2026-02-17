import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO title="서비스 소개" description="스마트 스케줄은 AI 기반 자연어 일정 관리 웹 애플리케이션입니다. 채팅으로 간편하게 일정을 등록하세요." path="/about" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">서비스 소개</h1>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">스마트 스케줄이란?</h2>
          <p>
            스마트 스케줄은 인공지능(AI) 기술을 활용한 차세대 일정 관리 웹 애플리케이션입니다.
            사용자가 자연어로 일정을 입력하면 AI가 자동으로 날짜, 시간, 장소 등의 정보를 파싱하여
            캘린더에 등록해 줍니다. 복잡한 입력 폼 없이 대화하듯 일정을 관리할 수 있습니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">주요 기능</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>AI 자연어 파싱</strong> - "내일 오후 3시 팀 회의"와 같이 자연스러운 문장으로
              일정을 등록할 수 있습니다. OpenAI GPT-4o-mini가 날짜, 시간, 제목, 카테고리를 자동으로 인식합니다.
            </li>
            <li>
              <strong>채팅 기반 인터페이스</strong> - 메신저처럼 간편한 채팅 UI를 통해 일정을 추가하고
              확인할 수 있습니다. AI가 파싱한 결과를 카드 형태로 보여주며, 확인 후 저장할 수 있습니다.
            </li>
            <li>
              <strong>캘린더 뷰</strong> - 등록된 일정을 월별 캘린더에서 한눈에 확인할 수 있습니다.
              일정이 있는 날짜에는 파란색 점이 표시되며, 날짜를 클릭하면 상세 일정을 볼 수 있습니다.
            </li>
            <li>
              <strong>주간 리포트</strong> - 이번 주 일정을 카테고리별로 요약하여 보여줍니다.
              총 일정 수와 카테고리 분포를 시각적으로 확인할 수 있습니다.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">기술 스택</h2>
          <p>
            프론트엔드는 React 18과 Vite를 기반으로 하며, Tailwind CSS로 깔끔한 UI를 구현하였습니다.
            백엔드 서비스는 Firebase Authentication(사용자 인증)과 Cloud Firestore(데이터 저장)를
            사용합니다. AI 일정 파싱에는 OpenAI의 GPT-4o-mini 모델을 활용하고 있습니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">문의</h2>
          <p>
            서비스 이용 중 문의사항이 있으시면 <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">문의하기</Link> 페이지를
            통해 연락해 주세요. 빠른 시일 내에 답변 드리겠습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
