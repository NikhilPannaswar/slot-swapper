# slot-swapper — Frontend — Project Flow

Purpose
- Frontend for slot-swapper: user interface to view, create, edit, and swap time slots between users/resources.
- Single-page app (SPA) that communicates with backend APIs to read/write slot data and run swap operations.

Tech stack
- Framework: React (functional components + hooks)
- Bundler: Vite or Create React App
- State: React Query (server state) + local UI state via useState/useReducer or Zustand
- Styling: CSS Modules / Tailwind / Styled Components (pick one)
- API: REST or GraphQL (REST assumed)
- Testing: Jest + React Testing Library
- Linting/Formatting: ESLint + Prettier
- CI/CD: GitHub Actions

High-level flow
1. App bootstraps -> loads global providers (Router, QueryClient, AuthProvider, Theme).
2. On route change, a page component mounts (e.g., Dashboard, SlotEditor, SwapRequests).
3. Page requests server data with React Query (e.g., GET /slots, GET /users).
4. UI shows loaders; cached data returned immediately when available.
5. User interacts (selects slot, opens editor, requests swap).
6. UI updates optimistic state if applicable; mutation sent to API (POST /slots, PATCH /slots/:id, POST /swaps).
7. On success, React Query invalidates/updates queries; UI reflects final state.
8. Errors show toast/modal with retry options.

Folder structure (recommended)
- public/                — static assets
- src/
    - api/                 — API client and endpoint definitions
    - assets/              — images/icons
    - components/          — small reusable components (Button, Modal)
    - features/            — feature folders (slots/, swaps/, users/)
        - SlotList/
        - SlotEditor/
        - SwapFlow/
    - hooks/               — shared hooks (useSlots, useAuth)
    - providers/           — provider wrappers (QueryClient, Auth)
    - routes/              — route definitions
    - pages/               — top-level pages (Dashboard, Settings)
    - store/               — global state (if using Zustand or Redux)
    - styles/              — global styles, tokens
    - utils/               — helpers, validators, constants
    - App.tsx
    - main.tsx
- tests/                 — e2e or integration tests (optional)
- package.json
- README.md

Core components and responsibilities
- SlotList: fetches and renders slots grouped by date/resource; supports filters and pagination.
- SlotCard: single slot UI with actions (edit, request-swap).
- SlotEditor: form to create/update slots with validation and availability checks.
- SwapRequestModal / SwapWizard: guides user through selecting target slot/user and confirming swap.
- Notifications: show success/error/info for API actions.
- AuthGate: redirects unauthenticated users to login.

Data flow and state management
- Server is source of truth for slot data.
- Use React Query for:
    - GET /slots, GET /users, GET /swaps
    - POST /slots, PATCH /slots/:id, POST /swaps
- Local UI state for draft forms and modal visibility.
- Optimistic updates for swaps and slot edits with rollback on error.
- Use query keys by resource and filters (['slots', {date, resourceId}]).

API contracts (examples)
- GET /slots?date=YYYY-MM-DD&resourceId=...
    - response: [{ id, start, end, ownerId, status, meta }]
- POST /slots
    - body: { start, end, resourceId, ownerId, meta }
- POST /swaps
    - body: { fromSlotId, toSlotId, requesterId }
- PATCH /slots/:id/status
    - body: { status }

Auth & security
- Bearer JWT in Authorization header (or cookie-based).
- Protect mutation routes server-side; validate ownership/permissions.
- Frontend: store token in httpOnly cookie or memory; avoid localStorage for tokens if possible.

Development flow (local)
1. Install:
     - node >= 16
     - npm / pnpm / yarn
2. Setup:
     - cp .env.example .env
     - Set API_BASE_URL, AUTH settings
3. Run:
     - npm install
     - npm run dev
4. Build:
     - npm run build
5. Test:
     - npm run test
6. Lint/Format:
     - npm run lint
     - npm run format

Scripts (example package.json)
- dev: start dev server
- build: production build
- preview: serve built files
- test: run unit tests
- lint: eslint check
- format: prettier

Testing strategy
- Unit tests for hooks and utility functions.
- Component tests for SlotList, SlotEditor, Swap flow (React Testing Library).
- Integration/e2e for critical flows (create slot, request swap) with Playwright or Cypress.

CI/CD
- Run: lint, test, build on PRs.
- Deploy build artifacts to static host (Vercel, Netlify) or serve via backend.
- Environment secrets for API endpoints and auth.

Conventions
- Prefer small composable components.
- Keep side effects in hooks (useSlots, useSwap).
- Use semantic commit messages; enforce with husky + commitlint if desired.
- Document public components and hooks with short JSDoc.

Observability & error handling
- Centralized error boundary for unexpected exceptions.
- Toasts for API errors/success.
- Optional: integrate Sentry or similar for runtime errors and performance traces.

Troubleshooting
- If slots not loading: check API_BASE_URL and CORS.
- If auth fails: ensure token present and not expired.
- If optimistic update rollback: inspect server validation response for conflict.

Contribution
- Fork -> feature branch -> PR -> review -> merge.
- Add tests for new behavior and update README when changing flows.

Minimal .env.example
- VITE_API_BASE_URL=https://api.example.com
- VITE_AUTH_CLIENT_ID=your-client-id

This README provides the complete flow overview for frontend development and operations. Extend details for project-specific rules, routes, and API fields as backend contracts solidify.