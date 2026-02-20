/**
 * childcareDefaults.js - 육아 도우미(H06) 카테고리 스타일 및 월령별 기본값 데이터
 */

// 육아 카테고리별 스타일
export const CHILDCARE_CATEGORY_STYLES = {
  feeding: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  sleep: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  play: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  bath: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  diaper: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  outing: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  hospital: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  development: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
}

// 카테고리 한글 라벨 매핑 (i18n 키)
export const CHILDCARE_CATEGORY_LABELS = {
  feeding: 'childcareCategoryFeeding',
  sleep: 'childcareCategorySleep',
  play: 'childcareCategoryPlay',
  bath: 'childcareCategoryBath',
  diaper: 'childcareCategoryDiaper',
  outing: 'childcareCategoryOuting',
  hospital: 'childcareCategoryHospital',
  development: 'childcareCategoryDevelopment',
}

// 월령별 구간 정보 (GPT 프롬프트에 활용)
export const AGE_GROUPS = {
  newborn:     { maxMonths: 2,  label: '신생아',      feedingNote: '2~3시간 간격 수유', napNote: '16~18시간 수면', mealCount: 0 },
  earlyInfant: { maxMonths: 5,  label: '초기 영아',   feedingNote: '3~4시간 수유',      napNote: '낮잠 3회',       mealCount: 0 },
  weaning1:    { maxMonths: 8,  label: '이유식 시작',  feedingNote: '이유식 1~2회 + 수유', napNote: '낮잠 2회',     mealCount: 2 },
  weaning2:    { maxMonths: 11, label: '이유식 중기',  feedingNote: '이유식 3회 + 수유',   napNote: '낮잠 2회',     mealCount: 3 },
  aroundOne:   { maxMonths: 17, label: '돌 전후',     feedingNote: '유아식 전환',         napNote: '낮잠 1~2회',    mealCount: 3 },
  toddler:     { maxMonths: 24, label: '걸음마기',    feedingNote: '유아식 3끼',          napNote: '낮잠 1회',      mealCount: 3 },
  preschool:   { maxMonths: 36, label: '유아기',      feedingNote: '성인 유사 식사',       napNote: '낮잠 0~1회',   mealCount: 3 },
}

/**
 * 월령(개월)으로 발달 구간 판별
 */
export function getChildAgeGroup(ageMonths) {
  for (const [key, group] of Object.entries(AGE_GROUPS)) {
    if (ageMonths <= group.maxMonths) return key
  }
  return 'preschool'
}

/**
 * 생년월일로 월령 계산
 * @param {string} birthdate - "YYYY-MM-DD"
 * @returns {number} 개월 수
 */
export function calculateAgeMonths(birthdate) {
  const birth = new Date(birthdate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return Math.max(0, months)
}
