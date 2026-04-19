import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

const NAV_H = 72, TB_H = 56, LG_H = 40;
const STICKY_TOP = NAV_H + TB_H + LG_H;

const MobileView = ({
  staffList, week, records, me, meStaff,
  STATUS_CONFIG, onStatusSelect, onStatusClear,
  emotions, staffPhotos, socialMenu, setSocialMenu,
  triggerMoodFly, onlineUsers,
}) => {
  const [activeCell,  setActiveCell]  = useState(null);
  const [dragPreview, setDragPreview] = useState([]);
  const [isDragging,  setIsDragging]  = useState(false);
  const [dayOffset,   setDayOffset]   = useState(0);
  const dragStartRef = useRef(null);
  const longPressRef = useRef(null);
  const scrollRef    = useRef(null);
  const headerRef    = useRef(null);

  useEffect(() => {
    const fn = e => {
      if (
        !e.target.closest('.mob-picker-wrap') &&
        !e.target.closest('.mob-cell')
      ) {
        setActiveCell(null);
        setDragPreview([]);
      }
    };
    document.addEventListener('touchstart', fn, { passive: true });
    document.addEventListener('mousedown', fn);
    return () => {
      document.removeEventListener('touchstart', fn);
      document.removeEventListener('mousedown', fn);
    };
  }, []);

  const cellKeyAtPoint = (x, y) => {
    const els = document.querySelectorAll('[data-mob-cell]');
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el.dataset.mobCell;
      }
    }
    return null;
  };

  const handleTouchStart = (e, key, sid, isMe) => {
    if (!isMe) return;
    clearTimeout(longPressRef.current);
    dragStartRef.current = { key, sid, startTime: Date.now() };
    setIsDragging(false);
    setDragPreview([key]);
    setActiveCell(null);
  };

  const handleTouchMove = (e, isMe) => {
    if (!isMe || !dragStartRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const over = cellKeyAtPoint(touch.clientX, touch.clientY);
    if (!over || over === dragStartRef.current.key) return;
    setIsDragging(true);
    const allCells = Array.from(document.querySelectorAll('[data-mob-cell]'))
      .map(el => el.dataset.mobCell);
    const si = allCells.indexOf(dragStartRef.current.key);
    const ei = allCells.indexOf(over);
    if (si === -1 || ei === -1) return;
    const lo = Math.min(si, ei), hi = Math.max(si, ei);
    setDragPreview(allCells.slice(lo, hi + 1));
  };

  const handleTouchEnd = (e, key, sid, isMe) => {
    if (!isMe || !dragStartRef.current) return;
    e.preventDefault();
    const wasDrag = isDragging && dragPreview.length > 1;
    if (wasDrag) {
      setActiveCell(dragPreview[0]);
    } else {
      if (sid !== 'none') {
        onStatusClear(key);
        setActiveCell(null);
        setDragPreview([]);
      } else {
        setActiveCell(prev => prev === key ? null : key);
        setDragPreview([key]);
      }
    }
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleStatusPick = (statusId) => {
    const keys = dragPreview.length > 0 ? dragPreview : activeCell ? [activeCell] : [];
    keys.forEach(k => onStatusSelect(k, statusId));
    setActiveCell(null);
    setDragPreview([]);
  };

  const handleClear = () => {
    const keys = dragPreview.length > 1 ? dragPreview : activeCell ? [activeCell] : [];
    keys.forEach(k => onStatusClear(k));
    setActiveCell(null);
    setDragPreview([]);
  };

  const handleBodyScroll = () => {
    if (headerRef.current && scrollRef.current) {
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  };

  // column sizing
  const screenW      = typeof window !== 'undefined' ? window.innerWidth : 390;
  const NAME_W       = 96;
  const PADDING      = 16;
  const NON_W        = 52;
  const DAYS_PER_VIEW = 5;

  // split week into editable / non-editable
  const editableDays = week.filter(d => d.editable);
  const maxOffset    = Math.max(0, editableDays.length - DAYS_PER_VIEW);

  // visible editable days window
  const visibleEditable = editableDays.slice(dayOffset, dayOffset + DAYS_PER_VIEW);
  const visibleDsSet    = new Set(visibleEditable.map(d => d.ds));
  const firstDs         = visibleEditable[0]?.ds;
  const lastDs          = visibleEditable[visibleEditable.length - 1]?.ds;

  // include non-editable days that fall within the visible range
  const visibleWeek = week.filter(d => {
    if (d.editable) return visibleDsSet.has(d.ds);
    return d.ds >= firstDs && d.ds <= lastDs;
  });

  const visWorkdays = visibleWeek.filter(d => d.editable).length;
  const visNonEdit  = visibleWeek.filter(d => !d.editable).length;
  const EDIT_W      = Math.max(44, Math.floor(
    (screenW - NAME_W - PADDING - visNonEdit * NON_W) / Math.max(visWorkdays, 1)
  ));
  const totalW = NAME_W + visWorkdays * EDIT_W + visNonEdit * NON_W;

  const ROW_H = 82;

  // label for toggle bar
  const rangeLabel = visibleEditable.length > 0
    ? `${visibleEditable[0].dayName} – ${visibleEditable[visibleEditable.length-1].dayName}`
    : '';

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      paddingBottom: 100,
      background: '#F0F4FF',
      minHeight: '100vh',
    }}>
      <style>{`
        @keyframes mobDropIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mobSheetIn { from{transform:translateY(100%)} to{transform:translateY(0)} }

        .mob-cell {
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 600; gap: 2px;
          height: 32px;
          -webkit-tap-highlight-color: transparent;
          user-select: none; touch-action: none;
          transition: transform 0.1s;
          cursor: pointer;
        }
        .mob-cell:active { transform: scale(0.9); }
        .mob-cell-mine  { background:linear-gradient(135deg,#EEF2FF,#F5F3FF); color:#6b7280; border:1px solid rgba(199,210,254,0.6); }
        .mob-cell-set   { cursor: pointer; }
        .mob-cell-other { background:#fafafa; color:#d1d5db; border:1px solid #f3f4f6; cursor:default; }
        .mob-cell-preview {
          background: linear-gradient(135deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2)) !important;
          border: 1.5px solid rgba(119,11,255,0.6) !important;
        }
        .mob-picker-wrap {
          position:fixed; bottom:0; left:0; right:0; z-index:900;
          background:#fff; border-radius:24px 24px 0 0;
          padding:14px 16px 36px;
          box-shadow:0 -8px 32px rgba(0,0,0,0.12);
          animation:mobSheetIn 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .mob-picker-handle { width:36px; height:4px; border-radius:2px; background:#e5e7eb; margin:0 auto 14px; }
        .mob-picker-grid { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
        .mob-picker-opt {
          width:60px; height:60px; border-radius:14px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:4px; cursor:pointer; background:#f9fafb; border:1.5px solid #f3f4f6;
          -webkit-tap-highlight-color:transparent; transition:all 0.12s;
        }
        .mob-picker-opt:active { transform:scale(0.88); background:#f0f4ff; }
        .mob-picker-clear { border-color:#fee2e2 !important; background:#fff5f5 !important; }
        .mob-online-bar {
          display:flex; align-items:center; gap:8px;
          padding:8px 14px; margin:8px 8px 4px;
          background:rgba(15,23,42,0.04); border-radius:12px;
        }
        .mob-nav-btn {
          width:28px; height:28px; border-radius:8px;
          border:1.5px solid #e5e7eb;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; cursor:pointer;
          transition:all 0.15s;
          background:#fff; color:#374151;
        }
        .mob-nav-btn:disabled { background:#f9fafb; color:#d1d5db; cursor:default; }
        .mob-nav-btn:not(:disabled):active { transform:scale(0.9); }
      `}</style>

      {/* online bar */}
      {onlineUsers.length > 0 && (
        <div className="mob-online-bar">
          <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
          <span style={{fontSize:11,fontWeight:700,color:'#4ade80',letterSpacing:'0.04em'}}>LIVE</span>
          <div style={{display:'flex',marginLeft:4}}>
            {onlineUsers.slice(0,5).map((u,i)=>(
              <div key={u.email} style={{marginLeft:i===0?0:-6,zIndex:10-i,border:'2px solid #fff',borderRadius:'50%',overflow:'hidden',width:22,height:22,flexShrink:0}}>
                <Avatar name={u.name} photoUrl={staffPhotos[u.id]} size={18}/>
              </div>
            ))}
          </div>
          <span style={{fontSize:11,color:'#6b7280',marginLeft:4}}>{onlineUsers.length} online</span>
        </div>
      )}

      {/* day range toggle bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 12px 4px',
      }}>
        <span style={{fontSize:11,fontWeight:600,color:'#6b7280',letterSpacing:'0.02em'}}>
          {rangeLabel}
        </span>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {/* dot indicators */}
          <div style={{display:'flex',gap:4,marginRight:4}}>
            {Array.from({length: maxOffset + 1}).map((_,i) => (
              <div
                key={i}
                onClick={() => setDayOffset(i)}
                style={{
                  width: i === dayOffset ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: i === dayOffset
                    ? 'linear-gradient(90deg,#009bff,#770bff)'
                    : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <button
            className="mob-nav-btn"
            disabled={dayOffset === 0}
            onClick={() => setDayOffset(o => Math.max(0, o - 1))}
          >‹</button>
          <button
            className="mob-nav-btn"
            disabled={dayOffset >= maxOffset}
            onClick={() => setDayOffset(o => Math.min(maxOffset, o + 1))}
          >›</button>
        </div>
      </div>

      {/* card wrapper */}
      <div style={{margin:'0 8px 8px',background:'#fff',borderRadius:16,border:'1px solid rgba(226,232,240,0.8)',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>

        {/* ── STICKY HEADER — independent div, not inside table ── */}
        <div
          ref={headerRef}
          style={{
            position: 'sticky',
            top: STICKY_TOP,
            zIndex: 60,
            background: '#fafbff',
            borderBottom: '1px solid #e5e7eb',
            borderRadius: '16px 16px 0 0',
            overflowX: 'hidden',
            display: 'flex',
          }}
        >
          <div style={{width: NAME_W, flexShrink: 0}}/>
          {visibleWeek.map(d => (
            <div
              key={d.ds}
              style={{
                width: d.editable ? EDIT_W : NON_W,
                flexShrink: 0,
                padding: '8px 2px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '8px', fontWeight: 700,
                letterSpacing: '0.05em', marginBottom: 3,
                color: d.isToday ? '#770bff' : d.hol ? '#be185d' : d.isWE ? '#2563eb' : '#9ca3af',
              }}>
                {d.dayName.slice(0,2).toUpperCase()}
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: d.isToday ? 'linear-gradient(135deg,#009bff,#770bff)' : 'transparent',
                color: d.isToday ? '#fff' : '#111827',
                fontSize: 12, fontWeight: 700,
              }}>
                {d.num}
              </div>
              {(d.hol || d.isWE) && (
                <div style={{fontSize:10,marginTop:1,lineHeight:1}}>
                  {d.hol ? d.hol.split(' ')[0] : '🏝️'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          ref={scrollRef}
          onScroll={handleBodyScroll}
          style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}
        >
          <table style={{borderCollapse:'collapse',width:totalW,tableLayout:'fixed'}}>
            <colgroup>
              <col style={{width: NAME_W}}/>
              {visibleWeek.map(d => (
                <col key={d.ds} style={{width: d.editable ? EDIT_W : NON_W}}/>
              ))}
            </colgroup>
            <tbody>
              {staffList.map((m, rowIdx) => {
                const isMe    = m.email.toLowerCase() === me;
                const isFirst = rowIdx === 0;

                return (
                  <tr key={m.id}>
                    {/* sticky name col */}
                    <td style={{position:'sticky',left:0,zIndex:50,background:'#fff',padding:0}}>
                      <div style={{
                        height: ROW_H,
                        display:'flex',alignItems:'center',gap:8,
                        padding:'0 6px 0 8px',
                        borderBottom:'1px solid #f1f5f9',
                        overflow:'visible',
                      }}>
                        <div
                          style={{position:'relative',cursor:isMe?'pointer':'default',flexShrink:0}}
                          onClick={()=>{ if (isMe) setSocialMenu(socialMenu===m.id?null:m.id); }}
                        >
                          <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={32} isMe={isMe}/>
                          {emotions[m.id] && (
                            <div style={{
                              position:'absolute',bottom:-3,right:-3,
                              background:'#fff',borderRadius:'50%',
                              width:15,height:15,
                              display:'flex',alignItems:'center',justifyContent:'center',
                              fontSize:10,boxShadow:'0 1px 4px rgba(0,0,0,0.12)',
                              border:'1.5px solid #fff',
                            }}>
                              {emotions[m.id]}
                            </div>
                          )}
                          {isMe && socialMenu === m.id && (
                            <div style={{
                              position:'absolute',top:'calc(100% + 6px)',left:0,
                              zIndex:700,background:'#fff',borderRadius:12,
                              display:'flex',padding:6,gap:3,
                              boxShadow:'0 8px 28px rgba(0,0,0,0.14)',
                              border:'1px solid #e5e7eb',
                              animation:'mobDropIn 0.15s ease',
                              whiteSpace:'nowrap',
                            }}>
                              {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo => (
                                <div
                                  key={emo}
                                  onTouchEnd={e=>{e.preventDefault();e.stopPropagation();triggerMoodFly(emo,e.currentTarget);setSocialMenu(null);}}
                                  onClick={e=>{e.stopPropagation();triggerMoodFly(emo,e.currentTarget);setSocialMenu(null);}}
                                  style={{fontSize:18,cursor:'pointer',padding:'4px',borderRadius:6}}
                                >{emo}</div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{
                            fontSize:10,fontWeight:isMe?700:500,
                            color:isMe?'#111827':'#374151',
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                            lineHeight:1.3,
                          }}>
                            {m.name}
                          </div>
                          {isMe && (
                            <div style={{
                              fontSize:7,fontWeight:700,
                              background:'linear-gradient(90deg,#009bff,#770bff)',
                              WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',
                              letterSpacing:'0.06em',marginTop:1,
                            }}>YOU</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* day cols — use visibleWeek */}
                    {visibleWeek.map((d, weekIdx) => {
                      if (!d.editable) {
                        if (!isFirst) return <td key={d.ds} style={{padding:0}}/>;
                        const isHol = !!d.hol;
                        return (
                          <td
                            key={d.ds}
                            rowSpan={staffList.length}
                            style={{padding:'3px 2px',verticalAlign:'top',height: ROW_H * staffList.length}}
                          >
                            <div
                              style={{
                                height:'100%',minHeight:76,
                                borderRadius:10,
                                background: isHol
                                  ? 'linear-gradient(180deg,#fdf2f8,#fce7f3)'
                                  : 'linear-gradient(180deg,#eff6ff,#dbeafe)',
                                display:'flex',flexDirection:'column',
                                alignItems:'center',justifyContent:'center',
                                gap:2,cursor:'pointer',
                              }}
                              onTouchEnd={e=>{
                                e.preventDefault();
                                const evt = new CustomEvent('mob-party',{
                                  detail:{type:isHol?'holiday':'weekend',text:d.hol||'',ds:d.ds},
                                  bubbles:true,
                                });
                                e.currentTarget.dispatchEvent(evt);
                              }}
                              onClick={e=>{
                                const evt = new CustomEvent('mob-party',{
                                  detail:{type:isHol?'holiday':'weekend',text:d.hol||'',ds:d.ds},
                                  bubbles:true,
                                });
                                e.currentTarget.dispatchEvent(evt);
                              }}
                            >
                              <span style={{fontSize:14}}>{isHol?d.hol.split(' ')[0]:'🏝️'}</span>
                              <span style={{
                                fontSize:7,fontWeight:700,
                                color:isHol?'#be185d':'#2563eb',
                                textTransform:'uppercase',textAlign:'center',
                                padding:'0 2px',letterSpacing:'0.03em',lineHeight:1.2,
                              }}>
                                {isHol ? d.hol.replace(/^\S+\s/,'').slice(0,8) : 'Wknd'}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={d.ds} style={{padding:0,verticalAlign:'top'}}>
                          <div style={{
                            height: ROW_H,
                            display:'flex',flexDirection:'column',
                            justifyContent:'center',gap:4,
                            padding:'0 2px',
                            borderBottom:'1px solid #f1f5f9',
                          }}>
                            {['AM','PM'].map(shift => {
                              const key    = `${m.id}-${d.ds}-${shift}`;
                              const sid    = records[key] || 'none';
                              const cfg    = STATUS_CONFIG[sid];
                              const inPrev = dragPreview.includes(key);
                              const cellClass = [
                                'mob-cell',
                                !isMe ? 'mob-cell-other' : sid !== 'none' ? 'mob-cell-set' : 'mob-cell-mine',
                                inPrev ? 'mob-cell-preview' : '',
                              ].filter(Boolean).join(' ');

                              return (
                                <div
                                  key={shift}
                                  data-mob-cell={key}
                                  className={cellClass}
                                  style={sid !== 'none' ? {background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}40`} : {}}
                                  onTouchStart={e => handleTouchStart(e, key, sid, isMe)}
                                  onTouchMove={e  => handleTouchMove(e, isMe)}
                                  onTouchEnd={e   => handleTouchEnd(e, key, sid, isMe)}
                                  onClick={() => {
                                    if (!isMe) return;
                                    if (sid !== 'none') { onStatusClear(key); }
                                    else { setActiveCell(p => p===key?null:key); setDragPreview([key]); }
                                  }}
                                >
                                  {sid !== 'none'
                                    ? <><span style={{fontSize:14,lineHeight:1}}>{cfg.icon}</span><span style={{fontSize:9}}>{shift}</span></>
                                    : <span style={{fontSize:9,color:'#c7d2fe',fontWeight:700}}>{shift}</span>
                                  }
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

      {/* bottom sheet picker */}
      {activeCell && (
        <div className="mob-picker-wrap" onClick={e => e.stopPropagation()}>
          <div className="mob-picker-handle"/>
          {dragPreview.length > 1 && (
            <div style={{textAlign:'center',marginBottom:12,fontSize:12,fontWeight:700,color:'#5b21b6'}}>
              {dragPreview.length} cells selected
            </div>
          )}
          <div className="mob-picker-grid">
            {Object.entries(STATUS_CONFIG).map(([sId, sCfg]) => (
              <div
                key={sId}
                className="mob-picker-opt"
                onTouchEnd={e=>{e.preventDefault();handleStatusPick(sId);}}
                onClick={()=>handleStatusPick(sId)}
              >
                <span style={{fontSize:22,lineHeight:1}}>{sCfg.icon}</span>
                <span style={{fontSize:9,fontWeight:700,color:'#6b7280',textAlign:'center'}}>{sCfg.label}</span>
              </div>
            ))}
            <div
              className="mob-picker-opt mob-picker-clear"
              onTouchEnd={e=>{e.preventDefault();handleClear();}}
              onClick={handleClear}
            >
              <span style={{fontSize:20,lineHeight:1}}>✕</span>
              <span style={{fontSize:9,fontWeight:700,color:'#ef4444'}}>Clear</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileView;