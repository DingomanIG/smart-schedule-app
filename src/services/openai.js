import { parseDateFromText } from '../utils/dateParser.js'

const isDev = import.meta.env.DEV

export async function parseSchedule(userMessage) {
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
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "title": "일정 제목",
  "duration": 60,
  "category": "meeting|personal|work|health|other",
  "attendees": [],
  "location": ""
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

반드시 JSON만 응답하세요.`,
      },
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

  // 프론트엔드 날짜 파서로 GPT 날짜 교정
  const frontendDate = parseDateFromText(userMessage)
  if (frontendDate) {
    parsed.date = frontendDate
  }

  return parsed
}
