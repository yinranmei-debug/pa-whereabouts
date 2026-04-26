import React, { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar';

/**
 * MobileView — refined.
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
  onSwipeWeek,
  onToday,
}) => {
  const editableDays = week.filter(d => d.editable);

  const fmt = d => {
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  };
  const realTodayDs = fmt(new Date());
  const realTodayDay = week.find(d => d.ds === realTodayDs);

  const swipeRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [picker, setPicker] = useState(null);

  const [selectedDs, setSelectedDs] = useState(() => {
    const inWeek = week.find(d => d.ds === realTodayDs);
    return inWeek ? realTodayDs : editableDays[0]?.ds;
  });

  useEffect(() => { 
    swipeRef.current = onSwipeWeek; 
  }, [onSwipeWeek]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 60 && dy < 40) {
      if (dx < 0) swipeRef.current?.('next');
      else swipeRef.current?.('prev');
    }
    touchStartX.current = null;
  };

  const myId = meStaff?.id;

  const openPicker  = (ds, shift) => setPicker({ ds, shift });
  const closePicker = () => setPicker(null);

  const pickStatus = (sid) => {
    if (!picker || !myId) return;
    onStatusSelect(`${myId}-${picker.ds}-${picker.shift}`, sid);
    closePicker();
  };

  const selectedDsInWeek = week.some(d => d.ds === selectedDs);
  const activeSelectedDs = selectedDsInWeek ? selectedDs : (realTodayDay ? realTodayDs : editableDays[0]?.ds);
  const selectedDay = week.find(d => d.ds === activeSelectedDs);
  const selectedIsRealToday = activeSelectedDs === realTodayDs;
  const goToToday = () => {
    setSelectedDs(realTodayDs);
    onToday?.(realTodayDs);
  };

  const atOfficeConfig = {
    label: 'At Office',
    icon: '🏢',
    color: 'rgba(106,199,255,0.95)',
    bg: 'linear-gradient(135deg,rgba(0,155,255,0.16),rgba(0,229,168,0.12))',
    border: 'rgba(0,155,255,0.55)',
  };

  const getInitials = name => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  const teamRecap = realTodayDay
    ? (() => {
        const emptyGroups = {
          OFFICE: { id: 'OFFICE', cfg: atOfficeConfig, people: [] },
          ...Object.fromEntries(
            Object.entries(STATUS_CONFIG).map(([sid, cfg]) => [sid, { id: sid, cfg, people: [] }])
          ),
        };

        staffList
          .filter(member => member.email?.toLowerCase() !== me)
          .forEach(member => {
            const shifts = ['AM', 'PM'].map(shift => ({
              shift,
              sid: records[`${member.id}-${realTodayDs}-${shift}`] || 'OFFICE',
            }));

            Object.keys(emptyGroups).forEach(sid => {
              const memberShifts = shifts.filter(item => item.sid === sid).map(item => item.shift);
              if (memberShifts.length > 0) {
                emptyGroups[sid].people.push({ ...member, shifts: memberShifts });
              }
            });
          });

        return Object.values(emptyGroups).filter(group => group.people.length > 0);
      })()
    : [];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        paddingBottom:120, minHeight:'100vh',
        background:'transparent', position:'relative',
      }}
    >
      <style>{`
        @keyframes mvFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mvSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .mv-tile:active { transform:scale(0.97); }
        .mv-day:active  { transform:scale(0.94); }
        .mv-opt:active  { transform:scale(0.92); }
      `}</style>

      {/* online status */}
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
      <div style={{padding:'14px 12px 6px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <div style={{fontSize:13,fontWeight:700,color:'rgba(232,229,255,0.7)',letterSpacing:'-0.01em'}}>
          {activeSelectedDs ? new Date(activeSelectedDs+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''}
        </div>
        {!selectedIsRealToday && (
          <div
            onClick={goToToday}
            style={{padding:'4px 12px',borderRadius:100,background:'linear-gradient(90deg,#009bff,#770bff)',fontSize:11,fontWeight:700,color:'#fff',cursor:'pointer',flexShrink:0}}
          >Today</div>
        )}
      </div>

      <div style={{padding:'0 12px 14px',display:'flex',gap:6}}>
        {editableDays.map(d => {
          const isSel = d.ds === activeSelectedDs;
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

      {/* team today */}
      {teamRecap.length > 0 && (
        <div style={{padding:'18px 14px 0'}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',padding:'0 4px 10px'}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.14em',color:'rgba(167,139,250,0.7)'}}>THE TEAM TODAY</div>
            <div style={{fontSize:11,color:'rgba(232,229,255,0.4)',fontWeight:500}}>{staffList.filter(m => m.email?.toLowerCase() !== me).length} people</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {teamRecap.map(group => (
              <div key={group.id} style={{
                display:'flex',alignItems:'center',gap:12,
                background:'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))',
                border:`1px solid ${group.cfg.border || 'rgba(167,139,250,0.18)'}`,
                borderRadius:18,padding:'13px 12px',
                backdropFilter:'blur(12px)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width:42,height:42,borderRadius:14,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:group.cfg.bg,
                  border:`1px solid ${group.cfg.border || group.cfg.color}`,
                  fontSize:22,flexShrink:0,
                }}>
                  {group.cfg.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <div style={{fontSize:15,fontWeight:800,color:'#fff',letterSpacing:'-0.01em'}}>{group.cfg.label}</div>
                    <div style={{fontSize:10,fontWeight:800,color:group.cfg.color,padding:'2px 7px',borderRadius:100,background:'rgba(255,255,255,0.06)'}}>
                      {group.people.length}
                    </div>
                  </div>
                  <div style={{
                    fontSize:12,color:'rgba(232,229,255,0.48)',
                    whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                    lineHeight:1.35,
                  }}>
                    {group.people.map(person => `${person.name.split(' ')[0]} ${person.shifts.join('/')}`).join(', ')}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',minWidth:74,flexShrink:0}}>
                  {group.people.slice(0, 3).map((person, i) => (
                    <div key={person.id} style={{
                      width:32,height:32,borderRadius:'50%',
                      marginLeft:i === 0 ? 0 : -9,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background:'linear-gradient(135deg,rgba(167,139,250,0.95),rgba(0,155,255,0.9))',
                      border:'2px solid rgba(12,18,48,0.95)',
                      color:'#fff',fontSize:10,fontWeight:900,
                      boxShadow:'0 4px 10px rgba(0,0,0,0.28)',
                    }}>
                      {getInitials(person.name)}
                    </div>
                  ))}
                  {group.people.length > 3 && (
                    <div style={{
                      width:32,height:32,borderRadius:'50%',marginLeft:-9,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background:'rgba(12,18,48,0.9)',
                      border:'2px solid rgba(167,139,250,0.35)',
                      color:'rgba(232,229,255,0.85)',fontSize:10,fontWeight:900,
                    }}>
                      +{group.people.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

              {picker && (() => {
                const curSid = myId && records[`${myId}-${picker.ds}-${picker.shift}`];
                return curSid ? (
                  <div
                    onClick={() => { if (myId) onStatusClear(`${myId}-${picker.ds}-${picker.shift}`); closePicker(); }}
                    style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px',borderRadius:12,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',cursor:'pointer',marginBottom:10}}
                  >
                    <span style={{fontSize:13,fontWeight:700,color:'rgba(255,100,100,0.9)'}}>✕ Clear status</span>
                  </div>
                ) : null;
              })()}

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
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
