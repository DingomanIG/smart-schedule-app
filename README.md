# 스마트 스케줄 (Smart Schedule)

AI 기반 자연어 일정 관리 웹 애플리케이션

AI-powered natural language schedule management web application

---

## 소개 | Introduction

채팅으로 일정을 등록하세요. "내일 오후 3시 팀 회의"처럼 자연스러운 문장을 입력하면 AI가 자동으로 날짜, 시간, 장소를 인식하여 캘린더에 등록합니다.

Register your schedule through chat. Simply type a natural sentence like "Team meeting tomorrow at 3 PM" and AI will automatically recognize the date, time, and location to add it to your calendar.

---

## 주요 기능 | Key Features

- **AI 채팅 일정 등록** - 자연어 입력 → GPT-4o-mini 파싱 → 자동 등록
  **AI Chat Scheduling** - Natural language input → GPT-4o-mini parsing → Auto registration

- **캘린더 뷰** - 월별 일정 조회, 날짜별 상세 확인 및 삭제
  **Calendar View** - Monthly schedule view, detailed view and deletion by date

- **주간 리포트** - 카테고리별 일정 요약 통계
  **Weekly Report** - Schedule summary statistics by category

- **문의하기** - Web3Forms 연동 문의 양식
  **Contact Form** - Web3Forms integrated contact form

- **댓글 시스템** - Giscus 기반 피드백
  **Comment System** - Giscus-based feedback

---

## 기술 스택 | Tech Stack

| 분류 Category | 기술 Technology |
|--------------|----------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Firebase Authentication, Cloud Firestore |
| AI | OpenAI GPT-4o-mini |
| Routing | React Router DOM |
| Icons | Lucide React |

---

## 시작하기 | Getting Started

### 1. 설치 | Installation

```bash
git clone https://github.com/DingomanIG/smart-schedule-app.git
cd smart-schedule-app
npm install
```

### 2. 환경 변수 설정 | Environment Variables

`.env.example`을 복사하여 `.env` 파일을 생성하고 값을 입력하세요.

Copy `.env.example` to create `.env` file and fill in the values.

```bash
cp .env.example .env
```

필수 환경 변수 | Required Environment Variables:
- `VITE_FIREBASE_API_KEY` - Firebase API 키 | Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth 도메인 | Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase 프로젝트 ID | Firebase Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage 버킷 | Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase 메시징 Sender ID | Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID` - Firebase 앱 ID | Firebase App ID
- `VITE_OPENAI_API_KEY` - OpenAI API 키 | OpenAI API Key

### 3. 실행 | Run

```bash
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

Available at `http://localhost:5173`.

---

## 프로젝트 구조 | Project Structure

```
src/
├── components/        # UI 컴포넌트 | UI Components
│   ├── AuthForm.jsx       # 로그인/회원가입 | Login/Signup
│   ├── ChatInterface.jsx  # AI 채팅 인터페이스 | AI Chat Interface
│   ├── CalendarView.jsx   # 캘린더 뷰 | Calendar View
│   ├── WeeklyReport.jsx   # 주간 리포트 | Weekly Report
│   ├── ContactForm.jsx    # 문의 양식 | Contact Form
│   └── GiscusComments.jsx # 댓글 | Comments
├── pages/             # 라우트 페이지 | Route Pages
│   ├── AboutPage.jsx      # 서비스 소개 | About
│   ├── PrivacyPage.jsx    # 개인정보처리방침 | Privacy Policy
│   ├── TermsPage.jsx      # 이용약관 | Terms of Service
│   └── ContactPage.jsx    # 문의하기 | Contact
├── services/          # 외부 서비스 연동 | External Services
│   ├── firebase.js        # Firebase 초기화 | Firebase Init
│   ├── openai.js          # OpenAI API
│   └── schedule.js        # Firestore CRUD
├── hooks/
│   └── useAuth.js         # 인증 훅 (데모 모드 포함) | Auth Hook (with demo mode)
├── App.jsx            # 라우터 + 메인 레이아웃 | Router + Main Layout
├── main.jsx           # 엔트리 포인트 | Entry Point
└── index.css          # 글로벌 스타일 | Global Styles
```

---

## 빌드 | Build

```bash
npm run build    # 프로덕션 빌드 | Production build
npm run preview  # 빌드 미리보기 | Preview build
```

---

## 배포 | Deployment

### Vercel (권장 | Recommended)

1. GitHub에 리포지토리 푸시 | Push repository to GitHub
2. [Vercel](https://vercel.com)에서 Import | Import on Vercel
3. 환경 변수 설정 | Set environment variables
4. Deploy 클릭 | Click Deploy

---

## 라이선스 | License

MIT

---

## 기여 | Contributing

기여는 언제나 환영합니다! Pull Request를 보내주세요.

Contributions are always welcome! Please send a Pull Request.

---

## 문의 | Contact

프로젝트 관련 문의사항은 Issues를 통해 남겨주세요.

For project inquiries, please leave them through Issues.
