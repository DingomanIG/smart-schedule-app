/**
 * 테스트 유틸리티 — 외부 프레임워크 없이 자체 assertion + 결과 출력
 */

let passCount = 0
let failCount = 0
const results = []

/**
 * 값 비교 (strict equality)
 * @param {*} actual - 실제 값
 * @param {*} expected - 기대 값
 * @param {string} label - 테스트 설명
 */
export function assertEqual(actual, expected, label) {
  if (actual === expected) {
    passCount++
    results.push({ pass: true, label, actual, expected })
  } else {
    failCount++
    results.push({ pass: false, label, actual, expected })
  }
}

/**
 * 값이 특정 값을 포함하는지 확인 (string contains / array includes)
 * @param {*} actual - 실제 값
 * @param {*} pattern - 포함되어야 할 값
 * @param {string} label - 테스트 설명
 */
export function assertContains(actual, pattern, label) {
  const pass = typeof actual === 'string'
    ? actual.includes(pattern)
    : Array.isArray(actual) ? actual.includes(pattern) : false
  if (pass) {
    passCount++
    results.push({ pass: true, label, actual, expected: `contains "${pattern}"` })
  } else {
    failCount++
    results.push({ pass: false, label, actual, expected: `contains "${pattern}"` })
  }
}

/**
 * 값이 특정 값 목록 중 하나인지 확인
 * @param {*} actual - 실제 값
 * @param {Array} options - 허용되는 값 목록
 * @param {string} label - 테스트 설명
 */
export function assertOneOf(actual, options, label) {
  const pass = options.includes(actual)
  if (pass) {
    passCount++
    results.push({ pass: true, label, actual, expected: `one of [${options.join(', ')}]` })
  } else {
    failCount++
    results.push({ pass: false, label, actual, expected: `one of [${options.join(', ')}]` })
  }
}

/**
 * 값이 null이 아닌지 확인
 * @param {*} actual - 실제 값
 * @param {string} label - 테스트 설명
 */
export function assertNotNull(actual, label) {
  if (actual != null) {
    passCount++
    results.push({ pass: true, label, actual, expected: 'not null' })
  } else {
    failCount++
    results.push({ pass: false, label, actual, expected: 'not null' })
  }
}

/**
 * 결과 출력 (각 테스트)
 */
export function printResults() {
  for (const r of results) {
    if (r.pass) {
      console.log(`  \x1b[32m✅ ${r.label}\x1b[0m → ${JSON.stringify(r.actual)}`)
    } else {
      console.log(`  \x1b[31m❌ ${r.label}\x1b[0m`)
      console.log(`     실제: ${JSON.stringify(r.actual)}`)
      console.log(`     예상: ${JSON.stringify(r.expected)}`)
    }
  }
}

/**
 * 최종 요약 출력
 * @returns {{ pass: number, fail: number }}
 */
export function printSummary() {
  console.log('---')
  const total = passCount + failCount
  if (failCount === 0) {
    console.log(`\x1b[32m통과: ${passCount}/${total}\x1b[0m`)
  } else {
    console.log(`통과: ${passCount}/${total}, \x1b[31m실패: ${failCount}/${total}\x1b[0m`)
  }
  return { pass: passCount, fail: failCount }
}

/**
 * 카운터 초기화 (테스트 파일 간 분리)
 */
export function resetCounters() {
  passCount = 0
  failCount = 0
  results.length = 0
}
