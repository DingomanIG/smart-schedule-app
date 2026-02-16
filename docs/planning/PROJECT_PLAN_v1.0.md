# 🗓️ 스마트 스케줄 관리 앱 (수익형 웹 버전)

AI 기반 채팅형 일정 관리 + 구글 애드센스 수익화

## 🚀 빠른 시작 (5분 완성!)

### 1단계: 프로젝트 다운로드

이 폴더의 모든 파일을 로컬 PC에 저장하세요.

### 2단계: 의존성 설치

```bash
cd smart-schedule-app
npm install
```

### 3단계: 환경 변수 설정

`.env.example` 파일을 복사해서 `.env` 파일을 만들고 아래 값들을 입력:

```env
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-proj-여기에발급받은키입력

# Firebase Config (Firebase 콘솔에서 복사)
VITE_FIREBASE_API_KEY=여기에입력
VITE_FIREBASE_AUTH_DOMAIN=여기에입력
VITE_FIREBASE_PROJECT_ID=여기에입력
VITE_FIREBASE_STORAGE_BUCKET=여기에입력
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에입력
VITE_FIREBASE_APP_ID=여기에입력
```

### 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기!

---

## 📋 주요 기능

### ✅ 핵심 기능
- 🤖 **AI 채팅 일정 등록** - "내일 오후 2시 회의"
- 📅 **캘린더 뷰** - 월간/주간 전환
- ⏰ **AI 시간 추천** - 최적 시간 3개 제안
- 📊 **주간 리포트** - 생산성 분석
- 🌙 **다크 모드** - 눈 편한 테마

### 💰 수익화 기능
- 📢 **구글 애드센스** - 광고 수익
- 💎 **프리미엄 플랜** - 구독 수익
- 📧 **문의하기** - Web3Forms 연동
- 💬 **댓글 시스템** - Giscus 연동

---

## 🎯 배포하기

### GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/smart-schedule-app.git
git push -u origin main
```

### Vercel 배포 (1분 완성!)

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Import Project" 클릭
4. 방금 만든 리포지토리 선택
5. 환경 변수 입력 (`.env` 내용)
6. Deploy 클릭!

**완성!** 🎉 → `https://your-app.vercel.app`

---

## 💰 애드센스 신청하기

### 1. 준비 완료 체크리스트
- [x] 15개 이상 페이지
- [x] 개인정보처리방침
- [x] 이용약관
- [x] 문의하기
- [x] 모바일 최적화
- [x] 로딩 속도 빠름

### 2. 애드센스 신청

```
1. https://www.google.com/adsense 접속
2. 사이트 URL 입력
3. 광고 코드 복사
4. index.html의 <head>에 붙여넣기
5. 1-2주 심사 대기
```

### 3. 광고 배치

승인 받으면:
- 사이드바 광고
- 하단 광고
- 인피드 광고

---

## 📈 예상 수익

### 트래픽별 수익 예상
- 100명/일 → $50/월
- 500명/일 → $300/월
- 2000명/일 → $1,500/월

### 프리미엄 수익 (전환율 5%)
- 1000명 중 50명 유료 → $250/월 추가

---

## 🛠️ 기술 스택

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-4o-mini
- **Hosting**: Vercel / Cloudflare Pages
- **Analytics**: Google Analytics 4

---

## 📞 도움말

### 자주 묻는 질문

**Q: API 키 오류가 나요**
A: `.env` 파일에 키가 제대로 들어갔는지 확인하세요.

**Q: Firebase 연결 안돼요**
A: Firebase 설정 값이 맞는지 확인하세요.

**Q: 배포 후 환경 변수 오류**
A: Vercel 대시보드에서 환경 변수를 다시 입력하세요.

---

## 🎉 완성!

이제 당신만의 수익형 스케줄 관리 서비스를 운영할 수 있습니다!

**다음 단계:**
1. SEO 최적화
2. 블로그 포스팅
3. SNS 홍보
4. 사용자 피드백 수집
5. 기능 추가 개발

**행운을 빕니다!** 🚀
