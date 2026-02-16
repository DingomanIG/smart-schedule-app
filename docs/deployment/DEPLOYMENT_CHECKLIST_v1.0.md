# ✅ 배포 및 수익화 체크리스트

> **조코딩 수익화 전략: 빠르게 배포 → 트래픽 모으기 → 광고 수익**
>
> 이 가이드는 배포부터 애드센스 승인, SEO 최적화, 수익화까지 모든 단계를 다룹니다.

---

## 📋 목차

1. [GitHub 설정](#-github-설정)
2. [Vercel 배포](#-vercel-배포)
3. [환경 변수 관리](#-환경-변수-관리)
4. [Google Search Console](#-google-search-console)
5. [SEO 최적화](#-seo-최적화)
6. [애드센스 준비](#-애드센스-준비)
7. [수익화 전략](#-수익화-전략)
8. [성능 최적화](#-성능-최적화)

---

## 📦 GitHub 설정

### 1-1. 리포지토리 생성

**웹에서 생성 (권장)**

```
1. https://github.com/new 접속
2. Repository name: smart-schedule-app
3. Description: AI 기반 스마트 스케줄 관리 웹앱
4. Public 선택 (Private도 가능, Vercel은 둘 다 지원)
5. Initialize: 체크 안함 (로컬에 이미 있음)
6. Create repository
```

### 1-2. 로컬 Git 설정

```bash
# Git 초기화 (아직 안했다면)
git init

# .gitignore 확인 및 수정
cat > .gitignore << EOF
# 의존성
node_modules

# 빌드
dist

# 환경 변수 (절대 업로드 금지!)
.env
.env.local
.env.production

# IDE
.vscode
.idea
.DS_Store

# 기타
*.log
.cache
EOF

# 모든 파일 추가
git add .

# 초기 커밋
git commit -m "Initial commit: Smart Schedule App MVP

- React + Vite 기반 SPA
- Firebase Authentication + Firestore
- OpenAI GPT-4o-mini 자연어 파싱
- Tailwind CSS 스타일링
- 채팅, 캘린더, 리포트 기능 완성"

# 브랜치 이름 main으로 변경
git branch -M main

# 리모트 추가 (GitHub 사용자명 변경)
git remote add origin https://github.com/your-username/smart-schedule-app.git

# 푸시
git push -u origin main
```

### 1-3. README 업데이트

```bash
# README.md 확인
cat README.md

# 필수 포함 내용:
# - 프로젝트 소개
# - 주요 기능
# - 기술 스택
# - 설치 방법
# - 환경 변수 설정 (.env.example 참고)
# - 배포 URL (나중에 추가)
# - 라이선스
```

### 1-4. .env.example 생성

```bash
# .env.example 파일 생성
cat > .env.example << EOF
# OpenAI API
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Web3Forms (선택)
VITE_WEB3FORMS_ACCESS_KEY=your-access-key

# Google Analytics (선택)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
EOF

git add .env.example
git commit -m "Add environment variables example"
git push
```

### ✅ GitHub 체크리스트

- [ ] 리포지토리 생성 완료
- [ ] .gitignore에 .env 추가
- [ ] .env.example 생성
- [ ] README.md 작성
- [ ] 초기 커밋 및 푸시
- [ ] GitHub에서 코드 확인

---

## 🚀 Vercel 배포

### 2-1. Vercel 계정 생성

```
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 선택
4. GitHub 계정 인증
5. Vercel 권한 승인
```

### 2-2. 프로젝트 Import

```
1. Vercel 대시보드 → "Add New..." → "Project"
2. "Import Git Repository" → GitHub 탭
3. 리포지토리 검색: smart-schedule-app
4. "Import" 클릭
```

### 2-3. 프로젝트 설정

**Build & Development Settings**

```yaml
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**💡 커스텀 설정 (필요 시)**

```json
// vercel.json 생성
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2-4. 환경 변수 설정

**Vercel 대시보드에서 입력**

```
Project → Settings → Environment Variables

각 변수를 다음과 같이 입력:
(Production, Preview, Development 모두 체크)

변수 1:
  Key: VITE_OPENAI_API_KEY
  Value: sk-proj-실제키입력
  Environments: ✅ Production ✅ Preview ✅ Development

변수 2:
  Key: VITE_FIREBASE_API_KEY
  Value: AIzaSy실제키입력
  Environments: ✅ Production ✅ Preview ✅ Development

... (나머지 환경 변수도 동일하게)
```

**💡 빠른 입력 (로컬 .env 파일 복사)**

```bash
# .env 파일 내용을 복사해서 Vercel에 붙여넣기
cat .env
```

### 2-5. Deploy

```
1. 모든 설정 확인
2. "Deploy" 버튼 클릭
3. 빌드 로그 확인 (1-2분 소요)
4. 완료 후 URL 확인: https://your-project.vercel.app
```

### 2-6. 도메인 연결 (선택)

**무료 도메인 사용**

```
기본 제공: your-project.vercel.app
추가 비용 없음
HTTPS 자동 적용
```

**커스텀 도메인 사용**

```
1. 도메인 구매 (Namecheap, GoDaddy, Cloudflare)
   예: smartschedule.com ($10/년)

2. Vercel 프로젝트 → Settings → Domains
3. "Add Domain" → 구매한 도메인 입력
4. DNS 설정 안내 따라하기

5. 도메인 제공업체 → DNS 관리
   A Record:
     Name: @
     Value: 76.76.21.21

   CNAME Record:
     Name: www
     Value: cname.vercel-dns.com

6. 1시간 후 HTTPS 자동 활성화
```

### ✅ Vercel 체크리스트

- [ ] Vercel 계정 생성
- [ ] 프로젝트 Import
- [ ] 환경 변수 입력 (모든 VITE_ 변수)
- [ ] 빌드 성공
- [ ] 배포 URL 확인
- [ ] HTTPS 작동 확인
- [ ] 모든 기능 테스트
- [ ] (선택) 커스텀 도메인 연결

---

## 🔐 환경 변수 관리

### 3-1. 환경 변수 보안

**절대 하지 말아야 할 것**

```javascript
❌ 하드코딩
const apiKey = "sk-proj-abc123..."

❌ 클라이언트 노출
console.log(import.meta.env.VITE_OPENAI_API_KEY)

❌ GitHub에 업로드
git add .env  // 절대 금지!
```

**올바른 방법**

```javascript
✅ 환경 변수 사용
const apiKey = import.meta.env.VITE_OPENAI_API_KEY

✅ 환경 변수 검증
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('OpenAI API key is required')
}

✅ .gitignore에 추가
.env
.env.*
!.env.example
```

### 3-2. 환경 변수 검증

```javascript
// src/config/env.js 생성
export function validateEnv() {
  const required = [
    'VITE_OPENAI_API_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ]

  const missing = required.filter(
    key => !import.meta.env[key]
  )

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing)
    return false
  }

  return true
}

// main.jsx에서 사용
import { validateEnv } from './config/env'

if (validateEnv()) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
} else {
  console.error('Please check your .env file')
}
```

### 3-3. Vercel 환경 변수 업데이트

**방법 1: 웹 대시보드**

```
1. Vercel 프로젝트 → Settings → Environment Variables
2. 변수 클릭 → Edit → 새 값 입력 → Save
3. Deployments → 최신 배포 → Redeploy
```

**방법 2: Vercel CLI**

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 추가
vercel env add VITE_NEW_VARIABLE

# 배포
vercel --prod
```

### ✅ 환경 변수 체크리스트

- [ ] .env 파일을 .gitignore에 추가
- [ ] .env.example 생성 및 GitHub 업로드
- [ ] Vercel에 모든 환경 변수 입력
- [ ] 로컬과 Vercel 환경 변수 일치 확인
- [ ] 환경 변수 검증 함수 추가 (선택)

---

## 🔍 Google Search Console

### 4-1. Search Console 등록

```
1. https://search.google.com/search-console 접속
2. "속성 추가" 클릭
3. "URL 접두어" 선택
4. URL 입력: https://your-domain.com
5. "계속" 클릭
```

### 4-2. 소유권 확인

**방법 1: HTML 메타 태그 (권장)**

```html
<!-- index.html <head>에 추가 -->
<meta name="google-site-verification" content="여기에코드입력" />
```

```bash
# 변경 후 재배포
git add index.html
git commit -m "Add Google Search Console verification"
git push
```

**방법 2: HTML 파일 업로드**

```bash
# public/ 폴더에 파일 추가
# public/google123abc.html

# 재배포
git add public/google123abc.html
git commit -m "Add Google verification file"
git push
```

**소유권 확인**

```
1. Vercel 배포 완료 대기 (1-2분)
2. Search Console로 돌아가기
3. "확인" 버튼 클릭
4. 성공 메시지 확인
```

### 4-3. 사이트맵 제출

**사이트맵 생성**

```bash
# public/sitemap.xml 생성
cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.com/calendar</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.com/report</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.com/about</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://your-domain.com/privacy</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://your-domain.com/terms</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://your-domain.com/faq</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://your-domain.com/guide</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://your-domain.com/contact</loc>
    <lastmod>2024-02-16</lastmod>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

# 재배포
git add public/sitemap.xml
git commit -m "Add sitemap for SEO"
git push
```

**Search Console에서 제출**

```
1. Search Console → 색인 생성 → 사이트맵
2. "새 사이트맵 추가" → sitemap.xml 입력
3. "제출" 클릭
4. 상태: 성공 확인 (몇 시간 소요)
```

### 4-4. robots.txt 설정

```bash
# public/robots.txt 생성
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
EOF

git add public/robots.txt
git commit -m "Add robots.txt"
git push
```

### ✅ Search Console 체크리스트

- [ ] Search Console 속성 추가
- [ ] 소유권 확인 (메타 태그 또는 HTML 파일)
- [ ] sitemap.xml 생성 및 제출
- [ ] robots.txt 생성
- [ ] URL 검사 도구로 색인 확인

---

## 📈 SEO 최적화

### 5-1. 메타 태그 추가

```jsx
// src/components/SEOHead.jsx 개선
import { Helmet } from 'react-helmet-async'

export default function SEOHead({
  title = '스마트 스케줄 - AI 기반 일정 관리',
  description = '채팅으로 일정을 등록하는 AI 스마트 스케줄. 자연어 입력으로 빠르게 캘린더에 일정을 추가하세요.',
  keywords = 'AI 일정 관리, 스마트 캘린더, 채팅 일정, 자연어 파싱, OpenAI, Firebase',
  image = 'https://your-domain.com/og-image.png',
  url = 'https://your-domain.com'
}) {
  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph (페이스북, 카카오톡) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* 모바일 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  )
}
```

### 5-2. 구조화된 데이터 (Schema.org)

```jsx
// src/components/StructuredData.jsx
export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "스마트 스케줄",
    "description": "AI 기반 일정 관리 웹 애플리케이션",
    "url": "https://your-domain.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "screenshot": "https://your-domain.com/screenshot.png"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// index.html <head>에 추가
```

### 5-3. OG 이미지 생성

**도구: Canva 또는 Figma**

```
크기: 1200 x 630 px
내용:
  - 로고
  - "AI 기반 스마트 스케줄"
  - 스크린샷
  - 도메인

저장: public/og-image.png
```

### 5-4. 성능 최적화

**Lighthouse 점수 목표**

```
Performance: 90+ 🟢
Accessibility: 90+ 🟢
Best Practices: 90+ 🟢
SEO: 90+ 🟢
```

**이미지 최적화**

```bash
# WebP 변환
npm install -D vite-plugin-imagemin

# vite.config.js
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      webp: { quality: 80 }
    })
  ]
}
```

### 5-5. Core Web Vitals 개선

**LCP (Largest Contentful Paint) < 2.5s**

```jsx
// 폰트 사전 로드
<link rel="preload" href="/fonts/pretendard.woff2" as="font" crossOrigin />

// 중요 CSS 인라인
<style>
  /* Critical CSS */
</style>
```

**FID (First Input Delay) < 100ms**

```javascript
// 코드 스플리팅
const CalendarView = lazy(() => import('./components/CalendarView'))
const WeeklyReport = lazy(() => import('./components/WeeklyReport'))
```

**CLS (Cumulative Layout Shift) < 0.1**

```css
/* 이미지에 크기 지정 */
img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
```

### ✅ SEO 체크리스트

- [ ] 모든 페이지에 SEOHead 컴포넌트 추가
- [ ] OG 이미지 생성 및 업로드
- [ ] 구조화된 데이터 추가
- [ ] Lighthouse 점수 90+ 달성
- [ ] Core Web Vitals 통과
- [ ] 모바일 친화성 확인

---

## 💰 애드센스 준비

### 6-1. 승인 조건 확인

**필수 체크리스트**

```
✅ 콘텐츠
   - [ ] 15개 이상 페이지 (500자 이상)
   - [ ] 개인정보처리방침
   - [ ] 이용약관
   - [ ] 연락처/문의 페이지
   - [ ] 독창적인 콘텐츠 (복사 금지)

✅ 기술
   - [ ] HTTPS 적용
   - [ ] 모바일 최적화
   - [ ] 빠른 로딩 속도 (<3초)
   - [ ] 404 오류 없음

✅ 사용성
   - [ ] 명확한 내비게이션
   - [ ] 읽기 쉬운 폰트
   - [ ] 접근성 좋음

✅ 법적
   - [ ] 도메인 소유 (선택, vercel.app도 가능)
   - [ ] 만 18세 이상
   - [ ] 정책 위반 없음
```

### 6-2. 애드센스 신청

**1단계: 계정 생성**

```
1. https://www.google.com/adsense 접속
2. "시작하기" 클릭
3. Google 계정 로그인
4. 웹사이트 URL 입력: https://your-domain.com
5. 국가: 대한민국
6. 이용약관 동의
```

**2단계: 사이트 연결**

```html
<!-- index.html <head>에 추가 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-여기에입력"
     crossorigin="anonymous"></script>
```

```bash
# 재배포
git add index.html
git commit -m "Add Google AdSense code"
git push
```

**3단계: 심사 제출**

```
1. 애드센스 대시보드 → "사이트 연결 확인"
2. 코드 삽입 확인됨
3. 심사 제출
4. 1-2주 대기 (평균 7일)
```

### 6-3. 광고 영역 예약

**임시 광고 컴포넌트**

```jsx
// src/components/AdPlaceholder.jsx
export default function AdPlaceholder({ slot, format = 'horizontal' }) {
  return (
    <div className={`
      border-2 border-dashed border-gray-300 rounded-lg
      flex items-center justify-center
      bg-gray-50
      ${format === 'horizontal' ? 'h-24' : 'h-96'}
    `}>
      <p className="text-sm text-gray-500">
        광고 영역 ({slot})
      </p>
    </div>
  )
}
```

**광고 배치 위치**

```jsx
// App.jsx - 권장 위치
function App() {
  return (
    <>
      <Header />

      {/* 상단 배너 (수평) */}
      <AdPlaceholder slot="header-banner" format="horizontal" />

      <div className="flex">
        {/* 좌측 사이드바 (세로) */}
        <aside>
          <AdPlaceholder slot="sidebar-left" format="vertical" />
        </aside>

        {/* 메인 콘텐츠 */}
        <main>
          <Outlet />
        </main>

        {/* 우측 사이드바 (세로) */}
        <aside>
          <AdPlaceholder slot="sidebar-right" format="vertical" />
        </aside>
      </div>

      {/* 하단 배너 (수평) */}
      <AdPlaceholder slot="footer-banner" format="horizontal" />

      <Footer />
    </>
  )
}
```

### 6-4. 승인 후 광고 삽입

**자동 광고 (권장)**

```html
<!-- index.html <head>에 이미 추가됨 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-여기에입력"
     crossorigin="anonymous"></script>
```

**수동 광고**

```jsx
// src/components/GoogleAd.jsx
import { useEffect } from 'react'

export default function GoogleAd({ slot, format = 'auto' }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-여기에입력"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
```

**사용 예시**

```jsx
// 헤더 배너
<GoogleAd slot="1234567890" format="horizontal" />

// 사이드바
<GoogleAd slot="0987654321" format="vertical" />
```

### 6-5. 정책 준수

**금지 사항**

```
❌ 자기 클릭 (본인이 광고 클릭)
❌ 클릭 유도 ("여기 클릭하세요")
❌ 광고 라벨 변경
❌ 성인 콘텐츠
❌ 저작권 침해 콘텐츠
❌ 허위 정보
```

**권장 사항**

```
✅ 자연스러운 광고 배치
✅ 콘텐츠와 광고 구분 명확
✅ 사용자 경험 우선
✅ 모바일 최적화
✅ 빠른 로딩 속도
```

### ✅ 애드센스 체크리스트

- [ ] 승인 조건 모두 충족
- [ ] 애드센스 계정 생성
- [ ] 사이트에 코드 삽입
- [ ] 심사 제출
- [ ] 승인 대기 (1-2주)
- [ ] (승인 후) 광고 컴포넌트 교체
- [ ] 정책 준수 확인

---

## 💸 수익화 전략

### 7-1. 트래픽 증대 전략

**1주차: SNS 마케팅**

```
Instagram:
- 매일 1개 포스팅 (사용법, 팁)
- 해시태그: #일정관리 #AI #생산성 #스케줄
- 스토리 활용

YouTube Shorts:
- 사용법 영상 3개
- 30-60초 짧은 영상
- 자막 필수

TikTok:
- 바이럴 영상 5개
- 재미있는 사용 사례
- 트렌드 활용
```

**2주차: 커뮤니티 홍보**

```
네이버 카페:
- 생산성, 스터디, 직장인 카페
- 유용한 정보 공유 (광고 아님)

Facebook 그룹:
- 대학생, 직장인 그룹
- "이런 앱 만들어봤어요" 형식

Reddit:
- r/productivity
- r/webdev (개발 이야기)
- r/korea (한국인 대상)
```

**3주차: 블로그 포스팅**

```
Naver 블로그:
- "AI 일정 관리 앱 사용 후기"
- "생산성 앱 추천 TOP 5"
- "무료 스케줄 관리 서비스"

Tistory:
- SEO 최적화
- 백링크 구축
- 키워드: "AI 일정 관리", "스마트 캘린더"

Medium:
- 개발 이야기 (영어)
- How I built an AI schedule app
```

**4주차: 협업 및 리뷰**

```
유튜버 협업:
- 생산성 유튜버 컨택
- 리뷰 요청
- 제휴 링크 제공

인플루언서:
- 인스타그램 마이크로 인플루언서
- 무료 체험 제공
- 리뷰 요청
```

### 7-2. 전환율 최적화 (CRO)

**회원가입 전환율 높이기**

```jsx
// 랜딩 페이지 개선
- 명확한 가치 제안 (3초 안에 이해)
- CTA 버튼 강조 ("무료로 시작하기")
- 스크린샷/GIF로 기능 설명
- 소셜 로그인 추가 (Google, 카카오)
```

**활성 사용자 유지**

```javascript
// 이메일 알림 (향후)
- 일정 1시간 전 알림
- 주간 리포트 발송
- 신기능 업데이트 알림

// 푸시 알림 (향후)
- 브라우저 푸시 알림
- 일정 미리 알림
```

### 7-3. 프리미엄 플랜 (향후)

**무료 vs 프리미엄**

| 기능 | 무료 | 프리미엄 ($4.99/월) |
|------|------|---------------------|
| 일정 등록 | 월 30개 | 무제한 |
| AI 파싱 | ✅ | ✅ |
| 캘린더 뷰 | ✅ | ✅ |
| 주간 리포트 | ✅ | ✅ |
| 반복 일정 | ❌ | ✅ |
| 팀 협업 | ❌ | ✅ |
| 외부 캘린더 연동 | ❌ | ✅ |
| AI 시간 추천 | ❌ | ✅ |
| 광고 없음 | ❌ | ✅ |

**결제 시스템**

```
Stripe:
- 월간/연간 구독
- 자동 결제
- 영수증 자동 발송

국내: 토스페이먼츠
- 카드, 계좌이체
- 간편결제
```

### 7-4. 수익 시뮬레이션

**6개월 목표**

| 월 | DAU | 광고 수익 | 프리미엄 (5%) | 총 수익 | 비용 | 순익 |
|----|-----|-----------|---------------|---------|------|------|
| 1 | 50 | $25 | $12 | $37 | $5 | $32 |
| 2 | 100 | $50 | $25 | $75 | $5 | $70 |
| 3 | 200 | $120 | $50 | $170 | $15 | $155 |
| 4 | 400 | $240 | $100 | $340 | $25 | $315 |
| 5 | 600 | $360 | $150 | $510 | $40 | $470 |
| 6 | 1000 | $600 | $250 | $850 | $60 | $790 |

**목표: 6개월 후 월 $790 순익** 🎯

### 7-5. 분석 및 개선

**Google Analytics 이벤트 추적**

```javascript
// src/utils/analytics.js
export function trackEvent(action, category, label) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label
    })
  }
}

// 사용 예시
trackEvent('schedule_create', 'engagement', 'chat')
trackEvent('premium_click', 'conversion', 'pricing_page')
```

**주요 지표 추적**

```
- DAU (일일 활성 사용자)
- 회원가입 전환율
- 일정 등록 횟수
- 광고 CTR (클릭율)
- 프리미엄 전환율
- 이탈률
```

### ✅ 수익화 체크리스트

- [ ] SNS 계정 생성 (Instagram, YouTube, TikTok)
- [ ] 블로그 개설 (Naver, Tistory)
- [ ] Google Analytics 설정
- [ ] 주간 콘텐츠 계획 수립
- [ ] 커뮤니티 가입 및 활동
- [ ] 프리미엄 플랜 설계
- [ ] 결제 시스템 조사 (Stripe, 토스)

---

## ⚡ 성능 최적화

### 8-1. 번들 크기 최적화

**현재 번들 분석**

```bash
# 번들 분석 도구 설치
npm install -D rollup-plugin-visualizer

# vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
}

# 빌드 후 stats.html 열림
npm run build
```

**코드 스플리팅**

```javascript
// App.jsx
import { lazy, Suspense } from 'react'

const CalendarView = lazy(() => import('./components/CalendarView'))
const WeeklyReport = lazy(() => import('./components/WeeklyReport'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/report" element={<WeeklyReport />} />
      </Routes>
    </Suspense>
  )
}
```

### 8-2. 이미지 최적화

```bash
# WebP 변환
npm install -D sharp

# 스크립트 추가
node scripts/convert-images.js
```

```javascript
// scripts/convert-images.js
import sharp from 'sharp'
import { readdirSync } from 'fs'

const images = readdirSync('public/images')

images.forEach(image => {
  sharp(`public/images/${image}`)
    .webp({ quality: 80 })
    .toFile(`public/images/${image.replace(/\.\w+$/, '.webp')}`)
})
```

### 8-3. 캐싱 전략

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 8-4. CDN 최적화

**Vercel CDN 활용**

```
✅ 자동 CDN (Edge Network)
✅ 전세계 100+ 서버
✅ 이미지 자동 최적화
✅ Brotli 압축
```

### ✅ 성능 체크리스트

- [ ] Lighthouse Performance 90+
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Bundle Size < 500KB
- [ ] Time to Interactive < 3s

---

## 🎯 최종 체크리스트

### 배포 전

- [ ] 로컬 테스트 완료 (`npm run build` → `npm run preview`)
- [ ] 환경 변수 확인
- [ ] .gitignore에 .env 추가
- [ ] .env.example 생성

### GitHub

- [ ] 리포지토리 생성
- [ ] README.md 작성
- [ ] 코드 푸시

### Vercel

- [ ] 프로젝트 Import
- [ ] 환경 변수 입력
- [ ] 빌드 성공
- [ ] 배포 URL 확인
- [ ] HTTPS 작동

### SEO

- [ ] Google Search Console 등록
- [ ] sitemap.xml 제출
- [ ] robots.txt 설정
- [ ] 메타 태그 추가
- [ ] OG 이미지 생성

### 애드센스

- [ ] 15개 이상 페이지
- [ ] 개인정보처리방침 + 이용약관
- [ ] 애드센스 계정 생성
- [ ] 코드 삽입
- [ ] 심사 제출

### 수익화

- [ ] SNS 마케팅 시작
- [ ] 블로그 포스팅
- [ ] 커뮤니티 홍보
- [ ] Google Analytics 설정
- [ ] 프리미엄 플랜 설계

---

## 🚀 완료!

축하합니다! 🎉

이제 여러분의 **수익형 AI 스마트 스케줄 앱**이 전세계에 공개되었습니다.

**다음 목표:**

1. **1주차**: DAU 100명 달성
2. **1개월**: 애드센스 승인
3. **3개월**: DAU 500명, 월 $400 수익
4. **6개월**: DAU 1000명, 월 $800 수익

**계속 개선하기:**

- 사용자 피드백 수집
- 새로운 기능 추가
- 성능 최적화
- 마케팅 강화

**행운을 빕니다!** 💰🚀
