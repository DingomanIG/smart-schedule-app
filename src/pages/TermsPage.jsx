import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">이용약관</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">제1조 (목적)</h2>
          <p>
            본 약관은 스마트 스케줄(이하 "서비스")의 이용 조건 및 절차, 이용자와 서비스 제공자의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">제2조 (정의)</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>"서비스"란 스마트 스케줄이 제공하는 AI 기반 일정 관리 웹 애플리케이션을 의미합니다.</li>
            <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
            <li>"콘텐츠"란 이용자가 서비스 내에서 생성하는 일정, 메시지 등의 데이터를 의미합니다.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
          <p>
            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이
            발생합니다. 서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지사항을
            통해 공지합니다. 변경된 약관에 동의하지 않는 경우 이용자는 서비스 이용을 중단하고
            탈퇴할 수 있습니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">제4조 (회원가입 및 서비스 이용)</h2>
          <p>
            이용자는 서비스가 정한 절차에 따라 이메일과 비밀번호를 입력하여 회원가입을 할 수
            있습니다. 서비스는 다음 각 호에 해당하는 경우 회원가입을 거부하거나 서비스 이용을
            제한할 수 있습니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>타인의 정보를 도용한 경우</li>
            <li>서비스의 정상적인 운영을 방해한 경우</li>
            <li>관련 법령에 위배되는 행위를 한 경우</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">제5조 (서비스의 제공)</h2>
          <p>서비스는 다음과 같은 기능을 제공합니다.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>AI 자연어 처리를 통한 일정 등록 및 관리</li>
            <li>캘린더 기반 일정 조회 및 삭제</li>
            <li>주간 일정 리포트 제공</li>
            <li>문의하기 기능을 통한 고객 지원</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">제6조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>서비스의 안정적인 운영을 방해하는 행위</li>
            <li>타인의 개인정보를 수집, 저장, 공개하는 행위</li>
            <li>서비스를 이용하여 법령 또는 공서양속에 반하는 행위</li>
            <li>서비스의 시스템에 무단으로 접근하거나 변경하는 행위</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">제7조 (면책조항)</h2>
          <p>
            서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 인해
            서비스를 제공할 수 없는 경우 책임이 면제됩니다. AI 파싱 결과의 정확성은 보장하지
            않으며, 이용자는 일정 등록 전 파싱 결과를 확인할 책임이 있습니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">제8조 (분쟁 해결)</h2>
          <p>
            서비스 이용과 관련하여 분쟁이 발생한 경우, 양 당사자는 성실히 협의하여 해결하도록
            합니다. 협의가 이루어지지 않는 경우 관할 법원에 소송을 제기할 수 있습니다.
          </p>

          <p className="text-xs text-gray-400 mt-6">시행일: 2026년 2월 16일</p>
        </div>
      </div>
    </div>
  )
}
