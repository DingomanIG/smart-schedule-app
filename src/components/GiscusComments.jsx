import { useEffect, useRef } from 'react'

export default function GiscusComments() {
  const ref = useRef(null)

  const repo = import.meta.env.VITE_GISCUS_REPO
  const repoId = import.meta.env.VITE_GISCUS_REPO_ID
  const category = import.meta.env.VITE_GISCUS_CATEGORY
  const categoryId = import.meta.env.VITE_GISCUS_CATEGORY_ID

  // 시스템 다크 모드 감지
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    if (!repo || !repoId || !ref.current) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repoId)
    script.setAttribute('data-category', category || 'General')
    script.setAttribute('data-category-id', categoryId || '')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', isDark ? 'dark' : 'light')
    script.setAttribute('data-lang', 'ko')
    script.crossOrigin = 'anonymous'
    script.async = true

    ref.current.appendChild(script)

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ''
      }
    }
  }, [repo, repoId, category, categoryId, isDark])

  if (!repo || !repoId) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          댓글 기능을 사용하려면 .env에 Giscus 설정을 추가해주세요.
        </p>
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
        >
          giscus.app에서 설정하기
        </a>
      </div>
    )
  }

  return <div ref={ref} className="mt-4" />
}
