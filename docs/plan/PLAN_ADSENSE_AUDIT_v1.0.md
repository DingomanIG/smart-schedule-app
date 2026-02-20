# 애드센스 심사 전 프로젝트 종합 점검 리포트

> 점검일: 2026-02-20
> 점검 범위: 보안, 애드센스 요구사항, SEO/배포 설정

---

## 1. CRITICAL - 즉시 수정 필요

### 1-1. `firebase.js` - Firebase 비활성화 상태

- **위치**: `src/services/firebase.js:16`
- **현상**: `isFirebaseConfigured = false`로 하드코딩되어 있음 (`// TODO: 데모 모드 테스트 후 원복 필요`)
- **영향**: 모든 사용자가 인증 없이 `demo` 유저로 접근. Firestore 작업 비정상
- **조치**: `Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)`로 원복

### 1-2. `api/chat.js` - 서버리스 함수 보안 3중 부재

| 이슈 | 위험 |
|------|------|
| **인증 검증 없음** | 누구든 `/api/chat`에 POST하면 OpenAI API 사용 가능 |
| **Rate Limit 없음** | 악의적 대량 요청 시 API 비용 폭발 |
| **입력 검증 없음** | `req.body`를 그대로 OpenAI에 전달 → 공격자가 `model: "gpt-4o"` 등 고비용 모델 지정 가능 |

- **위치**: `api/chat.js`
- **조치**: Firebase Auth 토큰 검증 + Vercel Edge Middleware rate limit + body 스키마 검증(model 화이트리스트) 추가

### 1-3. 404 페이지 미구현

- **현상**: `App.jsx`에 `<Route path="*">` catch-all 라우트 없음
- **영향**: 존재하지 않는 URL 접근 시 빈 화면 → 애드센스 "사이트 탐색 문제"로 거절 가능
- **조치**: `NotFoundPage.jsx` 생성 + `App.jsx`에 catch-all 라우트 추가

### 1-4. 블로그 링크 대부분 깨짐

- **현상**: `BlogListPage`의 slug와 실제 라우트 불일치
  - BlogListPage 링크: `how-to-use`, `ai-schedule`, `productivity-tips` 등
  - 실제 라우트: `/blog/introduction`, `/blog/features` 등
- **영향**: 블로그 목록 클릭 시 대부분 404 → "깨진 링크" 심사 거절 사유
- **조치**: BlogListPage slug를 실제 라우트와 일치시키거나, 누락 라우트 추가

### 1-5. AdSenseAd.jsx 미완성

- **현상**: 단순 플레이스홀더 상태. 실제 `<ins class="adsbygoogle">` 코드 없음
- **영향**: 심사 시 "사이트에 광고 코드를 찾을 수 없음" 에러 발생
- **조치**: `useEffect` + `adsbygoogle.push({})` 로직 구현. `index.html`에는 이미 스크립트/메타태그 삽입되어 있으므로 컴포넌트만 수정

---

## 2. HIGH - 심사 전 수정 권장

### 2-1. vercel.json 보안 헤더 부재

- **현상**: `headers` 설정 전혀 없음
- **필요 헤더**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`
- **조치**: `vercel.json`에 `headers` 섹션 추가

### 2-2. favicon 파일 없음

- **현상**: `index.html`이 참조하는 `/vite.svg`가 `public/`에 존재하지 않음 → 404 에러
- **조치**: 서비스 고유 favicon 파일(`favicon.ico` 또는 `favicon.svg`) 생성 후 `public/`에 배치

### 2-3. manifest.json 부재

- **현상**: `sw.js`(서비스 워커)는 있으나 `manifest.json` 없음
- **영향**: PWA "홈 화면에 추가" 기능 미작동
- **조치**: `public/manifest.json` 생성 (name, icons, theme_color 등)

### 2-4. 개인정보처리방침 - 쿠키/광고 고지 누락

- **현상**: `PrivacyPage.jsx`에 구글 애드센스 쿠키, DoubleClick 쿠키, 맞춤 광고 관련 안내 없음
- **영향**: 애드센스 필수 요구사항 미충족
- **조치**: "쿠키 및 광고 기술" 섹션 추가 (구글 광고 쿠키, 맞춤 광고 설정, 옵트아웃 안내)

### 2-5. index.html에 og:image 누락

- **현상**: SEO.jsx에서 동적으로 설정하지만, SPA이므로 크롤러가 JS 미실행 시 OG 이미지 누락
- **조치**: `index.html` `<head>`에 `<meta property="og:image" content="https://yschedule.me/og-image.png" />` 추가

### 2-6. JSON-LD 구조화 데이터 부재

- **현상**: `application/ld+json` 스크립트가 프로젝트 전체에 없음
- **영향**: Google 검색 리치 결과(SoftwareApplication, WebSite, Organization 등) 노출 불가
- **조치**: `index.html` 또는 `SEO.jsx`에 WebSite, SoftwareApplication 스키마 추가

---

## 3. MEDIUM - 개선 권장

| # | 항목 | 위치 | 설명 |
|---|------|------|------|
| 3-1 | sitemap.xml `lastmod` 누락 | `public/sitemap.xml` | 크롤러가 페이지 갱신 시점을 알 수 없음 |
| 3-2 | robots.txt `/api/` Disallow 없음 | `public/robots.txt` | API 경로가 크롤링 대상에 포함됨 |
| 3-3 | 빌드 코드 스플리팅 미적용 | `App.jsx` | 20개+ 컴포넌트 동기 import → 초기 로딩 지연 |
| 3-4 | FaqPage 다크모드 미적용 | `src/pages/FaqPage.jsx` | 다른 페이지들은 `dark:` 변형 적용, FAQ만 누락 |
| 3-5 | api/chat.js 환경변수명 | `api/chat.js:6` | 서버 측에서 `VITE_OPENAI_API_KEY` 사용 → `OPENAI_API_KEY`로 분리 권장 |
| 3-6 | About 페이지 운영 주체 정보 없음 | `src/pages/AboutPage.jsx` | 애드센스 심사에서 운영 주체 명확성 중시 |
| 3-7 | apple-touch-icon 부재 | `index.html` | iOS 홈화면 추가 시 아이콘 없음 |
| 3-8 | og:image:width/height 누락 | `src/components/SEO.jsx` | SNS 공유 미리보기 최적화 |
| 3-9 | Vercel 캐시 헤더 미설정 | `vercel.json` | 정적 자산 반복 방문 시 성능 저하 |

---

## 4. LOW - 추후 고려

| # | 항목 | 설명 |
|---|------|------|
| 4-1 | Naver 인증 태그 빈 값 | `index.html` - 사용 안 하면 제거, 사용 시 값 채우기 |
| 4-2 | theme-color 메타태그 | 모바일 브라우저 상단바 색상 커스터마이징 |
| 4-3 | Scroll Restoration | 페이지 전환 시 스크롤 위치 복원 미처리 |
| 4-4 | 블로그 og:type="article" | 블로그 글에 `website` 대신 `article` 적용 |
| 4-5 | resize.html 프로덕션 제외 | 개발용 유틸리티 파일이 배포에 포함됨 |
| 4-6 | useAuth.js 에러 핸들링 | login/register 함수에 try/catch 없음 |
| 4-7 | 비밀번호 정책 | 클라이언트 측 비밀번호 강도 검증 없음 (Firebase 최소 6자에만 의존) |
| 4-8 | twitter:site/creator 누락 | 트위터 계정 연동 안 됨 |

---

## 5. 양호한 항목 (수정 불필요)

| 항목 | 상태 |
|------|------|
| 개인정보처리방침 페이지 | 존재, 내용 충실 (쿠키 조항만 추가 필요) |
| 이용약관 페이지 | 존재, 8개 조항 포함 |
| About 페이지 | 존재, 서비스 설명 충실 |
| FAQ 페이지 | 존재, 4개 카테고리 12개 질문 |
| 문의 페이지 | 존재, Web3Forms 연동 동작 |
| sitemap.xml | 존재, 19개 URL 포함 |
| robots.txt | 존재, 사이트맵 URL 참조 |
| 네비게이션 구조 | 헤더/푸터에 주요 링크 모두 포함 |
| .gitignore | `.env`, `.env.local` 제외됨 |
| .env.example | 모든 값 placeholder, 실제 키 노출 없음 |
| Firebase config 노출 | 설계상 정상 (Firestore Rules로 보호) |
| og-image.png | `public/` 폴더에 존재 |
| ads.txt | AdSense 인증 파일 존재 |
| 블로그 콘텐츠 | 8개 글 + 6개 추가 콘텐츠 페이지 (양 충분) |

---

## 6. 권장 조치 순서

```
Phase 1 - 즉시 (애드센스 심사 차단 이슈)
  ├─ 1. firebase.js isFirebaseConfigured 원복
  ├─ 2. NotFoundPage 생성 + App.jsx catch-all 라우트 추가
  ├─ 3. BlogListPage slug ↔ 라우트 매핑 일치
  ├─ 4. AdSenseAd.jsx 실제 광고 코드 구현
  └─ 5. api/chat.js 인증/rate limit/입력 검증 추가

Phase 2 - 심사 전 (품질 개선)
  ├─ 6. vercel.json 보안 헤더 추가
  ├─ 7. favicon 파일 추가
  ├─ 8. 개인정보처리방침 쿠키/광고 조항 추가
  ├─ 9. index.html og:image + JSON-LD 추가
  └─ 10. manifest.json 생성

Phase 3 - 추가 개선
  ├─ 11. sitemap lastmod + robots.txt /api/ Disallow
  ├─ 12. FaqPage 다크모드
  ├─ 13. 코드 스플리팅 (lazy loading)
  └─ 14. 기타 MEDIUM/LOW 항목
```
