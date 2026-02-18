/**
 * helperParser.js - 일상 도우미 온보딩 답변 파싱 유틸리티
 * GPT 호출 없이 로컬에서 파싱 (API 비용 절감 + 즉각 응답)
 */

/**
 * 시간 텍스트를 "HH:MM" 형식으로 파싱
 * 지원: "7시", "오전 7시", "오후 3시 30분", "새벽 2시", "7am", "23:00", "7"
 * @param {string} text
 * @returns {string|null} "HH:MM" or null
 */
export function parseTimeInput(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // "HH:MM" 형식
  const colonMatch = t.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    const h = parseInt(colonMatch[1])
    const m = parseInt(colonMatch[2])
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    return null
  }

  // 영어: "7am", "11pm", "7:30am"
  const enMatch = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (enMatch) {
    let h = parseInt(enMatch[1])
    const m = parseInt(enMatch[2] || '0')
    const period = enMatch[3].toLowerCase()
    if (period === 'pm' && h < 12) h += 12
    if (period === 'am' && h === 12) h = 0
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    return null
  }

  // 한국어: "오전/오후/새벽/밤/아침/저녁 X시 Y분"
  const koMatch = t.match(/^(오전|오후|새벽|밤|아침|저녁)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분)?$/)
  if (koMatch) {
    let h = parseInt(koMatch[2])
    const m = parseInt(koMatch[3] || '0')
    const prefix = koMatch[1]

    if (prefix === '오후' || prefix === '저녁' || prefix === '밤') {
      if (h < 12) h += 12
    } else if (prefix === '새벽') {
      // 새벽은 그대로 AM (1~5시)
    } else if (prefix === '오전' || prefix === '아침') {
      if (h === 12) h = 0
    }

    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    return null
  }

  // 숫자만: "7" → "07:00"
  const numMatch = t.match(/^(\d{1,2})$/)
  if (numMatch) {
    const h = parseInt(numMatch[1])
    if (h >= 0 && h <= 23) {
      return `${String(h).padStart(2, '0')}:00`
    }
  }

  return null
}

/**
 * 식사 시간 파싱
 * 입력 예: "아침 7:30, 점심 12시, 저녁 7시" 또는 "불규칙"
 * @param {string} text
 * @returns {object|null} { breakfast, lunch, dinner, regular }
 */
export function parseMealsInput(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // 불규칙 체크
  if (/불규칙|irregular/i.test(t)) {
    return { breakfast: null, lunch: null, dinner: null, regular: false }
  }

  // "없음" / "none"
  if (/^(없음|none|no)$/i.test(t)) {
    return { breakfast: null, lunch: null, dinner: null, regular: false }
  }

  const result = { breakfast: null, lunch: null, dinner: null, regular: true }

  // 아침/breakfast 패턴 - "아침 오전 7시 30분", "아침 7:30", "아침 7시" 등
  const breakfastMatch = t.match(/(?:아침|breakfast)\s*[:=]?\s*((?:오전|오후|새벽|밤|아침|저녁)?\s*\d{1,2}(?::\d{2}|\s*시(?:\s*\d{1,2}\s*분)?|(?:am|pm)))/i)
  if (breakfastMatch) {
    result.breakfast = parseTimeInput(breakfastMatch[1].trim())
  }

  // 점심/lunch 패턴
  const lunchMatch = t.match(/(?:점심|lunch)\s*[:=]?\s*((?:오전|오후|새벽|밤|아침|저녁)?\s*\d{1,2}(?::\d{2}|\s*시(?:\s*\d{1,2}\s*분)?|(?:am|pm)))/i)
  if (lunchMatch) {
    result.lunch = parseTimeInput(lunchMatch[1].trim())
  }

  // 저녁/dinner 패턴
  const dinnerMatch = t.match(/(?:저녁|dinner)\s*[:=]?\s*((?:오전|오후|새벽|밤|아침|저녁)?\s*\d{1,2}(?::\d{2}|\s*시(?:\s*\d{1,2}\s*분)?|(?:am|pm)))/i)
  if (dinnerMatch) {
    result.dinner = parseTimeInput(dinnerMatch[1].trim())
  }

  // 콤마 구분 3개 시간 (라벨 없이): "7:30, 12:00, 19:00"
  if (!result.breakfast && !result.lunch && !result.dinner) {
    const times = t.split(/[,\s]+/).map(s => parseTimeInput(s.trim())).filter(Boolean)
    if (times.length >= 3) {
      result.breakfast = times[0]
      result.lunch = times[1]
      result.dinner = times[2]
    } else if (times.length > 0) {
      // 일부만 파싱 가능하면 실패
      return null
    } else {
      return null
    }
  }

  // 식사 시간대 보정: 라벨(아침/점심/저녁)이 parseTimeInput에 전달되지 않아
  // "저녁 6시"가 06:00(AM)으로 파싱되는 문제 수정
  if (result.dinner) {
    const [h, m] = result.dinner.split(':').map(Number)
    if (h > 0 && h < 12) {
      result.dinner = `${String(h + 12).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }
  if (result.lunch) {
    const [h, m] = result.lunch.split(':').map(Number)
    if (h > 0 && h < 10) {
      result.lunch = `${String(h + 12).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }

  return result
}

/**
 * 출퇴근 시간 파싱
 * 입력 예: "9시~18시", "없음"
 * @param {string} text
 * @returns {object|null} { hasCommute, startTime?, endTime? }
 */
export function parseCommuteInput(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // 없음 체크
  if (/^(없음|없어|no|none)$/i.test(t)) {
    return { hasCommute: false }
  }

  // "9시~18시", "9:00~18:00", "9시-18시", "9am-6pm"
  const rangeMatch = t.match(/(.+?)\s*[~\-부터]\s*(.+?)(?:까지)?$/)
  if (rangeMatch) {
    const startTime = parseTimeInput(rangeMatch[1].trim())
    const endTime = parseTimeInput(rangeMatch[2].trim())
    if (startTime && endTime) {
      return { hasCommute: true, startTime, endTime }
    }
  }

  return null
}

/**
 * 루틴 목록 파싱
 * 입력 예: "운동, 독서, 명상" 또는 "없음"
 * @param {string} text
 * @returns {string[]|null}
 */
export function parseRoutinesInput(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // 없음 체크
  if (/^(없음|없어|no|none)$/i.test(t)) {
    return []
  }

  const items = t.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean)
  if (items.length === 0) return null

  return items
}

/**
 * 일상 도우미 트리거 감지
 * @param {string} text
 * @returns {boolean}
 */
export function isDailyHelperTrigger(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim().toLowerCase()

  // 기존 일정 관리 키워드가 포함되면 도우미 트리거 아님
  const actionKeywords = /삭제|취소|지워|지우|옮겨|옮기|이동|변경|바꿔|바꾸|수정|업데이트|빼줘|없애/
  if (actionKeywords.test(t)) return false

  // 스케줄 오타 변형: 스캐줄, 스케쥴 등 (케/캐 필수)
  const scheduleVariants = /스[케캐][줄쥴]/
  const routineVariants = /루틴|일정/

  const patterns = [
    /일상\s*스[케캐][줄쥴]/,
    /일상\s*일정/,
    /하루\s*일정/,
    /하루\s*스[케캐][줄쥴]/,
    /하루\s*루틴/,
    /일상\s*루틴/,
    /스[케캐][줄쥴]\s*도우미/,
    /daily\s*schedule/i,
    /daily\s*routine/i,
    /daily\s*plan/i,
  ]

  // "줘"는 너무 광범위하므로 생성 관련 동사만 사용
  const verbs = /(짜줘|짜|만들어줘|만들어|만들|생성|작성|세워|잡아|추천|도우미|helper|plan)/i

  // 정확한 패턴 매칭
  if (patterns.some(p => p.test(t))) return true

  // 동사 + 키워드 조합 (오타 포함)
  if (verbs.test(t) && (scheduleVariants.test(t) || routineVariants.test(t) || /schedule|routine/i.test(t))) {
    return true
  }

  // "일상" + 동사 + 스케줄 오타 변형
  if (/일상|하루/.test(t) && verbs.test(t) && scheduleVariants.test(t)) {
    return true
  }

  return false
}

/**
 * 도우미 취소 감지
 * @param {string} text
 * @returns {boolean}
 */
export function isHelperCancel(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim()
  return /^(취소|그만|cancel|stop|quit)$/i.test(t)
}
