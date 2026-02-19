# 스케줄 도우미 통합 가이드 v2.0

> 도메인별 AI 스케줄 자동 생성 도우미 시스템 — 설계 + 제작 가이드
> 작성일: 2026-02-19 | 버전: 2.0

---

## 목차

1. [개요](#1-개요)
2. [도우미 로드맵](#2-도우미-로드맵)
3. [아키텍처 원칙](#3-아키텍처-원칙)
4. [파일 구조 및 ID 체계](#4-파일-구조-및-id-체계)
5. [컴포넌트 패턴](#5-컴포넌트-패턴)
6. [데이터 스키마](#6-데이터-스키마)
7. [색상 시스템](#7-색상-시스템)
8. [확인 카드 및 일수 선택](#8-확인-카드-및-일수-선택)
9. [통합 규칙 (ChatInterface / App.jsx / HelperSelector)](#9-통합-규칙)
10. [i18n / 파서 / Firestore / GPT](#10-i18n--파서--firestore--gpt)
11. [기존 도우미별 참조](#11-기존-도우미별-참조)
12. [장기 로드맵](#12-장기-로드맵)
13. [기술 의사결정](#13-기술-의사결정)
14. [새 도우미 제작 체크리스트](#14-새-도우미-제작-체크리스트)

---

## 1. 개요

사용자가 도우미 카테고리를 선택하면 AI가 해당 분야에 최적화된 스케줄을 자동 생성하는 기능.
기존 채팅 기반 UX와 GPT-4o-mini 인프라를 활용하여 "대화형 스케줄 설계"를 제공한다.

**핵심 가치**: 진입장벽 제거 / 도메인 전문성 / 지속적 개선

### 두 가지 도우미 유형

| 유형 | 플로우 | 해당 도우미 |
|------|--------|------------|
| **A (채팅 기반)** | 채팅 트리거 -> 온보딩 Q&A -> GPT 호출 -> 배치 카드 -> Firestore | H01, H04, H11 |
| **B (전용 뷰)** | HelperSelector -> 전용 탭 뷰 -> 프로필 설정 -> 이벤트 관리 -> Firestore | H12 |

---

## 2. 도우미 로드맵

### 구현 완료

| ID | 도우미 | 유형 | 뷰 컴포넌트 | 테마 색상 |
|----|--------|------|-------------|----------|
| H01 | 일상 도우미 | A | `DailyScheduleView` | green |
| H04 | 업무 도우미 | A | `WorkScheduleView` | indigo |
| H11 | 펫 케어 도우미 | A | `DailyScheduleView petCareMode` | teal |
| H12 | 행사 도우미 | B | `MajorEventsView` | 탭별 다색 |

### 미구현

| ID | 도우미 | 설명 | Phase |
|----|--------|------|-------|
| H02 | 운동 | 운동 종목, 세트, 휴식일, 체력 수준별 계획 | 2 |
| H03 | 학습 | 과목별 시간 배분, 복습 주기, 시험 대비 | 2 |
| H05 | 다이어트 | 식단 + 운동 통합 스케줄, 칼로리 추적 | 3 |
| H06 | 육아 | 수유, 낮잠, 놀이, 병원 일정 | 3 |
| H07 | 커스텀 | 사용자가 직접 도메인/규칙 정의 | 3 |

---

## 3. 아키텍처 원칙

### 필수 준수

| 원칙 | 설명 |
|------|------|
| **useState만** | 외부 상태 라이브러리 금지 |
| **Tailwind + dark:** | 모든 스타일에 다크모드 변형 필수 |
| **lucide-react** | 아이콘 소스 |
| **useLanguage i18n** | 모든 UI 텍스트는 `t('키')` |
| **createdVia: 'helper'** | 도우미 생성 이벤트 필수 마커 |
| **onEventCreated** | 이벤트 생성 후 캘린더 갱신 콜백 |
| **Timestamp** | Firestore 날짜는 Timestamp, 표시 시 `.toDate()` |

### 금지 사항

- 별도 라우터 페이지 추가 금지 (탭 또는 채팅 통합만)
- 외부 npm 패키지 추가 금지
- inline style 금지 (Tailwind만)
- 영어 하드코딩 금지 (i18n)

---

## 4. 파일 구조 및 ID 체계

### ID 체계

```
H01~H07: 일상 생활 도우미 (H01 일상, H04 업무 구현 완료)
H11~H19: 특수 도우미 (H11 펫, H12 행사 구현 완료)
```

Firestore 문서 ID: `{userId}_{helperId}` (예: `abc123_H01`)

### 새 도우미 추가 시 파일

```
신규:
  src/components/{Name}View.jsx          <- 전용 뷰 (유형 B)
  src/components/{Name}Card.jsx          <- 확인 카드 (유형 A)
  src/data/{name}Defaults.js             <- 기본값/스타일 (필요 시)

수정:
  src/components/HelperSelector.jsx      <- 메뉴 항목
  src/components/ChatInterface.jsx       <- 트리거 감지 (유형 A)
  src/App.jsx                            <- 탭 + 뷰 렌더링 (유형 B)
  src/utils/helperParser.js              <- 트리거/파서 함수
  src/locales/ko.js, en.js               <- i18n 키
```

네이밍: 컴포넌트=PascalCase.jsx, 데이터/서비스/유틸=camelCase.js

---

## 5. 컴포넌트 패턴

### 5.1 전용 뷰 (유형 B) 필수 구조

```jsx
export default function NewHelperView({ userId, onEventCreated }) {
  const { t } = useLanguage()
  // 1. useState로 데이터/UI 상태 관리
  // 2. useEffect로 userId 변경 시 프로필 로드
  // 3. getHelperProfile / saveHelperProfile로 Firestore CRUD
  // 4. 이벤트 생성 후 반드시 onEventCreated?.() 호출
}
```

### 5.2 확인 카드 Props 인터페이스

```jsx
function NewHelperCard({
  events,        // 이벤트 목록
  days,          // 멀티데이 시 일수 정보
  onConfirmAll,  // 전체 등록
  onRemoveItem,  // 개별 제거 (index)
  onCancel,      // 취소
  confirmed,     // 등록 완료 여부
  cancelled,     // 취소 여부
})
```

**3가지 렌더링 상태**: confirmed -> 테마색 완료 메시지 / cancelled -> gray 반투명 / 기본 -> 이벤트 목록 + 버튼

### 5.3 공통 UI 규칙

- 이벤트 행: `Clock(11) + 시간(font-mono) + 제목(truncate) + 분 + 카테고리뱃지 + 제거버튼(Minus 12)`
- 등록 버튼: `bg-{테마}-600 text-white` + disabled 처리
- 취소 버튼: `bg-gray-200 dark:bg-gray-600`
- 기존 카드 코드 참조: `BatchConfirmCard.jsx`, `PetCareCard.jsx`, `WorkScheduleCard.jsx`

---

## 6. 데이터 스키마

### 6.1 프로필 (helperProfiles 컬렉션)

```javascript
// 문서 ID: {userId}_{helperId}
{ userId, helperId, /* 도우미별 데이터 */, updatedAt: serverTimestamp() }
```

| 도우미 | 키 필드 |
|--------|---------|
| H01 | `preferences: { wakeUp, bedTime, meals, commute, routines }` |
| H04 | `preferences: { workType, workStart, workEnd, focusPeak, lunchTime }` |
| H11 | `pets[], wakeUp, simultaneous` |
| H12 | `birthdays[], anniversaries[], events[]` |

### 6.2 이벤트 (events 컬렉션)

```javascript
{ userId, title, startTime: Timestamp, endTime: Timestamp|null,
  category, location, attendees: [],
  createdAt: serverTimestamp(), createdVia: 'helper', helperId }
```

### 6.3 카테고리

| 도우미 | 카테고리 |
|--------|---------|
| H01 | routine, meal, commute, leisure, personal, health |
| H04 | deepwork, meeting, admin, planning, communication, break, commute, deadline |
| H11 | feeding, water, walk, toilet, play, grooming, health, medicine |
| H12 | holiday, birthday, anniversary, event, vacation |

규칙: 영문 소문자 단일 단어, 카테고리별 색상+아이콘 정의 필수

---

## 7. 색상 시스템

### 테마 색상

| 도우미 | 색상 | border | 버튼 | 아이콘 |
|--------|------|--------|------|--------|
| H01 | green | `border-green-300/600` | `bg-green-600` | Sun (amber) |
| H04 | indigo | `border-indigo-300/600` | `bg-indigo-600` | Briefcase (indigo) |
| H11 | teal | `border-teal-300/600` | `bg-teal-600` | PawPrint (teal) |
| H12 | red | 탭별 다색 | -- | Flag (red) |

**사용 불가**: green, indigo, teal, red / **추천**: cyan, rose, violet, emerald, lime

### 카테고리 뱃지 패턴

```javascript
const CATEGORY_STYLES = {
  카테고리명: { bg, text, badge, icon }  // {색상}-50/600/100/700 + dark 변형
}
```

카테고리 5개 이상 또는 다른 컴포넌트에서 재사용 시 `src/data/` 별도 파일로 분리.

### 상태 색상 (전 도우미 공통)

| 상태 | 색상 |
|------|------|
| confirmed | 테마색 (`border/bg/text-{테마}`) |
| cancelled | gray + opacity-50 |
| 삭제 확인 | red |

---

## 8. 확인 카드 및 일수 선택

### 카드 3단 구조

```
[헤더] 아이콘 + 제목 + N개 일정
[목록] 이벤트 행 (max-h-72 스크롤)
[버튼] 전체 등록 + 취소
```

멀티데이 시: 헤더에 일수+총 이벤트 수, "1일치 템플릿" 라벨, 날짜 범위 표시

### 필수 동작

- 전체 등록: `writeBatch` 원자적 저장
- 개별 제거: 카드 내 목록만 업데이트
- 취소: cancelled 상태 (Firestore 미접근)
- 이벤트 0개 시 등록 버튼 disabled

### 일수 선택

**표준 플로우**: 온보딩 완료 -> 프로필 저장 -> "몇 일치?" 질문 -> 선택 -> 스케줄 생성 -> 확인 카드

**유형 A**: 온보딩 마지막에 `{ action: 'select_days' }` 메시지 추가 -> ChatInterface가 버튼 렌더링 (1/7/30/60일). 자유 입력도 지원 ("7일", "2주" 등, 최대 60일).

**유형 B**: 뷰 하단에 기간 선택 토글 (`registerDays` state).

| 도우미 | 일수 선택 |
|--------|----------|
| H01 | select_days 버튼 (1/7/30/60일) |
| H04 | 해당 없음 (당일 1일치 고정) |
| H11 | select_days 버튼 (1/7/30/60일) |
| H12 | 해당 없음 (개별 등록) |

---

## 9. 통합 규칙

### 9.1 ChatInterface 트리거 감지 (유형 A)

`handleSend()` 우선순위:
1. 온보딩 진행 중 -> 답변 처리
2. 도우미 트리거 감지 (구체적 트리거가 위, 일반적 트리거가 아래)
3. 기존 parseSchedule

```javascript
if (isPetCareHelperTrigger(input)) { handleStartHelper('petcare'); return }
if (isWorkHelperTrigger(input)) { handleStartHelper('work'); return }
if (isDailyHelperTrigger(input)) { handleStartHelper('daily'); return }
// <- 새 도우미 트리거 추가 위치
```

### 9.2 App.jsx 탭 시스템 (유형 B)

`chatMode` 상태로 탭 전환: `'chat' | 'schedule' | 'major' | 'petcare' | 'work'`

**새 도우미 탭 추가 시 3곳 수정**:

1. **import**: 아이콘 + 뷰 컴포넌트
2. **탭 버튼**: `chatMode === 'newhelper'` 분기, 활성 색상 `bg-{테마}-500 text-white`
3. **뷰 렌더링**: 삼항 체인에 분기 추가, 필수 props `userId` + `onEventCreated`

동일 컴포넌트 재사용 시 `key` prop을 다르게 줘서 상태 초기화 (예: `key="daily"` vs `key="petcare"`)

**캘린더 갱신**: `onEventCreated()` -> `setCalendarKey(k+1)` -> CalendarView 재조회

**레이아웃**: PC=좌우 분할 (드래그 리사이즈), 모바일=상하 분할 (캘린더 60%/도우미 40%)

### 9.3 HelperSelector (ChatInterface 내부)

```jsx
<button onClick={() => handleSelect('키')}
  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm ...">
  <Icon size={14} className="text-{테마}-500" />
  {t('helper...')}
</button>
```

---

## 10. i18n / 파서 / Firestore / GPT

### i18n 키 규칙

네이밍: `helper{도우미명}{기능}` (예: `helperDailyAskWakeUp`)

**공통 재사용 키**: `helperAskDays`, `helperRegisterAll`, `helperRemoveItem`, `helperEventCount`, `helperDayUnit`, `helperTemplateDayLabel`, `helperGenerating`, `minuteUnit`, `cancel`, `cancelled`

**새 도우미 최소 키**: `helper{Name}`, `helper{Name}Start`, `helper{Name}BatchSaved`, `helper{Name}Cancelled`, `helper{Name}Error` + 온보딩 시 `helper{Name}Ask{Step}`

### 파서 규칙

`src/utils/helperParser.js`에 추가. 트리거 감지 함수 필수:

```javascript
export function isNewHelperTrigger(text) {
  if (!text) return false
  return /패턴/.test(text.toLowerCase().trim())
}
```

규칙: 한국어+영어 지원, 오타 포함, 다른 도우미와 충돌 방지, 정규식 사용

기존 트리거 참조: 일상=`일상\s*(스케줄|일정|루틴)`, 업무=`업무\s*(스케줄|일정|계획)`, 펫=`(강아지|고양이|반려|펫).*?(스케줄|돌봄|케어)`

### Firestore 연동

```javascript
// 프로필
import { getHelperProfile, saveHelperProfile } from '../services/helperProfile'
await getHelperProfile(userId, 'H??')
await saveHelperProfile(userId, 'H??', { ... })  // merge, updatedAt 자동

// 배치 이벤트
import { addBatchEvents } from '../services/schedule'
await addBatchEvents(userId, events, date)  // writeBatch 원자적
onEventCreated?.()  // 저장 후 필수
```

데모 모드(Firebase 미설정) 시 에러 처리 필수.

### GPT 프롬프트 설계

`src/services/openai.js`에 함수 추가. 기본 구조:

```
[시스템] "너는 {도메인} 스케줄 설계 전문가야. JSON 배열로 생성해."
[사용자] 온보딩 답변 데이터
[응답] { "action": "create_batch", "events": [{ title, startTime, endTime, category }] }
```

액션 타입: `create` (단건) / `create_batch` (다건) / `move` / `update` / `delete` / `add_major_event` / `select_days`

---

## 11. 기존 도우미별 참조

### H01 일상 도우미

| 항목 | 내용 |
|------|------|
| 뷰/카드 | `DailyScheduleView.jsx` / `BatchConfirmCard.jsx` (green) |
| 온보딩 | 5단계 (기상->취침->식사->통근->루틴) -> 일수 선택 |
| GPT | `generateDailySchedule()` |
| 프로필 | `{ wakeUp, bedTime, meals, commute, routines }` |
| 카테고리 색상 | routine=blue, meal=amber, commute=gray, leisure=purple, personal=pink, health=green |

### H04 업무 도우미

| 항목 | 내용 |
|------|------|
| 뷰/카드 | `WorkScheduleView.jsx` / `WorkScheduleCard.jsx` (indigo) |
| 온보딩 | 4단계 (근무형태->근무시간->집중시간대->점심시간) -> 태스크 입력 |
| GPT | `generateWorkSchedule()` |
| 프로필 | `{ workType, workStart, workEnd, focusPeak, lunchTime }` |
| 기본값 | `src/data/workDefaults.js` |
| 특수 | 타임 블록킹, 딥워크/미팅 통계, 근무유형별 조정 |

### H11 펫 케어 도우미

| 항목 | 내용 |
|------|------|
| 뷰/카드 | `DailyScheduleView.jsx petCareMode` / `PetCareCard.jsx` (teal) |
| 일수 선택 | select_days (1/7/30/60일) -> 템플릿 생성 |
| 프로필 | `pets[]: { petType, petName, petAge, petSize, petIndoor }` |
| 기본값 | `src/data/petCareDefaults.js` |
| 특수 | 나이별 조정(AGE_ADJUSTMENTS), 견종 크기별 산책 시간 |

### H12 행사 도우미

| 항목 | 내용 |
|------|------|
| 뷰 | `MajorEventsView.jsx` (카드 없음, 뷰 내부 관리) |
| 진입 | 채팅 `add_major_event` + HelperSelector -> 전용 탭 |
| 탭 | 공휴일(red), 생일(pink), 기념일(purple), 행사(orange), 휴가(green) |
| 프로필 | `birthdays[], anniversaries[], events[]` |
| 특수 | 음력->양력 변환, D-Day 계산, 100일 기념 |

---

## 12. 장기 로드맵

### Phase 2: 운동 (H02) + 학습 (H03)

- **운동 온보딩**: 목표, 경험 수준, 가능 요일, 선호 종류, 부상/제한
- **학습 온보딩**: 과목 목록, 시험일, 가용 시간, 학습 방식, 취약 과목

### Phase 3: 반복 스케줄 시스템

이벤트 스키마에 `recurrence` 필드 추가 (type, interval, daysOfWeek, endDate, exceptions) + `recurrenceGroupId`. 캘린더 뷰에서 "이 일정만/이후 모든 일정" 수정 선택지.

### Phase 4: 스마트 조정

- 충돌 감지: 기존 일정과 겹침 확인 + 대안 제안
- 적응형: 반복 건너뛴 스케줄 자동 감지 + 시간대 변경 제안
- 도우미 간 연동: 크로스 도우미 시간 조율

### Phase 5: 고도화

완료 추적 + 달성률 대시보드 / 주간 AI 리포트 / 템플릿 공유 / 외부 캘린더 동기화 / AI 인격 연동

---

## 13. 기술 의사결정

### 생성 방식: 하이브리드 채택

도우미별 기본 시간 템플릿(`src/data/`) + GPT가 사용자 온보딩 정보로 조정. 완전 AI 대비 빠른 응답과 일관된 품질 확보.

### 데이터 저장

| 데이터 | 저장소 |
|--------|--------|
| 프로필 | Firestore `helperProfiles/{userId}_{helperId}` |
| 스케줄 | 기존 `events` 컬렉션 (캘린더 호환) |
| 템플릿 | 로컬 JS `src/data/` |

---

## 14. 새 도우미 제작 체크리스트

### Phase 1: 설계

- [ ] ID 배정 (H??) + 유형 결정 (A/B)
- [ ] 테마 색상 + 카테고리 정의 (이름/색상/아이콘)
- [ ] 프로필 스키마 + 일수 선택 방식
- [ ] 기획 문서 (`docs/ideas/{NAME}_SCHEDULE_HELPER_v1.0.md`)

### Phase 2: 구현

- [ ] `src/data/{name}Defaults.js` (필요 시)
- [ ] `src/utils/helperParser.js` - 트리거 감지 함수
- [ ] `src/components/{Name}Card.jsx` (유형 A) 또는 `{Name}View.jsx` (유형 B)
- [ ] `src/services/openai.js` - GPT 함수 (유형 A)
- [ ] `src/locales/ko.js`, `en.js` - i18n 키

### Phase 3: 통합

- [ ] HelperSelector 메뉴 항목
- [ ] ChatInterface 트리거 감지 (유형 A)
- [ ] App.jsx: import + 탭 버튼 + 뷰 렌더링 분기 + i18n (유형 B)

### Phase 4: 검증

- [ ] 라이트/다크 모드, 한국어/영어 전환
- [ ] Firestore 저장/로드, 캘린더 갱신
- [ ] 기존 도우미 영향 없음, 데모 모드 에러 없음
- [ ] 모바일 반응형

---

## 관련 문서

- `docs/ideas/WORK_SCHEDULE_HELPER_v1.0.md` -- 업무 도우미
- `docs/ideas/PET_CARE_SCHEDULE_HELPER_v1.0.md` -- 펫 케어 도우미
- `docs/ideas/MAJOR_EVENTS_SCHEDULE_HELPER_v1.0.md` -- 행사 도우미
- `docs/ideas/CHILDCARE_SCHEDULE_HELPER_v1.0.md` -- 육아 도우미
- `docs/ideas/DIET_SCHEDULE_HELPER_v1.0.md` -- 다이어트 도우미
- `docs/ideas/SPORTS_SCHEDULE_HELPER_v1.0.md` -- 운동 도우미

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | PLAN + DEV_GUIDE 최초 작성 |
| 1.1 | 2026-02-19 | App.jsx 탭 전환 시스템 추가 |
| 1.2 | 2026-02-19 | H04 (업무 도우미) 반영 |
| 2.0 | 2026-02-19 | 두 문서 통합, 중복 제거 및 축약 (1394줄 -> 약 400줄) |
