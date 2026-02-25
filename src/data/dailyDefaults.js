/**
 * dailyDefaults.js - 일상 카테고리(H01) 스타일, 온보딩 스텝, GPT 프롬프트 규칙
 */

import {
  parseTimeInput, parseMealsInput, parseCommuteInput, parseRoutinesInput,
} from '../utils/categoryParser'

// 일상 카테고리별 뱃지 스타일 (BatchConfirmCard + DailyScheduleView 공통)
export const DAILY_CATEGORY_STYLES = {
  routine:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  meal:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  commute:  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  leisure:  'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
  personal: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  health:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  general:  'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
  '펫 케어': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300',
}

// 일상 카테고리 온보딩 스텝
export const DAILY_ONBOARDING_STEPS = [
  { key: 'wakeUp',   askKey: 'helperAskWakeUp',   parser: parseTimeInput },
  { key: 'bedTime',  askKey: 'helperAskBedTime',   parser: parseTimeInput },
  { key: 'meals',    askKey: 'helperAskMeals',     parser: parseMealsInput },
  { key: 'commute',  askKey: 'helperAskCommute',   parser: parseCommuteInput },
  { key: 'routines', askKey: 'helperAskRoutines',  parser: parseRoutinesInput },
]

// GPT 시스템 프롬프트 규칙 (generateDailySchedule용)
export const DAILY_PROMPT_RULES = [
  '1. 별도의 "기상"/"취침" 이벤트 대신, 마지막에 "수면" 이벤트 1개를 포함하세요. 시작 시간=취침 시간, duration=취침~기상까지 분(예: 23:00~08:00이면 540분)',
  '2. 반드시 아침 식사, 점심 식사, 저녁 식사 3끼를 포함하세요 (사용자가 불규칙이라고 하지 않는 한)',
  '3. 실제 활동만 이벤트로 생성 (자유 시간, 여가 시간, 휴식 등 빈 시간은 이벤트로 만들지 않음)',
  '4. 식사 시간 최소 30분 확보',
  '5. 출퇴근이 있으면: 출근 준비(30분) + 출근 + 업무 시간 + 퇴근 포함',
  '6. 루틴 배치 규칙:\n   - 운동 → 출근 전 또는 퇴근 후\n   - 독서 → 저녁/취침 전\n   - 명상 → 기상 직후 또는 취침 전\n   - 기타 루틴 → 빈 시간에 자연스럽게 배치',
  '7. 활동 사이 10~15분 버퍼 (이동/준비 시간, 이벤트로 만들지 않음)',
  '8. "자유 시간", "여가", "휴식" 같은 빈 시간은 절대 이벤트로 만들지 마세요',
  '9. category는 반드시 다음 중 하나: routine, meal, commute, personal, health',
  '10. personal 카테고리는 하루 1개만, 같은 루틴도 1회만 배치',
  '11. 모든 제목은 한국어로 작성',
  '12. duration은 분 단위',
  '13. **절대 시간 겹침 금지**: 모든 이벤트는 이전 이벤트의 종료 시간(시작시간+duration) 이후에 시작해야 합니다. 예를 들어 운동이 08:00~09:00이면 아침 식사는 09:10 이후에 배치하세요. 이벤트를 시간순으로 정렬하고 겹치지 않는지 반드시 확인하세요.',
]

// GPT 응답 형식 템플릿
export const DAILY_RESPONSE_FORMAT = `응답 형식 (JSON만 반환):
{
  "action": "create_batch",
  "events": [
    { "title": "수면", "time": "23:00", "duration": 540, "category": "routine" }
  ]
}`
