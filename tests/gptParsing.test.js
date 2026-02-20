/**
 * GPT 파싱 테스트 — OpenAI API 호출 (비용 발생)
 *
 * src/services/openai.js의 parseSchedule()과 동일한 시스템 프롬프트를 사용.
 * openai.js는 import.meta.env를 사용하므로 Node에서 직접 import 불가 →
 * 시스템 프롬프트를 여기서 재구성한다.
 * ⚠️ openai.js의 시스템 프롬프트가 변경되면 이 파일도 동기화해야 한다.
 *
 * 기준 날짜: 테스트 실행 시점의 현재 날짜
 */
import OpenAI from 'openai'
import {
  assertEqual,
  assertContains,
  assertOneOf,
  assertNotNull,
  printResults,
  printSummary,
  resetCounters,
} from './helpers.js'

/**
 * openai.js:parseSchedule()과 동일한 시스템 프롬프트를 생성
 * ⚠️ src/services/openai.js의 프롬프트와 반드시 동기화할 것
 */
function buildSystemPrompt(today, todayDay) {
  return `당신은 일정 파싱 전문가입니다.
사용자 메시지에서 다음 정보를 JSON으로 추출하세요:
{
  "action": "create | move | update | delete",
  "targetEventId": "기존 일정 ID 또는 null",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "title": "일정 제목",
  "duration": 60,
  "category": "meeting|personal|work|health|other",
  "attendees": [],
  "location": "",
  "updates": {}
}

현재 날짜: ${today} (${todayDay})

한국어 오타 교정 규칙 (매우 중요):
- 사용자 입력에 오타가 있으면 반드시 올바른 한국어로 교정하여 title에 저장하세요
- 예: "회이" → "회의", "예얄" → "예약", "운둥" → "운동", "스터듸" → "스터디"
- 예: "점싱" → "점심", "데이투" → "데이트", "츨장" → "출장", "저넉" → "저녁"
- 예: "미팅" → "미팅" (정상), "병원" → "병원" (정상)
- 날짜/시간 관련 오타도 이해하세요: "모래" = "모레", "아칩" = "아침"
- 요일 약어도 인식하세요: "월욜/화욜/수욜/목욜/금욜/토욜/일욜" = "월요일/화요일/.../일요일"
- 자모 분리 오타도 인식하세요: "금ㅇ;ㄹ" = "금요일", "월ㅇ;ㄹ" = "월요일" (한글 자모가 분리된 경우)
- 오타인지 판단이 어려우면 가장 유사한 한국어 단어로 교정하세요

상대 날짜 변환 규칙:
- "내일모레" 또는 "내일 모레" → 오늘+2일 (모레와 동일, "내일"이 아님!)
- "내일" → 오늘+1일
- "모레" 또는 "모래" → 오늘+2일
- "글피" → 오늘+3일
- "이번 주 X요일" 또는 "X욜" → 이번 주의 해당 요일 (오늘 기준 같은 주)
- "다음주 X요일" 또는 "다음주 X욜" → 다음 주의 해당 요일 (오늘+7일이 속한 주)
- 단독 "X요일" 또는 "X욜" → 이번 주, 지났으면 다음 주
- 반드시 현재 날짜와 요일을 기준으로 정확히 계산하세요

날짜에서 "X일" 단독 사용 규칙 (매우 중요):
- "18일 3시 회의" → 이번 달 18일 (월 생략 시 현재 월 기준)
- "25일 오후 2시 병원" → 이번 달 25일
- 이미 지난 날짜면 다음 달로 설정
- "X시"와 "X일"을 혼동하지 마세요: "18일"은 날짜, "18시"는 시간(=오후 6시)

시간 범위 "부터~까지" 규칙 (매우 중요):
- "A시 B분부터 C시 D분까지" 패턴이 있으면 반드시 시간 범위로 해석하세요
- time = 시작 시간, duration = (종료 시간 - 시작 시간)을 분 단위로 계산
- 예: "2시 15분부터 3시까지" → time: "14:15", duration: 45
- 예: "오전 10시 30분부터 11시 15분까지" → time: "10:30", duration: 45
- 예: "9시부터 10시 30분까지" → time: "09:00", duration: 90
- 예: "오후 1시부터 1시 45분까지" → time: "13:00", duration: 45
- "부터~까지"가 있으면 duration 기본값(60)을 사용하지 말고 반드시 계산하세요

모순된 시간 처리 규칙 (매우 중요):
- 하나의 문장에 시간 표현이 2개 이상 있고 서로 모순되면, "부터~까지" 범위를 우선하세요
- 예: "18시 2시 15분부터 3시까지" → "18시"는 "18일"의 오타일 가능성이 높음. "2시 15분부터 3시까지"를 시간으로 사용
- 예: "18시 2시 15분부터 3시까지 유튜브" → date: 이번 달 18일, time: "14:15", duration: 45
- 숫자+"시"가 단독으로 나오고, 뒤에 "부터~까지" 시간 범위가 별도로 있으면, 앞의 숫자+"시"는 "일"의 오타로 판단

시간 변환 규칙:
- "오전/아침 X시" → 그대로 AM, "오후/저녁/밤 X시" → PM 변환
- "새벽 X시" → AM (01:00~05:00)
- "점심시간/점심" → "12:00", "낮 12시" → "12:00"
- 시간이 명시되지 않으면 "09:00"으로 기본 설정
- duration이 명시되지 않고 "부터~까지" 패턴도 없을 때만 60(분)으로 기본 설정

오전/오후 판단 규칙 (중요 - "오전/오후" 명시가 없을 때):
- 일정의 맥락으로 판단하세요
- 기상, 알람, 모닝콜, 아침운동, 출근 → 오전 (AM)
- 회의, 미팅, 수업, 업무 → 오전/오후 모두 가능하므로 시간 크기로 판단: 1~6시는 오후(PM), 7~11시는 오전(AM)
- 점심, 식사약속 → 오후 (PM, 11~13시대)
- 저녁약속, 퇴근, 술자리, 운동, 헬스 → 오후 (PM)
- 예: "28일 3시 기상" → 03:00 (기상은 새벽/오전)
- 예: "25일 6시 저녁약속" → 18:00 (저녁은 오후)
- 예: "3시 회의" → 15:00 (회의는 보통 오후)
- 예: "7시 출근" → 07:00 (출근은 오전)

제목 추출 규칙 (매우 중요):
- 날짜/시간 정보를 제외한 나머지 텍스트가 제목입니다
- 예: "24일 5시 예약" → title: "예약"
- 예: "내일 3시 치과" → title: "치과"
- 예: "금요일 저녁 친구 만남" → title: "친구 만남"
- 예: "모레 오후 2시 팀 회의 강남" → title: "팀 회의"
- 단어가 하나라도 남으면 그것이 제목입니다. 절대 "일정 제목" 같은 기본값을 사용하지 마세요
- 정말 아무 단서가 없을 때만 "일정"이라고 하세요

의도(action) 감지 규칙:
- 새 일정 등록: action = "create"
- 일정 이동/날짜·시간 변경: action = "move" (키워드: 옮겨, 변경, 바꿔, 이동)
- 일정 수정(제목/장소 등): action = "update" (키워드: 제목 바꿔, 장소 변경)
- 일정 삭제/취소: action = "delete" (키워드: 취소, 삭제, 빼줘)
- 생일/기념일/행사 등록: action = "add_major_event" (아래 규칙 참조)
- 명확하지 않으면 action = "create"

주요 행사(생일/기념일/행사) 등록 규칙 (action = "add_major_event"):
- 키워드: "생일 추가/등록", "기념일 추가/등록", "행사 추가/등록", "~의 생일", "~생일이야"
- "생일", "기념일", "행사/동창회/졸업식/모임" 키워드가 포함되고 등록/추가/알려 의도가 있으면 add_major_event
- 단순히 "생일 파티"처럼 일정으로 쓰이는 경우는 create로 처리
- 응답 형식:
{
  "action": "add_major_event",
  "majorEventType": "birthday | anniversary | event",
  "name": "사람/기념일/행사 이름",
  "date": "MM-DD (생일) 또는 YYYY-MM-DD (기념일/행사)",
  "calendarType": "solar 또는 lunar (생일만, 기본값 solar)",
  "relation": "family | friend | colleague | lover (생일만, 기본값 family)",
  "memo": "추가 메모 또는 빈 문자열"
}
- 생일: date는 MM-DD 형식 (연도 없음). "음력"이라고 하면 calendarType = "lunar"
- 기념일/행사: date는 YYYY-MM-DD 형식. 연도가 없으면 현재 연도 사용
- relation 추론: 엄마/아빠/형/동생 등 → family, 친구 → friend, 직장동료/팀장 → colleague, 여자친구/남자친구/연인 → lover
- name 추론: "엄마 생일" → name: "엄마", "내 생일" → name: "나", "연인 기념일" → name: "연인 기념일"

기존 일정 매칭 규칙:
- 아래 "기존 일정 목록"에서 사용자가 언급한 일정을 제목·날짜·시간으로 매칭
- 매칭된 일정의 ID를 targetEventId에 넣으세요
- 매칭 실패 시 targetEventId = null

최근 대화 맥락:
- "마지막 대화 일정"이 제공되면, 특정 일정 미언급 시 이 일정을 대상으로 사용
- 예: "금요일로 옮겨줘"만 하면 마지막 대화 일정이 이동 대상

move 응답: date = 새 날짜, time = 새 시간(변경 없으면 null), targetEventId 필수
delete 응답: targetEventId 필수, 나머지 불필요
update 응답: targetEventId 필수, updates = 변경할 필드만 (예: {"title":"새 제목"})

반드시 JSON만 응답하세요.`
}

/**
 * OpenAI API를 호출하여 GPT 응답 파싱
 */
async function callGPT(client, userMessage, { recentEvents = [], today, todayDay } = {}) {
  const messages = [
    { role: 'system', content: buildSystemPrompt(today, todayDay) },
  ]

  if (recentEvents.length > 0) {
    messages.push({
      role: 'system',
      content: '기존 일정 목록:\n' + recentEvents.map(e =>
        `[ID:${e.id}] ${e.date} ${e.time} "${e.title}"`
      ).join('\n'),
    })
  }

  messages.push({ role: 'user', content: userMessage })

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  return JSON.parse(jsonMatch[0])
}

/**
 * 날짜 헬퍼: 오늘 기준 +N일의 YYYY-MM-DD
 */
function addDays(base, n) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function runGptParsingTests() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    console.log('\n\x1b[33m⚠️  OPENAI_API_KEY 환경변수가 없어 GPT 테스트를 건너뜁니다.\x1b[0m')
    console.log('   실행 방법: OPENAI_API_KEY=sk-... node tests/run.js --gpt\n')
    return { pass: 0, fail: 0, skipped: true }
  }

  const client = new OpenAI({ apiKey })

  resetCounters()
  console.log('\n\x1b[36m=== GPT 파싱 테스트 ===\x1b[0m')
  console.log('\x1b[33m(API 호출 중... 시간이 걸릴 수 있습니다)\x1b[0m\n')

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const todayDay = dayNames[now.getDay()]
  const tomorrow = addDays(now, 1)

  const opts = { today, todayDay }

  // 동시에 여러 API 호출하면 rate limit 걸릴 수 있으므로 순차 실행
  // 각 테스트 사이에 작은 딜레이
  const delay = (ms) => new Promise(r => setTimeout(r, ms))

  // ── 1. create 기본 ──────────────────────────
  try {
    const r = await callGPT(client, '내일 3시 치과', opts)
    assertEqual(r?.action, 'create', 'create 기본: action')
    assertEqual(r?.date, tomorrow, 'create 기본: date (내일)')
    assertEqual(r?.time, '15:00', 'create 기본: time (3시→15:00)')
    assertContains(r?.title || '', '치과', 'create 기본: title 포함 "치과"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "내일 3시 치과" 테스트 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  try {
    const r = await callGPT(client, '금요일 저녁 친구 만남', opts)
    assertEqual(r?.action, 'create', 'create 저녁: action')
    assertNotNull(r?.date, 'create 저녁: date not null')
    assertContains(r?.title || '', '친구', 'create 저녁: title 포함 "친구"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "금요일 저녁 친구 만남" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 2. create 시간 범위 ──────────────────────
  try {
    const r = await callGPT(client, '2시 15분부터 3시까지 유튜브', opts)
    assertEqual(r?.action, 'create', '시간 범위: action')
    assertEqual(r?.time, '14:15', '시간 범위: time (14:15)')
    assertEqual(r?.duration, 45, '시간 범위: duration (45분)')
    assertContains(r?.title || '', '유튜브', '시간 범위: title')
  } catch (e) {
    console.log(`  \x1b[31m❌ "2시 15분부터 3시까지 유튜브" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  try {
    const r = await callGPT(client, '오전 10시 30분부터 11시 15분까지 회의', opts)
    assertEqual(r?.time, '10:30', '오전 시간 범위: time')
    assertEqual(r?.duration, 45, '오전 시간 범위: duration')
  } catch (e) {
    console.log(`  \x1b[31m❌ "오전 10시 30분부터 11시 15분까지" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 3. create 위치/참석자 ──────────────────────
  try {
    const r = await callGPT(client, '강남역 카페에서 팀미팅', opts)
    assertEqual(r?.action, 'create', '위치: action')
    assertContains(r?.location || '', '강남', '위치: location 포함 "강남"')
    assertContains(r?.title || '', '미팅', '위치: title 포함 "미팅"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "강남역 카페에서 팀미팅" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 4. move ──────────────────────────────
  try {
    const events = [
      { id: 'evt-001', date: today, time: '15:00', title: '치과' },
    ]
    const r = await callGPT(client, '치과 금요일로 옮겨줘', { ...opts, recentEvents: events })
    assertEqual(r?.action, 'move', 'move: action')
    assertEqual(r?.targetEventId, 'evt-001', 'move: targetEventId')
    assertNotNull(r?.date, 'move: date not null')
  } catch (e) {
    console.log(`  \x1b[31m❌ "치과 금요일로 옮겨줘" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 5. update ──────────────────────────────
  try {
    const events = [
      { id: 'evt-002', date: today, time: '10:00', title: '치과' },
    ]
    const r = await callGPT(client, '치과 제목 병원으로 바꿔줘', { ...opts, recentEvents: events })
    assertEqual(r?.action, 'update', 'update: action')
    assertEqual(r?.targetEventId, 'evt-002', 'update: targetEventId')
    const newTitle = r?.updates?.title || r?.title || ''
    assertContains(newTitle, '병원', 'update: 새 제목 포함 "병원"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "치과 제목 병원으로 바꿔줘" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 6. delete ──────────────────────────────
  try {
    const events = [
      { id: 'evt-003', date: tomorrow, time: '14:00', title: '치과' },
    ]
    const r = await callGPT(client, '치과 취소해줘', { ...opts, recentEvents: events })
    assertEqual(r?.action, 'delete', 'delete: action')
    assertEqual(r?.targetEventId, 'evt-003', 'delete: targetEventId')
  } catch (e) {
    console.log(`  \x1b[31m❌ "치과 취소해줘" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 7. add_major_event: 생일 ──────────────────
  try {
    const r = await callGPT(client, '엄마 생일 5월 3일', opts)
    assertEqual(r?.action, 'add_major_event', 'major_event 생일: action')
    assertEqual(r?.majorEventType, 'birthday', 'major_event 생일: type')
    assertContains(r?.name || '', '엄마', 'major_event 생일: name')
    assertContains(r?.date || '', '05-03', 'major_event 생일: date')
    assertEqual(r?.relation, 'family', 'major_event 생일: relation')
  } catch (e) {
    console.log(`  \x1b[31m❌ "엄마 생일 5월 3일" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 8. add_major_event: 기념일 ──────────────────
  try {
    const r = await callGPT(client, '결혼기념일 등록 6월 15일', opts)
    assertEqual(r?.action, 'add_major_event', 'major_event 기념일: action')
    assertEqual(r?.majorEventType, 'anniversary', 'major_event 기념일: type')
  } catch (e) {
    console.log(`  \x1b[31m❌ "결혼기념일 등록" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 9. 오타 교정 ──────────────────────────────
  try {
    const r = await callGPT(client, '내일 3시 회이', opts)
    assertEqual(r?.action, 'create', '오타 교정 "회이": action')
    assertContains(r?.title || '', '회의', '오타 교정: "회이" → "회의"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "내일 3시 회이" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  try {
    const r = await callGPT(client, '모레 오후 2시 예얄', opts)
    assertContains(r?.title || '', '예약', '오타 교정: "예얄" → "예약"')
  } catch (e) {
    console.log(`  \x1b[31m❌ "모레 오후 2시 예얄" 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 10. 시간 추론 (AM/PM 맥락) ──────────────────
  try {
    const r = await callGPT(client, '내일 3시 회의', opts)
    assertEqual(r?.time, '15:00', '시간 추론: 3시 회의 → 15:00')
  } catch (e) {
    console.log(`  \x1b[31m❌ "3시 회의" 시간 추론 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  try {
    const r = await callGPT(client, '내일 7시 출근', opts)
    assertEqual(r?.time, '07:00', '시간 추론: 7시 출근 → 07:00')
  } catch (e) {
    console.log(`  \x1b[31m❌ "7시 출근" 시간 추론 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 11. 카테고리 감지 ──────────────────────────
  try {
    const r = await callGPT(client, '내일 오후 3시 팀 미팅', opts)
    assertEqual(r?.category, 'meeting', '카테고리: 팀 미팅 → meeting')
  } catch (e) {
    console.log(`  \x1b[31m❌ 카테고리 감지 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  try {
    const r = await callGPT(client, '내일 10시 병원', opts)
    assertEqual(r?.category, 'health', '카테고리: 병원 → health')
  } catch (e) {
    console.log(`  \x1b[31m❌ 카테고리 감지 실패: ${e.message}\x1b[0m`)
  }
  await delay(500)

  // ── 12. 엣지 케이스: 모순된 시간 ──────────────────
  try {
    const r = await callGPT(client, '18시 2시 15분부터 3시까지 유튜브', opts)
    assertEqual(r?.time, '14:15', '모순 시간: time (부터~까지 우선)')
    assertEqual(r?.duration, 45, '모순 시간: duration (45분)')
  } catch (e) {
    console.log(`  \x1b[31m❌ 모순 시간 테스트 실패: ${e.message}\x1b[0m`)
  }

  printResults()
  return printSummary()
}
