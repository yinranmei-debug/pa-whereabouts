import React, { useState } from 'react';
import Avatar from './Avatar';

/**
 * MobileView — refined.
 * Scope:
 *   • Editable: my own AM/PM status for any editable day in the week
 *   • Read-only: birthdays this week + team peek today (grouped by status)
 *
 * Props (same shape as before):
 *   staffList, week, records, me, meStaff, STATUS_CONFIG,
 *   onStatusSelect(key, statusId), onStatusClear(key),
 *   staffPhotos, onlineUsers,
 *   bdaysThisWeek?: [{ id, name, ds, isToday }]   // optional — pass from App
 */

const MobileView = ({
  staffList = [],
  week = [],
  records = {},
  me,
  meStaff,
  STATUS_CONFIG = {},
  onStatusSelect,
  onStatusClear,
  staffPhotos = {},
  onlineUsers = [],
  bdaysThisWeek = [],
}) => {
  const editableDays = week.filter(d => d.editable);
  const todayDay     = editableDays.find(d => d.isToday) || editableDays[0];

  const [selectedDs, setSelectedDs] = useState(todayDay?.ds);
  const [picker, setPicker]         = useState(null); // { ds, shift }

  const myId = meStaff?.id;

  const openPicker  = (ds, shift) => setPicker({ ds, shift });
  const closePicker = () => setPicker(null);

  const pickStatus = (sid) => {
    if (!picker || !myId) return;
    onStatusSelect(`${myId}-${picker.ds}-${picker.shift}`, sid);
    closePicker();
  };
  const clearStatus = () => {
    if (!picker || !myId) return;
    onStatusClear(`${myId}-${picker.ds}-${picker.shift}`);
    closePicker();
  };

  const selectedDay = week.find(d => d.ds === selectedDs);

  return (
    <div style={{
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      paddingBottom:120, minHeight:'100vh',
      background:'transparent', position:'relative',
    }}>
      <style>{`
        @keyframes mvFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mvSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .mv-tile:active { transform:scale(0.97); }
        .mv-day:active  { transform:scale(0.94); }
        .mv-opt:active  { transform:scale(0.92); }
      `}</style>

      {/* online (subtle, top-right) */}
      {onlineUsers.length > 0 && (
        <div style={{
          display:'flex',alignItems:'center',gap:6,
          padding:'4px 10px',margin:'8px 14px 0',marginLeft:'auto',width:'fit-content',
          background:'rgba(74,222,128,0.1)',
          border:'1px solid rgba(74,222,128,0.3)',
          borderRadius:100,
          fontSize:10,fontWeight:700,color:'#4ade80',letterSpacing:'0.06em',
        }}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',boxShadow:'0 0 8px #4ade80'}}/>
          {onlineUsers.length} ONLINE
        </div>
      )}

      {/* week strip */}
      <div style={{padding:'14px 12px 14px',display:'flex',gap:6}}>
        {editableDays.map(d => {
          const isSel = d.ds === selectedDs;
          const am = myId && records[`${myId}-${d.ds}-AM`];
          const pm = myId && records[`${myId}-${d.ds}-PM`];
          const filled = (am?1:0) + (pm?1:0);
          return (
            <div
              key={d.ds}
              className="mv-day"
              onClick={()=>setSelectedDs(d.ds)}
              style={{
                flex:1, minWidth:0,
                padding:'10px 4px 8px',borderRadius:14,
                display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                cursor:'pointer',
                background: isSel
                  ? 'linear-gradient(180deg,rgba(0,155,255,0.18),rgba(119,11,255,0.18))'
                  : 'rgba(255,255,255,0.03)',
                border: isSel
                  ? '1.5px solid rgba(167,139,250,0.5)'
                  : '1px solid rgba(167,139,250,0.1)',
                boxShadow: isSel ? '0 4px 16px rgba(119,11,255,0.25)' : 'none',
                transition:'all 0.18s',
              }}
            >
              <div style={{
                fontSize:9,fontWeight:700,letterSpacing:'0.08em',
                color: d.isToday ? '#a78bfa' : isSel ? 'rgba(232,229,255,0.9)' : 'rgba(232,229,255,0.4)',
              }}>
                {(d.dayName || '').slice(0,3).toUpperCase()}
              </div>
              <div style={{
                width:30,height:30,borderRadius:'50%',
                display:'flex',alignItems:'center',justifyContent:'center',
                background: d.isToday ? 'linear-gradient(135deg,#009bff,#770bff)' : 'transparent',
                color: '#fff', fontSize:14,fontWeight:700,
                boxShadow: d.isToday ? '0 4px 12px rgba(119,11,255,0.4)' : 'none',
              }}>
                {d.num}
              </div>
              <div style={{display:'flex',gap:3,marginTop:2,height:5}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:filled>=1?'#4ade80':'rgba(167,139,250,0.2)'}}/>
                <div style={{width:5,height:5,borderRadius:'50%',background:filled>=2?'#4ade80':'rgba(167,139,250,0.2)'}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* my day card */}
      {selectedDay && myId && (
        <div style={{padding:'0 14px'}}>
          <div style={{
            background:'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))',
            backdropFilter:'blur(20px) saturate(140%)',
            border:'1px solid rgba(167,139,250,0.2)',
            borderRadius:22, padding:16,
            boxShadow:'0 12px 40px rgba(10,5,32,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:'rgba(167,139,250,0.7)',marginBottom:4}}>
                  YOUR STATUS
                </div>
                <div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:'-0.01em'}}>
                  {selectedDay.isToday ? `Today, ${selectedDay.dayName} ${selectedDay.num}` : `${selectedDay.dayName} ${selectedDay.num}`}
                </div>
              </div>
              {selectedDay.isToday && (
                <div style={{
                  padding:'4px 10px',borderRadius:100,
                  background:'linear-gradient(90deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2))',
                  border:'1px solid rgba(167,139,250,0.4)',
                  fontSize:9,fontWeight:800,letterSpacing:'0.12em',color:'#c4b5fd',
                }}>NOW</div>
              )}
            </div>

            <div style={{display:'flex',gap:10}}>
              {['AM','PM'].map(shift => {
                const sid = records[`${myId}-${selectedDay.ds}-${shift}`];
                const cfg = sid && STATUS_CONFIG[sid];
                return (
                  <div
                    key={shift}
                    className="mv-tile"
                    onClick={()=>openPicker(selectedDay.ds, shift)}
                    style={{
                      flex:1, minHeight:128,
                      borderRadius:18, padding:'14px 14px 16px',
                      cursor:'pointer',
                      background: cfg ? cfg.bg : 'rgba(255,255,255,0.04)',
                      border: cfg ? `1.5px solid ${cfg.border || cfg.color}` : '1.5px dashed rgba(167,139,250,0.25)',
                      backdropFilter:'blur(8px)',
                      transition:'transform 0.12s',
                      display:'flex',flexDirection:'column',justifyContent:'space-between',
                    }}
                  >
                    <div style={{
                      fontSize:10,fontWeight:800,letterSpacing:'0.16em',
                      color: cfg ? (cfg.color || '#fff') : 'rgba(232,229,255,0.4)',
                    }}>
                      {shift==='AM'?'MORNING':'AFTERNOON'}
                    </div>
                    {cfg ? (
                      <div>
                        <div style={{fontSize:36,lineHeight:1,marginBottom:6}}>{cfg.icon}</div>
                        <div style={{fontSize:15,fontWeight:700,color:'#fff',lineHeight:1.2}}>{cfg.label}</div>
                        <div style={{fontSize:10,color:'rgba(232,229,255,0.45)',marginTop:4,letterSpacing:'0.04em'}}>
                          tap to change
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          width:38,height:38,borderRadius:12,
                          background:'linear-gradient(135deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2))',
                          border:'1px solid rgba(167,139,250,0.35)',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:22,fontWeight:300,color:'#fff',marginBottom:8,
                        }}>+</div>
                        <div style={{fontSize:14,fontWeight:600,color:'rgba(232,229,255,0.75)'}}>Add status</div>
                        <div style={{fontSize:10,color:'rgba(232,229,255,0.35)',marginTop:2}}>where will you be?</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* birthdays this week */}
      {bdaysThisWeek.length > 0 && (
        <div style={{padding:'18px 14px 0'}}>
          <div style={{
            background:'linear-gradient(135deg,rgba(255,183,0,0.12),rgba(244,114,182,0.1))',
            border:'1px solid rgba(255,183,0,0.3)',
            borderRadius:18, padding:'14px 14px 12px',
            backdropFilter:'blur(12px)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute',top:-30,right:-20,fontSize:120,opacity:0.06,
              transform:'rotate(-10deg)',pointerEvents:'none',
            }}>🎂</div>

            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:18}}>🎂</span>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.14em',color:'#fde68a'}}>
                BIRTHDAYS THIS WEEK
              </div>
            </div>

            {bdaysThisWeek.map(b => {
              const t = staffList.find(s => s.id === b.id);
              if (!t) return null;
              return (
                <div key={b.id} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding: b.isToday ? '10px 12px' : '6px 4px',
                  marginBottom:6,
                  background: b.isToday
                    ? 'linear-gradient(90deg,rgba(255,183,0,0.2),rgba(244,114,182,0.15))'
                    : 'transparent',
                  border: b.isToday ? '1px solid rgba(255,183,0,0.4)' : 'none',
                  borderRadius: b.isToday ? 12 : 0,
                }}>
                  <Avatar name={t.name} photoUrl={staffPhotos[t.id]} size={b.isToday?36:26}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:b.isToday?14:13,fontWeight:b.isToday?700:600,color:b.isToday?'#fff':'rgba(232,229,255,0.85)'}}>
                      {t.name}
                    </div>
                    {b.isToday && <div style={{fontSize:11,color:'#fde68a',fontWeight:600,marginTop:1}}>🎉 Today!</div>}
                  </div>
                  <div style={{
                    fontSize:11,fontWeight:700,
                    color: b.isToday ? '#fde68a' : 'rgba(255,200,80,0.8)',
                  }}>
                    {b.isToday ? '' : (b.dayName || '')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* team today (read-only, grouped by status) */}
      {todayDay && (() => {
        const others = staffList.filter(m => m.email?.toLowerCase() !== me);
        const byStatus = {};
        others.forEach(t => {
          const sid = records[`${t.id}-${todayDay.ds}-AM`] || '__office';
          (byStatus[sid] = byStatus[sid] || []).push(t);
        });
        const statusOrder = ['__office', ...Object.keys(STATUS_CONFIG)];
        const visible = statusOrder.filter(s => byStatus[s]?.length);

        return (
          <div style={{padding:'18px 14px 0'}}>
            <div style={{
              display:'flex',alignItems:'baseline',justifyContent:'space-between',
              padding:'0 4px 10px',
            }}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.14em',color:'rgba(167,139,250,0.7)'}}>
                THE TEAM TODAY
              </div>
              <div style={{fontSize:11,color:'rgba(232,229,255,0.4)',fontWeight:500}}>
                {others.length} people
              </div>
            </div>

            <div style={{
              background:'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))',
              border:'1px solid rgba(167,139,250,0.15)',
              borderRadius:18, padding:'4px 0',
              backdropFilter:'blur(12px)',
            }}>
              {visible.map((sid, i) => {
                const cfg = sid === '__office'
                  ? { icon:'🏢', label:'At Office',
                      bg:'rgba(0,155,255,0.12)',
                      border:'rgba(0,155,255,0.4)' }
                  : STATUS_CONFIG[sid];
                const people = byStatus[sid];
                return (
                  <div key={sid} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'12px 14px',
                    borderBottom: i < visible.length-1 ? '1px solid rgba(167,139,250,0.08)' : 'none',
                  }}>
                    <div style={{
                      width:34,height:34,borderRadius:11,flexShrink:0,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:16,
                      background: cfg.bg,
                      border:`1px solid ${cfg.border || cfg.color}`,
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>
                        {cfg.label}
                      </div>
                      <div style={{fontSize:11,color:'rgba(232,229,255,0.45)',marginTop:1,
                                   whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {people.map(p => p.name.split(' ')[0]).join(', ')}
                      </div>
                    </div>
                    <div style={{display:'flex'}}>
                      {people.slice(0,3).map((p,j)=>(
                        <div key={p.id} style={{marginLeft:j===0?0:-8,zIndex:10-j,border:'2px solid #0b1228',borderRadius:'50%'}}>
                          <Avatar name={p.name} photoUrl={staffPhotos[p.id]} size={24}/>
                        </div>
                      ))}
                      {people.length > 3 && (
                        <div style={{
                          marginLeft:-8,width:24,height:24,borderRadius:'50%',
                          background:'rgba(255,255,255,0.08)',border:'2px solid #0b1228',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:9,fontWeight:700,color:'rgba(232,229,255,0.7)',
                        }}>+{people.length-3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* status picker bottom sheet */}
      {picker && (() => {
        const day = week.find(d => d.ds === picker.ds);
        const current = myId && records[`${myId}-${picker.ds}-${picker.shift}`];
        return (
          <div
            onClick={closePicker}
            style={{
              position:'fixed',inset:0,zIndex:900,
              background:'rgba(7,12,30,0.55)',backdropFilter:'blur(8px)',
              animation:'mvFadeIn 0.18s ease',
              display:'flex',alignItems:'flex-end',
            }}
          >
            <div
              onClick={e=>e.stopPropagation()}
              style={{
                width:'100%',
                background:'linear-gradient(180deg,rgba(20,16,48,0.98),rgba(11,18,40,0.98))',
                borderRadius:'24px 24px 0 0',
                border:'1px solid rgba(167,139,250,0.25)',
                borderBottom:'none',
                padding:'12px 16px 30px',
                boxShadow:'0 -16px 48px rgba(0,0,0,0.5)',
                animation:'mvSheetUp 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
                maxHeight:'85vh',overflowY:'auto',
              }}
            >
              <div style={{
                width:40,height:4,borderRadius:2,
                background:'rgba(167,139,250,0.3)',
                margin:'0 auto 14px',
              }}/>

              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:'0.16em',color:'rgba(167,139,250,0.7)',marginBottom:4}}>
                  {picker.shift==='AM'?'MORNING':'AFTERNOON'} · {day?.dayName?.toUpperCase()} {day?.num}
                </div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>
                  Where will you be?
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {/* Office option (clears the record — Office = no record) */}
                <div
                  className="mv-opt"
                  onClick={() => { if (myId) onStatusClear(`${myId}-${picker.ds}-${picker.shift}`); closePicker(); }}
                  style={{
                    padding:'14px 8px 12px',borderRadius:14,
                    background: !current ? 'rgba(0,155,255,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${!current ? 'rgba(0,155,255,0.55)' : 'rgba(167,139,250,0.12)'}`,
                    display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                    cursor:'pointer',
                  }}
                >
                  <span style={{fontSize:26,lineHeight:1}}>🏢</span>
                  <span style={{fontSize:11,fontWeight:700,color: !current ? '#fff' : 'rgba(232,229,255,0.75)'}}>
                    At Office
                  </span>
                </div>
                {Object.entries(STATUS_CONFIG).map(([sid, cfg]) => {
                  const isCur = sid === current;
                  return (
                    <div
                      key={sid}
                      className="mv-opt"
                      onClick={()=>pickStatus(sid)}
                      style={{
                        padding:'14px 8px 12px',borderRadius:14,
                        background: isCur ? cfg.bg : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${isCur ? (cfg.border||cfg.color) : 'rgba(167,139,250,0.12)'}`,
                        display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                        cursor:'pointer',
                      }}
                    >
                      <span style={{fontSize:26,lineHeight:1}}>{cfg.icon}</span>
                      <span style={{fontSize:11,fontWeight:700,textAlign:'center',lineHeight:1.15,color: isCur ? '#fff' : 'rgba(232,229,255,0.75)'}}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MobileView;
