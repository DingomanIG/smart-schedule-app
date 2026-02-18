# 펫 케어 스케줄 도우미 기획서 v1.0

> 반려동물 돌봄 일정(밥, 산책, 화장실, 놀이 등)을 자동 생성하는 도우미
> 작성일: 2026-02-19 | 버전: 1.0

---

## 개요

반려동물 종류(강아지/고양이 등)와 기본 정보를 입력하면, AI가 최적의 일일 돌봄 스케줄을 자동 생성하여 캘린더에 등록하는 도우미 기능.

**핵심 가치**
- 돌봄 루틴 체계화 — 밥 시간, 산책, 화장실 청소 등을 잊지 않고 관리
- 동물별 맞춤 스케줄 — 강아지와 고양이는 돌봄 패턴이 다름
- 성장 단계별 최적화 — 아기/성체/노령 동물에 따라 다른 케어 주기

---

## 도우미 ID

| ID | 도우미 | 설명 | 우선순위 |
|----|--------|------|----------|
| H11 | 펫 케어 스케줄 도우미 | 반려동물 돌봄 일정 자동 생성 | Phase 2 확장 도우미 |

> SCHEDULE_HELPER_PLAN_v1.0.md의 도우미 체계에 H11로 편입

---

## 지원 동물 및 돌봄 항목

### 🐶 강아지

| 돌봄 항목 | 기본 주기 | 시간대 | 비고 |
|----------|----------|--------|------|
| 아침 밥 주기 | 매일 1회 | 07:00~08:00 | 사료량은 체중 기반 |
| 저녁 밥 주기 | 매일 1회 | 18:00~19:00 | 성견 기준 하루 2회 |
| 아침 산책 | 매일 1회 | 07:30~08:00 | 소형견 20분, 대형견 40분+ |
| 저녁 산책 | 매일 1회 | 18:30~19:30 | 날씨/계절 고려 |
| 배변 패드 교체 | 매일 1~2회 | 아침/저녁 | 실내견 해당 |
| 놀아주기 | 매일 1~2회 | 자유 | 15~30분 권장 |
| 간식 | 매일 1~2회 | 훈련 시 | 하루 칼로리 10% 이내 |
| 양치질 | 매일 1회 | 저녁 | 치석 예방 |
| 빗질/그루밍 | 주 2~3회 | 자유 | 장모종은 매일 |
| 목욕 | 월 1~2회 | 자유 | 과도한 목욕 주의 |
| 발톱 깎기 | 월 1~2회 | 자유 | |
| 귀 청소 | 주 1회 | 자유 | |
| 병원 정기 검진 | 연 1~2회 | — | 예방접종 포함 |
| 심장사상충 예방 | 월 1회 | — | 매달 같은 날 |
| 벼룩/진드기 예방 | 월 1회 | — | 봄~가을 필수 |

### 🐱 고양이

| 돌봄 항목 | 기본 주기 | 시간대 | 비고 |
|----------|----------|--------|------|
| 아침 밥 주기 | 매일 1회 | 07:00~08:00 | 건식/습식 혼합 권장 |
| 저녁 밥 주기 | 매일 1회 | 18:00~19:00 | 자율배식은 별도 설정 |
| 물 갈아주기 | 매일 1~2회 | 아침/저녁 | 정수기 사용 시 주기 조정 |
| 화장실 청소 (퍼내기) | 매일 1~2회 | 아침/저녁 | 모래 종류별 관리법 다름 |
| 화장실 전체 교체 | 주 1~2회 | 자유 | 모래 전체 교체 + 세척 |
| 놀아주기 | 매일 1~2회 | 아침/저녁 | 15~20분, 사냥놀이 권장 |
| 빗질/그루밍 | 주 2~3회 | 자유 | 장모종은 매일 |
| 발톱 깎기 | 2주 1회 | 자유 | |
| 귀 청소 | 2주 1회 | 자유 | |
| 병원 정기 검진 | 연 1~2회 | — | 예방접종 포함 |
| 구충제 | 3개월 1회 | — | 실내 전용 고양이도 필요 |
| 스크래처 점검 | 월 1회 | — | 마모 시 교체 |

---

## 사용자 플로우

### 최초 온보딩

```
1. 채팅에서 펫 케어 관련 요청
   ├─ "고양이 돌봄 스케줄 짜줘"
   ├─ "강아지 밥 시간 관리해줘"
   ├─ "반려동물 스케줄 도우미"
   └─ 또는 도우미 선택 UI에서 "펫 케어 도우미" 클릭

2. 온보딩 질문 (4~6개)
   ├─ "어떤 동물을 키우시나요?" → 🐶 강아지 / 🐱 고양이
   ├─ "이름이 뭐예요?" → 예: 초코
   ├─ "나이(개월)가 어떻게 되나요?" → 예: 24개월
   ├─ (강아지) "크기가 어느 정도인가요?" → 소형 / 중형 / 대형
   ├─ (강아지) "실내견인가요?" → 예/아니오
   ├─ (고양이) "실내만 생활하나요?" → 예/아니오
   └─ "보호자 기상 시간은?" → 예: 7시

3. AI가 일일 돌봄 스케줄 생성 (카드 목록)
   ├─ 07:00  🍽️ 초코 아침 밥 주기
   ├─ 07:15  🧹 화장실 청소
   ├─ 07:30  🚶 아침 산책 (30분)
   ├─ 12:00  💧 물 갈아주기
   ├─ 17:00  🎾 놀아주기 (20분)
   ├─ 18:00  🍽️ 초코 저녁 밥 주기
   ├─ 18:30  🚶 저녁 산책 (30분)
   ├─ 21:00  🧹 화장실 청소
   └─ 21:30  🪥 양치질

4. 사용자 확인/수정
   ├─ "전체 등록" → 일괄 Firestore 저장 (반복 일정으로)
   ├─ 개별 카드 시간 수정 → "산책 8시로 바꿔줘"
   ├─ 항목 삭제 → "양치질은 빼줘"
   └─ "다시 짜줘" → 재생성
```

### 다중 반려동물 지원

```
1. 반려동물 추가
   └─ "강아지 한 마리 더 등록할래" → 두 번째 반려동물 온보딩

2. 통합 스케줄 생성
   ├─ 07:00  🍽️ 초코(강아지) 아침 밥
   ├─ 07:05  🍽️ 나비(고양이) 아침 밥
   ├─ 07:15  🧹 나비 화장실 청소
   ├─ 07:30  🚶 초코 아침 산책
   └─ ...

3. 개별 관리
   └─ "초코 스케줄만 보여줘" → 특정 반려동물 필터
```

---

## 성장 단계별 스케줄 차이

### 🐶 강아지

| 항목 | 아기 (0~6개월) | 성견 (6개월~7년) | 노령견 (7년+) |
|------|---------------|-----------------|--------------|
| 밥 횟수 | 하루 3~4회 | 하루 2회 | 하루 2회 (소량) |
| 산책 | 짧게 10~15분 | 30분~1시간 | 짧게 20~30분 |
| 배변 교체 | 하루 3~4회 | 하루 1~2회 | 하루 2~3회 |
| 놀이 | 짧고 자주 (5분×4) | 20~30분×2 | 부드러운 놀이 15분 |
| 병원 | 매월 (접종 시리즈) | 연 1~2회 | 연 2~4회 (건강 체크) |
| 특이사항 | 사회화 훈련 포함 | 치석 관리 시작 | 관절 보조제, 체중 관리 |

### 🐱 고양이

| 항목 | 아기 (0~6개월) | 성묘 (6개월~10년) | 노령묘 (10년+) |
|------|---------------|-----------------|---------------|
| 밥 횟수 | 하루 3~4회 | 하루 2회 | 하루 2~3회 (소량) |
| 화장실 청소 | 하루 2~3회 | 하루 1~2회 | 하루 2~3회 |
| 놀이 | 짧고 자주 (5분×5) | 15~20분×2 | 부드러운 놀이 10분 |
| 병원 | 매월 (접종 시리즈) | 연 1~2회 | 연 2~4회 |
| 특이사항 | 사회화, 배변 훈련 | 중성화, 치석 관리 | 신장 관리, 관절 보조 |

---

## 데이터 구조

### 반려동물 프로필

```javascript
// src/services/helperProfile.js 에 추가
const petCareProfile = {
  helperId: 'H11',
  userId: 'uid',
  preferences: {
    pets: [
      {
        id: 'pet_001',
        name: '초코',
        type: 'dog',               // 'dog' | 'cat'
        breed: '말티즈',            // 품종 (선택)
        ageMonths: 24,              // 나이 (개월)
        size: 'small',              // 'small' | 'medium' | 'large' (강아지만)
        isIndoor: true,             // 실내 생활 여부
        healthNotes: '',            // 건강 특이사항 (선택)
        icon: '🐶'
      }
    ],
    ownerWakeUp: '07:00',          // 보호자 기상 시간
    ownerBedTime: '23:00',         // 보호자 취침 시간
    category: '펫 케어'             // 캘린더 카테고리
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 펫 케어 이벤트 스키마

```javascript
// 기존 events 컬렉션에 저장
{
  userId: 'uid',
  title: '🍽️ 초코 아침 밥 주기',
  startTime: Timestamp,
  endTime: Timestamp,              // 예상 소요 시간 포함
  category: '펫 케어',
  location: '',
  attendees: [],
  createdAt: Timestamp,
  createdVia: 'helper',

  // 펫 케어 도우미 전용 메타데이터
  helperMeta: {
    helperId: 'H11',
    petId: 'pet_001',
    petName: '초코',
    petType: 'dog',
    careType: 'feeding',           // 돌봄 유형 (아래 표 참조)
    isRecurring: true,             // 반복 일정 여부
    recurringPattern: 'daily'      // 'daily' | 'weekly' | 'monthly' | 'yearly'
  }
}
```

### 돌봄 유형 분류

| careType | 한글 | 아이콘 | 카드 색상 |
|----------|------|--------|----------|
| `feeding` | 밥 주기 | 🍽️ | 주황색 (orange) |
| `water` | 물 갈아주기 | 💧 | 하늘색 (sky) |
| `walk` | 산책 | 🚶 | 초록색 (green) |
| `toilet` | 화장실 청소 | 🧹 | 갈색 (amber) |
| `play` | 놀아주기 | 🎾 | 보라색 (purple) |
| `grooming` | 그루밍/빗질 | ✨ | 분홍색 (pink) |
| `health` | 건강관리 (양치/귀 등) | 🩺 | 파란색 (blue) |
| `vet` | 병원/예방접종 | 🏥 | 빨간색 (red) |
| `medicine` | 약/예방약 | 💊 | 빨간색 (red) |

---

## GPT 프롬프트 설계

### 시스템 프롬프트

```
[시스템 프롬프트]
너는 반려동물 돌봄 스케줄 전문가야.
반려동물 정보를 바탕으로 하루 돌봄 스케줄을 JSON 배열로 생성해.

규칙:
- 동물 종류(강아지/고양이)에 맞는 돌봄 항목 생성
- 나이(개월 수)에 따라 밥 횟수, 산책 시간, 놀이 강도 조절
- 보호자 기상~취침 시간 안에 배분
- 각 항목에 예상 소요 시간 포함
- 반려동물 이름을 title에 포함
- category는 "펫 케어"로 통일
- 아이콘을 title 앞에 붙여줘

강아지 필수 항목: 밥(2회), 산책(2회), 배변 관리, 놀이
고양이 필수 항목: 밥(2회), 물 교체, 화장실 청소(1~2회), 놀이

선택 항목 (주기적): 빗질, 양치, 발톱, 귀 청소, 목욕, 병원, 예방약

[사용자 프롬프트]
반려동물: {petName} ({petType})
나이: {ageMonths}개월
크기: {size}
실내견 여부: {isIndoor}
보호자 기상: {wakeUp}
보호자 취침: {bedTime}
오늘 날짜: {today}

[응답 형식]
{
  "action": "create_batch",
  "events": [
    {
      "title": "🍽️ 초코 아침 밥 주기",
      "startTime": "07:00",
      "endTime": "07:10",
      "category": "펫 케어",
      "careType": "feeding",
      "petId": "pet_001",
      "petName": "초코",
      "petType": "dog",
      "isRecurring": true,
      "recurringPattern": "daily"
    },
    ...
  ],
  "weeklyEvents": [
    {
      "title": "✨ 초코 빗질",
      "dayOfWeek": [1, 3, 5],
      "startTime": "20:00",
      "endTime": "20:15",
      "category": "펫 케어",
      "careType": "grooming",
      "isRecurring": true,
      "recurringPattern": "weekly"
    }
  ],
  "monthlyEvents": [
    {
      "title": "💊 초코 심장사상충 예방약",
      "dayOfMonth": 1,
      "startTime": "09:00",
      "endTime": "09:05",
      "category": "펫 케어",
      "careType": "medicine",
      "isRecurring": true,
      "recurringPattern": "monthly"
    }
  ]
}
```

---

## UI 설계

### 반려동물 등록 UI

```
┌─────────────────────────────────────┐
│  🐾 펫 케어 스케줄 도우미           │
│                                     │
│  어떤 동물을 키우시나요?            │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │   🐶     │  │   🐱     │        │
│  │  강아지   │  │  고양이   │        │
│  │          │  │    ✓     │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  이름: [나비          ]             │
│  나이: [24  ]개월                   │
│                                     │
│  (고양이 선택 시)                    │
│  ☑ 실내만 생활                      │
│                                     │
│  (강아지 선택 시)                    │
│  크기: ○ 소형  ● 중형  ○ 대형      │
│  ☑ 실내견                           │
│                                     │
│  [다음 →]                           │
└─────────────────────────────────────┘
```

### 돌봄 항목 선택 UI

```
┌─────────────────────────────────────┐
│  나비(고양이)의 돌봄 항목            │
│                                     │
│  매일 할 일                         │
│  ☑ 🍽️ 밥 주기 (하루 2회)           │
│  ☑ 💧 물 갈아주기                   │
│  ☑ 🧹 화장실 청소                   │
│  ☑ 🎾 놀아주기                      │
│                                     │
│  주기적으로 할 일                    │
│  ☑ ✨ 빗질 (주 3회)                 │
│  ☐ 🩺 귀 청소 (2주 1회)            │
│  ☐ 🩺 발톱 깎기 (2주 1회)          │
│                                     │
│  건강 관리                          │
│  ☑ 💊 구충제 (3개월 1회)            │
│  ☑ 🏥 정기 검진 (연 1회)            │
│                                     │
│  보호자 기상 시간: [07:00]          │
│                                     │
│  [스케줄 생성하기 →]                 │
└─────────────────────────────────────┘
```

### 생성된 스케줄 카드 예시

```
┌─────────────────────────────────────┐
│  🐱 나비의 하루 돌봄 스케줄          │
│                                     │
│  ┌─ 매일 반복 ─────────────────┐   │
│  │ 🍽️ 07:00  나비 아침 밥 주기  │   │
│  │ 💧 07:05  물 갈아주기         │   │
│  │ 🧹 07:15  화장실 청소         │   │
│  │ 🎾 10:00  나비 놀아주기 (15분)│   │
│  │ 🍽️ 18:00  나비 저녁 밥 주기  │   │
│  │ 💧 18:05  물 갈아주기         │   │
│  │ 🧹 21:00  화장실 청소         │   │
│  │ 🎾 21:15  나비 놀아주기 (15분)│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─ 주 3회 (월,수,금) ────────┐    │
│  │ ✨ 20:00  나비 빗질 (10분)  │    │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─ 월 1회 ───────────────────┐    │
│  │ 💊 매월 1일  구충제 투약     │    │
│  └─────────────────────────────┘   │
│                                     │
│  [전체 등록]  [수정하기]  [다시 짜줘]│
└─────────────────────────────────────┘
```

---

## 필요한 파일 변경

| 파일 | 변경 내용 | 난이도 |
|------|----------|--------|
| `src/services/openai.js` | 펫 케어 도우미용 시스템 프롬프트, 일정 파싱 로직 | 보통 |
| `src/services/schedule.js` | `addBatchEvents()` 재활용, 반복 일정 메타데이터 처리 | 쉬움 |
| `src/services/helperProfile.js` | 펫 프로필 스키마 추가 (`H11`) | 쉬움 |
| `src/components/ChatInterface.jsx` | 펫 케어 온보딩 플로우, 돌봄 카드 렌더링 | 보통 |
| `src/components/HelperSelector.jsx` | 펫 케어 도우미 항목 추가 | 쉬움 |
| `src/components/PetCareCard.jsx` | **신규** — 돌봄 일정 확인 카드 (유형별 색상/아이콘) | 보통 |
| `src/components/PetRegistration.jsx` | **신규** — 반려동물 등록 온보딩 UI | 보통 |
| `src/data/petCareDefaults.js` | **신규** — 동물별 기본 돌봄 항목 및 주기 데이터 | 쉬움 |
| `src/locales/en.js`, `ko.js` | 펫 케어 도우미 관련 번역 키 추가 | 쉬움 |

---

## 기본 돌봄 데이터

```javascript
// src/data/petCareDefaults.js
export const PET_CARE_ITEMS = {
  dog: {
    daily: [
      { id: 'feeding_am', careType: 'feeding', label: '아침 밥 주기', icon: '🍽️', defaultTime: '07:00', duration: 10, required: true },
      { id: 'feeding_pm', careType: 'feeding', label: '저녁 밥 주기', icon: '🍽️', defaultTime: '18:00', duration: 10, required: true },
      { id: 'walk_am', careType: 'walk', label: '아침 산책', icon: '🚶', defaultTime: '07:30', duration: { small: 20, medium: 30, large: 40 }, required: true },
      { id: 'walk_pm', careType: 'walk', label: '저녁 산책', icon: '🚶', defaultTime: '18:30', duration: { small: 20, medium: 30, large: 40 }, required: true },
      { id: 'toilet', careType: 'toilet', label: '배변 패드 교체', icon: '🧹', defaultTime: '07:15', duration: 5, required: true, indoorOnly: true },
      { id: 'play', careType: 'play', label: '놀아주기', icon: '🎾', defaultTime: '20:00', duration: 20, required: true },
    ],
    weekly: [
      { id: 'grooming', careType: 'grooming', label: '빗질', icon: '✨', daysOfWeek: [1, 3, 5], defaultTime: '20:30', duration: 15 },
      { id: 'teeth', careType: 'health', label: '양치질', icon: '🪥', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], defaultTime: '21:00', duration: 5 },
      { id: 'ear', careType: 'health', label: '귀 청소', icon: '🩺', daysOfWeek: [6], defaultTime: '10:00', duration: 10 },
    ],
    monthly: [
      { id: 'heartworm', careType: 'medicine', label: '심장사상충 예방약', icon: '💊', dayOfMonth: 1, defaultTime: '09:00', duration: 5 },
      { id: 'flea', careType: 'medicine', label: '벼룩/진드기 예방', icon: '💊', dayOfMonth: 1, defaultTime: '09:05', duration: 5 },
      { id: 'nail', careType: 'grooming', label: '발톱 깎기', icon: '✂️', dayOfMonth: 15, defaultTime: '10:00', duration: 10 },
    ],
    yearly: [
      { id: 'vet_checkup', careType: 'vet', label: '정기 건강 검진', icon: '🏥', month: 3, dayOfMonth: 1 },
      { id: 'vaccination', careType: 'vet', label: '예방접종', icon: '💉', month: 3, dayOfMonth: 1 },
    ]
  },
  cat: {
    daily: [
      { id: 'feeding_am', careType: 'feeding', label: '아침 밥 주기', icon: '🍽️', defaultTime: '07:00', duration: 10, required: true },
      { id: 'feeding_pm', careType: 'feeding', label: '저녁 밥 주기', icon: '🍽️', defaultTime: '18:00', duration: 10, required: true },
      { id: 'water', careType: 'water', label: '물 갈아주기', icon: '💧', defaultTime: '07:05', duration: 5, required: true },
      { id: 'toilet_am', careType: 'toilet', label: '화장실 청소', icon: '🧹', defaultTime: '07:15', duration: 10, required: true },
      { id: 'toilet_pm', careType: 'toilet', label: '화장실 청소', icon: '🧹', defaultTime: '21:00', duration: 10, required: true },
      { id: 'play', careType: 'play', label: '놀아주기', icon: '🎾', defaultTime: '10:00', duration: 15, required: true },
    ],
    weekly: [
      { id: 'grooming', careType: 'grooming', label: '빗질', icon: '✨', daysOfWeek: [1, 3, 5], defaultTime: '20:00', duration: 10 },
      { id: 'toilet_full', careType: 'toilet', label: '화장실 전체 교체', icon: '🧹', daysOfWeek: [0], defaultTime: '10:00', duration: 20 },
      { id: 'ear', careType: 'health', label: '귀 청소', icon: '🩺', daysOfWeek: [6], defaultTime: '10:00', duration: 10, biweekly: true },
      { id: 'nail', careType: 'grooming', label: '발톱 깎기', icon: '✂️', daysOfWeek: [6], defaultTime: '10:15', duration: 10, biweekly: true },
    ],
    monthly: [
      { id: 'deworming', careType: 'medicine', label: '구충제', icon: '💊', dayOfMonth: 1, defaultTime: '09:00', duration: 5, intervalMonths: 3 },
      { id: 'scratcher', careType: 'health', label: '스크래처 점검', icon: '🔍', dayOfMonth: 15, defaultTime: '10:00', duration: 5 },
    ],
    yearly: [
      { id: 'vet_checkup', careType: 'vet', label: '정기 건강 검진', icon: '🏥', month: 3, dayOfMonth: 1 },
      { id: 'vaccination', careType: 'vet', label: '예방접종', icon: '💉', month: 3, dayOfMonth: 1 },
    ]
  }
}

// 나이별 조정 규칙
export const AGE_ADJUSTMENTS = {
  dog: {
    baby: { maxMonths: 6, feedingCount: 4, walkDuration: 0.5, note: '사회화 훈련 포함' },
    adult: { maxMonths: 84, feedingCount: 2, walkDuration: 1.0, note: '표준 성견 케어' },
    senior: { maxMonths: Infinity, feedingCount: 2, walkDuration: 0.6, note: '관절 보조, 체중 관리' }
  },
  cat: {
    baby: { maxMonths: 6, feedingCount: 4, playDuration: 0.8, note: '사회화, 배변 훈련' },
    adult: { maxMonths: 120, feedingCount: 2, playDuration: 1.0, note: '표준 성묘 케어' },
    senior: { maxMonths: Infinity, feedingCount: 3, playDuration: 0.6, note: '신장 관리, 관절 보조' }
  }
}
```

---

## 채팅 인식 패턴

```
// 도우미 활성화 트리거
"고양이 돌봄 스케줄 짜줘"
"강아지 밥 시간 관리"
"반려동물 스케줄 도우미"
"펫 케어 도우미"
"우리 집 고양이 일정"

// 일정 수정
"산책 시간 8시로 바꿔줘"
"밥 하루 3번으로 늘려줘"
"놀이 시간 30분으로"

// 반려동물 추가
"고양이 한 마리 더 등록"
"강아지 추가할래"

// 특정 항목 조회
"오늘 초코 돌봄 일정"
"이번 주 병원 일정"

// 건강 관리 알림
"심장사상충 약 언제야?"
"다음 병원 검진 일정"
```

---

## 장기 로드맵

### Phase 1: MVP — 강아지/고양이 기본 돌봄 스케줄

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 1 | 기본 돌봄 데이터 (`petCareDefaults.js`) | 쉬움 |
| 2 | 반려동물 등록 UI (`PetRegistration.jsx`) | 보통 |
| 3 | 돌봄 항목 선택 온보딩 플로우 | 보통 |
| 4 | GPT 펫 케어 프롬프트 설계 | 보통 |
| 5 | 돌봄 카드 컴포넌트 (`PetCareCard.jsx`) | 보통 |
| 6 | 일괄 등록 (기존 `create_batch` 재활용) | 쉬움 |
| 7 | 테스트 및 다듬기 | 보통 |

### Phase 2: 반복 일정 연동

| 기능 | 설명 |
|------|------|
| 반복 일정 등록 | 매일/주간/월간 반복 일정으로 캘린더에 자동 생성 |
| 완료 체크 | 돌봄 항목 완료/미완료 체크 기능 |
| 알림 | 돌봄 시간 5분 전 알림 |

### Phase 3: 스마트 기능

| 기능 | 설명 |
|------|------|
| 건강 기록 | 병원 방문, 체중 변화, 투약 기록 관리 |
| 성장 자동 감지 | 나이 증가에 따라 스케줄 자동 조정 제안 |
| 날씨 연동 | 비오는 날 산책 시간 조정 알림 |
| 다중 반려동물 최적화 | 여러 반려동물 스케줄 겹침 최소화 |

### Phase 4: 확장 동물 지원

| 동물 | 주요 돌봄 항목 |
|------|---------------|
| 🐹 햄스터 | 밥, 물, 케이지 청소, 운동 시간 |
| 🐰 토끼 | 밥, 건초, 케이지 청소, 자유 시간 |
| 🐦 앵무새 | 밥, 물, 케이지 청소, 소통 시간 |
| 🐠 물고기 | 밥, 수조 물 교체, 필터 청소 |
| 🐢 거북이 | 밥, 수조 관리, UV 램프 점검 |

---

## 기술 의사결정

### 스케줄 생성 방식

| 방식 | 장점 | 단점 |
|------|------|------|
| **GPT 완전 생성** | 유연한 커스터마이징 | API 비용, 일관성 부족 |
| **로컬 템플릿 기반** | 빠르고 일관적, 비용 없음 | 유연성 제한 |
| **하이브리드 (MVP 채택)** | 기본 템플릿 + GPT 시간 배치/조정 | 구현 약간 복잡 |

**MVP 결정**: 하이브리드 — `petCareDefaults.js`에 동물별 기본 돌봄 항목을 두고, GPT가 보호자 생활 패턴에 맞게 시간대를 최적 배치

### 반복 일정 처리

| 방식 | 채택 | 이유 |
|------|------|------|
| 당일 일정만 생성 | **MVP** | 반복 시스템 미구현 상태에서 단순하게 시작 |
| 1주일치 일괄 생성 | Phase 2 | 반복 일정 기능 구현 후 |
| 진정한 반복 이벤트 | Phase 3 | recurrence 스키마 확장 후 |

---

## MVP 완료 기준

- [ ] 도우미 선택에서 "펫 케어 도우미" 선택 가능
- [ ] 강아지/고양이 중 선택 가능
- [ ] 반려동물 이름, 나이, 크기 입력 가능
- [ ] 돌봄 항목 선택 UI에서 원하는 항목 체크/해제
- [ ] AI가 보호자 생활 패턴에 맞춘 하루 돌봄 스케줄 생성
- [ ] 유형별 색상/아이콘이 적용된 카드로 표시
- [ ] "전체 등록" 클릭 시 Firestore에 일괄 저장
- [ ] 캘린더에서 펫 케어 일정 확인 가능
- [ ] 개별 카드 시간 수정/삭제 가능

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| 돌봄 주기 정보가 품종별로 다름 | MVP는 일반적 권장 기준 사용, 사용자 수정 허용 |
| 반복 일정 시스템 미구현 | MVP는 당일 일정만 생성, Phase 2에서 반복 시스템 |
| 다중 반려동물 스케줄 복잡도 | 반려동물별 독립 스케줄 생성 후 시간 조율 |
| 건강 관련 조언 책임 | 건강 정보는 "참고용"임을 명시, 수의사 상담 권장 문구 |

---

## 관련 문서

- [스케줄 도우미 기획서](SCHEDULE_HELPER_PLAN_v1.0.md) — 도우미 시스템 전체 기획 (H11로 편입)
- [게임 스케줄 도우미](GAME_SCHEDULE_HELPER_v1.0.md) — 동일 도우미 시스템의 게임 분야
- [AI 인격 부여 기능](AI_PERSONA_FEATURE_v1.0.md) — 펫 케어 도우미에도 인격 적용 가능
- [개선 아이디어](IMPROVEMENT_IDEAS_v1.1.md) — A카테고리(AI 기능 강화)와 연관

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 — MVP(강아지/고양이 돌봄 스케줄) + 장기 로드맵 |
