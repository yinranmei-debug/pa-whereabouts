import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import HOLIDAYS_DATA from './data/holidays.json';
import RAW_STAFF_LIST from './data/staff.json';
import STATUS_CONFIG from './data/status.json';
import TIPS_DATA from './data/tips.json';
import { createClient } from '@supabase/supabase-js';

import GlobalStyles       from './components/GlobalStyles';
import Avatar             from './components/Avatar';
import LoginScreen        from './components/LoginScreen';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import EmojiFlyLayer      from './components/EmojiFlyLayer';
import TourOverlay        from './components/TourOverlay';
import MobileView         from './components/MobileView';

// 🆕 BREACH: dimensional wall system
import { useDimensionalBreach }   from './hooks/useDimensionalBreach';
import DimensionalBreachOverlay   from './components/DimensionalBreachOverlay';

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

const ROW_H  = 110;
const NAV_H  = 72;
const TB_H   = 56;
const LG_H   = 40;
const AM_REF = 'am-ref-btn';
const HEADER_STICKY_TOP = NAV_H + TB_H + LG_H;

const fmt = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

const getDailyTips = () => {
  const today = new Date();
  const seed  = today.getFullYear()*10000 + (today.getMonth()+1)*100 + today.getDate();
  const categories = [...new Set(TIPS_DATA.map(t=>t.category))];
  const seededPick = (arr, s) => arr[Math.abs((s*2654435761)>>>0) % arr.length];
  const picked = []; const usedCats = []; let s = seed;
  while (picked.length < 3 && usedCats.length < categories.length) {
    const cat = seededPick(categories.filter(c=>!usedCats.includes(c)), s);
    if (!cat) break;
    usedCats.push(cat);
    const tip = seededPick(TIPS_DATA.filter(t=>t.category===cat), s+picked.length);
    if (tip) picked.push(tip);
    s = (s * 1664525 + 1013904223) & 0xffffffff;
  }
  return picked;
};

const BulbIcon = ({ size=20, color='#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/>
    <path d="M9 17h6"/>
  </svg>
);

const CONFETTI_COLORS = [
  '#009bff','#770bff','#00e5ff','#a78bfa','#60a5fa',
  '#f472b6','#34d399','#fbbf24','#f87171','#818cf8',
];

const rand = (min, max) => Math.random() * (max - min) + min;

function WelcomeConfetti() {
  const items = useRef(
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: rand(2, 98),
      delay: rand(0, 0.8),
      duration: rand(1.8, 3.2),
      size: rand(12, 22),
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      drift: rand(-120, 120),
      spin: rand(180, 720) * (Math.random() > 0.5 ? 1 : -1),
    }))
  );

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes welcomePop {
          0%   { opacity:0; transform:scale(0.6) translateY(30px); }
          60%  { transform:scale(1.06) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes welcomeFade {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0; transform:scale(0.92); }
        }
      `}</style>
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:12000,overflow:'hidden'}}>
        {items.current.map(p => (
          <div
            key={p.id}
            style={{
              position:'absolute', left:`${p.left}%`, top:'-16px',
              width: p.size, height: p.shape==='rect' ? p.size*0.6 : p.size,
              borderRadius: p.shape==='circle' ? '50%' : '2px',
              background: p.color,
              '--drift': `${p.drift}px`, '--spin': `${p.spin}deg`,
              animation: `confettiFall ${p.duration}s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:12001,pointerEvents:'none'}}>
        <div style={{
          background:'linear-gradient(135deg,#009bff,#770bff)',
          borderRadius:24, padding:'28px 40px',
          boxShadow:'0 24px 64px rgba(119,11,255,0.35)',
          animation:'welcomePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, welcomeFade 0.4s ease 2.4s both',
          textAlign:'center', fontFamily:"'Plus Jakarta Sans',sans-serif",
        }}>
          <div style={{fontSize:32,marginBottom:8}}>✦</div>
          <div style={{fontSize:22,fontWeight:800,color:'#fff',letterSpacing:'-0.02em',marginBottom:6}}>Welcome to Whereabouts!</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.75)',fontWeight:500}}>You're all set. Have a great day 🎯</div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [isInit,          setIsInit]          = useState(false);
  const [account,         setAccount]         = useState(null);
  const [authError,       setAuthError]       = useState(null);
  const [denied,          setDenied]          = useState(false);
  const [activeTab,       setActiveTab]       = useState('calendar');
  const [viewDate,        setViewDate]        = useState(new Date());
  const [region]                              = useState('Hong Kong');
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
  const [staggerCells,    setStaggerCells]    = useState({});
  const [bouncingDs,      setBouncingDs]      = useState(null);
  const [slideDir,        setSlideDir]        = useState(null);
  const [colXMap,         setColXMap]         = useState({});
  const [flight,          setFlight]          = useState(null);
  const [snapCellKey,     setSnapCellKey]     = useState(null);
  const [todaySonar,      setTodaySonar]      = useState(false);
  const [showTips,        setShowTips]        = useState(false);
  const [tipIdx,          setTipIdx]          = useState(0);
  const [tipSlideClass,   setTipSlideClass]   = useState('tip-slide-in-right');
  const [tipVisible,      setTipVisible]      = useState(true);
  const [showTour,        setShowTour]        = useState(false);
  const [showWelcome,     setShowWelcome]     = useState(false);
  const [isMobile,        setIsMobile]        = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const dailyTips = useRef(getDailyTips());

  // 🆕 BREACH: dimensional wall system
  const { activeBreach, chargingState, registerClick: registerBreachClick } = useDimensionalBreach();
  const slideTimerRef   = useRef(null);
  const presenceRef     = useRef(null);
  const partyTimerRef   = useRef(null);
  const scrollRef       = useRef(null);
  const headerRef       = useRef(null);
  const glowFrameRef    = useRef(null);
  const glowLevelRef    = useRef(0);
  const glowRafRef      = useRef(null);
  const myAvatarRef     = useRef(null);
  const flightOnLandRef = useRef(null);
  const touchDragRef    = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const fn = e => setIsMobile(e.matches);
    mq.addEventListener('change', fn);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const measureColX = useCallback(() => {
    const map = {};
    document.querySelectorAll('[data-hdr-ds]').forEach(el => {
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
    const t = setTimeout(() => { setShowTips(true); setTipIdx(0); }, 1200);
    return () => clearTimeout(t);
  }, [account]);

  // tour — first time only
  useEffect(() => {
    if (!account) return;
    const key = `tour-done-${account.username}`;
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => {
      setShowTips(false);
      setShowTour(true);
    }, 2800);
    return () => clearTimeout(t);
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
      // 🆕 BREACH: listen for other users' pill clicks
      .on('broadcast',{event:'pill-click'},({payload})=>{
        registerBreachClick(payload.key, payload.userId, null);
      })
      .subscribe(async status=>{
        if (status==='SUBSCRIBED')
          await channel.track({id:meStaffLocal?.id||'guest',name:meStaffLocal?.name||account.name,email:account.username.toLowerCase()});
      });
    presenceRef.current=channel;
    return ()=>{ supabase.removeChannel(channel); };
  }, [account]);

  useEffect(() => {
    const fn = e => {
      if (!e.target.closest('.dsz')&&!e.target.closest('.nav-tab')) {
        setActiveMenu(null); setSocialMenu(null);
        setActiveTab(t=>t==='planner'?'calendar':t);
      }
    };
    document.addEventListener('mousedown',fn);
    return ()=>document.removeEventListener('mousedown',fn);
  }, []);

  useEffect(() => {
    const adj = () => {
      const am = document.getElementById(AM_REF);
      if (!am) return;
      const amTop = am.getBoundingClientRect().top;
      document.querySelectorAll('.pill').forEach(pill => {
        const off = amTop - pill.getBoundingClientRect().top;
        pill.style.paddingTop    = Math.max(0,off)+'px';
        pill.style.paddingBottom = Math.max(0,off)+'px';
      });
    };
    requestAnimationFrame(()=>requestAnimationFrame(adj));
    window.addEventListener('resize',adj);
    window.addEventListener('scroll',adj,true);
    return ()=>{ window.removeEventListener('resize',adj); window.removeEventListener('scroll',adj,true); };
  }, [region,viewDate,activeTab]);

  useEffect(() => {
    if (!account) return;
    if (account.username.toLowerCase()==='arthur.cheung@patternasia.com') return;
    const t=setTimeout(()=>{ document.getElementById('my-row')?.scrollIntoView({behavior:'smooth',block:'center'}); },400);
    return ()=>clearTimeout(t);
  }, [account,region]);

  // mobile party — before early returns
  useEffect(() => {
    const fn = e => {
      const { type, text, ds } = e.detail;
      firePartyLocal(type, text);
      if (ds) { setBouncingDs(ds); setTimeout(()=>setBouncingDs(null), 700); }
      glowLevelRef.current = Math.min(glowLevelRef.current + 0.65, 1);
    };
    document.addEventListener('mob-party', fn);
    return () => document.removeEventListener('mob-party', fn);
  }, []);

  const navigateTip = (dir) => {
    const nextIdx = dir==='next'
      ? (tipIdx+1) % dailyTips.current.length
      : (tipIdx-1+dailyTips.current.length) % dailyTips.current.length;
    setTipSlideClass(dir==='next'?'tip-slide-in-right':'tip-slide-in-left');
    setTipVisible(false);
    setTimeout(()=>{ setTipIdx(nextIdx); setTipVisible(true); }, 50);
  };

  const login  = async () => { setAuthError(null); try { await msalInstance.loginRedirect(loginRequest); } catch(e) { setAuthError(e.message); } };
  const logout = () => msalInstance.logoutRedirect();

  if (denied)   return <AccessDeniedScreen email={account?.username||''} onLogout={logout}/>;
  if (!account) return <LoginScreen onLogin={login} isInitializing={!isInit} error={authError}/>;

  const me      = account.username.toLowerCase();
  const meStaff = getStaffEntry(me);

  const popAvatar = userId => {
    const el = document.getElementById(`av-${userId}`);
    if (el) {
      clearTimeout(partyTimerRef.current);
      el.style.transition='none'; el.style.transform='scale(1)';
      el.getBoundingClientRect();
      el.style.transition='transform 0.12s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.transform='scale(1.7)';
      partyTimerRef.current=setTimeout(()=>{ el.style.transition='transform 0.5s ease'; el.style.transform='scale(1)'; },500);
    }
    const onlineEl = document.getElementById(`online-av-${userId}`);
    if (onlineEl) {
      onlineEl.style.transition='none'; onlineEl.style.transform='scale(1)';
      onlineEl.getBoundingClientRect();
      onlineEl.style.transition='transform 0.15s cubic-bezier(0.34,1.56,0.64,1)';
      onlineEl.style.transform='scale(2.2)';
      setTimeout(()=>{ onlineEl.style.transition='transform 0.5s ease'; onlineEl.style.transform='scale(1)'; },500);
    }
  };

  const triggerMoodFly = (emo, clickedEl) => {
    if (emo === null) {
      if (meStaff) supabase.from('emotions').delete().eq('staff_id', meStaff.id)
        .then(() => setEmotions(em => { const n={...em}; delete n[meStaff.id]; return n; }));
      setSocialMenu(null);
      return;
    }
    if (!myAvatarRef.current || !clickedEl) return;
    const srcR = clickedEl.getBoundingClientRect();
    const avR  = myAvatarRef.current.getBoundingClientRect();
    flightOnLandRef.current = async () => {
      if (meStaff) await supabase.from('emotions').upsert({ staff_id: meStaff.id, emoji: emo });
      const avEl = myAvatarRef.current;
      if (avEl) {
        avEl.classList.remove('avatar-snap'); void avEl.offsetWidth;
        avEl.classList.add('avatar-snap');
        setTimeout(()=>avEl.classList.remove('avatar-snap'), 550);
      }
    };
    setFlight({
      icon:  emo,
      start: { x: srcR.left + srcR.width/2,  y: srcR.top + srcR.height/2 },
      end:   { x: avR.right - 5,             y: avR.bottom - 5 },
    });
    setSocialMenu(null);
  };

  const triggerStatusFly = (statusId, clickedEl, cellKey, onLand) => {
    const cfg = STATUS_CONFIG[statusId];
    if (!cfg || !clickedEl) return;
    const cellEl = document.querySelector(`[data-cell-key="${cellKey}"]`);
    if (!cellEl) return;
    const srcR  = clickedEl.getBoundingClientRect();
    const cellR = cellEl.getBoundingClientRect();
    flightOnLandRef.current = onLand;
    setFlight({
      icon:  cfg.icon,
      start: { x: srcR.left  + srcR.width/2,  y: srcR.top  + srcR.height/2 },
      end:   { x: cellR.left + cellR.width/2,  y: cellR.top + cellR.height/2 },
    });
  };

  const handleFlightComplete = () => {
    setFlight(null);
    if (flightOnLandRef.current) { flightOnLandRef.current(); flightOnLandRef.current = null; }
  };

  const handleStatusSelect = (key, statusId, e) => {
    e.stopPropagation();
    const parts   = key.split('-');
    const shift   = parts[parts.length-1];
    const staffId = parts[0];
    const date    = parts.slice(1,-1).join('-');
    triggerStatusFly(statusId, e.currentTarget, key, async () => {
      setRecords(r => ({ ...r, [key]: statusId }));
      setActiveMenu(null);
      setSnapCellKey(key);
      setTimeout(()=>setSnapCellKey(null), 400);
      setSaveStatus('saving');
      await supabase.from('statuses').upsert({ id:key, staff_id:staffId, date, shift, status:statusId });
      setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
    });
  };

  const handleBulkStatusSelect = (statusId, e) => {
    e.stopPropagation();
    if (bulkSelectCells.length === 0) return;
    const keysToFill = [...bulkSelectCells];
    triggerStatusFly(statusId, e.currentTarget, keysToFill[0], async () => {
      const staggerMap = {};
      keysToFill.forEach((k, i) => { staggerMap[k] = i * 45; });
      setStaggerCells(staggerMap);
      setTimeout(() => setStaggerCells({}), keysToFill.length * 45 + 350);
      setRecords(r => { const upd={...r}; keysToFill.forEach(ck=>{upd[ck]=statusId;}); return upd; });
      setActiveMenu(null); setBulkSelectCells([]);
      setSaveStatus('saving');
      await Promise.all(keysToFill.map(ck => {
        const parts=ck.split('-');
        const shift=parts[parts.length-1],staffId=parts[0],date=parts.slice(1,-1).join('-');
        return supabase.from('statuses').upsert({id:ck,staff_id:staffId,date,shift,status:statusId});
      }));
      setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
    });
  };

  const handleStatusClear = async (key, e) => {
    e.stopPropagation();
    setSaveStatus('saving');
    setRecords(r => { const n={...r}; delete n[key]; return n; });
    await supabase.from('statuses').delete().eq('id',key);
    setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
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
        const upd={...records};
        preview.forEach(([staffId,dateIdx,shift])=>{ delete upd[`${staffId}-${week_arr[dateIdx]}-${shift}`]; });
        setRecords(upd); setSaveStatus('saving'); setActiveMenu(null);
        (async()=>{
          await Promise.all(preview.map(([staffId,dateIdx,shift])=>supabase.from('statuses').delete().eq('id',`${staffId}-${week_arr[dateIdx]}-${shift}`)));
          setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000);
        })();
      }
    }
    setDragging(null); setPreview([]);
  };

  const handleStatusCellTouchStart=(staffId,dateIdx,shift,status,e)=>{
    if (!account||staffId!==meStaff?.id) return;
    touchDragRef.current = { staffId, dateIdx, shift, status, isEmptyCell: status==='none' };
    setDragging({ staffId, dateIdx, shift, status, isEmptyCell: status==='none' });
    setPreview([[staffId,dateIdx,shift]]);
  };

  const handleStatusCellTouchMove=(e)=>{
    if (!touchDragRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const cellEl = el.closest('[data-cell-touch]');
    if (!cellEl) return;
    const { staffId, dateIdx, shift } = cellEl.dataset;
    if (!staffId) return;
    handleStatusCellMouseOver(staffId, parseInt(dateIdx), shift);
  };

  const handleStatusCellTouchEnd=(e)=>{
    handleStatusCellMouseUp();
    touchDragRef.current = null;
  };

  const isPreviewCell=(staffId,dateIdx,shift)=>preview.some(([s,d,sh])=>s===staffId&&d===dateIdx&&sh===shift);

  const firePartyLocal=(type,text='')=>{
  const els=type==='weekend'?['🍷','🌟','🎵','🍱']:['🎉',text.split(' ')[0]||'✨','✨'];
  for (let i=0;i<28;i++) {
    const c=document.body.appendChild(document.createElement('div'));
    c.className = 'breach-suckable';  // 🆕 BREACH: mark as suckable
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
      const ov=document.createElement('div');
      ov.className='col-glow-overlay';
      ov.style.left=`${r.left}px`; ov.style.top=`${r.top}px`;
      ov.style.width=`${r.width}px`; ov.style.height=`${r.height}px`;
      document.body.appendChild(ov);
      setTimeout(()=>ov.remove(),2000);
    }
    firePartyLocal(type,text);
    popAvatar(meStaff?.id||'guest');
    glowLevelRef.current=Math.min(glowLevelRef.current+0.65,1);
    presenceRef.current?.send({type:'broadcast',event:'party',payload:{type,text,userId:meStaff?.id||'guest'}});

    // 🆕 BREACH: register click toward dimensional wall
    const breachKey = `${ds}-${type}`;
    const userId = meStaff?.id || 'guest';
    registerBreachClick(breachKey, userId, pill);
    presenceRef.current?.send({
      type: 'broadcast',
      event: 'pill-click',
      payload: { key: breachKey, userId },
    });
  };

  const handleTableScroll=()=>{
    if (headerRef.current&&scrollRef.current)
      headerRef.current.scrollLeft=scrollRef.current.scrollLeft;
  };

  const today    = fmt(new Date());
  const staffList = STAFF_LIST.filter(s=>s.region===region);

  const inOffice=(()=>{
    let n=0;
    staffList.forEach(s=>{
      if (!(!!records[`${s.id}-${today}-AM`]&&!!records[`${s.id}-${today}-PM`])) n++;
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
  const tdSlideClass=slideDir==='right'?'td-slide-right':slideDir==='left'?'td-slide-left':'';
  const nonEditableCols=week.reduce((acc,d,i)=>{ if (!d.editable) acc.push({...d,colIndex:i}); return acc; },[]);
  const currentTip = dailyTips.current[tipIdx];

  return (
    <div style={{minHeight:'100vh',background:'#F0F4FF'}} onMouseUp={handleStatusCellMouseUp} onTouchEnd={handleStatusCellTouchEnd}>
      <GlobalStyles/>
      <div ref={glowFrameRef} className="glow-frame"/>

      {showTour && (
        <TourOverlay onDone={()=>{
          setShowTour(false);
          setShowWelcome(true);
          setTimeout(()=>setShowWelcome(false), 3500);
          localStorage.setItem(`tour-done-${account.username}`,'1');
        }}/>
      )}

      {showWelcome && <WelcomeConfetti/>}

      {flight && (
        <EmojiFlyLayer
          key={`${flight.start.x}-${flight.start.y}-${Date.now()}`}
          flight={flight}
          onComplete={handleFlightComplete}
        />
      )}

      {nonEditableCols.map(d=>{
        const x = colXMap[d.ds];
        if (!x) return null;
        const isHol=!!d.hol;
        const holName=d.hol?d.hol.replace(/^\S+\s/,''):'';
        const isBouncing=bouncingDs===d.ds;
        return (
          <div key={d.ds} style={{position:'fixed',left:x,top:VH/2,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:200}}>
            <div key={isBouncing?`${d.ds}-b`:d.ds} className={isBouncing?'emoji-label-pop':''} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'48px',userSelect:'none',display:'inline-block',lineHeight:1}}>{isHol?d.hol.split(' ')[0]:'🏝️'}</span>
              <span style={{fontSize:'10px',fontWeight:'700',color:isHol?'#be185d':'#1d4ed8',letterSpacing:'0.06em',textAlign:'center',userSelect:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {isHol?holName:'WEEKEND'}
              </span>
            </div>
          </div>
        );
      })}

      {showTips && currentTip && (
        <div style={{position:'fixed',inset:0,zIndex:10500,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.45)',backdropFilter:'blur(4px)',animation:'dropIn 0.2s ease'}}>
          <div style={{background:'#fff',borderRadius:24,width:480,maxWidth:'92vw',padding:'36px 32px 30px',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'linear-gradient(90deg,#009bff,#770bff)'}}/>
            <button onClick={()=>setShowTips(false)} style={{position:'absolute',top:16,right:16,width:28,height:28,borderRadius:'50%',border:'none',background:'#f1f5f9',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#64748b'}} onMouseOver={e=>{e.currentTarget.style.background='#e2e8f0';}} onMouseOut={e=>{e.currentTarget.style.background='#f1f5f9';}}>✕</button>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
              <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,rgba(0,155,255,0.1),rgba(119,11,255,0.1))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <BulbIcon size={20} color='#770bff'/>
              </div>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:'#111827',letterSpacing:'-0.01em'}}>Wellbeing Daily Tips</div>
                <div style={{fontSize:12,fontWeight:500,color:'#9ca3af',marginTop:'3px'}}>{tipIdx+1} of {dailyTips.current.length} today</div>
              </div>
            </div>
            <div key={tipIdx} className={tipVisible?tipSlideClass:''} style={{minHeight:120,marginBottom:24}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:'100px',background:'linear-gradient(135deg,rgba(0,155,255,0.08),rgba(119,11,255,0.08))',border:'1px solid rgba(119,11,255,0.12)',marginBottom:12}}>
                <span style={{fontSize:15}}>{currentTip.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:'#5b21b6',letterSpacing:'0.04em'}}>{currentTip.category}</span>
              </div>
              <p style={{fontSize:17,lineHeight:1.7,color:'#334155',fontWeight:400,margin:0}}>{currentTip.text}</p>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <button onClick={()=>navigateTip('prev')} style={{width:36,height:36,borderRadius:10,border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#6b7280'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#009bff';e.currentTarget.style.color='#009bff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#6b7280';}}>‹</button>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                {dailyTips.current.map((_,i)=>(
                  <div key={i} onClick={()=>{setTipSlideClass(i>tipIdx?'tip-slide-in-right':'tip-slide-in-left');setTipVisible(false);setTimeout(()=>{setTipIdx(i);setTipVisible(true);},50);}}
                    style={{width:i===tipIdx?20:8,height:8,borderRadius:4,cursor:'pointer',transition:'all 0.3s',background:i===tipIdx?'linear-gradient(90deg,#009bff,#770bff)':'#e5e7eb'}}
                  />
                ))}
              </div>
              <button onClick={()=>navigateTip('next')} style={{width:36,height:36,borderRadius:10,border:'1.5px solid #e5e7eb',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#6b7280'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#770bff';e.currentTarget.style.color='#770bff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#6b7280';}}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="nav">
        <span className="nav-logo-text">Whereabouts</span>
        <div className={`nav-tab${activeTab==='calendar'?' active':''}`} onClick={()=>setActiveTab('calendar')}>Calendar</div>
        <div style={{position:'relative'}}>
          <div className={`nav-tab${activeTab==='planner'?' active':''}`} onClick={()=>setActiveTab(activeTab==='planner'?'calendar':'planner')}>Holiday Planner</div>
          {activeTab==='planner'&&(
            <div className="dsz" style={{position:'absolute',top:'calc(100% + 4px)',left:0,zIndex:10020,background:'#fff',borderRadius:16,width:320,padding:16,boxShadow:'0 16px 48px rgba(0,0,0,0.12)',border:'1px solid rgba(226,232,240,0.8)',animation:'dropIn 0.18s ease'}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#9ca3af',letterSpacing:'0.1em',marginBottom:'10px',padding:'0 4px'}}>{region.toUpperCase()} PUBLIC HOLIDAYS 2026</div>
              <div style={{maxHeight:'360px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'2px'}}>
                {plannerList().map(h=>(
                  <div key={h.date} className="plan-row" onClick={()=>jumpToDate(h.date)}>
                    <div><div className="plan-date">{h.date}</div><div className="plan-name">{h.day}</div></div>
                    <div style={{padding:'3px 10px',borderRadius:'8px',background:'linear-gradient(135deg,rgba(0,155,255,0.1),rgba(119,11,255,0.1))',fontSize:'11px',fontWeight:'600',color:'#5b21b6'}}>{h.name}</div>
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
          <button className="bulb-btn" onClick={()=>{setTipIdx(0);setShowTips(true);}} title="Wellbeing Daily Tips">
            <BulbIcon size={18} color='#fbbf24'/>
          </button>
          <div className="online-pill">
            <div className="online-stack">
              {onlineUsers.length === 0 ? (
                <div id={`online-av-${meStaff?.id}`} title={account.name} className="online-av" style={{zIndex:10,marginLeft:0}}>
                  <Avatar name={account.name} photoUrl={staffPhotos[meStaff?.id]} size={24}/>
                </div>
              ) : (
                onlineUsers.slice(0,4).map((u,i)=>(
                  <div key={u.email} id={`online-av-${u.id}`} title={u.name} className="online-av" style={{zIndex:10-i}}>
                    <Avatar name={u.name} photoUrl={staffPhotos[u.id]} size={24}/>
                  </div>
                ))
              )}
              {onlineUsers.length>4&&<div className="online-count">+{onlineUsers.length-4}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div className="online-live-dot"/>
              <span className="online-live-count" style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:500}}>{Math.max(onlineUsers.length,1)} online</span>
            </div>
          </div>
          <div className="user-chip">
            <span className="user-name">{account.name}</span>
            <Avatar name={meStaff?.name||account.name} photoUrl={staffPhotos[meStaff?.id]} size={28}/>
            <button className="signout-btn" onClick={logout} title="Sign out">
              {isMobile ? '→' : 'Sign out'}
            </button>
          </div>
        </div>
      </nav>

      {/* TOOLBAR */}
      <div className="toolbar">
        <button className="tb-btn icon" onClick={()=>navigateWeek(-7)}>‹</button>
        <button className="tb-btn today" onClick={e=>{
          navigateWeek(0,new Date());
          const btn=e.currentTarget;
          btn.classList.remove('today-glint'); void btn.offsetWidth;
          btn.classList.add('today-glint');
          setTimeout(()=>btn.classList.remove('today-glint'),600);
          setTodaySonar(true);
          setTimeout(()=>setTodaySonar(false),2000);
        }}>Today</button>
        <button className="tb-btn icon" onClick={()=>navigateWeek(7)}>›</button>
        <span className="tb-month">{viewDate.toLocaleString('en-US',{month:'long',year:'numeric'})}</span>
        <select className="tb-select" value={viewDate.getMonth()} onChange={e=>{
          const d=new Date(viewDate); d.setMonth(+e.target.value); d.setDate(1); navigateWeek(0,d);
        }}>
          {Array.from({length:12}).map((_,i)=>(
            <option key={i} value={i}>{new Date(2026,i,1).toLocaleString('en-US',{month:'long'})}</option>
          ))}
        </select>
        {isSuperUser(me) && (
          <div className="team-summary">
            <div className="team-summary-dot"/>
            <span>TEAM SUMMARY: {inOffice.n} / {inOffice.total} IN OFFICE TODAY</span>
          </div>
        )}
      </div>

      {/* LEGEND */}
      <div className="legend">
        <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#fdf2f8,#fce7f3)',border:'1.5px solid #f9a8d4'}}/>Holiday</div>
        <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',border:'1.5px solid #93c5fd'}}/>Weekend</div>
        <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#e8f0fe,#ede8fe)'}}/>My days</div>
        <div className="leg-item"><div className="leg-dot" style={{background:'#fafafa',border:'1.5px solid #f3f4f6'}}/>Team days</div>
      </div>

      {/* MOBILE OR DESKTOP */}
      {isMobile ? (
        <MobileView
          staffList={staffList}
          week={week}
          records={records}
          me={me}
          meStaff={meStaff}
          STATUS_CONFIG={STATUS_CONFIG}
          onStatusSelect={(key, sId) => {
            const parts=key.split('-');
            const shift=parts[parts.length-1],staffId=parts[0],date=parts.slice(1,-1).join('-');
            setRecords(r=>({...r,[key]:sId}));
            setSaveStatus('saving');
            supabase.from('statuses').upsert({id:key,staff_id:staffId,date,shift,status:sId})
              .then(()=>{ setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000); });
          }}
          onStatusClear={(key) => {
            setRecords(r=>{const n={...r};delete n[key];return n;});
            setSaveStatus('saving');
            supabase.from('statuses').delete().eq('id',key)
              .then(()=>{ setSaveStatus('saved'); setTimeout(()=>setSaveStatus(''),2000); });
          }}
          emotions={emotions}
          staffPhotos={staffPhotos}
          socialMenu={socialMenu}
          setSocialMenu={setSocialMenu}
          triggerMoodFly={triggerMoodFly}
          onlineUsers={onlineUsers}
        />
      ) : (
        <div className="tbl-outer dsz">
          <div className="tbl-card">
            <div className="tbl-hdr-sticky">
              <div ref={headerRef} className="tbl-hdr-row">
                <div className="tbl-hdr-namecol"/>
                {week.map(d=>(
                  <div key={d.ds} data-hdr-ds={d.ds} className="tbl-hdr-daycol">
                    <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'0.06em',marginBottom:'6px',color:d.isToday?'#770bff':'#9ca3af'}}>{d.dayName.toUpperCase()}</div>
                    <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',width:'34px',height:'34px'}}>
                      {d.isToday && todaySonar && (
                        <>
                          <div className="sonar-ring sonar-animate" style={{animationDelay:'0s',width:'34px',height:'34px'}}/>
                          <div className="sonar-ring sonar-animate" style={{animationDelay:'0.4s',width:'34px',height:'34px'}}/>
                        </>
                      )}
                      <div style={{width:'34px',height:'34px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'#111827',fontSize:'15px',fontWeight:'700',position:'relative',zIndex:1}}>
                        {d.num}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={scrollRef} className="tbl-scroll dsz" onScroll={handleTableScroll} onMouseLeave={handleStatusCellMouseUp} onTouchMove={handleStatusCellTouchMove}>
              <table className="main-tbl">
                <colgroup>
                  <col style={{width:'220px'}}/>
                  {week.map(d=><col key={d.ds}/>)}
                </colgroup>
                <tbody>
                  {staffList.map((m,rowIdx)=>{
                    const isMe=m.email.toLowerCase()===me;
                    const isFirst=rowIdx===0;
                    return (
                      <tr key={m.id} id={isMe?'my-row':undefined}>
                        <td className="sticky-c" style={{background:'#fff',padding:'0 8px 0 0'}}>
                          <div className="nw">
                            <div style={{display:'flex',alignItems:'center',gap:'10px',position:'relative',cursor:isMe?'pointer':'default'}} onClick={()=>{ if (!isMe) return; setSocialMenu(socialMenu===m.id?null:m.id); }}>
                              <div
                                ref={isMe?myAvatarRef:null}
                                id={`av-${m.id}`}
                                className={`n-av-wrap${isMe?' is-me':' is-other'}`}
                                style={{position:'relative'}}
                                onMouseEnter={e=>{ if (!isMe) e.currentTarget.style.transform='scale(1.1)'; }}
                                onMouseLeave={e=>{ if (!isMe) e.currentTarget.style.transform='scale(1)'; }}
                              >
                                <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={60} isMe={isMe}/>
                                {emotions[m.id]&&<div className="emo-tag">{emotions[m.id]}</div>}
                              </div>
                              <div>
                                <div className={`n-name${isMe?' me':''}`}>{m.name}</div>
                                {isMe&&<div className="n-you">YOU</div>}
                              </div>
                              {isMe&&socialMenu===m.id&&(
                                <div className="emo-picker dsz">
                                  {emotions[meStaff?.id] && (
                                    <div key="clear" onClick={e=>{ e.stopPropagation(); triggerMoodFly(null, null); }}
                                      style={{fontSize:'15px',cursor:'pointer',padding:'4px 6px',borderRadius:'6px',opacity:0.5,transition:'opacity 0.15s'}}
                                      onMouseOver={e=>e.currentTarget.style.opacity='1'}
                                      onMouseOut={e=>e.currentTarget.style.opacity='0.5'}
                                      title="Clear mood"
                                    >✕</div>
                                  )}
                                  {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo=>(
                                    <div key={emo} onClick={e=>{ e.stopPropagation(); triggerMoodFly(emo, e.currentTarget); }}
                                      style={{fontSize:'18px',cursor:'pointer',padding:'4px 6px',borderRadius:'6px',transition:'all 0.15s'}}
                                      onMouseOver={e=>{e.currentTarget.style.background='#f3f4f6';e.currentTarget.style.transform='scale(1.25)';}}
                                      onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.transform='scale(1)';}}
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
                              <td key={d.ds} className={`ptd ${tdSlideClass}`} rowSpan={staffList.length}>
                                <div
                                  data-pill-ds={d.ds}
                                  className={`pill ${isHol?'hol':'we'}`}
                                  onClick={e=>fireParty(e,isHol?'holiday':'weekend',d.hol||'',d.ds)}
                                  onTouchEnd={e=>{ e.preventDefault(); fireParty({currentTarget:e.currentTarget,stopPropagation:()=>{}},isHol?'holiday':'weekend',d.hol||'',d.ds); }}
                                >
                                  <div className="pill-card"/>
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td key={d.ds} className={tdSlideClass}>
                              <div className="dw">
                                {['AM','PM'].map((shift,si)=>{
                                  const key=`${m.id}-${d.ds}-${shift}`;
                                  const sid=records[key]||'none';
                                  const cfg=STATUS_CONFIG[sid];
                                  const open=activeMenu===key;
                                  const isPreview=isPreviewCell(m.id,weekIdx,shift);
                                  const isBulkSelected=bulkSelectCells.includes(key);
                                  const isSnapping=snapCellKey===key;
                                  const staggerDelay=staggerCells[key];
                                  const cls=!isMe?'sh other':sid!=='none'?'sh set':'sh mine';
                                  return (
                                    <div key={shift} style={{position:'relative'}}>
                                      <div
                                        data-cell-key={key}
                                        data-cell-touch="1"
                                        data-staff-id={m.id}
                                        data-date-idx={weekIdx}
                                        data-shift={shift}
                                        id={isFirst&&si===0?AM_REF:undefined}
                                        className={[cls,isPreview?'preview':'',isSnapping?'cell-snap':'',isBulkSelected?'bulk-selected':'',staggerDelay!==undefined?'cell-stagger':''].filter(Boolean).join(' ')}
                                        style={{
                                          ...(sid!=='none'?{background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}30`}:{}),
                                          ...(staggerDelay!==undefined?{animationDelay:`${staggerDelay}ms`}:{}),
                                          touchAction:'none',
                                        }}
                                        onMouseDown={e=>handleStatusCellMouseDown(m.id,weekIdx,shift,sid,e)}
                                        onMouseOver={()=>handleStatusCellMouseOver(m.id,weekIdx,shift)}
                                        onTouchStart={e=>handleStatusCellTouchStart(m.id,weekIdx,shift,sid,e)}
                                        onClick={e=>{
                                          if (!isMe) return;
                                          e.stopPropagation();
                                          if (preview.length<=1) {
                                            if (sid!=='none') handleStatusClear(key,e);
                                            else setActiveMenu(open?null:key);
                                          }
                                        }}
                                      >
                                        {sid!=='none'
                                          ? <><span className="sh-icon">{cfg.icon}</span><span>{shift}</span></>
                                          : shift
                                        }
                                      </div>
                                      {open&&isMe&&(
                                        <div className="s-drop dsz">
                                          <div style={{padding:'3px 10px 7px',fontSize:'10px',color:'#9ca3af',fontWeight:'600',borderBottom:'1px solid #f0f0f0',marginBottom:'3px',letterSpacing:'0.06em'}}>
                                            {bulkSelectCells.length>0?`${bulkSelectCells.length} CELLS`:'STATUS'}
                                          </div>
                                          {Object.entries(STATUS_CONFIG).map(([sId,sCfg])=>(
                                            <div key={sId} className="s-opt" onClick={e=>{ e.stopPropagation(); if (bulkSelectCells.length>0) handleBulkStatusSelect(sId,e); else handleStatusSelect(key,sId,e); }}>
                                              <span className="s-opt-icon">{sCfg.icon}</span>
                                              <span className="s-opt-label">{sCfg.label}</span>
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
      )}

      {/* 🆕 BREACH: dimensional wa~l overlay (always last) */}
<DimensionalBreachOverlay breach={activeBreach} chargingState={chargingState} />    </div>
  );
}