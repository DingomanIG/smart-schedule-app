import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <SEO title="페이지를 찾을 수 없습니다" description="요청하신 페이지를 찾을 수 없습니다." />
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            홈으로 돌아가기
          </Link>
          <Link
            to="/blog"
            className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            블로그 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
