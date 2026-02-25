# 카테고리 설정 중앙화 기획서

> ID: DEV-CONFIG | 우선순위: 높음 | 유형: 개발자 경험(DX) 개선
> 작성일: 2026-02-25 | 버전: 1.0

## 한줄 요약

카테고리별 온보딩 질문, GPT 프롬프트 규칙, 카테고리 스타일을 **Defaults 파일 한 곳**에서 관리하여 개발 수정 편의성을 대폭 향상.

## 현재 문제

카테고리 하나를 수정하려면 **최소 3~4개 파일**을 동시에 열어야 한다:

| 항목 | 현재 위치 | 문제 |
|------|----------|------|
| 질문 순서/키 | `ChatInterface.jsx` 상단 상수 | 800줄+ 컴포넌트 안에 묻혀 있음 |
| 질문 텍스트 | `ko.js` / `en.js` | i18n 키만으로 어떤 카테고리인지 파악 어려움 |
| GPT 프롬프트 규칙 | `openai.js` 각 함수 내부 | 함수당 40~80줄, 서비스 코드에 혼재 |
| 카테고리 스타일 | `*Defaults.js` 또는 카드 컴포넌트 | 일상은 `BatchConfirmCard.jsx`에 직접 정의 |
| 파서 함수 | `categoryParser.js` | 파서 자체는 재사용 가능하지만 매핑이 분산 |

**개발자 시나리오**: "업무 카테고리에 질문 하나 추가하고 싶다"
→ `ChatInterface.jsx`에서 스텝 배열 찾기 → `categoryParser.js`에 파서 추가 → `ko.js`에 i18n 키 추가 → `openai.js`에서 프롬프트에 필드 반영 → 총 4파일 수정

## 목표

**"카테고리 수정은 Defaults 파일 하나에서 시작하고 끝낸다"**

- 질문 추가/삭제/순서 변경: Defaults 파일만 수정
- GPT 프롬프트 규칙 수정: Defaults 파일만 수정
- 카테고리 스타일 수정: 기존과 동일 (이미 Defaults에 있음)
- 파서 함수 추가: `categoryParser.js`에 추가 (불가피)
- i18n 키 추가: `ko.js`에 추가 (불가피)

## 설계

### 변경 대상 파일

```
src/data/
├── dailyDefaults.js          # [신규] 일상 카테고리 설정 통합
├── petCareDefaults.js        # [확장] 질문 스텝 + 프롬프트 규칙 추가
├── workDefaults.js           # [확장] 질문 스텝 + 프롬프트 규칙 추가
├── childcareDefaults.js      # [확장] 질문 스텝 + 프롬프트 규칙 추가
└── categoryRegistry.js       # [신규] 전체 카테고리 목록 + 공통 유틸

src/components/
└── ChatInterface.jsx         # [수정] 스텝 상수 제거 → Defaults에서 import

src/services/
└── openai.js                 # [수정] 프롬프트 규칙을 Defaults에서 읽기
```

### Defaults 파일 확장 구조 (예: workDefaults.js)

```js
import {
  parseWorkType, parseWorkHours, parseFocusPeak, parsePetIndoor
} from '../utils/categoryParser'

// ─── 기존: 카테고리 스타일 (변경 없음) ───
export const WORK_CATEGORY_STYLES = { ... }
export const WORK_CATEGORY_LABELS = { ... }
export const FOCUS_TIME_MAP = { ... }
export const WORK_TYPE_ADJUSTMENTS = { ... }

// ─── 신규: 온보딩 질문 스텝 ───
export const WORK_ONBOARDING_STEPS = [
  { key: 'workType',      askKey: 'helperWorkAskWorkType', parser: parseWorkType },
  { key: 'workHours',     askKey: 'helperWorkAskHours',    parser: parseWorkHours },
  { key: 'focusPeak',     askKey: 'helperWorkAskFocus',    parser: parseFocusPeak },
  { key: 'worksWeekends', askKey: 'helperWorkAskWeekend',  parser: parsePetIndoor },
]

// ─── 신규: GPT 프롬프트 규칙 (openai.js에서 참조) ───
export const WORK_PROMPT_RULES = [
  '모든 이벤트는 workStart~workEnd 범위 안에 배치',
  'deepwork 블록은 focusPeak 시간대에 최소 2시간 확보',
  '회의 사이 최소 15분 버퍼',
  '점심 직후 30분은 저강도 업무(admin, communication) 배치',
  '하루 시작/끝에 planning 이벤트 배치',
  '이메일/메신저 확인은 하루 2~3회 communication으로 묶기',
  '활동 사이 10~15분 버퍼 (이벤트로 만들지 않음)',
  '"자유 시간", "여가", "휴식"은 절대 이벤트로 만들지 않음',
  'category는 반드시 다음 중 하나: deepwork, meeting, admin, planning, communication, break, commute, deadline',
  '모든 제목은 한국어로 작성',
  'duration은 분 단위',
  '절대 시간 겹침 금지',
]

// ─── 신규: GPT 프롬프트 메타 정보 ───
export const WORK_PROMPT_META = {
  role: '업무 타임블록킹 전문가',
  action: 'work_batch',
  responseFormat: {
    action: 'work_batch',
    events: [{ title: '예시', time: 'HH:MM', duration: 60, category: 'deepwork' }],
  },
}
```

### dailyDefaults.js (신규 파일)

```js
import {
  parseTimeInput, parseMealsInput, parseCommuteInput, parseRoutinesInput
} from '../utils/categoryParser'

// ─── 카테고리 스타일 (현재 BatchConfirmCard.jsx에서 이전) ───
export const DAILY_CATEGORY_STYLES = {
  routine: { bg: '...', text: '...', badge: '...' },
  meal:    { bg: '...', text: '...', badge: '...' },
  commute: { bg: '...', text: '...', badge: '...' },
  personal:{ bg: '...', text: '...', badge: '...' },
  health:  { bg: '...', text: '...', badge: '...' },
}

// ─── 온보딩 질문 스텝 ───
export const DAILY_ONBOARDING_STEPS = [
  { key: 'wakeUp',   askKey: 'helperAskWakeUp',   parser: parseTimeInput },
  { key: 'bedTime',  askKey: 'helperAskBedTime',   parser: parseTimeInput },
  { key: 'meals',    askKey: 'helperAskMeals',     parser: parseMealsInput },
  { key: 'commute',  askKey: 'helperAskCommute',   parser: parseCommuteInput },
  { key: 'routines', askKey: 'helperAskRoutines',  parser: parseRoutinesInput },
]

// ─── GPT 프롬프트 규칙 ───
export const DAILY_PROMPT_RULES = [
  '기상/취침 대신 "수면" 이벤트 1개 (시작=취침, duration=취침~기상 분)',
  '아침/점심/저녁 3끼 포함 (불규칙 아닌 한)',
  '실제 활동만 이벤트 생성 (자유 시간/여가/휴식은 만들지 않음)',
  '식사 시간 최소 30분 확보',
  '출퇴근 있으면: 출근 준비(30분) + 출근 + 업무 + 퇴근 포함',
  '운동→출근 전/퇴근 후, 독서→저녁/취침 전, 명상→기상 직후/취침 전',
  '활동 사이 10~15분 버퍼 (이벤트로 만들지 않음)',
  'category: routine, meal, commute, personal, health 중 하나',
  'personal 카테고리 하루 1개, 같은 루틴도 1회만',
  '모든 제목 한국어, duration 분 단위',
  '절대 시간 겹침 금지',
]

export const DAILY_PROMPT_META = {
  role: '일상 스케줄 설계 전문가',
  action: 'create_batch',
  responseFormat: {
    action: 'create_batch',
    events: [{ title: '수면', time: '23:00', duration: 540, category: 'routine' }],
  },
}
```

### categoryRegistry.js (신규 파일)

```js
/**
 * 전체 카테고리 목록 레지스트리
 * - ChatInterface.jsx의 getOnboardingSteps()가 이 파일을 참조
 * - 새 카테고리 추가 시 여기에 등록
 */
import { DAILY_ONBOARDING_STEPS } from './dailyDefaults'
import { PET_SINGLE_STEPS, PET_FINAL_STEPS, PET_ONBOARDING_STEPS } from './petCareDefaults'
import { WORK_ONBOARDING_STEPS } from './workDefaults'
import { CHILDCARE_ONBOARDING_STEPS } from './childcareDefaults'

export const CATEGORY_REGISTRY = {
  daily: {
    id: 'H01',
    type: 'daily',
    steps: DAILY_ONBOARDING_STEPS,
    profileId: 'H01',
    themeColor: 'green',
  },
  petcare: {
    id: 'H11',
    type: 'petcare',
    steps: PET_ONBOARDING_STEPS,       // 레거시 호환
    singleSteps: PET_SINGLE_STEPS,     // 다중 펫 워크플로우
    finalSteps: PET_FINAL_STEPS,
    profileId: 'H11',
    themeColor: 'teal',
  },
  work: {
    id: 'H04',
    type: 'work',
    steps: WORK_ONBOARDING_STEPS,
    profileId: 'H04',
    themeColor: 'indigo',
  },
  childcare: {
    id: 'H06',
    type: 'childcare',
    steps: CHILDCARE_ONBOARDING_STEPS,
    profileId: 'H06',
    themeColor: 'pink',
  },
}

/**
 * 카테고리 타입으로 온보딩 스텝 반환
 * ChatInterface.jsx에서 직접 import하여 사용
 */
export function getOnboardingSteps(type) {
  const category = CATEGORY_REGISTRY[type]
  return category?.steps || DAILY_ONBOARDING_STEPS
}
```

### ChatInterface.jsx 변경

**Before** (현재):
```js
// 상단에 5개 상수 배열 직접 정의 (22~72줄)
const ONBOARDING_STEPS = [...]
const PET_SINGLE_STEPS = [...]
const PET_FINAL_STEPS = [...]
const WORK_ONBOARDING_STEPS = [...]
const CHILDCARE_ONBOARDING_STEPS = [...]

function getOnboardingSteps(type) { ... }
```

**After** (변경 후):
```js
// Defaults에서 import
import { getOnboardingSteps, CATEGORY_REGISTRY } from '../data/categoryRegistry'
import { PET_SINGLE_STEPS, PET_FINAL_STEPS } from '../data/petCareDefaults'
// → 상수 배열 제거, getOnboardingSteps 제거
```

### openai.js 변경

**Before** (현재):
```js
export async function generateDailySchedule(preferences) {
  // ... 40줄 프롬프트 문자열 직접 작성 ...
  content: `당신은 일상 스케줄 설계 전문가입니다.
규칙:
1. 별도의 "기상"/"취침" 이벤트 대신...
2. 반드시 아침 식사...
...
13. 절대 시간 겹침 금지`
}
```

**After** (변경 후):
```js
import { DAILY_PROMPT_RULES, DAILY_PROMPT_META } from '../data/dailyDefaults'

export async function generateDailySchedule(preferences) {
  // 규칙을 Defaults에서 불러와서 조합
  const rules = DAILY_PROMPT_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')

  content: `당신은 ${DAILY_PROMPT_META.role}입니다.
사용자의 생활 패턴을 바탕으로 하루 일정을 JSON으로 생성하세요.

규칙:
${rules}

응답 형식 (JSON만 반환):
${JSON.stringify(DAILY_PROMPT_META.responseFormat, null, 2)}`
}
```

## 변경 범위 요약

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/data/dailyDefaults.js` | **신규** | 일상 카테고리 스타일 + 스텝 + 프롬프트 규칙 |
| `src/data/petCareDefaults.js` | 확장 | 스텝 배열 + 프롬프트 규칙 추가 |
| `src/data/workDefaults.js` | 확장 | 스텝 배열 + 프롬프트 규칙 추가 |
| `src/data/childcareDefaults.js` | 확장 | 스텝 배열 + 프롬프트 규칙 추가 |
| `src/data/categoryRegistry.js` | **신규** | 레지스트리 + getOnboardingSteps |
| `src/components/ChatInterface.jsx` | 수정 | 상수 배열 제거 → registry import |
| `src/services/openai.js` | 수정 | 프롬프트 규칙을 Defaults에서 조합 |
| `src/components/BatchConfirmCard.jsx` | 수정 | CATEGORY_STYLES → dailyDefaults에서 import |

## 변경하지 않는 것

- `categoryParser.js` 파서 함수들: 위치 유지 (유틸 성격)
- `ko.js` / `en.js` i18n 키: 위치 유지 (다국어 파일)
- `categoryProfile.js` 프로필 CRUD: 변경 없음
- `schedule.js` 이벤트 CRUD: 변경 없음
- 각 카드 컴포넌트 렌더링 로직: 변경 없음
- `openai.js`의 `callOpenAI`, `fixOverlappingEvents` 등 공통 함수: 변경 없음

## 개발자 시나리오 (변경 후)

### "업무 카테고리에 질문 하나 추가"

1. `workDefaults.js`에 스텝 추가:
   ```js
   { key: 'lunchTime', askKey: 'helperWorkAskLunch', parser: parseTimeInput },
   ```
2. `categoryParser.js`: 기존 `parseTimeInput` 재사용이면 수정 불필요
3. `ko.js`에 `helperWorkAskLunch: '점심 시간은 보통 몇 시인가요?'` 추가
4. 끝 (ChatInterface.jsx, openai.js 수정 불필요)

### "일상 카테고리 프롬프트 규칙 수정"

1. `dailyDefaults.js`의 `DAILY_PROMPT_RULES` 배열에서 규칙 수정
2. 끝 (openai.js 수정 불필요)

### "새 카테고리 추가"

1. `src/data/newDefaults.js` 생성 (스타일 + 스텝 + 프롬프트 규칙)
2. `categoryRegistry.js`에 등록
3. 나머지는 기존 `prompt_category-base.md` 가이드 따라 진행

## 구현 순서

1. `dailyDefaults.js` 신규 생성 (BatchConfirmCard에서 스타일 이전)
2. 각 `*Defaults.js`에 스텝 배열 + 프롬프트 규칙 추가
3. `categoryRegistry.js` 생성
4. `ChatInterface.jsx`에서 상수 제거 → registry import
5. `openai.js`에서 프롬프트를 Defaults 기반으로 조합
6. `BatchConfirmCard.jsx`에서 스타일을 dailyDefaults에서 import
7. 동작 확인 (기존 기능 유지되는지 검증)

## 위험 요소

| 위험 | 대응 |
|------|------|
| 프롬프트 조합 시 GPT 응답 품질 변화 | 기존 프롬프트 원문을 규칙 배열로 1:1 변환, 의미 변경 없이 분리만 |
| 순환 참조 | Defaults → Parser 단방향, Parser는 Defaults를 import하지 않음 |
| 펫 케어 다중 루프 복잡도 | 3단계(single/more/final) 스텝 구조는 그대로 유지 |

## 참고 문서

- `docs/prompt/prompt_category-base.md` — 카테고리 구현 가이드
- `docs/plan/category/PLAN_WORK_SCHEDULE_CATEGORY_v1.0.md` — 업무 카테고리 기획
