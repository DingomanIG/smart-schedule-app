import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'
import ContactForm from '../components/ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="문의하기" description="스마트 스케줄 서비스 관련 문의사항을 남겨주세요. 영업일 기준 1~2일 이내에 답변 드립니다." path="/contact" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6">
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">문의하기</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            스마트 스케줄 서비스를 이용하시면서 궁금한 점이나 불편한 사항이 있으시면
            아래 양식을 통해 문의해 주세요. 영업일 기준 1~2일 이내에 답변 드리겠습니다.
          </p>

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">문의 유형 안내</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>서비스 이용 문의</strong> - 기능 사용법, 오류 신고 등</li>
              <li><strong>계정 관련 문의</strong> - 회원가입, 로그인, 비밀번호 등</li>
              <li><strong>기능 제안</strong> - 새로운 기능 요청 및 개선 사항</li>
              <li><strong>기타 문의</strong> - 제휴, 광고, 기타 비즈니스 관련</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <ContactForm />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 text-sm text-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">기타 연락처</h2>
          <p>
            긴급한 문의사항은 아래 이메일로 직접 연락해 주세요.
          </p>
          <p className="mt-2 text-blue-600">support@smartschedule.app</p>
        </div>
      </div>
    </div>
  )
}
