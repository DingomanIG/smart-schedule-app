/**
 * workDefaults.js - 업무 카테고리(H04) 스타일, 온보딩 스텝, GPT 프롬프트 규칙
 */

import {
  parseWorkType, parseWorkHours, parseFocusPeak, parsePetIndoor,
} from '../utils/categoryParser'

// 업무 카테고리별 스타일
export const WORK_CATEGORY_STYLES = {
  deepwork: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: '🎯',
  },
  meeting: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    icon: '👥',
  },
  admin: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-600 dark:text-gray-400',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
    icon: '📋',
  },
  planning: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: '💡',
  },
  communication: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    icon: '💬',
  },
  break: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    icon: '☕',
  },
  commute: {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
    icon: '🚗',
  },
  deadline: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    icon: '🔥',
  },
}

// 카테고리 한글 라벨 매핑 (i18n 키)
export const WORK_CATEGORY_LABELS = {
  deepwork: 'workCategoryDeepwork',
  meeting: 'workCategoryMeeting',
  admin: 'workCategoryAdmin',
  planning: 'workCategoryPlanning',
  communication: 'workCategoryCommunication',
  break: 'workCategoryBreak',
  commute: 'workCategoryCommute',
  deadline: 'workCategoryDeadline',
}

// 집중 시간대 매핑
export const FOCUS_TIME_MAP = {
  morning: {
    peak: ['09:00', '12:00'],
    secondary: ['14:00', '16:00'],
    lowEnergy: ['13:00', '14:00'],
  },
  afternoon: {
    peak: ['14:00', '17:00'],
    secondary: ['09:30', '11:30'],
    lowEnergy: ['13:00', '14:00'],
  },
  none: {
    peak: ['09:30', '11:30'],
    secondary: ['14:00', '16:00'],
    lowEnergy: ['13:00', '14:00'],
  },
}

// 근무 형태별 조정
export const WORK_TYPE_ADJUSTMENTS = {
  office: {
    commuteIncluded: true,
    meetingBuffer: 15,
    lunchFlexible: false,
  },
  remote: {
    commuteIncluded: false,
    meetingBuffer: 5,
    lunchFlexible: true,
  },
  hybrid: {
    commuteIncluded: true,
    meetingBuffer: 10,
    lunchFlexible: true,
  },
  freelance: {
    commuteIncluded: false,
    meetingBuffer: 5,
    lunchFlexible: true,
  },
}

// 업무 카테고리 온보딩 스텝
export const WORK_ONBOARDING_STEPS = [
  { key: 'workType',       askKey: 'helperWorkAskWorkType', parser: parseWorkType },
  { key: 'workHours',      askKey: 'helperWorkAskHours',    parser: parseWorkHours },
  { key: 'focusPeak',      askKey: 'helperWorkAskFocus',    parser: parseFocusPeak },
  { key: 'worksWeekends',  askKey: 'helperWorkAskWeekend',  parser: parsePetIndoor },
]

// GPT 시스템 프롬프트 규칙 (generateWorkSchedule용)
export const WORK_PROMPT_RULES = [
  '1. 타임블록킹 원칙 적용: 같은 종류의 작업을 묶어 컨텍스트 스위칭 최소화',
  '2. 딥워크(집중 업무)는 사용자의 최고 집중 시간대에 우선 배치',
  '3. 딥워크 블록은 최소 60분, 최대 120분 단위로 설계',
  '4. 딥워크 블록 사이에 반드시 15분 이상 휴식(break) 삽입',
  '5. "회의"나 "미팅" 키워드가 태스크에 있으면 meeting 카테고리로 배치, 전후 10분 버퍼 확보',
  '6. 회의 직후에는 후속 정리(admin) 15분 배치',
  '7. 마감/급한/긴급 키워드가 있으면 deadline 카테고리로, 가장 집중 시간대에 배치',
  '8. 업무 시작 직후 "이메일/메신저 확인" (30분, admin) 배치 — 하루 1회만, 업무 시작 시 바로',
  '9. 하루 끝에 "하루 마무리 + 내일 계획" (30분, admin) 배치',
  '10. 근무 시간 내 모든 시간이 채워지도록 배분 (공백 없이)',
  '11. 점심 식사는 포함하지 않음 — 사용자가 직접 관리',
  '12. **절대 시간 겹침 금지**: 모든 이벤트의 시간이 겹치지 않도록 하세요',
  '13. 모든 제목은 한국어로 작성',
  '14. duration은 분 단위',
  '15. category는 반드시 다음 중 하나: deepwork, meeting, admin, planning, communication, break, commute, deadline',
]

// GPT 카테고리 매핑 규칙
export const WORK_CATEGORY_MAPPING = `
사용자가 입력한 태스크에서 각 업무를 파악하고 적절한 category를 배정해:
- 보고서/작성/개발/코딩/디자인 등 집중 업무 → deepwork
- 회의/미팅/콜 → meeting
- 이메일/정리/보고서 정리 → admin
- 기획/브레인스토밍/전략 → planning
- 1:1/소통/피드백 → communication
- 점심/커피/산책 → break
- 출퇴근 → commute (사무직일 때만)
- 마감 임박/긴급 → deadline

태스크가 큰 경우(2시간 이상 예상) → "블록 1", "블록 2"로 분할하여 집중 시간대에 분산 배치
태스크에 예상 시간이 명시되면 그대로 사용, 아니면 적절히 추정`

// GPT 응답 형식 템플릿
export const WORK_RESPONSE_FORMAT = `응답 형식 (JSON만 반환):
{
  "action": "work_batch",
  "events": [
    { "title": "하루 계획 정리", "time": "09:00", "duration": 15, "category": "admin" },
    { "title": "보고서 작성 — 딥워크 블록 1", "time": "09:15", "duration": 90, "category": "deepwork" }
  ]
}`
