import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Sparkles, Zap, TrendingUp, DollarSign, Shield, Clock } from 'lucide-react'
import SEO from '../components/SEO'

export default function ComparisonPage() {
  const features = [
    { name: 'AI 자연어 입력', smartSchedule: true, traditional: false, manual: false },
    { name: '자동 날짜/시간 파싱', smartSchedule: true, traditional: false, manual: false },
    { name: '스마트 카테고리 분류', smartSchedule: true, traditional: false, manual: false },
    { name: '반복 일정 자동 생성', smartSchedule: true, traditional: true, manual: false },
    { name: '우선순위 자동 설정', smartSchedule: true, traditional: false, manual: false },
    { name: '주간 리포트 분석', smartSchedule: true, traditional: false, manual: false },
    { name: '다크모드 지원', smartSchedule: true, traditional: true, manual: false },
    { name: '모바일 반응형', smartSchedule: true, traditional: true, manual: false },
    { name: '클라우드 동기화', smartSchedule: true, traditional: true, manual: false },
    { name: '무료 사용', smartSchedule: true, traditional: false, manual: true },
    { name: '복잡한 설정 없음', smartSchedule: true, traditional: false, manual: true },
    { name: '즉시 시작 가능', smartSchedule: true, traditional: false, manual: true },
  ]

  const advantages = [
    {
      icon: <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />,
      title: 'AI 자동화',
      description: 'GPT-4o-mini가 입력을 이해하고 자동으로 일정을 정리합니다',
      benefit: '입력 시간 90% 단축',
    },
    {
      icon: <Zap className="text-blue-600 dark:text-blue-400" size={32} />,
      title: '빠른 입력',
      description: '말하듯이 편하게 입력하면 즉시 캘린더에 등록됩니다',
      benefit: '평균 5초 이내 등록',
    },
    {
      icon: <TrendingUp className="text-blue-600 dark:text-blue-400" size={32} />,
      title: '스마트 분석',
      description: '주간 리포트로 시간 사용 패턴과 생산성을 분석합니다',
      benefit: '생산성 30% 향상',
    },
    {
      icon: <DollarSign className="text-blue-600 dark:text-blue-400" size={32} />,
      title: '완전 무료',
      description: '모든 기능을 무료로 사용할 수 있습니다',
      benefit: '월 ₩0 유지비',
    },
    {
      icon: <Shield className="text-blue-600 dark:text-blue-400" size={32} />,
      title: '안전한 보안',
      description: 'Firebase 인증으로 데이터를 안전하게 보호합니다',
      benefit: '은행급 보안',
    },
    {
      icon: <Clock className="text-blue-600 dark:text-blue-400" size={32} />,
      title: '시간 절약',
      description: '복잡한 설정 없이 바로 시작할 수 있습니다',
      benefit: '설정 시간 0분',
    },
  ]

  const comparisonData = [
    {
      category: '스마트 스케줄',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-900 dark:text-blue-100',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      category: '기존 캘린더 앱',
      color: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-900 dark:text-gray-100',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
    {
      category: '수동 관리',
      color: 'bg-gray-50 dark:bg-gray-800',
      textColor: 'text-gray-900 dark:text-gray-100',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO title="기능 비교" description="스마트 스케줄과 구글 캘린더, 수동 관리 방식의 기능을 상세 비교합니다." path="/comparison" />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-4">
            <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">기능 비교</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            왜 스마트 스케줄인가?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            기존 캘린더 앱과 무엇이 다른지 한눈에 비교해보세요
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-16 overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      기능
                    </th>
                    {comparisonData.map((item, index) => (
                      <th
                        key={index}
                        className={`px-6 py-4 ${item.color} text-center text-sm font-semibold ${item.textColor}`}
                      >
                        {item.category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {features.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.smartSchedule ? (
                          <Check className="inline-block text-green-600 dark:text-green-400" size={20} />
                        ) : (
                          <X className="inline-block text-gray-300 dark:text-gray-600" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.traditional ? (
                          <Check className="inline-block text-green-600 dark:text-green-400" size={20} />
                        ) : (
                          <X className="inline-block text-gray-300 dark:text-gray-600" size={20} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {feature.manual ? (
                          <Check className="inline-block text-green-600 dark:text-green-400" size={20} />
                        ) : (
                          <X className="inline-block text-gray-300 dark:text-gray-600" size={20} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            스마트 스케줄만의 특별함
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  {advantage.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {advantage.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {advantage.description}
                </p>
                <div className="inline-block bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    ✨ {advantage.benefit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            📊 비교 요약
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">12개</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">스마트 스케줄 기능</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">5개</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">기존 캘린더 기능</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">3개</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">수동 관리 기능</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            더 스마트한 일정 관리를 시작하세요
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            복잡한 설정 없이 바로 사용할 수 있습니다. 무료로 모든 기능을 체험해보세요.
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
      <footer className="max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
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
