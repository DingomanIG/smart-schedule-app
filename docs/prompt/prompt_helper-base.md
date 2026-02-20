# 스케줄 도우미 구현 프롬프트 템플릿

> 기존 일상/펫 케어/업무 도우미 코드 분석 기반, 동일 퀄리티의 새 도우미를 만들 때 사용하는 구현 가이드.

---

## 1. 도우미 ID 체계

| ID | 이름 | 테마색 | 아이콘 | 비고 |
|-----|------|--------|--------|------|
| H01 | 일상 | green | Sun | 가장 범용적 (트리거 최후순위) |
| H04 | 업무 | indigo | Briefcase | 태스크 입력 단계 추가 |
| H11 | 펫 케어 | teal | PawPrint | 다중 루프 온보딩 |
| H12 | 주요 행사 | red | Flag | |
| HXX | 새 도우미 | 미정 | 미정 | 겹치지 않는 번호 부여 |

---

## 2. 수정 파일 체크리스트 (순서대로)

1. `src/data/{name}Defaults.js` — 카테고리 스타일/라벨 **(새 파일)**
2. `src/services/openai.js` — `generate{Name}Schedule()` 추가
3. `src/utils/helperParser.js` — 트리거 + 온보딩 파서 추가
4. `src/components/{Name}Card.jsx` — 배치 확인 카드 **(새 파일)**
5. `src/components/ChatInterface.jsx` — 온보딩 스텝 + 핸들러 + 렌더링 통합
6. `src/components/HelperSelector.jsx` — 드롭다운 항목 추가
7. `src/components/{Name}View.jsx` — 전용 뷰 **(새 파일, DailyScheduleView 그룹형 디자인 필수)** — 아래 3.9 참조
8. `src/App.jsx` — 탭 버튼 + 뷰 렌더링 분기
9. `src/locales/ko.js`, `en.js` — 다국어 키 추가

> 재사용(수정 불필요): `schedule.js`(addBatchEvents), `helperProfile.js`(새 helperId로 호출)

---

## 3. 구현 패턴

### 3.1 트리거 감지 (`helperParser.js`)

함수명: `is{Name}HelperTrigger(text) → boolean`

**4단계 로직** (순서 엄수):
1. `actionKeywords` 제외 — 삭제/취소/이동/변경 등 (모든 도우미 공통 정규식)
2. 다른 도우미 키워드 제외 — 충돌 방지 (일상/펫/업무 등)
3. 정확한 패턴 매칭 — 도메인 키워드 + `스[케캐][줄쥴]` 오타 변형 필수
4. 동사 + 키워드 조합 — `짜줘|만들어|생성|추천|도우미` 등

### 3.2 온보딩 파서 (`helperParser.js`)

함수명: `parse{Field}(text) → 파싱값 | null` — null 반환 시 재입력 요청.
- "없음/없어/no/none" 처리 (선택 필드만)
- 숫자 선택지 지원 (예: `1`=강아지)
- 공용 파서 재사용 가능: `parseTimeInput`, `parsePetIndoor`

### 3.3 온보딩 스텝 (`ChatInterface.jsx`)

상수 `{NAME}_ONBOARDING_STEPS` 배열로 정의 후 `getOnboardingSteps(type)` 분기 추가:
```js
// 스텝 구조: { key, askKey, parser, skipIf? }
// key: 프로필 필드명 / askKey: i18n 키 / parser: helperParser 함수
// skipIf: (answers) => boolean — 조건부 스텝 스킵
```

### 3.4 handleStartHelper 분기

프로필 존재 확인 → 있으면 `select_days` / 없으면 `startHelperOnboarding(type)`.
- **패턴 A (일상)**: 프로필 → 일수 선택 → GPT 생성
- **패턴 B (업무)**: 프로필 → 추가 입력 → 일수 선택 → GPT 생성
- **패턴 C (펫)**: 프로필(다중 루프) → 일수 선택 → GPT 생성

### 3.5 GPT 생성 함수 (`openai.js`)

함수명: `generate{Name}Schedule(preferences) → { action, date, events }`
- 프로필 정보를 텍스트로 변환하여 user 메시지에 포함
- system 프롬프트에 카테고리 목록, 한국어 제목 규칙, 시간 겹침 금지 명시
- 응답: `{ "action": "{name}_batch", "events": [{ title, time, duration, category, careType? }] }`
- JSON 추출: `result.match(/\{[\s\S]*\}/)` → `fixOverlappingEvents()` 후처리 필수

**⚠️ `category` vs `careType` 필드 규칙:**
GPT 프롬프트에서 `category`를 한국어 도우미명으로 통일하고(예: `"육아"`, `"펫 케어"`), 구체적 하위 분류는 `careType` 필드에 영문으로 저장하는 패턴이 있다.
전용 뷰에서 뱃지/필터/그룹핑에 사용할 필드는 반드시 **실제 하위 분류가 들어있는 필드**(`careType`)를 사용해야 한다.
`category`를 사용하면 모든 뱃지가 동일한 한국어 텍스트(예: "육아")로 표시되는 버그 발생.
```
// ❌ 잘못된 예: category는 항상 "육아"
grouped[key] = { events: [], category: evt.category }  // → 뱃지 전부 "육아"

// ✅ 올바른 예: careType으로 구체적 분류
grouped[key] = { events: [], careType: evt.careType }  // → feeding, sleep, play 등
```

### 3.6 멀티데이 복제 + 배치 카드

`generateAndShow{Name}Batch(profile, days)` — GPT 1일치 생성 → N일 복제.

메시지 객체 필수 필드:
- `action`: `'{name}_batch'` (고유 action명)
- `{name}Events`: 1일치 이벤트 배열 (카드 렌더링용)
- `{name}Days`: 전체 batchDays 배열 (저장용)
- `confirmed`, `cancelled`: boolean

### 3.7 확인/취소/제거 핸들러

- **전체 등록**: `addBatchEvents(userId, events, date)` — 멀티데이면 for루프
- **개별 제거**: 템플릿 방식 — 모든 날짜에서 동일 인덱스 제거
- 저장 후 `onEventCreated?.()` 호출 (캘린더 갱신)

### 3.8 handleSend 트리거 우선순위

구체적 키워드 도우미 먼저 → 일상(`isDailyHelperTrigger`) 항상 마지막.

### 3.9 뷰 필터링

`createdVia === 'helper'` + `helperId === 'HXX'` 또는 카테고리 기반 필터링.
> 새 도우미에서는 `helperId`를 명시적으로 전달 권장.

**⚠️ DailyScheduleView 필터 갱신 필수:**
새 도우미를 추가할 때 `DailyScheduleView.jsx`의 이벤트 필터에서 해당 도우미를 **반드시 제외**해야 한다.
일상 탭은 기본적으로 `createdVia === 'helper'`인 모든 이벤트를 표시하므로, 전용 뷰가 있는 도우미는 명시적으로 제외하지 않으면 일상 탭에도 중복 표시된다.

```js
// DailyScheduleView.jsx 필터 예시
const isWork = evt.helperId === 'H04' || WORK_CATEGORIES.includes(evt.category)
const isChildcare = evt.helperId === 'H06' || evt.category === '육아'
const isNewHelper = evt.helperId === 'HXX'  // ← 새 도우미 추가 시 여기에 조건 추가
return !isPet && !isWork && !isChildcare && !isNewHelper
```

**⚠️ 전용 뷰 디자인 패턴 (DailyScheduleView 그룹형 필수):**
전용 뷰(`{Name}View.jsx`)는 반드시 `DailyScheduleView.jsx`와 동일한 **그룹형 디자인**으로 구현해야 한다.
날짜별 개별 리스트 방식(날짜 네비게이션 + 단건 나열)은 사용 금지.

필수 구성 요소:
1. **전체 이벤트 조회**: `getEvents(userId, farPast, farFuture)`로 전 기간 이벤트를 한 번에 가져옴
2. **제목별 그룹핑**: 동일 제목 이벤트를 하나의 카드로 묶어 표시
3. **카테고리 필터 탭**: 상단에 `all` + 카테고리별 필터 버튼 (건수 뱃지 포함)
4. **영문 뱃지**: 카테고리 뱃지는 영문으로 표시 (예: `feeding`, `sleep`, `play`)
5. **토글 스위치**: 그룹별 활성/비활성 토글 (`updateEvent(id, { disabled })`)
6. **벌크 편집**: 제목/시간 클릭 시 그룹 내 전체 이벤트 일괄 수정
7. **이상 시간 표시**: 다수 시간과 다른 이벤트를 outlier로 하단에 표시
8. **추가 폼**: `+` 버튼으로 일정 직접 추가 (카테고리 선택 + 일수 지정)
9. **삭제 확인 모달**: DailyScheduleView와 동일한 스타일
10. **프로필 패널**: 하단 접이식 프로필 표시

```js
// 전용 뷰 기본 구조 (DailyScheduleView 참조)
// ⚠️ 뱃지 필드는 careType 또는 category 중 실제 하위 분류가 담긴 필드 사용 (3.5 참조)
const grouped = {}
events.forEach(evt => {
  const key = evt.title
  if (!grouped[key]) grouped[key] = { events: [], careType: evt.careType || 'default' }
  grouped[key].events.push(evt)
})
// → careType 기반 필터 → 그룹 카드 렌더링 → 뱃지에 group.careType 표시
```

테마 색상은 도우미별로 구분:
- 일상: `blue-500` / 펫: `teal-500` / 육아: `pink-500` / 새 도우미: 겹치지 않는 색상

---

## 4. 배치 확인 카드 컴포넌트

Props: `{ events, days, onConfirmAll, onRemoveItem, onCancel, confirmed, cancelled }`

3가지 상태 렌더링: confirmed(완료) / cancelled(취소) / 기본(이벤트 목록 + 버튼).

**카드 스타일 규칙:**
- 테두리: `border-2 border-{color}-300 dark:border-{color}-600`
- 확인 버튼: `bg-{color}-600 hover:bg-{color}-700`
- 취소 버튼: `bg-gray-200 dark:bg-gray-600` (공통)
- 저장 완료 배경: `bg-{color}-50 dark:bg-{color}-900/20`
- 이벤트 목록: `max-h-72 overflow-y-auto`
- 제거 버튼: 각 행에 `<Minus size={12}>`, hover 시 red

---

## 5. 데이터 기본값 (`src/data/{name}Defaults.js`)

카테고리 스타일 객체: `{ bg, text, badge }` — 각각 light/dark 변형 포함.
카테고리 라벨 매핑: i18n 키로 연결.

---

## 6. 상태 관리

| 상태 | 용도 | 타입 |
|------|------|------|
| `helperState` | 온보딩 진행 추적 | `{ type, step, answers }` / `null` |
| `pendingProfile` | 프로필 완료 후 대기 | 프로필 + `_type` / `null` |

**흐름:** 트리거 → 온보딩(`helperState`) → 프로필 완료(`pendingProfile`) → 일수 선택 → GPT → 배치 카드 → 확인/취소.

`_type` 규칙: `pendingProfile`에 `_type` 추가로 도우미 구분 → GPT 호출 전 `const { _type, ...clean } = profile`로 제거.

`handleSend` 내 우선순위: helperState → pendingProfile → 전체삭제 → 프로필수정 → 도우미 트리거 → parseSchedule.

---

## 7. Firestore 스키마

**프로필** (`helperProfiles`): 문서ID `{userId}_{helperId}`, `setDoc(merge:true)` upsert.
**이벤트** (`events`): `createdVia: 'helper'`, `helperId: 'HXX'` 필수. `writeBatch` 원자적 저장.

---

## 8. 네이밍 컨벤션

| 구분 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `GameScheduleCard.jsx` |
| 데이터/유틸 파일 | camelCase | `gameDefaults.js` |
| 트리거 함수 | `is{Name}HelperTrigger` | `isGameHelperTrigger` |
| GPT 함수 | `generate{Name}Schedule` | `generateGameSchedule` |
| 배치 생성 | `generateAndShow{Name}Batch` | `generateAndShowGameBatch` |
| 온보딩 상수 | `{NAME}_ONBOARDING_STEPS` | `GAME_ONBOARDING_STEPS` |
| action 이름 | `{name}_batch` | `game_batch` |
| 메시지 필드 | `{name}Events`, `{name}Days` | `gameEvents`, `gameDays` |
| i18n 키 | `{name}Helper{Action}` | `gameHelperAskGenre` |

---

## 9. 제약 조건 요약

- **상태**: `useState`만 (외부 라이브러리 금지), 캘린더 갱신은 `onEventCreated()` 호출
- **GPT**: `gpt-4o-mini`, temperature `0.5`, 1일치 생성 → N일 복제, `fixOverlappingEvents()` 필수
- **API**: 개발(Vite 프록시) / 프로덕션(`/api/chat`) 분기 유지
- **UI**: 한국어 텍스트(`t()` 사용), 다크 모드 `dark:` 필수, 아이콘 `lucide-react`
- **파서**: 실패 시 `null` 반환 (throw 금지), 한국어 오타 변형 포함
- **트리거**: actionKeywords 제외 + 타 도우미 키워드 제외 + 일상 트리거 최후순위
