import { Link } from 'react-router-dom'
import { Home, Clock, ArrowRight } from 'lucide-react'

export default function BlogListPage() {
  const posts = [
    {
      slug: 'how-to-use',
      title: '채팅으로 일정 등록하는 방법',
      excerpt: '자연어로 간단하게 일정을 등록하는 스마트 스케줄 사용법을 알아보세요.',
      date: '2026-02-17',
      readTime: '5분'
    },
    {
      slug: 'ai-schedule',
      title: 'AI 일정 관리로 시작하는 스마트한 하루',
      excerpt: 'AI가 어떻게 일정 관리를 혁신하는지, 그리고 어떻게 활용하면 좋을지 알아봅니다.',
      date: '2026-02-16',
      readTime: '6분'
    },
    {
      slug: 'productivity-tips',
      title: '생산성을 10배 높이는 캘린더 활용법',
      excerpt: '시간 관리 전문가들이 추천하는 캘린더 활용 꿀팁을 공개합니다.',
      date: '2026-02-15',
      readTime: '7분'
    },
    {
      slug: 'google-vs-smart',
      title: '구글 캘린더 vs 스마트 스케줄 비교',
      excerpt: '두 서비스의 장단점을 객관적으로 비교하고 어떤 것을 선택해야 할지 알아봅니다.',
      date: '2026-02-14',
      readTime: '8분'
    },
    {
      slug: 'best-apps',
      title: '2026년 무료 일정 관리 앱 TOP 5',
      excerpt: '실제 사용자 리뷰를 바탕으로 선정한 최고의 일정 관리 앱을 소개합니다.',
      date: '2026-02-13',
      readTime: '6분'
    },
    {
      slug: 'time-management',
      title: '시간 관리의 기술: 하루 24시간을 48시간처럼',
      excerpt: '성공한 사람들의 시간 관리 비법과 실천 가능한 팁을 알려드립니다.',
      date: '2026-02-12',
      readTime: '7분'
    },
    {
      slug: 'schedule-routine',
      title: '완벽한 일정 관리 루틴 만들기',
      excerpt: '아침부터 저녁까지, 일정 관리를 습관으로 만드는 단계별 가이드.',
      date: '2026-02-11',
      readTime: '6분'
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
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">블로그</h1>
          <p className="text-xl text-gray-600">
            일정 관리와 생산성 향상에 대한 유용한 정보를 공유합니다
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-8">
          {posts.map((post, idx) => (
            <article
              key={idx}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <Link to={`/blog/${post.slug}`} className="group">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    읽기
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
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
