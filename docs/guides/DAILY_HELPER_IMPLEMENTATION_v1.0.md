# 일상 도우미 MVP 구현 가이드 v1.0

> Phase 1 일상 스케줄 도우미 — 단계별 구현 워크플로우
> 작성일: 2026-02-19 | 버전: 1.0

---

## 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [파일 구조](#파일-구조)
4. [Step 1: helperParser.js — 입력 파서](#step-1-helperparsejs--입력-파서)
5. [Step 2: helperProfile.js — 프로필 서비스](#step-2-helperprofilejs--프로필-서비스)
6. [Step 3: schedule.js — 배치 저장](#step-3-schedulejs--배치-저장)
7. [Step 4: openai.js — AI 스케줄 생성](#step-4-openaijs--ai-스케줄-생성)
8. [Step 5: i18n 키 추가](#step-5-i18n-키-추가)
9. [Step 6: BatchConfirmCard — 배치 카드](#step-6-batchconfirmcard--배치-카드)
10. [Step 7: HelperSelector — 도우미 선택 UI](#step-7-helperselector--도우미-선택-ui)
11. [Step 8: ChatInterface — 핵심 통합](#step-8-chatinterface--핵심-통합)
12. [상태 머신](#상태-머신)
13. [데이터 흐름](#데이터-흐름)
14. [엣지 케이스 및 에러 처리](#엣지-케이스-및-에러-처리)
15. [검증 체크리스트](#검증-체크리스트)

---

## 개요

사용자가 채팅에서 "일상 스케줄 짜줘"를 입력하면:

1. 온보딩 질문 5개를 순차적으로 진행
2. 수집된 정보를 GPT-4o-mini에 전달하여 하루 스케줄 생성
3. 초록색 배치 카드로 결과 표시
4. "전체 등록" 클릭 시 Firestore에 일괄 저장
5. 캘린더 자동 갱신

**설계 원칙**:
- 기존 채팅 플로우에 자연스럽게 통합 (별도 페이지/모달 없음)
- 기존 코드 패턴 준수: `useState`, Tailwind `dark:`, `lucide-react`, `useLanguage` i18n
- 하이브리드 방식: GPT 시스템 프롬프트에 규칙 내장 + 사용자 데이터로 커스터마이징

---

## 아키텍처

### 사용자 플로우

```
사용자 입력: "일상 스케줄 짜줘"
        │
        ▼
┌─────────────────────────────────┐
│  ChatInterface 트리거 감지       │
│  isDailyHelperTrigger(text)     │
└──────────┬──────────────────────┘
           │
     기존 프로필 확인
     getHelperProfile()
           │
    ┌──────┴──────┐
    │ 있음         │ 없음
    ▼              ▼
 바로 생성     온보딩 시작
                   │
           ┌───────┴───────┐
           │ 5개 질문 순차   │
           │ Step 0: 기상    │
           │ Step 1: 취침    │
           │ Step 2: 식사    │
           │ Step 3: 통근    │
           │ Step 4: 루틴    │
           └───────┬───────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ generateDailySchedule│
        │ GPT-4o-mini 호출     │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ BatchConfirmCard     │
        │ 초록색 배치 카드      │
        │ - 전체 등록 버튼     │
        │ - 개별 제거 버튼     │
        │ - 취소 버튼          │
        └──────────┬──────────┘
                   │
            전체 등록 클릭
                   │
                   ▼
        ┌─────────────────────┐
        │ addBatchEvents()     │
        │ Firestore writeBatch │
        └──────────┬──────────┘
                   │
                   ▼
        onEventCreated() → 캘린더 갱신
```

### 기존 시스템과의 통합 지점

| 통합 포인트 | 기존 코드 | 도우미 연동 방식 |
|------------|----------|----------------|
| 채팅 입력 | `handleSend()` | 기존 로직 앞에 트리거/온보딩 인터셉트 추가 |
| 이벤트 저장 | `createEvent()` | 새 `addBatchEvents()`로 일괄 저장 |
| 캘린더 갱신 | `onEventCreated()` → `calendarKey++` | 동일 콜백 재사용 |
| 이벤트 표시 | `events` 컬렉션 조회 | 같은 컬렉션에 저장하므로 자동 호환 |
| API 라우팅 | Dev: Vite proxy, Prod: `/api/chat` | 동일 라우팅 재사용 |

---

## 파일 구조

### 신규 파일 (4개)

```
src/
├── utils/
│   └── helperParser.js          ← 온보딩 답변 파싱 유틸
├── services/
│   └── helperProfile.js         ← Firestore 프로필 CRUD
└── components/
    ├── BatchConfirmCard.jsx      ← 배치 확인 카드
    └── HelperSelector.jsx        ← 도우미 선택 드롭다운
```

### 수정 파일 (4개)

```
src/
├── services/
│   ├── schedule.js              ← writeBatch import + addBatchEvents 추가
│   └── openai.js                ← generateDailySchedule 함수 추가
├── locales/
│   ├── ko.js                    ← 18개 i18n 키 추가
│   └── en.js                    ← 18개 i18n 키 추가
└── components/
    └── ChatInterface.jsx         ← 온보딩 상태머신 + 배치 카드 통합
```

### 변경 불필요 파일

| 파일 | 이유 |
|------|------|
| `src/App.jsx` | `onEventCreated` 콜백이 이미 캘린더 갱신 처리 |
| `src/components/CalendarView.jsx` | 같은 `events` 컬렉션이므로 자동 표시 |
| `api/chat.js` | Vercel 함수는 어떤 OpenAI 요청이든 프록시 |
| `vite.config.js` | 같은 `/api/openai` 프록시 사용 |

---

## Step 1: helperParser.js — 입력 파서

> 신규 파일: `src/utils/helperParser.js`
> 의존성: 없음 (순수 유틸리티)

GPT 호출 없이 온보딩 답변을 로컬에서 파싱한다. API 비용 절감 + 즉각 응답.

### 함수 목록

| 함수 | 입력 예시 | 출력 |
|------|----------|------|
| `parseTimeInput(text)` | `"7시"`, `"오후 3시 30분"`, `"7am"`, `"23:00"` | `"07:00"`, `"15:30"`, `"07:00"`, `"23:00"` |
| `parseMealsInput(text)` | `"아침 7:30, 점심 12시, 저녁 7시"` | `{ breakfast: "07:30", lunch: "12:00", dinner: "19:00", regular: true }` |
| `parseCommuteInput(text)` | `"9시~18시"`, `"없음"` | `{ hasCommute: true, startTime: "09:00", endTime: "18:00" }` |
| `parseRoutinesInput(text)` | `"운동, 독서, 명상"` | `["운동", "독서", "명상"]` |
| `isDailyHelperTrigger(text)` | `"일상 스케줄 짜줘"` | `true` |
| `isHelperCancel(text)` | `"취소"`, `"그만"` | `true` |

### parseTimeInput 지원 형식

```
한국어: "7시", "오전 7시", "오후 3시 30분", "새벽 2시", "밤 11시"
영어:   "7am", "11pm", "7:30am"
숫자:   "07:00", "23:00"
단순:   "7" → "07:00"
```

### isDailyHelperTrigger 감지 패턴

```
일상 스케줄 짜줘 / 만들어줘 / 생성해줘
하루 일정 짜줘 / 루틴 만들어줘
스케줄 도우미
daily schedule / daily routine / daily plan
```

---

## Step 2: helperProfile.js — 프로필 서비스

> 신규 파일: `src/services/helperProfile.js`
> 의존성: `firebase.js` (`db`, `isFirebaseConfigured`)

사용자가 온보딩을 한 번 완료하면 다음에는 질문 없이 바로 스케줄을 생성할 수 있도록 선호도를 저장한다.

### Firestore 문서 구조

```
컬렉션: helperProfiles
문서 ID: {userId}_H01

{
  userId: "abc123",
  helperId: "H01",
  preferences: {
    wakeUp: "07:00",
    bedTime: "23:00",
    meals: {
      breakfast: "07:30",
      lunch: "12:00",
      dinner: "19:00",
      regular: true
    },
    commute: {
      hasCommute: true,
      startTime: "09:00",
      endTime: "18:00"
    },
    routines: ["운동", "독서"]
  },
  updatedAt: Timestamp
}
```

### 함수

```javascript
saveHelperProfile(userId, helperId, preferences)
// setDoc with merge → 부분 업데이트 가능

getHelperProfile(userId, helperId)
// 있으면 preferences 객체 반환, 없으면 null
// 데모 모드(isFirebaseConfigured === false): null 반환
```

---

## Step 3: schedule.js — 배치 저장

> 수정 파일: `src/services/schedule.js`
> 변경: import에 `writeBatch` 추가, `addBatchEvents` 함수 추가

### 변경 내용

**import 수정** (라인 1~12):
```javascript
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, Timestamp,
  writeBatch,  // 추가
} from 'firebase/firestore'
```

**새 함수** (파일 끝에 추가):
```javascript
export async function addBatchEvents(userId, events, date) {
  // events: [{ title, time, duration, category }]
  // date: "YYYY-MM-DD"
  //
  // writeBatch로 원자적 저장 (최대 500건, 일상 스케줄은 8~15건)
  // 각 이벤트: { userId, title, startTime, endTime, category, createdVia: 'helper' }
}
```

**기존 코드 영향**: 없음 (함수 추가만)

---

## Step 4: openai.js — AI 스케줄 생성

> 수정 파일: `src/services/openai.js`
> 변경: 파일 끝에 `generateDailySchedule` 함수 추가. 기존 `parseSchedule` 변경 없음.

### 시스템 프롬프트 설계

```
역할: 일상 스케줄 설계 전문가

규칙:
1. 기상~취침 사이 빈 시간 없이 배분
2. 식사 시간 최소 30분 확보
3. 출퇴근 블록: 출근 준비(30분) + 출근 + 업무 + 퇴근
4. 루틴 배치 규칙:
   - 운동 → 출근 전 또는 퇴근 후
   - 독서 → 저녁/취침 전
   - 명상 → 기상 직후 또는 취침 전
5. 활동 사이 10~15분 버퍼
6. 1~2시간 자유 시간(여가) 포함
7. category: routine | meal | commute | leisure | personal | health
8. 모든 제목 한국어

응답 형식:
{
  "action": "create_batch",
  "events": [
    { "title": "기상", "time": "07:00", "duration": 30, "category": "routine" }
  ]
}
```

### 설정값

| 설정 | 값 | 이유 |
|------|---|------|
| model | `gpt-4o-mini` | 기존과 동일 |
| temperature | `0.5` | 기존 파싱(0.3)보다 약간 높음 → 자연스러운 변형 |
| API 라우팅 | `isDev` 분기 | 기존 패턴 재사용 |

### 반환 구조

```javascript
{
  action: "create_batch",
  date: "2026-02-19",  // 오늘 날짜 자동 설정
  events: [
    { title: "기상", time: "07:00", duration: 30, category: "routine" },
    { title: "아침 식사", time: "07:30", duration: 30, category: "meal" },
    // ... 8~15개 이벤트
  ]
}
```

---

## Step 5: i18n 키 추가

> 수정 파일: `src/locales/ko.js`, `src/locales/en.js`
> 위치: 각 파일의 `minuteUnit` 뒤, 닫는 `}` 전

### 추가 키 목록 (18개)

| 키 | ko | en |
|----|----|----|
| `helperDaily` | 일상 도우미 | Daily Helper |
| `helperSelectTitle` | 스케줄 도우미 | Schedule Helper |
| `helperStart` | 일상 스케줄을 만들어 드릴게요! 몇 가지 질문에 답해주세요 | I'll create a daily schedule for you! Please answer a few questions. |
| `helperAskWakeUp` | 몇 시에 일어나세요? (예: 7시, 07:00) | What time do you wake up? (e.g., 7am, 07:00) |
| `helperAskBedTime` | 몇 시에 주무세요? (예: 23시, 밤 11시) | What time do you go to bed? (e.g., 11pm, 23:00) |
| `helperAskMeals` | 식사 시간을 알려주세요.\n(예: 아침 7:30, 점심 12:00, 저녁 19:00)\n불규칙하면 "불규칙"이라고 입력해주세요. | What are your meal times?\n(e.g., breakfast 7:30, lunch 12:00, dinner 19:00)\nType "irregular" if not regular. |
| `helperAskCommute` | 출근/등교 시간이 있나요?\n(예: 9시~18시)\n없으면 "없음"이라고 입력해주세요. | Do you have a commute?\n(e.g., 9am-6pm)\nType "none" if not. |
| `helperAskRoutines` | 꼭 넣고 싶은 루틴이 있나요?\n(예: 운동, 독서, 명상)\n없으면 "없음"이라고 입력해주세요. | Any routines you want to include?\n(e.g., exercise, reading, meditation)\nType "none" if not. |
| `helperParseRetry` | 인식하지 못했어요. 다시 입력해주세요. | I couldn't understand that. Please try again. |
| `helperGenerating` | 스케줄을 생성하고 있어요... | Generating your schedule... |
| `helperScheduleGenerated` | 일상 스케줄이 완성되었어요! 확인 후 등록해주세요: | Your daily schedule is ready! Please review and register: |
| `helperBatchSaved` | 스케줄이 모두 등록되었습니다! 캘린더에서 확인하세요 | All events have been registered! Check your calendar. |
| `helperCancelled` | 도우미를 취소했습니다. 다시 시작하려면 "일상 스케줄 짜줘"라고 입력하세요. | Helper cancelled. Type "daily schedule" to start again. |
| `helperRegisterAll` | 전체 등록 | Register All |
| `helperScheduleTitle` | 일상 스케줄 | Daily Schedule |
| `helperEventCount` | 개 일정 | events |
| `helperRemoveItem` | 제거 | Remove |
| `helperGenerateError` | 스케줄 생성 중 오류가 발생했습니다. 다시 시도해주세요. | Error generating schedule. Please try again. |
| `helperCancelHint` | (취소하려면 "취소"를 입력하세요) | (Type "cancel" to cancel) |

---

## Step 6: BatchConfirmCard — 배치 카드

> 신규 파일: `src/components/BatchConfirmCard.jsx`
> 의존성: `lucide-react`, `useLanguage`

### 디자인

```
┌──────────────────────────────────────┐  ← border-2 border-green-300
│  일상 스케줄           📅 2026-02-19  │
│                        3개 일정       │
│ ┌──────────────────────────────────┐ │
│ │ 07:00  기상          30분  routine│ │  ← 개별 이벤트 행
│ │ 07:30  아침 식사      30분  meal  │ │
│ │ 09:00  출근          30분  commute│ │
│ │       ...스크롤 가능...           │ │
│ └──────────────────────────────────┘ │
│ ┌──────────┐ ┌──────────┐           │
│ │ ✓ 전체 등록│ │ ✗ 취소   │           │  ← 액션 버튼
│ └──────────┘ └──────────┘           │
└──────────────────────────────────────┘
```

### Props

```typescript
{
  events: Array<{ title, time, duration, category }>,
  date: string,            // "YYYY-MM-DD"
  onConfirmAll: () => void,
  onRemoveItem: (index: number) => void,
  onCancel: () => void,
  confirmed: boolean,
  cancelled: boolean,
}
```

### 카테고리 색상 뱃지

| 카테고리 | 라이트 모드 | 다크 모드 |
|---------|-----------|----------|
| routine | `bg-blue-100 text-blue-600` | `bg-blue-900/30 text-blue-300` |
| meal | `bg-amber-100 text-amber-600` | `bg-amber-900/30 text-amber-300` |
| commute | `bg-gray-100 text-gray-600` | `bg-gray-900/30 text-gray-300` |
| leisure | `bg-purple-100 text-purple-600` | `bg-purple-900/30 text-purple-300` |
| personal | `bg-pink-100 text-pink-600` | `bg-pink-900/30 text-pink-300` |
| health | `bg-green-100 text-green-600` | `bg-green-900/30 text-green-300` |

---

## Step 7: HelperSelector — 도우미 선택 UI

> 신규 파일: `src/components/HelperSelector.jsx`
> 의존성: `lucide-react` (Sparkles, Sun), `useLanguage`

### 위치

ChatInterface 입력창 왼쪽에 배치:

```
┌────────────────────────────────────────────┐
│ [✨] [일정을 입력하세요...              ] [▶] │
│  ↑                                    ↑    │
│  HelperSelector               Send button  │
└────────────────────────────────────────────┘
```

### 드롭다운 (위 방향 팝업)

```
┌──────────────────┐
│ 스케줄 도우미      │  ← 헤더
├──────────────────┤
│ ☀ 일상 도우미     │  ← 클릭 가능 항목
│ (Phase 2 항목...) │
└──────────────────┘
        ↓
┌────────────────────────────────────┐
│ [✨] [입력창]                  [▶]  │
└────────────────────────────────────┘
```

### Props

```typescript
{
  onSelectHelper: (type: string) => void,  // 'daily'
  disabled: boolean,                       // loading 중 비활성화
}
```

---

## Step 8: ChatInterface — 핵심 통합

> 수정 파일: `src/components/ChatInterface.jsx`
> 이 단계가 전체 기능의 중심

### 새 import 추가

```javascript
// 기존 import 유지 + 아래 추가
import { generateDailySchedule } from '../services/openai'
import { addBatchEvents } from '../services/schedule'
import { saveHelperProfile, getHelperProfile } from '../services/helperProfile'
import {
  parseTimeInput, parseMealsInput, parseCommuteInput,
  parseRoutinesInput, isDailyHelperTrigger, isHelperCancel
} from '../utils/helperParser'
import BatchConfirmCard from './BatchConfirmCard'
import HelperSelector from './HelperSelector'
```

### 새 state

```javascript
const [helperState, setHelperState] = useState(null)
// null → 비활성 (일반 채팅 모드)
// { type: 'daily', step: 0~4, answers: {} } → 온보딩 진행 중
```

### 온보딩 질문 정의

```javascript
const ONBOARDING_STEPS = [
  { key: 'wakeUp',   askKey: 'helperAskWakeUp',   parser: parseTimeInput },
  { key: 'bedTime',  askKey: 'helperAskBedTime',   parser: parseTimeInput },
  { key: 'meals',    askKey: 'helperAskMeals',     parser: parseMealsInput },
  { key: 'commute',  askKey: 'helperAskCommute',   parser: parseCommuteInput },
  { key: 'routines', askKey: 'helperAskRoutines',  parser: parseRoutinesInput },
]
```

### handleSend 수정

```javascript
const handleSend = async () => {
  if (!input.trim() || loading) return
  // ... 기존 메시지 추가 + input 클리어 + loading 설정

  try {
    // 1. 온보딩 진행 중이면 인터셉트
    if (helperState !== null) {
      await processHelperAnswer(currentInput)
      return
    }

    // 2. 도우미 트리거 감지
    if (isDailyHelperTrigger(currentInput)) {
      await handleStartHelper('daily')
      return
    }

    // 3. 기존 parseSchedule 로직 (변경 없음)
    const recentEvents = await fetchRecentEvents()
    const parsed = await parseSchedule(...)
    // ...
  }
}
```

### 새 함수 5개

| 함수 | 역할 |
|------|------|
| `startHelperOnboarding(type)` | helperState 초기화, 인사 + 첫 질문 메시지 추가 |
| `handleStartHelper(type)` | 기존 프로필 확인 → 있으면 바로 생성, 없으면 온보딩 |
| `processHelperAnswer(text)` | 취소 체크 → 파싱 → 다음 질문 or 스케줄 생성 |
| `handleBatchConfirm(msgIndex)` | `addBatchEvents` 호출 → confirmed 마킹 → 캘린더 갱신 |
| `handleBatchRemoveItem(msgIndex, idx)` | 배치에서 개별 항목 제거 |

### JSX 변경 2곳

**1. 배치 카드 렌더링** (기존 update 카드 블록 뒤에 추가):

```jsx
{msg.action === 'create_batch' && (
  <BatchConfirmCard
    events={msg.batchEvents || []}
    date={msg.batchDate}
    onConfirmAll={() => handleBatchConfirm(i)}
    onRemoveItem={(idx) => handleBatchRemoveItem(i, idx)}
    onCancel={() => handleCancel(i)}
    confirmed={msg.confirmed}
    cancelled={msg.cancelled}
  />
)}
```

**2. 입력창에 HelperSelector 추가** (input 왼쪽):

```jsx
<div className="flex items-center gap-2">
  <HelperSelector onSelectHelper={handleStartHelper} disabled={loading} />
  <input ... />
  <button ... />
</div>
```

---

## 상태 머신

### 온보딩 상태 전이

```
[IDLE]
  │
  ├─(채팅 트리거 "일상 스케줄 짜줘")──→ [STEP_0: wakeUp 질문]
  ├─(HelperSelector 클릭)───────────→ [STEP_0: wakeUp 질문]
  │
[STEP_0] ──(파싱 성공)──→ [STEP_1: bedTime 질문]
         ──(파싱 실패)──→ [STEP_0] (재질문)
         ──("취소")────→ [IDLE]

[STEP_1] ──(파싱 성공)──→ [STEP_2: meals 질문]
         ──(파싱 실패)──→ [STEP_1]
         ──("취소")────→ [IDLE]

[STEP_2] ──(파싱 성공)──→ [STEP_3: commute 질문]
         ──(파싱 실패)──→ [STEP_2]
         ──("취소")────→ [IDLE]

[STEP_3] ──(파싱 성공)──→ [STEP_4: routines 질문]
         ──(파싱 실패)──→ [STEP_3]
         ──("취소")────→ [IDLE]

[STEP_4] ──(파싱 성공)──→ [GENERATING] (helperState → null, loading → true)
         ──("취소")────→ [IDLE]

[GENERATING] ──(GPT 성공)──→ [BATCH_CARD] (messages에 create_batch 카드 추가)
             ──(GPT 실패)──→ [IDLE] (에러 메시지)

[BATCH_CARD] ──(전체 등록)──→ [IDLE] (Firestore 저장 + 캘린더 갱신)
             ──(취소)──────→ [IDLE]
             ──(항목 제거)──→ [BATCH_CARD] (목록 업데이트)
```

### 내부 상태 표현

```javascript
helperState === null                                    // IDLE
helperState === { type: 'daily', step: 0, answers: {} } // STEP_0
helperState === { type: 'daily', step: 4, answers: { wakeUp, bedTime, meals, commute } } // STEP_4
// GENERATING: helperState = null + loading = true
// BATCH_CARD: messages 배열에 action === 'create_batch' 메시지 존재
```

---

## 데이터 흐름

### 온보딩 → 프로필 저장

```
사용자 답변 → helperParser로 파싱 → answers 객체에 누적
→ 5개 완료 시 profile 구성 → saveHelperProfile(userId, 'H01', profile)
```

### 프로필 → GPT → 배치 카드

```
profile → generateDailySchedule(profile)
→ GPT-4o-mini 호출 (전용 시스템 프롬프트)
→ JSON 파싱: { action: "create_batch", events: [...] }
→ messages에 { action: 'create_batch', batchEvents, batchDate } 추가
→ BatchConfirmCard 렌더링
```

### 배치 카드 → Firestore → 캘린더

```
"전체 등록" 클릭 → addBatchEvents(userId, events, date)
→ writeBatch로 Firestore 'events' 컬렉션에 원자적 저장
→ onEventCreated() → calendarKey++ → CalendarView 재조회
```

### 메시지 객체 구조 (create_batch)

```javascript
{
  role: 'assistant',
  content: '일상 스케줄이 완성되었어요!',
  action: 'create_batch',
  batchEvents: [
    { title: '기상', time: '07:00', duration: 30, category: 'routine' },
    { title: '아침 식사', time: '07:30', duration: 30, category: 'meal' },
    // ...
  ],
  batchDate: '2026-02-19',
  confirmed: false,
  cancelled: false,
}
```

---

## 엣지 케이스 및 에러 처리

| 상황 | 처리 방법 |
|------|----------|
| 시간 파싱 실패 ("아무거나 입력") | `parseTimeInput` → null → `helperParseRetry` 메시지 + 재질문 |
| 온보딩 중 "취소" 입력 | `isHelperCancel` 감지 → helperState 리셋 → `helperCancelled` 메시지 |
| GPT가 잘못된 JSON 반환 | `JSON.parse` try/catch → `helperGenerateError` 메시지 |
| GPT가 빈 events 배열 반환 | `events.length === 0` 체크 → 에러 메시지 |
| 배치 카드에서 모든 항목 제거 | "전체 등록" 버튼 `disabled` 처리 |
| 데모 모드 (Firebase 미설정) | `saveHelperProfile` → no-op, `addBatchEvents` → 실패 시 에러 표시 |
| Firestore 배치 저장 실패 | try/catch → `chatProcessError` 메시지 |
| 온보딩 중 도우미 재트리거 | `startHelperOnboarding`이 state를 리셋하고 처음부터 시작 |
| 기존 프로필 있는 사용자 | `getHelperProfile` → 온보딩 스킵 → 바로 GPT 생성 |
| 야간 근무자 (기상 22시, 취침 6시) | GPT 프롬프트가 24시간 래핑 처리 |

---

## 검증 체크리스트

### 기능 검증

- [ ] 채팅에서 "일상 스케줄 짜줘" 입력 시 온보딩 시작
- [ ] "하루 루틴 만들어줘" 등 다양한 트리거 문구 인식
- [ ] 온보딩 질문 5개 순차 표시
- [ ] 각 질문에 다양한 형식 답변 (한국어/영어/숫자)
- [ ] 파싱 실패 시 재질문 메시지 표시
- [ ] "취소" 입력 시 온보딩 중단
- [ ] 온보딩 완료 후 "스케줄 생성 중..." 로딩 표시
- [ ] 초록색 배치 카드에 8~15개 이벤트 목록 표시
- [ ] 개별 항목 X 버튼으로 제거 가능
- [ ] "전체 등록" 클릭 시 Firestore 저장 + 캘린더 갱신
- [ ] HelperSelector 아이콘 클릭 → 드롭다운 → "일상 도우미" 선택
- [ ] 두 번째 사용 시 온보딩 스킵 (저장된 프로필 사용)

### UI/UX 검증

- [ ] 다크모드에서 모든 UI 정상 표시
- [ ] 언어 전환(ko↔en) 시 모든 텍스트 전환
- [ ] 배치 카드 이벤트 목록 스크롤 정상
- [ ] 카테고리별 색상 뱃지 표시
- [ ] 입력창 HelperSelector 위치/크기 적절
- [ ] 로딩 중 입력/버튼 비활성화

### 호환성 검증

- [ ] 기존 채팅 기능 (일정 생성/이동/수정/삭제) 정상 동작
- [ ] 기존 캘린더 뷰에서 도우미 생성 이벤트 표시
- [ ] 도우미 생성 이벤트 드래그&드롭 이동 가능
- [ ] 도우미 생성 이벤트 완료 체크 가능

---

## 관련 문서

- [스케줄 도우미 기획서](../ideas/SCHEDULE_HELPER_PLAN_v1.0.md) — 전체 로드맵 (Phase 1~5)
- [AI 인격 부여 기능](../ideas/AI_PERSONA_FEATURE_v1.0.md) — Phase 5에서 연동 예정
- [개발 워크플로우](DEVELOPMENT_WORKFLOW_v1.0.md) — 프로젝트 초기 개발 가이드

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 — Phase 1 MVP 8단계 구현 가이드 |
