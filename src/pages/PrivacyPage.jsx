import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            스마트 스케줄(이하 "서비스")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을
            준수하고 있습니다. 본 개인정보처리방침은 서비스가 수집하는 개인정보의 항목, 수집 목적,
            보유 기간 등을 안내합니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">1. 수집하는 개인정보 항목</h2>
          <p>서비스는 회원가입 및 서비스 이용 과정에서 다음과 같은 개인정보를 수집합니다.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>필수 항목: 이메일 주소, 비밀번호(암호화 저장)</li>
            <li>자동 수집 항목: 서비스 이용 기록, 접속 로그, 기기 정보</li>
            <li>일정 데이터: 사용자가 입력한 일정 제목, 날짜, 시간, 장소 등</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">2. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>회원 관리: 회원제 서비스 이용에 따른 본인 확인, 개인 식별</li>
            <li>서비스 제공: AI 기반 일정 파싱, 캘린더 관리, 주간 리포트 생성</li>
            <li>서비스 개선: 이용 통계 분석, 서비스 품질 향상</li>
            <li>고객 지원: 문의 접수 및 처리, 공지사항 전달</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 회원 탈퇴 시 지체 없이 파기합니다.
            단, 관련 법령에 의하여 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>전자상거래 등에서의 소비자 보호에 관한 법률: 계약 또는 청약 철회 기록 5년</li>
            <li>통신비밀보호법: 접속 로그 기록 3개월</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">4. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는
            예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따른 요청이 있는 경우</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">5. 개인정보의 안전성 확보 조치</h2>
          <p>
            서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
            비밀번호는 Firebase Authentication을 통해 암호화되어 저장되며, 데이터 전송 시
            SSL/TLS 암호화를 적용합니다. 또한 Cloud Firestore의 보안 규칙을 통해 인가된
            사용자만 자신의 데이터에 접근할 수 있도록 제한하고 있습니다.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">6. 이용자의 권리</h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해
            개인정보의 삭제를 요청할 수 있습니다. 개인정보 관련 문의는{' '}
            <Link to="/contact" className="text-blue-600 hover:underline">문의하기</Link> 페이지를
            이용해 주세요.
          </p>

          <p className="text-xs text-gray-400 mt-6">시행일: 2026년 2월 16일</p>
        </div>
      </div>
    </div>
  )
}
