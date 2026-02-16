const DAY_MAP = {
  '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base, days) {
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return result
}

function getMondayOfWeek(date) {
  const d = new Date(date)
  const jsDay = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay
  d.setDate(d.getDate() + mondayOffset)
  return d
}

/**
 * 한국어 상대 날짜 표현을 YYYY-MM-DD 문자열로 변환
 * @param {string} text - 사용자 입력 텍스트
 * @param {Date} [now] - 기준 날짜 (테스트용, 기본값: 현재)
 * @returns {string|null} 'YYYY-MM-DD' 또는 매칭 실패 시 null
 */
export function parseDateFromText(text, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 오늘/내일/모레/글피
  if (/오늘/.test(text)) return formatDate(today)
  if (/내일/.test(text)) return formatDate(addDays(today, 1))
  if (/모[레래]/.test(text)) return formatDate(addDays(today, 2))
  if (/글피/.test(text)) return formatDate(addDays(today, 3))

  // 다음주 X요일 / 다음 주 X요일 / 다음주 X욜 / 자모분리 오타
  const nextWeekMatch = text.match(/다음\s*주\s*(월|화|수|목|금|토|일)(?:요일|욜|[ㄱ-ㅎㅏ-ㅣ;.,·]+)/)
  if (nextWeekMatch) {
    const targetDay = DAY_MAP[nextWeekMatch[1]]
    if (targetDay !== undefined) {
      const monday = getMondayOfWeek(today)
      return formatDate(addDays(monday, 7 + targetDay))
    }
  }

  // 이번 주 X요일 / 이번주 X요일 / 이번주 X욜 / 자모분리 오타
  const thisWeekMatch = text.match(/이번\s*주?\s*(월|화|수|목|금|토|일)(?:요일|욜|[ㄱ-ㅎㅏ-ㅣ;.,·]+)/)
  if (thisWeekMatch) {
    const targetDay = DAY_MAP[thisWeekMatch[1]]
    if (targetDay !== undefined) {
      const monday = getMondayOfWeek(today)
      return formatDate(addDays(monday, targetDay))
    }
  }

  // 단독 X요일 / X욜 / 자모분리 오타 (접두사 없이) → 이번 주 기준, 지났으면 다음 주
  // "금ㅇ;ㄹ", "월ㅇ;ㄹ" 등 자모가 분리된 요일 오타도 매칭
  const standaloneDayMatch = text.match(/(월|화|수|목|금|토|일)(?:요일|욜|[ㄱ-ㅎㅏ-ㅣ;.,·]+)/)
  if (standaloneDayMatch) {
    const targetDay = DAY_MAP[standaloneDayMatch[1]]
    if (targetDay !== undefined) {
      const monday = getMondayOfWeek(today)
      const candidate = addDays(monday, targetDay)
      // 이미 지난 요일이면 다음 주로
      if (candidate < today) {
        return formatDate(addDays(candidate, 7))
      }
      return formatDate(candidate)
    }
  }

  // X월 Y일
  const absoluteMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/)
  if (absoluteMatch) {
    const month = parseInt(absoluteMatch[1], 10)
    const day = parseInt(absoluteMatch[2], 10)
    let year = today.getFullYear()
    const candidate = new Date(year, month - 1, day)
    // 유효하지 않은 날짜 체크
    if (candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
      return null
    }
    // 이미 지난 날짜면 다음해
    if (candidate < today) {
      year += 1
    }
    return formatDate(new Date(year, month - 1, day))
  }

  return null
}
