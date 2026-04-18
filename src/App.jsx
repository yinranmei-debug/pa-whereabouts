import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import HOLIDAYS_DATA from './data/holidays.json';
import RAW_STAFF_LIST from './data/staff.json';
import STATUS_CONFIG from './data/status.json';
import { createClient } from '@supabase/supabase-js';

import GlobalStyles       from './components/GlobalStyles';
import Avatar             from './components/Avatar';
import LoginScreen        from './components/LoginScreen';
import AccessDeniedScreen from './components/AccessDeniedScreen';
import EmojiFlyLayer      from './components/EmojiFlyLayer';

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
  const [staggerCells,    setStaggerCells]    = useState({});
  const [bouncingDs,      setBouncingDs]      = useState(null);
  const [slideDir,        setSlideDir]        = useState(null);
  const [colXMap,         setColXMap]         = useState({});
  const [flight,          setFlight]          = useState(null);
  const [snapCellKey,     setSnapCellKey]     = useState(null);
  const [todaySonar,      setTodaySonar]      = useState(false);

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

  const triggerMoodFly = (emo, clickedEl) => {
    if (!myAvatarRef.current || !clickedEl) return;
    const srcR = clickedEl.getBoundingClientRect();
    const avR  = myAvatarRef.current.getBoundingClientRect();
    flightOnLandRef.current = async () => {
      if (meStaff) await supabase.from('emotions').upsert({ staff_id: meStaff.id, emoji: emo });
      const avEl = myAvatarRef.current;
      if (avEl) {
        avEl.classList.remove('avatar-snap');
        void avEl.offsetWidth;
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
      setRecords(r => {
        const upd = { ...r };
        keysToFill.forEach(ck => { upd[ck] = statusId; });
        return upd;
      });
      setActiveMenu(null);
      setBulkSelectCells([]);
      setSaveStatus('saving');
      await Promise.all(keysToFill.map(ck => {
        const parts   = ck.split('-');
        const shift   = parts[parts.length-1];
        const staffId = parts[0];
        const date    = parts.slice(1,-1).join('-');
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

  return (
    <div style={{minHeight:'100vh',background:'#f4f5f7'}} onMouseUp={handleStatusCellMouseUp}>
      <GlobalStyles/>
      <div ref={glowFrameRef} className="glow-frame"/>

      {flight && (
        <EmojiFlyLayer
          key={`${flight.start.x}-${flight.start.y}-${Date.now()}`}
          flight={flight}
          onComplete={handleFlightComplete}
        />
      )}

      {activeTab==='calendar' && nonEditableCols.map(d=>{
        const x = colXMap[d.ds];
        if (!x) return null;
        const isHol=!!d.hol;
        const holName=d.hol?d.hol.replace(/^\S+\s/,''):'';
        const isBouncing=bouncingDs===d.ds;
        return (
          <div key={d.ds} style={{position:'fixed',left:x,top:VH/2,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:200}}>
            <div
              key={isBouncing?`${d.ds}-b`:d.ds}
              className={isBouncing?'emoji-label-pop':''}
              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}
            >
              <span style={{fontSize:'48px',userSelect:'none',display:'inline-block',lineHeight:1}}>
                {isHol?d.hol.split(' ')[0]:'🏝️'}
              </span>
              <span style={{fontSize:'10px',fontWeight:'700',color:isHol?'#be185d':'#1d4ed8',letterSpacing:'0.06em',textAlign:'center',userSelect:'none',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
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
        <button
          className="tb-btn today"
          onClick={e=>{
            navigateWeek(0,new Date());
            const btn=e.currentTarget;
            btn.classList.remove('today-glint');
            void btn.offsetWidth;
            btn.classList.add('today-glint');
            setTimeout(()=>btn.classList.remove('today-glint'),600);
            setTodaySonar(true);
            setTimeout(()=>setTodaySonar(false),2000);
          }}
        >Today</button>
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
        <div className="tbl-hdr-sticky">
          <div ref={headerRef} className="tbl-hdr-row">
            <div className="tbl-hdr-namecol"/>
            {week.map(d=>(
              <div key={d.ds} data-hdr-ds={d.ds} className="tbl-hdr-daycol">
                <div style={{fontSize:'10px',fontWeight:'600',letterSpacing:'0.06em',marginBottom:'5px',color:d.isToday?'#770bff':'#9ca3af'}}>
                  {d.dayName.toUpperCase()}
                </div>
                <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',width:'30px',height:'30px'}}>
                  {d.isToday && todaySonar && (
                    <>
                      <div className="sonar-ring sonar-animate" style={{animationDelay:'0s'}}/>
                      <div className="sonar-ring sonar-animate" style={{animationDelay:'0.4s'}}/>
                    </>
                  )}
                  <div style={{width:'30px',height:'30px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'#111827',fontSize:'14px',fontWeight:'600',position:'relative',zIndex:1}}>
                    {d.num}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="tbl-scroll dsz" onScroll={handleTableScroll} onMouseLeave={handleStatusCellMouseUp}>
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
                    <td className="sticky-c" style={{background:'#f4f5f7',padding:'0 8px 0 0'}}>
                      <div className="nw">
                        <div style={{display:'flex',alignItems:'center',gap:'10px',position:'relative',cursor:isMe?'pointer':'default'}}
                          onClick={()=>{ if (!isMe) return; setSocialMenu(socialMenu===m.id?null:m.id); }}>
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
                              {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo=>(
                                <div key={emo}
                                  onClick={e=>{ e.stopPropagation(); triggerMoodFly(emo, e.currentTarget); }}
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
                            <div data-pill-ds={d.ds} className={`pill ${isHol?'hol':'we'}`} onClick={e=>fireParty(e,isHol?'holiday':'weekend',d.hol||'',d.ds)}>
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
                                    id={isFirst&&si===0?AM_REF:undefined}
                                    className={[
                                      cls,
                                      isPreview      ? 'preview'       : '',
                                      isSnapping     ? 'cell-snap'     : '',
                                      isBulkSelected ? 'bulk-selected' : '',
                                      staggerDelay!==undefined ? 'cell-stagger' : '',
                                    ].filter(Boolean).join(' ')}
                                    style={{
                                      ...(sid!=='none'?{background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}30`}:{}),
                                      ...(staggerDelay!==undefined?{animationDelay:`${staggerDelay}ms`}:{}),
                                    }}
                                    onMouseDown={e=>handleStatusCellMouseDown(m.id,weekIdx,shift,sid,e)}
                                    onMouseOver={()=>handleStatusCellMouseOver(m.id,weekIdx,shift)}
                                    onClick={e=>{
                                      if (!isMe) return;
                                      e.stopPropagation();
                                      if (preview.length<=1) {
                                        if (sid!=='none') handleStatusClear(key,e);
                                        else setActiveMenu(open?null:key);
                                      }
                                    }}
                                  >
                                    {sid!=='none'?`${cfg.icon} ${cfg.label}`:shift}
                                  </div>
                                  {open&&isMe&&(
                                    <div className="s-drop dsz">
                                      <div style={{padding:'3px 10px 7px',fontSize:'10px',color:'#9ca3af',fontWeight:'600',borderBottom:'1px solid #f0f0f0',marginBottom:'3px',letterSpacing:'0.06em'}}>
                                        {bulkSelectCells.length>0?`${bulkSelectCells.length} CELLS`:'STATUS'}
                                      </div>
                                      {Object.entries(STATUS_CONFIG).map(([sId,sCfg])=>(
                                        <div key={sId} className="s-opt"
                                          onClick={e=>{
                                            e.stopPropagation();
                                            if (bulkSelectCells.length>0) handleBulkStatusSelect(sId,e);
                                            else handleStatusSelect(key,sId,e);
                                          }}>
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