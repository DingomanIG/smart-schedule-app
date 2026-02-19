/**
 * lunarConverter.js - 음력→양력 변환 유틸리티
 * korean-lunar-calendar 라이브러리 사용
 */
import KoreanLunarCalendar from 'korean-lunar-calendar'

const calendar = new KoreanLunarCalendar()

/**
 * 음력 날짜를 양력 날짜로 변환
 * @param {number} year - 양력 연도 (해당 연도의 음력 날짜를 양력으로 변환)
 * @param {number} month - 음력 월 (1-12)
 * @param {number} day - 음력 일 (1-30)
 * @returns {string|null} "YYYY-MM-DD" 또는 변환 실패 시 null
 */
export function lunarToSolar(year, month, day) {
  try {
    calendar.setLunarDate(year, month, day, false)
    const sol = calendar.getSolarCalendar()
    const mm = String(sol.month).padStart(2, '0')
    const dd = String(sol.day).padStart(2, '0')
    return `${sol.year}-${mm}-${dd}`
  } catch {
    return null
  }
}
