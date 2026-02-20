import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const ALLOWED_MODELS = ['gpt-4o-mini']
const MAX_TOKENS_LIMIT = 2048
const MAX_MESSAGES = 20
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://yschedule.me'

// Firebase Admin 초기화 (ID 토큰 검증용)
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
let adminAuth = null
if (FIREBASE_PROJECT_ID) {
  if (!getApps().length) {
    initializeApp({ projectId: FIREBASE_PROJECT_ID })
  }
  adminAuth = getAuth()
}

// IP 기반 Rate Limit (인메모리)
const RATE_LIMIT_WINDOW = 60 * 1000 // 1분
const RATE_LIMIT_MAX = 20 // 1분당 최대 요청 수
const rateLimitMap = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

// 오래된 항목 정리 (5분마다)
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(ip)
  }
}, 5 * 60 * 1000)

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || ''
  const isAllowed = origin === ALLOWED_ORIGIN || process.env.NODE_ENV === 'development'
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate Limit 검사
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })
  }

  // Firebase Auth 토큰 검증
  if (adminAuth) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증이 필요합니다.' })
    }
    try {
      await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    } catch (e) {
      return res.status(401).json({ error: '유효하지 않은 인증 토큰입니다.' })
    }
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // 입력 검증
  const body = req.body
  if (!body || !body.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  if (body.messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: 'Too many messages' })
  }

  // 모델 강제 고정 (클라이언트 값 무시)
  const model = ALLOWED_MODELS[0]

  // max_tokens 제한
  const maxTokens = Math.min(body.max_tokens || MAX_TOKENS_LIMIT, MAX_TOKENS_LIMIT)

  const sanitizedBody = {
    model,
    messages: body.messages,
    max_tokens: maxTokens,
    temperature: body.temperature ?? 0.7,
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(sanitizedBody),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: 'AI 요청 처리 중 오류가 발생했습니다.' })
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'AI 서비스에 연결할 수 없습니다.' })
  }
}
