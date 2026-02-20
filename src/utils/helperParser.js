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
  const routineVariants = /루틴/

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
 * 펫 케어 도우미 트리거 감지
 * @param {string} text
 * @returns {boolean}
 */
export function isPetCareHelperTrigger(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim().toLowerCase()

  // 기존 일정 관리 키워드가 포함되면 도우미 트리거 아님
  const actionKeywords = /삭제|취소|지워|지우|옮겨|옮기|이동|변경|바꿔|바꾸|수정|업데이트|빼줘|없애/
  if (actionKeywords.test(t)) return false

  // 펫 관련 키워드 통합 (펫,팻,반려견,반려묘,반려동물,애완동물,강아지,고양이 등)
  const petWords = '펫|팻|반려견|반려묘|반려동물|애완동물|애완|강아지|멍뭉이|고양이|고냥이|냥이'
  const petPattern = new RegExp(`(?:${petWords})`)

  const patterns = [
    new RegExp(`(?:${petWords})\\s*케어`),
    new RegExp(`(?:${petWords})\\s*스[케캐][줄쥴]`),
    new RegExp(`(?:${petWords})\\s*(?:일정|돌봄|관리)`),
    new RegExp(`(?:${petWords})\\s*도우미`),
    new RegExp(`(?:${petWords})\\s*밥\\s*시간`),
    new RegExp(`(?:우리\\s*집|우리)\\s*(?:${petWords})\\s*일정`),
    /pet\s*care/i,
    /pet\s*schedule/i,
  ]

  if (patterns.some(p => p.test(t))) return true
  return false
}

/**
 * 반려동물 종류 파싱 (강아지/고양이)
 * @param {string} text
 * @returns {string|null} 'dog' | 'cat' | null
 */
export function parsePetType(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/강아지|반려견|멍뭉이|개|dog|puppy|🐶|1/.test(t)) return 'dog'
  if (/고양이|반려묘|고냥이|냥이|cat|kitty|🐱|2/.test(t)) return 'cat'
  return null
}

/**
 * 반려동물 이름 파싱 (비어있지 않은 문자열)
 * @param {string} text
 * @returns {string|null}
 */
export function parsePetName(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()
  if (t.length === 0 || t.length > 20) return null
  return t
}

/**
 * 반려동물 나이(개월) 파싱
 * @param {string} text
 * @returns {number|null}
 */
export function parsePetAge(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // "X살" → 년 → 개월 변환
  const yearMatch = t.match(/(\d+)\s*(?:살|세|년|year)/i)
  if (yearMatch) return parseInt(yearMatch[1]) * 12

  // "X개월"
  const monthMatch = t.match(/(\d+)\s*(?:개월|month)/i)
  if (monthMatch) return parseInt(monthMatch[1])

  // 숫자만
  const numMatch = t.match(/^(\d+)$/)
  if (numMatch) {
    const n = parseInt(numMatch[1])
    if (n >= 1 && n <= 360) return n
  }

  return null
}

/**
 * 반려동물 크기 파싱 (강아지 전용)
 * @param {string} text
 * @returns {string|null} 'small' | 'medium' | 'large' | null
 */
export function parsePetSize(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/소형|작|small|1/.test(t)) return 'small'
  if (/중형|중간|medium|2/.test(t)) return 'medium'
  if (/대형|큰|크|large|big|3/.test(t)) return 'large'
  return null
}

/**
 * 실내 여부 파싱
 * @param {string} text
 * @returns {boolean|null}
 */
export function parsePetIndoor(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/^(네|예|응|맞|yes|y|1|실내|있어|있어요|있습니다)$/i.test(t)) return true
  if (/^(아니|아니오|아니요|아뇨|노|no|n|2|실외|없어|없어요|없습니다)$/i.test(t)) return false
  return null
}

/**
 * 업무 도우미 트리거 감지
 * @param {string} text
 * @returns {boolean}
 */
export function isWorkHelperTrigger(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim().toLowerCase()

  // 기존 일정 관리 키워드가 포함되면 도우미 트리거 아님
  const actionKeywords = /삭제|취소|지워|지우|옮겨|옮기|이동|변경|바꿔|바꾸|수정|업데이트|빼줘|없애/
  if (actionKeywords.test(t)) return false

  // 일상/펫 도우미와 구분: 일상/하루/펫 키워드가 있으면 업무 트리거 아님
  if (/일상|하루|펫|팻|강아지|고양이|반려/.test(t)) return false

  const patterns = [
    /업무\s*스[케캐][줄쥴]/,
    /업무\s*일정/,
    /업무\s*계획/,
    /업무\s*도우미/,
    /태스크\s*(?:관리|정리|블록)/,
    /타임\s*블록/,
    /work\s*schedule/i,
    /work\s*plan/i,
    /task\s*(?:block|plan)/i,
  ]

  const verbs = /(짜줘|짜|만들어줘|만들어|만들|생성|작성|세워|잡아|추천|도우미|helper|plan)/i

  if (patterns.some(p => p.test(t))) return true

  // 동사 + 업무 키워드 조합
  if (verbs.test(t) && /업무/.test(t) && /스[케캐][줄쥴]|일정|계획/.test(t)) return true

  return false
}

/**
 * 근무 형태 파싱
 * @param {string} text
 * @returns {string|null} 'office' | 'remote' | 'hybrid' | 'freelance' | null
 */
export function parseWorkType(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/사무직|사무실|office|출근|1/.test(t)) return 'office'
  if (/재택|remote|집|2/.test(t)) return 'remote'
  if (/하이브리드|hybrid|혼합|3/.test(t)) return 'hybrid'
  if (/프리랜서|freelance|자영|4/.test(t)) return 'freelance'
  return null
}

/**
 * 근무 시간 파싱 (출근~퇴근)
 * @param {string} text
 * @returns {object|null} { workStart, workEnd }
 */
export function parseWorkHours(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // "9시~18시", "9:00~18:00", "9시-18시", "9am-6pm"
  const rangeMatch = t.match(/(.+?)\s*[~\-부터]\s*(.+?)(?:까지)?$/)
  if (rangeMatch) {
    const start = parseTimeInput(rangeMatch[1].trim())
    const end = parseTimeInput(rangeMatch[2].trim())
    if (start && end) return { workStart: start, workEnd: end }
  }

  return null
}

/**
 * 집중 시간대 파싱
 * @param {string} text
 * @returns {string|null} 'morning' | 'afternoon' | 'none' | null
 */
export function parseFocusPeak(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/오전|아침|morning|1/.test(t)) return 'morning'
  if (/오후|afternoon|2/.test(t)) return 'afternoon'
  if (/없|무관|차이\s*없|둘\s*다|none|both|3/.test(t)) return 'none'
  return null
}

/**
 * 업무 태스크 자유 입력 파싱 (콤마/줄바꿈 구분)
 * @param {string} text
 * @returns {string|null} 원본 텍스트 (GPT에 전달)
 */
export function parseWorkTasks(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()
  if (t.length === 0) return null
  if (/^(없음|없어|no|none)$/i.test(t)) return null
  return t
}

/**
 * 육아 도우미 트리거 감지
 * @param {string} text
 * @returns {boolean}
 */
export function isChildcareHelperTrigger(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim().toLowerCase()

  // 기존 일정 관리 키워드가 포함되면 도우미 트리거 아님
  const actionKeywords = /삭제|취소|지워|지우|옮겨|옮기|이동|변경|바꿔|바꾸|수정|업데이트|빼줘|없애/
  if (actionKeywords.test(t)) return false

  // 다른 도우미 키워드 제외
  if (/일상|하루|펫|팻|강아지|고양이|반려|업무|태스크/.test(t)) return false

  const childcareWords = '육아|아기|아이|신생아|영아|유아|돌봄|수유|이유식|기저귀|낮잠'
  const childcarePattern = new RegExp(`(?:${childcareWords})`)

  const patterns = [
    new RegExp(`(?:${childcareWords})\\s*스[케캐][줄쥴]`),
    new RegExp(`(?:${childcareWords})\\s*(?:일정|루틴|관리)`),
    new RegExp(`(?:${childcareWords})\\s*도우미`),
    /childcare\s*schedule/i,
    /baby\s*schedule/i,
    /baby\s*routine/i,
  ]

  if (patterns.some(p => p.test(t))) return true

  // 동사 + 키워드 조합
  const verbs = /(짜줘|짜|만들어줘|만들어|만들|생성|작성|세워|잡아|추천|도우미|helper|plan)/i
  if (verbs.test(t) && childcarePattern.test(t)) return true

  return false
}

/**
 * 아이 이름 파싱
 * @param {string} text
 * @returns {string|null}
 */
export function parseChildName(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()
  if (t.length === 0 || t.length > 20) return null
  return t
}

/**
 * 아이 생년월일 파싱
 * 지원: "2024-03-15", "2024.3.15", "2024년 3월 15일", "8개월"
 * @param {string} text
 * @returns {string|null} "YYYY-MM-DD" 형식
 */
export function parseChildBirthdate(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim()

  // YYYY-MM-DD, YYYY.M.D, YYYY/M/D
  const fullMatch = t.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/)
  if (fullMatch) {
    const y = parseInt(fullMatch[1])
    const m = parseInt(fullMatch[2])
    const d = parseInt(fullMatch[3])
    if (y >= 2020 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  // YYYY년 M월 D일
  const koMatch = t.match(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/)
  if (koMatch) {
    const y = parseInt(koMatch[1])
    const m = parseInt(koMatch[2])
    const d = parseInt(koMatch[3])
    if (y >= 2020 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  // X개월 (월령 → 역산하여 대략적 생년월일)
  const monthMatch = t.match(/(\d+)\s*(?:개월|month)/i)
  if (monthMatch) {
    const months = parseInt(monthMatch[1])
    if (months >= 0 && months <= 36) {
      const now = new Date()
      now.setMonth(now.getMonth() - months)
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
  }

  return null
}

/**
 * 아이 성별 파싱
 * @param {string} text
 * @returns {string|null} 'boy' | 'girl' | null
 */
export function parseChildGender(text) {
  if (!text || typeof text !== 'string') return null
  const t = text.trim().toLowerCase()

  if (/남|남아|아들|boy|male|1/.test(t)) return 'boy'
  if (/여|여아|딸|girl|female|2/.test(t)) return 'girl'
  return null
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

/**
 * 프로필 수정 트리거 감지
 * @param {string} text
 * @returns {'daily'|'petcare'|false}
 */
export function isProfileEditTrigger(text) {
  if (!text || typeof text !== 'string') return false
  const t = text.trim().toLowerCase()

  const editKeywords = /수정|변경|바꾸|바꿔|편집|업데이트|재설정|다시\s*설정|edit|update|change/
  const profileKeywords = /프로필|설정|정보|profile|setting/

  if (!editKeywords.test(t) || !profileKeywords.test(t)) return false

  if (/펫|팻|반려견|반려묘|반려동물|애완동물|애완|강아지|멍뭉이|고양이|고냥이|냥이|pet/.test(t)) return 'petcare'
  if (/업무|work|태스크|task/.test(t)) return 'work'
  if (/육아|아기|아이|신생아|영아|유아|수유|이유식|childcare|baby/.test(t)) return 'childcare'
  if (/일상|일정|하루|daily|routine/.test(t)) return 'daily'

  // 키워드 없으면 현재 맥락에 따라 판단하기 위해 'any' 반환
  return 'any'
}
