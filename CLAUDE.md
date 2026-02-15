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

Reference `Doc/DEVELOPMENT_GUIDE.md` for detailed implementation instructions per phase. Current progress through Phase 2 (Firebase integration). Remaining: OpenAI parsing (3), Event CRUD wiring (4), Calendar view (5), External services (6), AdSense pages (7), Deployment (8).

## Conventions

- Components: PascalCase filenames (`ChatInterface.jsx`)
- Services/utils: camelCase filenames (`firebase.js`, `dateParser.js`)
- API keys: Always via `import.meta.env.VITE_*` — never hardcode
- Icons: Use `lucide-react` exclusively
- Keep styling minimal — functionality over design (MVP-first approach)
