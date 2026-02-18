# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AI-powered smart schedule management web app (스마트 스케줄). Users register schedules via natural language Korean chat, parsed by OpenAI GPT-4o-mini and stored in Firebase Firestore. Korean-language UI throughout.

## Commands

```bash
npm run dev      # Vite dev server on port 5173 (proxies /api/openai → OpenAI API)
npm run build    # Production build to /dist
npm run preview  # Preview production build
```

No test runner or linter is configured.

## Architecture

**Core data flow:** User types Korean natural language in ChatInterface → `openai.js:parseSchedule()` sends to GPT-4o-mini → response parsed as JSON → user confirms via card UI → `schedule.js` writes to Firestore → CalendarView refreshes via `refreshKey` prop increment.

**OpenAI API routing:**
- Dev: Vite proxy rewrites `/api/openai/v1/chat/completions` → `https://api.openai.com` (key sent from browser)
- Prod: Vercel serverless function at `api/chat.js` proxies to OpenAI (key stays server-side)

**Chat action types:** The GPT prompt returns `action: "create" | "move" | "update" | "delete"` with `targetEventId` for existing event operations. ChatInterface renders color-coded confirmation cards (blue=create, orange=move, red=delete, purple=update) that require user approval before Firestore writes.

**Calendar architecture:** CalendarView manages three sub-views (month/week/day) and holds `monthEvents` state. It fetches the full month's events once, then filters locally per selected date. Events support drag-and-drop moving in month view.

**Date parsing dual layer:** GPT parses dates from the prompt, then `dateParser.js:parseDateFromText()` re-parses the original user text client-side to correct GPT date errors (for `create` action only). The frontend parser handles Korean relative dates (내일, 모레, 글피, X요일) and typos (모래→모레, X욜→X요일).

**Auth flow:** `useAuth` hook checks `isFirebaseConfigured` (from `firebase.js`) — if Firebase env vars are missing, returns a demo user (`uid: 'demo'`). App renders AuthForm gate when no user.

**Dark mode:** `useDarkMode` hook persists to `localStorage('theme')`, toggles `dark` class on `<html>`. Tailwind configured with `darkMode: 'class'`.

**Routing:** React Router v7 with flat route structure. `MainApp` component at `/` is the authenticated app. Static pages (`/about`, `/privacy`, `/blog/*`, etc.) are standalone page components under `src/pages/`.

## Key Patterns

- **State management:** `useState` only — no external state library. CalendarView refresh is triggered by incrementing a `calendarKey` number prop.
- **Firestore timestamps:** All dates stored as `Timestamp` objects. Convert with `.toDate()` for display. Use `toLocalDateStr()` helper for consistent `YYYY-MM-DD` formatting (avoids UTC timezone bugs).
- **Event schema:** `{ userId, title, startTime: Timestamp, endTime: Timestamp|null, category, location, attendees[], createdAt, createdVia: 'chat' }`
- **Demo mode:** App fully functional without Firebase — `useAuth` returns demo user, but Firestore operations will fail silently.
- **Styling:** Tailwind CSS with `dark:` variants everywhere. Primary color: `blue-600`. Use `lucide-react` for all icons.

## Environment Variables

All prefixed with `VITE_`. Required: `VITE_OPENAI_API_KEY`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Optional: `VITE_WEB3FORMS_KEY`, `VITE_GISCUS_*`, `VITE_ADSENSE_CLIENT_ID`. See `.env.example`.

## Conventions

- Components: PascalCase (`ChatInterface.jsx`), services/utils: camelCase (`schedule.js`)
- All user-facing text in Korean
- New docs go in `docs/` subfolders with version suffix (`_v1.0.md`)
- `docs/`, `test-screenshots/` are dev-only — never put deployable code there

# currentDate
Today's date is 2026-02-18.
