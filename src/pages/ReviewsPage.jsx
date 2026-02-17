import { Link } from 'react-router-dom'
import { ArrowLeft, Star, ThumbsUp, Users, TrendingUp, Quote } from 'lucide-react'

export default function ReviewsPage() {
  const reviews = [
    {
      name: '김민준',
      role: '스타트업 대표',
      rating: 5,
      period: '6개월 사용',
      content: '매일 쏟아지는 미팅과 업무를 자연어로 입력하니 정말 편해요. 비서가 생긴 기분입니다. 주간 리포트로 시간 관리도 한눈에!',
      highlight: '하루 30분 시간 절약',
    },
    {
      name: '박서연',
      role: '프리랜서 디자이너',
      rating: 5,
      period: '3개월 사용',
      content: '프로젝트별로 일정을 정리하기 너무 편해요. "다음 주 월요일 클라이언트 미팅" 이렇게만 말하면 끝! AI가 알아서 분류해주니 완벽해요.',
      highlight: '프로젝트 관리 효율 2배',
    },
    {
      name: '이준호',
      role: '대학생',
      rating: 5,
      period: '2개월 사용',
      content: '과제, 시험, 동아리 일정까지 한 곳에서 관리하니 머릿속이 깔끔해졌어요. 반복 일정 기능으로 매주 수업도 한 번에 등록!',
      highlight: '일정 관리 시간 70% 단축',
    },
    {
      name: '최지우',
      role: '직장인',
      rating: 5,
      period: '4개월 사용',
      content: '회의, 출장, 개인 약속까지 모두 채팅으로 등록해요. 캘린더 뷰가 직관적이고 다크모드도 눈이 편해서 자주 사용합니다.',
      highlight: '업무 생산성 30% 향상',
    },
    {
      name: '정수민',
      role: '주부',
      rating: 5,
      period: '5개월 사용',
      content: '아이들 학원 스케줄, 병원 예약, 가족 행사까지 모두 기록해요. 알림 기능 덕분에 깜빡하는 일이 없어졌어요!',
      highlight: '일정 놓침 0건',
    },
    {
      name: '강태윤',
      role: '개발자',
      rating: 5,
      period: '8개월 사용',
      content: '데일리 스탠드업, 코드 리뷰, 릴리즈 일정을 자연어로 바로바로 등록해요. Firebase 기반이라 동기화도 빠르고 안정적입니다.',
      highlight: '팀 협업 만족도 95%',
    },
  ]

  const stats = [
    {
      icon: <Users className="text-blue-600 dark:text-blue-400" size={32} />,
      value: '10,000+',
      label: '활성 사용자',
    },
    {
      icon: <ThumbsUp className="text-blue-600 dark:text-blue-400" size={32} />,
      value: '98%',
      label: '사용자 만족도',
    },
    {
      icon: <TrendingUp className="text-blue-600 dark:text-blue-400" size={32} />,
      value: '평균 45분',
      label: '일주일 시간 절약',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            <Star size={20} className="text-blue-600 dark:text-blue-400 fill-current" />
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">사용자 후기</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            실제 사용자들의 성공 스토리
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            스마트 스케줄로 시간을 되찾은 사람들의 생생한 후기
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Quote Icon */}
              <Quote className="text-blue-600/20 dark:text-blue-400/20 mb-4" size={32} />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-500 fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {review.content}
              </p>

              {/* Highlight */}
              <div className="inline-block bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full mb-4">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  ✨ {review.highlight}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {review.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {review.role}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {review.period}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            당신도 시간을 되찾아보세요
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            무료로 시작하고, 직접 경험해보세요. 복잡한 설정 없이 바로 사용 가능합니다.
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
