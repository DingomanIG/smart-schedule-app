/**
 * dateParser.js 순수 함수 테스트
 * API 호출 불필요 — 즉시 실행, 무료
 *
 * 기준 날짜: 2026-02-20 (금요일)
 * getMondayOfWeek(2026-02-20) → 2026-02-16 (월요일)
 */
import { parseDateFromText } from '../src/utils/dateParser.js'
import {
  assertEqual,
  printResults,
  printSummary,
  resetCounters,
} from './helpers.js'

// 고정 기준 날짜: 2026-02-20 금요일
const NOW = new Date(2026, 1, 20) // month is 0-indexed

export function runDateParserTests() {
  resetCounters()
  console.log('\n\x1b[36m=== dateParser 테스트 ===\x1b[0m\n')

  // ── 상대 날짜 ──────────────────────────────
  assertEqual(
    parseDateFromText('오늘 3시 회의', NOW),
    '2026-02-20',
    '"오늘" → 2026-02-20'
  )
  assertEqual(
    parseDateFromText('내일 치과', NOW),
    '2026-02-21',
    '"내일" → 2026-02-21'
  )
  assertEqual(
    parseDateFromText('모레 점심 약속', NOW),
    '2026-02-22',
    '"모레" → 2026-02-22'
  )
  assertEqual(
    parseDateFromText('모래 2시 미팅', NOW),
    '2026-02-22',
    '"모래" (오타) → 2026-02-22'
  )
  assertEqual(
    parseDateFromText('글피 저녁 약속', NOW),
    '2026-02-23',
    '"글피" → 2026-02-23'
  )
  assertEqual(
    parseDateFromText('내일모레 출장', NOW),
    '2026-02-22',
    '"내일모레" → 2026-02-22 (오늘+2)'
  )
  assertEqual(
    parseDateFromText('내일 모레 영화', NOW),
    '2026-02-22',
    '"내일 모레" (공백) → 2026-02-22'
  )
  assertEqual(
    parseDateFromText('내일 모래 여행', NOW),
    '2026-02-22',
    '"내일 모래" (오타+공백) → 2026-02-22'
  )

  // ── 요일 기반 (단독) ──────────────────────────
  // 기준: 금요일(2/20), 이번 주 월=2/16
  // 지난 요일 → 다음 주
  assertEqual(
    parseDateFromText('월요일 회의', NOW),
    '2026-02-23',
    '"월요일" → 다음주 2/23 (이미 지남)'
  )
  assertEqual(
    parseDateFromText('화요일 미팅', NOW),
    '2026-02-24',
    '"화요일" → 다음주 2/24'
  )
  assertEqual(
    parseDateFromText('수요일 점심', NOW),
    '2026-02-25',
    '"수요일" → 다음주 2/25'
  )
  assertEqual(
    parseDateFromText('목요일 운동', NOW),
    '2026-02-26',
    '"목요일" → 다음주 2/26'
  )
  // 오늘 이후 → 이번 주
  assertEqual(
    parseDateFromText('금요일 저녁', NOW),
    '2026-02-20',
    '"금요일" → 이번주 2/20 (오늘)'
  )
  assertEqual(
    parseDateFromText('토요일 등산', NOW),
    '2026-02-21',
    '"토요일" → 이번주 2/21'
  )
  assertEqual(
    parseDateFromText('일요일 휴식', NOW),
    '2026-02-22',
    '"일요일" → 이번주 2/22'
  )
  // 요일 약어
  assertEqual(
    parseDateFromText('금욜 저녁', NOW),
    '2026-02-20',
    '"금욜" (약어) → 2026-02-20'
  )

  // ── 다음주/이번주 접두사 ──────────────────────
  assertEqual(
    parseDateFromText('다음주 월요일 미팅', NOW),
    '2026-02-23',
    '"다음주 월요일" → 2/23'
  )
  assertEqual(
    parseDateFromText('다음 주 수요일 출장', NOW),
    '2026-02-25',
    '"다음 주 수요일" → 2/25'
  )
  assertEqual(
    parseDateFromText('이번주 월요일 회의', NOW),
    '2026-02-16',
    '"이번주 월요일" → 2/16 (이미 지남이어도 이번주 강제)'
  )

  // ── 절대 날짜 (X월 Y일) ──────────────────────
  assertEqual(
    parseDateFromText('3월 5일 병원', NOW),
    '2026-03-05',
    '"3월 5일" → 2026-03-05'
  )
  assertEqual(
    parseDateFromText('12월 25일 크리스마스', NOW),
    '2026-12-25',
    '"12월 25일" → 2026-12-25'
  )
  assertEqual(
    parseDateFromText('1월 1일 새해', NOW),
    '2027-01-01',
    '"1월 1일" → 2027-01-01 (지난 달 → 내년)'
  )

  // ── 단독 X일 ──────────────────────────────
  assertEqual(
    parseDateFromText('25일 미팅', NOW),
    '2026-02-25',
    '"25일" → 이번달 2/25 (미래)'
  )
  assertEqual(
    parseDateFromText('15일 약속', NOW),
    '2026-03-15',
    '"15일" → 다음달 3/15 (이미 지남)'
  )

  // ── null 반환 (매칭 실패) ──────────────────
  assertEqual(
    parseDateFromText('안녕하세요', NOW),
    null,
    '"안녕하세요" → null'
  )
  assertEqual(
    parseDateFromText('회의 준비', NOW),
    null,
    '"회의 준비" → null (날짜 표현 없음)'
  )

  printResults()
  return printSummary()
}
