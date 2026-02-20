#!/usr/bin/env node
/**
 * 테스트 실행 진입점
 *
 * 사용법:
 *   node tests/run.js          # 전체 (dateParser + GPT)
 *   node tests/run.js --date   # dateParser만 (빠르고 무료)
 *   node tests/run.js --gpt    # GPT만 (느리고 비용 발생)
 */
import { runDateParserTests } from './dateParser.test.js'
import { runGptParsingTests } from './gptParsing.test.js'

const args = process.argv.slice(2)
const runDate = args.length === 0 || args.includes('--date')
const runGpt = args.length === 0 || args.includes('--gpt')

let totalPass = 0
let totalFail = 0
let gptSkipped = false

if (runDate) {
  const result = runDateParserTests()
  totalPass += result.pass
  totalFail += result.fail
}

if (runGpt) {
  const result = await runGptParsingTests()
  if (result.skipped) {
    gptSkipped = true
  } else {
    totalPass += result.pass
    totalFail += result.fail
  }
}

// 최종 요약
console.log('\n\x1b[36m=== 최종 결과 ===\x1b[0m')
const total = totalPass + totalFail
if (total === 0 && gptSkipped) {
  console.log('dateParser 테스트 없음, GPT 테스트 스킵됨')
} else {
  if (totalFail === 0) {
    console.log(`\x1b[32m전체 통과: ${totalPass}/${total}\x1b[0m`)
  } else {
    console.log(`전체 통과: ${totalPass}/${total}, \x1b[31m실패: ${totalFail}/${total}\x1b[0m`)
  }
  if (gptSkipped) {
    console.log('\x1b[33m(GPT 테스트는 API 키 없이 스킵됨)\x1b[0m')
  }
}

process.exit(totalFail > 0 ? 1 : 0)
