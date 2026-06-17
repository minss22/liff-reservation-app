# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server on port 3000 (allowedHosts: true for ngrok)
npm run build    # tsc type-check then vite build → dist/
npm run preview  # serve the production build
```

There is no test runner, linter, or formatter configured. `npm run build` is the only correctness gate — it runs `tsc` (`noEmit`, `strict: false`) before bundling.

LIFF only runs over HTTPS. For local dev, tunnel port 3000 through ngrok and register that URL as the LIFF Endpoint URL in the LINE Developers Console. Required env vars (see [.env.example](.env.example)): `VITE_LIFF_ID`, `VITE_API_BASE_URL`, `VITE_BRANCH_ID`. `VITE_BRANCH_ID` is the clinic's channel id (matches `branches.branch_id`) — the app is **single-clinic**, so the branch is fixed per deployment, not chosen by the user.

## Architecture

LINE LIFF mini-app for clinic reservations. React 18 + TypeScript + Vite. UI text is **Japanese** (the app is being localized from Korean — some component defaults like `LoadingSpinner`'s message are still Korean, and code comments are Korean). Styling is inline `style={{}}` objects — no CSS framework or modules.

### Navigation is a step state machine, not a router
Despite `react-router-dom` being a dependency, **it is not used**. [src/App.tsx](src/App.tsx) is the entire navigation layer: it holds a `ReservationStep` union (`'login' | 'profile' | 'select-datetime' | 'consultation' | 'confirm' | 'complete'`) in `useState` and conditionally renders one page per step. All reservation flow data (`branch`, date, time, `ConsultationData`, completed `Reservation`, and `userProfile`) lives as `useState` in `App` and is passed down as props; pages call `onNext`/`onBack`/`onComplete` callbacks to advance. There is no global store and no URL state. When adding a screen, extend the `ReservationStep` type in [src/types/index.ts](src/types/index.ts) and add a branch in `App.tsx`.

Flow: login → (profile, first visit only) → select-datetime → consultation → confirm → complete. **There is no branch-selection step** — the clinic is identified by `BRANCH_ID`, resolved once by `resolveBranchId()` in [src/App.tsx](src/App.tsx): the LIFF URL query `?branch=<id>` wins (also un-wrapping LIFF's `liff.state`), falling back to `VITE_BRANCH_ID`. This is the multi-clinic hook — one LIFF app serves many clinics, each rich-menu link carrying its own `?branch=`. A logged-in session with no resolvable branch renders an error screen. After login, `App` fires `branchApi.getBranch(BRANCH_ID)` to load that branch for display. In parallel it calls `customerApi.getProfile()`; a non-null profile routes to `select-datetime`, null routes to `profile`. Step → page mapping: `select-datetime` → `SelectDatetimePage`, `consultation` → `ConsultationPage` (the `StepIndicator` shows 2 steps: datetime 1/2, consultation 2/2).

**MyPage is an orthogonal overlay, not a step.** Two booleans — `showMyPage` and `isEditingProfile` — are checked *before* the step switch and take precedence over it. Most pages receive an `onOpenMyPage` callback; `MyPage` reuses `ProfilePage` in `isEditMode` for editing. When adding navigation, be aware these overlay flags short-circuit the step machine.

### LIFF lifecycle
[src/hooks/useLiff.ts](src/hooks/useLiff.ts) wraps `liff.init` and exposes `isReady`, `isLoggedIn`, `lineUserId`, `displayName`, etc. `App` blocks on `isReady` (and a profile check) with a full-screen spinner before rendering anything. `lineUserId` comes from the LIFF context and is the user identity passed to the backend.

### API layer — single endpoint, not REST
[src/utils/api.ts](src/utils/api.ts) talks to **one** `VITE_API_BASE_URL` (a Google Apps Script-style web app), not REST routes. Note this contradicts the README's REST table, which is stale.
- Routing is via a `?path=<name>` query param (e.g. `path=customer`, `path=branches`, `path=reservation`).
- `GET`: params go in the query string via `fetch`.
- `POST`: `Content-Type: text/plain` (deliberate — avoids a CORS preflight), body is JSON-stringified, and `lineUserId` (from `liff.getContext()`) is auto-injected into every POST body.
- Responses are unwrapped from `{ status, data }`; any `status !== 200` throws `Error(json.data?.error)`. There is **no** `Authorization: Bearer` header — auth is identity-by-`lineUserId` in the payload.
- The backend speaks **snake_case** (`line_user_id`, `display_name`, `birth_date`, `treatment_request`); the `*Api` objects map at the boundary. `customerApi.getProfile` maps to the camelCase `UserProfile` shape and synthesizes `isProfileComplete`. `reservationApi.createReservation`/`getMyReservations` map the frontend `desiredTreatment` ↔ backend `treatmentRequest`/`treatment_request`, and `createReservation` sends `companions` as an **array** of `{name, birthDate, gender, visitType, treatmentRequest, ...}` (the backend writes one extra reservations row per companion).
- **`visitType` wire value is `'first'`/`'return'`** end-to-end (stored verbatim in `reservations.visit_type`); pages map it to Japanese labels (`初診`/`再診`) for display.
- **Gender encoding gotcha:** the frontend uses `'male'`/`'female'` everywhere, but the backend `customers` sheet stores Korean strings `'남성'`/`'여성'`. Conversion happens at the API boundary — `getProfile` maps backend→frontend, and callers must convert frontend→backend before `createProfile` (see `App.tsx`, which passes `gender === 'male' ? '남성' : '여성'`). Companion gender in `reservations` is stored as the raw `'male'`/`'female'`.

Add new calls as methods on the `customerApi` / `branchApi` / `reservationApi` objects, reusing the `get`/`post` helpers and a new `path` value. Current `path` values in use: `customer`, `branches`, `branch`, `available-dates`, `available-slots`, `reservation`, `reservations`, `cancel`.

### Shared types and UI
All domain types are centralized in [src/types/index.ts](src/types/index.ts). Reusable presentational components (`TopBar`, `StepIndicator`, `Button`, `Input`, `Textarea`, `Chip`, `LoadingSpinner`, `InfoBox`, `SummaryCard`) live in [src/components/ui.tsx](src/components/ui.tsx); date/price/status/calendar helpers in [src/utils/format.ts](src/utils/format.ts). Note `formatStatus` returns **Japanese** labels for the `Reservation['status']` union.
