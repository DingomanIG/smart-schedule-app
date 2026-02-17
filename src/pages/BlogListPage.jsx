import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeft } from 'lucide-react'

// 블로그 포스트 데이터
const blogPosts = [
  {
    id: 1,
    title: 'AI 스케줄러 소개',
    description: '자연어로 일정을 관리하는 스마트한 방법을 알아보세요',
    path: '/blog/introduction',
  },
  {
    id: 2,
    title: '주요 기능',
    description: 'AI 기반 일정 파싱, 자동 분류, 통계 분석 등 핵심 기능 소개',
    path: '/blog/features',
  },
  {
    id: 3,
    title: '활용 사례',
    description: '학생, 직장인, 프리랜서를 위한 실제 활용 사례',
    path: '/blog/use-cases',
  },
  {
    id: 4,
    title: 'AI 기술 설명',
    description: 'GPT-4o-mini를 활용한 자연어 처리 기술 상세 설명',
    path: '/blog/ai-technology',
  },
  {
    id: 5,
    title: '생산성 향상',
    description: '스마트 스케줄로 일상 생산성을 극대화하는 방법',
    path: '/blog/productivity',
  },
  {
    id: 6,
    title: '경쟁사 비교',
    description: '구글 캘린더, 노션 등 다른 도구와의 차별점',
    path: '/blog/comparison',
  },
  {
    id: 7,
    title: '활용 팁',
    description: '효과적인 일정 관리를 위한 실전 노하우',
    path: '/blog/tips',
  },
  {
    id: 8,
    title: '미래 전망',
    description: 'AI 기반 스케줄 관리의 미래와 발전 방향',
    path: '/blog/future',
  },
]

// 블로그 카드 컴포넌트
function BlogCard({ title, description, path }) {
  return (
    <Link
      to={path}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
          <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function BlogListPage() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">블로그</h1>
          <p className="text-gray-600 dark:text-gray-400">
            스마트 스케줄에 대한 유용한 정보와 활용 팁을 확인하세요
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              description={post.description}
              path={post.path}
            />
          ))}
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
          <Link to="/pricing" className="hover:text-gray-600 dark:hover:text-gray-300">요금제</Link>
          <span>|</span>
          <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">개인정보처리방침</Link>
          <span>|</span>
          <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">이용약관</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-gray-600 dark:hover:text-gray-300">문의하기</Link>
        </nav>
      </footer>
    </div>
  )
}
