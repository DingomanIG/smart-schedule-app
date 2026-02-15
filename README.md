# 스마트 스케줄 (Smart Schedule)

AI 기반 자연어 일정 관리 웹 애플리케이션

## 소개

채팅으로 일정을 등록하세요. "내일 오후 3시 팀 회의"처럼 자연스러운 문장을 입력하면 AI가 자동으로 날짜, 시간, 장소를 인식하여 캘린더에 등록합니다.

## 주요 기능

- **AI 채팅 일정 등록** - 자연어 입력 → GPT-4o-mini 파싱 → 자동 등록
- **캘린더 뷰** - 월별 일정 조회, 날짜별 상세 확인 및 삭제
- **주간 리포트** - 카테고리별 일정 요약 통계
- **문의하기** - Web3Forms 연동 문의 양식
- **댓글 시스템** - Giscus 기반 피드백

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Firebase Authentication, Cloud Firestore |
| AI | OpenAI GPT-4o-mini |
| Routing | React Router DOM |
| Icons | Lucide React |

## 시작하기

### 1. 설치

```bash
git clone https://github.com/DingomanIG/smart-schedule-app.git
cd smart-schedule-app
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 값을 입력하세요.

```bash
cp .env.example .env
```

필수 환경 변수:
- `VITE_FIREBASE_API_KEY` - Firebase API 키
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth 도메인
- `VITE_FIREBASE_PROJECT_ID` - Firebase 프로젝트 ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage 버킷
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase 메시징 Sender ID
- `VITE_FIREBASE_APP_ID` - Firebase 앱 ID
- `VITE_OPENAI_API_KEY` - OpenAI API 키

### 3. 실행

```bash
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── components/        # UI 컴포넌트
│   ├── AuthForm.jsx       # 로그인/회원가입
│   ├── ChatInterface.jsx  # AI 채팅 인터페이스
│   ├── CalendarView.jsx   # 캘린더 뷰
│   ├── WeeklyReport.jsx   # 주간 리포트
│   ├── ContactForm.jsx    # 문의 양식
│   └── GiscusComments.jsx # 댓글
├── pages/             # 라우트 페이지
│   ├── AboutPage.jsx      # 서비스 소개
│   ├── PrivacyPage.jsx    # 개인정보처리방침
│   ├── TermsPage.jsx      # 이용약관
│   └── ContactPage.jsx    # 문의하기
├── services/          # 외부 서비스 연동
│   ├── firebase.js        # Firebase 초기화
│   ├── openai.js          # OpenAI API
│   └── schedule.js        # Firestore CRUD
├── hooks/
│   └── useAuth.js         # 인증 훅 (데모 모드 포함)
├── App.jsx            # 라우터 + 메인 레이아웃
├── main.jsx           # 엔트리 포인트
└── index.css          # 글로벌 스타일
```

## 빌드

```bash
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
```

## 라이선스

MIT
