import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

const MobileView = ({
  staffList, week, records, me, meStaff,
  STATUS_CONFIG, onStatusSelect, onStatusClear,
  emotions, staffPhotos, socialMenu, setSocialMenu,
  triggerMoodFly, onlineUsers,
}) => {
  const [activeCell,  setActiveCell]  = useState(null);
  const [dragPreview, setDragPreview] = useState([]);
  const [isDragging,  setIsDragging]  = useState(false);

  const dragStartRef  = useRef(null);
  const cellMapRef    = useRef({});   // key → DOM rect, updated on render
  const containerRef  = useRef(null);

  // ── register cell positions ──────────────────────────────────────────
  const registerCell = (key, el) => {
    if (el) cellMapRef.current[key] = el;
  };

  // ── find which cell a touch point is over ────────────────────────────
  const cellAtPoint = (x, y) => {
    for (const [key, el] of Object.entries(cellMapRef.current)) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  };

  // ── touch handlers ───────────────────────────────────────────────────
  const handleTouchStart = (e, key, sid, isMe) => {
    if (!isMe) return;
    e.stopPropagation();
    dragStartRef.current = { key, sid, time: Date.now() };
    setIsDragging(false);
    setDragPreview([key]);
  };

  const handleTouchMove = (e, isMe) => {
    if (!isMe || !dragStartRef.current) return;
    e.preventDefault(); // prevent scroll while dragging cells
    const touch = e.touches[0];
    const over  = cellAtPoint(touch.clientX, touch.clientY);
    if (!over) return;

    setIsDragging(true);

    // build range between dragStart key and current key
    const startKey = dragStartRef.current.key;
    const allKeys  = Object.keys(cellMapRef.current);
    const si = allKeys.indexOf(startKey);
    const ei = allKeys.indexOf(over);
    if (si === -1 || ei === -1) return;
    const lo = Math.min(si, ei), hi = Math.max(si, ei);
    setDragPreview(allKeys.slice(lo, hi + 1));
  };

  const handleTouchEnd = (e, key, sid, isMe) => {
    if (!isMe || !dragStartRef.current) return;
    e.stopPropagation();

    const wasDrag   = isDragging && dragPreview.length > 1;
    const wasTap    = !isDragging || dragPreview.length <= 1;
    const startSid  = dragStartRef.current.sid;

    if (wasDrag) {
      // bulk: open picker for first cell
      setActiveCell(dragPreview[0]);
    } else if (wasTap) {
      if (sid !== 'none') {
        // tap on filled cell → clear
        onStatusClear(key);
        setActiveCell(null);
      } else {
        // tap on empty cell → open picker
        setActiveCell(activeCell === key ? null : key);
      }
    }

    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleStatusPick = (statusId) => {
    if (dragPreview.length > 1) {
      // bulk fill
      dragPreview.forEach(k => { onStatusSelect(k, statusId); });
    } else if (activeCell) {
      onStatusSelect(activeCell, statusId);
    }
    setActiveCell(null);
    setDragPreview([]);
  };

  // close picker on outside tap
  useEffect(() => {
    const fn = e => {
      if (!e.target.closest('.mob-picker') && !e.target.closest('.mob-cell')) {
        setActiveCell(null);
        setDragPreview([]);
      }
    };
    document.addEventListener('touchstart', fn);
    document.addEventListener('mousedown',  fn);
    return () => {
      document.removeEventListener('touchstart', fn);
      document.removeEventListener('mousedown',  fn);
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div ref={containerRef} style={{fontFamily:"'Plus Jakarta Sans',sans-serif",overflowX:'auto',paddingBottom:80,WebkitOverflowScrolling:'touch'}}>
      <style>{`
        @keyframes mobDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mobCellPop{0%{transform:scale(0.88)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
        .mob-cell-pop{animation:mobCellPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both;}

        /* table layout identical to desktop */
        .mob-table{border-collapse:collapse;table-layout:fixed;min-width:700px;width:100%;}
        .mob-table td,
        .mob-table th{padding:0;vertical-align:top;}

        /* sticky name col */
        .mob-sticky{
          position:sticky;left:0;z-index:100;
          background:#fff;
          box-shadow:2px 0 8px rgba(0,0,0,0.04);
        }

        /* header row */
        .mob-hdr-day{
          padding:12px 4px 10px;text-align:center;
          background:#fafbff;
          border-bottom:1px solid #e5e7eb;
        }

        .mob-nw{
          height:90px;display:flex;align-items:center;gap:10px;
          padding:0 10px;border-bottom:1px solid #f1f5f9;
          background:#fff;
        }

        .mob-dw{
          height:90px;display:flex;flex-direction:column;
          justify-content:center;gap:5px;
          padding:0 5px;border-bottom:1px solid #f1f5f9;
        }

        .mob-cell{
          height:36px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:600;gap:3px;
          -webkit-tap-highlight-color:transparent;
          user-select:none;touch-action:none;
          transition:transform 0.12s,filter 0.12s;
        }
        .mob-cell:active{transform:scale(0.94);}
        .mob-cell-mine{background:linear-gradient(135deg,#EEF2FF,#F5F3FF);color:#6b7280;border:1px solid rgba(199,210,254,0.6);}
        .mob-cell-set{cursor:pointer;}
        .mob-cell-other{background:#fafafa;color:#d1d5db;border:1px solid #f3f4f6;cursor:default;}
        .mob-cell-preview{
          background:linear-gradient(135deg,rgba(0,155,255,0.14),rgba(119,11,255,0.14)) !important;
          border:none !important;
          box-shadow:0 0 0 2px rgba(119,11,255,0.5) !important;
        }

        .mob-cell-icon{font-size:16px;line-height:1;flex-shrink:0;}

        /* holiday/weekend pill */
        .mob-pill{
          width:100%;flex:1;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:2px;
          cursor:pointer;
        }
        .mob-pill.hol{background:linear-gradient(180deg,#fdf2f8,#fce7f3);}
        .mob-pill.we {background:linear-gradient(180deg,#eff6ff,#dbeafe);}

        /* status picker popup */
        .mob-picker{
          position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
          background:#fff;border-radius:20px;padding:14px 16px;
          box-shadow:0 16px 48px rgba(0,0,0,0.18);
          border:1px solid #e5e7eb;
          display:flex;gap:8px;z-index:600;
          animation:mobDropIn 0.2s ease;
        }
        .mob-picker-opt{
          width:56px;height:56px;border-radius:14px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:pointer;gap:3px;
          background:#f9fafb;border:1.5px solid #f3f4f6;
          -webkit-tap-highlight-color:transparent;
          transition:all 0.15s;
        }
        .mob-picker-opt:active{transform:scale(0.9);background:#f0f4ff;}
        .mob-picker-icon{font-size:22px;line-height:1;}
        .mob-picker-txt{font-size:8px;font-weight:700;color:#6b7280;text-align:center;}

        /* online bar */
        .mob-online-bar{
          display:flex;align-items:center;gap:8px;
          padding:10px 16px;margin:8px 0 4px;
          background:rgba(15,23,42,0.04);
          border-radius:12px;
          margin-left:16px;margin-right:16px;
          flex-shrink:0;
        }
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

      {/* scrollable table */}
      <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',padding:'0 0 8px'}}>
        <table className="mob-table" style={{minWidth: 60 + week.length * 80}}>
          {/* header */}
          <thead>
            <tr style={{background:'#fafbff'}}>
              <th className="mob-sticky mob-hdr-day" style={{width:110,minWidth:110,background:'#fafbff'}}/>
              {week.map(d=>(
                <th key={d.ds} className="mob-hdr-day" style={{minWidth:78,width:78}}>
                  <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'0.06em',marginBottom:4,color:d.isToday?'#770bff':d.hol?'#be185d':d.isWE?'#2563eb':'#9ca3af'}}>
                    {d.dayName.toUpperCase()}
                  </div>
                  <div style={{width:28,height:28,borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'#111827',fontSize:'13px',fontWeight:'700'}}>
                    {d.num}
                  </div>
                  {(d.hol||d.isWE) && (
                    <div style={{fontSize:14,marginTop:2}}>{d.hol?d.hol.split(' ')[0]:'🏝️'}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* body */}
          <tbody>
            {staffList.map((m, rowIdx) => {
              const isMe    = m.email.toLowerCase() === me;
              const isFirst = rowIdx === 0;
              return (
                <tr key={m.id}>
                  {/* name col */}
                  <td className="mob-sticky" style={{background:'#fff',width:110,minWidth:110}}>
                    <div className="mob-nw">
                      <div
                        style={{position:'relative',cursor:isMe?'pointer':'default',flexShrink:0}}
                        onClick={()=>{ if (isMe) setSocialMenu(socialMenu===m.id?null:m.id); }}
                      >
                        <Avatar name={m.name} photoUrl={staffPhotos[m.id]} size={36} isMe={isMe}/>
                        {emotions[m.id] && (
                          <div style={{position:'absolute',bottom:-3,right:-3,background:'#fff',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,boxShadow:'0 1px 4px rgba(0,0,0,0.12)',border:'1.5px solid #fff'}}>
                            {emotions[m.id]}
                          </div>
                        )}
                        {/* mood picker */}
                        {isMe && socialMenu === m.id && (
                          <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:700,background:'#fff',borderRadius:12,display:'flex',padding:6,gap:3,boxShadow:'0 8px 28px rgba(0,0,0,0.12)',border:'1px solid #e5e7eb',animation:'mobDropIn 0.15s ease',whiteSpace:'nowrap'}}>
                            {['🧘','⚡','☕','🎯','🚀','💪','🌱'].map(emo=>(
                              <div
                                key={emo}
                                onTouchEnd={e=>{e.preventDefault();e.stopPropagation();triggerMoodFly(emo,e.currentTarget);setSocialMenu(null);}}
                                onClick={e=>{e.stopPropagation();triggerMoodFly(emo,e.currentTarget);setSocialMenu(null);}}
                                style={{fontSize:'18px',cursor:'pointer',padding:'4px',borderRadius:'6px'}}
                              >{emo}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{minWidth:0,flex:1}}>
                        <div style={{fontSize:12,fontWeight:isMe?700:500,color:isMe?'#111827':'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name.split(' ')[0]}</div>
                        {isMe && <div style={{fontSize:8,fontWeight:700,background:'linear-gradient(90deg,#009bff,#770bff)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',letterSpacing:'0.06em',marginTop:1}}>YOU</div>}
                      </div>
                    </div>
                  </td>

                  {/* day cols */}
                  {week.map((d, weekIdx) => {
                    if (!d.editable) {
                      if (!isFirst) return <td key={d.ds}/>;
                      const isHol = !!d.hol;
                      return (
                        <td key={d.ds} rowSpan={staffList.length} style={{padding:'4px 3px',verticalAlign:'top',height:90}}>
                          <div
                            className={`mob-pill ${isHol?'hol':'we'}`}
                            style={{height:'100%'}}
                            onTouchEnd={e=>{
                              e.preventDefault();
                              // fire party via a custom event so App.jsx handles it
                              const evt = new CustomEvent('mob-party', { detail: { type: isHol?'holiday':'weekend', text: d.hol||'', ds: d.ds }, bubbles: true });
                              e.currentTarget.dispatchEvent(evt);
                            }}
                          >
                            <span style={{fontSize:20}}>{isHol?d.hol.split(' ')[0]:'🏝️'}</span>
                            <span style={{fontSize:8,fontWeight:700,color:isHol?'#be185d':'#2563eb',letterSpacing:'0.04em',textTransform:'uppercase',textAlign:'center',padding:'0 2px'}}>
                              {isHol?d.hol.replace(/^\S+\s/,''):'Weekend'}
                            </span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={d.ds} style={{padding:'0 3px',verticalAlign:'top'}}>
                        <div className="mob-dw">
                          {['AM','PM'].map(shift => {
                            const key    = `${m.id}-${d.ds}-${shift}`;
                            const sid    = records[key] || 'none';
                            const cfg    = STATUS_CONFIG[sid];
                            const inPrev = dragPreview.includes(key);
                            const cellCls = !isMe
                              ? 'mob-cell mob-cell-other'
                              : sid !== 'none'
                                ? 'mob-cell mob-cell-set'
                                : 'mob-cell mob-cell-mine';

                            return (
                              <div
                                key={shift}
                                ref={el => registerCell(key, el)}
                                className={`${cellCls}${inPrev?' mob-cell-preview':''} mob-cell`}
                                style={sid!=='none'?{background:cfg.bg,color:cfg.color,border:`1.5px solid ${cfg.color}40`}:{}}
                                onTouchStart={e => handleTouchStart(e, key, sid, isMe)}
                                onTouchMove={e  => handleTouchMove(e, isMe)}
                                onTouchEnd={e   => handleTouchEnd(e, key, sid, isMe)}
                                onClick={()=>{
                                  // fallback for desktop inside mobile layout
                                  if (!isMe) return;
                                  if (sid !== 'none') { onStatusClear(key); }
                                  else { setActiveCell(activeCell===key?null:key); }
                                }}
                              >
                                {sid !== 'none'
                                  ? <><span className="mob-cell-icon">{cfg.icon}</span><span>{shift}</span></>
                                  : <span style={{fontSize:10,color:'#c7d2fe',fontWeight:700}}>{shift}</span>
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

      {/* floating status picker */}
      {activeCell && (
        <div className="mob-picker" onClick={e=>e.stopPropagation()}>
          {dragPreview.length > 1 && (
            <div style={{position:'absolute',top:-28,left:'50%',transform:'translateX(-50%)',background:'linear-gradient(90deg,#009bff,#770bff)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:100,whiteSpace:'nowrap'}}>
              {dragPreview.length} cells
            </div>
          )}
          {Object.entries(STATUS_CONFIG).map(([sId, sCfg]) => (
            <div
              key={sId}
              className="mob-picker-opt"
              onTouchEnd={e=>{e.preventDefault();handleStatusPick(sId);}}
              onClick={()=>handleStatusPick(sId)}
            >
              <span className="mob-picker-icon">{sCfg.icon}</span>
              <span className="mob-picker-txt">{sCfg.label.split(' ')[0]}</span>
            </div>
          ))}
          <div
            className="mob-picker-opt"
            style={{borderColor:'#fee2e2',background:'#fff5f5'}}
            onTouchEnd={e=>{e.preventDefault();if(activeCell)onStatusClear(activeCell);setActiveCell(null);setDragPreview([]);}}
            onClick={()=>{if(activeCell)onStatusClear(activeCell);setActiveCell(null);setDragPreview([]);}}
          >
            <span className="mob-picker-icon">✕</span>
            <span className="mob-picker-txt" style={{color:'#ef4444'}}>Clear</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileView;