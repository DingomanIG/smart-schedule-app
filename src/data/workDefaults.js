/**
 * workDefaults.js - 업무 도우미(H04) 카테고리 스타일 및 기본값 데이터
 */

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
