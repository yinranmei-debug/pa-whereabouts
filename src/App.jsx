import React, { useState, useEffect, useRef } from 'react';
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

const ROW_H  = 104;
const NAV_H  = 56;
const SUB_H  = 72;
const TB_H   = 52;
const LG_H   = 36;
const AM_REF = 'am-ref-btn';

// 56 + 72 + 52 + 36 = 216px
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
      {photoUrl ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials(name)}
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    @keyframes holiBounce{0%{transform:scale(1)}30%{transform:scale(1.03)}60%{transform:scale(0.98)}85%{transform:scale(1.01)}100%{transform:scale(1)}}
    @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}
    .holi-tap{animation:holiBounce 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both !important;transform-origin:center center;isolation:isolate}
    body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f5f7;color:#111827;-webkit-font-smoothing:antialiased}
    
    .nav{height:${NAV_H}px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 28px;position:sticky;top:0;z-index:500}
    .nav-tab{height:${NAV_H}px;display:flex;align-items:center;padding:0 14px;font-size:13px;font-weight:400;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;user-select:none}
    .nav-tab.active{color:transparent;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;border-image:linear-gradient(90deg,#009bff,#770bff) 1;font-weight:600}
    .nav-sep{width:1px;height:20px;background:#e5e7eb;margin:0 8px;flex-shrink:0}
    .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
    
    .stat-pill{display:flex;align-items:center;gap:7px;padding:6px 14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:100px;font-size:12px;font-weight:600;color:#374151;white-space:nowrap}
    .user-chip{display:flex;align-items:center;gap:8px;padding:4px 4px 4px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:100px}
    .user-name{font-size:12px;font-weight:600;color:#374151}
    .signout-btn{height:26px;padding:0 10px;border-radius:100px;border:none;background:#e5e7eb;color:#6b7280;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s}
    
    .sub-header{height:${SUB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;position:sticky;top:${NAV_H}px;z-index:490}
    .page-title{font-size:20px;font-weight:600;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:-0.02em}
    
    .toolbar{height:${TB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;position:sticky;top:${NAV_H+SUB_H}px;z-index:480}
    .tb-btn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;cursor:pointer}
    .tb-btn.today{background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;font-weight:600;padding:0 16px}
    
    .legend{height:${LG_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:20px;position:sticky;top:${NAV_H+SUB_H+TB_H}px;z-index:470}
    .leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#9ca3af}
    .leg-sw{width:20px;height:10px;border-radius:4px}
    
    .tbl-outer{background:#f4f5f7;padding-bottom:48px;position:relative}

    /* 新建独立 Header 样式 */
    .header-sticky-wrapper {
      position: sticky;
      top: ${HEADER_STICKY_TOP}px;
      z-index: 465;
      background: #f4f5f7;
      overflow: hidden; /* 由 scrollRef 同步 scrollLeft */
      padding: 0 28px;
    }
    .header-grid {
      display: grid;
      grid-template-columns: 200px repeat(7, 1fr);
      min-width: 860px;
    }
    .header-cell {
      padding: 14px 4px 10px;
      text-align: center;
      background: #f4f5f7;
    }
    .header-day { font-size: 10px; font-weight: 600; color: #9ca3af; letter-spacing: 0.06em; margin-bottom: 5px; }
    .header-num-box { 
      width: 30px; height: 30px; border-radius: 50%; margin: 0 auto; 
      display: flex; alignItems: center; justifyContent: center; 
      font-size: 14px; font-weight: 600; 
    }

    .tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 28px}
    .main-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:860px}
    .main-tbl td{padding:0;height:${ROW_H}px;vertical-align:top}
    
    .sticky-c{position:sticky;left:0;z-index:100;background:#f4f5f7;overflow:visible}
    .sticky-c::after{content:'';position:absolute;top:0;right:-16px;bottom:0;width:16px;background:linear-gradient(to right,rgba(0,0,0,0.04),transparent);pointer-events:none}
    
    .nw{height:${ROW_H}px;display:flex;align-items:center;gap:10px;padding:0 8px;border-bottom:1px solid #ebebeb;overflow:visible}
    .n-name{font-size:13px;font-weight:400;color:#374151}
    .n-name.me{font-weight:600;color:#111827}
    
    .dw{height:${ROW_H}px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 4px;border-bottom:1px solid #ebebeb}
    .sh{height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;transition:all 0.15s;user-select:none;border:none;cursor:pointer}
    .sh.mine{background:linear-gradient(135deg,#e8f0fe,#ede8fe);color:#374151}
    .sh.set{cursor:grab}
    .sh.preview{background:#dbeafe !important;border:2px dashed #0284c7 !important;opacity:0.8}
    .sh.other{background:#fafafa;color:#d1d5db;border:1.5px solid #f3f4f6;cursor:default}
    
    .s-drop{position:absolute;top:42px;left:0;z-index:10001;background:#fff;border-radius:12px;width:200px;padding:6px;box-shadow:0 8px 32px rgba(0,0,0,0.12);border:1px solid #e5e7eb;animation:dropIn 0.15s ease}
    .s-opt{padding:8px 10px;cursor:pointer;border-radius:8px;font-size:12px;display:flex;align-items:center;gap:10px}
    
    td.ptd{height:1px;padding:0 4px;vertical-align:top}
    .pill{height:100%;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;cursor:pointer;user-select:none}
    .pill-card{width:100%;flex:1;border-radius:10px}
    .hol .pill-card{background:linear-gradient(180deg,#fdf2f8,#fce7f3)}
    .we  .pill-card{background:linear-gradient(180deg,#eff6ff,#dbeafe)}

    .ms-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6}
    .ms-card{background:#fff;border-radius:2px;padding:44px;max-width:420px;width:90%;box-shadow:0 2px 6px rgba(0,0,0,0.13)}
    .ms-btn{width:100%;height:40px;background:linear-gradient(90deg,#009bff,#770bff);color:#fff;border:none;border-radius:2px;font-size:14px;font-weight:600;cursor:pointer}
    
    @media(max-width:768px){.nav,.sub-header,.toolbar,.legend{padding-left:16px;padding-right:16px}.header-sticky-wrapper,.tbl-scroll{padding-left:16px;padding-right:16px}}
  `}</style>
);

// 登录界面组件
function LoginScreen({ onLogin, isInitializing, error }) {
  return (
    <div className="ms-screen"><GlobalStyles />
      <div className="ms-card">
        <h2 style={{fontSize:'24px',fontWeight:'600',marginBottom:'8px'}}>Sign in</h2>
        <p style={{fontSize:'13px',color:'#605e5c',marginBottom:'24px'}}>Use your Pattern Asia account to continue</p>
        {isInitializing ? <div>Initializing...</div> : <button className="ms-btn" onClick={onLogin}>Sign in with Microsoft</button>}
        {error && <div style={{color:'red',marginTop:'10px'}}>{error}</div>}
      </div>
    </div>
  );
}

// 访问拒绝界面
function AccessDeniedScreen({ email, onLogout }) {
  return (
    <div className="ms-screen"><GlobalStyles />
      <div className="ms-card">
        <h2 style={{fontSize:'24px',fontWeight:'600',marginBottom:'8px'}}>Access denied</h2>
        <p style={{fontSize:'13px',color:'#605e5c',marginBottom:'24px'}}><strong>{email}</strong> is not authorized.</p>
        <button className="ms-btn" onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
}

export default function App() {
  const [isInit,              setIsInit]              = useState(false);
  const [account,             setAccount]             = useState(null);
  const [authError,           setAuthError]           = useState(null);
  const [denied,              setDenied]              = useState(false);
  const [activeTab,           setActiveTab]           = useState('calendar');
  const [viewDate,            setViewDate]            = useState(new Date());
  const [region,              setRegion]              = useState('Hong Kong');
  const [records,             setRecords]             = useState({});
  const [activeMenu,          setActiveMenu]          = useState(null);
  const [socialMenu,          setSocialMenu]          = useState(null);
  const [emotions,            setEmotions]            = useState({});
  const [saveStatus,          setSaveStatus]          = useState('');
  const [pillRects,           setPillRects]           = useState({});
  const [staffPhotos,         setStaffPhotos]         = useState({});
  const [onlineUsers,         setOnlineUsers]         = useState([]);
  const [dragging,            setDragging]            = useState(null);
  const [preview,             setPreview]             = useState([]);
  const [bulkSelectCells,     setBulkSelectCells]     = useState([]);

  const presenceRef   = useRef(null);
  const partyTimerRef = useRef(null);
  const scrollRef     = useRef(null); // 表格滚动容器
  const headerRef     = useRef(null); // 独立表头容器

  // 同步滚动逻辑
  const handleScroll = (e) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await msalInstance.initialize(); setIsInit(true);
        const res = await msalInstance.handleRedirectPromise();
        const accs = msalInstance.getAllAccounts();
        if (accs.length > 0) {
          const em = accs[0].username.toLowerCase();
          msalInstance.setActiveAccount(accs[0]);
          setAccount(accs[0]);
        }
      } catch(e) { setAuthError('Initialization failed.'); }
    })();
  }, []);

  useEffect(() => {
    if (!account) return;
    (async () => {
      const { data: sData } = await supabase.from('statuses').select('*');
      if (sData) { const r={}; sData.forEach(row => { r[row.id]=row.status; }); setRecords(r); }
      const { data: eData } = await supabase.from('emotions').select('*');
      if (eData) { const e={}; eData.forEach(row => { e[row.staff_id]=row.emoji; }); setEmotions(e); }
    })();
  }, [account]);

  useEffect(() => {
    const fn = e => { if (!e.target.closest('.dsz')) { setActiveMenu(null); setSocialMenu(null); } };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const measure = () => {
      const rects = {};
      document.querySelectorAll('[data-pill-ds]').forEach(el => {
        const r = el.getBoundingClientRect();
        rects[el.dataset.pillDs] = { top:r.top, bottom:r.bottom, x:r.left+r.width/2 };
      });
      setPillRects(rects);
    };
    measure();
    window.addEventListener('scroll', measure, true);
    return () => window.removeEventListener('scroll', measure, true);
  }, [region, viewDate]);

  const handleStatus = async (key, val, e) => {
    if (e) e.stopPropagation();
    setSaveStatus('saving');
    const parts = key.split('-');
    const shift = parts[parts.length-1], staffId = parts[0], date = parts.slice(1,-1).join('-');
    if (val === null) { await supabase.from('statuses').delete().eq('id', key); }
    else { await supabase.from('statuses').upsert({ id:key, staff_id:staffId, date, shift, status:val }); }
    setRecords(r => { const n={...r}; if(val===null) delete n[key]; else n[key]=val; return n; });
    setActiveMenu(null);
    setSaveStatus('saved'); setTimeout(() => setSaveStatus(''), 2000);
  };

  const login  = async () => { try { await msalInstance.loginRedirect(loginRequest); } catch(e) { setAuthError(e.message); } };
  const logout = () => msalInstance.logoutRedirect();

  if (denied)   return <AccessDeniedScreen email={account?.username||''} onLogout={logout} />;
  if (!account) return <LoginScreen onLogin={login} isInitializing={!isInit} error={authError} />;

  const me        = account.username.toLowerCase();
  const superUser = isSuperUser(me);
  const meStaff   = getStaffEntry(me);
  const staffList = STAFF_LIST.filter(s => s.region === region);

  const week = (() => {
    const d = new Date(viewDate), day = d.getDay();
    const mon = new Date(d.setDate(d.getDate()-day+(day===0?-6:1)));
    return Array.from({length:7}).map((_,i) => {
      const t = new Date(mon); t.setDate(mon.getDate()+i);
      const ds = fmt(t);
      const rd = HOLIDAYS_DATA[region];
      const hol = rd?.holidays?.[ds];
      const isToday = ds === fmt(new Date());
      const isWE = (t.getDay()===0||t.getDay()===6);
      return { ds, num:t.getDate(), dayName:t.toLocaleDateString('en-US',{weekday:'short'}), hol, isWE, isToday, editable:!hol&&!isWE };
    });
  })();

  const VH = window.innerHeight;

  return (
    <div style={{minHeight:'100vh', background:'#f4f5f7'}} onMouseUp={() => { setDragging(null); setPreview([]); }}>
      <GlobalStyles />
      <nav className="nav">
        <div className="nav-tab active">Calendar</div>
        <div className="nav-sep"/>
        <div className="nav-right">
          {saveStatus==='saving' && <span style={{fontSize:'12px',color:'#9ca3af'}}>↻ Saving</span>}
          <div className="user-chip">
            <span className="user-name">{account.name}</span>
            <button className="signout-btn" onClick={logout}>Sign out</button>
          </div>
        </div>
      </nav>

      <div className="sub-header">
        <div className="page-title">APAC Whereabouts</div>
        {superUser && (
          <div className="region-toggle">
            {['Hong Kong','China'].map(r => (
              <button key={r} className={`region-btn ${region===r?'on':''}`} onClick={() => setRegion(r)}>{r}</button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar">
        <button className="tb-btn today" onClick={() => setViewDate(new Date())}>Today</button>
        <span style={{fontSize:'15px',fontWeight:'600'}}>{viewDate.toLocaleString('default',{month:'long',year:'numeric'})}</span>
      </div>

      <div className="legend">
        <div className="leg-item"><div className="leg-sw" style={{background:'#fce7f3'}}></div>Holiday</div>
        <div className="leg-item"><div className="leg-sw" style={{background:'#dbeafe'}}></div>Weekend</div>
      </div>

      <div className="tbl-outer">
        {/* ISSUE 2 FIX: 独立 Header Div */}
        <div className="header-sticky-wrapper dsz" ref={headerRef}>
          <div className="header-grid">
            <div className="header-cell sticky-c" style={{textAlign:'left', fontWeight:600, color:'#9ca3af', fontSize:'10px'}}>STAFF</div>
            {week.map(d => (
              <div key={d.ds} className="header-cell">
                <div className="header-day" style={{color: d.isToday ? '#770bff' : '#9ca3af'}}>{d.dayName.toUpperCase()}</div>
                <div className="header-num-box" style={{
                  background: d.isToday ? 'linear-gradient(135deg,#009bff,#770bff)' : 'transparent',
                  color: d.isToday ? '#fff' : '#111827'
                }}>{d.num}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 表格数据主体 */}
        <div className="tbl-scroll" ref={scrollRef} onScroll={handleScroll}>
          <table className="main-tbl">
            <colgroup>
              <col style={{width:'200px'}}/>
              {week.map(d => <col key={d.ds}/>)}
            </colgroup>
            {/* Thead 完全删除或设为不可见占位 */}
            <thead style={{visibility:'hidden'}} aria-hidden="true">
              <tr>
                <th></th>
                {week.map(d => <th key={d.ds} style={{height:0, padding:0}}></th>)}
              </tr>
            </thead>
            <tbody>
              {staffList.map((m, rowIdx) => {
                const isMe = m.email.toLowerCase() === me;
                return (
                  <tr key={m.id}>
                    <td className="sticky-c">
                      <div className="nw">
                        <Avatar name={m.name} size={34} isMe={isMe}/>
                        <div className={`n-name ${isMe?'me':''}`}>{m.name}</div>
                      </div>
                    </td>
                    {week.map((d, weekIdx) => {
                      if (!d.editable) {
                        if (rowIdx !== 0) return null;
                        return (
                          <td key={d.ds} className="ptd" rowSpan={staffList.length}>
                            <div className={`pill ${d.hol?'hol':'we'}`}>
                              <div className="pill-card"/>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={d.ds}>
                          <div className="dw">
                            {['AM','PM'].map((shift) => {
                              const key = `${m.id}-${d.ds}-${shift}`;
                              const sid = records[key] || 'none';
                              const cfg = STATUS_CONFIG[sid];
                              const open = activeMenu === key;
                              const isPreview = preview.some(p => p[0]===m.id && p[1]===weekIdx && p[2]===shift);
                              
                              return (
                                <div key={shift} style={{position:'relative'}}>
                                  <div
                                    className={`sh ${isMe?'mine':'other'} ${sid!=='none'?'set':''} ${isPreview?'preview':''}`}
                                    style={sid!=='none' ? {background:cfg.bg,color:cfg.color} : {}}
                                    onMouseDown={(e) => {
                                      if(!isMe) return;
                                      setDragging({ staffId: m.id, dateIdx: weekIdx, shift });
                                      setPreview([[m.id, weekIdx, shift]]);
                                    }}
                                    onMouseOver={() => {
                                      if(dragging) setPreview(prev => [...prev, [m.id, weekIdx, shift]]);
                                    }}
                                    onClick={(e) => {
                                      if (!isMe) return;
                                      e.stopPropagation();
                                      // ISSUE 1 FIX: 只有当不是拖拽产生的 MouseUp 后点击时，才切换
                                      if (preview.length <= 1) {
                                        setActiveMenu(open ? null : key);
                                      }
                                    }}
                                  >
                                    {sid !== 'none' ? `${cfg.icon} ${cfg.label}` : shift}
                                  </div>
                                  {open && isMe && (
                                    <div className="s-drop dsz">
                                      {Object.entries(STATUS_CONFIG).map(([sId,sCfg]) => (
                                        <div key={sId} className="s-opt" onClick={(e) => handleStatus(key, sId, e)}>
                                          <span>{sCfg.icon}</span> <span>{sCfg.label}</span>
                                        </div>
                                      ))}
                                      <div className="s-opt" style={{color:'#ef4444',borderTop:'1px solid #eee'}} onClick={(e) => handleStatus(key, null, e)}>
                                        <span>🗑️</span> <span>Clear Status</span>
                                      </div>
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