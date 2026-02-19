# 다이어트 스케줄 도우미 기획서 v1.0

> 식단 + 운동 통합 다이어트 스케줄 관리 도우미 (H05)
> 작성일: 2026-02-19 | 버전: 1.0

---

## 개요

사용자의 다이어트 목표(감량/유지/증량)에 맞춰 식단과 운동을 통합 관리하는 스케줄 도우미.
하루 섭취 칼로리, 식사 구성, 운동 계획을 하나의 뷰에서 관리하고, 캘린더에 등록하여 실천을 추적한다.

**핵심 가치**
- 식단 + 운동을 하나의 플로우로 통합 관리
- 목표 체중 기반 칼로리 자동 계산
- 주간 단위 식단/운동 스케줄 일괄 생성

---

## 기본 정보

| 항목 | 내용 |
|------|------|
| 도우미 ID | H05 |
| 유형 | B (전용 뷰) |
| 테마 색상 | lime |
| 진입 방식 | 채팅 트리거 + HelperSelector -> 전용 탭 뷰 |
| 뷰 컴포넌트 | `DietHelperView.jsx` |
| 확인 카드 | `DietCard.jsx` (lime 테마) |
| 데이터 파일 | `src/data/dietDefaults.js` |

---

## 카테고리 정의

| 카테고리 | 한국어 | 색상 | 설명 |
|----------|--------|------|------|
| `breakfast` | 아침 | amber | 아침 식사 |
| `lunch` | 점심 | orange | 점심 식사 |
| `dinner` | 저녁 | red | 저녁 식사 |
| `snack` | 간식 | pink | 간식/보충식 |
| `cardio` | 유산소 | sky | 유산소 운동 |
| `weight` | 근력 | indigo | 웨이트/근력 운동 |
| `stretch` | 스트레칭 | violet | 스트레칭/요가 |
| `water` | 수분 | cyan | 물 섭취 알림 |

### 카테고리 스타일 (dietDefaults.js)

```javascript
export const DIET_CATEGORY_STYLES = {
  breakfast: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    label: '아침',
  },
  lunch: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    label: '점심',
  },
  dinner: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    label: '저녁',
  },
  snack: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    text: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    label: '간식',
  },
  cardio: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    label: '유산소',
  },
  weight: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    label: '근력',
  },
  stretch: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    label: '스트레칭',
  },
  water: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    label: '수분',
  },
}
```

---

## 프로필 데이터 스키마

```javascript
// Firestore 문서 ID: {userId}_H05
{
  userId: string,
  helperId: 'H05',

  // 신체 정보
  body: {
    gender: 'male' | 'female',   // 성별
    age: number,                  // 나이
    height: number,               // 키 (cm)
    currentWeight: number,        // 현재 체중 (kg)
    targetWeight: number,         // 목표 체중 (kg)
  },

  // 다이어트 목표
  goal: {
    type: 'lose' | 'maintain' | 'gain',  // 감량 / 유지 / 증량
    pace: 'slow' | 'normal' | 'fast',    // 속도 (주 0.25kg / 0.5kg / 0.75kg)
    targetDate: string | null,            // 목표 달성일 (YYYY-MM-DD) 또는 null
  },

  // 식단 설정
  diet: {
    mealsPerDay: 3 | 4 | 5,              // 하루 식사 횟수 (3끼 / 3끼+간식 / 3끼+간식2)
    mealTimes: {
      breakfast: '08:00',
      lunch: '12:00',
      dinner: '18:30',
      snack1: '10:30',                    // mealsPerDay >= 4일 때
      snack2: '15:30',                    // mealsPerDay === 5일 때
    },
    restrictions: [],                     // 식이 제한 (예: 'vegetarian', 'lactose', 'gluten')
    preference: 'korean' | 'mixed',       // 한식 위주 / 혼합
  },

  // 운동 설정
  exercise: {
    level: 'beginner' | 'intermediate' | 'advanced',  // 운동 수준
    daysPerWeek: number,                  // 주 운동 횟수 (1~7)
    preferredTime: 'morning' | 'afternoon' | 'evening',  // 선호 시간대
    types: [],                            // 선호 운동 (예: 'running', 'gym', 'home', 'yoga', 'swimming')
    duration: 30 | 45 | 60 | 90,         // 1회 운동 시간 (분)
  },

  // 수분 섭취
  water: {
    enabled: true,                        // 수분 알림 사용 여부
    targetLiters: 2.0,                    // 하루 목표 (L)
    intervalHours: 2,                     // 알림 간격 (시간)
  },

  updatedAt: Timestamp,
}
```

---

## 사용자 플로우

### 1단계: 진입

```
방법 A: 채팅에서 "다이어트 스케줄 짜줘" 입력
방법 B: HelperSelector > "다이어트 도우미" 클릭
  -> 전용 탭 뷰 (DietHelperView) 전환
```

### 2단계: 프로필 설정 (최초 1회)

DietHelperView 내부에서 단계별 설정 폼을 표시한다.

```
Step 1: 신체 정보
  - 성별 (남/여 토글)
  - 나이
  - 키 (cm)
  - 현재 체중 (kg)
  - 목표 체중 (kg)

Step 2: 다이어트 목표
  - 자동 판별: 현재 > 목표 → "감량", 현재 < 목표 → "증량", 동일 → "유지"
  - 속도 선택: 느림(주 0.25kg) / 보통(주 0.5kg) / 빠름(주 0.75kg)
  - 예상 소요 기간 자동 계산 표시

Step 3: 식단 설정
  - 하루 식사 횟수 (3끼 / 3끼+간식1 / 3끼+간식2)
  - 식사 시간 설정
  - 식이 제한 (선택사항: 채식, 유제품 제외, 글루텐 프리 등)
  - 식단 스타일 (한식 위주 / 혼합)

Step 4: 운동 설정
  - 운동 수준 (입문 / 중급 / 고급)
  - 주 운동 횟수
  - 선호 시간대 (아침 / 오후 / 저녁)
  - 선호 운동 종류 (복수 선택)
  - 1회 운동 시간

Step 5: 수분 섭취 (선택)
  - 수분 알림 사용 여부
  - 하루 목표량
  - 알림 간격
```

### 3단계: 칼로리 자동 계산

프로필 저장 즉시 클라이언트에서 계산한다 (GPT 호출 불필요).

```javascript
// BMR (기초대사량) - Mifflin-St Jeor 공식
// 남성: 10 * 체중(kg) + 6.25 * 키(cm) - 5 * 나이 + 5
// 여성: 10 * 체중(kg) + 6.25 * 키(cm) - 5 * 나이 - 161

// TDEE (총 소모 칼로리) = BMR * 활동 계수
// beginner: 1.375 (가벼운 활동)
// intermediate: 1.55 (보통 활동)
// advanced: 1.725 (높은 활동)

// 목표 칼로리
// 감량 slow: TDEE - 250
// 감량 normal: TDEE - 500
// 감량 fast: TDEE - 750
// 유지: TDEE
// 증량 slow: TDEE + 250
// 증량 normal: TDEE + 500
// 증량 fast: TDEE + 750
```

### 4단계: 일일 스케줄 생성

프로필 기반으로 일일 식단 + 운동 스케줄을 생성한다.

**식단 칼로리 배분 기본 규칙** (dietDefaults.js에 정의):

```javascript
export const CALORIE_DISTRIBUTION = {
  3: { breakfast: 0.30, lunch: 0.40, dinner: 0.30 },
  4: { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack1: 0.10 },
  5: { breakfast: 0.25, lunch: 0.30, dinner: 0.25, snack1: 0.10, snack2: 0.10 },
}
```

**생성 예시** (목표 1800kcal, 3끼+간식, 저녁 운동):

```
08:00  아침 식사 (540kcal)      [아침]
10:30  간식 (180kcal)           [간식]
12:00  점심 식사 (630kcal)      [점심]
15:00  수분 섭취 (500ml)        [수분]
18:30  저녁 식사 (450kcal)      [저녁]
19:30  유산소 운동 (30분)       [유산소]
20:00  근력 운동 (30분)         [근력]
20:30  스트레칭 (10분)          [스트레칭]
```

### 5단계: 캘린더 등록

확인 카드에서 "전체 등록" 클릭 시 선택한 기간(1일/7일/30일)의 이벤트를 Firestore에 배치 저장.

---

## DietHelperView 구성

### 화면 레이아웃

```
┌──────────────────────────────────────────┐
│ 다이어트 도우미                          │
│                                          │
│ ┌─ 오늘의 요약 ────────────────────────┐ │
│ │ 목표: 1,800 kcal                     │ │
│ │ 탄수화물 45% / 단백질 30% / 지방 25% │ │
│ │ [프로필 수정]                         │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ── 식단 ──                               │
│ ┌──────────────────────────────────────┐ │
│ │ 08:00  아침 식사  540kcal  [아침]    │ │
│ │ 10:30  간식      180kcal  [간식]    │ │
│ │ 12:00  점심 식사  630kcal  [점심]    │ │
│ │ 18:30  저녁 식사  450kcal  [저녁]    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ── 운동 ──                               │
│ ┌──────────────────────────────────────┐ │
│ │ 19:30  유산소 (러닝 30분)  [유산소]  │ │
│ │ 20:00  근력 (상체 30분)    [근력]    │ │
│ │ 20:30  스트레칭 (10분)     [스트레칭] │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ── 수분 ──                               │
│ ┌──────────────────────────────────────┐ │
│ │ 09:00 / 11:00 / 13:00 / 15:00       │ │
│ │ 17:00 / 19:00 / 21:00   (500ml씩)   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [캘린더에 등록]  기간: [1일|7일|30일]    │
└──────────────────────────────────────────┘
```

### 주요 인터랙션

| 기능 | 설명 |
|------|------|
| 프로필 수정 | 요약 카드의 "프로필 수정" 버튼 -> 설정 폼 재표시 |
| 식사 항목 추가 | 식단 섹션 "+" 버튼 -> 간식/보충식 추가 |
| 식사 항목 제거 | 각 행 "-" 버튼 -> 항목 제거 + 잔여 칼로리 재배분 |
| 운동 항목 수정 | 운동 종류/시간 변경 |
| 기간 선택 | 1일(오늘만) / 7일(이번 주) / 30일(이번 달) 토글 |
| 캘린더 등록 | DietCard로 확인 후 배치 저장 |

---

## GPT 프롬프트 설계 (선택적 사용)

기본 스케줄은 클라이언트에서 규칙 기반으로 생성하되,
사용자가 "식단 추천해줘" 등 자연어로 요청 시 GPT를 호출하여 구체적 메뉴를 제안한다.

```
[시스템 프롬프트]
너는 한국인 대상 다이어트 식단 설계 전문가야.
사용자 정보를 바탕으로 하루 식단을 JSON 배열로 생성해.
규칙:
- 목표 칼로리를 식사 횟수에 맞게 배분
- 한국 음식 기반으로 현실적인 메뉴 제안
- 단백질/탄수화물/지방 비율 준수
- 각 식사마다 구체적 음식 이름과 양 포함
- 식이 제한 사항 반드시 반영

[사용자 프롬프트]
목표: 감량 (1800kcal/일)
식사: 3끼 + 간식 1회
제한: 없음
선호: 한식 위주

[응답 형식]
{
  "action": "create_batch",
  "events": [
    {
      "title": "아침: 현미밥 + 된장찌개 + 계란프라이",
      "startTime": "08:00",
      "endTime": "08:30",
      "category": "breakfast",
      "metadata": { "kcal": 540, "protein": 25, "carbs": 65, "fat": 18 }
    },
    ...
  ]
}
```

---

## 확인 카드 (DietCard) 설계

### 기본 구조

```
┌─────────────────────────────────────────┐
│  다이어트 스케줄              8개 일정   │
│  목표: 1,800 kcal/일                    │
│  기간: 2026-02-19 ~ 2026-02-25 (7일)   │
│  ── 1일치 템플릿 ──                      │
│ ┌─────────────────────────────────────┐ │
│ │ 08:00  아침 식사   540kcal  [아침]  │ │
│ │ 10:30  간식        180kcal  [간식]  │ │
│ │ 12:00  점심 식사   630kcal  [점심]  │ │
│ │ 18:30  저녁 식사   450kcal  [저녁]  │ │
│ │ 19:30  유산소      30분    [유산소] │ │
│ │ 20:00  근력 운동   30분    [근력]   │ │
│ │ 20:30  스트레칭    10분   [스트레칭] │ │
│ │ 15:00  수분 섭취   -       [수분]   │ │
│ └─────────────────────────────────────┘ │
│ [전체 등록] [취소]                       │
└─────────────────────────────────────────┘
```

### DietCard Props

```jsx
export default function DietCard({
  events = [],
  days = [],
  targetKcal,
  onConfirmAll,
  onRemoveItem,
  onCancel,
  confirmed,
  cancelled,
}) {
  // lime 테마 적용
  // 헤더에 목표 칼로리 표시
  // 식사 항목은 kcal 표시, 운동 항목은 분 표시
}
```

---

## 기본값 데이터 (dietDefaults.js)

```javascript
// 활동 계수
export const ACTIVITY_MULTIPLIER = {
  beginner: 1.375,
  intermediate: 1.55,
  advanced: 1.725,
}

// 목표별 칼로리 조정값
export const CALORIE_ADJUSTMENT = {
  lose:     { slow: -250, normal: -500, fast: -750 },
  maintain: { slow: 0, normal: 0, fast: 0 },
  gain:     { slow: 250, normal: 500, fast: 750 },
}

// 식사 횟수별 칼로리 배분 비율
export const CALORIE_DISTRIBUTION = {
  3: { breakfast: 0.30, lunch: 0.40, dinner: 0.30 },
  4: { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack1: 0.10 },
  5: { breakfast: 0.25, lunch: 0.30, dinner: 0.25, snack1: 0.10, snack2: 0.10 },
}

// 영양소 비율 (기본값)
export const MACRO_RATIO = {
  lose:     { carbs: 0.40, protein: 0.35, fat: 0.25 },
  maintain: { carbs: 0.45, protein: 0.30, fat: 0.25 },
  gain:     { carbs: 0.50, protein: 0.30, fat: 0.20 },
}

// 운동 종류별 기본 시간
export const EXERCISE_DEFAULTS = {
  running:  { label: '러닝', category: 'cardio', duration: 30 },
  cycling:  { label: '자전거', category: 'cardio', duration: 30 },
  swimming: { label: '수영', category: 'cardio', duration: 45 },
  gym:      { label: '헬스', category: 'weight', duration: 60 },
  home:     { label: '홈트레이닝', category: 'weight', duration: 30 },
  yoga:     { label: '요가', category: 'stretch', duration: 45 },
  pilates:  { label: '필라테스', category: 'stretch', duration: 50 },
  walking:  { label: '걷기', category: 'cardio', duration: 30 },
}

// 식이 제한 옵션
export const DIET_RESTRICTIONS = [
  { key: 'vegetarian', label: '채식' },
  { key: 'vegan', label: '비건' },
  { key: 'lactose', label: '유제품 제외' },
  { key: 'gluten', label: '글루텐 프리' },
  { key: 'lowcarb', label: '저탄수화물' },
  { key: 'keto', label: '키토' },
]
```

---

## 일수 선택 패턴

다이어트 도우미는 유형 B(전용 뷰)이므로 뷰 내부에 기간 선택 토글을 배치한다.
채팅 트리거로 진입한 경우에도 탭 전환 후 전용 뷰에서 기간을 선택한다.

> 참고: DEV_GUIDE 8.4절 "일수 선택 패턴" 표준을 따른다.

### 진입 경로별 일수 선택

```
경로 1: 전용 뷰 직접 진입 (탭 클릭 / HelperSelector)
  프로필 설정 완료 → 뷰 하단 기간 토글에서 선택 → "캘린더에 등록" 클릭

경로 2: 채팅 트리거 ("다이어트 스케줄 짜줘")
  트리거 감지 → 안내 메시지 → 전용 뷰 탭 전환 → 이후 경로 1과 동일
```

### 기간 선택 UI (DietHelperView 하단)

```jsx
const [registerDays, setRegisterDays] = useState(7)

<div className="flex items-center gap-2">
  <span className="text-xs text-gray-500 dark:text-gray-400">
    {t('helperDietRegisterPeriod')}
  </span>
  {[1, 7, 30].map((d) => (
    <button
      key={d}
      onClick={() => setRegisterDays(d)}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
        registerDays === d
          ? 'bg-lime-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}
    >
      {t(`helperDietDay${d}`)}
    </button>
  ))}
</div>
```

### 일수별 생성 규칙

| 기간 | 동작 | 확인 카드 표시 |
|------|------|---------------|
| 1일 | 오늘 날짜 기준 1일치 이벤트 생성 | 단일 리스트 (8.1 패턴) |
| 7일 | 오늘~6일 후까지 동일 템플릿 반복 | 멀티데이 (8.2 패턴): "7일 -- N개 일정" |
| 30일 | 오늘~29일 후까지 동일 템플릿 반복 | 멀티데이 (8.2 패턴): "30일 -- N개 일정" |

### 운동 요일 분배 (7일 이상)

운동 스케줄은 `exercise.daysPerWeek`에 따라 요일별 다른 루틴을 배분한다.
식단은 매일 동일하지만, 운동은 주간 단위로 순환한다.

```
예시: daysPerWeek = 5, types = ['gym', 'running']

월: 근력 (상체)     → weight 카테고리
화: 유산소 (러닝)   → cardio 카테고리
수: 근력 (하체)     → weight 카테고리
목: 휴식            → 운동 이벤트 없음
금: 근력 (전신)     → weight 카테고리
토: 유산소 (러닝)   → cardio 카테고리
일: 휴식            → 운동 이벤트 없음
```

### 등록 버튼 + 기간 배치

```
[캘린더에 등록]  기간: [오늘만] [이번 주] [이번 달]
```

"캘린더에 등록" 클릭 시 DietCard(확인 카드)를 표시하고,
사용자가 "전체 등록"을 누르면 `addBatchEvents()`로 Firestore에 배치 저장한다.

---

## 채팅 트리거 패턴

```javascript
// src/utils/helperParser.js에 추가

export function isDietHelperTrigger(text) {
  if (!text) return false
  const lower = text.toLowerCase().trim()
  return /다이어트\s*(스케줄|일정|계획|플랜|관리)|식단\s*(스케줄|일정|계획|짜|관리|추천)|diet\s*(schedule|plan|meal)/.test(lower)
}
```

**트리거 예시**:
- "다이어트 스케줄 짜줘"
- "다이어트 계획 세워줘"
- "식단 스케줄 짜줘"
- "식단 추천해줘"
- "diet schedule"

---

## i18n 키

```javascript
// src/locales/ko.js 추가
helperDiet: '다이어트 도우미',
helperDietStart: '다이어트 도우미를 시작합니다. 프로필을 설정해주세요.',
helperDietBatchSaved: '다이어트 스케줄이 등록되었습니다.',
helperDietCancelled: '다이어트 스케줄 등록이 취소되었습니다.',
helperDietError: '다이어트 스케줄 생성 중 오류가 발생했습니다.',
helperDietTargetKcal: '목표 칼로리',
helperDietBodyInfo: '신체 정보',
helperDietGoal: '다이어트 목표',
helperDietMealSetting: '식단 설정',
helperDietExerciseSetting: '운동 설정',
helperDietWaterSetting: '수분 섭취 설정',
helperDietGender: '성별',
helperDietMale: '남성',
helperDietFemale: '여성',
helperDietAge: '나이',
helperDietHeight: '키 (cm)',
helperDietCurrentWeight: '현재 체중 (kg)',
helperDietTargetWeight: '목표 체중 (kg)',
helperDietGoalLose: '감량',
helperDietGoalMaintain: '유지',
helperDietGoalGain: '증량',
helperDietPaceSlow: '느림 (주 0.25kg)',
helperDietPaceNormal: '보통 (주 0.5kg)',
helperDietPaceFast: '빠름 (주 0.75kg)',
helperDietEstimate: '예상 소요 기간',
helperDietWeeks: '주',
helperDietMealsPerDay: '하루 식사 횟수',
helperDietMeals3: '3끼',
helperDietMeals4: '3끼 + 간식',
helperDietMeals5: '3끼 + 간식 2회',
helperDietPreference: '식단 스타일',
helperDietKorean: '한식 위주',
helperDietMixed: '혼합',
helperDietRestrictions: '식이 제한',
helperDietExerciseLevel: '운동 수준',
helperDietBeginner: '입문',
helperDietIntermediate: '중급',
helperDietAdvanced: '고급',
helperDietDaysPerWeek: '주 운동 횟수',
helperDietPreferredTime: '선호 시간대',
helperDietMorning: '아침',
helperDietAfternoon: '오후',
helperDietEvening: '저녁',
helperDietExerciseTypes: '선호 운동',
helperDietExerciseDuration: '1회 운동 시간',
helperDietWaterEnabled: '수분 알림',
helperDietWaterTarget: '하루 목표량 (L)',
helperDietWaterInterval: '알림 간격 (시간)',
helperDietRegisterPeriod: '등록 기간',
helperDietDay1: '오늘만',
helperDietDay7: '이번 주',
helperDietDay30: '이번 달',
helperDietSummary: '오늘의 요약',
helperDietEditProfile: '프로필 수정',
helperDietKcalUnit: 'kcal',
helperDietSection_meal: '식단',
helperDietSection_exercise: '운동',
helperDietSection_water: '수분',

// src/locales/en.js 추가
helperDiet: 'Diet Helper',
helperDietStart: 'Starting Diet Helper. Please set up your profile.',
helperDietBatchSaved: 'Diet schedule has been registered.',
helperDietCancelled: 'Diet schedule registration cancelled.',
helperDietError: 'An error occurred while creating the diet schedule.',
helperDietTargetKcal: 'Target Calories',
// ... (나머지 영문 키)
```

---

## 파일 변경 목록

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/DietHelperView.jsx` | 신규 | 전용 뷰 (프로필 설정 + 스케줄 표시) |
| `src/components/DietCard.jsx` | 신규 | 확인 카드 (lime 테마) |
| `src/data/dietDefaults.js` | 신규 | 기본값, 카테고리 스타일, 칼로리 계산 상수 |
| `src/utils/helperParser.js` | 수정 | `isDietHelperTrigger()` 추가 |
| `src/components/HelperSelector.jsx` | 수정 | 메뉴 항목 추가 |
| `src/components/ChatInterface.jsx` | 수정 | 트리거 감지 추가 |
| `src/App.jsx` | 수정 | 탭 + 뷰 렌더링 추가 |
| `src/locales/ko.js` | 수정 | i18n 키 추가 |
| `src/locales/en.js` | 수정 | i18n 키 추가 |

---

## 탭 전환 시스템

### 현재 탭 구조 (App.jsx)

App.jsx의 `chatMode` state가 우측 패널의 활성 뷰를 결정한다.

```
chatMode 값      활성 색상      렌더링 컴포넌트
─────────────────────────────────────────────────
'chat'           blue           ChatInterface
'schedule'       blue           DailyScheduleView
'major'          red            MajorEventsView
'petcare'        teal           DailyScheduleView (petCareMode)
'diet'           lime           DietHelperView          ← 신규
```

### 진입 경로 3가지

```
경로 1: 탭 버튼 직접 클릭
  App.jsx 탭 바 > [다이어트] 클릭 > setChatMode('diet') > DietHelperView 렌더링

경로 2: HelperSelector (채팅 입력창 좌측 Sparkles 버튼)
  ChatInterface > HelperSelector > handleSelect('diet')
  > ChatInterface.handleStartHelper('diet')
  > 채팅에 안내 메시지 + setChatMode('diet')로 탭 전환

경로 3: 채팅 트리거 (자연어 입력)
  ChatInterface > "다이어트 스케줄 짜줘" 입력
  > isDietHelperTrigger() 감지
  > 채팅에 안내 메시지 + setChatMode('diet')로 탭 전환
```

### 1단계: App.jsx 탭 버튼 추가

```jsx
// 1. import 추가
import { Apple } from 'lucide-react'
import DietHelperView from './components/DietHelperView'

// 2. 탭 버튼 추가 (기존 petcare 탭 뒤에)
<button
  onClick={() => setChatMode('diet')}
  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
    chatMode === 'diet'
      ? 'bg-lime-500 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
  }`}
>
  <Apple size={13} />
  {t('helperDiet')}
</button>

// 3. 뷰 렌더링 추가 (Content Area 분기에 추가)
{chatMode === 'diet' && (
  <DietHelperView userId={user.uid} onEventCreated={handleEventCreated} />
)}
```

### 2단계: ChatInterface 탭 전환 연동

ChatInterface에서 트리거 감지 또는 HelperSelector 선택 시 탭을 전환하려면
App.jsx에서 `setChatMode`를 prop으로 전달해야 한다.

```jsx
// App.jsx — ChatInterface에 onSwitchMode prop 추가
<ChatInterface
  userId={user.uid}
  onEventCreated={handleEventCreated}
  onSwitchMode={setChatMode}            // 탭 전환 콜백
/>
```

```jsx
// ChatInterface.jsx — handleStartHelper에 diet 분기 추가
const handleStartHelper = async (type) => {
  // 기존: daily, petcare, work 처리
  if (type !== 'daily' && type !== 'petcare' && type !== 'work'
      && type !== 'diet') return         // ← diet 추가

  // diet는 전용 뷰 도우미(유형 B) → 채팅 온보딩 불필요, 탭 전환만
  if (type === 'diet') {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: t('helperDietStart'),
    }])
    onSwitchMode?.('diet')               // App.jsx의 setChatMode('diet') 호출
    return
  }

  // 기존 daily/petcare/work 로직 유지...
}
```

```jsx
// ChatInterface.jsx — handleSend 내 트리거 감지에 추가
import { isDietHelperTrigger } from '../utils/helperParser'

// 도우미 트리거 감지 블록에 추가 (기존 트리거들 위에)
if (isDietHelperTrigger(currentInput)) {
  await handleStartHelper('diet')
  return
}
```

### 3단계: HelperSelector 메뉴 항목 추가

```jsx
// HelperSelector.jsx
import { Apple } from 'lucide-react'

// 기존 버튼들 뒤에 추가
<button
  onClick={() => handleSelect('diet')}
  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
>
  <Apple size={14} className="text-lime-500" />
  {t('helperDiet')}
</button>
```

### 탭 전환 흐름도

```
사용자 입력/클릭
  │
  ├─ [App.jsx 탭 바] ──────────────────> setChatMode('diet')
  │                                         │
  ├─ [HelperSelector] ──> handleSelect ──> handleStartHelper('diet')
  │                                         │
  └─ [채팅 입력] ──> isDietHelperTrigger ──> handleStartHelper('diet')
                                            │
                                            ├─ 안내 메시지 추가
                                            └─ onSwitchMode('diet')
                                                │
                                                v
                                          setChatMode('diet')
                                                │
                                                v
                                          DietHelperView 렌더링
```

---

## 구현 순서

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 1 | `dietDefaults.js` 기본값/상수 정의 | 쉬움 |
| 2 | 칼로리 계산 유틸 함수 (BMR, TDEE, 목표 칼로리) | 쉬움 |
| 3 | `DietHelperView.jsx` 프로필 설정 폼 (5단계) | 보통 |
| 4 | `DietHelperView.jsx` 일일 스케줄 생성 로직 | 보통 |
| 5 | `DietHelperView.jsx` 스케줄 표시 UI (식단/운동/수분 섹션) | 보통 |
| 6 | `DietCard.jsx` 확인 카드 (기간 선택 + 등록) | 보통 |
| 7 | 통합: HelperSelector, ChatInterface, App.jsx, helperParser | 쉬움 |
| 8 | i18n 키 추가 | 쉬움 |
| 9 | GPT 식단 추천 프롬프트 (선택적 고도화) | 보통 |
| 10 | UI 검증 (라이트/다크, 모바일 반응형) | 보통 |

---

## 향후 고도화 (Phase 2+)

| 기능 | 설명 |
|------|------|
| GPT 메뉴 추천 | 칼로리에 맞는 구체적 한식 메뉴 추천 |
| 체중 기록 | 매일 체중 입력 -> 그래프 시각화 |
| 칼로리 실적 추적 | 등록된 식사 완료 체크 -> 실제 섭취 추적 |
| 주간 리포트 | "이번 주 평균 1,750kcal, 운동 4회" AI 요약 |
| 운동 도우미(H02) 연동 | 운동 부분을 H02와 공유/연동 |
| 사진 기반 식단 기록 | 음식 사진 촬영 -> AI 칼로리 추정 |

---

## 관련 문서

- [스케줄 도우미 기획서](../ideas/SCHEDULE_HELPER_PLAN_v1.0.md) -- H05 다이어트 도우미 정의
- [스케줄 도우미 제작 가이드](SCHEDULE_HELPER_DEV_GUIDE_v1.0.md) -- 공통 개발 패턴
- [일상 도우미 구현 가이드](DAILY_HELPER_IMPLEMENTATION_v1.0.md) -- 유사 구조 참조

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 -- 다이어트 도우미(H05) 상세 기획 |
