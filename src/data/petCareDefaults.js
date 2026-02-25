/**
 * petCareDefaults.js - 동물별 기본 돌봄 항목 및 주기 데이터
 * 펫 케어 카테고리(H11)에서 사용
 */

import {
  parseTimeInput, parsePetType, parsePetName, parsePetAge, parsePetSize, parsePetIndoor,
} from '../utils/categoryParser'

// 돌봄 유형별 스타일
export const CARE_TYPE_STYLES = {
  feeding:  { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: '🍽️' },
  water:    { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', icon: '💧' },
  walk:     { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: '🚶' },
  toilet:   { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🧹' },
  play:     { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: '🎾' },
  grooming: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', icon: '✨' },
  health:   { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: '🩺' },
  vet:      { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: '🏥' },
  medicine: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: '💊' },
}

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
  },
}

// 나이별 조정 규칙
export const AGE_ADJUSTMENTS = {
  dog: {
    baby:   { maxMonths: 6,        feedingCount: 4, walkDuration: 0.5, note: '사회화 훈련 포함' },
    adult:  { maxMonths: 84,       feedingCount: 2, walkDuration: 1.0, note: '표준 성견 케어' },
    senior: { maxMonths: Infinity, feedingCount: 2, walkDuration: 0.6, note: '관절 보조, 체중 관리' },
  },
  cat: {
    baby:   { maxMonths: 6,        feedingCount: 4, playDuration: 0.8, note: '사회화, 배변 훈련' },
    adult:  { maxMonths: 120,      feedingCount: 2, playDuration: 1.0, note: '표준 성묘 케어' },
    senior: { maxMonths: Infinity, feedingCount: 3, playDuration: 0.6, note: '신장 관리, 관절 보조' },
  },
}

/**
 * 나이(개월)로 성장 단계 판별
 */
export function getAgeStage(petType, ageMonths) {
  const stages = AGE_ADJUSTMENTS[petType]
  if (!stages) return 'adult'
  for (const [stage, info] of Object.entries(stages)) {
    if (ageMonths <= info.maxMonths) return stage
  }
  return 'senior'
}

// 반려동물 1마리 정보 수집 스텝
export const PET_SINGLE_STEPS = [
  { key: 'petType',   askKey: 'petCareAskType',    parser: parsePetType },
  { key: 'petName',   askKey: 'petCareAskName',    parser: parsePetName },
  { key: 'petAge',    askKey: 'petCareAskAge',     parser: parsePetAge },
  { key: 'petSize',   askKey: 'petCareAskSize',    parser: parsePetSize, skipIf: (a) => a._currentPet?.petType !== 'dog' },
  { key: 'petIndoor', askKey: 'petCareAskIndoor',  parser: parsePetIndoor },
]

// 마지막 공통 질문 스텝
export const PET_FINAL_STEPS = [
  { key: 'wakeUp',       askKey: 'petCareAskWakeUp',       parser: parseTimeInput },
  { key: 'simultaneous', askKey: 'petCareAskSimultaneous',  parser: parsePetIndoor, skipIf: (a) => (a.pets || []).length < 2 },
]

// 레거시 호환용
export const PET_ONBOARDING_STEPS = [
  ...PET_SINGLE_STEPS,
  { key: 'wakeUp', askKey: 'petCareAskWakeUp', parser: parseTimeInput },
]

// GPT 시스템 프롬프트 템플릿 (generatePetCareSchedule용)
export const PET_CARE_PROMPT_TEMPLATE = `너는 반려동물 돌봄 스케줄 전문가야.
반려동물 정보를 바탕으로 하루 돌봄 스케줄을 JSON으로 생성해.

규칙:
- 동물 종류(강아지/고양이)에 맞는 돌봄 항목 생성
- 나이(개월 수)에 따라 밥 횟수, 산책 시간, 놀이 강도 조절
- 보호자 기상 시간을 기준으로 시간 배분
- 각 항목에 예상 소요 시간(duration, 분 단위) 포함
- 반려동물 이름을 title에 포함
- category는 "펫 케어"로 통일
- careType은 반드시 다음 중 하나: feeding, water, walk, toilet, play, grooming, health, vet, medicine
- title에 아이콘 붙이지 말고 반려동물 이름과 케어 이름만 사용 (예: "미루 아침 밥 주기")

다중 반려동물 규칙:
- 여러 마리일 경우 각 반려동물 이름을 title에 명시
- "동시 케어: 예"이면 같은 종류의 케어를 같은 시간에 묶어서 생성 (예: "미루&보리 아침 밥 주기")
- "동시 케어: 아니오"이면 각 반려동물 별로 따로 시간을 배정 (겹치지 않게)

강아지 필수 항목: 밥(2회, 아기면 3~4회), 산책(2회), 놀이(1~2회)
강아지 선택 항목: 배변 패드 교체(실내견), 양치질, 빗질
강아지 크기별 산책: 소형 20분, 중형 30분, 대형 40분+
강아지 아기(0~6개월): 짧은 산책 10~15분, 밥 3~4회, 짧은 놀이
강아지 노령(7년+): 짧은 산책 20분, 부드러운 놀이

고양이 필수 항목: 밥(2회, 아기면 3~4회), 물 갈아주기, 화장실 청소(1~2회), 놀이(1~2회)
고양이 선택 항목: 빗질(주 3회), 귀 청소, 발톱
고양이 아기(0~6개월): 밥 3~4회, 짧고 자주 놀아주기
고양이 노령(10년+): 밥 2~3회 소량, 부드러운 놀이

시간 배치 규칙:
- 기상 직후: 밥 주기 + 산책(강아지) 또는 밥 + 물 + 화장실(고양이)
- 오전~오후: 놀이, 간식
- 저녁: 밥 + 산책(강아지) 또는 밥 + 물 + 화장실(고양이) + 놀이
- 밤: 양치질, 빗질 등 관리
- 활동 간 5~10분 간격 유지
- 절대 시간 겹침 금지

응답 형식 (JSON만 반환):
{
  "action": "petcare_batch",
  "events": [
    { "title": "🍽️ 초코 아침 밥 주기", "time": "07:00", "duration": 10, "category": "펫 케어", "careType": "feeding" }
  ]
}`
