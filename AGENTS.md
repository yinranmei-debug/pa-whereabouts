# AGENTS.md

See `CLAUDE.md` for a full architecture/navigation guide (product overview, key files, auth, email, Supabase tables). This file adds cloud-agent operating notes.

## Cursor Cloud specific instructions

### What this is
A Vite + React SPA (`pa-whereabouts`). Backend is Supabase (Postgres + realtime), auth is Azure AD via MSAL. There is no separate backend service to run — the frontend talks directly to Supabase using a hardcoded publishable key in `src/App.jsx`.

### Standard commands
Scripts are in `package.json`: `npm run dev` (Vite dev server on `http://localhost:5173`), `npm run build`, `npm run lint` (ESLint), `npm run preview`.

- Lint (`npm run lint`) currently reports pre-existing errors in the repo (e.g. `react-hooks/purity`, `react-refresh/only-export-components`, unused vars). These are not caused by setup; do not "fix" them as part of environment work.

### Node version gotcha
`package.json` sets `engines.node` to `20.x`, but the app installs, lints, builds, and runs cleanly on the VM's Node 22. `npm install` prints a harmless `EBADENGINE` warning — ignore it. `.npmrc` sets `legacy-peer-deps=true`, so a plain `npm install` is correct.

### Auth is the main testing blocker
The board is gated behind Azure AD (`msalInstance.loginRedirect`) and `src/authConfig.js` hardcodes `redirectUri: https://pa-whereabouts.vercel.app/`. A real Microsoft login cannot complete on `localhost:5173` (the redirect URI is not registered for localhost and requires a Pattern tenant account). The login screen itself renders fine.

To exercise the authenticated board locally for testing, temporarily inject a fake MSAL account (revert before committing). In the auth init effect in `src/App.jsx` (right after `await msalInstance.initialize(); setIsInit(true);`), add a URL-flag bypass, e.g.:

```js
if (new URLSearchParams(window.location.search).get('devbypass') === '1') {
  setAccount({ username: 'jason.chen@patternasia.com', name: 'Jason Chen' }); return;
}
```

Then open `http://localhost:5173/?devbypass=1`. Use a real staff email from `src/data/staff.json` so `meStaff` resolves and you can set your own status. This is a temporary debugging aid only — never commit it.

### The staff roster has two sources — always merge them
The roster is `src/data/staff.json` **plus** the `staff_extras` Supabase table, which is what the
Admin Portal ("⚙ Staff" button) writes to. `buildStaffList()` in `src/App.jsx` merges them:
rows sharing an id with `staff.json` patch that entry in place (so email edits keep roster order),
and genuinely new people are appended.

Anything the board renders must come from `rosterStaff` (merged, minus hidden ids) or `allStaff`
(merged, including hidden), and identity lookups must use `getStaffEntryDynamic` /
`getStaffByIdDynamic`. Do **not** render or resolve identity from `RAW_STAFF_LIST` — that is the
static file only. This previously caused a silent bug where portal-added people were written to the
database but never appeared on the board, and could not set their own status because `meStaff` did
not resolve. `RAW_STAFF_LIST` is still correct for the `staticStaff` prop passed to `AdminPortal`
(it needs to know which entries are overrides) and inside `BirthdayOverlay`, which resolves
themes/ids from the static list only.

### Supabase data notes
- Setting a status writes to the `statuses` table (row id format `<staffId>-<YYYY-MM-DD>-<AM|PM>`). Changes propagate to other clients via realtime, so writes hit the **shared production** Supabase project. When testing, use far-future dates and delete the rows afterward (`DELETE /rest/v1/statuses?id=eq.<id>`), and avoid the leave types `AL/SL/BL/ML/PL` for your own row since they trigger the leave-invite emailer flow.
- **Initial load must paginate `statuses`**: this project's PostgREST `max-rows` is **1000** (~1030+ rows in the table). A single `select('*').limit(50000)` only returns the first 1000 rows (by default order), so recent keys like `yinran-2026-07-31-AM` can exist in the DB but never reach the UI. `fetchAllStatuses()` in `App.jsx` pages with `.range()` until exhausted.
- On first load per account, several onboarding/gamification modals stack up (tour → Day-Zero welcome → tier level-up → daily tip). Dismiss them to reach the grid; dismissal is persisted in `localStorage` keyed by account username.

### Edge function
`supabase/functions/send-leave-invite` is deployed via GitHub Actions on push to `supabase/functions/**` (see `.github/workflows/deploy-functions.yml`); it is not part of local dev and needs the Supabase CLI + secrets to deploy manually.
