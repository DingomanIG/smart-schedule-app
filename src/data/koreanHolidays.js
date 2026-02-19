/**
 * koreanHolidays.js - 대한민국 공휴일 데이터 + 대체공휴일 + 연휴 분석
 *
 * 고정 공휴일 + 음력 변동 공휴일 (2024~2028 하드코딩)
 * 대체공휴일 자동 계산
 * 징검다리 연휴 / 연차 효율 분석
 */

// 음력 변동 공휴일 (연도별 양력 날짜 하드코딩)
const LUNAR_HOLIDAYS = {
  2024: {
    seollal: ['2024-02-09', '2024-02-10', '2024-02-11'], // 설날 연휴
    buddha: '2024-05-15',
    chuseok: ['2024-09-16', '2024-09-17', '2024-09-18'],
  },
  2025: {
    seollal: ['2025-01-28', '2025-01-29', '2025-01-30'],
    buddha: '2025-05-05',
    chuseok: ['2025-10-05', '2025-10-06', '2025-10-07'],
  },
  2026: {
    seollal: ['2026-02-16', '2026-02-17', '2026-02-18'],
    buddha: '2026-05-24',
    chuseok: ['2026-09-24', '2026-09-25', '2026-09-26'],
  },
  2027: {
    seollal: ['2027-02-05', '2027-02-06', '2027-02-07'],
    buddha: '2027-05-13',
    chuseok: ['2027-09-14', '2027-09-15', '2027-09-16'],
  },
  2028: {
    seollal: ['2028-01-25', '2028-01-26', '2028-01-27'],
    buddha: '2028-05-02',
    chuseok: ['2028-10-02', '2028-10-03', '2028-10-04'],
  },
}

// 고정 공휴일 (월-일, 0-indexed month)
const FIXED_HOLIDAYS = [
  { month: 0, day: 1, name: '신정', nameEn: "New Year's Day" },
  { month: 2, day: 1, name: '삼일절', nameEn: 'Independence Movement Day' },
  { month: 4, day: 5, name: '어린이날', nameEn: "Children's Day" },
  { month: 5, day: 6, name: '현충일', nameEn: 'Memorial Day' },
  { month: 7, day: 15, name: '광복절', nameEn: 'Liberation Day' },
  { month: 9, day: 3, name: '개천절', nameEn: 'National Foundation Day' },
  { month: 9, day: 9, name: '한글날', nameEn: 'Hangul Day' },
  { month: 11, day: 25, name: '크리스마스', nameEn: 'Christmas' },
]

// 대체공휴일 적용 대상 (2021년 법 개정 기준)
// 설날·추석: 일요일 겹치면 다음 평일
// 어린이날·광복절·개천절·한글날: 토/일 겹치면 다음 월요일
// 부처님 오신 날·크리스마스: 토/일 겹치면 다음 월요일 (2023년~)
const SUBSTITUTE_ELIGIBLE_FIXED = ['어린이날', '광복절', '개천절', '한글날', '크리스마스']

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDayOfWeek(date) {
  return date.getDay() // 0=일, 6=토
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/**
 * 다음 평일 찾기 (이미 공휴일인 날짜 set 고려)
 */
function findNextWeekday(date, holidaySet) {
  let d = addDays(date, 1)
  while (getDayOfWeek(d) === 0 || getDayOfWeek(d) === 6 || holidaySet.has(formatDate(d))) {
    d = addDays(d, 1)
  }
  return d
}

/**
 * 해당 연도의 모든 공휴일 반환
 * @param {number} year
 * @returns {Array<{date: string, name: string, nameEn: string, type: string, isSubstitute?: boolean}>}
 */
export function getHolidaysForYear(year) {
  const holidays = []
  const dateSet = new Set()

  // 1. 고정 공휴일
  FIXED_HOLIDAYS.forEach(({ month, day, name, nameEn }) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    holidays.push({ date: dateStr, name, nameEn, type: 'fixed' })
    dateSet.add(dateStr)
  })

  // 2. 음력 변동 공휴일
  const lunar = LUNAR_HOLIDAYS[year]
  if (lunar) {
    // 설날 연휴 (3일)
    lunar.seollal.forEach((dateStr, i) => {
      const names = ['설날 연휴', '설날', '설날 연휴']
      const namesEn = ['Lunar New Year Eve', 'Lunar New Year', 'Lunar New Year Holiday']
      holidays.push({ date: dateStr, name: names[i], nameEn: namesEn[i], type: 'lunar' })
      dateSet.add(dateStr)
    })

    // 부처님 오신 날
    holidays.push({
      date: lunar.buddha,
      name: '부처님 오신 날',
      nameEn: "Buddha's Birthday",
      type: 'lunar',
    })
    dateSet.add(lunar.buddha)

    // 추석 연휴 (3일)
    lunar.chuseok.forEach((dateStr, i) => {
      const names = ['추석 연휴', '추석', '추석 연휴']
      const namesEn = ['Chuseok Eve', 'Chuseok', 'Chuseok Holiday']
      holidays.push({ date: dateStr, name: names[i], nameEn: namesEn[i], type: 'lunar' })
      dateSet.add(dateStr)
    })
  }

  // 3. 대체공휴일 계산
  const substitutes = []

  // 설날·추석: 연휴 중 일요일과 겹치면 연휴 다음 첫 평일
  if (lunar) {
    ;[lunar.seollal, lunar.chuseok].forEach((dates) => {
      const hasOverlap = dates.some((ds) => getDayOfWeek(parseDate(ds)) === 0)
      if (hasOverlap) {
        const lastDay = parseDate(dates[dates.length - 1])
        const sub = findNextWeekday(lastDay, dateSet)
        const subStr = formatDate(sub)
        if (!dateSet.has(subStr)) {
          substitutes.push({
            date: subStr,
            name: '대체공휴일',
            nameEn: 'Substitute Holiday',
            type: 'substitute',
            isSubstitute: true,
          })
          dateSet.add(subStr)
        }
      }
    })
  }

  // 고정 공휴일 대체공휴일
  FIXED_HOLIDAYS.forEach(({ month, day, name }) => {
    if (!SUBSTITUTE_ELIGIBLE_FIXED.includes(name)) return
    if (name === '크리스마스' && year < 2023) return

    const date = new Date(year, month, day)
    const dow = getDayOfWeek(date)
    if (dow === 0 || dow === 6) {
      const sub = findNextWeekday(date, dateSet)
      const subStr = formatDate(sub)
      if (!dateSet.has(subStr)) {
        substitutes.push({
          date: subStr,
          name: `대체공휴일 (${name})`,
          nameEn: `Substitute Holiday (${name === '어린이날' ? "Children's Day" : name === '광복절' ? 'Liberation Day' : name === '개천절' ? 'National Foundation Day' : name === '한글날' ? 'Hangul Day' : 'Christmas'})`,
          type: 'substitute',
          isSubstitute: true,
        })
        dateSet.add(subStr)
      }
    }
  })

  // 부처님 오신 날 대체공휴일 (2023년~)
  if (lunar && year >= 2023) {
    const buddhaDate = parseDate(lunar.buddha)
    const dow = getDayOfWeek(buddhaDate)
    if (dow === 0 || dow === 6) {
      const sub = findNextWeekday(buddhaDate, dateSet)
      const subStr = formatDate(sub)
      if (!dateSet.has(subStr)) {
        substitutes.push({
          date: subStr,
          name: '대체공휴일 (부처님 오신 날)',
          nameEn: "Substitute Holiday (Buddha's Birthday)",
          type: 'substitute',
          isSubstitute: true,
        })
        dateSet.add(subStr)
      }
    }
  }

  holidays.push(...substitutes)

  // 날짜순 정렬
  holidays.sort((a, b) => a.date.localeCompare(b.date))

  return holidays
}

/**
 * 특정 날짜가 공휴일인지 확인
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Array} holidays - getHolidaysForYear 결과
 * @returns {object|null} 공휴일 정보 또는 null
 */
export function getHolidayInfo(dateStr, holidays) {
  return holidays.find((h) => h.date === dateStr) || null
}

/**
 * 특정 날짜의 공휴일 이름 반환 (캘린더 표시용)
 * @param {string} dateStr
 * @param {number} year
 * @param {string} lang - 'ko' | 'en'
 * @returns {string|null}
 */
export function getHolidayName(dateStr, year, lang = 'ko') {
  const holidays = getHolidaysForYear(year)
  const info = getHolidayInfo(dateStr, holidays)
  if (!info) return null
  return lang === 'en' ? info.nameEn : info.name
}

/**
 * 해당 월의 공휴일 날짜 Set 반환 (캘린더 빠른 조회용)
 * @param {number} year
 * @param {number} month - 1-indexed (1=1월)
 * @returns {Map<string, string>} dateStr → holiday name
 */
export function getMonthHolidayMap(year, month) {
  const holidays = getHolidaysForYear(year)
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const map = new Map()
  holidays.forEach((h) => {
    if (h.date.startsWith(prefix)) {
      map.set(h.date, h.name)
    }
  })
  return map
}

/**
 * 연휴 분석 - 황금연휴, 징검다리 연휴, 연차 추천
 * @param {number} year
 * @returns {Array<{type: string, title: string, titleEn: string, dates: string[], vacationDays: number, totalDays: number}>}
 */
export function analyzeVacationEfficiency(year) {
  const holidays = getHolidaysForYear(year)
  const holidaySet = new Set(holidays.map((h) => h.date))
  const results = []

  // 1년 전체를 스캔하며 연차 효율 분석
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  // 모든 공휴일 + 주말을 포함한 휴일 set
  const isOffDay = (dateStr) => {
    if (holidaySet.has(dateStr)) return true
    const d = parseDate(dateStr)
    const dow = d.getDay()
    return dow === 0 || dow === 6
  }

  // 연차 1~3일 사용 시 연휴 조합 찾기
  for (let vacDays = 1; vacDays <= 3; vacDays++) {
    const d = new Date(startDate)
    while (d <= endDate) {
      const dateStr = formatDate(d)

      // 평일이면서 공휴일이 아닌 날을 연차 후보로
      if (!isOffDay(dateStr)) {
        // 이 날부터 vacDays일 연차 사용 시뮬레이션
        const vacationDates = []
        let candidate = new Date(d)
        let count = 0
        while (count < vacDays && candidate.getFullYear() === year) {
          const cs = formatDate(candidate)
          if (!isOffDay(cs)) {
            vacationDates.push(cs)
            count++
          }
          candidate = addDays(candidate, 1)
        }

        if (vacationDates.length === vacDays) {
          // 연속 휴일 범위 계산
          const firstVac = parseDate(vacationDates[0])
          const lastVac = parseDate(vacationDates[vacationDates.length - 1])

          // 앞으로 확장 (주말/공휴일)
          let start = new Date(firstVac)
          while (true) {
            const prev = addDays(start, -1)
            if (isOffDay(formatDate(prev))) {
              start = prev
            } else break
          }

          // 뒤로 확장
          let end = new Date(lastVac)
          while (true) {
            const next = addDays(end, 1)
            if (isOffDay(formatDate(next))) {
              end = next
            } else break
          }

          const totalDays = Math.round((end - start) / 86400000) + 1

          // 연차 대비 총 연휴 3일 이상이면 추천
          if (totalDays >= vacDays + 2 && totalDays >= 3) {
            const startStr = formatDate(start)
            const endStr = formatDate(end)
            const startD = start
            const endD = end

            // 중복 방지 (같은 기간 이미 존재)
            const key = `${startStr}~${endStr}`
            if (!results.some((r) => `${r.startDate}~${r.endDate}` === key)) {
              const startLabel = `${startD.getMonth() + 1}/${startD.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][startD.getDay()]})`
              const endLabel = `${endD.getMonth() + 1}/${endD.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][endD.getDay()]})`
              const vacLabel = vacationDates.map((v) => {
                const vd = parseDate(v)
                return `${vd.getMonth() + 1}/${vd.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][vd.getDay()]})`
              }).join(', ')

              results.push({
                startDate: startStr,
                endDate: endStr,
                vacationDays: vacDays,
                totalDays,
                efficiency: totalDays / vacDays,
                title: `${vacLabel} 연차 ${vacDays}일 → ${startLabel}~${endLabel} ${totalDays}일 연휴`,
                titleEn: `${vacDays} day(s) off → ${totalDays}-day holiday (${startStr} ~ ${endStr})`,
                vacationDates,
              })
            }
          }
        }
      }

      d.setDate(d.getDate() + 1)
    }
  }

  // 효율 순 정렬 (효율 높은 순 → 총 일수 많은 순)
  results.sort((a, b) => b.efficiency - a.efficiency || b.totalDays - a.totalDays)

  // 상위 10개만
  return results.slice(0, 10)
}

/**
 * D-Day 계산
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {number} 남은 일수 (음수면 지남)
 */
export function getDDay(dateStr) {
  const target = parseDate(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

/**
 * 기념일 100일 단위 + 연 단위 자동 생성
 * @param {string} startDateStr - 시작일 'YYYY-MM-DD'
 * @param {number} maxYears - 최대 연 수 (기본 3)
 * @returns {Array<{date: string, label: string, labelEn: string, days: number}>}
 */
export function generateAnniversaryDates(startDateStr, maxYears = 3) {
  const start = parseDate(startDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const results = []

  // 100일 단위 (100, 200, 300, ...)
  for (let n = 100; n <= 1000; n += 100) {
    const d = addDays(start, n)
    if (d > addDays(today, 365 * maxYears)) break
    results.push({
      date: formatDate(d),
      label: `${n}일`,
      labelEn: `${n} days`,
      days: n,
    })
  }

  // 연 단위 (1주년, 2주년, ...)
  for (let y = 1; y <= maxYears; y++) {
    const d = new Date(start.getFullYear() + y, start.getMonth(), start.getDate())
    results.push({
      date: formatDate(d),
      label: `${y}주년`,
      labelEn: `${y} year${y > 1 ? 's' : ''}`,
      days: Math.round((d - start) / 86400000),
    })
  }

  // 날짜순 정렬
  results.sort((a, b) => a.date.localeCompare(b.date))

  return results
}
