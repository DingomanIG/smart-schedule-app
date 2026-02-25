import { parseDateFromText } from '../utils/dateParser.js'
import { auth } from './firebase.js'
import { DAILY_PROMPT_RULES, DAILY_RESPONSE_FORMAT } from '../data/dailyDefaults.js'
import { PET_CARE_PROMPT_TEMPLATE } from '../data/petCareDefaults.js'
import { WORK_PROMPT_RULES, WORK_CATEGORY_MAPPING, WORK_RESPONSE_FORMAT } from '../data/workDefaults.js'
import { CHILDCARE_PROMPT_TEMPLATE } from '../data/childcareDefaults.js'

const isDev = import.meta.env.DEV

/** OpenAI API 호출 헬퍼 (개발: Vite 프록시, 프로덕션: 서버리스 + Firebase Auth 토큰) */
async function callOpenAI(body) {
  if (isDev) {
    const response = await fetch('/api/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    return response.json()
  }

  const headers = { 'Content-Type': 'application/json' }
  if (auth?.currentUser) {
    headers['Authorization'] = `Bearer ${await auth.currentUser.getIdToken()}`
  }
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function parseSchedule(userMessage, recentEvents = [], lastEventContext = null) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const todayDay = dayNames[now.getDay()]

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 일정 파싱 전문가입니다.
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

반드시 JSON만 응답하세요.`,
      },
      ...(recentEvents.length > 0 || lastEventContext
        ? [{
            role: 'system',
            content: [
              recentEvents.length > 0
                ? '기존 일정 목록:\n' + recentEvents.map(e => {
                    const st = e.startTime?.toDate ? e.startTime.toDate() : new Date(e.startTime)
                    const d = `${st.getFullYear()}-${String(st.getMonth() + 1).padStart(2, '0')}-${String(st.getDate()).padStart(2, '0')}`
                    const t = `${String(st.getHours()).padStart(2, '0')}:${String(st.getMinutes()).padStart(2, '0')}`
                    return `[ID:${e.id}] ${d} ${t} "${e.title}"`
                  }).join('\n')
                : null,
              lastEventContext
                ? `마지막 대화 일정: [ID:${lastEventContext.id}] ${lastEventContext.date} ${lastEventContext.time} "${lastEventContext.title}"`
                : null,
            ].filter(Boolean).join('\n\n'),
          }]
        : []),
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.3,
  }

  const data = await callOpenAI(body)

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 호출 실패')
  }

  const result = data.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = JSON.parse(jsonMatch[0])

  // action 기본값 설정 (하위 호환)
  if (!parsed.action) {
    parsed.action = 'create'
  }

  // 프론트엔드 날짜 파서로 GPT 날짜 교정 (create일 때만)
  if (parsed.action === 'create') {
    const frontendDate = parseDateFromText(userMessage)
    if (frontendDate) {
      parsed.date = frontendDate
    }
  }

  return parsed
}

/**
 * 일상 스케줄 생성 - GPT-4o-mini로 하루 일정 생성
 * @param {object} preferences - { wakeUp, bedTime, meals, commute, routines }
 * @returns {object} { action: "create_batch", events: [...] }
 */
export async function generateDailySchedule(preferences) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const mealInfo = preferences.meals?.regular === false
    ? '불규칙'
    : `아침 ${preferences.meals?.breakfast || '08:00'}, 점심 ${preferences.meals?.lunch || '12:00'}, 저녁 ${preferences.meals?.dinner || '19:00'}`

  const userInfo = `
사용자 정보:
- 기상: ${preferences.wakeUp || '08:00'}
- 취침: ${preferences.bedTime || '23:00'}
- 식사: ${mealInfo}
- 출퇴근: ${preferences.commute?.hasCommute
    ? `${preferences.commute.startTime}~${preferences.commute.endTime}`
    : '없음'}
- 루틴: ${preferences.routines?.length > 0 ? preferences.routines.join(', ') : '없음'}
`.trim()

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `당신은 일상 스케줄 설계 전문가입니다.
사용자의 생활 패턴을 바탕으로 하루 일정을 JSON으로 생성하세요.

규칙:
${DAILY_PROMPT_RULES.join('\n')}

오늘 날짜: ${today}

${DAILY_RESPONSE_FORMAT}`,
      },
      {
        role: 'user',
        content: userInfo,
      },
    ],
    temperature: 0.5,
  }

  const data = await callOpenAI(body)

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 호출 실패')
  }

  const result = data.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('GPT 응답 파싱 실패')

  const parsed = JSON.parse(jsonMatch[0])

  if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new Error('생성된 스케줄이 비어있습니다')
  }

  // 시간 겹침 후처리 보정
  const fixedEvents = fixOverlappingEvents(parsed.events)

  return {
    action: 'create_batch',
    date: today,
    events: fixedEvents,
  }
}

/**
 * 펫 케어 스케줄 생성 - GPT-4o-mini로 돌봄 일정 생성
 * @param {object} petInfo - { petType, petName, petAge, petSize, petIndoor, wakeUp }
 * @returns {object} { action: "petcare_batch", events: [...] }
 */
export async function generatePetCareSchedule(petInfo) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // 다중 펫 지원: pets 배열이 있으면 사용, 없으면 레거시 단일 펫
  const pets = petInfo.pets || [{ petType: petInfo.petType, petName: petInfo.petName, petAge: petInfo.petAge, petSize: petInfo.petSize, petIndoor: petInfo.petIndoor }]
  const simultaneous = petInfo.simultaneous ?? true

  const petDescriptions = pets.map((p, i) => {
    const typeKo = p.petType === 'dog' ? '강아지' : '고양이'
    const sizeKo = p.petSize === 'small' ? '소형' : p.petSize === 'large' ? '대형' : '중형'
    return `반려동물${pets.length > 1 ? ` ${i + 1}` : ''}: ${p.petName} (${typeKo})
나이: ${p.petAge}개월
${p.petType === 'dog' ? `크기: ${sizeKo}` : ''}
실내 생활: ${p.petIndoor ? '예' : '아니오'}`
  }).join('\n\n')

  const userInfo = `${petDescriptions}
${pets.length > 1 ? `\n동시 케어: ${simultaneous ? '예 (같은 시간에 함께)' : '아니오 (각각 따로)'}` : ''}
보호자 기상: ${petInfo.wakeUp || '07:00'}
오늘 날짜: ${today}`.trim()

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: PET_CARE_PROMPT_TEMPLATE,
      },
      {
        role: 'user',
        content: userInfo,
      },
    ],
    temperature: 0.5,
  }

  const data = await callOpenAI(body)

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 호출 실패')
  }

  const result = data.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('GPT 응답 파싱 실패')

  const parsed = JSON.parse(jsonMatch[0])

  if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new Error('생성된 스케줄이 비어있습니다')
  }

  // 시간 겹침 후처리 보정
  const fixedEvents = fixOverlappingEvents(parsed.events)

  return {
    action: 'petcare_batch',
    date: today,
    events: fixedEvents,
  }
}

/**
 * 업무 스케줄 생성 - GPT-4o-mini로 하루 업무 스케줄 생성
 * @param {object} profile - { workType, workStart, workEnd, focusPeak, lunchTime }
 * @param {string} tasks - 사용자 입력 태스크 텍스트
 * @returns {object} { action: "work_batch", events: [...] }
 */
export async function generateWorkSchedule(profile, tasks) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const workTypeKo = {
    office: '사무직 (출근)',
    remote: '재택근무',
    hybrid: '하이브리드',
    freelance: '프리랜서',
  }

  const focusPeakKo = {
    morning: '오전 집중형',
    afternoon: '오후 집중형',
    none: '차이 없음',
  }

  const userInfo = `
근무 형태: ${workTypeKo[profile.workType] || profile.workType}
근무 시간: ${profile.workStart || '09:00'} ~ ${profile.workEnd || '18:00'}
집중 시간대: ${focusPeakKo[profile.focusPeak] || '차이 없음'}
오늘 태스크: ${tasks}
오늘 날짜: ${today}`.trim()

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `너는 업무 생산성 전문 스케줄 설계사야.
사용자의 근무 환경과 태스크 목록을 바탕으로 최적의 하루 업무 스케줄을 JSON으로 생성해.

규칙:
${WORK_PROMPT_RULES.join('\n')}
${WORK_CATEGORY_MAPPING}
오늘 날짜: ${today}

${WORK_RESPONSE_FORMAT}`,
      },
      {
        role: 'user',
        content: userInfo,
      },
    ],
    temperature: 0.5,
  }

  const data = await callOpenAI(body)

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 호출 실패')
  }

  const result = data.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('GPT 응답 파싱 실패')

  const parsed = JSON.parse(jsonMatch[0])

  if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new Error('생성된 스케줄이 비어있습니다')
  }

  // 시간 겹침 후처리 보정
  const fixedEvents = fixOverlappingEvents(parsed.events)

  return {
    action: 'work_batch',
    date: today,
    events: fixedEvents,
  }
}

/**
 * 육아 스케줄 생성 - GPT-4o-mini로 월령 기반 하루 육아 일정 생성
 * @param {object} childInfo - { childName, childBirthdate, childGender, ageMonths, ageGroupLabel, feedingNote, napNote }
 * @returns {object} { action: "childcare_batch", events: [...] }
 */
export async function generateChildcareSchedule(childInfo) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const genderKo = childInfo.childGender === 'boy' ? '남아' : '여아'

  const userInfo = `
아이 이름: ${childInfo.childName}
성별: ${genderKo}
월령: ${childInfo.ageMonths}개월 (${childInfo.ageGroupLabel})
수유/식사: ${childInfo.feedingNote}
수면: ${childInfo.napNote}
보호자 기상: ${childInfo.wakeUp || '07:00'}
오늘 날짜: ${today}`.trim()

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: CHILDCARE_PROMPT_TEMPLATE,
      },
      {
        role: 'user',
        content: userInfo,
      },
    ],
    temperature: 0.5,
  }

  const data = await callOpenAI(body)

  if (data.error) {
    throw new Error(data.error.message || 'OpenAI API 호출 실패')
  }

  const result = data.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('GPT 응답 파싱 실패')

  const parsed = JSON.parse(jsonMatch[0])

  if (!parsed.events || !Array.isArray(parsed.events) || parsed.events.length === 0) {
    throw new Error('생성된 스케줄이 비어있습니다')
  }

  // 시간 겹침 후처리 보정
  const fixedEvents = fixOverlappingEvents(parsed.events)

  return {
    action: 'childcare_batch',
    date: today,
    events: fixedEvents,
  }
}

/**
 * 이벤트 시간 겹침 자동 보정
 * - 시간순 정렬 후 겹치는 이벤트를 뒤로 밀어 10분 버퍼 확보
 * - "수면" 이벤트는 맨 마지막에 고정
 */
function fixOverlappingEvents(events) {
  const BUFFER_MIN = 10

  const timeToMin = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
  }
  const minToTime = (m) => {
    const wrapped = ((m % 1440) + 1440) % 1440
    return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
  }

  // 수면 이벤트 분리 (겹침 보정 대상에서 제외)
  const sleepIdx = events.findIndex(e => e.title === '수면')
  const sleepEvent = sleepIdx !== -1 ? events[sleepIdx] : null
  const dayEvents = events.filter((_, i) => i !== sleepIdx)

  // 시간순 정렬
  dayEvents.sort((a, b) => timeToMin(a.time) - timeToMin(b.time))

  // 겹침 보정
  for (let i = 1; i < dayEvents.length; i++) {
    const prev = dayEvents[i - 1]
    const prevEnd = timeToMin(prev.time) + (prev.duration || 30)
    const currStart = timeToMin(dayEvents[i].time)

    if (currStart < prevEnd + BUFFER_MIN) {
      dayEvents[i].time = minToTime(prevEnd + BUFFER_MIN)
    }
  }

  if (sleepEvent) dayEvents.push(sleepEvent)
  return dayEvents
}
