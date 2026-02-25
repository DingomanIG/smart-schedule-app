// 이벤트 소스 분류 유틸리티
// CalendarView 필터 및 WeekView 색상 매핑에서 공유 사용

const WORK_CATS = ['deepwork', 'meeting', 'admin', 'planning', 'communication', 'break', 'deadline']
const CHILDCARE_CATS = ['feeding', 'sleep', 'play', 'bath', 'diaper', 'outing', 'hospital', 'development']

/**
 * 이벤트의 소스(카테고리 타입)를 판별한다.
 * categoryId 우선, category 폴백.
 * @returns {'chat' | 'daily' | 'petcare' | 'work' | 'childcare'}
 */
export function getEventSource(evt) {
  if (evt.createdVia !== 'category') return 'chat'

  // categoryId 기반 (우선)
  if (evt.categoryId === 'H04') return 'work'
  if (evt.categoryId === 'H06') return 'childcare'
  if (evt.categoryId === 'H01') return 'daily'
  if (evt.categoryId === 'H11') return 'petcare'

  // category 기반 폴백
  if (evt.category === '펫 케어') return 'petcare'
  if (WORK_CATS.includes(evt.category)) return 'work'
  if (evt.category === '육아' || CHILDCARE_CATS.includes(evt.category)) return 'childcare'

  return 'daily'
}
