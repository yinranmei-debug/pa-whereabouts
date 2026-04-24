import React from 'react';

const NAV_H  = 72;
const TB_H   = 56;
const LG_H   = 40;
const ROW_H  = 110;
const HEADER_STICKY_TOP = NAV_H + TB_H + LG_H;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    body{font-family:'Plus Jakarta Sans','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#F0F4FF;color:#111827;-webkit-font-smoothing:antialiased;}

    /* ── Logo shimmer ── */
    .nav-logo-text{
      font-size:20px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;
      letter-spacing:-0.02em;margin-right:32px;
      background:linear-gradient(90deg,#009bff 0%,#5b21b6 30%,#770bff 50%,#a78bfa 70%,#009bff 100%);
      background-size:200% auto;
      -webkit-background-clip:text;background-clip:text;
      -webkit-text-fill-color:transparent;color:transparent;
      animation:logoIdleDrift 6s linear infinite;
    }
    .nav-logo-text:hover{
      animation:logoShimmer 0.6s linear forwards;
      filter:drop-shadow(0 0 8px rgba(0,155,255,0.5)) drop-shadow(0 0 16px rgba(119,11,255,0.35));
    }
    @keyframes logoIdleDrift{0%{background-position:0% center;}100%{background-position:200% center;}}
    @keyframes logoShimmer{0%{background-position:0% center;}100%{background-position:200% center;}}

    /* ── Glow frame ── */
    .glow-frame{position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0;box-shadow:none;will-change:opacity,box-shadow;transform:translateZ(0);}

    /* ── Nav ── */
    .nav{height:${NAV_H}px;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;padding:0 32px;position:sticky;top:0;z-index:500;box-shadow:0 2px 24px rgba(0,0,0,0.3);}
    .nav-tab{height:${NAV_H}px;display:flex;align-items:center;padding:0 16px;font-size:14px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.5);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;user-select:none;}
    .nav-tab:hover{color:rgba(255,255,255,0.9);}
    .nav-tab.active{color:#fff;font-weight:700;border-bottom:2px solid transparent;border-image:linear-gradient(90deg,#009bff,#770bff) 1;}
    .nav-sep{width:1px;height:24px;background:rgba(255,255,255,0.1);margin:0 12px;flex-shrink:0;}
    .nav-right{margin-left:auto;display:flex;align-items:center;gap:12px;}

    /* ── Planet button ── */
    @keyframes planetPulse{
      0%,100%{filter:drop-shadow(0 0 6px rgba(167,139,250,0.6)) drop-shadow(0 0 12px rgba(119,11,255,0.3));}
      50%{filter:drop-shadow(0 0 14px rgba(119,11,255,0.9)) drop-shadow(0 0 28px rgba(0,155,255,0.5));}
    }
    @keyframes ringOrbit{
      from{transform:rotateX(72deg) rotateZ(0deg);}
      to{transform:rotateX(72deg) rotateZ(360deg);}
    }
    .bulb-btn{
      position:relative;width:54px;height:30px;border-radius:100px;
      background:linear-gradient(135deg,#2d1b69 0%,#1e1b4b 50%,#0f172a 100%);
      border:1.5px solid rgba(167,139,250,0.45);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all 0.3s;
      animation:planetPulse 3s ease-in-out infinite;
      overflow:visible;
    }
    .bulb-btn::after{
      content:'';position:absolute;width:18px;height:18px;border-radius:50%;
      background:radial-gradient(circle at 35% 32%,#c4b5fd 0%,#8b5cf6 35%,#5b21b6 65%,#2e1065 100%);
      box-shadow:0 0 10px rgba(139,92,246,0.7),inset 0 -2px 4px rgba(0,0,0,0.4);
      pointer-events:none;
    }
    .bulb-btn::before{
      content:'';position:absolute;width:34px;height:10px;border-radius:50%;
      border:2.5px solid rgba(167,139,250,0.7);background:transparent;
      transform:rotateX(72deg);pointer-events:none;
      transition:border-color 0.3s,box-shadow 0.3s;
      box-shadow:0 0 8px rgba(167,139,250,0.4);
    }
    .bulb-btn:hover{transform:scale(1.1);border-color:rgba(196,181,253,0.7);}
    .bulb-btn:hover::before{border-color:rgba(99,179,255,0.95);box-shadow:0 0 14px rgba(0,155,255,0.7);animation:ringOrbit 1.4s linear infinite;}
    .bulb-btn:hover::after{box-shadow:0 0 18px rgba(139,92,246,0.95),inset 0 -2px 4px rgba(0,0,0,0.4);}

    /* ── Online / user chips ── */
    .online-pill{display:flex;align-items:center;gap:10px;padding:7px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:100px;}
    .online-stack{display:flex;align-items:center;}
    .online-av{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);margin-left:-7px;background:#334155;overflow:visible;flex-shrink:0;}
    .online-av:first-child{margin-left:0;}
    .online-count{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);margin-left:-7px;background:#334155;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;}
    .online-live-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulseDot 2s infinite;flex-shrink:0;}
    .online-live-count{font-size:10px;color:rgba(255,255,255,0.4);font-weight:500;margin-top:1px;}
    .user-chip{display:flex;align-items:center;gap:8px;padding:5px 5px 5px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:100px;}
    .user-name{font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);}
    .signout-btn{height:28px;padding:0 12px;border-radius:100px;border:none;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;}
    .signout-btn:hover{background:rgba(255,255,255,0.2);color:#fff;}
    .save-txt{font-size:12px;color:rgba(255,255,255,0.45);animation:pulse 1.2s infinite;}
    .save-ok{font-size:12px;color:#4ade80;animation:fadeUp 0.2s ease;}

    /* ── Toolbar ── */
    .toolbar{height:${TB_H}px;padding:0 32px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;position:sticky;top:${NAV_H}px;z-index:480;}
    .tb-btn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;font-weight:400;color:#374151;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
    .tb-btn:hover{background:#f9fafb;border-color:#d1d5db;}
    .tb-btn.icon{width:32px;padding:0;font-size:15px;color:#6b7280;}
    .tb-select{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;color:#374151;cursor:pointer;appearance:none;font-family:'Plus Jakarta Sans',sans-serif;}
    .tb-month{font-size:15px;font-weight:700;color:#111827;letter-spacing:-0.01em;}
    .team-summary{display:flex;align-items:center;gap:8px;margin-left:auto;padding:7px 16px;background:linear-gradient(90deg,rgba(0,155,255,0.07),rgba(119,11,255,0.07));border:1.5px solid rgba(119,11,255,0.14);border-radius:100px;font-size:11px;font-weight:700;color:#5b21b6;letter-spacing:0.02em;}
    .team-summary-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#009bff,#770bff);flex-shrink:0;animation:pulseDot 2s ease-in-out infinite;}

    .tb-btn.today{
      position:relative;overflow:hidden;
      background:linear-gradient(90deg,#009bff,#770bff) !important;
      color:#fff !important;border:none !important;
      font-weight:700;padding:0 16px;height:32px;font-size:13px;border-radius:8px;
    }
    .tb-btn.today:hover{opacity:0.88;}
    .tb-btn.today:active{transform:scale(0.93) translateY(1px);}
    .tb-btn.today::after{content:'';position:absolute;top:0;height:100%;width:44px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent);transform:skewX(-20deg);left:-150%;pointer-events:none;opacity:0;}
    .today-glint::after{opacity:1;animation:glint 0.55s ease-in-out;}
    @keyframes glint{0%{left:-150%;}100%{left:150%;}}

    /* ── Legend ── */
    .legend{height:${LG_H}px;padding:0 32px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:24px;position:sticky;top:${NAV_H+TB_H}px;z-index:470;}
    .leg-item{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:#6b7280;}
    .leg-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

    /* ── Table ── */
    .tbl-outer{background:#F0F4FF;padding:24px 24px 48px;position:relative;}
    .tbl-card{background:#fff;border-radius:20px;border:1px solid rgba(226,232,240,0.8);box-shadow:0 4px 24px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.03);position:relative;}
    .tbl-hdr-sticky{position:sticky;top:${HEADER_STICKY_TOP}px;z-index:460;background:#fafbff;border-bottom:1px solid #e5e7eb;border-radius:20px 20px 0 0;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .tbl-hdr-row{display:grid;grid-template-columns:220px repeat(7,1fr);min-width:900px;padding:0 24px;}
    .tbl-hdr-namecol{background:transparent;}
    .tbl-hdr-daycol{padding:16px 4px 12px;text-align:center;background:transparent;}
    .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 24px 24px;}
    .main-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:900px;}
    .main-tbl td{padding:0;height:${ROW_H}px;vertical-align:top;}
    .sticky-c{position:sticky;left:0;z-index:100;background:#fff;overflow:visible;}
    .sticky-c::after{content:'';position:absolute;top:0;right:-16px;bottom:0;width:16px;background:linear-gradient(to right,rgba(0,0,0,0.04),transparent);pointer-events:none;}
    .nw{height:${ROW_H}px;display:flex;align-items:center;gap:12px;padding:0 10px;border-bottom:1px solid #f1f5f9;overflow:visible;}
    tr:last-child .nw{border-bottom:none;}
    .dw{height:${ROW_H}px;display:flex;flex-direction:column;justify-content:center;gap:7px;padding:0 6px;border-bottom:1px solid #f1f5f9;}
    tr:last-child .dw{border-bottom:none;}

    /* ── Avatar ── */
    .n-av-wrap{will-change:transform;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),filter 0.3s ease;cursor:pointer;position:relative;}
    .n-av-wrap.is-me{
      border-radius:50%;
      box-shadow:0 0 0 2.5px rgba(0,155,255,0.35),0 0 12px 4px rgba(119,11,255,0.25),0 0 24px 6px rgba(0,155,255,0.12);
      transition:box-shadow 0.4s ease,transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .n-av-wrap.is-me::before{
      content:'';position:absolute;inset:-3px;border-radius:50%;
      background:conic-gradient(from 0deg,#009bff,#770bff,#00e5ff,#a78bfa,#009bff);
      z-index:-1;opacity:0;transition:opacity 0.3s ease;animation:avatarRingSpin 2s linear infinite;
    }
    .n-av-wrap.is-me:hover::before{opacity:1;}
    .n-av-wrap.is-me:hover{transform:scale(1.18) rotate(3deg);box-shadow:0 0 0 2.5px transparent,0 0 20px 8px rgba(119,11,255,0.4),0 0 40px 12px rgba(0,155,255,0.2);filter:drop-shadow(0 8px 16px rgba(119,11,255,0.22));}
    .n-av-wrap.is-me:active{transform:scale(0.92);}
    .n-av-wrap.is-other{border-radius:50%;transition:box-shadow 0.3s ease,transform 0.2s ease;}
    .n-av-wrap.is-other:hover{transform:scale(1.08) !important;box-shadow:0 0 0 2px rgba(167,139,250,0.5),0 0 10px 3px rgba(119,11,255,0.2),0 0 20px 6px rgba(0,155,255,0.1);}
    .n-av-wrap.is-other:active{transform:scale(0.95);}
    @keyframes avatarRingSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

    .n-name{font-size:15px;font-weight:500;color:#374151;transition:color 0.15s;}
    .n-name.me{font-weight:700;color:#111827;}
    tr:hover .n-name{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;}
    .n-you{font-size:9px;font-weight:700;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:0.06em;margin-top:2px;}
    .emo-tag{position:absolute;bottom:-6px;right:-6px;background:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:2px solid #fff;}
    .emo-picker{position:absolute;left:54px;top:4px;z-index:10050;background:#fff;border-radius:14px;display:flex;padding:8px;gap:4px;box-shadow:0 8px 32px rgba(0,0,0,0.1);border:1px solid #e5e7eb;animation:dropIn 0.15s ease;}

    /* ── Status cells ── */
    .sh{height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;transition:all 0.15s;user-select:none;border:none;cursor:pointer;gap:4px;}
    .sh-icon{font-size:18px;line-height:1;flex-shrink:0;}
    .sh.mine{background:linear-gradient(135deg,#EEF2FF,#F5F3FF);color:#6b7280;border:1px solid rgba(199,210,254,0.6);}
    .sh.mine:hover{background:linear-gradient(135deg,#dde5fe,#ede9fe);box-shadow:0 4px 12px rgba(119,11,255,0.1);transform:scale(1.02);}
    .sh.set{cursor:grab;}
    .sh.set:active{cursor:grabbing;}
    .sh.set:hover{filter:brightness(0.97);transform:scale(1.01);}
    .sh.other{background:#fafafa;color:#d1d5db;border:1px solid #f3f4f6;cursor:default;}
    .s-drop{position:absolute;top:46px;left:0;z-index:10001;background:#fff;border-radius:14px;width:180px;padding:6px;max-height:264px;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,0.1);border:1px solid #e5e7eb;animation:dropIn 0.15s ease;}
    .s-opt{padding:8px 10px;cursor:pointer;border-radius:10px;display:flex;align-items:center;gap:8px;transition:background 0.1s;}
    .s-opt:hover{background:linear-gradient(135deg,rgba(0,155,255,0.08),rgba(119,11,255,0.08));}
    .s-opt-icon{font-size:22px;line-height:1;flex-shrink:0;}
    .s-opt-label{font-size:12px;color:#374151;font-weight:500;}

    /* ── Preview / bulk ── */
    @keyframes previewBreath{
      0%,100%{box-shadow:0 0 0 1.5px rgba(0,155,255,0.45),0 0 6px rgba(119,11,255,0.18);}
      50%{box-shadow:0 0 0 2.5px rgba(119,11,255,0.75),0 0 14px rgba(119,11,255,0.38);}
    }
    .sh.preview{background:linear-gradient(135deg,rgba(0,155,255,0.14),rgba(119,11,255,0.14)) !important;border:none !important;animation:previewBreath 1.1s ease-in-out infinite !important;opacity:1 !important;}
    .sh.bulk-selected{background:linear-gradient(135deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2)) !important;border:none !important;box-shadow:0 0 0 2px rgba(119,11,255,0.55),0 0 10px rgba(119,11,255,0.18) !important;}

    /* ── Pills ── */
    td.ptd{height:1px;padding:0 6px;vertical-align:top;position:relative;overflow:hidden;}
    .pill{position:relative;height:100%;width:100%;cursor:pointer;user-select:none;overflow:hidden;border-radius:14px;isolation:isolate;}
    .pill-card{position:absolute;inset:0;border-radius:14px;transition:box-shadow 0.25s,transform 0.2s;will-change:transform;}
    .hol .pill-card{background:linear-gradient(160deg,rgba(251,207,232,0.75) 0%,rgba(221,214,254,0.65) 50%,rgba(196,181,253,0.55) 100%);border:1.5px solid rgba(217,70,239,0.25);box-shadow:inset 0 1px 0 rgba(255,255,255,0.7),0 2px 12px rgba(217,70,239,0.12);}
    .we  .pill-card{background:linear-gradient(160deg,rgba(199,210,254,0.75) 0%,rgba(196,181,253,0.65) 50%,rgba(167,139,250,0.55) 100%);border:1.5px solid rgba(139,92,246,0.25);box-shadow:inset 0 1px 0 rgba(255,255,255,0.7),0 2px 12px rgba(139,92,246,0.14);}
    .pill:hover.hol .pill-card{box-shadow:inset 0 1px 0 rgba(255,255,255,0.8),0 0 24px rgba(217,70,239,0.28),0 0 48px rgba(168,85,247,0.18);}
    .pill:hover.we  .pill-card{box-shadow:inset 0 1px 0 rgba(255,255,255,0.8),0 0 24px rgba(99,102,241,0.32),0 0 48px rgba(0,155,255,0.2);}

@keyframes pillHoverBounce{
      0%  {transform:translateY(0) scale(1);}
      18% {transform:translateY(-10px) scale(1.03);}
      34% {transform:translateY(0px) scale(0.98);}
      50% {transform:translateY(-6px) scale(1.02);}
      65% {transform:translateY(0px) scale(0.99);}
      78% {transform:translateY(-3px) scale(1.01);}
      100%{transform:translateY(0) scale(1);}
    }
    .pill-hover-bounce .pill-card{animation:pillHoverBounce 0.75s cubic-bezier(0.34,1.46,0.64,1) both;}

    @keyframes pillClickBounceY{
      0%{transform:scaleY(1) translateY(0);}20%{transform:scaleY(0.92) translateY(4px);}
      45%{transform:scaleY(1.06) translateY(-6px);}65%{transform:scaleY(0.97) translateY(2px);}
      82%{transform:scaleY(1.02) translateY(-2px);}100%{transform:scaleY(1) translateY(0);}
    }
    .pill.holi-tap .pill-card{animation:pillClickBounceY 0.48s cubic-bezier(0.34,1.56,0.64,1) forwards;transform-origin:center bottom;}

    /* ── Col glow ── */
    @keyframes colGlowFade{0%{opacity:0;transform:scaleX(0.92);}12%{opacity:1;transform:scaleX(1);}65%{opacity:0.5;}85%{opacity:0.3;}100%{opacity:0;}}
    .col-glow-overlay{position:fixed;pointer-events:none;z-index:150;border-radius:10px;background:linear-gradient(180deg,rgba(0,229,255,0.055) 0%,rgba(0,155,255,0.07) 30%,rgba(119,11,255,0.07) 70%,rgba(119,11,255,0.04) 100%);box-shadow:inset 0 0 8px 2px rgba(0,155,255,0.32),inset 0 0 18px 4px rgba(119,11,255,0.20);animation:colGlowFade 1.8s cubic-bezier(0.22,0.61,0.36,1) both;will-change:opacity,transform;}

    /* ── Sonar ── */
    .sonar-ring{position:absolute;border-radius:50%;border:2px solid rgba(119,11,255,0.5);pointer-events:none;}
    @keyframes sonarPulse{0%{transform:scale(1);opacity:0.7;}100%{transform:scale(2.4);opacity:0;}}
    .sonar-animate{animation:sonarPulse 1.4s ease-out forwards;}

    /* ── Animations ── */
    @keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}

    @keyframes slideInFromRight{from{transform:translateX(52px);opacity:0.3;}to{transform:translateX(0);opacity:1;}}
    @keyframes slideInFromLeft{from{transform:translateX(-52px);opacity:0.3;}to{transform:translateX(0);opacity:1;}}
    .td-slide-right{animation:slideInFromRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both;}
    .td-slide-left{animation:slideInFromLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both;}

    @keyframes tipSlideInRight{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}
    @keyframes tipSlideInLeft{from{opacity:0;transform:translateX(-60px);}to{opacity:1;transform:translateX(0);}}
    .tip-slide-in-right{animation:tipSlideInRight 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both;}
    .tip-slide-in-left{animation:tipSlideInLeft 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both;}

    @keyframes cellSnap{0%{transform:scale(1)}30%{transform:scale(1.12)}60%{transform:scale(0.94)}80%{transform:scale(1.04)}100%{transform:scale(1)}}
    .cell-snap{animation:cellSnap 0.38s cubic-bezier(0.34,1.56,0.64,1) both;}

    @keyframes cellStagger{0%{opacity:0;transform:scale(0.75) translateY(4px);}60%{opacity:1;transform:scale(1.06) translateY(-1px);}100%{opacity:1;transform:scale(1) translateY(0);}}
    .cell-stagger{animation:cellStagger 0.28s cubic-bezier(0.34,1.56,0.64,1) both;}

    @keyframes avatarSnap{
      0%{transform:scale(1)}28%{transform:scale(1.55) rotate(10deg)}
      55%{transform:scale(0.87) rotate(-4deg)}78%{transform:scale(1.16) rotate(2deg)}
      92%{transform:scale(0.97)}100%{transform:scale(1) rotate(0deg)}
    }
    .avatar-snap{animation:avatarSnap 0.52s cubic-bezier(0.34,1.56,0.64,1) both;}

    @keyframes emojiLabelPop{
      0%{transform:scale(1) rotate(0deg);}22%{transform:scale(1.45) rotate(-10deg);}
      48%{transform:scale(0.84) rotate(7deg);}68%{transform:scale(1.18) rotate(-4deg);}
      84%{transform:scale(0.97) rotate(1deg);}100%{transform:scale(1) rotate(0deg);}
    }
    .emoji-label-pop{animation:emojiLabelPop 0.65s cubic-bezier(0.34,1.46,0.64,1) both;transform-origin:center center;display:flex;flex-direction:column;align-items:center;gap:8px;}

    /* ── Holiday planner ── */
    .plan-row{padding:9px 12px;margin-bottom:3px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:all 0.15s;}
    .plan-row:hover{background:linear-gradient(135deg,rgba(0,155,255,0.08),rgba(119,11,255,0.08));}
    .plan-date{font-weight:600;font-size:12px;color:#374151;}
    .plan-row:hover .plan-date{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;}
    .plan-name{font-size:11px;font-weight:500;color:#9ca3af;}

    /* ── Login screen ── */
    .ms-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F0F4FF;}
    .ms-card{background:#fff;border-radius:20px;padding:44px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.08);border:1px solid rgba(226,232,240,0.8);}
    .ms-title{font-size:24px;font-weight:700;color:#111827;margin:0 0 6px;}
    .ms-sub{font-size:13px;color:#6b7280;margin:0 0 24px;}
    .ms-btn{width:100%;height:40px;background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s;}
    .ms-btn:hover{opacity:0.9;}
    .ms-app-row{display:flex;align-items:center;gap:10px;margin-top:28px;padding-top:16px;border-top:1px solid #f3f4f6;}
    .ms-app-icon{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#009bff,#770bff);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;}
    .ms-err{margin-top:14px;color:#a4262c;background:#fde7e9;padding:10px 14px;border-radius:8px;font-size:13px;border-left:3px solid #a4262c;}

    @media(max-width:768px){
      .nav,.toolbar,.legend{padding-left:12px;padding-right:12px;}
      .tbl-outer{padding:8px 8px 48px;}
      .nav-logo-text{font-size:15px;margin-right:8px;}
      .nav-tab{padding:0 8px;font-size:12px;}
      .online-pill{display:none;}
      .team-summary{display:none;}
      .tb-month{font-size:12px;}
      .toolbar{gap:4px;padding:0 12px;}
      .tb-btn{height:28px;font-size:11px;padding:0 8px;}
      .tb-select{height:28px;font-size:11px;padding:0 6px;max-width:80px;}
      .legend{gap:10px;padding:0 12px;}
      .leg-item{font-size:10px;}
      .user-name{display:none;}
      .signout-btn{font-size:10px;padding:0 8px;}
      .save-txt,.save-ok{display:none;}
    }
  `}</style>
);

export default GlobalStyles;