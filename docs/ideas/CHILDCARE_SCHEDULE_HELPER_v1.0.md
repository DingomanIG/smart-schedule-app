# 육아 스케줄 도우미 기획서 v1.0

> 아이 월령별 수유, 낮잠, 놀이, 병원 일정 통합 관리 도우미 (H06)
> 작성일: 2026-02-19 | 버전: 1.0

---

## 개요

아이의 월령(개월 수)에 맞춰 수유/이유식, 낮잠, 놀이, 목욕, 병원 등 육아 스케줄을 자동 생성하고 관리하는 도우미.
월령별로 크게 달라지는 육아 패턴을 반영하여, 신생아부터 만 3세까지 단계별 최적 루틴을 제안한다.

**핵심 가치**
- 월령 기반 자동 스케줄 -- "8개월 아기" 한마디로 이유식/낮잠/놀이 루틴 완성
- 다자녀 지원 -- 아이 여러 명의 스케줄을 하나의 뷰에서 통합 관리
- 예방접종 일정 자동 계산 -- 출생일 기준 국가 필수 접종 스케줄 자동 생성

---

## 기본 정보

| 항목 | 내용 |
|------|------|
| 도우미 ID | H06 |
| 유형 | B (전용 뷰) |
| 테마 색상 | rose |
| 진입 방식 | 채팅 트리거 + HelperSelector -> 전용 탭 뷰 |
| 뷰 컴포넌트 | `ChildcareView.jsx` |
| 확인 카드 | `ChildcareCard.jsx` (rose 테마) |
| 데이터 파일 | `src/data/childcareDefaults.js` |

---

## 카테고리 정의

| 카테고리 | 한국어 | 색상 | 설명 |
|----------|--------|------|------|
| `feeding` | 수유/식사 | amber | 모유, 분유, 이유식, 유아식 |
| `sleep` | 수면 | indigo | 낮잠, 야간 수면 |
| `play` | 놀이 | green | 자유놀이, 교구, 신체활동 |
| `bath` | 목욕 | sky | 목욕, 위생 관리 |
| `diaper` | 기저귀 | orange | 기저귀 교체 알림 |
| `outdoor` | 외출/산책 | emerald | 산책, 외출, 바깥 놀이 |
| `hospital` | 병원 | red | 예방접종, 건강검진, 진료 |
| `milestone` | 발달 체크 | violet | 월령별 발달 확인 항목 |

### 카테고리 스타일 (childcareDefaults.js)

```javascript
export const CHILDCARE_CATEGORY_STYLES = {
  feeding: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    label: '수유/식사',
  },
  sleep: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    label: '수면',
  },
  play: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    label: '놀이',
  },
  bath: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    label: '목욕',
  },
  diaper: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    label: '기저귀',
  },
  outdoor: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    label: '외출/산책',
  },
  hospital: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    label: '병원',
  },
  milestone: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    label: '발달 체크',
  },
}
```

---

## 프로필 데이터 스키마

```javascript
// Firestore 문서 ID: {userId}_H06
{
  userId: string,
  helperId: 'H06',

  // 아이 정보 (다자녀 지원)
  children: [
    {
      name: string,                        // 아이 이름 또는 별칭
      birthDate: string,                   // 생년월일 (YYYY-MM-DD)
      gender: 'male' | 'female',           // 성별
      // 월령은 birthDate에서 자동 계산 (저장하지 않음)
    },
  ],

  // 수유/식사 설정
  feeding: {
    type: 'breast' | 'formula' | 'mixed' | 'baby_food' | 'toddler_food',
    // breast: 모유 / formula: 분유 / mixed: 혼합 / baby_food: 이유식 / toddler_food: 유아식
    intervalHours: number,                 // 수유 간격 (시간) -- 0~12개월
    mealTimes: {                           // 이유식/유아식 시간 -- 6개월 이후
      breakfast: string | null,
      lunch: string | null,
      dinner: string | null,
      snack: string | null,
    },
  },

  // 수면 설정
  sleep: {
    nightBedTime: '20:00',                 // 야간 취침 시간
    nightWakeTime: '07:00',                // 기상 시간
    napCount: number,                      // 낮잠 횟수 (0~3)
    napTimes: [                            // 낮잠 시간대
      { start: '09:30', duration: 60 },    // 오전 낮잠
      { start: '13:00', duration: 90 },    // 오후 낮잠
    ],
  },

  // 활동 설정
  activity: {
    outdoorEnabled: true,                  // 산책/외출 포함 여부
    outdoorTime: '10:00',                  // 산책 시간
    outdoorDuration: 30,                   // 산책 시간 (분)
    bathTime: '18:30',                     // 목욕 시간
    playBlocks: number,                    // 놀이 블록 수 (1~4)
  },

  // 기저귀 설정
  diaper: {
    enabled: true,                         // 기저귀 알림 사용 여부 (배변훈련 완료 시 false)
    intervalHours: 2,                      // 확인 간격
  },

  // 예방접종 설정
  vaccination: {
    enabled: true,                         // 접종 일정 자동 생성
    completedList: [],                     // 완료된 접종 목록
  },

  updatedAt: Timestamp,
}
```

---

## 월령별 스케줄 기본 템플릿

월령에 따라 수유/수면/활동 패턴이 크게 달라지므로, `childcareDefaults.js`에 월령 구간별 기본 템플릿을 정의한다.

### 월령 구간 분류

| 구간 | 월령 | 핵심 변화 |
|------|------|----------|
| 신생아 | 0~2개월 | 2~3시간 간격 수유, 하루 16~18시간 수면 |
| 초기 영아 | 3~5개월 | 3~4시간 간격 수유, 낮잠 3회, 밤잠 길어짐 |
| 이유식 시작 | 6~8개월 | 이유식 1~2회 + 수유, 낮잠 2회 |
| 이유식 중기 | 9~11개월 | 이유식 3회 + 수유, 낮잠 2회 |
| 돌 전후 | 12~17개월 | 유아식 전환, 낮잠 1~2회, 걷기 시작 |
| 걸음마기 | 18~24개월 | 유아식 3끼 + 간식, 낮잠 1회, 배변훈련 시작 |
| 유아기 | 25~36개월 | 성인 식사 유사, 낮잠 0~1회, 배변훈련 완료 |

### 템플릿 예시 (childcareDefaults.js)

```javascript
export const AGE_TEMPLATES = {
  // 0~2개월 신생아
  newborn: {
    ageRange: [0, 2],
    label: '신생아',
    feeding: { type: 'breast', intervalHours: 2.5, count: 8 },
    sleep: { napCount: 0, nightBedTime: '20:00', nightWakeTime: '07:00', totalHours: 16 },
    // 신생아는 "낮잠" 개념 없이 수유-수면 반복
    diaper: { intervalHours: 2 },
    activity: { playBlocks: 0, outdoorEnabled: false },
    template: [
      { time: '07:00', title: '기상 + 수유', duration: 30, category: 'feeding' },
      { time: '08:00', title: '기저귀 확인', duration: 10, category: 'diaper' },
      { time: '09:30', title: '수유', duration: 30, category: 'feeding' },
      { time: '10:00', title: '기저귀 확인', duration: 10, category: 'diaper' },
      { time: '12:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '12:30', title: '기저귀 확인', duration: 10, category: 'diaper' },
      { time: '14:30', title: '수유', duration: 30, category: 'feeding' },
      { time: '15:00', title: '기저귀 확인', duration: 10, category: 'diaper' },
      { time: '17:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '18:30', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:30', title: '수유', duration: 30, category: 'feeding' },
      { time: '20:00', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 3~5개월
  earlyInfant: {
    ageRange: [3, 5],
    label: '초기 영아',
    feeding: { type: 'breast', intervalHours: 3, count: 6 },
    sleep: { napCount: 3, nightBedTime: '20:00', nightWakeTime: '07:00', totalHours: 15 },
    diaper: { intervalHours: 2.5 },
    activity: { playBlocks: 2, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상 + 수유', duration: 30, category: 'feeding' },
      { time: '08:00', title: '놀이 (바닥놀이)', duration: 30, category: 'play' },
      { time: '09:00', title: '오전 낮잠', duration: 60, category: 'sleep' },
      { time: '10:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '10:30', title: '산책', duration: 30, category: 'outdoor' },
      { time: '11:30', title: '낮잠', duration: 45, category: 'sleep' },
      { time: '13:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '14:00', title: '놀이', duration: 30, category: 'play' },
      { time: '15:00', title: '오후 낮잠', duration: 60, category: 'sleep' },
      { time: '16:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '18:00', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:00', title: '수유', duration: 30, category: 'feeding' },
      { time: '20:00', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 6~8개월
  earlyBabyFood: {
    ageRange: [6, 8],
    label: '이유식 초기',
    feeding: { type: 'baby_food', intervalHours: 4, babyFoodCount: 2 },
    sleep: { napCount: 2, nightBedTime: '20:00', nightWakeTime: '07:00', totalHours: 14 },
    diaper: { intervalHours: 2.5 },
    activity: { playBlocks: 3, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상 + 수유', duration: 20, category: 'feeding' },
      { time: '08:00', title: '이유식 (오전)', duration: 30, category: 'feeding' },
      { time: '09:00', title: '놀이 (감각놀이)', duration: 40, category: 'play' },
      { time: '09:30', title: '오전 낮잠', duration: 60, category: 'sleep' },
      { time: '11:00', title: '수유', duration: 20, category: 'feeding' },
      { time: '11:30', title: '산책', duration: 30, category: 'outdoor' },
      { time: '12:30', title: '이유식 (점심)', duration: 30, category: 'feeding' },
      { time: '13:30', title: '오후 낮잠', duration: 90, category: 'sleep' },
      { time: '15:00', title: '수유', duration: 20, category: 'feeding' },
      { time: '15:30', title: '놀이 (신체활동)', duration: 40, category: 'play' },
      { time: '17:00', title: '놀이 (자유놀이)', duration: 30, category: 'play' },
      { time: '18:00', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:00', title: '수유', duration: 20, category: 'feeding' },
      { time: '20:00', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 9~11개월
  midBabyFood: {
    ageRange: [9, 11],
    label: '이유식 중기',
    feeding: { type: 'baby_food', intervalHours: 4, babyFoodCount: 3 },
    sleep: { napCount: 2, nightBedTime: '20:30', nightWakeTime: '07:00', totalHours: 13 },
    diaper: { intervalHours: 3 },
    activity: { playBlocks: 3, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상', duration: 0, category: 'sleep' },
      { time: '07:30', title: '이유식 (아침)', duration: 30, category: 'feeding' },
      { time: '08:30', title: '놀이', duration: 40, category: 'play' },
      { time: '09:30', title: '오전 낮잠', duration: 60, category: 'sleep' },
      { time: '10:30', title: '수유 (간식)', duration: 20, category: 'feeding' },
      { time: '11:00', title: '산책', duration: 40, category: 'outdoor' },
      { time: '12:00', title: '이유식 (점심)', duration: 30, category: 'feeding' },
      { time: '13:00', title: '오후 낮잠', duration: 90, category: 'sleep' },
      { time: '14:30', title: '수유 (간식)', duration: 20, category: 'feeding' },
      { time: '15:00', title: '놀이 (신체활동)', duration: 40, category: 'play' },
      { time: '16:30', title: '놀이 (자유놀이)', duration: 30, category: 'play' },
      { time: '17:30', title: '이유식 (저녁)', duration: 30, category: 'feeding' },
      { time: '18:30', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:30', title: '수유', duration: 20, category: 'feeding' },
      { time: '20:30', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 12~17개월
  earlyToddler: {
    ageRange: [12, 17],
    label: '돌 전후',
    feeding: { type: 'toddler_food', mealsPerDay: 3, snackCount: 2 },
    sleep: { napCount: 1, nightBedTime: '20:30', nightWakeTime: '07:00', totalHours: 13 },
    diaper: { intervalHours: 3 },
    activity: { playBlocks: 4, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상', duration: 0, category: 'sleep' },
      { time: '07:30', title: '아침 식사', duration: 30, category: 'feeding' },
      { time: '08:30', title: '놀이 (교구놀이)', duration: 40, category: 'play' },
      { time: '09:30', title: '간식 + 수분', duration: 15, category: 'feeding' },
      { time: '10:00', title: '산책/바깥놀이', duration: 40, category: 'outdoor' },
      { time: '11:00', title: '놀이 (신체활동)', duration: 30, category: 'play' },
      { time: '12:00', title: '점심 식사', duration: 30, category: 'feeding' },
      { time: '13:00', title: '낮잠', duration: 90, category: 'sleep' },
      { time: '14:30', title: '간식', duration: 15, category: 'feeding' },
      { time: '15:00', title: '놀이 (자유놀이)', duration: 40, category: 'play' },
      { time: '16:00', title: '놀이 (책읽기)', duration: 20, category: 'play' },
      { time: '17:30', title: '저녁 식사', duration: 30, category: 'feeding' },
      { time: '18:30', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:30', title: '잠자리 루틴 (책/노래)', duration: 30, category: 'play' },
      { time: '20:30', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 18~24개월
  midToddler: {
    ageRange: [18, 24],
    label: '걸음마기',
    feeding: { type: 'toddler_food', mealsPerDay: 3, snackCount: 2 },
    sleep: { napCount: 1, nightBedTime: '21:00', nightWakeTime: '07:00', totalHours: 12 },
    diaper: { intervalHours: 3, pottyTraining: true },
    activity: { playBlocks: 4, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상', duration: 0, category: 'sleep' },
      { time: '07:30', title: '아침 식사', duration: 30, category: 'feeding' },
      { time: '08:30', title: '놀이 (창의놀이)', duration: 40, category: 'play' },
      { time: '09:30', title: '간식', duration: 15, category: 'feeding' },
      { time: '10:00', title: '바깥놀이/산책', duration: 50, category: 'outdoor' },
      { time: '11:00', title: '놀이 (신체활동)', duration: 40, category: 'play' },
      { time: '12:00', title: '점심 식사', duration: 30, category: 'feeding' },
      { time: '13:00', title: '낮잠', duration: 90, category: 'sleep' },
      { time: '14:30', title: '간식', duration: 15, category: 'feeding' },
      { time: '15:00', title: '놀이 (교구/블록)', duration: 40, category: 'play' },
      { time: '16:00', title: '바깥놀이', duration: 30, category: 'outdoor' },
      { time: '17:30', title: '저녁 식사', duration: 30, category: 'feeding' },
      { time: '18:30', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:30', title: '잠자리 루틴', duration: 30, category: 'play' },
      { time: '21:00', title: '취침', duration: 0, category: 'sleep' },
    ],
  },

  // 25~36개월
  lateToddler: {
    ageRange: [25, 36],
    label: '유아기',
    feeding: { type: 'toddler_food', mealsPerDay: 3, snackCount: 2 },
    sleep: { napCount: 0, nightBedTime: '21:00', nightWakeTime: '07:00', totalHours: 11 },
    diaper: { enabled: false },
    activity: { playBlocks: 5, outdoorEnabled: true },
    template: [
      { time: '07:00', title: '기상', duration: 0, category: 'sleep' },
      { time: '07:30', title: '아침 식사', duration: 30, category: 'feeding' },
      { time: '08:30', title: '놀이 (미술/창의)', duration: 40, category: 'play' },
      { time: '09:30', title: '간식', duration: 15, category: 'feeding' },
      { time: '10:00', title: '바깥놀이/공원', duration: 60, category: 'outdoor' },
      { time: '11:30', title: '놀이 (역할놀이)', duration: 30, category: 'play' },
      { time: '12:00', title: '점심 식사', duration: 30, category: 'feeding' },
      { time: '13:00', title: '조용한 놀이 (책/퍼즐)', duration: 40, category: 'play' },
      { time: '14:00', title: '놀이 (신체활동)', duration: 40, category: 'play' },
      { time: '15:00', title: '간식', duration: 15, category: 'feeding' },
      { time: '15:30', title: '바깥놀이', duration: 40, category: 'outdoor' },
      { time: '17:00', title: '놀이 (자유놀이)', duration: 30, category: 'play' },
      { time: '17:30', title: '저녁 식사', duration: 30, category: 'feeding' },
      { time: '18:30', title: '목욕', duration: 20, category: 'bath' },
      { time: '19:30', title: '잠자리 루틴', duration: 30, category: 'play' },
      { time: '21:00', title: '취침', duration: 0, category: 'sleep' },
    ],
  },
}
```

---

## 예방접종 일정 데이터

출생일 기준으로 국가 필수 예방접종 일정을 자동 계산한다.

```javascript
// childcareDefaults.js

export const VACCINATION_SCHEDULE = [
  // 출생 직후
  { name: 'BCG (결핵)', monthAge: 0, label: '출생 직후' },
  { name: 'B형간염 1차', monthAge: 0, label: '출생 직후' },

  // 1개월
  { name: 'B형간염 2차', monthAge: 1, label: '1개월' },

  // 2개월
  { name: 'DTaP 1차', monthAge: 2, label: '2개월' },
  { name: 'IPV 1차 (소아마비)', monthAge: 2, label: '2개월' },
  { name: 'Hib 1차', monthAge: 2, label: '2개월' },
  { name: '폐렴구균 1차', monthAge: 2, label: '2개월' },
  { name: '로타바이러스 1차', monthAge: 2, label: '2개월' },

  // 4개월
  { name: 'DTaP 2차', monthAge: 4, label: '4개월' },
  { name: 'IPV 2차', monthAge: 4, label: '4개월' },
  { name: 'Hib 2차', monthAge: 4, label: '4개월' },
  { name: '폐렴구균 2차', monthAge: 4, label: '4개월' },
  { name: '로타바이러스 2차', monthAge: 4, label: '4개월' },

  // 6개월
  { name: 'DTaP 3차', monthAge: 6, label: '6개월' },
  { name: 'IPV 3차', monthAge: 6, label: '6개월' },
  { name: 'Hib 3차', monthAge: 6, label: '6개월' },
  { name: 'B형간염 3차', monthAge: 6, label: '6개월' },
  { name: '로타바이러스 3차', monthAge: 6, label: '6개월' },
  { name: '인플루엔자 (매년)', monthAge: 6, label: '6개월~' },

  // 12개월
  { name: 'MMR 1차 (홍역/유행성이하선염/풍진)', monthAge: 12, label: '12개월' },
  { name: '수두 1차', monthAge: 12, label: '12개월' },
  { name: '폐렴구균 4차', monthAge: 12, label: '12~15개월' },
  { name: 'Hib 4차', monthAge: 12, label: '12~15개월' },
  { name: 'A형간염 1차', monthAge: 12, label: '12~23개월' },

  // 15~18개월
  { name: 'DTaP 4차', monthAge: 15, label: '15~18개월' },

  // 18~24개월
  { name: 'A형간염 2차', monthAge: 18, label: '18~24개월' },

  // 24~36개월
  { name: '일본뇌염 (사백신 1~2차)', monthAge: 12, label: '12~24개월' },
  { name: '일본뇌염 (사백신 3차)', monthAge: 24, label: '24~36개월' },

  // 만 4~6세 (48개월~)
  { name: 'DTaP 5차', monthAge: 48, label: '만 4~6세' },
  { name: 'IPV 4차', monthAge: 48, label: '만 4~6세' },
  { name: 'MMR 2차', monthAge: 48, label: '만 4~6세' },
  { name: '수두 2차', monthAge: 48, label: '만 4~6세 (권장)' },
]

// 접종일 계산 함수
export function getVaccinationDates(birthDate) {
  return VACCINATION_SCHEDULE.map(v => {
    const date = new Date(birthDate)
    date.setMonth(date.getMonth() + v.monthAge)
    return { ...v, scheduledDate: date }
  })
}
```

---

## 사용자 플로우

### 1단계: 진입

```
방법 A: 채팅에서 "육아 스케줄 짜줘" 입력
방법 B: HelperSelector > "육아 도우미" 클릭
  -> 전용 탭 뷰 (ChildcareView) 전환
```

### 2단계: 아이 등록 (최초 1회)

```
Step 1: 아이 정보
  - 이름 또는 별칭 (예: "서연이", "둘째")
  - 생년월일 (날짜 선택)
  - 성별 (남/여)
  -> 월령 자동 계산 표시 ("현재 8개월")
  -> [아이 추가] 버튼으로 다자녀 등록

Step 2: 수유/식사 설정
  - 월령에 따라 자동 분기:
    - 0~5개월: 수유 유형 (모유/분유/혼합) + 간격
    - 6~11개월: 이유식 횟수 + 수유 병행 + 시간대
    - 12개월~: 유아식 식사 시간 + 간식

Step 3: 수면 설정
  - 야간 취침/기상 시간
  - 낮잠 횟수 (월령 기본값 제안)
  - 낮잠 시간대

Step 4: 활동 설정
  - 산책/외출 포함 여부 + 시간
  - 목욕 시간
  - 놀이 시간 블록 수

Step 5: 부가 설정
  - 기저귀 알림 (배변훈련 완료 시 끄기)
  - 예방접종 일정 자동 생성 여부
```

### 3단계: 스케줄 자동 생성

프로필 저장 즉시, 월령 구간에 해당하는 `AGE_TEMPLATES`를 기반으로 사용자 설정을 반영하여 일일 스케줄을 생성한다. GPT 호출 불필요 (규칙 기반).

```
월령 계산 → 구간 매칭 → 기본 템플릿 로드 → 사용자 설정 반영 → 스케줄 출력
```

**사용자 설정 반영 규칙**:
- 수유 간격/시간 변경 -> 템플릿의 수유 항목 시간 조정
- 낮잠 횟수/시간 변경 -> 템플릿의 낮잠 항목 추가/제거
- 목욕/산책 시간 변경 -> 해당 항목 시간 조정
- 기저귀 비활성화 -> 기저귀 항목 제거

### 4단계: 캘린더 등록

확인 카드(ChildcareCard)에서 기간(1일/7일/30일) 선택 후 배치 저장.

---

## ChildcareView 구성

### 화면 레이아웃

```
┌─────────────────────────────────────────┐
│ 육아 도우미                             │
│                                         │
│ ┌─ 아이 선택 ─────────────────────────┐ │
│ │ [서연이 (8개월)]  [민준이 (25개월)] │ │
│ │ [+ 아이 추가]                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ 오늘의 스케줄 (서연이) ───────────┐ │
│ │ -- 수유/식사 --                     │ │
│ │ 07:00  기상 + 수유        [수유]    │ │
│ │ 08:00  이유식 (오전)      [수유]    │ │
│ │ 12:30  이유식 (점심)      [수유]    │ │
│ │ 19:00  수유               [수유]    │ │
│ │                                     │ │
│ │ -- 수면 --                          │ │
│ │ 09:30  오전 낮잠 (60분)   [수면]    │ │
│ │ 13:30  오후 낮잠 (90분)   [수면]    │ │
│ │ 20:00  취침               [수면]    │ │
│ │                                     │ │
│ │ -- 활동 --                          │ │
│ │ 09:00  놀이 (감각놀이)    [놀이]    │ │
│ │ 10:30  산책               [외출]    │ │
│ │ 15:30  놀이 (신체활동)    [놀이]    │ │
│ │ 17:00  놀이 (자유놀이)    [놀이]    │ │
│ │ 18:00  목욕               [목욕]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ 예방접종 일정 ────────────────────┐ │
│ │ [완료] B형간염 1차 (출생 직후)      │ │
│ │ [완료] BCG (출생 직후)              │ │
│ │ [다음] DTaP 3차 -- 2026-03-15      │ │
│ │        IPV 3차 -- 2026-03-15       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [캘린더에 등록]  기간: [1일|7일|30일]   │
│ [프로필 수정]                           │
└─────────────────────────────────────────┘
```

### 주요 인터랙션

| 기능 | 설명 |
|------|------|
| 아이 전환 | 탭 형태로 아이별 스케줄 전환 |
| 아이 추가 | "+" 버튼으로 새 아이 등록 (다자녀) |
| 월령 자동 갱신 | birthDate 기반 실시간 월령 계산, 구간 변경 시 템플릿 자동 전환 |
| 항목 추가/제거 | 각 섹션 "+" / "-" 버튼 |
| 접종 완료 체크 | 예방접종 항목 체크박스로 완료 표시 |
| 기간 선택 | 1일 / 7일 / 30일 토글 |
| 프로필 수정 | 설정 폼 재표시 |

### 다자녀 스케줄 병합

다자녀 선택 시 각 아이의 스케줄을 시간순으로 합쳐 한 화면에 표시한다.
이벤트 제목에 아이 이름을 접두어로 추가한다.

```
07:00  [서연] 기상 + 수유     [수유]
07:00  [민준] 기상             [수면]
07:30  [민준] 아침 식사        [식사]
08:00  [서연] 이유식 (오전)    [수유]
...
```

---

## 확인 카드 (ChildcareCard) 설계

### 기본 구조

```
┌─────────────────────────────────────────┐
│  육아 스케줄 (서연이)        14개 일정   │
│  8개월 -- 이유식 초기                    │
│  기간: 2026-02-19 ~ 2026-02-25 (7일)   │
│  -- 1일치 템플릿 --                      │
│ ┌─────────────────────────────────────┐ │
│ │ 07:00  기상 + 수유  20분  [수유]    │ │
│ │ 08:00  이유식 (오전) 30분  [수유]   │ │
│ │ 09:00  놀이 (감각)  40분  [놀이]    │ │
│ │ 09:30  오전 낮잠    60분  [수면]    │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│ [전체 등록] [취소]                       │
└─────────────────────────────────────────┘
```

### ChildcareCard Props

```jsx
export default function ChildcareCard({
  events = [],
  days = [],
  childName,
  monthAge,
  ageLabel,
  onConfirmAll,
  onRemoveItem,
  onCancel,
  confirmed,
  cancelled,
}) {
  // rose 테마 적용
  // 헤더에 아이 이름 + 월령 + 구간 라벨 표시
}
```

---

## 일수 선택 패턴

육아 도우미는 유형 B(전용 뷰)이므로 뷰 내부에 기간 선택 토글을 배치한다.
채팅 트리거로 진입한 경우에도 탭 전환 후 전용 뷰에서 기간을 선택한다.

> 참고: DEV_GUIDE 8.4절 "일수 선택 패턴" 표준을 따른다.

### 진입 경로별 일수 선택

```
경로 1: 전용 뷰 직접 진입 (탭 클릭 / HelperSelector)
  아이 등록 + 프로필 설정 완료 → 뷰 하단 기간 토글에서 선택 → "캘린더에 등록" 클릭

경로 2: 채팅 트리거 ("육아 스케줄 짜줘")
  트리거 감지 → 안내 메시지 → 전용 뷰 탭 전환 → 이후 경로 1과 동일
```

### 기간 선택 UI (ChildcareView 하단)

```jsx
const [registerDays, setRegisterDays] = useState(7)

<div className="flex items-center gap-2">
  <span className="text-xs text-gray-500 dark:text-gray-400">
    {t('helperChildcareRegisterPeriod')}
  </span>
  {[1, 7, 30].map((d) => (
    <button
      key={d}
      onClick={() => setRegisterDays(d)}
      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
        registerDays === d
          ? 'bg-rose-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}
    >
      {t(`helperChildcareDay${d}`)}
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

### 월령 변경 시 자동 갱신

장기간(30일) 등록 시 기간 도중 월령 구간이 바뀔 수 있다.
이 경우 구간 변경 시점부터 새 템플릿을 적용한다.

```
예시: 현재 5개월 28일, 30일치 등록

1~2일차: earlyInfant (3~5개월) 템플릿 적용
3~30일차: earlyBabyFood (6~8개월) 템플릿 적용
  → 이유식 항목 추가, 수유 간격 변경
```

### 다자녀 기간 등록

다자녀의 경우 아이별로 개별 등록하거나 전체 한번에 등록할 수 있다.

| 모드 | 동작 | 이벤트 제목 |
|------|------|------------|
| 단일 아이 선택 | 선택된 아이 스케줄만 등록 | `아침 식사`, `오전 낮잠` |
| 전체 보기 | 모든 아이의 스케줄을 병합 등록 | `[서연] 수유`, `[민준] 아침 식사` |

### 등록 버튼 + 기간 배치

```
[캘린더에 등록]  기간: [오늘만] [이번 주] [이번 달]
```

"캘린더에 등록" 클릭 시 ChildcareCard(확인 카드)를 표시하고,
사용자가 "전체 등록"을 누르면 `addBatchEvents()`로 Firestore에 배치 저장한다.

---

## 채팅 트리거 패턴

```javascript
// src/utils/helperParser.js에 추가

export function isChildcareHelperTrigger(text) {
  if (!text) return false
  const lower = text.toLowerCase().trim()
  return /육아\s*(스케줄|일정|계획|루틴|관리)|아기\s*(스케줄|일정|루틴)|아이\s*(스케줄|일정|루틴)|수유\s*(스케줄|일정|계획)|childcare\s*(schedule|plan|routine)|baby\s*(schedule|routine)/.test(lower)
}
```

**트리거 예시**:
- "육아 스케줄 짜줘"
- "아기 일정 관리"
- "수유 스케줄 만들어줘"
- "아이 루틴 짜줘"
- "baby schedule"

---

## i18n 키

```javascript
// src/locales/ko.js 추가
helperChildcare: '육아 도우미',
helperChildcareStart: '육아 도우미를 시작합니다. 아이 정보를 등록해주세요.',
helperChildcareBatchSaved: '육아 스케줄이 등록되었습니다.',
helperChildcareCancelled: '육아 스케줄 등록이 취소되었습니다.',
helperChildcareError: '육아 스케줄 생성 중 오류가 발생했습니다.',
helperChildcareChildInfo: '아이 정보',
helperChildcareAddChild: '아이 추가',
helperChildcareName: '이름 또는 별칭',
helperChildcareBirthDate: '생년월일',
helperChildcareGender: '성별',
helperChildcareBoy: '남아',
helperChildcareGirl: '여아',
helperChildcareMonthAge: '개월',
helperChildcareAgeGroup: '월령 구간',
helperChildcareFeedingSetting: '수유/식사 설정',
helperChildcareFeedingType: '수유 유형',
helperChildcareBreast: '모유',
helperChildcareFormula: '분유',
helperChildcareMixed: '혼합',
helperChildcareBabyFood: '이유식',
helperChildcareToddlerFood: '유아식',
helperChildcareFeedingInterval: '수유 간격',
helperChildcareSleepSetting: '수면 설정',
helperChildcareBedTime: '취침 시간',
helperChildcareWakeTime: '기상 시간',
helperChildcareNapCount: '낮잠 횟수',
helperChildcareNap: '낮잠',
helperChildcareActivitySetting: '활동 설정',
helperChildcareOutdoor: '산책/외출',
helperChildcareBathTime: '목욕 시간',
helperChildcarePlayBlocks: '놀이 시간 블록 수',
helperChildcareDiaper: '기저귀 알림',
helperChildcareDiaperOff: '배변훈련 완료',
helperChildcareVaccination: '예방접종 일정',
helperChildcareVaccinationEnabled: '접종 일정 자동 생성',
helperChildcareVaccinationDone: '완료',
helperChildcareVaccinationNext: '다음 접종',
helperChildcareEditProfile: '프로필 수정',
helperChildcareSection_feeding: '수유/식사',
helperChildcareSection_sleep: '수면',
helperChildcareSection_activity: '활동',
helperChildcareSection_vaccination: '예방접종',
helperChildcareAllChildren: '전체 보기',
helperChildcareRegisterPeriod: '등록 기간',
helperChildcareDay1: '오늘만',
helperChildcareDay7: '이번 주',
helperChildcareDay30: '이번 달',

// src/locales/en.js 추가
helperChildcare: 'Childcare Helper',
helperChildcareStart: 'Starting Childcare Helper. Please register your child.',
helperChildcareBatchSaved: 'Childcare schedule has been registered.',
helperChildcareCancelled: 'Childcare schedule registration cancelled.',
helperChildcareError: 'An error occurred while creating the childcare schedule.',
// ... (나머지 영문 키)
```

---

## 파일 변경 목록

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/ChildcareView.jsx` | 신규 | 전용 뷰 (프로필 설정 + 스케줄 표시 + 접종 관리) |
| `src/components/ChildcareCard.jsx` | 신규 | 확인 카드 (rose 테마) |
| `src/data/childcareDefaults.js` | 신규 | 월령별 템플릿, 예방접종 데이터, 카테고리 스타일 |
| `src/utils/helperParser.js` | 수정 | `isChildcareHelperTrigger()` 추가 |
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
'childcare'      rose           ChildcareView           ← 신규
```

### 진입 경로 3가지

```
경로 1: 탭 버튼 직접 클릭
  App.jsx 탭 바 > [육아] 클릭 > setChatMode('childcare') > ChildcareView 렌더링

경로 2: HelperSelector (채팅 입력창 좌측 Sparkles 버튼)
  ChatInterface > HelperSelector > handleSelect('childcare')
  > ChatInterface.handleStartHelper('childcare')
  > 채팅에 안내 메시지 + setChatMode('childcare')로 탭 전환

경로 3: 채팅 트리거 (자연어 입력)
  ChatInterface > "육아 스케줄 짜줘" 입력
  > isChildcareHelperTrigger() 감지
  > 채팅에 안내 메시지 + setChatMode('childcare')로 탭 전환
```

### 1단계: App.jsx 탭 버튼 추가

```jsx
// 1. import 추가
import { Baby } from 'lucide-react'
import ChildcareView from './components/ChildcareView'

// 2. 탭 버튼 추가 (기존 petcare 탭 뒤에)
<button
  onClick={() => setChatMode('childcare')}
  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-w-[64px] justify-center ${
    chatMode === 'childcare'
      ? 'bg-rose-500 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
  }`}
>
  <Baby size={13} />
  {t('helperChildcare')}
</button>

// 3. 뷰 렌더링 추가 (Content Area 분기에 추가)
{chatMode === 'childcare' && (
  <ChildcareView userId={user.uid} onEventCreated={handleEventCreated} />
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
// ChatInterface.jsx — handleStartHelper에 childcare 분기 추가
const handleStartHelper = async (type) => {
  // 기존: daily, petcare, work 처리
  if (type !== 'daily' && type !== 'petcare' && type !== 'work'
      && type !== 'childcare') return    // ← childcare 추가

  // childcare는 전용 뷰 도우미(유형 B) → 채팅 온보딩 불필요, 탭 전환만
  if (type === 'childcare') {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: t('helperChildcareStart'),
    }])
    onSwitchMode?.('childcare')          // App.jsx의 setChatMode('childcare') 호출
    return
  }

  // 기존 daily/petcare/work 로직 유지...
}
```

```jsx
// ChatInterface.jsx — handleSend 내 트리거 감지에 추가
import { isChildcareHelperTrigger } from '../utils/helperParser'

// 도우미 트리거 감지 블록에 추가 (기존 트리거들 위에)
if (isChildcareHelperTrigger(currentInput)) {
  await handleStartHelper('childcare')
  return
}
```

### 3단계: HelperSelector 메뉴 항목 추가

```jsx
// HelperSelector.jsx
import { Baby } from 'lucide-react'

// 기존 버튼들 뒤에 추가
<button
  onClick={() => handleSelect('childcare')}
  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
>
  <Baby size={14} className="text-rose-500" />
  {t('helperChildcare')}
</button>
```

### 탭 전환 흐름도

```
사용자 입력/클릭
  │
  ├─ [App.jsx 탭 바] ──────────────────────> setChatMode('childcare')
  │                                             │
  ├─ [HelperSelector] ──> handleSelect ──> handleStartHelper('childcare')
  │                                             │
  └─ [채팅 입력] ──> isChildcareHelperTrigger ──> handleStartHelper('childcare')
                                                │
                                                ├─ 안내 메시지 추가
                                                └─ onSwitchMode('childcare')
                                                    │
                                                    v
                                              setChatMode('childcare')
                                                    │
                                                    v
                                              ChildcareView 렌더링
```

---

## 구현 순서

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 1 | `childcareDefaults.js` 월령별 템플릿 + 예방접종 데이터 + 카테고리 스타일 | 보통 |
| 2 | 월령 계산 유틸 함수 (birthDate -> monthAge -> 구간 매칭) | 쉬움 |
| 3 | `ChildcareView.jsx` 아이 등록 폼 (다자녀 지원) | 보통 |
| 4 | `ChildcareView.jsx` 프로필 설정 폼 (5단계) | 보통 |
| 5 | `ChildcareView.jsx` 스케줄 생성 로직 (템플릿 + 사용자 설정 병합) | 보통 |
| 6 | `ChildcareView.jsx` 스케줄 표시 UI (섹션별 + 다자녀 병합) | 보통 |
| 7 | `ChildcareView.jsx` 예방접종 섹션 (완료 체크 + 다음 접종 표시) | 보통 |
| 8 | `ChildcareCard.jsx` 확인 카드 (기간 선택 + 등록) | 보통 |
| 9 | 통합: HelperSelector, ChatInterface, App.jsx, helperParser | 쉬움 |
| 10 | i18n 키 추가 | 쉬움 |
| 11 | UI 검증 (라이트/다크, 모바일 반응형, 다자녀 전환) | 보통 |

---

## 향후 고도화 (Phase 2+)

| 기능 | 설명 |
|------|------|
| 성장 기록 | 키/몸무게 입력 -> 성장 곡선 그래프 (WHO 표준 비교) |
| 발달 체크리스트 | 월령별 발달 이정표 체크 (뒤집기, 앉기, 걷기 등) |
| 수유/수면 기록 | 실제 수유량, 수면 시간 기록 -> 패턴 분석 |
| 주간 리포트 | "이번 주 낮잠 평균 2.5시간, 이유식 3회/일" AI 요약 |
| 구간 전환 알림 | "서연이가 6개월이 되었어요. 이유식을 시작할까요?" 자동 제안 |
| 다자녀 시간 충돌 | 두 아이의 스케줄 겹침 감지 + 조정 제안 |
| 어린이집 연동 | 등/하원 시간 반영, 어린이집 식단표 연동 |

---

## 관련 문서

- [스케줄 도우미 기획서](../ideas/SCHEDULE_HELPER_PLAN_v1.0.md) -- H06 육아 도우미 정의
- [스케줄 도우미 제작 가이드](SCHEDULE_HELPER_DEV_GUIDE_v1.0.md) -- 공통 개발 패턴
- [펫 케어 도우미](../ideas/PET_CARE_SCHEDULE_HELPER_v1.0.md) -- 유사 구조 참조 (돌봄 도우미)
- [다이어트 도우미 기획서](DIET_SCHEDULE_HELPER_v1.0.md) -- 동일 Phase 도우미

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 -- 육아 도우미(H06) 상세 기획 |
