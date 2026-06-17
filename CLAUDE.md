# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server on port 3000 (allowedHosts: true for ngrok)
npm run build    # tsc type-check then vite build → dist/
npm run preview  # serve the production build
```

There is no test runner, linter, or formatter configured. `npm run build` is the only correctness gate — it runs `tsc` (`noEmit`, `strict: false`) before bundling.

LIFF only runs over HTTPS. For local dev, tunnel port 3000 through ngrok and register that URL as the LIFF Endpoint URL in the LINE Developers Console. Required env vars (see [.env.example](.env.example)): `VITE_LIFF_ID`, `VITE_API_BASE_URL`.

## Architecture

LINE LIFF mini-app for clinic reservations. React 18 + TypeScript + Vite. UI text is Korean. Styling is inline `style={{}}` objects — no CSS framework or modules.

### Navigation is a step state machine, not a router
Despite `react-router-dom` being a dependency, **it is not used**. [src/App.tsx](src/App.tsx) is the entire navigation layer: it holds a `ReservationStep` union (`'login' | 'profile' | 'select-branch-datetime' | 'reservation-detail' | 'confirm' | 'complete'`) in `useState` and conditionally renders one page per step. All reservation flow data (branch, date, time, `ReservationDetail`, completed `Reservation`) lives as `useState` in `App` and is passed down as props; pages call `onNext`/`onBack`/`onComplete` callbacks to advance. There is no global store and no URL state. When adding a screen, extend the `ReservationStep` type in [src/types/index.ts](src/types/index.ts) and add a branch in `App.tsx`.

Flow: login → (profile, only if `isProfileComplete` is false) → select-branch-datetime → reservation-detail → confirm → complete. After LIFF login, `App` calls `customerApi.getProfile()` and routes to `profile` vs `select-branch-datetime` based on `isProfileComplete`.

### LIFF lifecycle
[src/hooks/useLiff.ts](src/hooks/useLiff.ts) wraps `liff.init` and exposes `isReady`, `isLoggedIn`, `lineUserId`, `displayName`, etc. `App` blocks on `isReady` (and a profile check) with a full-screen spinner before rendering anything. `lineUserId` comes from the LIFF context and is the user identity passed to the backend.

### API layer — single endpoint, not REST
[src/utils/api.ts](src/utils/api.ts) talks to **one** `VITE_API_BASE_URL` (a Google Apps Script-style web app), not REST routes. Note this contradicts the README's REST table, which is stale.
- Routing is via a `?path=<name>` query param (e.g. `path=customer`, `path=branches`, `path=reservation`).
- `GET`: params go in the query string via `fetch`.
- `POST`: `Content-Type: text/plain` (deliberate — avoids a CORS preflight), body is JSON-stringified, and `lineUserId` (from `liff.getContext()`) is auto-injected into every POST body.
- Responses are unwrapped from `{ status, data }`; any `status !== 200` throws `Error(json.data?.error)`. There is **no** `Authorization: Bearer` header — auth is identity-by-`lineUserId` in the payload.

Add new calls as methods on the `customerApi` / `branchApi` / `reservationApi` objects, reusing the `get`/`post` helpers and a new `path` value.

### Shared types and UI
All domain types are centralized in [src/types/index.ts](src/types/index.ts). Reusable presentational components (e.g. `LoadingSpinner`) live in [src/components/ui.tsx](src/components/ui.tsx); date/price formatting helpers in [src/utils/format.ts](src/utils/format.ts).
