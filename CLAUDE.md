# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트

AI 기반 스마트 스케줄 관리 웹앱. 사용자가 한국어 자연어 채팅으로 일정을 등록하면 OpenAI GPT-4o-mini가 파싱하여 Firebase Firestore에 저장한다. UI 전체 한국어.

## 명령어

```bash
npm run dev      # Vite 개발 서버 (포트 5173, /api/openai → OpenAI API 프록시)
npm run build    # 프로덕션 빌드 (/dist)
npm run preview  # 프로덕션 빌드 미리보기
```

테스트 러너나 린터는 설정되어 있지 않다.

## 아키텍처

**핵심 데이터 흐름:** 사용자가 ChatInterface에 한국어 자연어 입력 → `openai.js:parseSchedule()`이 GPT-4o-mini에 전송 → JSON 응답 파싱 → 카드 UI로 사용자 확인 → `schedule.js`가 Firestore에 저장 → CalendarView가 `refreshKey` prop 증가로 갱신.

**OpenAI API 라우팅:**
- 개발: Vite 프록시가 `/api/openai/v1/chat/completions` → `https://api.openai.com` 으로 재작성 (브라우저에서 키 전송)
- 프로덕션: Vercel 서버리스 함수 `api/chat.js`가 OpenAI로 프록시 (키는 서버 측 보관)

**채팅 액션 타입:** GPT 프롬프트가 `action: "create" | "move" | "update" | "delete"`와 기존 이벤트 조작용 `targetEventId`를 반환. ChatInterface가 색상별 확인 카드(파란=생성, 주황=이동, 빨강=삭제, 보라=수정)를 렌더링하며 사용자 승인 후 Firestore에 저장.

**캘린더 아키텍처:** CalendarView가 3개 하위 뷰(월/주/일)를 관리하고 `monthEvents` 상태를 보유. 한 달치 이벤트를 한 번에 가져온 뒤 선택 날짜별로 로컬 필터링. 월간 뷰에서 드래그앤드롭 이동 지원.

**날짜 파싱 이중 레이어:** GPT가 프롬프트에서 날짜를 파싱한 뒤, `dateParser.js:parseDateFromText()`가 원본 사용자 텍스트를 클라이언트에서 재파싱하여 GPT 날짜 오류를 보정 (`create` 액션만 해당). 프론트엔드 파서가 한국어 상대 날짜(내일, 모레, 글피, X요일)와 오타(모래→모레, X욜→X요일)를 처리.

**인증 흐름:** `useAuth` 훅이 `isFirebaseConfigured`(`firebase.js`)를 확인 — Firebase 환경변수가 없으면 데모 유저(`uid: 'demo'`)를 반환. 유저가 없으면 AuthForm 게이트를 렌더링.

**다크 모드:** `useDarkMode` 훅이 `localStorage('theme')`에 저장, `<html>`에 `dark` 클래스 토글. Tailwind `darkMode: 'class'` 설정.

**라우팅:** React Router v7 플랫 라우트 구조. `/`에 `MainApp` 컴포넌트(인증된 앱). 정적 페이지(`/about`, `/privacy`, `/blog/*` 등)는 `src/pages/` 하위 독립 페이지 컴포넌트.

## 주요 패턴

- **상태 관리:** `useState`만 사용 — 외부 상태 라이브러리 없음. CalendarView 갱신은 `calendarKey` number prop 증가로 트리거.
- **Firestore 타임스탬프:** 모든 날짜는 `Timestamp` 객체로 저장. 표시 시 `.toDate()` 변환. 일관된 `YYYY-MM-DD` 포맷팅은 `toLocalDateStr()` 헬퍼 사용 (UTC 타임존 버그 방지).
- **이벤트 스키마:** `{ userId, title, startTime: Timestamp, endTime: Timestamp|null, category, location, attendees[], createdAt, createdVia: 'chat' }`
- **데모 모드:** Firebase 없이도 앱이 동작 — `useAuth`가 데모 유저를 반환하지만 Firestore 작업은 조용히 실패.
- **스타일링:** Tailwind CSS, 모든 곳에 `dark:` 변형 적용. 기본 색상: `blue-600`. 아이콘은 `lucide-react` 사용.

## 환경 변수

모두 `VITE_` 접두사. 필수: `VITE_OPENAI_API_KEY`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. 선택: `VITE_WEB3FORMS_KEY`, `VITE_GISCUS_*`, `VITE_ADSENSE_CLIENT_ID`. `.env.example` 참고.

## 컨벤션

- 컴포넌트: PascalCase (`ChatInterface.jsx`), 서비스/유틸: camelCase (`schedule.js`)
- 모든 사용자 노출 텍스트는 한국어
- 새 문서는 `docs/` 하위 폴더에 버전 접미사(`_v1.0.md`) 포함
- `docs/`는 개발 전용 — 배포 코드를 넣지 않는다
- UI에 이모지/아이콘 사용을 최대한 배제한다. 예외: 스케줄 도우미(Helper) 영역 또는 화면 최상단 우측 영역에 배치하는 경우에만 허용.

## 작업 규칙

- 구현 전에 반드시 `docs/` 폴더의 관련 기획서를 먼저 읽을 것
- 컴포넌트 생성 시 `docs/prompt/SCHEDULE_HELPER_DEV_GUIDE_v2.0.md`를 참고할 것
- 기획서에 없는 기능은 임의로 추가하지 말 것

## 금지 사항

- 외부 상태 라이브러리(Redux, Zustand 등) 도입 금지
- 기존 컴포넌트 구조를 임의로 리팩토링하지 말 것
- 영어 UI 텍스트 사용 금지(예외 뱃지는 영어로 표기)

## 파일 구조 맵

```
src/
├── App.jsx                          # 메인 앱 (탭 전환, 레이아웃)
├── main.jsx                         # 엔트리 포인트
├── components/
│   ├── CalendarView.jsx             # 캘린더 (월/주/일 뷰 관리)
│   ├── WeekView.jsx                 # 주간 뷰
│   ├── DayView.jsx                  # 일간 뷰
│   ├── ChatInterface.jsx            # 채팅 + 도우미 트리거 허브
│   ├── ScheduleCard.jsx             # 채팅 확인 카드 (create/move/update/delete)
│   ├── HelperSelector.jsx           # 도우미 선택 드롭다운
│   ├── BatchConfirmCard.jsx         # 일상 도우미 배치 카드 (green)
│   ├── PetCareCard.jsx              # 펫 케어 배치 카드 (teal)
│   ├── WorkScheduleCard.jsx         # 업무 도우미 배치 카드 (indigo)
│   ├── ChildcareCard.jsx            # 육아 도우미 배치 카드 (pink)
│   ├── DailyScheduleView.jsx        # 일상/펫 전용 뷰 (듀얼 모드)
│   ├── WorkScheduleView.jsx         # 업무 전용 뷰
│   ├── ChildcareScheduleView.jsx    # 육아 전용 뷰
│   ├── MajorEventsView.jsx          # 행사 전용 뷰
│   ├── AuthForm.jsx                 # 로그인/회원가입
│   ├── LanguageToggle.jsx           # 한/영 전환
│   ├── WeeklyReport.jsx             # 주간 리포트
│   ├── NotificationSettings.jsx     # 알림 설정
│   ├── ErrorBoundary.jsx            # 에러 바운더리
│   ├── SEO.jsx                      # SEO 메타 태그
│   ├── ContactForm.jsx              # 문의 폼
│   ├── AdSenseAd.jsx                # 광고
│   └── GiscusComments.jsx           # 댓글
├── data/
│   ├── koreanHolidays.js            # 한국 공휴일 데이터
│   ├── petCareDefaults.js           # 펫 케어 기본값/스타일
│   ├── workDefaults.js              # 업무 카테고리 스타일
│   └── childcareDefaults.js         # 육아 카테고리 스타일/월령 데이터
├── services/
│   ├── firebase.js                  # Firebase 초기화
│   ├── helperProfile.js             # 도우미 프로필 CRUD
│   ├── openai.js                    # GPT 호출 (parseSchedule, generateDailySchedule 등)
│   └── schedule.js                  # Firestore 이벤트 CRUD (addBatchEvents 등)
├── hooks/
│   ├── useAuth.js                   # 인증 훅
│   ├── useDarkMode.js               # 다크 모드 훅
│   ├── useLanguage.jsx              # i18n 훅
│   └── useNotifications.js          # 알림 훅
├── utils/
│   ├── dateParser.js                # 한국어 날짜 파싱
│   ├── helperParser.js              # 도우미 트리거/파서
│   └── lunarConverter.js            # 음력 변환
├── locales/
│   ├── ko.js                        # 한국어
│   └── en.js                        # 영어
└── pages/                           # 정적 페이지 (라우터)
    ├── AboutPage.jsx
    ├── PrivacyPage.jsx
    ├── FaqPage.jsx
    └── blog/                        # 블로그 글

docs/
├── README.md                        # docs 폴더 사용법 안내
├── design/
│   ├── design-tokens.md             # 색상, 간격, 폰트 규칙
│   └── ui-patterns.md               # 반복되는 UI 패턴 정리
├── log/
│   └── changelog.md                 # 주요 변경사항 기록
├── plan/                            # 기획 (인간용)
│   ├── feature-list.md              # 기능 목록
│   ├── ideas-backlog.md             # 아이디어 백로그
│   ├── roadmap.md                   # 로드맵
│   ├── PLAN_DEPLOYMENT_CHECKLIST_v1.0.md  # 배포 체크리스트
│   ├── PLAN_IMPROVEMENT_IDEAS_v1.1.md     # 개선 아이디어
│   ├── PLAN_TODO_v1.0.md                  # TODO
│   ├── 버스.md                      # 버스 관련 메모
│   ├── helper/                      # 도우미별 기획서
│   │   ├── PLAN_CHILDCARE_SCHEDULE_HELPER_v1.0.md
│   │   ├── PLAN_DIET_SCHEDULE_HELPER_v1.0.md
│   │   ├── PLAN_GAME_SCHEDULE_HELPER_v1.0.md
│   │   ├── PLAN_MAJOR_EVENTS_SCHEDULE_HELPER_v1.0.md
│   │   ├── PLAN_PET_CARE_SCHEDULE_HELPER_v1.0.md
│   │   ├── PLAN_SPORTS_SCHEDULE_HELPER_v1.0.md
│   │   └── PLAN_WORK_SCHEDULE_HELPER_v1.0.md
│   └── persona/
│       └── PLAN_AI_PERSONA_FEATURE_v1.0.md
└── prompt/                                  # 구현 프롬프트 (AI용)
    ├── MASTER_GUIDE_v1.0.md               # 마스터 가이드
    ├── DEVELOPMENT_WORKFLOW_v1.0.md        # 개발 워크플로우
    └── SCHEDULE_HELPER_DEV_GUIDE_v2.0.md  # 도우미 개발 가이드
```
