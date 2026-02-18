# 게임 스케줄 도우미 기획서 v1.0

> 게임 업데이트, 시즌 출시, 신작 출시 일정을 자동으로 캘린더에 등록하는 도우미
> 작성일: 2026-02-19 | 버전: 1.0

---

## 개요

사용자가 플레이하는 게임을 등록하면, 해당 게임의 업데이트 일정, 시즌/패치 출시일, 이벤트 기간 등을 자동으로 캘린더에 추가하는 도우미 기능.

**핵심 가치**
- 게임 일정 놓침 방지 — 시즌 시작, 한정 이벤트, 사전예약 보상 등을 놓치지 않음
- 채팅 기반 등록 — "발로란트 일정 알려줘" 한마디로 게임 일정 자동 등록
- 다중 게임 관리 — 여러 게임의 일정을 하나의 캘린더에서 통합 관리

---

## 도우미 ID

| ID | 도우미 | 설명 | 우선순위 |
|----|--------|------|----------|
| H10 | 게임 스케줄 도우미 | 게임 업데이트, 시즌, 출시일 캘린더 등록 | Phase 2 확장 도우미 |

> SCHEDULE_HELPER_PLAN_v1.0.md의 도우미 체계에 H10으로 편입

---

## 지원 일정 유형

### 1. 시즌/에피소드 출시
- 배틀패스 시즌 시작/종료
- 에피소드/챕터 전환
- 랭크 시즌 리셋

### 2. 게임 업데이트/패치
- 정기 업데이트 (매주/격주 점검)
- 대규모 패치 (밸런스, 신규 콘텐츠)
- 핫픽스

### 3. 이벤트
- 한정 이벤트 기간 (시작~종료)
- 콜라보 이벤트
- 무료 보상/출석 이벤트

### 4. 신작 출시
- 정식 출시일
- 얼리 액세스/오픈 베타
- 사전예약 시작/종료
- DLC/확장팩 출시

### 5. e스포츠/대회
- 대회 시작일 및 결승전 날짜
- 시청 보상 드롭 기간

---

## 사용자 플로우

### 기본 플로우

```
1. 채팅에서 게임 관련 일정 요청
   ├─ "발로란트 다음 시즌 언제야?"
   ├─ "겐신 4.5 업데이트 일정 등록해줘"
   ├─ "이번 달 게임 일정 알려줘"
   └─ 또는 도우미 선택 UI에서 "게임 스케줄 도우미" 클릭

2. 온보딩 (최초 1회)
   ├─ "어떤 게임을 하시나요?" → 게임 검색/선택 (복수 가능)
   ├─ "어떤 알림을 원하시나요?" → 시즌/패치/이벤트/출시 (복수 선택)
   └─ "업데이트 알림을 며칠 전에 받으시겠어요?" → 당일/1일 전/3일 전

3. AI가 게임 일정 생성 (카드 목록으로 표시)
   ├─ 2026-02-25  발로란트 에피소드 10 Act 2 시작
   ├─ 2026-03-05  겐신임팩트 4.5 업데이트
   ├─ 2026-03-12  발로란트 정기 패치 10.04
   └─ 2026-03-15  몬스터헌터 와일즈 DLC 출시

4. 사용자 확인/수정
   ├─ "전체 등록" → 일괄 Firestore 저장
   ├─ 개별 카드 삭제 → 불필요한 일정 제외
   ├─ "발로란트만 등록해줘" → 필터 후 등록
   └─ "다시 알려줘" → 재검색
```

### 후속 사용 플로우

```
1. 게임 추가
   └─ "오버워치 일정도 추가해줘" → 기존 게임 목록에 추가

2. 일정 갱신
   └─ "게임 일정 업데이트해줘" → 최신 정보로 갱신

3. 특정 게임 조회
   └─ "발로란트 이번 달 일정" → 해당 게임만 필터

4. 게임 삭제
   └─ "겐신 일정 더 이상 안 받을래" → 게임 목록에서 제거
```

---

## 게임 데이터 소스 전략

### MVP: GPT 지식 기반 생성

GPT-4o-mini의 학습 데이터와 일반 지식을 활용하여 주요 게임의 알려진 일정을 생성한다.

**장점**: 별도 API 불필요, 구현 간단, 비용 없음
**단점**: 최신 정보 부정확 가능, 미발표 일정은 추정치

**보완 전략**:
- GPT에게 "확정된 일정"과 "추정 일정"을 구분하여 응답하도록 프롬프트 설계
- 추정 일정은 카드에 `(추정)` 라벨 표시
- 사용자가 직접 날짜 수정 가능

### Phase 2: 웹 크롤링/RSS 연동

| 소스 | 대상 게임 | 데이터 |
|------|----------|--------|
| 공식 사이트 RSS | 대형 게임 전체 | 패치노트, 공지사항 |
| Steam 뉴스 API | Steam 게임 | 업데이트 공지 |
| 게임 위키/커뮤 | 인기 게임 | 시즌 일정, 이벤트 |

### Phase 3: 커뮤니티 기반 일정 DB

사용자들이 직접 게임 일정을 추가/검증하는 공유 데이터베이스.

---

## 지원 게임 목록 (MVP)

### Tier 1 — 우선 지원 (일정이 규칙적인 인기 게임)

| 게임 | 장르 | 일정 주기 | 주요 일정 유형 |
|------|------|----------|---------------|
| 발로란트 (Valorant) | FPS | 2주 패치, 에피소드 단위 시즌 | 시즌, 패치, 랭크 리셋, 스킨 |
| 리그 오브 레전드 (LoL) | MOBA | 2주 패치, 시즌 스플릿 | 패치, 시즌, e스포츠 |
| 겐신 임팩트 | 오픈월드 RPG | 6주 버전 업데이트 | 버전 업데이트, 이벤트, 배너 |
| 포트나이트 (Fortnite) | 배틀로얄 | 시즌 단위, 주간 업데이트 | 시즌, 콜라보, 이벤트 |
| 오버워치 2 | FPS | 시즌 단위 (9주) | 시즌, 패치, 이벤트 |

### Tier 2 — 확장 지원

| 게임 | 장르 | 비고 |
|------|------|------|
| 마인크래프트 | 샌드박스 | 대규모 업데이트 위주 |
| 에이펙스 레전드 | 배틀로얄 | 시즌, 랭크 스플릿 |
| 메이플스토리 | MMORPG | 정기 점검, 이벤트 |
| FIFA/FC 시리즈 | 스포츠 | TOTS, TOTY 등 프로모 |
| 스타레일 | 턴제 RPG | 겐신과 유사 주기 |

### Tier 3 — 사용자 요청 기반 추가

사용자가 채팅으로 요청하면 GPT가 해당 게임 정보를 바탕으로 일정을 생성. 정확도는 게임 인지도에 따라 달라짐.

---

## 데이터 구조

### 게임 프로필

```javascript
// src/services/helperProfile.js 에 추가
const gameProfile = {
  helperId: 'H10',
  userId: 'uid',
  preferences: {
    games: [
      {
        id: 'valorant',
        name: '발로란트',
        platform: 'PC',
        alertTypes: ['season', 'patch', 'event'],  // 원하는 알림 유형
        enabled: true
      },
      {
        id: 'genshin',
        name: '겐신 임팩트',
        platform: 'PC/모바일',
        alertTypes: ['version', 'event', 'banner'],
        enabled: true
      }
    ],
    alertTiming: 'day_before',  // 'same_day' | 'day_before' | '3_days_before'
    category: '게임'            // 캘린더에 표시할 카테고리
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 게임 일정 이벤트 스키마

```javascript
// 기존 events 컬렉션에 저장 (기존 이벤트 스키마 확장)
{
  userId: 'uid',
  title: '발로란트 에피소드 10 Act 2 시작',
  startTime: Timestamp,        // 시작일
  endTime: Timestamp | null,   // 이벤트 종료일 (해당 시)
  category: '게임',
  location: '',
  attendees: [],
  createdAt: Timestamp,
  createdVia: 'helper',        // 'chat' 대신 'helper'로 구분

  // 게임 도우미 전용 메타데이터
  helperMeta: {
    helperId: 'H10',
    gameId: 'valorant',
    gameName: '발로란트',
    scheduleType: 'season',    // 'season' | 'patch' | 'event' | 'release' | 'esports'
    isEstimated: false,        // 추정 일정 여부
    sourceUrl: ''              // 공식 출처 URL (있을 경우)
  }
}
```

---

## GPT 프롬프트 설계

### 시스템 프롬프트

```
[시스템 프롬프트]
너는 게임 일정 전문가야.
사용자가 등록한 게임의 업데이트, 시즌, 이벤트, 출시 일정을 JSON 배열로 생성해.

규칙:
- 확정된 공식 발표 일정은 isEstimated: false
- 공식 발표 전이지만 패턴으로 추정 가능한 일정은 isEstimated: true
- 오늘 날짜: {today}
- 향후 1~2개월 일정을 생성
- 지나간 날짜의 일정은 포함하지 마
- 각 일정에 게임 이름을 title에 포함시켜
- category는 "게임"으로 통일

[사용자 프롬프트]
등록 게임: {gameList}
알림 유형: {alertTypes}
조회 기간: {period}

[응답 형식]
{
  "action": "create_batch",
  "events": [
    {
      "title": "발로란트 에피소드 10 Act 2 시작",
      "startTime": "2026-02-25T00:00",
      "endTime": null,
      "category": "게임",
      "scheduleType": "season",
      "gameId": "valorant",
      "gameName": "발로란트",
      "isEstimated": false
    },
    {
      "title": "겐신 임팩트 4.5 업데이트 (추정)",
      "startTime": "2026-03-05T06:00",
      "endTime": null,
      "category": "게임",
      "scheduleType": "version",
      "gameId": "genshin",
      "gameName": "겐신 임팩트",
      "isEstimated": true
    }
  ]
}
```

---

## UI 설계

### 게임 일정 카드 디자인

| 일정 유형 | 카드 색상 | 아이콘 |
|----------|----------|--------|
| 시즌/에피소드 | 보라색 (purple) | 🎮 |
| 패치/업데이트 | 파란색 (blue) | 🔧 |
| 이벤트 | 노란색 (yellow) | 🎉 |
| 신작/DLC 출시 | 초록색 (green) | 🆕 |
| e스포츠/대회 | 빨간색 (red) | 🏆 |

### 추정 일정 표시

- 카드 우측 상단에 `추정` 뱃지 표시
- 툴팁: "공식 발표 전 추정 일정입니다. 실제 날짜와 다를 수 있습니다."
- 추정 일정 카드에 점선 테두리 적용

### 게임 선택 UI

```
┌─────────────────────────────────────┐
│  🎮 게임 스케줄 도우미              │
│                                     │
│  어떤 게임을 하시나요?              │
│  ┌──────────────────────────────┐   │
│  │ 🔍 게임 검색...              │   │
│  └──────────────────────────────┘   │
│                                     │
│  인기 게임                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 발로 │ │ 롤  │ │ 겐신 │ │ 포트 │  │
│  │란트  │ │     │ │임팩트│ │나이트│  │
│  │  ✓  │ │     │ │  ✓  │ │     │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 오버 │ │메이플│ │에이펙│ │스타  │  │
│  │워치2 │ │스토리│ │  스  │ │레일  │  │
│  │     │ │     │ │     │ │     │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  [다음 →]                           │
└─────────────────────────────────────┘
```

### 알림 설정 UI

```
┌─────────────────────────────────────┐
│  어떤 일정을 받으시겠어요?          │
│                                     │
│  ☑ 시즌/에피소드 출시               │
│  ☑ 패치/업데이트                    │
│  ☑ 이벤트                          │
│  ☐ 신작/DLC 출시                    │
│  ☐ e스포츠 대회                     │
│                                     │
│  언제 알려드릴까요?                 │
│  ○ 당일    ● 1일 전    ○ 3일 전     │
│                                     │
│  [일정 가져오기 →]                   │
└─────────────────────────────────────┘
```

---

## 필요한 파일 변경

| 파일 | 변경 내용 | 난이도 |
|------|----------|--------|
| `src/services/openai.js` | 게임 도우미용 시스템 프롬프트 추가, 게임 일정 파싱 로직 | 보통 |
| `src/services/schedule.js` | `addBatchEvents()` 활용 (기존 배치 저장 함수 재사용) | 쉬움 |
| `src/services/helperProfile.js` | 게임 프로필 스키마 추가 (`H10`) | 쉬움 |
| `src/components/ChatInterface.jsx` | 게임 온보딩 플로우, 게임 일정 카드 렌더링 | 보통 |
| `src/components/HelperSelector.jsx` | 게임 도우미 항목 추가 | 쉬움 |
| `src/components/GameScheduleCard.jsx` | **신규** — 게임 일정 확인 카드 (유형별 색상, 추정 뱃지) | 보통 |
| `src/components/GameSelector.jsx` | **신규** — 게임 검색/선택 UI | 보통 |
| `src/data/gameList.js` | **신규** — 지원 게임 목록 및 메타데이터 | 쉬움 |
| `src/locales/en.js`, `ko.js` | 게임 도우미 관련 번역 키 추가 | 쉬움 |

---

## 게임 목록 데이터

```javascript
// src/data/gameList.js
export const SUPPORTED_GAMES = [
  {
    id: 'valorant',
    name: '발로란트',
    nameEn: 'Valorant',
    developer: 'Riot Games',
    platform: ['PC'],
    genre: 'FPS',
    scheduleTypes: ['season', 'patch', 'event', 'esports'],
    updateCycle: '2주',         // 일반적 패치 주기
    icon: '🔫',
    tier: 1
  },
  {
    id: 'lol',
    name: '리그 오브 레전드',
    nameEn: 'League of Legends',
    developer: 'Riot Games',
    platform: ['PC'],
    genre: 'MOBA',
    scheduleTypes: ['season', 'patch', 'event', 'esports'],
    updateCycle: '2주',
    icon: '⚔️',
    tier: 1
  },
  {
    id: 'genshin',
    name: '겐신 임팩트',
    nameEn: 'Genshin Impact',
    developer: 'HoYoverse',
    platform: ['PC', '모바일', 'PS'],
    genre: '오픈월드 RPG',
    scheduleTypes: ['version', 'event', 'banner'],
    updateCycle: '6주',
    icon: '⭐',
    tier: 1
  },
  {
    id: 'fortnite',
    name: '포트나이트',
    nameEn: 'Fortnite',
    developer: 'Epic Games',
    platform: ['PC', '콘솔', '모바일'],
    genre: '배틀로얄',
    scheduleTypes: ['season', 'patch', 'event', 'collab'],
    updateCycle: '주간',
    icon: '🏗️',
    tier: 1
  },
  {
    id: 'overwatch2',
    name: '오버워치 2',
    nameEn: 'Overwatch 2',
    developer: 'Blizzard',
    platform: ['PC', '콘솔'],
    genre: 'FPS',
    scheduleTypes: ['season', 'patch', 'event'],
    updateCycle: '9주 시즌',
    icon: '🦸',
    tier: 1
  },
  // Tier 2
  {
    id: 'maplestory',
    name: '메이플스토리',
    nameEn: 'MapleStory',
    developer: 'Nexon',
    platform: ['PC'],
    genre: 'MMORPG',
    scheduleTypes: ['patch', 'event'],
    updateCycle: '주간 점검',
    icon: '🍁',
    tier: 2
  },
  {
    id: 'apex',
    name: '에이펙스 레전드',
    nameEn: 'Apex Legends',
    developer: 'Respawn',
    platform: ['PC', '콘솔'],
    genre: '배틀로얄',
    scheduleTypes: ['season', 'patch', 'event'],
    updateCycle: '시즌 단위',
    icon: '🎯',
    tier: 2
  },
  {
    id: 'starrail',
    name: '붕괴: 스타레일',
    nameEn: 'Honkai: Star Rail',
    developer: 'HoYoverse',
    platform: ['PC', '모바일', 'PS'],
    genre: '턴제 RPG',
    scheduleTypes: ['version', 'event', 'banner'],
    updateCycle: '6주',
    icon: '🚂',
    tier: 2
  }
]
```

---

## 채팅 인식 패턴

GPT가 게임 도우미 의도를 인식하는 채팅 입력 예시:

```
// 도우미 활성화 트리거
"게임 일정 알려줘"
"발로란트 다음 시즌 언제야?"
"겐신 업데이트 일정 등록해줘"
"이번 달 게임 일정"
"게임 스케줄 도우미"

// 게임 추가
"오버워치도 추가해줘"
"롤 일정도 받고 싶어"

// 일정 갱신
"게임 일정 업데이트해줘"
"최신 일정으로 갱신"

// 특정 게임 조회
"발로란트만 보여줘"
"겐신 이벤트 일정"

// 게임 제거
"메이플 일정 빼줘"
"발로란트 그만 추적해줘"
```

---

## 장기 로드맵

### Phase 1: MVP — GPT 기반 게임 일정 생성

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 1 | 게임 목록 데이터 (`gameList.js`) 작성 | 쉬움 |
| 2 | 게임 선택 UI (`GameSelector.jsx`) | 보통 |
| 3 | 게임 도우미 온보딩 플로우 | 보통 |
| 4 | GPT 게임 일정 프롬프트 설계 | 보통 |
| 5 | 게임 일정 카드 컴포넌트 (`GameScheduleCard.jsx`) | 보통 |
| 6 | 일괄 등록 로직 (기존 `create_batch` 재활용) | 쉬움 |
| 7 | 테스트 및 다듬기 | 보통 |

### Phase 2: 정확도 향상

| 기능 | 설명 |
|------|------|
| 웹 검색 연동 | GPT가 최신 게임 일정을 웹에서 검색하여 정확도 향상 |
| 사용자 피드백 | "이 일정 맞아요/틀려요" 피드백으로 정확도 개선 |
| 일정 자동 갱신 | 주기적으로 (주 1회) 게임 일정 자동 업데이트 알림 |

### Phase 3: 외부 데이터 연동

| 기능 | 설명 |
|------|------|
| Steam API 연동 | Steam 게임의 업데이트 뉴스 자동 수집 |
| RSS 피드 구독 | 게임 공식 블로그/사이트 RSS 구독 |
| 커뮤니티 일정 DB | 사용자들이 일정을 추가/검증하는 공유 시스템 |

### Phase 4: 스마트 기능

| 기능 | 설명 |
|------|------|
| 플레이타임 연동 | 게임 플레이 시간 기반 추천 우선순위 조정 |
| 충돌 감지 | "이 시간에 발로란트 패치인데 회의가 있어요" 경고 |
| 게임 추천 | "다음 주 출시 게임 중 관심 있을 만한 게임" 추천 |
| 알림 연동 | 일정 당일 푸시 알림 또는 이메일 알림 |

---

## 기술 의사결정

### GPT 기반 vs 외부 API 기반

| 방식 | 장점 | 단점 |
|------|------|------|
| **GPT 기반 (MVP 채택)** | 구현 간단, 추가 비용 없음, 모든 게임 대응 가능 | 최신 정보 부정확 가능, 미발표 일정 추정 |
| **외부 API 기반** | 정확한 실시간 데이터 | 게임별 API 다름, 구현 복잡, 유지보수 비용 |
| **하이브리드 (Phase 2 목표)** | GPT 기본 + 주요 게임은 API로 보정 | 구현 복잡도 증가 |

**MVP 결정**: GPT 기반 — 기존 GPT-4o-mini 인프라 활용, `isEstimated` 플래그로 정확도 투명성 확보

### 게임 목록 관리 방식

| 방식 | 채택 | 이유 |
|------|------|------|
| 로컬 JSON (`gameList.js`) | **MVP** | 변경 빈도 낮음, 빌드 시 포함 |
| Firestore | Phase 2 | 동적 게임 추가, 인기도 통계 수집 |
| 외부 게임 DB API (IGDB 등) | Phase 3 | 포괄적 게임 데이터 |

---

## MVP 완료 기준

- [ ] 도우미 선택에서 "게임 스케줄 도우미" 선택 가능
- [ ] 게임 선택 UI에서 Tier 1 게임 5개 선택 가능
- [ ] 채팅에서 "게임 일정 알려줘" 입력 시 온보딩 또는 일정 생성
- [ ] GPT가 향후 1~2개월 게임 일정을 카드 목록으로 생성
- [ ] 추정 일정에 `(추정)` 라벨 표시
- [ ] "전체 등록" 클릭 시 Firestore에 일괄 저장
- [ ] 캘린더에서 게임 일정 확인 가능 (카테고리: 게임)
- [ ] 개별 카드 수정/삭제 가능

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| GPT가 정확한 날짜를 모를 수 있음 | `isEstimated` 플래그로 구분, 사용자 수정 허용 |
| 게임 일정이 자주 변경됨 | 일정 갱신 기능 제공, Phase 2에서 자동 갱신 |
| 지원 게임 부족 요청 | Tier 3 (자유 입력) 지원, Phase 2에서 게임 DB 연동 |
| 과도한 일정 등록으로 캘린더 복잡 | 일정 유형별 필터, 사용자가 원하는 유형만 선택 |
| API 비용 증가 | 게임 일정은 캐싱 가능 (동일 게임은 일정 주기적 갱신) |

---

## 관련 문서

- [스케줄 도우미 기획서](SCHEDULE_HELPER_PLAN_v1.0.md) — 도우미 시스템 전체 기획 (H10으로 편입)
- [AI 인격 부여 기능](AI_PERSONA_FEATURE_v1.0.md) — 게임 도우미에도 인격 적용 가능
- [개선 아이디어](IMPROVEMENT_IDEAS_v1.1.md) — A카테고리(AI 기능 강화)와 연관

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 — MVP(GPT 기반 게임 일정 생성) + 장기 로드맵 |
