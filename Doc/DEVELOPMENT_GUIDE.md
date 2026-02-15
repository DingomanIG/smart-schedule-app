# 스마트 스케줄 앱 개발 가이드

> Claude Code를 위한 개발 지침서
> 
> 이 문서는 AI 코딩 어시스턴트가 프로젝트를 올바르게 개발할 수 있도록 명확한 지침을 제공합니다.

---

## 🎯 프로젝트 개요

### 목표
조코딩 영상의 바이브 코딩 방식을 활용한 **수익형 스마트 스케줄 관리 웹앱** 개발

### 핵심 철학
- **빠른 개발** - 기능 > 디자인
- **MVP 우선** - 핵심 기능만 먼저
- **점진적 개선** - 단계별 확장

---

## 📋 기술 스택 (확정)

### Frontend
- React 18 + Vite
- Tailwind CSS (최소한의 스타일링)
- Lucide React (아이콘)

### Backend & Services
- Firebase (Authentication + Firestore)
- OpenAI API (GPT-4o-mini)
- Vercel (배포)

### 수익화
- Google AdSense

---

## 🏗️ 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── ChatInterface.jsx       # 채팅 UI
│   ├── CalendarView.jsx        # 캘린더 뷰
│   ├── WeeklyReport.jsx        # 주간 리포트
│   └── AdSenseAd.jsx           # 광고 컴포넌트
├── services/           # 외부 서비스 연동
│   ├── firebase.js             # Firebase 설정
│   ├── openai.js               # OpenAI API
│   └── schedule.js             # 일정 CRUD
├── hooks/              # Custom Hooks
│   ├── useChat.js              # 채팅 로직
│   └── useSchedule.js          # 일정 관리
├── utils/              # 유틸리티 함수
│   └── dateParser.js           # 날짜 파싱
├── App.jsx             # 메인 앱
└── main.jsx            # Entry Point
```

---

## 📅 개발 단계 (빠른 진행)

### Phase 1: 기본 구조 (1일차)
**목표: 화면 구성 완성**

#### 1-1. 레이아웃 구성
- [ ] 3-탭 구조 (채팅, 캘린더, 리포트)
- [ ] 모바일 반응형 (Tailwind breakpoints)
- [ ] 다크모드 토글 (선택사항)

**구현 지침:**
```jsx
// App.jsx - 최소한의 구조
- Header (로고 + 탭 버튼)
- Main Content (탭별 컴포넌트)
- Footer (광고 영역 예약)

// 스타일: Tailwind 기본 클래스만 사용
// bg-white, text-gray-900, border, rounded 등
// 컬러는 blue-600 계열로 통일
```

#### 1-2. 채팅 UI 기본 구조
- [ ] 메시지 리스트 영역
- [ ] 입력창 + 전송 버튼
- [ ] 사용자/AI 메시지 구분

**구현 지침:**
```jsx
// ChatInterface.jsx
- 상단: 메시지 목록 (스크롤 가능)
- 하단: 고정 입력창
- useState로 메시지 배열 관리
- 초기 메시지: "안녕하세요! 일정을 말씀해주세요"

// 스타일: 말풍선 스타일 최소화
// 사용자: 우측 정렬, bg-blue-600, text-white
// AI: 좌측 정렬, bg-gray-100, text-gray-900
```

---

### Phase 2: Firebase 연동 (1일차)

#### 2-1. Firebase 설정
- [ ] Firebase 프로젝트 연결
- [ ] Authentication 설정 (이메일/비밀번호)
- [ ] Firestore 초기화

**구현 지침:**
```javascript
// src/services/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // .env 파일에서 환경변수로 가져오기
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... 나머지 설정
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

#### 2-2. Firestore 데이터 구조
```javascript
// users 컬렉션
{
  userId: "user123",
  email: "user@example.com",
  createdAt: Timestamp
}

// events 컬렉션
{
  eventId: "evt123",
  userId: "user123",
  title: "회의",
  startTime: Timestamp,
  endTime: Timestamp,
  category: "meeting",
  createdVia: "chat"
}

// chat_messages 컬렉션
{
  messageId: "msg123",
  userId: "user123",
  role: "user" | "assistant",
  content: "내일 오후 2시 회의",
  timestamp: Timestamp
}
```

---

### Phase 3: OpenAI 연동 (2일차)

#### 3-1. OpenAI API 설정
- [ ] API 키 환경변수 설정
- [ ] 자연어 파싱 함수 구현

**구현 지침:**
```javascript
// src/services/openai.js
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function parseSchedule(userMessage) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 일정 파싱 전문가입니다.
사용자 메시지에서 다음 정보를 JSON으로 추출하세요:
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "title": "일정 제목",
  "duration": 60,
  "attendees": [],
  "location": ""
}

현재 날짜: ${new Date().toISOString().split('T')[0]}
"내일" → 내일 날짜로 변환
"다음주 월요일" → 실제 날짜로 변환`
      },
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.3
  })

  const result = completion.choices[0].message.content
  // JSON 추출 및 파싱
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}
```

#### 3-2. 채팅 로직 연동
- [ ] 사용자 메시지 → OpenAI 파싱
- [ ] 파싱 결과 → 일정 카드 표시
- [ ] 확인 버튼 → Firestore 저장

**구현 지침:**
```jsx
// ChatInterface.jsx - handleSend 함수
const handleSend = async () => {
  // 1. 사용자 메시지 추가
  const userMsg = { role: 'user', content: input }
  setMessages(prev => [...prev, userMsg])
  
  // 2. OpenAI 파싱
  const parsed = await parseSchedule(input)
  
  // 3. AI 응답 (파싱 결과 포함)
  const aiMsg = {
    role: 'assistant',
    content: `일정을 확인해주세요:
📅 ${parsed.date}
⏰ ${parsed.time}
📝 ${parsed.title}`,
    parsed: parsed
  }
  setMessages(prev => [...prev, aiMsg])
}
```

---

### Phase 4: 일정 CRUD (2일차)

#### 4-1. 일정 저장 (Create)
```javascript
// src/services/schedule.js
import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function createEvent(userId, eventData) {
  const eventsRef = collection(db, 'events')
  const docRef = await addDoc(eventsRef, {
    userId,
    ...eventData,
    createdAt: new Date(),
    createdVia: 'chat'
  })
  return docRef.id
}
```

#### 4-2. 일정 조회 (Read)
```javascript
export async function getEvents(userId, startDate, endDate) {
  const q = query(
    collection(db, 'events'),
    where('userId', '==', userId),
    where('startTime', '>=', startDate),
    where('startTime', '<=', endDate),
    orderBy('startTime')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

---

### Phase 5: 캘린더 뷰 (3일차)

#### 5-1. 기본 캘린더 구현
- [ ] react-calendar 라이브러리 사용
- [ ] 일정 표시 (점 또는 숫자)
- [ ] 날짜 클릭 → 상세보기

**구현 지침:**
```jsx
// CalendarView.jsx
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

// 최소 스타일로 구현
// 일정이 있는 날짜에 파란 점 표시
// 클릭하면 해당 날짜 일정 목록 표시
```

---

### Phase 6: 외부 서비스 연동 (3일차)

#### 6-1. 문의하기 폼 (Web3Forms)
```jsx
// src/components/ContactForm.jsx
// Web3Forms 사용 (https://web3forms.com)
// 백엔드 없이 이메일 전송 가능

<form action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">전송</button>
</form>
```

#### 6-2. 댓글 기능 (Giscus)
- GitHub Discussions 기반 댓글
- https://giscus.app 에서 설정
- 스크립트 태그 삽입만으로 완성

---

### Phase 7: 애드센스 준비 (4일차)

#### 7-1. 필수 페이지 생성
- [ ] `/about` - 서비스 소개
- [ ] `/privacy` - 개인정보처리방침
- [ ] `/terms` - 이용약관
- [ ] `/contact` - 문의하기

**구현 지침:**
```jsx
// 각 페이지는 최소 500자 이상 콘텐츠
// React Router로 라우팅 설정
// 간단한 텍스트 중심 레이아웃
```

#### 7-2. 광고 영역 예약
```jsx
// AdSenseAd.jsx
export default function AdSenseAd({ slot }) {
  return (
    <div className="border border-gray-300 rounded p-4 text-center bg-gray-50">
      <p className="text-sm text-gray-500">광고 영역 ({slot})</p>
      {/* 애드센스 승인 후 스크립트 삽입 */}
    </div>
  )
}

// 배치 위치:
// - Header 하단 (수평 배너)
// - Sidebar (세로 배너)
// - Footer 상단 (수평 배너)
```

---

### Phase 8: 배포 준비 (4일차)

#### 8-1. GitHub 업로드
```bash
git init
git add .
git commit -m "Initial commit: Smart Schedule App"
git remote add origin https://github.com/username/smart-schedule-app.git
git push -u origin main
```

#### 8-2. Vercel 배포
1. vercel.com 접속
2. GitHub 연동
3. 리포지토리 선택
4. 환경 변수 입력
5. Deploy 클릭

#### 8-3. 환경 변수 설정 (Vercel)
```
VITE_OPENAI_API_KEY=sk-proj-...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🎨 스타일 가이드 (최소화)

### 색상 팔레트
- **Primary**: `blue-600` (#2563eb)
- **Background**: `white` / `gray-50`
- **Text**: `gray-900` / `gray-600`
- **Border**: `gray-200` / `gray-300`

### 컴포넌트 스타일 원칙
```jsx
// ❌ 복잡한 스타일 금지
<div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl rounded-3xl ...">

// ✅ 간단한 스타일 사용
<div className="bg-white border border-gray-200 rounded-lg p-4">
```

### Typography
- **제목**: `text-2xl font-bold`
- **본문**: `text-base`
- **작은글씨**: `text-sm text-gray-600`

---

## 🔧 코딩 규칙

### 1. 파일 명명 규칙
- 컴포넌트: PascalCase (`ChatInterface.jsx`)
- 유틸/서비스: camelCase (`firebase.js`, `dateParser.js`)
- 상수: UPPER_CASE (`API_ENDPOINTS.js`)

### 2. 상태 관리
```jsx
// ✅ useState로 충분
const [messages, setMessages] = useState([])

// ❌ Redux, Zustand 등 복잡한 상태관리 금지 (나중에 필요하면 추가)
```

### 3. 에러 처리
```javascript
// 모든 async 함수는 try-catch
try {
  const result = await someFunction()
} catch (error) {
  console.error('Error:', error)
  // 사용자에게 알림 (alert 또는 toast)
}
```

### 4. 환경 변수 사용
```javascript
// ✅ 항상 import.meta.env 사용
const apiKey = import.meta.env.VITE_OPENAI_API_KEY

// ❌ 하드코딩 절대 금지
const apiKey = "sk-proj-abc123..."
```

---

## 📝 개발 체크리스트

### Week 1 (MVP)
- [ ] Phase 1: 기본 구조 완성
- [ ] Phase 2: Firebase 연동
- [ ] Phase 3: OpenAI 파싱
- [ ] Phase 4: 일정 CRUD

### Week 2 (기능 확장)
- [ ] Phase 5: 캘린더 뷰
- [ ] Phase 6: 외부 서비스
- [ ] Phase 7: 애드센스 준비
- [ ] Phase 8: 배포

### Week 3 (수익화)
- [ ] 애드센스 신청
- [ ] SEO 최적화
- [ ] 성능 개선
- [ ] 사용자 테스트

---

## 🚀 Claude Code 사용 예시

### 기본 명령어 패턴
```bash
# Phase 1 시작
claude-code "개발 가이드의 Phase 1-1을 구현해줘. App.jsx에 3-탭 레이아웃을 만들고, Tailwind로 최소한의 스타일링을 적용해줘."

# Firebase 연동
claude-code "개발 가이드의 Phase 2-1을 구현해줘. src/services/firebase.js 파일을 만들고 환경변수로 Firebase를 초기화해줘."

# OpenAI 파싱
claude-code "개발 가이드의 Phase 3-1을 구현해줘. src/services/openai.js에 parseSchedule 함수를 만들어줘."
```

### 세부 기능 요청
```bash
# 채팅 UI
claude-code "ChatInterface.jsx를 만들어줘. 개발 가이드의 1-2 섹션을 참고해서 메시지 리스트와 입력창을 구현해줘. 스타일은 최소화."

# 일정 저장
claude-code "src/services/schedule.js에 createEvent 함수를 구현해줘. 개발 가이드의 4-1 섹션 참고."
```

---

## ⚠️ 주의사항

### 하지 말아야 할 것
1. ❌ 복잡한 애니메이션
2. ❌ 불필요한 라이브러리 추가
3. ❌ 과도한 스타일링
4. ❌ API 키 하드코딩
5. ❌ 테스트 없이 바로 배포

### 반드시 해야 할 것
1. ✅ .gitignore에 .env 추가
2. ✅ 에러 핸들링
3. ✅ 로딩 상태 표시
4. ✅ 모바일 반응형
5. ✅ 환경변수로 API 키 관리

---

## 📞 문제 해결

### Firebase 연결 오류
→ `.env` 파일의 Firebase 설정 확인
→ Firebase Console에서 앱 등록 확인

### OpenAI API 오류
→ API 키 유효성 확인
→ 요금 크레딧 잔액 확인

### 빌드 오류
→ `npm install` 다시 실행
→ `node_modules` 삭제 후 재설치

---

## 🎯 최종 목표

### MVP 출시 (2주)
- ✅ 채팅으로 일정 등록 가능
- ✅ 캘린더에서 일정 확인 가능
- ✅ Firebase에 저장
- ✅ Vercel 배포 완료

### 수익화 준비 (4주)
- ✅ 애드센스 승인
- ✅ 광고 배치
- ✅ 트래픽 유입 시작

### 성공 지표
- DAU 100명 → 월 $50
- DAU 500명 → 월 $300
- DAU 2000명 → 월 $1,500

---

**이 문서는 프로젝트 루트에 저장하고, Claude Code에게 항상 참조하도록 하세요!**
