# pa-whereabouts — Claude Navigation Guide

## What this app does
A daily status board for a Pattern APAC team. Staff sign in via Microsoft (Azure AD), set their whereabouts status (office, WFH, leave, travel, etc.), and the board shows the whole team at a glance. Includes streak gamification, APAC holiday panel, birthday overlay, and a leave invite emailer.

## Tech stack
- **Frontend**: React (Vite), plain JSX, inline styles
- **Auth**: Azure AD via `@azure/msal-browser`
- **Backend**: Supabase (Postgres + realtime)
- **Email**: Brevo HTTP API via a Supabase Edge Function
- **Deploy**: Vercel (frontend), Supabase (edge functions)

## Key files

### Entry points
| File | Purpose |
|------|---------|
| `src/main.jsx` | App mount |
| `src/App.jsx` | Root component — all state lives here (auth, records, UI toggles) |
| `src/authConfig.js` | Azure AD Client ID, Tenant ID, redirect URI |

### Core components (`src/components/`)
| File | Purpose |
|------|---------|
| `LeaveInvitePrompt.jsx` | Floating card to send calendar invites when someone marks leave |
| `ApacHolidayPanel.jsx` | Dropdown showing JP/KR/CN public holidays |
| `Avatar.jsx` | Staff avatar with status badge |
| `BirthdayOverlay.jsx` | Birthday confetti overlay |
| `DayThemeStyles.jsx` | All day-mode CSS overrides |
| `GlobalStyles.jsx` | Base CSS injected globally |
| `TeamTodayPanel.jsx` | "Who's in today" side panel |
| `MobileView.jsx` | Entire mobile layout |
| `settlement/` | Streak gamification modals (LevelUpModal, DayZeroWelcome, StreakDropdown) |

### Data (`src/data/`)
| File | Purpose |
|------|---------|
| `staff.json` | Staff list (name, email, photo, birthday) |
| `status.json` | Status options and icons |
| `holidays.json` | HK public holidays (fallback if API fails) |
| `cnHolidays2026.js` | China 2026 holidays + 调休 (work-day swaps) — hardcoded because Nager.Date API doesn't include 调休 |

### Supabase
| Path | Purpose |
|------|---------|
| `supabase/functions/send-leave-invite/index.ts` | Edge function — builds ICS attachment, sends via Brevo API from `hr.apac@pattern.com` |

## Auth setup
Azure AD app registration required:
- **Redirect URI**: `https://pa-whereabouts.vercel.app/`
- **API permissions**: `User.Read`, `User.ReadBasic.All`
- IDs live in `src/authConfig.js` — changing them logs everyone out once

## Email (leave invites)
- Sender: `hr.apac@pattern.com` (must be a **verified sender** in Brevo dashboard)
- `BREVO_API_KEY` env var set in Supabase dashboard → Edge Functions → Secrets
- Deploy the edge function: `supabase functions deploy send-leave-invite`

## Supabase tables
- `statuses` — maps `user_id` → current status string
- `emotions` — optional emoji mood per user

## Dev
```bash
npm install
npm run dev        # Vite dev server on localhost:5173
```
Deploy edge function:
```bash
supabase functions deploy send-leave-invite
```
