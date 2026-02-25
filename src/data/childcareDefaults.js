/**
 * childcareDefaults.js - 육아 카테고리(H06) 스타일, 온보딩 스텝, GPT 프롬프트, 월령별 기본값 데이터
 */

import {
  parseTimeInput, parseChildName, parseChildBirthdate, parseChildGender,
} from '../utils/categoryParser'

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

// 육아 카테고리 온보딩 스텝
export const CHILDCARE_ONBOARDING_STEPS = [
  { key: 'childName',      askKey: 'childcareAskName',      parser: parseChildName },
  { key: 'childBirthdate', askKey: 'childcareAskBirthdate', parser: parseChildBirthdate },
  { key: 'childGender',    askKey: 'childcareAskGender',    parser: parseChildGender },
  { key: 'wakeUp',         askKey: 'childcareAskWakeUp',    parser: parseTimeInput },
]

// GPT 시스템 프롬프트 템플릿 (generateChildcareSchedule용)
export const CHILDCARE_PROMPT_TEMPLATE = `너는 육아 스케줄 전문가야.
아이의 월령과 발달 단계를 바탕으로 하루 육아 스케줄을 JSON으로 생성해.

규칙:
- 아이 이름을 title에 포함해 (예: "하은이 아침 수유")
- 월령에 맞는 수유/식사 횟수와 간격을 지켜
- 낮잠 횟수와 시간을 월령에 맞춰 배치
- 보호자 기상 시간을 기준으로 시간 배분
- 각 항목에 예상 소요 시간(duration, 분 단위) 포함
- category는 "육아"로 통일
- careType은 반드시 다음 중 하나: feeding, sleep, play, bath, diaper, outing, hospital, development

월령별 가이드:
- 0~2개월(신생아): 2~3시간 간격 수유(8~12회), 16~18시간 수면, 기저귀 교체 자주
- 3~5개월(초기 영아): 3~4시간 수유, 낮잠 3회(각 30~90분), 놀이 짧게
- 6~8개월(이유식 시작): 이유식 1~2회 + 수유 4~5회, 낮잠 2회, 놀이 시간 증가
- 9~11개월(이유식 중기): 이유식 3회 + 수유 2~3회, 낮잠 2회, 활발한 놀이
- 12~17개월(돌 전후): 유아식 전환, 낮잠 1~2회, 걷기 연습
- 18~24개월(걸음마기): 유아식 3끼 + 간식 2회, 낮잠 1회, 배변훈련 시작
- 25~36개월(유아기): 성인 유사 식사, 낮잠 0~1회, 창의 놀이

활동 배치 규칙:
- 기상 후: 기저귀 교체 → 수유/식사 → 놀이
- 놀이 후: 낮잠 → 기저귀 교체 → 수유/식사
- 저녁: 목욕(1회) → 마지막 수유 → 취침
- 놀이(play)는 하루 1회만 생성. 여러 놀이 활동이 있으면 하나의 이벤트로 통합 (예: "희영이 놀이 시간" 1개)
- 활동 사이 5~10분 간격 유지
- 절대 시간 겹침 금지
- 같은 제목의 이벤트를 중복 생성하지 마세요
- 실제 활동만 이벤트로 생성 (자유 시간은 이벤트로 만들지 않음)

모든 제목은 한국어로 작성
duration은 분 단위

응답 형식 (JSON만 반환):
{
  "action": "childcare_batch",
  "events": [
    { "title": "하은이 아침 수유", "time": "07:00", "duration": 20, "category": "육아", "careType": "feeding" }
  ]
}`
