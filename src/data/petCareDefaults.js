/**
 * petCareDefaults.js - 동물별 기본 돌봄 항목 및 주기 데이터
 * 펫 케어 스케줄 도우미(H11)에서 사용
 */

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
