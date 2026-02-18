import { parseDateFromText } from '../utils/dateParser.js'

const isDev = import.meta.env.DEV

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
- 명확하지 않으면 action = "create"

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

  let data

  if (isDev) {
    // Development: Vite proxy
    const response = await fetch('/api/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    data = await response.json()
  } else {
    // Production: Vercel serverless function
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    data = await response.json()
  }

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
1. 별도의 "기상"/"취침" 이벤트 대신, 마지막에 "수면" 이벤트 1개를 포함하세요. 시작 시간=취침 시간, duration=취침~기상까지 분(예: 23:00~08:00이면 540분)
2. 반드시 아침 식사, 점심 식사, 저녁 식사 3끼를 포함하세요 (사용자가 불규칙이라고 하지 않는 한)
3. 실제 활동만 이벤트로 생성 (자유 시간, 여가 시간, 휴식 등 빈 시간은 이벤트로 만들지 않음)
4. 식사 시간 최소 30분 확보
5. 출퇴근이 있으면: 출근 준비(30분) + 출근 + 업무 시간 + 퇴근 포함
6. 루틴 배치 규칙:
   - 운동 → 출근 전 또는 퇴근 후
   - 독서 → 저녁/취침 전
   - 명상 → 기상 직후 또는 취침 전
   - 기타 루틴 → 빈 시간에 자연스럽게 배치
7. 활동 사이 10~15분 버퍼 (이동/준비 시간, 이벤트로 만들지 않음)
8. "자유 시간", "여가", "휴식" 같은 빈 시간은 절대 이벤트로 만들지 마세요
9. category는 반드시 다음 중 하나: routine, meal, commute, personal, health
10. personal 카테고리는 하루 1개만, 같은 루틴도 1회만 배치
11. 모든 제목은 한국어로 작성
12. duration은 분 단위
13. **절대 시간 겹침 금지**: 모든 이벤트는 이전 이벤트의 종료 시간(시작시간+duration) 이후에 시작해야 합니다. 예를 들어 운동이 08:00~09:00이면 아침 식사는 09:10 이후에 배치하세요. 이벤트를 시간순으로 정렬하고 겹치지 않는지 반드시 확인하세요.

오늘 날짜: ${today}

응답 형식 (JSON만 반환):
{
  "action": "create_batch",
  "events": [
    { "title": "수면", "time": "23:00", "duration": 540, "category": "routine" }
  ]
}`,
      },
      {
        role: 'user',
        content: userInfo,
      },
    ],
    temperature: 0.5,
  }

  let data

  if (isDev) {
    const response = await fetch('/api/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    data = await response.json()
  } else {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    data = await response.json()
  }

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
