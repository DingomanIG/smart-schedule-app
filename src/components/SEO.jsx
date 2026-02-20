import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://yschedule.me'
const SITE_NAME = '스마트 스케줄'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export default function SEO({ title, description, path = '/', image, type = 'website' }) {
  const pageTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - AI 일정 관리`
  const pageDescription = description || 'AI가 자연어를 분석하여 자동으로 일정을 등록해주는 스마트 스케줄 관리 서비스.'
  const url = `${SITE_URL}${path}`
  const ogImage = image || DEFAULT_OG_IMAGE

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@yschedule_me" />
      <meta name="twitter:creator" content="@yschedule_me" />
    </Helmet>
  )
}
