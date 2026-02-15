import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: window.location.origin + '/api/openai/v1',
  dangerouslyAllowBrowser: true,
})

export async function parseSchedule(userMessage) {
  const today = new Date().toISOString().split('T')[0]

  const completion = await openai.chat.completions.create({
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

현재 날짜: ${today}
"내일" → 내일 날짜로 변환
"다음주 월요일" → 실제 날짜로 변환
"오후 2시" → "14:00"
시간이 명시되지 않으면 "09:00"으로 기본 설정
duration이 명시되지 않으면 60(분)으로 기본 설정

반드시 JSON만 응답하세요.`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.3,
  })

  const result = completion.choices[0].message.content
  const jsonMatch = result.match(/\{[\s\S]*\}/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null
}
