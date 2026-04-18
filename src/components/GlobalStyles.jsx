import React from 'react';

const NAV_H  = 56;
const SUB_H  = 48;
const TB_H   = 52;
const LG_H   = 36;
const ROW_H  = 104;
const HEADER_STICKY_TOP = NAV_H + SUB_H + TB_H + LG_H;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}

    @keyframes holiBounce{
      0%{transform:scale(1)}35%{transform:scale(1.08)}65%{transform:scale(0.95)}82%{transform:scale(1.03)}100%{transform:scale(1)}
    }
    .holi-tap .pill-card{animation:holiBounce 0.42s cubic-bezier(0.25,0.46,0.45,0.94) both;transform-origin:center center;}

    @keyframes emojiLabelPop{
      0%{transform:scale(1) rotate(0deg);}22%{transform:scale(1.45) rotate(-10deg);}
      48%{transform:scale(0.84) rotate(7deg);}68%{transform:scale(1.18) rotate(-4deg);}
      84%{transform:scale(0.97) rotate(1deg);}100%{transform:scale(1) rotate(0deg);}
    }
    .emoji-label-pop{
      animation:emojiLabelPop 0.65s cubic-bezier(0.34,1.46,0.64,1) both;
      transform-origin:center center;
      display:flex;flex-direction:column;align-items:center;gap:8px;
    }

    @keyframes avatarSnap{
      0%{transform:scale(1)}28%{transform:scale(1.55) rotate(10deg)}
      55%{transform:scale(0.87) rotate(-4deg)}78%{transform:scale(1.16) rotate(2deg)}
      92%{transform:scale(0.97)}100%{transform:scale(1) rotate(0deg)}
    }
    .avatar-snap{animation:avatarSnap 0.52s cubic-bezier(0.34,1.56,0.64,1) both;}

    @keyframes cellSnap{
      0%{transform:scale(1)}30%{transform:scale(1.12)}60%{transform:scale(0.94)}80%{transform:scale(1.04)}100%{transform:scale(1)}
    }
    .cell-snap{animation:cellSnap 0.38s cubic-bezier(0.34,1.56,0.64,1) both;}

    /* 问题4: 批量填入错落动画 */
    @keyframes cellStagger{
      0%  {opacity:0;transform:scale(0.75) translateY(4px);}
      60% {opacity:1;transform:scale(1.06) translateY(-1px);}
      100%{opacity:1;transform:scale(1)    translateY(0);}
    }
    .cell-stagger{
      animation:cellStagger 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* 问题3: 预览样式 — 渐变背景 + 呼吸发光轮廓，去掉虚线 */
    @keyframes previewBreath{
      0%,100%{box-shadow:0 0 0 1.5px rgba(0,155,255,0.45),0 0 6px rgba(119,11,255,0.18);}
      50%    {box-shadow:0 0 0 2.5px rgba(119,11,255,0.75),0 0 14px rgba(119,11,255,0.38);}
    }
    .sh.preview{
      background:linear-gradient(135deg,rgba(0,155,255,0.14),rgba(119,11,255,0.14)) !important;
      border:none !important;
      animation:previewBreath 1.1s ease-in-out infinite !important;
      opacity:1 !important;
    }

    /* 松手后保持高亮 */
    .sh.bulk-selected{
      background:linear-gradient(135deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2)) !important;
      border:none !important;
      box-shadow:0 0 0 2px rgba(119,11,255,0.55),0 0 10px rgba(119,11,255,0.18) !important;
    }

    @keyframes colGlowFade{
      0%{opacity:0;transform:scaleX(0.92);}12%{opacity:1;transform:scaleX(1);}
      65%{opacity:0.5;transform:scaleX(1);}85%{opacity:0.3;transform:scaleX(1.01);}100%{opacity:0;transform:scaleX(1);}
    }
    .col-glow-overlay{
      position:fixed;pointer-events:none;z-index:150;border-radius:10px;
      background:linear-gradient(180deg,rgba(0,229,255,0.055) 0%,rgba(0,155,255,0.07) 30%,rgba(119,11,255,0.07) 70%,rgba(119,11,255,0.04) 100%);
      box-shadow:inset 0 0 8px 2px rgba(0,155,255,0.32),inset 0 0 18px 4px rgba(119,11,255,0.20),inset 0 0 4px 1px rgba(0,229,255,0.28),0 0 10px 2px rgba(0,155,255,0.10),0 0 20px 5px rgba(119,11,255,0.07);
      animation:colGlowFade 1.8s cubic-bezier(0.22,0.61,0.36,1) both;will-change:opacity,transform;
    }

    @keyframes slideInFromRight{from{transform:translateX(52px);opacity:0.3;}to{transform:translateX(0);opacity:1;}}
    @keyframes slideInFromLeft{from{transform:translateX(-52px);opacity:0.3;}to{transform:translateX(0);opacity:1;}}
    .td-slide-right{animation:slideInFromRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both;}
    .td-slide-left {animation:slideInFromLeft  0.28s cubic-bezier(0.25,0.46,0.45,0.94) both;}

    @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}

    .glow-frame{position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0;
      box-shadow:inset 0 0 0px 0px rgba(0,155,255,0);will-change:opacity,box-shadow;transform:translateZ(0);}

    body{font-family:'Plus Jakarta Sans','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f5f7;color:#111827;-webkit-font-smoothing:antialiased;}
    .nav{height:${NAV_H}px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 28px;position:sticky;top:0;z-index:500}
    .nav-tab{height:${NAV_H}px;display:flex;align-items:center;padding:0 14px;font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;user-select:none}
    .nav-tab:hover{color:#111827}
    .nav-tab.active{color:transparent;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;border-image:linear-gradient(90deg,#009bff,#770bff) 1;font-weight:700}
    .nav-sep{width:1px;height:20px;background:#e5e7eb;margin:0 8px;flex-shrink:0}
    .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
    .save-txt{font-size:12px;color:#9ca3af;animation:pulse 1.2s infinite}
    .save-ok{font-size:12px;color:#22c55e;animation:fadeUp 0.2s ease}
    .stat-pill{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:100px;font-size:12px;font-weight:600;color:#374151;white-space:nowrap}
    .stat-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:pulseDot 2s ease-in-out infinite}
    .user-chip{display:flex;align-items:center;gap:8px;padding:4px 4px 4px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:100px}
    .user-name{font-size:12px;font-weight:600;color:#374151}
    .signout-btn{height:26px;padding:0 10px;border-radius:100px;border:none;background:#e5e7eb;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s}
    .signout-btn:hover{background:#d1d5db;color:#374151}
    .sub-header{height:${SUB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;position:sticky;top:${NAV_H}px;z-index:490}
    .page-title{font-size:22px;font-weight:800;font-family:'Plus Jakarta Sans',sans-serif;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:-0.03em;}
    .region-toggle{display:flex;background:#f3f4f6;border-radius:8px;padding:3px;gap:2px}
    .region-btn{height:28px;padding:0 14px;border-radius:6px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s}
    .region-btn.on{background:linear-gradient(90deg,#009bff,#770bff);color:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.15)}
    .region-btn.off{background:transparent;color:#9ca3af}
    .toolbar{height:${TB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;position:sticky;top:${NAV_H+SUB_H}px;z-index:480}
    .tb-btn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;font-weight:400;color:#374151;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center}
    .tb-btn:hover{background:#f9fafb;border-color:#d1d5db}
    .tb-btn.today{background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;font-weight:600;padding:0 16px}
    .tb-btn.today:hover{opacity:0.9}
    .tb-btn.icon{width:32px;padding:0;font-size:15px;color:#6b7280}
    .tb-select{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;color:#374151;cursor:pointer;appearance:none}
    .tb-month{font-size:15px;font-weight:600;color:#111827;letter-spacing:-0.01em}
    .legend{height:${LG_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:20px;position:sticky;top:${NAV_H+SUB_H+TB_H}px;z-index:470}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#9ca3af}
    .leg-sw{width:20px;height:10px;border-radius:4px}
    .tbl-outer{background:#f4f5f7;padding-bottom:48px;position:relative}
    .tbl-hdr-sticky{position:sticky;top:${HEADER_STICKY_TOP}px;z-index:460;background:#f4f5f7;border-bottom:1px solid #ebebeb}
    .tbl-hdr-row{display:grid;grid-template-columns:200px repeat(7,1fr);min-width:860px;padding:0 28px}
    .tbl-hdr-namecol{background:#f4f5f7}
    .tbl-hdr-daycol{padding:14px 4px 10px;text-align:center;background:#f4f5f7}
    .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 28px}
    .main-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:860px}
    .main-tbl td{padding:0;height:${ROW_H}px;vertical-align:top}
    .sticky-c{position:sticky;left:0;z-index:100;background:#f4f5f7;overflow:visible}
    .sticky-c::after{content:'';position:absolute;top:0;right:-16px;bottom:0;width:16px;background:linear-gradient(to right,rgba(0,0,0,0.04),transparent);pointer-events:none}
    .nw{height:${ROW_H}px;display:flex;align-items:center;gap:10px;padding:0 8px;border-bottom:1px solid #ebebeb;overflow:visible}
    tr:last-child .nw{border-bottom:none}
    .n-av-wrap{will-change:transform;transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),filter 0.3s ease;cursor:pointer;position:relative;}
    .n-av-wrap.is-me:hover{transform:scale(1.18) rotate(3deg);filter:drop-shadow(0 8px 16px rgba(119,11,255,0.22));}
    .n-av-wrap.is-me:active{transform:scale(0.92);}
    .n-name{font-size:13px;font-weight:400;color:#374151;transition:color 0.15s}
    .n-name.me{font-weight:600;color:#111827}
    tr:hover .n-name{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent}
    .n-you{font-size:8px;font-weight:700;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:0.06em;margin-top:1px}
    .emo-tag{position:absolute;bottom:-2px;right:-2px;background:#fff;border-radius:50%;width:17px;height:17px;display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 1px 4px rgba(0,0,0,0.12);border:1.5px solid #fff}
    .emo-picker{position:absolute;left:54px;top:4px;z-index:10050;background:#fff;border-radius:12px;display:flex;padding:8px;gap:4px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid #e5e7eb;animation:dropIn 0.15s ease}
    .dw{height:${ROW_H}px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 4px;border-bottom:1px solid #ebebeb}
    tr:last-child .dw{border-bottom:none}
    .sh{height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;transition:all 0.15s;user-select:none;border:none;cursor:pointer}
    .sh.mine{background:linear-gradient(135deg,#e8f0fe,#ede8fe);color:#374151}
    .sh.mine:hover{background:linear-gradient(135deg,#d2e3fc,#ddd6fe);box-shadow:0 4px 12px rgba(119,11,255,0.08);transform:scale(1.02)}
    .sh.set{cursor:grab}
    .sh.set:active{cursor:grabbing}
    .sh.set:hover{filter:brightness(0.97);transform:scale(1.01)}
    .sh.other{background:#fafafa;color:#d1d5db;border:1.5px solid #f3f4f6;cursor:default}
    .s-drop{position:absolute;top:42px;left:0;z-index:10001;background:#fff;border-radius:12px;width:200px;padding:6px;max-height:264px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.12);border:1px solid #e5e7eb;animation:dropIn 0.15s ease}
    .s-opt{padding:8px 10px;cursor:pointer;border-radius:8px;font-size:12px;display:flex;align-items:center;gap:10px;transition:background 0.1s}
    .s-opt:hover{background:#f9fafb}
    .s-opt-lbl{font-weight:400;color:#374151}
    td.ptd{height:1px;padding:0 4px;vertical-align:top;position:relative;}
    .pill{height:100%;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;cursor:pointer;user-select:none;overflow:hidden;}
    .pill-card{width:100%;flex:1;border-radius:10px;transition:box-shadow 0.2s,filter 0.2s;transform-origin:center center;will-change:transform;}
    .pill:hover .pill-card{filter:brightness(0.97)}
    .hol .pill-card{background:linear-gradient(180deg,#fdf2f8,#fce7f3);box-shadow:0 2px 8px rgba(236,72,153,0.12),0 1px 3px rgba(236,72,153,0.06)}
    .we  .pill-card{background:linear-gradient(180deg,#eff6ff,#dbeafe);box-shadow:0 2px 8px rgba(59,130,246,0.1),0 1px 3px rgba(59,130,246,0.06)}
    .pill:hover.hol .pill-card{box-shadow:0 8px 24px rgba(236,72,153,0.2)}
    .pill:hover.we  .pill-card{box-shadow:0 8px 24px rgba(59,130,246,0.16)}
    .plan-row{padding:9px 11px;margin-bottom:4px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:background 0.15s}
    .plan-row:hover{background:linear-gradient(90deg,#f0f9ff,#f5f0ff)}
    .plan-date{font-weight:600;font-size:12px;transition:color 0.15s}
    .plan-row:hover .plan-date{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent}
    .ms-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6}
    .ms-card{background:#fff;border-radius:2px;padding:44px;max-width:420px;width:90%;box-shadow:0 2px 6px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.04)}
    .ms-title{font-size:24px;font-weight:600;color:#201f1e;margin:0 0 6px}
    .ms-sub{font-size:13px;color:#605e5c;margin:0 0 24px}
    .ms-btn{width:100%;height:40px;background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;border-radius:2px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s}
    .ms-btn:hover{opacity:0.9}
    .ms-app-row{display:flex;align-items:center;gap:10px;margin-top:28px;padding-top:16px;border-top:1px solid #edebe9}
    .ms-app-icon{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#009bff,#770bff);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
    .ms-err{margin-top:14px;color:#a4262c;background:#fde7e9;padding:10px 14px;border-radius:2px;font-size:13px;border-left:3px solid #a4262c}
    @media(max-width:768px){.nav,.sub-header,.toolbar,.legend{padding-left:16px;padding-right:16px}.tbl-scroll,.tbl-hdr-row{padding-left:16px;padding-right:16px}}
  `}</style>
);

export default GlobalStyles;