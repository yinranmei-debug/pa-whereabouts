import React, { useState, useRef, useCallback } from 'react';
import Avatar from './Avatar';

const MobileView = ({
  staffList, week, records, me, meStaff,
  STATUS_CONFIG, onStatusSelect, onStatusClear,
  emotions, staffPhotos, socialMenu, setSocialMenu,
  triggerMoodFly, onlineUsers,
}) => {
  const [activeCell, setActiveCell] = useState(null);
  const [touching,   setTouching]   = useState(false);
  const touchStartRef = useRef(null);

  const handleCellTap = (key, sid, isMe) => {
    if (!isMe) return;
    if (sid !== 'none') {
      onStatusClear(key);
    } else {
      setActiveCell(activeCell === key ? null : key);
    }
  };

  const handleStatusPick = (key, sId) => {
    onStatusSelect(key, sId);
    setActiveCell(null);
  };

  // touch drag for mobile bulk — simplified: tap to select, long press not needed
  const handleTouchStart = (e, key, isMe) => {
    if (!isMe) return;
    touchStartRef.current = { key, time: Date.now() };
    setTouching(true);
  };

  const handleTouchEnd = (e, key, sid, isMe) => {
    if (!isMe) { setTouching(false); return; }
    const elapsed = Date.now() - (touchStartRef.current?.time || 0);
    setTouching(false);
    if (elapsed < 500) handleCellTap(key, sid, isMe);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",paddingBottom:80}}>
      <style>{`
        @keyframes mobileDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mobileCellPop{0%{transform:scale(0.9)}60%{transform:scale(1.05)}100%{transform:scale(1)}}
        .mob-cell-pop{animation:mobileCellPop 0.22s cubic-bezier(0.34,1.56,0.64,1) both;}
        .mob-status-drop{animation:mobileDropIn 0.18s ease both;}

        .mob-week-scroll{
          display:flex;gap:8px;overflow-x:auto;padding:0 16px 8px;
          -webkit-overflow-scrolling:touch;scrollbar-width:none;
        }
        .mob-week-scroll::-webkit-scrollbar{display:none;}

        .mob-day-chip{
          flex-shrink:0;width:48px;display:flex;flex-direction:column;align-items:center;
          padding:8px 0;border-radius:14px;cursor:pointer;transition:all 0.15s;
          border:1.5px solid transparent;
        }
        .mob-day-chip.today{
          background:linear-gradient(135deg,#009bff,#770bff);
          box-shadow:0 4px 12px rgba(119,11,255,0.3);
        }
        .mob-day-chip.weekend{background:rgba(239,246,255,0.8);border-color:#bfdbfe;}
        .mob-day-chip.holiday{background:rgba(253,242,248,0.8);border-color:#fbcfe8;}
        .mob-day-chip.normal{background:#f9fafb;border-color:#f3f4f6;}

        .mob-staff-card{
          margin:0 16px 12px;
          background:#fff;border-radius:16px;
          border:1px solid #f1f5f9;
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          overflow:visible;
        }
        .mob-staff-header{
          display:flex;align-items:center;gap:12px;
          padding:14px 16px 10px;
          border-bottom:1px solid #f8fafc;
        }
        .mob-shifts-row{
          display:flex;gap:8px;padding:10px 16px 14px;
          overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
        }
        .mob-shifts-row::-webkit-scrollbar{display:none;}

        .mob-shift-wrap{flex-shrink:0;position:relative;}
        .mob-shift-cell{
          width:52px;height:52px;border-radius:14px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;gap:2px;
          cursor:pointer;transition:all 0.15s;
          -webkit-tap-highlight-color:transparent;
          user-select:none;
        }
        .mob-shift-icon{font-size:20px;line-height:1;}
        .mob-shift-label{font-size:9px;font-weight:700;opacity:0.8;}

        .mob-shift-mine{background:linear-gradient(135deg,#EEF2FF,#F5F3FF);color:#6b7280;border:1px solid rgba(199,210,254,0.6);}
        .mob-shift-mine:active{transform:scale(0.92);}
        .mob-shift-set{border:1.5px solid transparent;}
        .mob-shift-other{background:#fafafa;color:#d1d5db;border:1px solid #f3f4f6;}

        .mob-status-picker{
          position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
          background:#fff;border-radius:16px;padding:8px;
          box-shadow:0 12px 40px rgba(0,0,0,0.14);
          border:1px solid #e5e7eb;
          display:flex;gap:6px;z-index:500;
          animation:mobileDropIn 0.18s ease;
        }
        .mob-status-opt{
          width:44px;height:44px;border-radius:12px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:pointer;transition:all 0.15s;gap:2px;
          background:#f9fafb;border:1px solid #f3f4f6;
        }
        .mob-status-opt:active{transform:scale(0.9);}
        .mob-status-opt-icon{font-size:18px;line-height:1;}
        .mob-status-opt-txt{font-size:8px;font-weight:700;color:#6b7280;}

        .mob-online-bar{
          display:flex;align-items:center;gap:8px;
          padding:10px 16px;margin:0 16px 12px;
          background:rgba(15,23,42,0.04);
          border-radius:12px;
        }
      `}</style>

      {/* online bar */}
      {onlineUsers.length > 0 && (
        <div className="mob-online-bar">
          <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
          <span style={{fontSize:11,fontWeight:700,color:'#4ade80',letterSpacing:'0.04em'}}>LIVE</span>
          <div style={{display:'flex',marginLeft:4}}>
            {onlineUsers.slice(0,5).map((u,i)=>(
              <div key={u.email} style={{marginLeft:i===0?0:-6,zIndex:10-i,border:'2px solid #fff',borderRadius:'50%',overflow:'hidden',width:24,height:24,flexShrink:0}}>
                <Avatar name={u.name} photoUrl={staffPhotos[u.id]} size={20}/>
              </div>
            ))}
          </div>
          <span style={{fontSize:11,color:'#6b7280',marginLeft:4}}>{onlineUsers.length} online now</span>
        </div>
      )}

      {/* week strip */}
      <div className="mob-week-scroll">
        {week.map(d => {
          const cls = d.isToday ? 'today' : d.isWE ? 'weekend' : d.hol ? 'holiday' : 'normal';
          return (
            <div key={d.ds} className={`mob-day-chip ${cls}`}>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.06em',color:d.isToday?'rgba(255,255,255,0.8)':d.hol?'#be185d':d.isWE?'#2563eb':'#9ca3af',textTransform:'uppercase'}}>
                {d.dayName}
              </span>
              <span style={{fontSize:17,fontWeight:800,color:d.isToday?'#fff':d.hol?'#be185d':d.isWE?'#1d4ed8':'#111827',lineHeight:1.2}}>
                {d.num}
              </span>
              {d.hol && <span style={{fontSize:14}}>{d.hol.split(' ')[0]}</span>}
              {d.isWE && !d.hol && <span style={{fontSize:12}}>🏝️</span>}
            </div>
          );
        })}
      </div>

      {/* staff cards */}
      <div style={{marginTop:8}}>
        {staffList.map(m => {
          const isMe = m.email.toLowerCase() === me;
          return (
            <div key={m.id} className="mob-staff-card" id={isMe?'my-row-mob':undefined}>
              <div className="mob-staff-header">
                <div
                  style={{position:'relative',cursor:isMe?'pointer':'default'}}
                  onClick={()=>{ if (isMe) setSocialMenu(socialMenu===m.id?null:m.id); }}
                >
                  <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={42} isMe={isMe}/>
                  {emotions[m.id] && (
                    <div style={{position:'absolute',bottom:-4,right:-4,background:'#fff',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 2px 6px rgba(0,0,0,0.12)',border:'2px solid #fff'}}>
                      {emotions[m.id]}
                    </div>
                  )}
                  {/* mood picker */}
                  {isMe && socialMenu === m.id && (
                    <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,zIndex:600,background:'#fff',borderRadius:14,display:'flex',padding:8,gap:4,boxShadow:'0 8px 32px rgba(0,0,0,0.12)',border:'1px solid #e5e7eb',animation:'mobileDropIn 0.15s ease'}}>
                      {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo=>(
                        <div key={emo}
                          onClick={e=>{ e.stopPropagation(); triggerMoodFly(emo, e.currentTarget); setSocialMenu(null); }}
                          style={{fontSize:'20px',cursor:'pointer',padding:'6px',borderRadius:'8px',transition:'all 0.15s'}}
                          onTouchStart={e=>e.currentTarget.style.background='#f3f4f6'}
                          onTouchEnd={e=>e.currentTarget.style.background='transparent'}
                        >{emo}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:isMe?700:500,color:isMe?'#111827':'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {m.name}
                  </div>
                  {isMe && <div style={{fontSize:9,fontWeight:700,background:'linear-gradient(90deg,#009bff,#770bff)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',letterSpacing:'0.06em',marginTop:2}}>YOU</div>}
                </div>
              </div>

              {/* shifts row */}
              <div className="mob-shifts-row">
                {week.map(d => {
                  if (!d.editable) {
                    return (
                      <div key={d.ds} style={{flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
                        {['AM','PM'].map(shift=>(
                          <div key={shift} style={{width:52,height:24,borderRadius:8,background:d.hol?'rgba(253,242,248,0.8)':'rgba(239,246,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:d.hol?'#be185d':'#2563eb',fontWeight:700}}>
                            {d.hol?d.hol.split(' ')[0]:'🏝️'}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div key={d.ds} style={{flexShrink:0,display:'flex',flexDirection:'column',gap:4}}>
                      {['AM','PM'].map(shift=>{
                        const key=`${m.id}-${d.ds}-${shift}`;
                        const sid=records[key]||'none';
                        const cfg=STATUS_CONFIG[sid];
                        const open=activeCell===key;
                        const cellCls=!isMe?'mob-shift-other':sid!=='none'?'mob-shift-set':'mob-shift-mine';
                        return (
                          <div key={shift} className="mob-shift-wrap">
                            <div
                              className={`mob-shift-cell ${cellCls}`}
                              style={sid!=='none'?{background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}40`}:{}}
                              onTouchStart={e=>handleTouchStart(e,key,isMe)}
                              onTouchEnd={e=>handleTouchEnd(e,key,sid,isMe)}
                              onClick={()=>handleCellTap(key,sid,isMe)}
                            >
                              {sid!=='none'
                                ? <><span className="mob-shift-icon">{cfg.icon}</span><span className="mob-shift-label">{shift}</span></>
                                : <span style={{fontSize:10,fontWeight:700,color:'#d1d5db'}}>{shift}</span>
                              }
                            </div>
                            {open && isMe && (
                              <div className="mob-status-picker" onClick={e=>e.stopPropagation()}>
                                {Object.entries(STATUS_CONFIG).map(([sId,sCfg])=>(
                                  <div key={sId} className="mob-status-opt" onTouchEnd={()=>handleStatusPick(key,sId)} onClick={()=>handleStatusPick(key,sId)}>
                                    <span className="mob-status-opt-icon">{sCfg.icon}</span>
                                    <span className="mob-status-opt-txt">{sCfg.label.split(' ')[0]}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileView;