import React from 'react';

const NAV_H  = 72;
const TB_H   = 56;
const LG_H   = 40;
const ROW_H  = 152;
const HEADER_STICKY_TOP = NAV_H + TB_H + LG_H;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600;700&display=swap');

    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    body{
      font-family:'Plus Jakarta Sans','Segoe UI',-apple-system,sans-serif;
      color:#e8e5ff;
      -webkit-font-smoothing:antialiased;
      background:#071836;
    }

    /* ── Cosmic background ── */
    body::before{
      content:'';
      position:fixed;inset:0;z-index:0;pointer-events:none;
      background:
        radial-gradient(ellipse 80% 60% at 15% 10%, rgba(0,155,255,0.38) 0%, transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 8%,  rgba(119,0,191,0.34) 0%, transparent 60%),
        radial-gradient(ellipse 55% 50% at 85% 55%, rgba(76,195,174,0.30) 0%, transparent 55%),
        radial-gradient(ellipse 65% 45% at 10% 75%, rgba(0,155,255,0.22) 0%, transparent 55%),
        radial-gradient(ellipse 70% 40% at 50% 100%,rgba(119,0,191,0.22) 0%, transparent 55%),
        linear-gradient(180deg,#071836 0%,#0A1F42 35%,#0D2440 70%,#08182F 100%);
    }
    body::after{
      content:'';
      position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:
        radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
      background-size:22px 22px;
      mask-image:linear-gradient(180deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.2) 100%);
    }

    /* ── Aurora ribbons ── */
    .aurora-wrap{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;mix-blend-mode:screen;}
    .aurora-1,.aurora-2,.aurora-3{position:absolute;border-radius:50%;filter:blur(60px);}
    .aurora-1{
      width:700px;height:300px;top:-80px;left:-100px;opacity:0.6;
      background:conic-gradient(from 0deg,#009bff,#7700bf,#4cc3ae,#009bff);
      animation:auroraRot1 28s linear infinite;
    }
    .aurora-2{
      width:600px;height:250px;top:20%;right:-120px;opacity:0.55;
      background:conic-gradient(from 120deg,#7700bf,#4cc3ae,#009bff,#7700bf);
      animation:auroraRot2 34s linear infinite reverse;
    }
    .aurora-3{
      width:500px;height:200px;bottom:10%;left:20%;opacity:0.5;
      background:conic-gradient(from 240deg,#4cc3ae,#009bff,#7700bf,#4cc3ae);
      animation:auroraRot3 40s linear infinite;
    }
    @keyframes auroraRot1{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes auroraRot2{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes auroraRot3{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

    /* ── Starfield ── */
    .starfield{position:fixed;inset:0;z-index:2;pointer-events:none;}

    /* ── Glow frame ── */
    .glow-frame{position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0;box-shadow:none;will-change:opacity,box-shadow;transform:translateZ(0);}

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

    /* ── Nav ── */
    .nav{
      height:${NAV_H}px;
      background:linear-gradient(135deg,rgba(7,24,54,0.92) 0%,rgba(13,10,35,0.95) 50%,rgba(7,24,54,0.92) 100%);
      backdrop-filter:blur(20px) saturate(140%);
      border-bottom:1px solid rgba(167,139,250,0.18);
      display:flex;align-items:center;padding:0 32px;
      position:sticky;top:0;z-index:500;
      box-shadow:0 2px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06);
    }
    .nav-tab{
      height:${NAV_H}px;display:flex;align-items:center;padding:0 16px;
      font-size:14px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;
      color:rgba(232,229,255,0.5);cursor:pointer;
      border-bottom:2px solid transparent;transition:all 0.15s;
      white-space:nowrap;user-select:none;
    }
    .nav-tab:hover{color:rgba(232,229,255,0.9);}
    .nav-tab.active{
      color:#fff;font-weight:700;
      border-bottom:2px solid transparent;
      border-image:linear-gradient(90deg,#009bff,#770bff) 1;
      text-shadow:0 0 12px rgba(119,11,255,0.45);
    }
    .nav-sep{width:1px;height:24px;background:rgba(167,139,250,0.2);margin:0 12px;flex-shrink:0;}
    .nav-right{margin-left:auto;display:flex;align-items:center;gap:12px;}

    /* ── Birthday nav chip ── */
    .bday-nav-chip{
      display:flex;align-items:center;gap:6px;
      padding:4px 12px;
      background:linear-gradient(135deg,rgba(255,183,0,0.15),rgba(255,143,176,0.12));
      border:1px solid rgba(255,183,0,0.35);
      border-radius:100px;font-size:12px;font-weight:600;
      color:rgba(255,220,100,0.95);
      animation:bdayChipPulse 2s ease-in-out infinite;
      white-space:nowrap;
    }
    @keyframes bdayChipPulse{
      0%,100%{box-shadow:0 0 0 0 rgba(255,183,0,0.3);}
      50%{box-shadow:0 0 12px 3px rgba(255,183,0,0.2);}
    }

    /* ── Planet button ── */
    @keyframes planetPulse{
      0%,100%{filter:drop-shadow(0 0 6px rgba(167,139,250,0.6)) drop-shadow(0 0 12px rgba(119,11,255,0.3));}
      50%{filter:drop-shadow(0 0 14px rgba(119,11,255,0.9)) drop-shadow(0 0 28px rgba(0,155,255,0.5));}
    }
    @keyframes ringOrbit{
      from{transform:rotate(0deg) scaleY(0.3);}
      to{transform:rotate(360deg) scaleY(0.3);}
    }
    .bulb-btn{
      position:relative;width:54px;height:30px;border-radius:100px;
      background:linear-gradient(135deg,#2d1b69 0%,#1e1b4b 50%,#0f172a 100%);
      border:1.5px solid rgba(167,139,250,0.45);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all 0.3s;
      animation:planetPulse 3s ease-in-out infinite;overflow:visible;
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
    .online-pill{
      display:flex;align-items:center;gap:10px;padding:7px 14px;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(167,139,250,0.18);border-radius:100px;
      backdrop-filter:blur(8px);
    }
    .online-stack{display:flex;align-items:center;}
    .online-av{width:28px;height:28px;border-radius:50%;border:2px solid rgba(167,139,250,0.3);margin-left:-7px;background:#1e1b4b;overflow:visible;flex-shrink:0;}
    .online-av:first-child{margin-left:0;}
    .online-count{width:28px;height:28px;border-radius:50%;border:2px solid rgba(167,139,250,0.3);margin-left:-7px;background:#1e1b4b;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;}
    .online-live-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulseDot 2s infinite;flex-shrink:0;}
    .online-live-count{font-size:10px;color:rgba(232,229,255,0.4);font-weight:500;margin-top:1px;}
    .user-chip{
      display:flex;align-items:center;gap:8px;padding:5px 5px 5px 14px;
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(167,139,250,0.18);border-radius:100px;
      backdrop-filter:blur(8px);
    }
    .user-name{font-size:13px;font-weight:600;color:rgba(232,229,255,0.85);}
    .signout-btn{height:28px;padding:0 12px;border-radius:100px;border:none;background:rgba(255,255,255,0.1);color:rgba(232,229,255,0.6);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;}
    .signout-btn:hover{background:rgba(255,255,255,0.2);color:#fff;}
    .save-txt{font-size:12px;color:rgba(232,229,255,0.45);animation:pulse 1.2s infinite;}
    .save-ok{font-size:12px;color:#4ade80;animation:fadeUp 0.2s ease;}

    /* ── Toolbar ── */
    .toolbar{
      height:${TB_H}px;padding:0 32px;
      background:linear-gradient(135deg,rgba(10,15,40,0.88) 0%,rgba(15,10,35,0.92) 100%);
      backdrop-filter:blur(16px) saturate(130%);
      border-bottom:1px solid rgba(167,139,250,0.14);
      display:flex;align-items:center;gap:8px;
      position:sticky;top:${NAV_H}px;z-index:480;
      box-shadow:0 2px 16px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .tb-btn{
      height:32px;padding:0 12px;border-radius:8px;
      border:1px solid rgba(167,139,250,0.2);
      background:rgba(255,255,255,0.05);
      font-size:13px;font-weight:500;color:rgba(232,229,255,0.7);
      cursor:pointer;transition:all 0.15s;
      display:flex;align-items:center;justify-content:center;
    }
    .tb-btn:hover{background:rgba(167,139,250,0.12);border-color:rgba(167,139,250,0.4);color:#fff;}
    .tb-btn.icon{width:32px;padding:0;font-size:15px;}
    .tb-select{
      height:32px;padding:0 12px;border-radius:8px;
      border:1px solid rgba(167,139,250,0.2);
      background:rgba(255,255,255,0.05);
      font-size:13px;color:rgba(232,229,255,0.7);
      cursor:pointer;appearance:none;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .tb-select option{background:#0f172a;color:#e8e5ff;}
    .tb-month{
      font-size:15px;font-weight:700;color:#fff;
      letter-spacing:-0.01em;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    .team-summary{
      display:flex;align-items:center;gap:8px;margin-left:auto;
      padding:7px 16px;
      background:linear-gradient(90deg,rgba(0,155,255,0.1),rgba(119,11,255,0.1));
      border:1.5px solid rgba(119,11,255,0.25);
      border-radius:100px;font-size:11px;font-weight:700;
      color:rgba(196,181,253,0.9);letter-spacing:0.02em;
    }
    .team-summary-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#009bff,#770bff);flex-shrink:0;animation:pulseDot 2s ease-in-out infinite;}

    .tb-btn.today{
      position:relative;overflow:hidden;
      background:linear-gradient(90deg,#009bff,#770bff) !important;
      color:#fff !important;border:none !important;
      font-weight:700;padding:0 16px;height:32px;font-size:13px;
      border-radius:100px;
      box-shadow:0 4px 16px rgba(119,11,255,0.35);
    }
    .tb-btn.today:hover{opacity:0.88;}
    .tb-btn.today:active{transform:scale(0.93) translateY(1px);}
    .tb-btn.today::after{content:'';position:absolute;top:0;height:100%;width:44px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent);transform:skewX(-20deg);left:-150%;pointer-events:none;opacity:0;}
    .today-glint::after{opacity:1;animation:glint 0.55s ease-in-out;}
    @keyframes glint{0%{left:-150%;}100%{left:150%;}}

    /* ── Legend ── */
    .legend{
      height:${LG_H}px;padding:0 32px;
      background:linear-gradient(135deg,rgba(10,15,40,0.82) 0%,rgba(15,10,35,0.86) 100%);
      backdrop-filter:blur(12px);
      border-bottom:1px solid rgba(167,139,250,0.1);
      display:flex;align-items:center;gap:24px;
      position:sticky;top:${NAV_H+TB_H}px;z-index:470;
    }
    .leg-item{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:500;color:rgba(232,229,255,0.55);}
    .leg-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}

    /* ── Table ── */
    .tbl-outer{
      background:transparent;
      padding:24px 24px 48px;position:relative;z-index:10;
    }
    .tbl-card{
      background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));
      border-radius:20px;
      border:1px solid rgba(167,139,250,0.18);
      box-shadow:0 20px 60px rgba(10,5,32,0.5),inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter:blur(20px) saturate(140%);
      position:relative;
    }
    .tbl-hdr-sticky{
      position:sticky;top:${HEADER_STICKY_TOP}px;z-index:460;
      background:rgba(10,15,40,0.85);
      backdrop-filter:blur(16px);
      border-bottom:1px solid rgba(167,139,250,0.15);
      border-radius:20px 20px 0 0;
    }
    .tbl-hdr-row{display:grid;grid-template-columns:220px repeat(7,1fr);min-width:900px;padding:0 24px;}
    .tbl-hdr-namecol{background:transparent;}
    .tbl-hdr-daycol{padding:16px 4px 12px;text-align:center;background:transparent;}
    .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 24px 24px;}
    .main-tbl{width:100%;border-collapse:collapse;table-layout:.main-tbl td{padding:0;height:${ROW_H}px;vertical-align:middle;}

    /* ── Sticky name col — light rows on dark card ── */
    .sticky-c{position:sticky;left:0;z-index:100;overflow:visible;}
   .sticky-c-bg{display:none;}
    .sticky-c::after{content:'';position:absolute;top:0;right:-16px;bottom:0;width:16px;background:linear-gradient(to right,rgba(10,15,40,0.12),transparent);pointer-events:none;}

    .nw{height:${ROW_H}px;display:flex;align-items:center;gap:12px;padding:0 10px;border-bottom:1px solid rgba(167,139,250,0.08);overflow:visible;background:rgba(8,12,35,0.96);}
    tr:last-child .nw{border-bottom:none;}
   .dw{height:${ROW_H}px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 6px;border-bottom:1px solid rgba(167,139,250,0.08);}
    tr:last-child .dw{border-bottom:none;}

    /* ── Row hover tint (spec: rgba(167,139,250,0.08)) ── */
    tr:hover .nw{background:rgba(20,15,55,0.98);}
    tr:hover .dw{background:rgba(167,139,250,0.04);}

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

    .n-name{font-size:14px;font-weight:600;color:rgba(232,229,255,0.9);transition:color 0.15s;}
    .n-name.me{font-weight:700;color:#fff;}
    tr:hover .n-name{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;}
   .n-you{font-size:9px;font-weight:700;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:0.06em;margin-top:2px;display:inline-block;}
    .n-title{font-size:10px;color:rgba(167,139,250,0.6);font-weight:500;margin-top:2px;letter-spacing:0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;}
    .emo-tag{position:absolute;bottom:-6px;right:-6px;background:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:2px solid #fff;}
    .emo-picker{
      position:absolute;left:54px;top:4px;z-index:10050;
      background:rgba(15,10,35,0.95);
      border-radius:14px;display:flex;padding:8px;gap:4px;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      border:1px solid rgba(167,139,250,0.25);
      animation:dropIn 0.15s ease;
      backdrop-filter:blur(16px);
    }

    /* ── Status cells ── */
    .sh{height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;transition:all 0.15s;user-select:none;border:none;cursor:pointer;gap:4px;}
    .sh-icon{font-size:18px;line-height:1;flex-shrink:0;}
    .sh.mine{background:linear-gradient(135deg,rgba(238,242,255,0.9),rgba(245,243,255,0.9));color:#6b7280;border:1px solid rgba(199,210,254,0.6);}
    .sh.mine:hover{background:linear-gradient(135deg,#dde5fe,#ede9fe);box-shadow:0 4px 12px rgba(119,11,255,0.1);transform:scale(1.02);}
    .sh.set{cursor:grab;}
    .sh.set:active{cursor:grabbing;}
    .sh.set:hover{filter:brightness(1.08);transform:scale(1.01);}
    .sh.other{background:rgba(255,255,255,0.06);color:rgba(167,139,250,0.3);border:1px solid rgba(167,139,250,0.1);cursor:default;}
    .s-drop{
      position:absolute;top:46px;left:0;z-index:10001;
      background:rgba(13,10,35,0.96);
      border-radius:14px;width:180px;padding:6px;max-height:264px;overflow-y:auto;
      box-shadow:0 8px 40px rgba(0,0,0,0.4);
      border:1px solid rgba(167,139,250,0.2);
      animation:dropIn 0.15s ease;
      backdrop-filter:blur(16px);
    }
    .s-opt{padding:8px 10px;cursor:pointer;border-radius:10px;display:flex;align-items:center;gap:8px;transition:background 0.1s;}
    .s-opt:hover{background:linear-gradient(135deg,rgba(0,155,255,0.12),rgba(119,11,255,0.12));}
    .s-opt-icon{font-size:22px;line-height:1;flex-shrink:0;}
    .s-opt-label{font-size:12px;color:rgba(232,229,255,0.85);font-weight:500;}

    /* ── Preview / bulk ── */
    @keyframes previewBreath{
      0%,100%{box-shadow:0 0 0 1.5px rgba(0,155,255,0.45),0 0 6px rgba(119,11,255,0.18);}
      50%{box-shadow:0 0 0 2.5px rgba(119,11,255,0.75),0 0 14px rgba(119,11,255,0.38);}
    }
    .sh.preview{background:linear-gradient(135deg,rgba(0,155,255,0.18),rgba(119,11,255,0.18)) !important;border:none !important;animation:previewBreath 1.1s ease-in-out infinite !important;opacity:1 !important;}
    .sh.bulk-selected{background:linear-gradient(135deg,rgba(0,155,255,0.25),rgba(119,11,255,0.25)) !important;border:none !important;box-shadow:0 0 0 2px rgba(119,11,255,0.55),0 0 10px rgba(119,11,255,0.2) !important;}

    /* ── Pills (dark tinted with glow borders) ── */
    td.ptd{height:1px;padding:0 6px;vertical-align:top;position:relative;overflow:visible;}
    .pill{position:relative;height:100%;width:100%;cursor:pointer;user-select:none;overflow:visible;border-radius:14px;isolation:isolate;}
    .pill-card{position:absolute;inset:0;border-radius:14px;transition:box-shadow 0.25s,transform 0.2s;will-change:transform;}
    .hol .pill-card{
      background:linear-gradient(160deg,rgba(90,10,50,0.7) 0%,rgba(60,10,60,0.65) 50%,rgba(80,20,80,0.6) 100%);
      border:1.5px solid rgba(217,70,239,0.35);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 2px 16px rgba(217,70,239,0.2);
    }
    .we .pill-card{
      background:linear-gradient(160deg,rgba(10,30,80,0.7) 0%,rgba(20,15,70,0.65) 50%,rgba(30,20,90,0.6) 100%);
      border:1.5px solid rgba(106,199,255,0.3);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 2px 16px rgba(106,199,255,0.15);
    }
    .pill:hover.hol .pill-card{box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 0 28px rgba(217,70,239,0.45),0 0 56px rgba(168,85,247,0.25);filter:saturate(1.6) brightness(1.15);transition:filter 0.15s,box-shadow 0.25s;}
    .pill:hover.we  .pill-card{box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),0 0 28px rgba(99,102,241,0.45),0 0 56px rgba(0,155,255,0.28);filter:saturate(1.6) brightness(1.15);transition:filter 0.15s,box-shadow 0.25s;}

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
    .col-glow-overlay{position:fixed;pointer-events:none;z-index:150;border-radius:10px;background:linear-gradient(180deg,rgba(0,229,255,0.07) 0%,rgba(0,155,255,0.09) 30%,rgba(119,11,255,0.09) 70%,rgba(119,11,255,0.05) 100%);box-shadow:inset 0 0 8px 2px rgba(0,155,255,0.35),inset 0 0 18px 4px rgba(119,11,255,0.22);animation:colGlowFade 1.8s cubic-bezier(0.22,0.61,0.36,1) both;will-change:opacity,transform;}

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

    @keyframes emojiVibeFloat{
      0%,100%{transform:translateY(0) rotate(0deg) scale(1);}
      20%{transform:translateY(-6px) rotate(-4deg) scale(1.08);}
      40%{transform:translateY(-2px) rotate(3deg) scale(1.04);}
      60%{transform:translateY(-8px) rotate(-2deg) scale(1.1);}
      80%{transform:translateY(-3px) rotate(4deg) scale(1.06);}
    }
    .pill-emoji-vibe{animation:emojiVibeFloat 2.4s ease-in-out infinite;cursor:pointer;}

    /* ── Holiday planner dropdown ── */
    .plan-row{padding:9px 12px;margin-bottom:3px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:all 0.15s;}
    .plan-row:hover{background:linear-gradient(135deg,rgba(0,155,255,0.1),rgba(119,11,255,0.1));}
    .plan-date{font-weight:600;font-size:12px;color:rgba(232,229,255,0.85);}
    .plan-row:hover .plan-date{background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;}
    .plan-name{font-size:11px;font-weight:500;color:rgba(232,229,255,0.45);}

    /* ── Birthday cake throw ── */
    @keyframes cakePromptPulse{
      0%,100%{transform:translateX(-50%) translateY(0) scale(1);box-shadow:0 4px 20px rgba(119,11,255,0.3);}
      50%{transform:translateX(-50%) translateY(-4px) scale(1.04);box-shadow:0 8px 32px rgba(119,11,255,0.55);}
    }
    @keyframes cakePromptArrow{
      0%,100%{transform:translateX(-50%) translateY(0);}
      50%{transform:translateX(-50%) translateY(5px);}
    }
    @keyframes cakePromptIn{
      from{opacity:0;transform:translateX(-50%) translateY(-12px) scale(0.88);}
      to{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}
    }
    @keyframes crownDrop{
      0%{opacity:0;transform:translate(-50%,-100%) scale(0.6) rotate(-15deg);}
      55%{transform:translate(-50%,-40%) scale(1.15) rotate(4deg);}
      75%{transform:translate(-50%,-55%) scale(0.95) rotate(-2deg);}
      100%{opacity:1;transform:translate(-50%,-60%) scale(1) rotate(0deg);}
    }
    @keyframes cakeSplat{
      0%{opacity:1;transform:translate(-50%,-50%) scale(0);}
      40%{transform:translate(-50%,-50%) scale(1.4);}
      70%{transform:translate(-50%,-50%) scale(0.9);}
      100%{opacity:0;transform:translate(-50%,-50%) scale(1.1);}
    }
    @keyframes bdayToastIn{
      0%{opacity:0;transform:translateX(110%);}
      60%{transform:translateX(-6%);}
      100%{opacity:1;transform:translateX(0);}
    }
    @keyframes bdayToastOut{
      from{opacity:1;transform:translateX(0);}
      to{opacity:0;transform:translateX(110%);}
    }
    .bday-crown{position:absolute;top:0;left:50%;animation:crownDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) both;font-size:22px;pointer-events:none;z-index:200;line-height:1;}
    .bday-splat{position:absolute;top:50%;left:50%;width:70px;height:70px;font-size:44px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:201;animation:cakeSplat 0.7s cubic-bezier(0.34,1.56,0.64,1) both;}
    .bday-toast{position:fixed;bottom:80px;right:24px;z-index:13500;background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1.5px solid rgba(167,139,250,0.35);border-radius:16px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 40px rgba(0,0,0,0.4);font-family:'Plus Jakarta Sans',sans-serif;max-width:300px;}
    .bday-toast.in{animation:bdayToastIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
    .bday-toast.out{animation:bdayToastOut 0.4s ease forwards;}

    /* ── Login screen ── */
    .ms-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;}
    .ms-card{background:rgba(15,10,35,0.92);backdrop-filter:blur(20px);border-radius:20px;padding:44px;max-width:420px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.4);border:1px solid rgba(167,139,250,0.2);}
    .ms-title{font-size:24px;font-weight:700;color:#fff;margin:0 0 6px;}
    .ms-sub{font-size:13px;color:rgba(232,229,255,0.55);margin:0 0 24px;}
    .ms-btn{width:100%;height:40px;background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.15s;}
    .ms-btn:hover{opacity:0.9;}
    .ms-app-row{display:flex;align-items:center;gap:10px;margin-top:28px;padding-top:16px;border-top:1px solid rgba(167,139,250,0.12);}
    .ms-app-icon{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#009bff,#770bff);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;}
    .ms-err{margin-top:14px;color:#fca5a5;background:rgba(239,68,68,0.15);padding:10px 14px;border-radius:8px;font-size:13px;border-left:3px solid #ef4444;}

    /* ── Mind Hub button animations ── */
    @keyframes sparkleFloat{
      0%,100%{transform:translateY(0) rotate(0deg) scale(1);opacity:0.7;}
      25%{transform:translateY(-3px) rotate(15deg) scale(1.2);opacity:1;}
      50%{transform:translateY(-1px) rotate(-10deg) scale(0.9);opacity:0.8;}
      75%{transform:translateY(-4px) rotate(20deg) scale(1.15);opacity:1;}
    }
    @keyframes cakeWobble{
      0%,100%{transform:rotate(0deg) scale(1);}
      20%{transform:rotate(-8deg) scale(1.1);}
      40%{transform:rotate(8deg) scale(1.08);}
      60%{transform:rotate(-5deg) scale(1.05);}
      80%{transform:rotate(3deg) scale(1.02);}
    }
    @keyframes candleFlicker{
      0%,100%{filter:drop-shadow(0 0 4px rgba(255,200,0,0.8)) drop-shadow(0 0 8px rgba(255,150,0,0.5));}
      33%{filter:drop-shadow(0 0 8px rgba(255,220,0,1)) drop-shadow(0 0 16px rgba(255,180,0,0.7));}
      66%{filter:drop-shadow(0 0 2px rgba(255,180,0,0.6)) drop-shadow(0 0 6px rgba(255,120,0,0.4));}
    }
    .mh-btn-sparkle span{animation:sparkleFloat 1.8s ease-in-out infinite;}
    .mh-btn-cake span{animation:cakeWobble 2s ease-in-out infinite,candleFlicker 0.8s ease-in-out infinite;}
    .mh-btn-planet:hover div div:last-child{border-color:rgba(99,179,255,0.95);box-shadow:0 0 14px rgba(0,155,255,0.7);}

    /* ── Status cell hover lift ── */
    .sh.set:hover{transform:translateY(-2px) scale(1.02);filter:brightness(1.12);box-shadow:0 4px 16px rgba(0,0,0,0.2);}
    .sh.mine:hover{transform:translateY(-2px) scale(1.02);}

    /* ── Section title bar ── */
    .section-title{
      padding:14px 32px 10px;
      font-size:11px;font-weight:700;
      color:rgba(232,229,255,0.45);
      letter-spacing:0.12em;
      display:flex;align-items:center;justify-content:space-between;
      position:relative;z-index:10;
    }
    .section-title-hint{
      font-size:11px;font-weight:500;
      color:rgba(232,229,255,0.3);
      letter-spacing:0.02em;
    }
/* ── Status cell glass texture ── */
    .sh{
      height:58px;border-radius:18px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1);
      user-select:none;cursor:pointer;gap:5px;
      backdrop-filter:blur(12px) saturate(140%);
      position:relative;overflow:hidden;
    }
    .sh::before{
      content:'';position:absolute;inset:0;border-radius:18px;
      background:linear-gradient(160deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.01) 100%);
      pointer-events:none;
    }
    .sh-icon{font-size:26px;line-height:1;flex-shrink:0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));}
    .sh.mine{
      background:rgba(167,139,250,0.07);
      border:1.5px solid rgba(167,139,250,0.18);
      color:rgba(232,229,255,0.35);
    }
    .sh.mine:hover{
      background:rgba(167,139,250,0.13);
      border-color:rgba(167,139,250,0.45);
      transform:translateY(-3px) scale(1.03);
      box-shadow:0 6px 20px rgba(167,139,250,0.2);
    }
    .sh.set:hover{
      transform:translateY(-3px) scale(1.03);
      filter:brightness(1.15);
      box-shadow:0 6px 20px rgba(0,0,0,0.3);
    }
    .sh.other{
      background:rgba(255,255,255,0.02);
      border:1.5px solid rgba(167,139,250,0.07);
      color:rgba(167,139,250,0.18);
      cursor:default;
    }8px) saturate(120%);
      position:relative;overflow:hidden;
    }
    .sh::before{
      content:'';position:absolute;inset:0;border-radius:12px;
      background:linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.02) 100%);
      pointer-events:none;
    }
    .sh-icon{font-size:20px;line-height:1;flex-shrink:0;}
    .sh.mine{
      background:rgba(167,139,250,0.08);
      border:1px solid rgba(167,139,250,0.2);
      color:rgba(232,229,255,0.4);
    }
    .sh.mine:hover{
      background:rgba(167,139,250,0.14);
      border-color:rgba(167,139,250,0.4);
      transform:translateY(-2px);
      box-shadow:0 4px 16px rgba(167,139,250,0.15);
    }
    .sh.set:hover{transform:translateY(-2px);filter:brightness(1.12);box-shadow:0 4px 16px rgba(0,0,0,0.25);}
    .sh.other{
      background:rgba(255,255,255,0.03);
      border:1px solid rgba(167,139,250,0.08);
      color:rgba(167,139,250,0.2);
      cursor:default;
    }

    /* ── Mind Hub SVG button animations ── */
    @keyframes twinkleStar{
      0%,100%{opacity:0.6;transform:scale(0.85) rotate(0deg);}
      25%{opacity:1;transform:scale(1.15) rotate(15deg);}
      50%{opacity:0.7;transform:scale(0.9) rotate(-10deg);}
      75%{opacity:1;transform:scale(1.2) rotate(20deg);}
    }
    @keyframes candleFlame{
      0%,100%{transform:scaleY(1) translateX(0);opacity:0.9;}
      25%{transform:scaleY(1.2) translateX(1px);opacity:1;}
      50%{transform:scaleY(0.85) translateX(-1px);opacity:0.8;}
      75%{transform:scaleY(1.1) translateX(1px);opacity:1;}
    }
   
    @keyframes planetFloat{
      0%,100%{transform:translateY(0);}
      50%{transform:translateY(-2px);}
    }
   .mh-star-1,.mh-star-2,.mh-star-3{animation:none;}
    .mh-flame{animation:none;transform-origin:bottom center;}
    .mh-planet-body{animation:none;}
    .mh-ring{animation:none;}

    button:hover .mh-star-1{animation:twinkleStar 1.4s ease-in-out infinite;}
    button:hover .mh-star-2{animation:twinkleStar 1.4s ease-in-out 0.3s infinite;}
    button:hover .mh-star-3{animation:twinkleStar 1.4s ease-in-out 0.6s infinite;}
    button:hover .mh-flame{animation:candleFlame 0.6s ease-in-out infinite;}
    button:hover .mh-planet-body{animation:planetFloat 2.5s ease-in-out infinite;}
    button:hover .mh-ring{animation:ringOrbit 2s linear infinite;}
    .mh-ring{transform-box:fill-box;transform-origin:center;}
    .mh-planet-body{transform-box:fill-box;transform-origin:center;}
    .mh-star-1,.mh-star-2,.mh-star-3{transform-box:fill-box;transform-origin:center;}
    .mh-flame{transform-box:fill-box;transform-origin:bottom center;}
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