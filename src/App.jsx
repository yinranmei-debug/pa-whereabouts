import DayThemeStyles from './components/DayThemeStyles';
import ThemeToggle from './components/ThemeToggle';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import HOLIDAYS_DATA from './data/holidays.json';
import RAW_STAFF_LIST from './data/staff.json';
import STATUS_CONFIG from './data/status.json';
import TIPS_DATA from './data/tips.json';
import { createClient } from '@supabase/supabase-js';
import BirthdayOverlay from './components/BirthdayOverlay';
import GlobalStyles       from './components/GlobalStyles';
import Avatar             from './components/Avatar';
import LoginScreen        from './components/LoginScreen';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import EmojiFlyLayer      from './components/EmojiFlyLayer';
import TourOverlay        from './components/TourOverlay';
import MobileView         from './components/MobileView';
import { useDimensionalBreach }   from './hooks/useDimensionalBreach';
import DimensionalBreachOverlay   from './components/DimensionalBreachOverlay';
import BananaEasterEgg from './components/BananaEasterEgg';
import CakeThrow, { BdayHatSVG } from './components/CakeThrow';

const supabase = createClient(
  'https://vzdrpydtxlamoqtukgld.supabase.co',
  'sb_publishable_o1d0wmxwLrJCuTQ84uY38g__dqoj2dD'
);

const msalInstance = new PublicClientApplication(msalConfig);
const STAFF_LIST = RAW_STAFF_LIST.filter(p => p.id !== 'arthur');
const SUPER_USERS = ['arthur.cheung@patternasia.com', 'brenda.lee@patternasia.com', 'yinran.mei@patternasia.com'];
const CHINA_EXTRA = ['jessica.rao@patternasia.com'];

const isSuperUser  = em => SUPER_USERS.includes(em.toLowerCase());
const isChinaExtra = em => CHINA_EXTRA.includes(em.toLowerCase());
const getStaffEntry = em => RAW_STAFF_LIST.find(s => s.email.toLowerCase() === em.toLowerCase());

const ROW_H  = 140;
const NAV_H  = 80;
const TB_H   = 48;
const AM_REF = 'am-ref-btn';
const HEADER_STICKY_TOP = NAV_H + TB_H;

const fmt = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

const getDailyTips = () => {
  const today = new Date();
  // 用今天是今年第几天做 seed，确保每天不同
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const seed = today.getFullYear() * 1000 + dayOfYear;

  // Fisher-Yates shuffle with seeded random
  const seededRand = (s) => {
    let x = Math.sin(s + 1) * 10000;
    return x - Math.floor(x);
  };

  // 打乱所有 tips，然后按 category 去重取前3
  const shuffled = [...TIPS_DATA]
    .map((tip, i) => ({ tip, sort: seededRand(seed * 97 + i) }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.tip);

  const picked = [];
  const usedCats = new Set();
  for (const tip of shuffled) {
    if (picked.length >= 3) break;
    if (!usedCats.has(tip.category)) {
      usedCats.add(tip.category);
      picked.push(tip);
    }
  }
  return picked;
};

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
          <div key={p.id} style={{
            position:'absolute', left:`${p.left}%`, top:'-16px',
            width: p.size, height: p.shape==='rect' ? p.size*0.6 : p.size,
            borderRadius: p.shape==='circle' ? '50%' : '2px',
            background: p.color,
            '--drift': `${p.drift}px`, '--spin': `${p.spin}deg`,
            animation: `confettiFall ${p.duration}s ${p.delay}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
            willChange: 'transform, opacity',
          }}/>
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
  const [hoveredPill,     setHoveredPill]     = useState(null);
  const [birthdayDone, setBirthdayDone] = useState(() => {
    const key = `bday-done-${new Date().toDateString()}`;
    return !!localStorage.getItem(key);
  });
  const [celebrateTarget, setCelebrateTarget] = useState(null);
  const [celebratePrompt, setCelebratePrompt] = useState(false);
  const [crownedId,       setCrownedId]       = useState(null);
  const [splatId,         setSplatId]         = useState(null);
  const [bdayToast,       setBdayToast]       = useState(null);
  const [bdayToastOut,    setBdayToastOut]    = useState(false);
  const [staffTitles,     setStaffTitles]     = useState({});
 const [cakeThrowActive, setCakeThrowActive] = useState(false);
  const [bdayHatId,       setBdayHatId]       = useState(null);
  const [isDayMode,       setIsDayMode]       = useState(
    () => localStorage.getItem('whereabouts-theme') === 'day'
  );
  const toggleTheme = () => {
    setIsDayMode(prev => {
      const next = !prev;
      localStorage.setItem('whereabouts-theme', next ? 'day' : 'night');
      document.body.classList.toggle('day-mode', next);
      return next;
    });
  };
 const celebratePromptTimer = useRef(null);
  const weeklyReadKey = account
    ? `weekly-read-${account.username}-${(() => { const d=new Date(); const day=d.getDay(); d.setDate(d.getDate()-day+(day===0?-6:1)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}`
    : null;

  // 必须在 sequence effect 之前定义
  const todayMMDD_hook = (() => {
    const t = new Date();
    return `${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  })();
  const hasBirthdayToday_hook = RAW_STAFF_LIST.some(s => s.birthday === todayMMDD_hook);

  const [showWeeklyPanel,   setShowWeeklyPanel]   = useState(false);
  const [showBdayPanel,     setShowBdayPanel]      = useState(false);
  const [weeklyUpdates,     setWeeklyUpdates]      = useState([]);
 const [weeklyUpdatesCount, setWeeklyUpdatesCount] = useState(0);
  const [weeklyReadCount,    setWeeklyReadCount]    = useState(0);
  const [newUpdate,         setNewUpdate]          = useState('');
  const dailyTips = useRef(getDailyTips());

  const { activeBreach, chargingState, registerClick: registerBreachClick } = useDimensionalBreach();
  const slideTimerRef    = useRef(null);
  const presenceRef      = useRef(null);
  const partyTimerRef    = useRef(null);
  const scrollRef        = useRef(null);
  const headerRef        = useRef(null);
  const glowFrameRef     = useRef(null);
  const glowLevelRef     = useRef(0);
  const glowRafRef       = useRef(null);
  const myAvatarRef      = useRef(null);
  const flightOnLandRef  = useRef(null);
  const touchDragRef     = useRef(null);
  const finishingTourRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const fn = e => setIsMobile(e.matches);
    mq.addEventListener('change', fn);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('day-mode', isDayMode);
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

  // ── Sequence: Tour → Bday → Tips → Welcome → Banana ──────
  useEffect(() => {
    if (!account) return;
    const tourKey = `tour-done-${account.username}`;

    // DEV: always show tour on refresh — remove `true ||` when done testing
   if (!localStorage.getItem(tourKey)) {
      setShowTour(true);
      return;
    }

    // Returning user: Bday handled by BirthdayOverlay (isBusy gate)
    // Tips fire after bday is done (or if no bday today)
   if (birthdayDone || !hasBirthdayToday_hook) {
      const todayStr = new Date().toDateString();
      const tipKey = `tips-shown-${account.username}-${todayStr}`;
      if (!localStorage.getItem(tipKey)) {
        const t = setTimeout(() => {
          setShowTips(true);
          localStorage.setItem(tipKey, '1');
        }, 800);
        return () => clearTimeout(t);
      }
    }
  }, [account, birthdayDone, hasBirthdayToday_hook]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      let token;
      try { const r = await msalInstance.acquireTokenSilent({scopes:['User.ReadBasic.All'],account}); token=r.accessToken; }
      catch { try { const r = await msalInstance.acquireTokenPopup({scopes:['User.ReadBasic.All'],account}); token=r.accessToken; } catch(e){return;} }
      const photos={}, titles={};
      await Promise.all(RAW_STAFF_LIST.map(async s => {
        try {
          const [photoRes, profileRes] = await Promise.all([
            fetch(`https://graph.microsoft.com/v1.0/users/${s.email}/photo/$value`,{headers:{Authorization:`Bearer ${token}`}}),
            fetch(`https://graph.microsoft.com/v1.0/users/${s.email}?$select=jobTitle`,{headers:{Authorization:`Bearer ${token}`}}),
          ]);
          if (photoRes.ok) photos[s.id]=URL.createObjectURL(await photoRes.blob());
          if (profileRes.ok){ const d=await profileRes.json(); if(d.jobTitle) titles[s.id]=d.jobTitle; }
        } catch {}
      }));
      setStaffPhotos(photos);
      setStaffTitles(titles);
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

      // Weekly updates — load this week's, auto-clear old ones
      const weekStart = (() => {
        const d=new Date(); const day=d.getDay();
        d.setDate(d.getDate()-day+(day===0?-6:1));
        return fmt(d);
      })();
      await supabase.from('week_updates').delete().lt('week_start', weekStart);
      const {data:wData} = await supabase.from('week_updates').select('*').eq('week_start',weekStart).order('created_at',{ascending:true});
     if (wData) {
        setWeeklyUpdates(wData);
        setWeeklyUpdatesCount(wData.length);
        const readSoFar = parseInt(localStorage.getItem(`weekly-read-${account.username}-${weekStart}`) || '0');
        setWeeklyReadCount(readSoFar);
      }
      supabase.channel('week-updates-changes')
        .on('postgres_changes',{event:'*',schema:'public',table:'week_updates'},async ()=>{
          const {data} = await supabase.from('week_updates').select('*').eq('week_start',weekStart).order('created_at',{ascending:true});
          if (data) { setWeeklyUpdates(data); setWeeklyUpdatesCount(data.length); }
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
      .on('broadcast',{event:'pill-click'},({payload})=>{
        registerBreachClick(payload.key, payload.userId, null);
      })
      .on('broadcast',{event:'birthday-cake'},({payload})=>{
        if (payload.throwerId !== meStaffLocal?.id) {
          setCrownedId(payload.birthdayId);
          setTimeout(()=>setCrownedId(null),4000);
          setSplatId(payload.birthdayId);
          setTimeout(()=>setSplatId(null),800);
        }
        const thrower=payload.throwerName||'Someone';
        const bdayFirst=payload.birthdayName?.split(' ')[0]||'them';
        setBdayToast({text:` ${thrower} threw a cake at ${bdayFirst}!`});
        setBdayToastOut(false);
        setTimeout(()=>{setBdayToastOut(true);setTimeout(()=>setBdayToast(null),400);},4000);
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
      if (e.target.closest('.tour-overlay-card')) return;
      if (!e.target.closest('.dsz') && !e.target.closest('.nav-tab')) {
        setActiveMenu(null); setSocialMenu(null);
        setActiveTab(t => t === 'planner' ? 'calendar' : t);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
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

  useEffect(() => {
    const fn = e => {
      const { type, text, ds } = e.detail;
      const pr = chargingState?.progress || 0;
      const intensity = pr < 30 ? 1 : Math.max(0, 1 - (pr - 30) / 70);
      firePartyLocal(type, text, intensity);
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

  const firePartyLocal=(type,text='',intensity=1)=>{
    const els=type==='weekend'?['🍷','🌟','🎵','🍱']:['🎉',text.split(' ')[0]||'✨','✨'];
    const count = Math.max(0, Math.round(28 * intensity));
    if (count === 0) return;
    for (let i=0;i<count;i++) {
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
      const ov=document.createElement('div');
      ov.className='col-glow-overlay';
      ov.style.left=`${r.left}px`; ov.style.top=`${r.top}px`;
      ov.style.width=`${r.width}px`; ov.style.height=`${r.height}px`;
      document.body.appendChild(ov);
      setTimeout(()=>ov.remove(),2000);
    }
    const currentProgress = chargingState?.progress || 0;
    const intensity = currentProgress < 15
      ? 1
      : Math.max(0, 1 - (currentProgress - 15) / 85);
    firePartyLocal(type, text, intensity);
    popAvatar(meStaff?.id||'guest');
    glowLevelRef.current=Math.min(glowLevelRef.current+0.65,1);
    presenceRef.current?.send({type:'broadcast',event:'party',payload:{type,text,userId:meStaff?.id||'guest'}});
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

const handleCelebrate = (person) => {
    if (!person) return;
    setBirthdayDone(true);
    localStorage.setItem(`bday-done-${new Date().toDateString()}`, '1');
    setCelebrateTarget(person);

    const doScroll = () => {
      // if bday person is also "me", their row id is 'my-row'
      const rowId = person.email?.toLowerCase() === me ? 'my-row' : `bday-row-${person.id}`;
      const rowEl = document.getElementById(rowId);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowEl.style.transition = 'background 0.4s ease';
        rowEl.style.background = 'rgba(255,183,0,0.1)';
        setTimeout(() => { rowEl.style.background = ''; }, 1400);
        // show prompt after scroll settles
        setTimeout(() => {
          setCelebratePrompt(true);
          clearTimeout(celebratePromptTimer.current);
          celebratePromptTimer.current = setTimeout(() => setCelebratePrompt(false), 8000);
        }, 700);
      } else {
        requestAnimationFrame(() => {
          const retryEl = document.getElementById(rowId);
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            retryEl.style.transition = 'background 0.4s ease';
            retryEl.style.background = 'rgba(255,183,0,0.1)';
            setTimeout(() => { retryEl.style.background = ''; }, 1400);
          }
          setTimeout(() => {
            setCelebratePrompt(true);
            clearTimeout(celebratePromptTimer.current);
            celebratePromptTimer.current = setTimeout(() => setCelebratePrompt(false), 8000);
          }, 700);
        });
      }
    };

    // use requestAnimationFrame to ensure DOM has painted after overlay closes
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
  };

  const handleBirthdayAvatarClick = (person) => {
    setCelebratePrompt(false);
    clearTimeout(celebratePromptTimer.current);
    setCakeThrowActive(true);
   glowLevelRef.current=Math.min(glowLevelRef.current+0.8,1);
    const bdayFirst=person.name.split(' ')[0];
    setBdayToast({text:`You threw a cake at ${bdayFirst}!`});
    setBdayToastOut(false);
    setTimeout(()=>{setBdayToastOut(true);setTimeout(()=>setBdayToast(null),400);},4000);
    presenceRef.current?.send({
      type:'broadcast',event:'birthday-cake',
      payload:{birthdayId:person.id,birthdayName:person.name,throwerId:meStaff?.id,throwerName:meStaff?.name||account.name},
    });
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
  const todayMMDD = (() => {
    const t = new Date();
    return `${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  })();
  const hasBirthdayToday = RAW_STAFF_LIST.some(s => s.birthday === todayMMDD);
  // expose for sequence effect above — note: this runs after hooks so
  // the effect above reads stale on first render, which is fine since
  // birthdayDone starts false and the effect re-runs when it changes.
  return (
    <>
      <div style={{minHeight:'100vh',background:'transparent',position:'relative',zIndex:3}} onMouseUp={handleStatusCellMouseUp} onTouchEnd={handleStatusCellTouchEnd}>
        <GlobalStyles/>
        <DayThemeStyles/>
        {isDayMode && <div className="day-bg-layer"/>}
        {/* Aurora */}
        <div className="aurora-wrap">
          <div className="aurora-1"/><div className="aurora-2"/><div className="aurora-3"/>
        </div>
        {/* Starfield */}
        <div className="starfield" aria-hidden="true">
          {Array.from({length:90}).map((_,i)=>{
            const sx=(i*73+17)%100, sy=(i*47+11)%100;
            const sz=i%5===0?2:1;
            const col=i%7===0?'rgba(255,240,180,0.7)':'rgba(255,255,255,0.6)';
            const dur=2+((i*31)%30)/10;
            return <div key={i} style={{position:'absolute',left:`${sx}%`,top:`${sy}%`,width:sz,height:sz,borderRadius:'50%',background:col,animation:`starTwinkle ${dur}s ${((i*17)%20)/10}s ease-in-out infinite`}}/>;
          })}
          <style>{`@keyframes starTwinkle{0%,100%{opacity:0.25}50%{opacity:1}}`}</style>
        </div>
        <div ref={glowFrameRef} className="glow-frame"/>
        <CakeThrow
          target={celebrateTarget}
          active={cakeThrowActive}
          onComplete={()=>setCakeThrowActive(false)}
          onHatReady={(id)=>setBdayHatId(id)}
        />
        <BirthdayOverlay
          currentUserEmail={account?.username}
          isBusy={showTips}
         onClose={() => {
            setBirthdayDone(true);
            localStorage.setItem(`bday-done-${new Date().toDateString()}`, '1');
          }}
          onCelebrate={handleCelebrate}
        />

        {/* Floating cake prompt */}
    {celebratePrompt && celebrateTarget && (() => {
          const avEl=document.getElementById(`av-${celebrateTarget.id}`);
          if (!avEl) return null;
          const r=avEl.getBoundingClientRect();
          return (
            <div style={{position:'fixed',left:r.right+12,top:r.top+r.height/2,zIndex:13200,pointerEvents:'auto',display:'flex',alignItems:'center',gap:6,animation:'cakePromptFadeIn 0.3s ease both',cursor:'pointer',transform:'translateY(-50%)'}} onClick={()=>handleBirthdayAvatarClick(celebrateTarget)}>
              <div style={{fontSize:20,lineHeight:1,animation:'cakePromptArrow 0.8s ease-in-out infinite'}}>👈</div>
              <div style={{background:'linear-gradient(135deg,#1e1b4b,#0f172a)',border:'1.5px solid rgba(167,139,250,0.5)',borderRadius:12,padding:'8px 14px',display:'flex',alignItems:'center',gap:8,boxShadow:'0 8px 32px rgba(119,11,255,0.4)',fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:'nowrap',animation:'cakePromptPulse 1.6s ease-in-out infinite'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.7)" stroke="rgba(255,183,0,0.6)" strokeWidth="1"/>
                  <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.5)" stroke="rgba(255,225,74,0.5)" strokeWidth="1"/>
                  <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,0.8)"/>
                  <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,0.8)"/>
                  <ellipse className="mh-flame" cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,0.95)"/>
                  <ellipse className="mh-flame" cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,0.95)" style={{animationDelay:'0.2s'}}/>
                </svg>
                <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>Click to throw a cake!</span>
              </div>
            </div>
          );
        })()}

        {/* Bday toast */}
       {bdayToast && (
          <div className={`bday-toast${bdayToastOut?' out':' in'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
              <rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.9)" stroke="rgba(255,183,0,0.7)" strokeWidth="1"/>
              <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.8)" stroke="rgba(255,225,74,0.6)" strokeWidth="1"/>
              <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,1)"/>
              <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,1)"/>
              <ellipse className="mh-flame" cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,1)"/>
              <ellipse className="mh-flame" cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,1)" style={{animationDelay:'0.2s'}}/>
            </svg>
            <span style={{fontSize:13,fontWeight:600,color:'#fff',lineHeight:1.4}}>{bdayToast.text}</span>
          </div>
        )}
        <BananaEasterEgg
          readySignal={!showTour && !showWelcome && !showTips && (!hasBirthdayToday_hook || birthdayDone)}
        />

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
                
               <span className="pill-emoji-vibe" style={{fontSize:'48px',userSelect:'none',display:'inline-block',lineHeight:1,filter:'drop-shadow(0 0 4px rgba(0,155,255,0.8)) drop-shadow(0 0 8px rgba(119,11,255,0.6))'}}>
  {isHol?d.hol.split(' ')[0]:'🏝️'}
</span>
                <span style={{fontSize:'10px',fontWeight:'700',color:isHol?'#be185d':'#1d4ed8',letterSpacing:'0.06em',textAlign:'center',userSelect:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {isHol?holName:'WEEKEND'}
                </span>
              </div>
            </div>
          );
        })}

       {/* ── Weekly Panel ── */}
        {showWeeklyPanel && (
          <div className="dsz" style={{position:'fixed',top:NAV_H+8,right:16,zIndex:10600,width:380,maxWidth:'95vw',background:'rgba(10,8,32,0.96)',backdropFilter:'blur(20px)',borderRadius:20,border:'1px solid rgba(167,139,250,0.2)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)',animation:'dropIn 0.2s ease',fontFamily:"'Plus Jakarta Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 20px 14px',borderBottom:'1px solid rgba(167,139,250,0.1)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:16,fontWeight:700,color:'#fff'}}>Team week at a glance</span>
              <button onClick={()=>setShowWeeklyPanel(false)} style={{width:28,height:28,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.08)',cursor:'pointer',color:'rgba(232,229,255,0.6)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>✕</button>
            </div>
            {/* Add update */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(167,139,250,0.08)',display:'flex',gap:10}}>
              <input
                value={newUpdate}
                onChange={e=>setNewUpdate(e.target.value)}
                onKeyDown={async e=>{ if(e.key==='Enter'&&newUpdate.trim()){
                  const weekStart=fmt((() => { const d=new Date(); const day=d.getDay(); d.setDate(d.getDate()-day+(day===0?-6:1)); return d; })());
                  const emoji = newUpdate.toLowerCase().includes('birthday')?'🎂':newUpdate.toLowerCase().includes('holiday')||newUpdate.toLowerCase().includes('leave')?'🌴':newUpdate.toLowerCase().includes('office')?'🏢':'📌';
                  await supabase.from('week_updates').insert({week_start:weekStart,emoji,title:newUpdate.trim(),body:'',author_id:meStaff?.id||'guest'});
                  setNewUpdate('');
                  const {data:fresh} = await supabase.from('week_updates').select('*').eq('week_start',weekStart).order('created_at',{ascending:true});
                  if(fresh){setWeeklyUpdates(fresh);setWeeklyUpdatesCount(fresh.length);}
                }}}
                placeholder="Add an update — e.g. Brett visits office"
                style={{flex:1,height:38,borderRadius:10,border:'1px solid rgba(167,139,250,0.2)',background:'rgba(255,255,255,0.05)',color:'#fff',fontSize:13,padding:'0 12px',outline:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}
              />
              <button
                onClick={async()=>{ if(!newUpdate.trim()) return;
                  const weekStart=fmt((() => { const d=new Date(); const day=d.getDay(); d.setDate(d.getDate()-day+(day===0?-6:1)); return d; })());
                  const emoji = newUpdate.toLowerCase().includes('birthday')?'🎂':newUpdate.toLowerCase().includes('holiday')||newUpdate.toLowerCase().includes('leave')?'🌴':newUpdate.toLowerCase().includes('office')?'🏢':'📌';
                  await supabase.from('week_updates').insert({week_start:weekStart,emoji,title:newUpdate.trim(),body:'',author_id:meStaff?.id||'guest'});
                  setNewUpdate('');
                  const {data:fresh} = await supabase.from('week_updates').select('*').eq('week_start',weekStart).order('created_at',{ascending:true});
                  if(fresh){setWeeklyUpdates(fresh);setWeeklyUpdatesCount(fresh.length);}
                }}
                style={{height:38,padding:'0 16px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#009bff,#770bff)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}
              >ADD</button>
            </div>
            {/* Auto entries: birthdays + holidays this week */}
            <div style={{maxHeight:320,overflowY:'auto',padding:'8px 12px 12px'}}>
              {/* Birthdays this week */}
              {week.map(d => {
                const bday = RAW_STAFF_LIST.find(s => {
                  const bd = s.birthday; // expected "MM-DD"
                  const ds = d.ds.slice(5); // "MM-DD" from "YYYY-MM-DD"
                  return bd === ds;
                });
                if (!bday) return null;
                return (
                  <div key={`bday-${d.ds}`} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 8px',borderRadius:12,background:'rgba(255,143,176,0.08)',border:'1px solid rgba(255,143,176,0.15)',marginBottom:8}}>
                   <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(255,143,176,0.2),rgba(255,183,0,0.2))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.8)" stroke="rgba(255,225,74,0.6)" strokeWidth="1"/>
                        <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,1)"/>
                        <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,1)"/>
                        <ellipse className="mh-flame" cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,1)"/>
                        <ellipse className="mh-flame" cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,1)" style={{animationDelay:'0.2s'}}/>
                      </svg>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:2}}>{bday.name.split(' ')[0]}'s birthday {d.isToday?'is today':'this week'}</div>
                      <div style={{fontSize:12,color:'rgba(232,229,255,0.5)'}}>Feel free to drop a big happy birthday! 🎂</div>
                    </div>
                  </div>
                );
              })}
              {/* Holidays this week */}
              {week.filter(d=>d.hol).map(d=>(
                <div key={`hol-${d.ds}`} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 8px',borderRadius:12,background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.15)',marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,rgba(167,139,250,0.3),rgba(106,199,255,0.3))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{d.hol.split(' ')[0]}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:2}}>{d.hol.replace(/^\S+\s/,'')} this {d.dayName}</div>
                    <div style={{fontSize:12,color:'rgba(232,229,255,0.5)'}}>Public holiday — offices closed.</div>
                  </div>
                </div>
              ))}
              {/* User-added updates */}
              {weeklyUpdates.map(u=>(
                <div key={u.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'10px 8px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(167,139,250,0.1)',marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(167,139,250,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{u.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:2}}>{u.title}</div>
                    {u.body&&<div style={{fontSize:12,color:'rgba(232,229,255,0.5)'}}>{u.body}</div>}
                  </div>
                  {u.author_id===meStaff?.id&&(
                   <button onClick={async()=>{
                      await supabase.from('week_updates').delete().eq('id',u.id);
                      setWeeklyUpdates(prev=>{const n=prev.filter(x=>x.id!==u.id);setWeeklyUpdatesCount(n.length);return n;});
                    }} style={{background:'none',border:'none',color:'rgba(232,229,255,0.3)',cursor:'pointer',fontSize:12,padding:'2px 4px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='rgba(255,100,100,0.7)'} onMouseOut={e=>e.currentTarget.style.color='rgba(232,229,255,0.3)'}>✕</button>
                  )}
                </div>
              ))}
              {week.every(d=>!RAW_STAFF_LIST.find(s=>s.birthday===d.ds.slice(5)))&&week.every(d=>!d.hol)&&weeklyUpdates.length===0&&(
                <div style={{textAlign:'center',padding:'24px 0',color:'rgba(232,229,255,0.3)',fontSize:13}}>No updates this week yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Birthday Panel ── */}
        {showBdayPanel && (() => {
          const bdayPerson = RAW_STAFF_LIST.find(s => s.birthday === todayMMDD);
          if (!bdayPerson) return null;
          const theme = (() => {
            const BIRTHDAY_THEMES = ['wizard','upsidedown','polaroid','dinosaur','ufo','corporate','omelet'];
            const idx = ['heidi','bill','chen','vicky','arthur','yinran','mony','ricardo','shannon','nic','jean','anita','jennifer','charlotte','jason','james_l','brenda','grace'].indexOf(bdayPerson.id);
            return BIRTHDAY_THEMES[(idx >= 0 ? idx : 0) % BIRTHDAY_THEMES.length];
          })();
          return (
            <div className="dsz" style={{position:'fixed',top:NAV_H+8,right:16,zIndex:10600,width:340,background:'linear-gradient(135deg,rgba(10,5,30,0.97),rgba(20,10,40,0.97))',backdropFilter:'blur(20px)',borderRadius:20,border:'1px solid rgba(255,183,0,0.25)',boxShadow:'0 20px 60px rgba(0,0,0,0.6)',animation:'dropIn 0.2s ease',overflow:'hidden',fontFamily:"'Plus Jakarta Sans',sans-serif"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,183,0,0.1)'}}>
                <span style={{fontSize:15,fontWeight:700,color:'#fff'}}>🎂 Happy Birthday, {bdayPerson.name.split(' ')[0]}</span>
                <button onClick={()=>setShowBdayPanel(false)} style={{width:28,height:28,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.08)',cursor:'pointer',color:'rgba(232,229,255,0.6)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>✕</button>
              </div>
             <div style={{aspectRatio:'3/2',position:'relative',overflow:'hidden',background:'#0a0514'}}>
                <BirthdayOverlay
                  _forceStaffId={RAW_STAFF_LIST.find(s=>s.birthday===todayMMDD)?.id||'yinran'}
                  currentUserEmail={null}
                  isBusy={false}
                  onClose={()=>{}}
                  onCelebrate={()=>{}}
                />
              </div>
              <div style={{padding:'12px 20px 16px',textAlign:'center'}}>
                <button onClick={()=>{setShowBdayPanel(false);handleCelebrate(RAW_STAFF_LIST.find(s=>s.birthday===todayMMDD));}} style={{background:'linear-gradient(90deg,#009bff,#770bff)',border:'none',borderRadius:100,padding:'8px 24px',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:'0 4px 16px rgba(119,11,255,0.35)'}}>
                  Celebrate! 🎉
                </button>
              </div>
            </div>
          );
        })()}

        {/* Tips modal */}
        {showTips && currentTip && (
          <div style={{position:'fixed',inset:0,zIndex:10500,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,0.45)',backdropFilter:'blur(4px)',animation:'dropIn 0.2s ease'}}>
            <div style={{background:'rgba(13,10,35,0.95)',backdropFilter:'blur(20px)',borderRadius:24,width:480,maxWidth:'92vw',padding:'36px 32px 30px',boxShadow:'0 24px 64px rgba(0,0,0,0.5)',position:'relative',overflow:'hidden',border:'1px solid rgba(167,139,250,0.2)'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#009bff,#770bff)'}}/>
              <button onClick={()=>setShowTips(false)} style={{position:'absolute',top:16,right:16,width:28,height:28,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.08)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'rgba(232,229,255,0.6)'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.14)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';}}>✕</button>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}>
               <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,rgba(45,27,105,0.8),rgba(30,27,75,0.8))',border:'1.5px solid rgba(139,92,246,0.45)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none" overflow="visible">
                    <defs>
                      <radialGradient id="tipPlanetGrad" cx="35%" cy="32%" r="65%">
                        <stop offset="0%" stopColor="#c4b5fd"/>
                        <stop offset="40%" stopColor="#8b5cf6"/>
                        <stop offset="100%" stopColor="#2e1065"/>
                      </radialGradient>
                    </defs>
                    <circle cx="13" cy="13" r="7" fill="url(#tipPlanetGrad)"/>
                    <ellipse cx="13" cy="13" rx="13" ry="4" fill="none" stroke="rgba(167,139,250,0.75)" strokeWidth="1.5" style={{transformOrigin:'13px 13px'}}/>
                    <circle cx="2" cy="4" r="1.1" fill="rgba(196,181,253,0.8)"/>
                    <circle cx="23" cy="3" r="0.85" fill="rgba(106,199,255,0.8)"/>
                    <circle cx="24" cy="22" r="1" fill="rgba(196,181,253,0.7)"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:'-0.01em'}}>Daily Mind Huddle</div>
                  <div style={{fontSize:12,fontWeight:500,color:'rgba(232,229,255,0.45)',marginTop:'3px'}}>{tipIdx+1} of {dailyTips.current.length} today</div>
                </div>
              </div>
              <div key={tipIdx} className={tipVisible?tipSlideClass:''} style={{minHeight:120,marginBottom:24}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:'100px',background:'linear-gradient(135deg,rgba(0,155,255,0.12),rgba(119,11,255,0.12))',border:'1px solid rgba(119,11,255,0.25)',marginBottom:12}}>
                  <span style={{fontSize:15}}>{currentTip.icon}</span>
                  <span style={{fontSize:12,fontWeight:700,color:'#c4b5fd',letterSpacing:'0.04em'}}>{currentTip.category}</span>
                </div>
                <p style={{fontSize:17,lineHeight:1.7,color:'rgba(232,229,255,0.82)',fontWeight:400,margin:0}}>{currentTip.text}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <button onClick={()=>navigateTip('prev')} style={{width:36,height:36,borderRadius:10,border:'1.5px solid rgba(167,139,250,0.2)',background:'rgba(255,255,255,0.05)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'rgba(232,229,255,0.5)'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#009bff';e.currentTarget.style.color='#009bff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.2)';e.currentTarget.style.color='rgba(232,229,255,0.5)';}}>‹</button>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {dailyTips.current.map((_,i)=>(
                    <div key={i} onClick={()=>{setTipSlideClass(i>tipIdx?'tip-slide-in-right':'tip-slide-in-left');setTipVisible(false);setTimeout(()=>{setTipIdx(i);setTipVisible(true);},50);}}
                      style={{width:i===tipIdx?20:8,height:8,borderRadius:4,cursor:'pointer',transition:'all 0.3s',background:i===tipIdx?'linear-gradient(90deg,#009bff,#770bff)':'rgba(167,139,250,0.2)'}}
                    />
                  ))}
                </div>
                <button onClick={()=>navigateTip('next')} style={{width:36,height:36,borderRadius:10,border:'1.5px solid rgba(167,139,250,0.2)',background:'rgba(255,255,255,0.05)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'rgba(232,229,255,0.5)'}} onMouseOver={e=>{e.currentTarget.style.borderColor='#770bff';e.currentTarget.style.color='#770bff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.2)';e.currentTarget.style.color='rgba(232,229,255,0.5)';}}>›</button>
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
              <div className="dsz" style={{position:'absolute',top:'calc(100% + 4px)',left:0,zIndex:10020,background:'rgba(13,10,35,0.96)',backdropFilter:'blur(20px)',borderRadius:16,width:320,padding:16,boxShadow:'0 16px 48px rgba(0,0,0,0.5)',border:'1px solid rgba(167,139,250,0.2)',animation:'dropIn 0.18s ease'}} onClick={e=>e.stopPropagation()}>
                <div style={{fontSize:'10px',fontWeight:'700',color:'rgba(232,229,255,0.45)',letterSpacing:'0.1em',marginBottom:'10px',padding:'0 4px'}}>{region.toUpperCase()} PUBLIC HOLIDAYS 2026</div>
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
            <ThemeToggle isDayMode={isDayMode} onToggle={toggleTheme}/>
           {/* ── Mind Hub 三按钮 ── */}
            <div style={{display:'flex',alignItems:'center',gap:8}}>

             {/* 🎂 Birthday button — always visible, red dot when bday + not yet celebrated */}
              <button
                onClick={()=>setShowBdayPanel(p=>!p)}
                title={hasBirthdayToday ? "Birthday today!" : "Birthdays"}
                style={{position:'relative',width:48,height:48,borderRadius:14,border:`1.5px solid ${hasBirthdayToday && !birthdayDone ? 'rgba(255,183,0,0.55)' : 'rgba(167,139,250,0.22)'}`,background:hasBirthdayToday && !birthdayDone ? 'rgba(30,15,5,0.7)' : 'rgba(15,10,40,0.7)',backdropFilter:'blur(8px)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',overflow:'visible'}}
                onMouseOver={e=>{e.currentTarget.style.transform='scale(1.12)';e.currentTarget.style.borderColor=hasBirthdayToday && !birthdayDone ? 'rgba(255,220,100,0.7)' : 'rgba(167,139,250,0.5)';}}
                onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.borderColor=hasBirthdayToday && !birthdayDone ? 'rgba(255,183,0,0.55)' : 'rgba(167,139,250,0.22)';}}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.7)" stroke="rgba(255,183,0,0.6)" strokeWidth="1"/>
                  <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.5)" stroke="rgba(255,225,74,0.5)" strokeWidth="1"/>
                  <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,0.8)"/>
                  <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,0.8)"/>
                  <ellipse className="mh-flame" cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,0.95)"/>
                  <ellipse className="mh-flame" cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,0.95)" style={{animationDelay:'0.2s'}}/>
                </svg>
              {hasBirthdayToday && !birthdayDone && (
                  <div style={{position:'absolute',top:-6,right:-6,minWidth:18,height:18,borderRadius:9,background:'linear-gradient(135deg,#ff8fb0,#e63946)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',padding:'0 4px',boxShadow:'0 2px 8px rgba(255,100,150,0.4)'}}>1</div>
                )}
              </button>

              {/* 📅 Weekly updates */}
             <button
                onClick={()=>{
                  setShowWeeklyPanel(p => {
                    if (!p && weeklyReadKey) {
                      // marking as read — store current count
                      localStorage.setItem(weeklyReadKey, String(weeklyUpdatesCount));
                      setWeeklyReadCount(weeklyUpdatesCount);
                    }
                    return !p;
                  });
                }}
                title="Team week at a glance"
                style={{position:'relative',width:48,height:48,borderRadius:14,border:'1.5px solid rgba(167,139,250,0.3)',background:'rgba(15,10,40,0.7)',backdropFilter:'blur(8px)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}
               onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.6)';e.currentTarget.style.transform='scale(1.12)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(167,139,250,0.3)';e.currentTarget.style.transform='scale(1)';}}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  {/* calendar body */}
                  <rect className="mh-star-1" x="3" y="5" width="18" height="16" rx="3" fill="rgba(167,139,250,0.15)" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5"/>
                  {/* header band */}
                  <rect x="3" y="5" width="18" height="5" rx="3" fill="rgba(167,139,250,0.35)"/>
                  <rect x="3" y="8" width="18" height="2" fill="rgba(167,139,250,0.35)"/>
                  {/* date hooks */}
                  <rect x="8" y="3" width="2" height="4" rx="1" fill="rgba(196,181,253,0.9)"/>
                  <rect x="14" y="3" width="2" height="4" rx="1" fill="rgba(106,199,255,0.9)"/>
                  {/* date dots */}
                  <circle className="mh-star-2" cx="8" cy="15" r="1.5" fill="rgba(196,181,253,0.9)"/>
                  <circle cx="12" cy="15" r="1.5" fill="rgba(167,139,250,0.6)"/>
                  <circle className="mh-star-3" cx="16" cy="15" r="1.5" fill="rgba(106,199,255,0.8)"/>
                  <circle cx="8" cy="18.5" r="1.5" fill="rgba(167,139,250,0.5)"/>
                  <circle cx="12" cy="18.5" r="1.5" fill="rgba(196,181,253,0.7)"/>
                </svg>
                {weeklyUpdatesCount > weeklyReadCount && (
                  <div style={{position:'absolute',top:-6,right:-6,minWidth:18,height:18,borderRadius:9,background:'linear-gradient(135deg,#009bff,#770bff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',padding:'0 4px',boxShadow:'0 2px 8px rgba(119,11,255,0.4)'}}>{weeklyUpdatesCount - weeklyReadCount}</div>
                )}
              </button>

            
<button
                onClick={()=>{ setTipIdx(0); setShowTips(true); }}
                title="Daily Mind Huddle"
                style={{position:'relative',width:48,height:48,borderRadius:14,border:'1.5px solid rgba(139,92,246,0.45)',background:'linear-gradient(135deg,rgba(45,27,105,0.8),rgba(30,27,75,0.8))',backdropFilter:'blur(8px)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',overflow:'visible'}}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(196,181,253,0.7)';e.currentTarget.style.transform='scale(1.12)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.45)';e.currentTarget.style.transform='scale(1)';}}
              >
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" overflow="visible">
                  <defs>
                    <radialGradient id="planetGrad" cx="35%" cy="32%" r="65%">
                      <stop offset="0%" stopColor="#c4b5fd"/>
                      <stop offset="40%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="#2e1065"/>
                    </radialGradient>
                  </defs>
                  <circle className="mh-planet-body" cx="13" cy="13" r="7" fill="url(#planetGrad)"/>
                  <ellipse className="mh-ring" cx="13" cy="13" rx="13" ry="4" fill="none" stroke="rgba(167,139,250,0.75)" strokeWidth="1.5"/>
                  <circle className="mh-star-1" cx="2" cy="4" r="1.1" fill="rgba(196,181,253,0.8)"/>
                  <circle className="mh-star-2" cx="23" cy="3" r="0.85" fill="rgba(106,199,255,0.8)"/>
                  <circle className="mh-star-3" cx="24" cy="22" r="1" fill="rgba(196,181,253,0.7)"/>
                </svg>
              </button>
            </div>

              
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
          <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#ff0078,#b400ff)',border:'1.5px solid rgba(255,0,120,0.6)'}}/>Holiday</div>
          <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#009bff,#6400ff)',border:'1.5px solid rgba(0,155,255,0.65)'}}/>Weekend</div>
          <div className="leg-item"><div className="leg-dot" style={{background:'linear-gradient(135deg,#2a1060,#3a1580)',border:'1.5px solid rgba(167,139,250,0.5)'}}/>My days</div>
          <div className="leg-item"><div className="leg-dot" style={{background:'rgba(180,190,210,0.35)',border:'1.5px solid rgba(150,160,190,0.4)'}}/>Team days</div>
          {isSuperUser(me) && (
            <div className="team-summary" style={{marginLeft:'auto'}}>
              <div className="team-summary-dot"/>
              <span>TEAM: {inOffice.n} / {inOffice.total} IN OFFICE</span>
            </div>
          )}
        </div>

       

        {/* MAIN TABLE / MOBILE */}
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
          <>
          <div className="section-title">
            <span>THIS WEEK · {(() => {
              const mon = week.find(d=>d.editable);
              const sun = [...week].reverse().find(d=>d.editable);
              if (!mon||!sun) return '';
              const fmt2 = d => new Date(d.ds).toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase();
              return `${fmt2(mon)} – ${fmt2(sun)}`;
            })()}</span>
            <span className="section-title-hint">Drag a cell or tap to set your status</span>
          </div>
          <div className="tbl-outer dsz">
            <div className="tbl-card">
              <div className="tbl-hdr-sticky">
                <div ref={headerRef} className="tbl-hdr-row">
                  <div className="tbl-hdr-namecol"/>
                {week.map(d=>{
                    const bdayOnDay = RAW_STAFF_LIST.find(s => s.birthday === d.ds.slice(5));
                    return (
                    <div key={d.ds} data-hdr-ds={d.ds} className="tbl-hdr-daycol" style={{position:'relative'}}>
                      {bdayOnDay && (() => {
                        const [hov, setHov] = React.useState(false);
                        return (
                          <div style={{position:'absolute',top:2,right:2,zIndex:20}}
                            onMouseEnter={()=>setHov(true)}
                            onMouseLeave={()=>setHov(false)}>
                            <div style={{
                              cursor:'default', lineHeight:1,
                              filter:'drop-shadow(0 2px 6px rgba(255,183,0,0.6))',
                              transition:'transform 0.15s',
                              transform: hov ? 'scale(1.2)' : 'scale(1)',
                            }}>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <rect x="4" y="13" width="16" height="8" rx="2" fill="rgba(255,143,176,0.95)" stroke="rgba(255,183,0,0.8)" strokeWidth="1"/>
                                <rect x="6" y="10" width="12" height="5" rx="1.5" fill="rgba(255,183,0,0.9)" stroke="rgba(255,225,74,0.6)" strokeWidth="0.8"/>
                                <rect x="8" y="5" width="2" height="5" rx="1" fill="rgba(167,139,250,1)"/>
                                <rect x="14" y="5" width="2" height="5" rx="1" fill="rgba(106,199,255,1)"/>
                                <ellipse cx="9" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,220,50,1)"/>
                                <ellipse cx="15" cy="4.5" rx="1.2" ry="1.8" fill="rgba(255,160,50,1)"/>
                              </svg>
                            </div>
                            {hov && (
                              <div style={{
                                position:'absolute', bottom:'calc(100% + 8px)', right:0,
                                background:'linear-gradient(135deg,rgba(13,10,35,0.97),rgba(7,24,54,0.97))',
                                border:'1px solid rgba(255,183,0,0.35)',
                                borderRadius:10, padding:'6px 10px',
                                fontSize:11, fontWeight:700, color:'#fff',
                                whiteSpace:'nowrap',
                                boxShadow:'0 4px 16px rgba(0,0,0,0.35)',
                                pointerEvents:'none',
                                animation:'dropIn 0.15s ease',
                                fontFamily:"'Plus Jakarta Sans',sans-serif",
                              }}>
                                🎂 {bdayOnDay.name.split(' ')[0]}'s birthday!
                                <div style={{
                                  position:'absolute', bottom:-5, right:8,
                                  width:10, height:10,
                                  background:'rgba(13,10,35,0.97)',
                                  border:'1px solid rgba(255,183,0,0.35)',
                                  borderTop:'none', borderLeft:'none',
                                  transform:'rotate(45deg)',
                                }}/>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <div style={{fontSize:'11px',fontWeight:'700',letterSpacing:'0.06em',marginBottom:'6px',color:d.isToday?'#770bff':'#9ca3af'}}>{d.dayName.toUpperCase()}</div>
                      <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',width:'34px',height:'34px'}}>
                        {d.isToday && todaySonar && (
                          <>
                            <div className="sonar-ring sonar-animate" style={{animationDelay:'0s',width:'34px',height:'34px'}}/>
                            <div className="sonar-ring sonar-animate" style={{animationDelay:'0.4s',width:'34px',height:'34px'}}/>
                          </>
                        )}
                        <div style={{width:'34px',height:'34px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'rgba(232,229,255,0.85)',fontSize:'15px',fontWeight:'700',position:'relative',zIndex:1}}>
                          {d.num}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div ref={scrollRef} className="tbl-scroll dsz" onScroll={handleTableScroll} onMouseLeave={handleStatusCellMouseUp} onTouchMove={handleStatusCellTouchMove}>
                <table className="main-tbl">
                  <colgroup>
                    <col style={{width:'220px'}}/>
                    {week.map(d=><col key={d.ds} style={{width:'calc((100% - 220px) / 7)'}}/>)}
                  </colgroup>
                  <tbody>
                    {staffList.map((m,rowIdx)=>{
                      const isMe=m.email.toLowerCase()===me;
                      const isFirst=rowIdx===0;
                      return (
                     <tr key={m.id} id={isMe?'my-row':`bday-row-${m.id}`}>
                          <td className="sticky-c" style={{padding:'0 8px 0 0',background:'rgba(8,12,35,0.96)'}}>
                            <div className="nw">
                              <div style={{display:'flex',alignItems:'center',gap:'10px',position:'relative',cursor:isMe?'pointer':'default'}} onClick={()=>{ if (!isMe) return; setSocialMenu(socialMenu===m.id?null:m.id); }}>
                                <div
                                  ref={isMe?myAvatarRef:null}
                                  id={`av-${m.id}`}
                                  className={`n-av-wrap${isMe?' is-me':' is-other'}`}
                                  style={{position:'relative'}}
                                  onMouseEnter={e=>{ if (!isMe) e.currentTarget.style.transform='scale(1.1)'; }}
                                  onMouseLeave={e=>{ if (!isMe) e.currentTarget.style.transform='scale(1)'; }}
                                  onClick={e=>{ if (isMe) return; if (celebrateTarget?.id===m.id && celebratePrompt){e.stopPropagation();handleBirthdayAvatarClick(m);} }}
                                >
                                  <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={60} isMe={isMe}/>
                                  {emotions[m.id]&&<div className="emo-tag">{emotions[m.id]}</div>}
                                  {bdayHatId===m.id&&(
                                    <div style={{position:'absolute',top:-26,left:'50%',transform:'translateX(-50%)',pointerEvents:'none',zIndex:202,filter:'drop-shadow(0 2px 6px rgba(255,183,0,0.5))'}}>
                                      <BdayHatSVG size={40}/>
                                    </div>
                                  )}
                                 
                                </div>
                                <div>
                                  <div className={`n-name${isMe?' me':''}`}>{m.name}</div>
                                  {isMe&&<div className="n-you">YOU</div>}
                                  {staffTitles[m.id]&&<div className="n-title">{staffTitles[m.id]}</div>}
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
                                      onMouseOver={e=>{e.currentTarget.style.background='rgba(167,139,250,0.15)';e.currentTarget.style.transform='scale(1.25)';}}
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
                                    onClick={e => {
                                      const pillEl = e.currentTarget;
                                      pillEl.classList.remove('holi-tap');
                                      void pillEl.offsetWidth;
                                      pillEl.classList.add('holi-tap');
                                      fireParty(e, isHol?'holiday':'weekend', d.hol||'', d.ds);
                                    }}
                                    onTouchEnd={e=>{ e.preventDefault(); fireParty({currentTarget:e.currentTarget,stopPropagation:()=>{}},isHol?'holiday':'weekend',d.hol||'',d.ds); }}
                                    onMouseEnter={e=>{
                                      const rect=e.currentTarget.getBoundingClientRect();
                                      setHoveredPill({ ds: d.ds, x: rect.left+rect.width/2, y: rect.top-14 });
                                      const pillEl = e.currentTarget;
                                      pillEl.classList.remove('pill-hover-bounce');
                                      void pillEl.offsetWidth;
                                      pillEl.classList.add('pill-hover-bounce');
                                      setTimeout(() => pillEl.classList.remove('pill-hover-bounce'), 800);
                                    }}
                                    onMouseLeave={()=>setHoveredPill(null)}
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
                                    const cls=!isMe?(sid!=='none'?'sh set other':'sh other'):sid!=='none'?'sh set':'sh mine';
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
                                            ...(sid!=='none'?{
                                              background:cfg.bg,
                                              color:cfg.color,
                                              border:`1.5px solid ${cfg.border||cfg.color}`,
                                              boxShadow:cfg.glow||'none',
                                              backdropFilter:'blur(8px) saturate(120%)',
                                            }:{}),
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
                                           <div style={{padding:'3px 10px 7px',fontSize:'10px',color:'rgba(167,139,250,0.5)',fontWeight:'600',borderBottom:'1px solid rgba(167,139,250,0.1)',marginBottom:'3px',letterSpacing:'0.06em'}}>
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
          </>
        )}

        <DimensionalBreachOverlay breach={activeBreach} chargingState={chargingState} />
      </div>

      {showTour && (
        <TourOverlay
          key={`tour-${account.username}`}
          onDone={() => {
            if (finishingTourRef.current) return;
            finishingTourRef.current = true;
            localStorage.setItem(`tour-done-${account.username}`, '1');
            setShowTour(false);
            setShowWelcome(true);
            setTimeout(() => {
              setShowWelcome(false);
              finishingTourRef.current = false;
            }, 3500);
          }}
        />
      )}
      {showWelcome && <WelcomeConfetti />}
    </>
  );
}