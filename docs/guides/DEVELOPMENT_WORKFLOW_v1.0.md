# 🔧 스마트 스케줄 개발 워크플로우

> **Claude Code와 함께하는 단계별 개발 가이드**
>
> 이 문서는 Phase 1부터 8까지 상세한 개발 절차를 제공합니다.

---

## 📋 목차

1. [Phase 1: 기본 구조](#phase-1-기본-구조-day-1---4시간)
2. [Phase 2: Firebase 연동](#phase-2-firebase-연동-day-1---3시간)
3. [Phase 3: OpenAI 연동](#phase-3-openai-연동-day-2---4시간)
4. [Phase 4: 일정 CRUD](#phase-4-일정-crud-day-2---3시간)
5. [Phase 5: 캘린더 뷰](#phase-5-캘린더-뷰-day-3---5시간)
6. [Phase 6: 외부 서비스](#phase-6-외부-서비스-day-3---2시간)
7. [Phase 7: 애드센스 준비](#phase-7-애드센스-준비-day-4---4시간)
8. [Phase 8: 배포](#phase-8-배포-day-4---1시간)
9. [트러블슈팅](#-트러블슈팅)

---

## Phase 1: 기본 구조 (Day 1 - 4시간)

### 🎯 목표

- 3-탭 레이아웃 완성 (채팅, 캘린더, 리포트)
- 기본 UI 컴포넌트 생성
- Tailwind CSS 설정
- 모바일 반응형 확인

### 📁 생성할 파일

```
src/
├── App.jsx                      # 메인 앱 (라우터 + 레이아웃)
├── main.jsx                     # 엔트리 포인트
├── index.css                    # Tailwind 설정
└── components/
    ├── ChatInterface.jsx        # 채팅 UI
    ├── CalendarView.jsx         # 캘린더 뷰
    └── WeeklyReport.jsx         # 주간 리포트
```

### 🤖 Claude Code 명령어

```bash
# 1-1. 프로젝트 초기 설정
claude-code "React + Vite 프로젝트를 생성하고 Tailwind CSS를 설정해줘.
package.json에 필요한 의존성을 추가해줘:
- firebase
- openai
- lucide-react
- react-calendar
- react-router-dom
- recharts
- date-fns
- react-helmet-async"

# 1-2. 기본 레이아웃 생성
claude-code "src/App.jsx를 만들어줘.
- React Router로 3개 탭 라우팅 (/, /calendar, /report)
- Header: 로고 + 탭 버튼
- Footer: 저작권 정보
- Tailwind CSS로 최소한의 스타일링
- 모바일 반응형 (sm, md, lg 브레이크포인트)"

# 1-3. 채팅 UI 기본 구조
claude-code "src/components/ChatInterface.jsx를 만들어줘.
- 메시지 리스트 영역 (스크롤 가능)
- 입력창 + 전송 버튼 (하단 고정)
- 사용자/AI 메시지 구분 (우측/좌측 정렬)
- useState로 메시지 배열 관리
- 초기 메시지: '안녕하세요! 일정을 말씀해주세요'"

# 1-4. 캘린더 기본 구조
claude-code "src/components/CalendarView.jsx를 만들어줘.
- 월간 캘린더 placeholder
- '캘린더 뷰 (준비 중)' 텍스트
- 나중에 react-calendar를 추가할 예정"

# 1-5. 주간 리포트 기본 구조
claude-code "src/components/WeeklyReport.jsx를 만들어줘.
- '주간 리포트 (준비 중)' 텍스트
- 나중에 recharts를 추가할 예정"
```

### ✅ 체크포인트

**로컬 테스트**
```bash
npm run dev
# http://localhost:5173 접속
```

**확인 사항**
- [ ] 3개 탭이 모두 표시되는가?
- [ ] 탭 전환이 되는가?
- [ ] 채팅 입력창이 보이는가?
- [ ] 모바일 화면에서도 잘 보이는가? (개발자 도구 → 반응형 모드)

**예상 결과**

```
✅ Header
   - 로고 "스마트 스케줄"
   - 탭: [채팅] [캘린더] [리포트]

✅ ChatInterface
   - AI 메시지: "안녕하세요! 일정을 말씀해주세요"
   - 입력창 + 전송 버튼

✅ Footer
   - "© 2024 스마트 스케줄. All rights reserved."
```

---

## Phase 2: Firebase 연동 (Day 1 - 3시간)

### 🎯 목표

- Firebase 프로젝트 생성
- Authentication 설정 (이메일/비밀번호)
- Firestore 초기화
- 로그인/회원가입 UI
- 데모 모드 구현 (Firebase 없이도 작동)

### 📁 생성할 파일

```
src/
├── services/
│   ├── firebase.js              # Firebase 초기화
│   └── schedule.js              # Firestore CRUD
├── hooks/
│   └── useAuth.js               # 인증 훅 (데모 모드 포함)
└── components/
    └── AuthForm.jsx             # 로그인/회원가입
```

### 🔥 Firebase 설정 (수동)

**1. Firebase 프로젝트 생성**

```
1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: smart-schedule-app
4. Google Analytics: 사용 (선택)
5. 프로젝트 생성 완료 대기
```

**2. 웹 앱 등록**

```
1. 프로젝트 개요 → "웹 앱 추가" (</> 아이콘)
2. 앱 닉네임: Smart Schedule Web
3. Firebase Hosting: 체크 안함
4. 앱 등록
5. Firebase 설정 코드 복사 (나중에 .env에 입력)
```

**3. Authentication 활성화**

```
1. 좌측 메뉴 → Authentication
2. "시작하기" 클릭
3. 로그인 방법 → 이메일/비밀번호 활성화
4. (선택) Google 로그인도 활성화
```

**4. Firestore 생성**

```
1. 좌측 메뉴 → Firestore Database
2. "데이터베이스 만들기" 클릭
3. 위치: asia-northeast3 (서울)
4. 보안 규칙: 테스트 모드로 시작 (나중에 변경)
5. 사용 설정 완료
```

**5. 환경 변수 설정**

```bash
# .env 파일 생성
cp .env.example .env
```

```env
# .env 파일 편집
VITE_FIREBASE_API_KEY=AIzaSy... (Firebase 콘솔에서 복사)
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 🤖 Claude Code 명령어

```bash
# 2-1. Firebase 서비스 생성
claude-code "src/services/firebase.js를 만들어줘.
- Firebase 초기화 (환경변수 사용)
- Authentication, Firestore export
- isFirebaseConfigured 가드 함수 추가
- 환경변수가 없어도 에러 안나게"

# 2-2. 인증 훅 생성 (데모 모드 포함)
claude-code "src/hooks/useAuth.js를 만들어줘.
- Firebase Auth 상태 관리
- Firebase 미설정 시 데모 모드 (uid: 'demo')
- 로그인/로그아웃/회원가입 함수
- 로딩 상태 관리"

# 2-3. 로그인/회원가입 폼
claude-code "src/components/AuthForm.jsx를 만들어줘.
- 이메일/비밀번호 입력
- 로그인/회원가입 탭 전환
- 에러 메시지 표시 (한국어)
- Tailwind로 깔끔한 폼 스타일
- Firebase 에러 코드를 한국어로 변환"

# 2-4. App.jsx에 인증 가드 추가
claude-code "src/App.jsx를 수정해줘.
- useAuth 훅 사용
- 로그인 안되면 AuthForm 표시
- 로그인되면 메인 UI 표시
- 로딩 중 스피너 표시"

# 2-5. Firestore CRUD 기본 함수
claude-code "src/services/schedule.js를 만들어줘.
- createEvent(userId, eventData)
- getEvents(userId, startDate, endDate)
- updateEvent(eventId, updates)
- deleteEvent(eventId)
- 각 함수에 try-catch 에러 핸들링"
```

### ✅ 체크포인트

**Firebase 콘솔 확인**

```bash
1. Authentication → Users 탭
   → 회원가입 후 사용자가 보이는가?

2. Firestore Database → Data 탭
   → events, chat_messages 컬렉션 생성 확인 (아직 데이터 없음)
```

**로컬 테스트**

```bash
npm run dev
```

**확인 사항**
- [ ] 로그인 화면이 보이는가?
- [ ] 회원가입이 되는가?
- [ ] 로그인이 되는가?
- [ ] 로그인 후 채팅 화면이 보이는가?
- [ ] Firebase 콘솔에서 사용자가 보이는가?
- [ ] 데모 모드가 작동하는가? (.env 없이도 실행)

**예상 결과**

```
✅ .env 있을 때
   - Firebase 정상 연동
   - 실제 회원가입/로그인 가능

✅ .env 없을 때
   - 데모 모드 작동
   - uid: 'demo'로 로그인 (Firebase 없이)
```

---

## Phase 3: OpenAI 연동 (Day 2 - 4시간)

### 🎯 목표

- OpenAI API 설정
- 자연어 → JSON 파싱 함수
- 채팅에서 일정 파싱 연동
- 확인 UI 추가

### 📁 생성할 파일

```
src/
└── services/
    └── openai.js                # OpenAI API
```

### 🔑 OpenAI API 키 발급 (수동)

```
1. https://platform.openai.com 접속
2. API Keys → Create new secret key
3. 키 이름: Smart Schedule App
4. 권한: All (또는 Chat 모델만)
5. 생성 후 키 복사 (한 번만 보임!)
6. .env에 추가
```

```env
# .env에 추가
VITE_OPENAI_API_KEY=sk-proj-여기에입력
```

**💰 크레딧 충전**

```
1. Billing → Add payment method
2. 신용카드 등록
3. $5 충전 (약 1000회 요청 가능)
```

### 🤖 Claude Code 명령어

```bash
# 3-1. OpenAI 서비스 생성
claude-code "src/services/openai.js를 만들어줘.
- OpenAI 클라이언트 초기화
- dangerouslyAllowBrowser: true 설정
- parseSchedule(userMessage) 함수 구현
- 시스템 프롬프트: 일정 파싱 전문가
- 응답 형식: JSON { date, time, title, duration, location, attendees }
- 현재 날짜를 프롬프트에 포함
- '내일', '다음주 월요일' 등을 실제 날짜로 변환
- 에러 핸들링 (try-catch)"

# 3-2. 채팅에 파싱 기능 추가
claude-code "src/components/ChatInterface.jsx를 수정해줘.
- handleSend에서 parseSchedule 호출
- 파싱 중 로딩 표시
- 파싱 성공 → AI 응답에 일정 카드 표시
- 일정 카드: 날짜, 시간, 제목, 위치 표시
- 확인/수정 버튼 추가 (아직 동작 안함)
- 파싱 실패 → 재시도 요청 메시지"

# 3-3. 에러 처리 개선
claude-code "src/services/openai.js에 에러 핸들링을 추가해줘.
- API 키 없을 때 → 명확한 에러 메시지
- Rate limit 초과 → 재시도 안내
- JSON 파싱 실패 → null 반환
- 네트워크 오류 → 재시도 버튼"
```

### 🧪 테스트 케이스

**기본 파싱 테스트**

| 입력 | 예상 결과 |
|------|-----------|
| "내일 오후 2시 회의" | `{ date: "2024-02-17", time: "14:00", title: "회의" }` |
| "다음주 월요일 10시 팀 미팅" | `{ date: "2024-02-19", time: "10:00", title: "팀 미팅" }` |
| "2월 20일 3시 병원" | `{ date: "2024-02-20", time: "15:00", title: "병원" }` |
| "매일 아침 9시 운동" | `{ date: "2024-02-17", time: "09:00", title: "운동" }` |

**엣지 케이스 테스트**

| 입력 | 예상 동작 |
|------|-----------|
| "회의" (날짜/시간 없음) | AI가 날짜/시간 물어봄 |
| "asdfasdf" (무의미) | 파싱 불가 → 재입력 요청 |
| "오늘 종일 워크샵" | `{ date: "2024-02-16", time: null }` |

### ✅ 체크포인트

**로컬 테스트**

```bash
npm run dev
```

**확인 사항**
- [ ] "내일 오후 2시 회의" 입력 → 올바른 JSON 파싱
- [ ] 파싱 결과가 카드 형태로 표시
- [ ] 날짜/시간이 정확한가?
- [ ] 확인 버튼이 보이는가? (아직 동작 안함)
- [ ] 에러 시 재시도 안내가 나오는가?

**콘솔 확인**

```javascript
// 개발자 도구 → Console에서 확인
parseSchedule("내일 오후 2시 회의")
// 출력:
{
  date: "2024-02-17",
  time: "14:00",
  title: "회의",
  duration: 60,
  location: "",
  attendees: []
}
```

**예상 결과**

```
✅ 사용자 입력: "내일 오후 2시 회의"

✅ AI 응답:
   ┌────────────────────────┐
   │ 📅 2024-02-17         │
   │ ⏰ 14:00              │
   │ 📝 회의               │
   │                       │
   │ [확인] [수정]         │
   └────────────────────────┘
```

---

## Phase 4: 일정 CRUD (Day 2 - 3시간)

### 🎯 목표

- Firestore에 일정 저장
- 채팅에서 "확인" 버튼 → 저장
- 일정 수정/삭제 기능
- 실시간 동기화

### 📁 수정할 파일

```
src/
├── services/schedule.js         # CRUD 함수 완성
└── components/
    └── ChatInterface.jsx        # 저장 기능 연동
```

### 🤖 Claude Code 명령어

```bash
# 4-1. Firestore CRUD 완성
claude-code "src/services/schedule.js를 완성해줘.
- createEvent: Firestore에 일정 저장, createdAt, userId 추가
- getEvents: 날짜 범위로 조회, orderBy startTime
- updateEvent: 부분 업데이트 가능
- deleteEvent: 소프트 삭제 (deleted: true) 또는 하드 삭제
- 모든 함수에 에러 핸들링"

# 4-2. 채팅에서 일정 저장
claude-code "src/components/ChatInterface.jsx를 수정해줘.
- 확인 버튼 클릭 → createEvent 호출
- 저장 성공 → '일정이 등록되었습니다' 메시지
- 저장 실패 → 에러 메시지 표시
- 로딩 중 버튼 비활성화
- 저장 후 캘린더 탭으로 이동 (선택)"

# 4-3. 일정 수정 UI
claude-code "일정 카드에 수정 기능을 추가해줘.
- 수정 버튼 → 인라인 편집 모드
- 날짜, 시간, 제목 수정 가능
- 저장 → updateEvent 호출
- 취소 → 원래대로 복원"

# 4-4. 일정 삭제 확인
claude-code "일정 삭제에 확인 다이얼로그를 추가해줘.
- 삭제 버튼 → '정말 삭제하시겠습니까?' 확인
- 확인 → deleteEvent 호출
- 삭제 성공 → UI에서 제거
- 취소 → 아무 동작 안함"
```

### 📊 Firestore 데이터 구조

**events 컬렉션**

```javascript
{
  id: "evt_123abc",              // 자동 생성 ID
  userId: "user_456def",         // 사용자 ID
  title: "회의",                 // 일정 제목
  startTime: Timestamp,          // 시작 시간
  endTime: Timestamp,            // 종료 시간
  duration: 60,                  // 분 단위
  location: "회의실 A",          // 장소
  attendees: ["홍길동", "김철수"], // 참석자
  category: "meeting",           // 카테고리
  createdAt: Timestamp,          // 생성 시간
  createdVia: "chat",            // 생성 방법 (chat, calendar, manual)
  deleted: false                 // 삭제 여부 (소프트 삭제)
}
```

**chat_messages 컬렉션**

```javascript
{
  id: "msg_789ghi",              // 자동 생성 ID
  userId: "user_456def",         // 사용자 ID
  role: "user",                  // user | assistant
  content: "내일 오후 2시 회의",  // 메시지 내용
  timestamp: Timestamp,          // 전송 시간
  parsed: {                      // 파싱 결과 (assistant 메시지만)
    date: "2024-02-17",
    time: "14:00",
    title: "회의"
  }
}
```

### ✅ 체크포인트

**Firestore 확인**

```bash
1. Firebase 콘솔 → Firestore Database
2. events 컬렉션 → 저장된 일정 확인
3. 필드 값이 올바른가?
   - userId: 현재 사용자 ID
   - startTime: Timestamp 형식
   - createdVia: "chat"
```

**로컬 테스트**

```bash
npm run dev
```

**확인 사항**
- [ ] "내일 오후 2시 회의" 입력 → 확인 → Firestore 저장
- [ ] Firebase 콘솔에서 데이터 확인
- [ ] 일정 수정이 되는가?
- [ ] 일정 삭제가 되는가?
- [ ] 삭제 확인 다이얼로그가 나오는가?

**예상 결과**

```
✅ 일정 저장 흐름:
   1. 사용자: "내일 오후 2시 회의"
   2. AI 파싱 → 일정 카드 표시
   3. 사용자: [확인] 클릭
   4. Firestore 저장
   5. "일정이 등록되었습니다" 메시지
   6. Firebase 콘솔에서 확인 가능
```

---

## Phase 5: 캘린더 뷰 (Day 3 - 5시간)

### 🎯 목표

- react-calendar 라이브러리 설치
- 월간 캘린더 표시
- 일정이 있는 날짜에 점 표시
- 날짜 클릭 → 일정 목록 표시
- 일정 클릭 → 상세보기/수정/삭제

### 📁 수정할 파일

```
src/
└── components/
    └── CalendarView.jsx         # react-calendar 연동
```

### 🤖 Claude Code 명령어

```bash
# 5-1. react-calendar 설치
npm install react-calendar date-fns

# 5-2. 캘린더 기본 구현
claude-code "src/components/CalendarView.jsx를 완성해줘.
- react-calendar 사용
- 현재 월의 일정 불러오기 (getEvents)
- 일정이 있는 날짜에 파란 점 표시
- 날짜 클릭 → 해당 날짜 일정 목록 표시
- Tailwind로 깔끔한 스타일
- date-fns로 날짜 포맷팅"

# 5-3. 일정 목록 UI
claude-code "CalendarView에 일정 목록을 추가해줘.
- 날짜 클릭 → 우측/하단에 일정 목록 표시
- 각 일정: 시간, 제목, 위치 표시
- 일정 클릭 → 상세보기 모달
- 모바일: 하단 시트로 표시"

# 5-4. 일정 상세보기 모달
claude-code "일정 상세보기 모달을 만들어줘.
- 제목, 날짜, 시간, 위치, 참석자 표시
- 수정/삭제 버튼
- ESC 키로 닫기
- 모달 외부 클릭 → 닫기
- Tailwind로 중앙 배치"

# 5-5. 일정 수정/삭제
claude-code "상세보기 모달에서 수정/삭제가 되게 해줘.
- 수정 → 인라인 편집 또는 수정 모달
- 삭제 → 확인 후 삭제
- 변경사항 즉시 캘린더에 반영
- Firestore 업데이트"
```

### 🎨 캘린더 커스텀 스타일

```css
/* src/index.css에 추가 */

/* react-calendar 기본 스타일 */
.react-calendar {
  @apply border border-gray-200 rounded-lg p-4;
}

/* 날짜 타일 */
.react-calendar__tile {
  @apply p-2 text-center rounded hover:bg-blue-50;
}

/* 오늘 날짜 */
.react-calendar__tile--now {
  @apply bg-blue-100 font-bold;
}

/* 선택된 날짜 */
.react-calendar__tile--active {
  @apply bg-blue-600 text-white;
}

/* 일정이 있는 날짜 (점 표시) */
.has-events::after {
  content: '';
  @apply block w-1 h-1 bg-blue-600 rounded-full mx-auto mt-1;
}
```

### ✅ 체크포인트

**로컬 테스트**

```bash
npm run dev
# 캘린더 탭으로 이동
```

**확인 사항**
- [ ] 월간 캘린더가 표시되는가?
- [ ] 일정이 있는 날짜에 점이 보이는가?
- [ ] 날짜 클릭 → 일정 목록 표시
- [ ] 일정 클릭 → 상세보기 모달
- [ ] 모달에서 수정/삭제가 되는가?
- [ ] 변경사항이 즉시 반영되는가?
- [ ] 모바일에서도 잘 보이는가?

**예상 결과**

```
✅ 캘린더 화면:
   ┌────────────────────────────┐
   │   2024년 2월              │
   │                           │
   │ 일 월 화 수 목 금 토       │
   │              1  2  3       │
   │  4  5  6  7  8  9 10       │
   │ 11 12 13 14 15 16 17•      │  ← 17일에 점
   │ 18 19 20 21 22 23 24       │
   │ 25 26 27 28 29            │
   └────────────────────────────┘

✅ 날짜 클릭 (17일):
   ┌────────────────┐
   │ 2024-02-17    │
   │               │
   │ 14:00 회의    │
   │ 16:00 미팅    │
   └────────────────┘
```

---

## Phase 6: 외부 서비스 (Day 3 - 2시간)

### 🎯 목표

- Web3Forms 연동 (문의하기)
- Giscus 연동 (댓글)
- 폼 검증 및 에러 처리

### 📁 생성할 파일

```
src/
├── pages/
│   └── ContactPage.jsx          # 문의 페이지
└── components/
    ├── ContactForm.jsx          # Web3Forms
    └── GiscusComments.jsx       # Giscus
```

### 🔑 Web3Forms 설정 (수동)

```
1. https://web3forms.com 접속
2. 이메일 입력 (문의 내용을 받을 이메일)
3. Access Key 발급받기
4. .env에 추가
```

```env
# .env에 추가
VITE_WEB3FORMS_ACCESS_KEY=여기에입력
```

### 🤖 Claude Code 명령어

```bash
# 6-1. 문의하기 폼 생성
claude-code "src/components/ContactForm.jsx를 만들어줘.
- FormData 방식으로 Web3Forms에 전송
- 이름, 이메일, 제목, 내용 입력 필드
- 필수 항목 검증
- 전송 중 로딩 표시
- 성공/실패 메시지 표시
- Tailwind로 깔끔한 폼 스타일"

# 6-2. 문의 페이지 생성
claude-code "src/pages/ContactPage.jsx를 만들어줘.
- ContactForm 컴포넌트 포함
- 페이지 제목: '문의하기'
- 안내 문구: '궁금하신 점을 남겨주세요'
- 반응형 레이아웃"

# 6-3. Giscus 댓글 컴포넌트
claude-code "src/components/GiscusComments.jsx를 만들어줘.
- Giscus 스크립트 동적 삽입
- GitHub Discussions 기반
- 다크모드 지원
- useEffect로 마운트 시 로드"

# 6-4. App.jsx에 라우트 추가
claude-code "src/App.jsx에 문의 페이지 라우트를 추가해줘.
- /contact → ContactPage
- Footer에 문의하기 링크 추가"
```

### 🎨 Giscus 설정 (수동)

```
1. https://giscus.app 접속
2. GitHub 리포지토리 입력 (예: username/smart-schedule-app)
3. Discussion 카테고리: General
4. 테마: preferred_color_scheme (자동 다크모드)
5. 설정 코드 복사
```

```jsx
// GiscusComments.jsx 설정 예시
<script
  src="https://giscus.app/client.js"
  data-repo="your-username/smart-schedule-app"
  data-repo-id="R_여기에입력"
  data-category="General"
  data-category-id="DIC_여기에입력"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="preferred_color_scheme"
  data-lang="ko"
  crossorigin="anonymous"
  async
></script>
```

### ✅ 체크포인트

**Web3Forms 테스트**

```bash
1. 로컬 서버 실행: npm run dev
2. /contact 페이지 접속
3. 폼 작성 후 전송
4. 등록한 이메일 수신함 확인
```

**Giscus 테스트**

```bash
1. About 페이지에 댓글 컴포넌트 추가
2. GitHub 로그인 (자동)
3. 테스트 댓글 작성
4. GitHub Discussions에서 확인
```

**확인 사항**
- [ ] 문의 폼이 작동하는가?
- [ ] 이메일이 수신되는가?
- [ ] 필수 항목 검증이 되는가?
- [ ] 댓글 작성이 되는가?
- [ ] 모바일에서도 잘 보이는가?

**예상 결과**

```
✅ 문의하기 폼:
   - 이름, 이메일, 제목, 내용 입력
   - [전송] 클릭
   - "문의가 전송되었습니다" 메시지
   - 이메일 수신함에 도착

✅ Giscus 댓글:
   - GitHub 로그인 버튼
   - 댓글 작성란
   - 기존 댓글 목록
```

---

## Phase 7: 애드센스 준비 (Day 4 - 4시간)

### 🎯 목표

- 필수 페이지 15개 이상 생성
- 각 페이지 500자 이상 콘텐츠
- SEO 메타 태그 추가
- 광고 영역 예약

### 📁 생성할 파일

```
src/
├── pages/
│   ├── AboutPage.jsx            # 서비스 소개
│   ├── PrivacyPage.jsx          # 개인정보처리방침
│   ├── TermsPage.jsx            # 이용약관
│   ├── FaqPage.jsx              # FAQ
│   ├── GuidePage.jsx            # 사용 가이드
│   ├── PricingPage.jsx          # 요금제 (향후)
│   ├── BlogPage.jsx             # 블로그 (선택)
│   └── ...
└── components/
    └── SEOHead.jsx              # react-helmet-async
```

### 🤖 Claude Code 명령어

```bash
# 7-1. SEO 컴포넌트 생성
claude-code "src/components/SEOHead.jsx를 만들어줘.
- react-helmet-async 사용
- title, description, keywords, og:image 설정
- 각 페이지별로 커스터마이징 가능
- Google Search Console 인증 메타 태그"

# 7-2. 서비스 소개 페이지
claude-code "src/pages/AboutPage.jsx를 만들어줘.
- 서비스 소개 (최소 500자)
- 주요 기능 3가지
- 왜 스마트 스케줄인가?
- 팀 소개 (선택)
- SEOHead 컴포넌트 사용"

# 7-3. 개인정보처리방침
claude-code "src/pages/PrivacyPage.jsx를 만들어줘.
- 개인정보 수집 항목 (이메일, 이름)
- 수집 목적 (서비스 제공)
- 보유 기간 (회원 탈퇴 시까지)
- 제3자 제공 여부 (없음)
- Firebase, OpenAI 언급
- 최소 1000자 이상"

# 7-4. 이용약관
claude-code "src/pages/TermsPage.jsx를 만들어줘.
- 서비스 이용 조건
- 금지 사항
- 저작권 및 지적재산권
- 면책 조항
- 최소 1000자 이상"

# 7-5. FAQ 페이지
claude-code "src/pages/FaqPage.jsx를 만들어줘.
- 자주 묻는 질문 10개 이상
- 아코디언 스타일 (클릭하면 펼쳐짐)
- 카테고리별 분류 (기능, 결제, 기술 지원)
- 검색 기능 (선택)"

# 7-6. 사용 가이드
claude-code "src/pages/GuidePage.jsx를 만들어줘.
- 1단계: 회원가입
- 2단계: 채팅으로 일정 등록
- 3단계: 캘린더 확인
- 스크린샷 또는 GIF (선택)
- 최소 700자"

# 7-7. 요금제 페이지 (향후)
claude-code "src/pages/PricingPage.jsx를 만들어줘.
- 무료 플랜: 기본 기능
- 프리미엄 플랜: $4.99/월
- 기능 비교 표
- 결제 버튼 (아직 동작 안함)"

# 7-8. Footer에 링크 추가
claude-code "App.jsx의 Footer를 수정해줘.
- 서비스 소개, 이용약관, 개인정보처리방침 링크
- FAQ, 사용 가이드 링크
- 저작권 정보"
```

### 📋 페이지 체크리스트

| 순번 | 페이지 | 경로 | 글자수 | 상태 |
|-----|-------|------|-------|------|
| 1 | 홈 | / | 300+ | ✅ |
| 2 | 채팅 | /chat | - | ✅ |
| 3 | 캘린더 | /calendar | - | ✅ |
| 4 | 리포트 | /report | - | ✅ |
| 5 | 서비스 소개 | /about | 500+ | 🔲 |
| 6 | 이용약관 | /terms | 1000+ | 🔲 |
| 7 | 개인정보처리방침 | /privacy | 1000+ | 🔲 |
| 8 | FAQ | /faq | 800+ | 🔲 |
| 9 | 사용 가이드 | /guide | 700+ | 🔲 |
| 10 | 요금제 | /pricing | 400+ | 🔲 |
| 11 | 문의하기 | /contact | 300+ | ✅ |
| 12-15 | 블로그 포스트 (선택) | /blog/* | 500+ | 🔲 |

**총 15개 이상 페이지 필요**

### ✅ 체크포인트

**애드센스 승인 조건 확인**

```bash
✅ 필수 항목:
   - [x] 15개 이상 페이지
   - [x] 각 페이지 500자 이상
   - [x] 개인정보처리방침
   - [x] 이용약관
   - [x] 문의하기 폼
   - [x] 모바일 최적화
   - [x] HTTPS (Vercel 자동)
   - [x] 로딩 속도 빠름 (Vite)
```

**로컬 테스트**

```bash
npm run dev
# 모든 페이지 접속해서 확인
```

**확인 사항**
- [ ] 모든 페이지가 로드되는가?
- [ ] 각 페이지 글자수가 충분한가?
- [ ] SEO 메타 태그가 있는가?
- [ ] 모바일에서도 잘 보이는가?
- [ ] Footer 링크가 모두 작동하는가?

---

## Phase 8: 배포 (Day 4 - 1시간)

### 🎯 목표

- GitHub 리포지토리 생성 및 업로드
- Vercel 배포
- 환경 변수 설정
- 도메인 연결 (선택)
- HTTPS 작동 확인

### 🚀 배포 단계

### 8-1. GitHub 업로드

```bash
# Git 초기화 (아직 안했다면)
git init

# .gitignore 확인
echo "node_modules
dist
.env
.DS_Store" > .gitignore

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Smart Schedule App MVP"

# GitHub 리포지토리 생성 (웹에서)
# https://github.com/new
# 리포지토리 이름: smart-schedule-app
# Public 또는 Private 선택

# 리모트 추가
git remote add origin https://github.com/your-username/smart-schedule-app.git

# 푸시
git branch -M main
git push -u origin main
```

### 8-2. Vercel 배포

**1. Vercel 계정 생성**

```
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. "Continue with GitHub" 클릭
```

**2. 프로젝트 Import**

```
1. Vercel 대시보드 → "Add New..." → "Project"
2. GitHub 리포지토리 검색: smart-schedule-app
3. "Import" 클릭
```

**3. 프로젝트 설정**

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**4. 환경 변수 입력**

```
Environment Variables:

VITE_OPENAI_API_KEY=sk-proj-...
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=프로젝트.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_WEB3FORMS_ACCESS_KEY=...
```

**5. Deploy 클릭**

```
빌드 시작 → 1-2분 대기 → 완료!
URL: https://your-project.vercel.app
```

### 8-3. 도메인 연결 (선택)

**1. 도메인 구매**

```
Namecheap, GoDaddy, Cloudflare 등에서 구매
예: smartschedule.com ($10/년)
```

**2. Vercel에 도메인 추가**

```
1. Vercel 프로젝트 → Settings → Domains
2. "Add Domain" 클릭
3. 구매한 도메인 입력
4. DNS 설정 안내 따라하기
```

**3. DNS 설정**

```
도메인 제공업체 → DNS 관리

A Record:
  Name: @
  Value: 76.76.21.21 (Vercel IP)

CNAME Record:
  Name: www
  Value: cname.vercel-dns.com
```

**4. HTTPS 자동 활성화 (Vercel)**

```
Let's Encrypt 인증서 자동 발급
몇 분 후 HTTPS 작동
```

### ✅ 체크포인트

**Vercel 배포 확인**

```bash
1. Vercel 대시보드 → Deployments
2. Status: Ready
3. 배포 URL 클릭 → 사이트 열림
```

**기능 테스트**

```bash
1. 회원가입/로그인 테스트
2. 채팅으로 일정 등록 테스트
3. 캘린더에서 일정 확인
4. 문의 폼 전송 테스트
5. 모든 페이지 접속 확인
```

**확인 사항**
- [ ] 사이트가 열리는가?
- [ ] HTTPS가 작동하는가?
- [ ] Firebase 연결이 되는가?
- [ ] OpenAI 파싱이 되는가?
- [ ] 모바일에서도 잘 보이는가?
- [ ] 로딩 속도가 빠른가? (<3초)

**예상 결과**

```
✅ 배포 완료!
   - URL: https://smart-schedule-app.vercel.app
   - HTTPS: ✅
   - 모든 기능 작동: ✅
   - 모바일 최적화: ✅
```

### 8-4. 배포 후 설정

**Google Search Console 등록**

```
1. https://search.google.com/search-console
2. "속성 추가" 클릭
3. URL 접두어: https://your-domain.com
4. 소유권 확인 (메타 태그 또는 HTML 파일)
5. 사이트맵 제출: https://your-domain.com/sitemap.xml
```

**Google Analytics 설정**

```
1. https://analytics.google.com
2. 계정 생성 → 속성 추가
3. 측정 ID 복사 (G-XXXXXXXXXX)
4. index.html <head>에 스크립트 추가
5. 재배포
```

---

## 🛠️ 트러블슈팅

### Firebase 관련

**Q: Firebase 연결이 안돼요**

```
A: 체크리스트
1. .env 파일이 있는가?
2. 모든 환경 변수가 VITE_ 접두어로 시작하는가?
3. Firebase 콘솔에서 웹 앱이 등록되었는가?
4. npm run dev 재실행 (환경 변수 변경 시 필수)
5. 브라우저 콘솔에서 에러 확인
```

**Q: Firestore 보안 규칙 오류**

```javascript
// Firebase 콘솔 → Firestore Database → Rules
// 테스트 모드로 변경 (나중에 수정)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 3, 1);
    }
  }
}
```

### OpenAI 관련

**Q: OpenAI API 호출 실패**

```
A: 체크리스트
1. API 키가 유효한가? (platform.openai.com에서 확인)
2. 크레딧 잔액이 있는가? ($5 이상)
3. dangerouslyAllowBrowser: true 설정했는가?
4. CORS 오류는 없는가? (브라우저 콘솔 확인)
5. Rate limit 초과는 아닌가? (1분 대기 후 재시도)
```

**Q: 파싱 결과가 이상해요**

```javascript
// openai.js 프롬프트 개선
const SYSTEM_PROMPT = `당신은 일정 파싱 전문가입니다.
사용자 메시지에서 다음 정보를 JSON으로 추출하세요.

예시:
입력: "내일 오후 2시 회의"
출력: { "date": "2024-02-17", "time": "14:00", "title": "회의", "duration": 60 }

규칙:
- 날짜가 없으면 null
- 시간이 없으면 null
- 제목은 필수
- duration 기본값: 60분

현재 날짜: ${new Date().toISOString()}`
```

### Vercel 배포 관련

**Q: Vercel 빌드 실패**

```
A: 체크리스트
1. 로컬에서 npm run build 성공하는가?
2. package.json의 scripts가 올바른가?
3. Vercel 환경 변수를 모두 입력했는가?
4. node 버전이 맞는가? (18.x 이상)
5. 빌드 로그에서 에러 메시지 확인
```

**Q: 배포 후 환경 변수 오류**

```
A: Vercel 대시보드에서 재설정
1. Project → Settings → Environment Variables
2. 모든 VITE_ 변수 재입력
3. Production, Preview, Development 모두 체크
4. Save → Redeploy (Deployments 탭)
```

### 일반 오류

**Q: 페이지가 404 오류**

```jsx
// App.jsx에서 React Router 설정 확인
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// vercel.json 생성 (SPA 라우팅)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Q: 모바일에서 레이아웃 깨짐**

```jsx
// Tailwind breakpoints 확인
<div className="
  w-full                  // 모바일: 100%
  md:w-1/2                // 태블릿: 50%
  lg:w-1/3                // 데스크톱: 33%
">
  콘텐츠
</div>
```

---

## 📚 다음 단계

**Week 2: 수익화 준비**
- Google AdSense 신청 (`DEPLOYMENT_CHECKLIST.md` 참고)
- SEO 최적화
- 블로그 포스팅

**Week 3-4: 트래픽 유입**
- SNS 마케팅
- 커뮤니티 홍보
- 콘텐츠 마케팅

**Month 2-3: 기능 추가**
- 알림 기능
- 프리미엄 플랜
- 외부 캘린더 연동

---

## 🎯 완료!

축하합니다! 🎉

이제 여러분은 **수익형 AI 스마트 스케줄 관리 웹앱**을 완성했습니다.

**다음 가이드**: `DEPLOYMENT_CHECKLIST.md`로 이동하여 애드센스 승인 받고 수익화를 시작하세요!

**행운을 빕니다!** 🚀
