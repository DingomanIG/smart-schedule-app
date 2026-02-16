# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-powered smart schedule management web app (스마트 스케줄). Users register schedules via natural language chat, which are parsed by OpenAI GPT-4o-mini and stored in Firebase Firestore. Korean-language UI.

## Commands

```bash
npm run dev      # Start Vite dev server (default port 5173)
npm run build    # Production build to /dist
npm run preview  # Preview production build
```

## Architecture

```
src/
├── components/    # React UI components (PascalCase.jsx)
├── services/      # External service integrations (camelCase.js)
│   ├── firebase.js    # Firebase init with isFirebaseConfigured guard
│   └── schedule.js    # Firestore event CRUD
├── hooks/         # Custom React hooks
│   └── useAuth.js     # Auth state + demo mode fallback
├── utils/         # Utility functions (planned: dateParser.js)
├── App.jsx        # Root: auth gate → 3-tab layout (chat/calendar/report)
└── main.jsx       # ReactDOM entry point
```

**Data flow:** ChatInterface → OpenAI parseSchedule → schedule.js → Firestore

**Firestore collections:** `users` (profiles), `events` (schedules), `chat_messages` (chat history)

## Key Patterns

- **Demo mode:** When `.env` is missing or Firebase unconfigured, `useAuth` returns a demo user (`uid: 'demo'`) so the app runs without Firebase.
- **Environment variables:** All secrets use `VITE_` prefix (Vite convention). See `.env.example` for required keys.
- **State management:** `useState` only — no Redux/Zustand. Keep it simple.
- **Styling:** Tailwind CSS with minimal classes. Primary color: `blue-600`. No gradients, no complex animations.
- **Error handling:** All async functions wrapped in try-catch. Firebase error codes mapped to Korean messages in AuthForm.

## Development Phases

Reference `docs/guides/DEVELOPMENT_GUIDE_v1.0.md` for detailed implementation instructions per phase. Current progress through Phase 2 (Firebase integration). Remaining: OpenAI parsing (3), Event CRUD wiring (4), Calendar view (5), External services (6), AdSense pages (7), Deployment (8).

## Non-Deployable Folders

아래 폴더는 개발/문서 전용이며 프로덕션 빌드(`npm run build`)에 포함되지 않는다.

| 폴더 | 용도 |
|------|------|
| `docs/` | 내부 문서 루트 (아래 하위 폴더로 분류) |
| `docs/planning/` | 프로젝트 기획, 계획, TODO |
| `docs/guides/` | 개발 가이드, 워크플로우, 마스터 가이드 |
| `docs/deployment/` | 배포, 수익화 체크리스트 |
| `docs/ideas/` | 개선 아이디어, 기능 제안 |
| `test-screenshots/` | 테스트 중 생성되는 스크린샷 저장 (Playwright 등) |

```
docs/
├── planning/
│   ├── PROJECT_PLAN_v1.0.md        # 프로젝트 기획서
│   └── TODO_v1.0.md                # 개발 진행 체크리스트
├── guides/
│   ├── DEVELOPMENT_GUIDE_v1.0.md   # 단계별 개발 지침서
│   ├── DEVELOPMENT_WORKFLOW_v1.0.md # 개발 워크플로우
│   └── MASTER_GUIDE_v1.0.md        # 마스터 가이드 (4일 런칭)
├── deployment/
│   └── DEPLOYMENT_CHECKLIST_v1.0.md # 배포 & 수익화 체크리스트
└── ideas/
    └── IMPROVEMENT_IDEAS_v1.0.md    # 개선 아이디어 50선
```

- Vite는 `src/` 와 `public/` 만 빌드 대상으로 처리
- 위 폴더에는 코드/컴포넌트를 넣지 말 것
- 새 내부 문서는 용도에 맞는 `docs/` 하위 폴더에 작성
- 문서 파일명에 버전 표기 필수 (예: `_v1.0.md`, `_v1.1.md`)
- 테스트 스크린샷은 반드시 `test-screenshots/` 에 저장 (프로젝트 루트에 직접 저장 금지)

## Conventions

- Components: PascalCase filenames (`ChatInterface.jsx`)
- Services/utils: camelCase filenames (`firebase.js`, `dateParser.js`)
- API keys: Always via `import.meta.env.VITE_*` — never hardcode
- Icons: Use `lucide-react` exclusively
- Keep styling minimal — functionality over design (MVP-first approach)
