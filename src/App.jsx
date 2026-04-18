import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import HOLIDAYS_DATA from './data/holidays.json';
import RAW_STAFF_LIST from './data/staff.json';
import STATUS_CONFIG from './data/status.json';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vzdrpydtxlamoqtukgld.supabase.co',
  'sb_publishable_o1d0wmxwLrJCuTQ84uY38g__dqoj2dD'
);

const msalInstance = new PublicClientApplication(msalConfig);
const STAFF_LIST = RAW_STAFF_LIST.filter(p => p.id !== 'arthur');
const SUPER_USERS = ['arthur.cheung@patternasia.com', 'brenda.lee@patternasia.com'];
const CHINA_EXTRA = ['jessica.rao@patternasia.com'];

const isSuperUser  = em => SUPER_USERS.includes(em.toLowerCase());
const isChinaExtra = em => CHINA_EXTRA.includes(em.toLowerCase());
const getStaffEntry = em => RAW_STAFF_LIST.find(s => s.email.toLowerCase() === em.toLowerCase());

const ROW_H      = 104;
const NAV_H      = 56;
const SUB_H      = 48;
const TB_H       = 52;
const LG_H       = 36;
const AM_REF     = 'am-ref-btn';
const NAME_COL_W = 200;
const TBL_PAD    = 28;
const HEADER_STICKY_TOP = NAV_H + SUB_H + TB_H + LG_H;

const fmt = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

const TEAMS_COLORS = ['#B3CEE0','#D1A7C8','#A7C8A0','#E0C8A7','#A7B9E0','#E0A7A7','#C8D1A7','#A7D1CE','#D1C8A7','#B9A7E0','#A7C8D1','#E0B9A7'];
const teamsColor = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TEAMS_COLORS[Math.abs(h) % TEAMS_COLORS.length];
};

const initials = name => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name[0].toUpperCase();
};

function Avatar({ name, photoUrl, size=34, isMe=false }) {
  if (!name) return null;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.36, fontFamily:"'Segoe UI',sans-serif", fontWeight:600,
      letterSpacing:'0.02em', background:photoUrl?'transparent':teamsColor(name),
      color:'#fff', userSelect:'none',
      ...(isMe?{boxShadow:'0 0 0 2px #fff,0 0 0 4px #770bff'}:{}),
    }}>
      {photoUrl
        ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : initials(name)
      }
    </div>
  );
}

// ── FIX 3: 飞行魔法组件，照参考代码模式重写 ─────────────────────────────────
function EmojiFlyLayer({ flight, onComplete }) {
  const [progress,    setProgress]    = useState(0);
  const [pathPoints,  setPathPoints]  = useState([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!flight) { setProgress(0); setPathPoints([]); return; }
    const duration = 900;
    const startTime = performance.now();
    const pts = [];

    const animate = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      setProgress(p);

      const { start, end } = flight;
      const control = {
        x: start.x + (end.x - start.x) * 0.2,
        y: Math.max(start.y, end.y) + 180,
      };

      if (p >= 0.25) {
        const t = (p - 0.25) / 0.75;
        const e = t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
        const cx = Math.pow(1-e,2)*start.x + 2*(1-e)*e*control.x + Math.pow(e,2)*end.x;
        const cy = Math.pow(1-e,2)*start.y + 2*(1-e)*e*control.y + Math.pow(e,2)*end.y;
        pts.push({ x:cx, y:cy });
        setPathPoints([...pts]);
      }

      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else { rafRef.current = null; setTimeout(onComplete, 50); }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [flight]);

  if (!flight) return null;

  const { start, end, icon } = flight;
  const control = {
    x: start.x + (end.x - start.x) * 0.2,
    y: Math.max(start.y, end.y) + 180,
  };

  let x, y, scale, rotate, opacity;
  if (progress < 0.25) {
    const t = progress / 0.25;
    const ease = 1 - Math.pow(1-t, 3);
    x = start.x; y = start.y;
    scale = 1 + ease * 1.0; rotate = t * -20; opacity = t;
  } else {
    const t = (progress - 0.25) / 0.75;
    const e = t < 0.5 ? 8*t*t*t*t : 1 - Math.pow(-2*t+2,4)/2;
    x = Math.pow(1-e,2)*start.x + 2*(1-e)*e*control.x + Math.pow(e,2)*end.x;
    y = Math.pow(1-e,2)*start.y + 2*(1-e)*e*control.y + Math.pow(e,2)*end.y;
    scale = 2 - e; rotate = -20 + e*20; opacity = progress > 0.9 ? 1-(progress-0.9)/0.1 : 1;
  }

  const dPath = pathPoints.length > 1
    ? `M ${pathPoints[0].x} ${pathPoints[0].y} ` + pathPoints.slice(1).map(p=>`L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <>
      <svg style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:10998}}>
        <defs>
          <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#009bff" stopOpacity="0"/>
            <stop offset="60%"  stopColor="#009bff" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#770bff" stopOpacity="0.85"/>
          </linearGradient>
          <filter id="neon-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {dPath && (
          <path d={dPath} fill="none" stroke="url(#neon-grad)" strokeWidth="8"
            strokeLinecap="round" filter="url(#neon-blur)"
            opacity={progress > 0.9 ? 0 : 1}
            style={{transition:'opacity 0.15s'}}
          />
        )}
      </svg>
      <div style={{
        position:'fixed', left:x, top:y,
        transform:`translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`,
        fontSize:'28px', pointerEvents:'none', zIndex:10999, opacity,
        filter:`drop-shadow(0 0 12px rgba(119,11,255,${progress>0.3?0.55:0}))`,
        willChange:'transform,opacity',
      }}>
        {icon}
      </div>
    </>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}

    @keyframes holiBounce{
      0%  {transform:scale(1)}
      35% {transform:scale(1.08)}
      65% {transform:scale(0.95)}
      82% {transform:scale(1.03)}
      100%{transform:scale(1)}
    }
    .holi-tap .pill-card{
      animation:holiBounce 0.42s cubic-bezier(0.25,0.46,0.45,0.94) both;
      transform-origin:center center;
    }

    /* FIX 4: emoji+label 容器一起弹 */
    @keyframes emojiLabelPop{
      0%  {transform:scale(1)    rotate(0deg);  }
      22% {transform:scale(1.45) rotate(-10deg);}
      48% {transform:scale(0.84) rotate(7deg);  }
      68% {transform:scale(1.18) rotate(-4deg); }
      84% {transform:scale(0.97) rotate(1deg);  }
      100%{transform:scale(1)    rotate(0deg);  }
    }
    .emoji-label-pop{
      animation:emojiLabelPop 0.65s cubic-bezier(0.34,1.46,0.64,1) both;
      transform-origin:center center;
      display:flex; flex-direction:column; align-items:center; gap:8px;
    }

    /* snap-impact: 头像被击中回弹 */
    @keyframes snapImpact{
      0%  {transform:scale(1)}
      30% {transform:scale(1.6) rotate(12deg)}
      55% {transform:scale(0.85) rotate(-5deg)}
      75% {transform:scale(1.2) rotate(2deg)}
      90% {transform:scale(0.97)}
      100%{transform:scale(1) rotate(0deg)}
    }
    .snap-impact{
      animation:snapImpact 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @keyframes colGlowFade{
      0%   {opacity:0;  transform:scaleX(0.92);}
      12%  {opacity:1;  transform:scaleX(1);   }
      65%  {opacity:0.5;transform:scaleX(1);   }
      85%  {opacity:0.3;transform:scaleX(1.01);}
      100% {opacity:0;  transform:scaleX(1);   }
    }
    .col-glow-overlay{
      position:fixed;pointer-events:none;z-index:150;border-radius:10px;
      background:linear-gradient(180deg,rgba(0,229,255,0.055) 0%,rgba(0,155,255,0.07) 30%,rgba(119,11,255,0.07) 70%,rgba(119,11,255,0.04) 100%);
      box-shadow:inset 0 0 8px 2px rgba(0,155,255,0.32),inset 0 0 18px 4px rgba(119,11,255,0.20),inset 0 0 4px 1px rgba(0,229,255,0.28),0 0 10px 2px rgba(0,155,255,0.10),0 0 20px 5px rgba(119,11,255,0.07);
      animation:colGlowFade 1.8s cubic-bezier(0.22,0.61,0.36,1) both;
      will-change:opacity,transform;
    }

    @keyframes slideInFromRight{
      from{transform:translateX(52px);opacity:0.3;}
      to  {transform:translateX(0);   opacity:1;  }
    }
    @keyframes slideInFromLeft{
      from{transform:translateX(-52px);opacity:0.3;}
      to  {transform:translateX(0);    opacity:1;  }
    }
    /* FIX 2: slide 只作用于数据列 td */
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
    .sh.preview{background:#dbeafe !important;border:2px dashed #0284c7 !important;opacity:0.8}
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

function LoginScreen({ onLogin, isInitializing, error }) {
  return (
    <div className="ms-screen"><GlobalStyles />
      <div className="ms-card">
        <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
          <img src="https://i.ibb.co/YTQHg15F/Pattern-Logo.png" alt="Pattern" style={{height:40,objectFit:'contain'}}/>
        </div>
        <h2 className="ms-title">Sign in</h2>
        <p className="ms-sub">Use your Pattern Asia work account to continue</p>
        {isInitializing
          ? <div style={{fontSize:'13px',color:'#605e5c',textAlign:'center'}}>Initializing...</div>
          : (
            <button className="ms-btn" onClick={onLogin} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="rgba(255,255,255,0.95)"/>
                <rect x="11" y="1" width="9" height="9" fill="rgba(255,255,255,0.7)"/>
                <rect x="1" y="11" width="9" height="9" fill="rgba(255,255,255,0.7)"/>
                <rect x="11" y="11" width="9" height="9" fill="rgba(255,255,255,0.5)"/>
              </svg>
              Sign in with Microsoft
            </button>
          )
        }
        {error && <div className="ms-err">{error}</div>}
        <div className="ms-app-row">
          <div className="ms-app-icon">P</div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#201f1e'}}>Whereabouts</div>
            <div style={{fontSize:'11px',color:'#605e5c'}}>Pattern Asia Pacific</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedScreen({ email, onLogout }) {
  return (
    <div className="ms-screen"><GlobalStyles />
      <div className="ms-card">
        <h2 className="ms-title">Access denied</h2>
        <p style={{fontSize:'13px',color:'#605e5c',marginBottom:'20px'}}>
          <strong>{email}</strong> is not authorised to access Whereabouts.<br/>
          Please contact your administrator if you believe this is an error.
        </p>
        <button className="ms-btn" style={{background:'#f3f2f1',color:'#201f1e',border:'1px solid #8a8886'}} onClick={onLogout}>
          Sign out and try another account
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [isInit,          setIsInit]          = useState(false);
  const [account,         setAccount]         = useState(null);
  const [authError,       setAuthError]       = useState(null);
  const [denied,          setDenied]          = useState(false);
  const [activeTab,       setActiveTab]       = useState('calendar');
  const [viewDate,        setViewDate]        = useState(new Date());
  const [region,          setRegion]          = useState('Hong Kong');
  const [records,         setRecords]         = useState({});
  const [activeMenu,      setActiveMenu]      = useState(null);
  const [socialMenu,      setSocialMenu]      = useState(null);
  const [emotions,        setEmotions]        = useState({});
  const [saveStatus,      setSaveStatus]      = useState('');
  const [staffPhotos,     setStaffPhotos]     = useState({});
  const [onlineUsers,     setOnlineUsers]     = useState([]);
  const [dragging,        setDragging]        = useState(null);
  const [preview,         setPreview]         = useState([]);
  const [bulkSelectCells, setBulkSelectCells] = useState([]);
  const [bouncingDs,      setBouncingDs]      = useState(null);
  const [slideDir,        setSlideDir]        = useState(null);
  // FIX 1: 用表头 daycol 的 getBoundingClientRect 存 X 坐标 map
  const [colXMap,         setColXMap]         = useState({});
  // FIX 3: 飞行魔法
  const [flight,          setFlight]          = useState(null);
  const [snapEffect,      setSnapEffect]      = useState(false);

  const slideTimerRef  = useRef(null);
  const presenceRef    = useRef(null);
  const partyTimerRef  = useRef(null);
  const scrollRef      = useRef(null);
  const headerRef      = useRef(null);
  const glowFrameRef   = useRef(null);
  const glowLevelRef   = useRef(0);
  const glowRafRef     = useRef(null);
  // FIX 3: ref 绑定到自己的头像 DOM
  const myAvatarRef    = useRef(null);

  // FIX 1: 读表头 daycol 中心 X，表头不参与 slide 动画，永远准确
  const measureColX = useCallback(() => {
    const cols = document.querySelectorAll('[data-hdr-ds]');
    const map = {};
    cols.forEach(el => {
      const r = el.getBoundingClientRect();
      map[el.dataset.hdrDs] = r.left + r.width / 2;
    });
    if (Object.keys(map).length > 0) setColXMap(map);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(measureColX));
    window.addEventListener('resize', measureColX);
    window.addEventListener('scroll', measureColX, true);
    return () => {
      window.removeEventListener('resize', measureColX);
      window.removeEventListener('scroll', measureColX, true);
    };
  }, [measureColX, viewDate, region, activeTab]);

  const navigateWeek = (deltaDays, forcedDate = null) => {
    setViewDate(prev => {
      const target = forcedDate || (() => {
        const d = new Date(prev); d.setDate(d.getDate() + deltaDays); return d;
      })();
      const dir = target > prev ? 'right' : 'left';
      setSlideDir(dir);
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = setTimeout(() => setSlideDir(null), 320);
      return target;
    });
  };

  useEffect(() => {
    const decay = () => {
      glowLevelRef.current = Math.max(0, glowLevelRef.current - 0.016);
      const el = glowFrameRef.current;
      if (el) {
        const lvl = glowLevelRef.current;
        if (lvl > 0.001) {
          const i1=lvl*25,s1=lvl*10,i2=lvl*45,s2=lvl*16,i3=lvl*18,s3=lvl*6;
          const op1=0.28+lvl*0.52,op2=0.16+lvl*0.44,op3=lvl*0.38;
          el.style.opacity = String(Math.min(lvl*1.5,1));
          el.style.boxShadow = [
            `inset 0 0 ${i1}px ${s1}px rgba(0,155,255,${op1})`,
            `inset 0 0 ${i2}px ${s2}px rgba(119,11,255,${op2})`,
            `inset 0 0 ${i3}px ${s3}px rgba(0,229,255,${op3})`,
          ].join(',');
        } else { el.style.opacity='0'; el.style.boxShadow='none'; }
      }
      glowRafRef.current = requestAnimationFrame(decay);
    };
    glowRafRef.current = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(glowRafRef.current);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await msalInstance.initialize(); setIsInit(true);
        const res = await msalInstance.handleRedirectPromise();
        const isAllowed = em => isSuperUser(em)||isChinaExtra(em)||!!getStaffEntry(em);
        if (res) {
          const em = res.account.username.toLowerCase();
          if (!isAllowed(em)) { setDenied(true); return; }
          msalInstance.setActiveAccount(res.account); setAccount(res.account); return;
        }
        const accs = msalInstance.getAllAccounts();
        if (accs.length > 0) {
          const em = accs[0].username.toLowerCase();
          if (isAllowed(em)) { msalInstance.setActiveAccount(accs[0]); setAccount(accs[0]); }
          else setDenied(true);
        }
      } catch(e) { setAuthError('Initialization failed. Please refresh.'); }
    })();
  }, []);

  useEffect(() => {
    if (!account) return;
    const em = account.username.toLowerCase();
    if (isSuperUser(em)) setRegion('Hong Kong');
    else if (isChinaExtra(em)) setRegion('China');
    else { const s = getStaffEntry(em); if (s) setRegion(s.region); }
  }, [account]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      let token;
      try { const r = await msalInstance.acquireTokenSilent({scopes:['User.ReadBasic.All'],account}); token=r.accessToken; }
      catch { try { const r = await msalInstance.acquireTokenPopup({scopes:['User.ReadBasic.All'],account}); token=r.accessToken; } catch(e){return;} }
      const photos={};
      await Promise.all(RAW_STAFF_LIST.map(async s => {
        try {
          const r = await fetch(`https://graph.microsoft.com/v1.0/users/${s.email}/photo/$value`,{headers:{Authorization:`Bearer ${token}`}});
          if (r.ok) photos[s.id]=URL.createObjectURL(await r.blob());
        } catch {}
      }));
      setStaffPhotos(photos);
    })();
  }, [account]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      const {data:sData} = await supabase.from('statuses').select('*');
      if (sData) { const r={}; sData.forEach(row=>{r[row.id]=row.status;}); setRecords(r); }
      const {data:eData} = await supabase.from('emotions').select('*');
      if (eData) { const e={}; eData.forEach(row=>{e[row.staff_id]=row.emoji;}); setEmotions(e); }
      supabase.channel('statuses-changes')
        .on('postgres_changes',{event:'*',schema:'public',table:'statuses'},payload=>{
          if (payload.eventType==='DELETE') setRecords(r=>{const n={...r};delete n[payload.old.id];return n;});
          else setRecords(r=>({...r,[payload.new.id]:payload.new.status}));
        }).subscribe();
      supabase.channel('emotions-changes')
        .on('postgres_changes',{event:'*',schema:'public',table:'emotions'},payload=>{
          if (payload.eventType==='DELETE') setEmotions(e=>{const n={...e};delete n[payload.old.staff_id];return n;});
          else setEmotions(e=>({...e,[payload.new.staff_id]:payload.new.emoji}));
        }).subscribe();
    })();
  }, [account]);

  useEffect(() => {
    if (!account) return;
    const meStaffLocal = getStaffEntry(account.username.toLowerCase());
    const channel = supabase.channel('presence-party',{config:{presence:{key:account.username.toLowerCase()}}});
    channel
      .on('presence',{event:'sync'},()=>{
        const state=channel.presenceState();
        setOnlineUsers(Object.values(state).map(arr=>arr[0]).filter(Boolean));
      })
      .on('broadcast',{event:'party'},({payload})=>{
        firePartyLocal(payload.type,payload.text);
        popAvatar(payload.userId);
        glowLevelRef.current=Math.min(glowLevelRef.current+0.65,1);
      })
      .subscribe(async status=>{
        if (status==='SUBSCRIBED')
          await channel.track({id:meStaffLocal?.id||'guest',name:meStaffLocal?.name||account.name,email:account.username.toLowerCase()});
      });
    presenceRef.current=channel;
    return ()=>{ supabase.removeChannel(channel); };
  }, [account]);

  useEffect(() => {
    const fn = e => { if (!e.target.closest('.dsz')&&!e.target.closest('.nav-tab')) { setActiveMenu(null);setSocialMenu(null);setActiveTab(t=>t==='planner'?'calendar':t); } };
    document.addEventListener('mousedown',fn);
    return ()=>document.removeEventListener('mousedown',fn);
  }, []);

  useEffect(() => {
    const adjustPillPadding = () => {
      const am = document.getElementById(AM_REF);
      if (!am) return;
      const amTop = am.getBoundingClientRect().top;
      document.querySelectorAll('.pill').forEach(pill => {
        const offset = amTop - pill.getBoundingClientRect().top;
        pill.style.paddingTop    = Math.max(0, offset) + 'px';
        pill.style.paddingBottom = Math.max(0, offset) + 'px';
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(adjustPillPadding));
    window.addEventListener('resize', adjustPillPadding);
    window.addEventListener('scroll', adjustPillPadding, true);
    return () => {
      window.removeEventListener('resize', adjustPillPadding);
      window.removeEventListener('scroll', adjustPillPadding, true);
    };
  }, [region, viewDate, activeTab]);

  useEffect(() => {
    if (!account) return;
    if (account.username.toLowerCase()==='arthur.cheung@patternasia.com') return;
    const t=setTimeout(()=>{ document.getElementById('my-row')?.scrollIntoView({behavior:'smooth',block:'center'}); },400);
    return ()=>clearTimeout(t);
  }, [account,region]);

  const login  = async () => { setAuthError(null); try { await msalInstance.loginRedirect(loginRequest); } catch(e) { setAuthError(e.message); } };
  const logout = () => msalInstance.logoutRedirect();

  if (denied)   return <AccessDeniedScreen email={account?.username||''} onLogout={logout}/>;
  if (!account) return <LoginScreen onLogin={login} isInitializing={!isInit} error={authError}/>;

  const me        = account.username.toLowerCase();
  const superUser = isSuperUser(me);
  const meStaff   = getStaffEntry(me);

  const popAvatar = userId => {
    const el=document.getElementById(`av-${userId}`);
    if (!el) return;
    clearTimeout(partyTimerRef.current);
    el.style.transition='none'; el.style.transform='scale(1)';
    el.getBoundingClientRect();
    el.style.transition='transform 0.12s cubic-bezier(0.34,1.56,0.64,1)';
    el.style.transform='scale(1.7)';
    partyTimerRef.current=setTimeout(()=>{ el.style.transition='transform 0.5s ease'; el.style.transform='scale(1)'; },500);
  };

  // FIX 3: 飞行魔法触发 — 同步读坐标，不经过 async
  const triggerStatusFly = (clickedEl, statusIcon) => {
    if (!myAvatarRef.current || !clickedEl) return;
    const srcR = clickedEl.getBoundingClientRect();
    const avR  = myAvatarRef.current.getBoundingClientRect();
    setFlight({
      icon:  statusIcon,
      start: { x: srcR.left + srcR.width/2,  y: srcR.top + srcR.height/2 },
      end:   { x: avR.right - 6,             y: avR.bottom - 6 },
    });
  };

  const handleFlightComplete = () => {
    setFlight(null);
    // snap-impact on avatar
    const avEl = myAvatarRef.current;
    if (avEl) {
      avEl.classList.remove('snap-impact');
      void avEl.offsetWidth;
      avEl.classList.add('snap-impact');
      setTimeout(() => avEl.classList.remove('snap-impact'), 560);
    }
  };

  const handleStatus = async (key, val, e) => {
    e.stopPropagation();
    // FIX 3: 立即同步读坐标，触发飞行
    if (val !== null && meStaff) {
      const cfg = STATUS_CONFIG[val];
      if (cfg) triggerStatusFly(e.currentTarget, cfg.icon);
    }
    if (bulkSelectCells.length>0) {
      setSaveStatus('saving');
      const updatedRecords={...records};
      bulkSelectCells.forEach(cellKey=>{updatedRecords[cellKey]=val;});
      setRecords(updatedRecords); setActiveMenu(null); setBulkSelectCells([]);
      (async()=>{
        try {
          await Promise.all(bulkSelectCells.map(cellKey=>{
            const parts=cellKey.split('-');
            const shift_name=parts[parts.length-1],staffId_name=parts[0],date_name=parts.slice(1,-1).join('-');
            return supabase.from('statuses').upsert({id:cellKey,staff_id:staffId_name,date:date_name,shift:shift_name,status:val});
          }));
          setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
        } catch(e){setSaveStatus('');}
      })();
    } else {
      setSaveStatus('saving');
      if (val===null) { await supabase.from('statuses').delete().eq('id',key); }
      else {
        const parts=key.split('-');
        const shift=parts[parts.length-1],staffId=parts[0],date=parts.slice(1,-1).join('-');
        await supabase.from('statuses').upsert({id:key,staff_id:staffId,date,shift,status:val});
        setActiveMenu(null);
      }
      setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
    }
  };

  const handleStatusCellMouseDown=(staffId,dateIdx,shift,status,e)=>{
    if (!account||staffId!==meStaff?.id) return;
    setDragging({staffId,dateIdx,shift,status,isEmptyCell:status==='none'});
    setPreview([[staffId,dateIdx,shift]]);
  };

  const handleStatusCellMouseOver=(staffId,dateIdx,shift)=>{
    if (!dragging) return;
    const staffIds=STAFF_LIST.filter(s=>s.region===region).map(s=>s.id);
    const minIdx=Math.min(staffIds.indexOf(dragging.staffId),staffIds.indexOf(staffId));
    const maxIdx=Math.max(staffIds.indexOf(dragging.staffId),staffIds.indexOf(staffId));
    const minDate=Math.min(dragging.dateIdx,dateIdx),maxDate=Math.max(dragging.dateIdx,dateIdx);
    const minShift=Math.min(dragging.shift==='AM'?0:1,shift==='AM'?0:1);
    const maxShift=Math.max(dragging.shift==='AM'?0:1,shift==='AM'?0:1);
    const range=[];
    for (let r=minIdx;r<=maxIdx;r++) for (let d=minDate;d<=maxDate;d++) {
      if (minShift===maxShift) range.push([staffIds[r],d,minShift===0?'AM':'PM']);
      else { range.push([staffIds[r],d,'AM']); range.push([staffIds[r],d,'PM']); }
    }
    setPreview(range);
  };

  const handleStatusCellMouseUp=()=>{
    if (dragging&&preview.length>1) {
      const isEmptyCell=dragging.isEmptyCell;
      const week_arr=week.map(d=>d.ds);
      if (isEmptyCell) {
        const cellKeys=preview.map(([staffId,dateIdx,shift])=>`${staffId}-${week_arr[dateIdx]}-${shift}`);
        setBulkSelectCells(cellKeys);
        const firstCell=preview[0];
        setActiveMenu(`${firstCell[0]}-${week_arr[firstCell[1]]}-${firstCell[2]}`);
      } else {
        const updatedRecords={...records};
        preview.forEach(([staffId,dateIdx,shift])=>{delete updatedRecords[`${staffId}-${week_arr[dateIdx]}-${shift}`];});
        setRecords(updatedRecords); setSaveStatus('saving'); setActiveMenu(null);
        (async()=>{
          try {
            await Promise.all(preview.map(([staffId,dateIdx,shift])=>supabase.from('statuses').delete().eq('id',`${staffId}-${week_arr[dateIdx]}-${shift}`)));
            setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
          } catch(e){setSaveStatus('');}
        })();
      }
    }
    setDragging(null); setPreview([]);
  };

  const isPreviewCell=(staffId,dateIdx,shift)=>preview.some(([s,d,sh])=>s===staffId&&d===dateIdx&&sh===shift);

  const firePartyLocal=(type,text='')=>{
    const els=type==='weekend'?['🍷','🌟','🎵','🍱']:['🎉',text.split(' ')[0]||'✨','✨'];
    for (let i=0;i<28;i++) {
      const c=document.body.appendChild(document.createElement('div'));
      c.innerText=els[Math.floor(Math.random()*els.length)];
      c.style.cssText=`position:fixed;left:${Math.random()*100}vw;top:-30px;font-size:22px;z-index:11000;pointer-events:none;transition:transform ${Math.random()*2+2}s cubic-bezier(0.1,0.5,0.5,1),opacity 2s;`;
      setTimeout(()=>{c.style.transform=`translateY(105vh) rotate(${Math.random()*900}deg)`;c.style.opacity='0';},20);
      setTimeout(()=>c.remove(),4000);
    }
  };

  const fireParty=(e,type,text='',ds='')=>{
    const pill=e.currentTarget.closest('.pill');
    if (pill) { pill.classList.remove('holi-tap'); void pill.offsetWidth; pill.classList.add('holi-tap'); }
    if (ds) { setBouncingDs(ds); setTimeout(()=>setBouncingDs(null),700); }
    const td=e.currentTarget.closest('td.ptd');
    if (td) {
      document.querySelectorAll('.col-glow-overlay').forEach(el=>el.remove());
      const r=td.getBoundingClientRect();
      const overlay=document.createElement('div');
      overlay.className='col-glow-overlay';
      overlay.style.left=`${r.left}px`; overlay.style.top=`${r.top}px`;
      overlay.style.width=`${r.width}px`; overlay.style.height=`${r.height}px`;
      document.body.appendChild(overlay);
      setTimeout(()=>overlay.remove(),2000);
    }
    firePartyLocal(type,text);
    popAvatar(meStaff?.id||'guest');
    glowLevelRef.current=Math.min(glowLevelRef.current+0.65,1);
    presenceRef.current?.send({type:'broadcast',event:'party',payload:{type,text,userId:meStaff?.id||'guest'}});
  };

  const handleTableScroll=()=>{
    if (headerRef.current&&scrollRef.current)
      headerRef.current.scrollLeft=scrollRef.current.scrollLeft;
  };

  const today=fmt(new Date());
  const staffList=STAFF_LIST.filter(s=>s.region===region);

  const inOffice=(()=>{
    let n=0;
    staffList.forEach(s=>{
      const amFilled=!!records[`${s.id}-${today}-AM`];
      const pmFilled=!!records[`${s.id}-${today}-PM`];
      if (!(amFilled&&pmFilled)) n++;
    });
    return {n,total:staffList.length};
  })();

  const week=(()=>{
    const d=new Date(viewDate),day=d.getDay();
    const mon=new Date(d.setDate(d.getDate()-day+(day===0?-6:1)));
    return Array.from({length:7}).map((_,i)=>{
      const t=new Date(mon); t.setDate(mon.getDate()+i);
      const ds=fmt(t);
      const rd=HOLIDAYS_DATA[region];
      const hol=rd?.holidays?.[ds];
      const isAdj=rd?.adjusted_workdays?.includes(ds);
      const isWE=(t.getDay()===0||t.getDay()===6)&&!isAdj;
      return {ds,num:t.getDate(),dayName:t.toLocaleDateString('en-US',{weekday:'short'}),hol,isWE,isToday:ds===today,editable:!hol&&(!(t.getDay()===0||t.getDay()===6)||isAdj),isAdj};
    });
  })();

  const plannerList=()=>{
    const h=HOLIDAYS_DATA[region]?.holidays; if (!h) return [];
    return Object.entries(h).sort((a,b)=>a[0].localeCompare(b[0])).map(([date,name])=>{
      const d=new Date(date);
      return {date,name,isWE:d.getDay()===0||d.getDay()===6,day:d.toLocaleDateString('en-US',{weekday:'short'})};
    });
  };

  const jumpToDate=ds=>{setViewDate(new Date(ds));setActiveTab('calendar');};
  const VH=window.innerHeight;

  // FIX 2: slide class 只用在 td 级别，不用在 table 级别
  const tdSlideClass = slideDir==='right' ? 'td-slide-right' : slideDir==='left' ? 'td-slide-left' : '';

  // 非工作日列
  const nonEditableCols = week.reduce((acc,d,i)=>{ if (!d.editable) acc.push({...d,colIndex:i}); return acc; },[]);

  return (
    <div style={{minHeight:'100vh',background:'#f4f5f7'}} onMouseUp={handleStatusCellMouseUp}>
      <GlobalStyles/>
      <div ref={glowFrameRef} className="glow-frame"/>

      {/* FIX 3: 飞行魔法层 */}
      {flight && (
        <EmojiFlyLayer
          key={`${flight.start.x}-${flight.start.y}`}
          flight={flight}
          onComplete={handleFlightComplete}
        />
      )}

      {/* FIX 1+4: emoji 浮层，X 从表头 daycol 读，emoji+label 一起缩放 */}
      {activeTab==='calendar' && nonEditableCols.map(d=>{
        const x = colXMap[d.ds];
        if (!x) return null;
        const isHol=!!d.hol;
        const holName=d.hol?d.hol.replace(/^\S+\s/,''):'';
        const y = VH / 2;
        const isBouncing = bouncingDs===d.ds;
        return (
          <div key={d.ds} style={{
            position:'fixed', left:x, top:y,
            transform:'translate(-50%,-50%)',
            pointerEvents:'none', zIndex:200,
          }}>
            {/* FIX 4: emoji + label 包在同一容器，一起做弹跳动画 */}
            <div
              key={isBouncing?`${d.ds}-b`:d.ds}
              className={isBouncing?'emoji-label-pop':''}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
            >
              <span style={{fontSize:'48px',userSelect:'none',display:'inline-block',lineHeight:1}}>
                {isHol?d.hol.split(' ')[0]:'🏝️'}
              </span>
              <span style={{
                fontSize:'10px',fontWeight:'700',
                color:isHol?'#be185d':'#1d4ed8',
                letterSpacing:'0.06em',textAlign:'center',
                userSelect:'none',wordBreak:'break-word',
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>
                {isHol?holName:'WEEKEND'}
              </span>
            </div>
          </div>
        );
      })}

      <nav className="nav">
        <div className={`nav-tab${activeTab==='calendar'?' active':''}`} onClick={()=>setActiveTab('calendar')}>Calendar</div>
        <div className={`nav-tab${activeTab==='planner'?' active':''}`} style={{position:'relative'}} onClick={()=>setActiveTab(activeTab==='planner'?'calendar':'planner')}>
          Holiday Planner
          {activeTab==='planner'&&(
            <div style={{position:'absolute',top:'calc(100% + 2px)',left:0,zIndex:10020,background:'#fff',borderRadius:14,width:310,padding:18,boxShadow:'0 16px 48px rgba(0,0,0,0.12)',border:'1px solid #e5e7eb',animation:'dropIn 0.15s ease'}}
              onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#9ca3af',letterSpacing:'0.1em',marginBottom:'12px'}}>{region.toUpperCase()} HOLIDAYS 2026</div>
              <div style={{maxHeight:'340px',overflowY:'auto'}}>
                {plannerList().map(h=>(
                  <div key={h.date} className="plan-row"
                    style={{background:h.isWE?'#f0f9ff':'#f9fafb',borderLeft:`3px solid ${h.isWE?'#009bff':'#e5e7eb'}`}}
                    onClick={()=>jumpToDate(h.date)}>
                    <div>
                      <div className="plan-date" style={{color:h.isWE?'#009bff':'#374151'}}>{h.date}</div>
                      <div style={{fontSize:'10px',color:'#9ca3af',marginTop:'1px'}}>{h.day}</div>
                    </div>
                    <div style={{fontWeight:'400',fontSize:'12px',color:'#374151',textAlign:'right',marginLeft:'12px'}}>{h.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="nav-sep"/>
        <div className="nav-right">
          {saveStatus==='saving'&&<span className="save-txt">↻ Saving</span>}
          {saveStatus==='saved' &&<span className="save-ok">✓ Saved</span>}
          <div className="stat-pill"><div className="stat-dot"/><span>{inOffice.n} / {inOffice.total} in office</span></div>
          {onlineUsers.length>0&&(
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{fontSize:'11px',color:'#9ca3af'}}>{onlineUsers.length} online</span>
              <div style={{display:'flex',alignItems:'center'}}>
                {onlineUsers.slice(0,6).map((u,i)=>(
                  <div key={u.email} title={u.name} style={{marginLeft:i===0?0:-8,zIndex:10-i,position:'relative',borderRadius:'50%',border:'2px solid #fff',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                    <Avatar name={u.name} photoUrl={staffPhotos[u.id]} size={26}/>
                  </div>
                ))}
                {onlineUsers.length>6&&(
                  <div style={{marginLeft:-8,width:26,height:26,borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'700',color:'#6b7280',border:'2px solid #fff',zIndex:1}}>
                    +{onlineUsers.length-6}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="user-chip">
            <span className="user-name">{account.name}</span>
            <Avatar name={meStaff?.name||account.name} photoUrl={staffPhotos[meStaff?.id]} size={26}/>
            <button className="signout-btn" onClick={logout}>Sign out</button>
          </div>
        </div>
      </nav>

      <div className="sub-header">
        <div className="page-title">Whereabouts</div>
        {superUser&&(
          <div className="region-toggle">
            {['Hong Kong','China'].map(r=>(
              <button key={r} className={`region-btn ${region===r?'on':'off'}`} onClick={()=>setRegion(r)}>{r}</button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar">
        <button className="tb-btn icon" onClick={()=>navigateWeek(-7)}>‹</button>
        <button className="tb-btn today" onClick={()=>navigateWeek(0,new Date())}>Today</button>
        <button className="tb-btn icon" onClick={()=>navigateWeek(7)}>›</button>
        <select className="tb-select" value={viewDate.getMonth()} onChange={e=>{
          const d=new Date(viewDate); d.setMonth(+e.target.value); d.setDate(1); navigateWeek(0,d);
        }}>
          {Array.from({length:12}).map((_,i)=><option key={i} value={i}>{new Date(0,i).toLocaleString('default',{month:'long'})}</option>)}
        </select>
        <span className="tb-month">{viewDate.toLocaleString('default',{month:'long',year:'numeric'})}</span>
      </div>

      <div className="legend">
        <div className="leg-item"><div className="leg-sw" style={{background:'linear-gradient(135deg,#fdf2f8,#fce7f3)',border:'1.5px solid #f9a8d4'}}></div>Holiday</div>
        <div className="leg-item"><div className="leg-sw" style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',border:'1.5px solid #93c5fd'}}></div>Weekend</div>
        <div className="leg-item"><div className="leg-sw" style={{background:'linear-gradient(135deg,#e8f0fe,#ede8fe)'}}></div>My days</div>
        <div className="leg-item"><div className="leg-sw" style={{background:'#fafafa',border:'1.5px solid #f3f4f6'}}></div>Team days</div>
      </div>

      <div className="tbl-outer dsz">
        {/* 表头独立，不参与 slide */}
        <div className="tbl-hdr-sticky">
          <div ref={headerRef} className="tbl-hdr-row">
            <div className="tbl-hdr-namecol"/>
            {week.map(d=>(
              // FIX 1: data-hdr-ds 用于 measureColX 读取中心 X
              <div key={d.ds} data-hdr-ds={d.ds} className="tbl-hdr-daycol">
                <div style={{fontSize:'10px',fontWeight:'600',letterSpacing:'0.06em',marginBottom:'5px',color:d.isToday?'#770bff':'#9ca3af'}}>
                  {d.dayName.toUpperCase()}
                </div>
                <div style={{width:'30px',height:'30px',borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'#111827',fontSize:'14px',fontWeight:'600'}}>
                  {d.num}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="tbl-scroll dsz" onScroll={handleTableScroll} onMouseLeave={handleStatusCellMouseUp}>
          {/* FIX 2: table 本身不加 slideClass，只在 td 上加 */}
          <table className="main-tbl">
            <colgroup>
              <col style={{width:'200px'}}/>
              {week.map(d=><col key={d.ds}/>)}
            </colgroup>
            <tbody>
              {staffList.map((m,rowIdx)=>{
                const isMe=m.email.toLowerCase()===me;
                const isFirst=rowIdx===0;
                return (
                  <tr key={m.id} id={isMe?'my-row':undefined}>
                    {/* 名字列：不加 tdSlideClass，保持静止 */}
                    <td className="sticky-c" style={{background:'#f4f5f7',padding:'0 8px 0 0'}}>
                      <div className="nw">
                        <div style={{display:'flex',alignItems:'center',gap:'10px',position:'relative',cursor:isMe?'pointer':'default'}}
                          onClick={async()=>{
                            if (!isMe) return;
                            if (emotions[m.id]) { await supabase.from('emotions').delete().eq('staff_id',m.id); }
                            else { setSocialMenu(socialMenu===m.id?null:m.id); }
                          }}>
                          {/* FIX 3: ref 绑定到自己的头像外层 div */}
                          <div
                            ref={isMe ? myAvatarRef : null}
                            id={`av-${m.id}`}
                            className={`n-av-wrap${isMe?' is-me':''}`}
                            style={{position:'relative'}}
                          >
                            <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={34} isMe={isMe}/>
                            {emotions[m.id]&&<div className="emo-tag">{emotions[m.id]}</div>}
                          </div>
                          <div>
                            <div className={`n-name${isMe?' me':''}`}>{m.name}</div>
                            {isMe&&<div className="n-you">YOU</div>}
                          </div>
                          {isMe&&socialMenu===m.id&&(
                            <div className="emo-picker dsz">
                              {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo=>(
                                <div key={emo}
                                  onClick={async e=>{e.stopPropagation();await supabase.from('emotions').upsert({staff_id:m.id,emoji:emo});setSocialMenu(null);}}
                                  style={{fontSize:'18px',cursor:'pointer',padding:'4px 6px',borderRadius:'6px',transition:'background 0.1s'}}
                                  onMouseOver={e=>e.currentTarget.style.background='#f3f4f6'}
                                  onMouseOut={e=>e.currentTarget.style.background='transparent'}
                                >{emo}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {week.map((d,weekIdx)=>{
                      if (!d.editable) {
                        if (!isFirst) return null;
                        const isHol=!!d.hol;
                        return (
                          // FIX 2: ptd 加 tdSlideClass
                          <td key={d.ds} className={`ptd ${tdSlideClass}`} rowSpan={staffList.length}>
                            <div data-pill-ds={d.ds} className={`pill ${isHol?'hol':'we'}`} onClick={e=>fireParty(e,isHol?'holiday':'weekend',d.hol||'',d.ds)}>
                              <div className="pill-card"/>
                            </div>
                          </td>
                        );
                      }
                      return (
                        // FIX 2: 普通 td 加 tdSlideClass
                        <td key={d.ds} className={tdSlideClass}>
                          <div className="dw">
                            {['AM','PM'].map((shift,si)=>{
                              const key=`${m.id}-${d.ds}-${shift}`;
                              const sid=records[key]||'none';
                              const cfg=STATUS_CONFIG[sid];
                              const open=activeMenu===key;
                              const isPreview=isPreviewCell(m.id,weekIdx,shift);
                              const cls=!isMe?'sh other':sid!=='none'?'sh set':'sh mine';
                              return (
                                <div key={shift} style={{position:'relative'}}>
                                  <div
                                    id={isFirst&&si===0?AM_REF:undefined}
                                    className={`${cls} ${isPreview?'preview':''}`}
                                    style={sid!=='none'?{background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}30`}:{}}
                                    onMouseDown={e=>handleStatusCellMouseDown(m.id,weekIdx,shift,sid,e)}
                                    onMouseOver={()=>handleStatusCellMouseOver(m.id,weekIdx,shift)}
                                    onClick={e=>{
                                      if (!isMe) return;
                                      e.stopPropagation();
                                      if (preview.length<=1) {
                                        if (sid!=='none') handleStatus(key,null,e);
                                        else setActiveMenu(open?null:key);
                                      }
                                    }}
                                  >
                                    {sid!=='none'?`${cfg.icon} ${cfg.label}`:shift}
                                  </div>
                                  {open&&isMe&&(
                                    <div className="s-drop dsz">
                                      <div style={{padding:'3px 10px 7px',fontSize:'10px',color:'#9ca3af',fontWeight:'600',borderBottom:'1px solid #f0f0f0',marginBottom:'3px',letterSpacing:'0.06em'}}>STATUS</div>
                                      {Object.entries(STATUS_CONFIG).map(([sId,sCfg])=>(
                                        <div key={sId} className="s-opt"
                                          onClick={e=>handleStatus(key,sId,e)}>
                                          <span style={{fontSize:'15px'}}>{sCfg.icon}</span>
                                          <span className="s-opt-lbl">{sCfg.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}