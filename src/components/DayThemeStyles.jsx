import React from 'react';

// ── Pattern brand colors ──────────────────────────────────────
// Blue:     #009BFF
// Purple:   #770BFF
// Gradient: linear-gradient(90deg, #009BFF, #770BFF)

const NAV_H  = 80;
const TB_H   = 48;
const ROW_H  = 140;
const HEADER_STICKY_TOP = NAV_H + TB_H;

const DayThemeStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');

    /* ════════════════════════════════════════════
       DAY MODE — applied when body has .day-mode
    ════════════════════════════════════════════ */

    body.day-mode {
      font-family: 'Figtree', 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #F0F2F8 !important;
      color: #1A1830 !important;
      -webkit-font-smoothing: antialiased;
    }

    /* Kill night-only effects */
    body.day-mode::before,
    body.day-mode::after      { display: none !important; }
    body.day-mode .aurora-wrap { display: none !important; }
    body.day-mode .starfield   { display: none !important; }
    body.day-mode .glow-frame  { mix-blend-mode: multiply !important; }

    /* ── Soft background ── */
    body.day-mode .day-bg-layer {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 50% at 10% 0%,   rgba(0,155,255,0.08)  0%, transparent 55%),
        radial-gradient(ellipse 55% 45% at 92% 8%,   rgba(119,11,255,0.06) 0%, transparent 50%),
        radial-gradient(ellipse 50% 60% at 80% 95%,  rgba(0,155,255,0.05)  0%, transparent 55%),
        linear-gradient(160deg, #EEF1FA 0%, #F0F2F8 50%, #EBEEf8 100%);
    }

   /* ── Nav ── */
    body.day-mode .nav {
      background: rgba(255,255,255,0.94) !important;
    }
    /* All nav buttons — force white bg */
    body.day-mode .nav button:not(.signout-btn):not(.theme-toggle-btn) {
      background: #ffffff !important;
      border-color: rgba(0,155,255,0.18) !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
    }
    body.day-mode .nav button:not(.signout-btn):not(.theme-toggle-btn):hover {
      background: #f5f8ff !important;
      border-color: rgba(0,155,255,0.35) !important;
      box-shadow: 0 3px 10px rgba(0,155,255,0.12) !important;
    }
    body.day-mode .nav {
      background: rgba(255,255,255,0.94) !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      border-bottom: 1px solid rgba(0,155,255,0.12) !important;
      box-shadow: 0 1px 0 rgba(119,11,255,0.06), 0 2px 12px rgba(0,155,255,0.07) !important;
    }
    /* Logo — same Pattern gradient shimmer */
    body.day-mode .nav-logo-text {
      background: linear-gradient(90deg, #009bff 0%, #5b21b6 30%, #770bff 50%, #a78bfa 70%, #009bff 100%) !important;
      background-size: 200% auto !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      animation: logoIdleDrift 6s linear infinite !important;
    }
    body.day-mode .nav-tab {
      color: rgba(26,24,48,0.45) !important;
      height: ${NAV_H}px !important;
    }
    body.day-mode .nav-tab:hover { color: #1A1830 !important; }
    body.day-mode .nav-tab.active {
      color: #1A1830 !important;
      font-weight: 700 !important;
      text-shadow: none !important;
      border-bottom: 2px solid transparent !important;
      border-image: linear-gradient(90deg,#009bff,#770bff) 1 !important;
    }
    body.day-mode .nav-sep {
      background: rgba(0,155,255,0.15) !important;
    }

    /* ── Hub buttons — day ── */
    body.day-mode .nav-right > div:first-child button {
      border-color: rgba(119,11,255,0.18) !important;
      background: rgba(255,255,255,0.85) !important;
      backdrop-filter: blur(8px) !important;
    }
    body.day-mode .nav-right > div:first-child button:hover {
      background: rgba(255,255,255,1) !important;
      box-shadow: 0 4px 16px rgba(0,155,255,0.15), 0 2px 6px rgba(119,11,255,0.1) !important;
    }

    /* ── Online pill — day ── */
    body.day-mode .online-pill {
      background: rgba(255,255,255,0.8) !important;
      border-color: rgba(0,155,255,0.15) !important;
    }
    body.day-mode .online-live-count {
      color: rgba(26,24,48,0.45) !important;
    }
    body.day-mode .user-chip {
      background: rgba(237,232,255,0.92) !important;
      border: 1.5px solid rgba(119,11,255,0.28) !important;
      box-shadow: 0 1px 8px rgba(119,11,255,0.12), 0 1px 3px rgba(0,0,0,0.07) !important;
    }
    body.day-mode .user-chip:hover {
      background: rgba(228,220,255,0.98) !important;
      border-color: rgba(119,11,255,0.45) !important;
      box-shadow: 0 2px 14px rgba(119,11,255,0.18), 0 2px 5px rgba(0,0,0,0.08) !important;
    }
    /* caret ▾ */
    body.day-mode .user-chip-caret { color: rgba(26,24,48,0.45) !important; }
    body.day-mode .user-name { color: #1A1830 !important; }
    body.day-mode .signout-btn {
      background: rgba(0,155,255,0.08) !important;
      color: rgba(26,24,48,0.6) !important;
    }
    body.day-mode .signout-btn:hover {
      background: linear-gradient(135deg, rgba(0,155,255,0.15), rgba(119,11,255,0.12)) !important;
      color: #1A1830 !important;
    }
    /* StreakDropdown sign-out button in day mode */
    body.day-mode .streak-signout {
      color: rgba(26,24,48,0.5) !important;
    }
    body.day-mode .streak-signout:hover {
      color: rgba(26,24,48,0.85) !important;
      background: rgba(119,11,255,0.07) !important;
    }

    /* ── Toolbar ── */
    body.day-mode .toolbar {
      background: rgba(248,249,254,0.97) !important;
      backdrop-filter: blur(12px) !important;
      border-bottom: 1px solid rgba(0,155,255,0.1) !important;
      box-shadow: 0 1px 0 rgba(119,11,255,0.06), 0 2px 8px rgba(0,0,0,0.04) !important;
    }
    body.day-mode .tb-btn {
      border-color: rgba(119,11,255,0.15) !important;
      background: rgba(255,255,255,0.85) !important;
      color: rgba(26,24,48,0.65) !important;
    }
    body.day-mode .tb-btn:hover {
      background: rgba(0,155,255,0.07) !important;
      border-color: rgba(0,155,255,0.3) !important;
      color: #009bff !important;
    }
    body.day-mode .tb-btn.today {
      background: linear-gradient(90deg,#009bff,#770bff) !important;
      color: #fff !important;
      border: none !important;
      box-shadow: 0 2px 10px rgba(0,155,255,0.25), 0 1px 4px rgba(119,11,255,0.2) !important;
    }
    body.day-mode .tb-btn.today:hover { opacity: 0.9 !important; }
    body.day-mode .tb-select {
      border-color: rgba(119,11,255,0.15) !important;
      background: rgba(255,255,255,0.85) !important;
      color: rgba(26,24,48,0.65) !important;
    }
    body.day-mode .tb-month { color: #1A1830 !important; font-weight: 700 !important; }
 body.day-mode .leg-item { color: rgba(26,24,48,0.65) !important; }
   body.day-mode .leg-dot { opacity: 1 !important; filter: none !important; }
    body.day-mode .team-summary {
      background: linear-gradient(90deg, rgba(0,155,255,0.07), rgba(119,11,255,0.07)) !important;
      border-color: rgba(119,11,255,0.18) !important;
      color: #770bff !important;
    }
    body.day-mode .team-summary-dot {
      background: linear-gradient(135deg,#009bff,#770bff) !important;
    }

    /* ── Table card ── */
    body.day-mode .tbl-card {
      background: #fff !important;
      border: 1px solid rgba(0,155,255,0.1) !important;
      box-shadow:
        0 12px 40px rgba(0,155,255,0.06),
        0 4px 12px rgba(119,11,255,0.04),
        0 1px 3px rgba(0,0,0,0.05) !important;
      backdrop-filter: none !important;
    }
    body.day-mode .tbl-hdr-sticky {
      background: rgba(248,249,254,0.98) !important;
      border-bottom: 1px solid rgba(0,155,255,0.1) !important;
      box-shadow: 0 2px 8px rgba(0,155,255,0.06) !important;
      backdrop-filter: blur(12px) !important;
    }
    /* Day name text */
    body.day-mode .tbl-hdr-daycol div:first-child {
      color: rgba(26,24,48,0.55) !important;
    }
    /* Today circle — white text on gradient bg stays readable */
    body.day-mode .tbl-hdr-daycol div div {
      color: rgba(26,24,48,0.75) !important;
    }
    /* Today circle override — keep white text on the gradient pill */
    body.day-mode .tbl-hdr-daycol div div[style*="linear-gradient"] {
      color: #ffffff !important;
    }
    /* Non-today date numbers */
    body.day-mode .tbl-hdr-daycol div div[style*="transparent"] {
      color: rgba(26,24,48,0.8) !important;
    }
    body.day-mode .section-title { color: rgba(26,24,48,0.4) !important; }
    body.day-mode .section-title-hint { color: rgba(26,24,48,0.3) !important; }

    /* ── Name column ── */
    body.day-mode .nw {
      background: rgba(248,249,255,0.95) !important;
      border-bottom-color: rgba(0,155,255,0.07) !important;
    }
    body.day-mode tr:last-child .nw { border-bottom: none !important; }
    body.day-mode tr:hover .nw { background: rgba(0,155,255,0.05) !important; }
    body.day-mode tr:hover .dw { background: rgba(0,155,255,0.025) !important; }
   body.day-mode .sticky-c::after {
      background: linear-gradient(to right, rgba(248,249,255,0.9), transparent) !important;
    }
    body.day-mode td.sticky-c {
      background: rgba(248,249,255,0.95) !important;
    }
    body.day-mode .dw {
      border-bottom-color: rgba(0,155,255,0.07) !important;
    }

    /* ── Name text ── */
    body.day-mode .n-name { color: #1A1830 !important; }
    body.day-mode .n-name.me { color: #1A1830 !important; font-weight: 700 !important; }
    body.day-mode tr:hover .n-name {
      background: linear-gradient(90deg,#009bff,#770bff) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
    body.day-mode .n-you {
      background: linear-gradient(90deg,#009bff,#770bff) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
    }
    body.day-mode .n-title { color: rgba(26,24,48,0.45) !important; }

    /* ── Avatar — day ── */
    body.day-mode .n-av-wrap.is-me {
      box-shadow:
        0 0 0 2.5px rgba(0,155,255,0.3),
        0 0 12px 4px rgba(119,11,255,0.1),
        0 0 24px 6px rgba(0,155,255,0.07) !important;
    }
    body.day-mode .n-av-wrap.is-me::before {
      background: conic-gradient(from 0deg, #009bff, #770bff, #00e5ff, #a78bfa, #009bff) !important;
    }
    body.day-mode .n-av-wrap.is-other:hover {
      box-shadow:
        0 0 0 2px rgba(0,155,255,0.35),
        0 0 10px 3px rgba(119,11,255,0.1) !important;
    }
    body.day-mode .bday-avatar-glow {
      box-shadow:
        0 0 0 3px rgba(255,143,176,0.76),
        0 0 18px 7px rgba(244,114,182,0.34),
        0 0 34px 12px rgba(255,0,120,0.12) !important;
      filter: drop-shadow(0 8px 18px rgba(244,114,182,0.16)) !important;
    }
    body.day-mode .bday-avatar-glow::after {
      background: radial-gradient(circle, rgba(244,114,182,0.24) 0%, rgba(255,143,176,0.13) 45%, transparent 72%) !important;
    }
body.day-mode .sh.mine {
      background: linear-gradient(135deg, rgba(0,155,255,0.08), rgba(119,11,255,0.06)) !important;
      border: 1.5px solid rgba(119,11,255,0.18) !important;
      color: rgba(26,24,48,0.38) !important;
    }
    body.day-mode .sh.mine:hover {
      background: linear-gradient(135deg, rgba(0,155,255,0.13), rgba(119,11,255,0.1)) !important;
      border-color: rgba(119,11,255,0.3) !important;
      box-shadow: 0 3px 12px rgba(119,11,255,0.1) !important;
    }
  /* Empty cells — others */
    body.day-mode .sh.other:not(.set) {
      background: rgba(0,155,255,0.04) !important;
      border: 1px solid rgba(0,155,255,0.1) !important;
      color: rgba(26,24,48,0.22) !important;
    }

    /* Filled status cells — override inline rgba colors to be opaque on white bg */
    /* The JSON colors are rgba with low alpha — we make them opaque here */
    body.day-mode .sh.set {
      filter: none !important;
      opacity: 1 !important;
    }
    /* WFH purple */
    body.day-mode .sh.set[style*="167,139,250"] {
      background: rgba(147,119,230,0.35) !important;
      border-color: rgba(147,119,230,0.7) !important;
      color: rgba(80,50,160,1) !important;
    }
    /* AL/SL pink */
    body.day-mode .sh.set[style*="255,143,176"] {
      background: rgba(235,100,145,0.28) !important;
      border-color: rgba(235,100,145,0.7) !important;
      color: rgba(180,50,90,1) !important;
    }
    /* BT/BL/PL yellow */
    body.day-mode .sh.set[style*="255,225,74"] {
      background: rgba(220,175,0,0.22) !important;
      border-color: rgba(220,175,0,0.65) !important;
      color: rgba(140,100,0,1) !important;
    }
    /* OL teal */
    body.day-mode .sh.set[style*="0,229,168"] {
      background: rgba(0,180,130,0.25) !important;
      border-color: rgba(0,180,130,0.65) !important;
      color: rgba(0,110,80,1) !important;
    }
    /* ML cyan */
    body.day-mode .sh.set[style*="122,255,212"] {
      background: rgba(0,200,160,0.22) !important;
      border-color: rgba(0,200,160,0.6) !important;
      color: rgba(0,120,90,1) !important;
    }
    /* DV blue */
    body.day-mode .sh.set[style*="0,155,255"] {
      background: rgba(0,130,230,0.22) !important;
      border-color: rgba(0,130,230,0.6) !important;
      color: rgba(0,80,160,1) !important;
    }
    body.day-mode .sh.set:hover {
      filter: brightness(0.95) !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }

    /* ── Pills (weekend / holiday) — day ── */
body.day-mode .hol .pill-card {
      background: linear-gradient(160deg, rgba(255,0,120,0.18), rgba(180,0,255,0.14)) !important;
      border: 2px solid rgba(255,0,150,0.55) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 16px rgba(255,0,120,0.16) !important;
    }
body.day-mode .we .pill-card {
      background: linear-gradient(160deg, rgba(0,155,255,0.16), rgba(100,0,255,0.13)) !important;
      border: 2px solid rgba(0,155,255,0.55) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 16px rgba(0,155,255,0.18) !important;
    }
    body.day-mode .pill:hover.hol .pill-card {
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.8),
        0 0 28px rgba(119,11,255,0.28),
        0 0 56px rgba(168,85,247,0.16) !important;
      filter: saturate(1.5) brightness(1.04) !important;
      transition: filter 0.15s, box-shadow 0.25s !important;
    }
    body.day-mode .pill:hover.we .pill-card {
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.8),
        0 0 28px rgba(0,155,255,0.28),
        0 0 56px rgba(0,155,255,0.15) !important;
      filter: saturate(1.5) brightness(1.04) !important;
      transition: filter 0.15s, box-shadow 0.25s !important;
    }
  /* Click glow — day: gradient frame wrap */
    body.day-mode .col-glow-overlay {
      background: linear-gradient(180deg,
        rgba(0,155,255,0.09) 0%,
        rgba(0,155,255,0.12) 30%,
        rgba(119,11,255,0.12) 70%,
        rgba(119,11,255,0.07) 100%) !important;
      box-shadow:
        inset 0 0 0 2px rgba(0,155,255,0.35),
        inset 0 0 12px 3px rgba(0,155,255,0.2),
        inset 0 0 24px 6px rgba(119,11,255,0.12) !important;
      border-radius: 14px !important;
    }
    /* ── Status dropdown ── */
    body.day-mode .s-drop {
      background: rgba(255,255,255,0.98) !important;
      border-color: rgba(0,155,255,0.15) !important;
      box-shadow: 0 8px 32px rgba(0,155,255,0.1), 0 2px 8px rgba(119,11,255,0.06) !important;
      backdrop-filter: blur(16px) !important;
    }
    body.day-mode .s-opt:hover {
      background: linear-gradient(135deg, rgba(0,155,255,0.07), rgba(119,11,255,0.07)) !important;
    }
   body.day-mode .s-opt-label { color: #1A1830 !important; }

   /* Holiday Planner — date text white */
    body.day-mode .plan-date { color: rgba(232,229,255,0.85) !important; }
    body.day-mode .plan-name { color: rgba(232,229,255,0.45) !important; }

    /* ── Team Today button — day ── */
    body.day-mode .team-today-btn {
      background: rgba(255,255,255,0.85) !important;
      border-color: rgba(0,155,255,0.2) !important;
      color: rgba(26,24,48,0.65) !important;
    }
    body.day-mode .team-today-btn:hover {
      background: rgba(0,155,255,0.07) !important;
      border-color: rgba(0,155,255,0.35) !important;
      color: #009bff !important;
    }

    /* ── Emoji picker ── */
    body.day-mode .emo-picker {
      background: rgba(255,255,255,0.97) !important;
      border-color: rgba(0,155,255,0.15) !important;
      box-shadow: 0 8px 28px rgba(0,155,255,0.1) !important;
    }

    /* ── Bday toast ── */
    body.day-mode .bday-toast {
      background: linear-gradient(135deg, rgba(255,255,255,0.97), rgba(248,249,254,0.97)) !important;
      border-color: rgba(0,155,255,0.2) !important;
      box-shadow: 0 12px 32px rgba(0,155,255,0.12), 0 4px 8px rgba(119,11,255,0.06) !important;
      color: #1A1830 !important;
    }
    body.day-mode .bday-toast span:last-child { color: #1A1830 !important; }

    /* ── Panels (weekly, bday) ── */
    body.day-mode .dsz[style*="position:fixed"] {
      background: rgba(255,255,255,0.97) !important;
      border-color: rgba(0,155,255,0.15) !important;
      box-shadow: 0 20px 56px rgba(0,155,255,0.1), 0 4px 12px rgba(119,11,255,0.06) !important;
    }

    /* ── Save status ── */
    body.day-mode .save-txt { color: rgba(26,24,48,0.4) !important; }
    body.day-mode .save-ok  { color: #009bff !important; }

  /* ── Header day col ── */
    body.day-mode .tbl-hdr-daycol { color: rgba(26,24,48,0.72) !important; }
    body.day-mode .tbl-hdr-daycol div { color: rgba(26,24,48,0.65) !important; }
    body.day-mode .tbl-hdr-daycol .bday-hdr-tip { color: #fff !important; }
    body.day-mode .tbl-hdr-daycol .hol-pip-tip  { color: #fff !important; }
    body.day-mode .hol-pip-tip { color: #fff !important; }

    /* ── APAC toggle pill — day mode ── */
    body.day-mode .apac-toggle-track {
      background: rgba(0,0,0,0.08) !important;
      border-color: rgba(0,0,0,0.18) !important;
    }
    body.day-mode .apac-toggle-track.apac-toggle-on {
      background: rgba(0,155,255,0.85) !important;
      border-color: rgba(0,155,255,0.9) !important;
    }
    body.day-mode .apac-toggle-thumb {
      background: rgba(80,80,100,0.55) !important;
    }
    body.day-mode .apac-toggle-track.apac-toggle-on .apac-toggle-thumb {
      background: #fff !important;
    }

  /* ── Theme toggle button — shared styles ── */
    .theme-toggle-btn {
      display: flex; align-items: center; gap: 7px;
      height: 34px; padding: 0 13px;
      border-radius: 100px;
      border: 1.5px solid rgba(167,139,250,0.3);
      background: rgba(255,255,255,0.08);
      cursor: pointer;
      font-size: 11px; font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: rgba(232,229,255,0.7);
      transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
      white-space: nowrap;
      backdrop-filter: blur(8px);
      letter-spacing: 0.04em;
    }
    .theme-toggle-btn:hover {
      transform: scale(1.04);
      border-color: rgba(167,139,250,0.55);
      color: #fff;
      background: rgba(255,255,255,0.13);
    }
    .theme-toggle-btn:active { transform: scale(0.96); }

   /* Day mode variant — clean white pill */
    body.day-mode .theme-toggle-btn {
      border: 1.5px solid rgba(0,155,255,0.22) !important;
      background: #ffffff !important;
      color: rgba(26,24,48,0.6) !important;
      box-shadow: 0 1px 4px rgba(0,155,255,0.1), 0 1px 2px rgba(0,0,0,0.05) !important;
    }
    body.day-mode .theme-toggle-btn:hover {
      border-color: rgba(0,155,255,0.4) !important;
      color: #009bff !important;
      background: #ffffff !important;
      box-shadow: 0 2px 10px rgba(0,155,255,0.15) !important;
      transform: scale(1.04) !important;
    }
    /* Hub buttons day — light with subtle border */
    body.day-mode .nav-right > div:first-child button {
      background: #ffffff !important;
      border-color: rgba(0,155,255,0.18) !important;
      box-shadow: 0 1px 4px rgba(0,155,255,0.08), 0 1px 2px rgba(0,0,0,0.04) !important;
    }
    body.day-mode .nav-right > div:first-child button svg rect,
    body.day-mode .nav-right > div:first-child button svg circle,
    body.day-mode .nav-right > div:first-child button svg ellipse {
      opacity: 1 !important;
    }

    /* Toggle track */
    .theme-track {
      position: relative;
      width: 32px; height: 18px;
      border-radius: 100px;
      background: rgba(167,139,250,0.2);
      border: 1px solid rgba(167,139,250,0.3);
      transition: background 0.25s, border-color 0.25s;
      flex-shrink: 0;
    }
    .theme-track.day {
      background: linear-gradient(90deg, rgba(0,155,255,0.25), rgba(119,11,255,0.2));
      border-color: rgba(0,155,255,0.35);
    }
    .theme-thumb {
      position: absolute;
      top: 2px; left: 2px;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: linear-gradient(135deg, #009bff, #770bff);
      box-shadow: 0 1px 4px rgba(0,155,255,0.4);
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .theme-track.day .theme-thumb {
      transform: translateX(14px);
    }

 /* ── Misc day overrides ── */
    body.day-mode .plan-row:hover { background: linear-gradient(135deg, rgba(0,155,255,0.06), rgba(119,11,255,0.05)) !important; }
    body.day-mode .plan-row:hover .plan-date {
      background: linear-gradient(90deg,#009bff,#770bff) !important;
      -webkit-background-clip: text !important; background-clip: text !important;
      color: transparent !important;
    }
   /* Holiday planner — force white on all text inside dark panel */
    body.day-mode [style*="rgba(13,10,35,0.96)"] .plan-date,
    body.day-mode [style*="rgba(13,10,35,0.96)"] .plan-date * { 
      color: rgba(232,229,255,0.9) !important;
      background: none !important;
      -webkit-text-fill-color: rgba(232,229,255,0.9) !important;
    }
    body.day-mode [style*="rgba(13,10,35,0.96)"] .plan-name {
      color: rgba(232,229,255,0.45) !important;
    }
    body.day-mode [style*="rgba(13,10,35,0.96)"] div[style*="color"] {
      color: #a78bfa !important;
    }
    /* Also target the header text */
    body.day-mode [style*="rgba(232,229,255,0.45)"] {
      color: rgba(232,229,255,0.45) !important;
    }

    body.day-mode .tb-select option { background: #fff !important; color: #1A1830 !important; }

    /* Sonar ring — day */
    body.day-mode .sonar-ring { border-color: rgba(0,155,255,0.4) !important; }

    /* Col glow overlay — day */
    body.day-mode .col-glow-overlay {
      background: linear-gradient(180deg,
        rgba(0,155,255,0.06) 0%,
        rgba(0,155,255,0.08) 30%,
        rgba(119,11,255,0.08) 70%,
        rgba(119,11,255,0.04) 100%) !important;
      box-shadow:
        inset 0 0 8px 2px rgba(0,155,255,0.2),
        inset 0 0 18px 4px rgba(119,11,255,0.12) !important;
    }

    /* Preview / bulk select — day */
    body.day-mode .sh.preview {
      background: linear-gradient(135deg, rgba(0,155,255,0.12), rgba(119,11,255,0.1)) !important;
    }
    body.day-mode .sh.bulk-selected {
      background: linear-gradient(135deg, rgba(0,155,255,0.16), rgba(119,11,255,0.14)) !important;
      box-shadow: 0 0 0 2px rgba(0,155,255,0.4) !important;
    }

    /* FORCE white text in holiday planner — highest specificity */
    body.day-mode .plan-row .plan-date,
    body.day-mode .plan-row .plan-date * {
      color: rgba(232,229,255,0.9) !important;
      -webkit-text-fill-color: rgba(232,229,255,0.9) !important;
    }
    body.day-mode .plan-row .plan-name {
      color: rgba(232,229,255,0.45) !important;
      -webkit-text-fill-color: rgba(232,229,255,0.45) !important;
    }
  `}</style>
);


export default DayThemeStyles;
