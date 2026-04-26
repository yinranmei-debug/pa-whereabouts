import React, { useState, useRef } from 'react';
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
  onWeekly,
  onHuddle,
  onLogout,
  accountName = '',
  weeklyUnreadCount = 0,
  birthdayUnread = false,
}) => {
  const fmt = d => {
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  };
  const realTodayDs = fmt(new Date());
  const realTodayDay = week.find(d => d.ds === realTodayDs);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [picker, setPicker] = useState(null);
  const [activePane, setActivePane] = useState('calendar');
  const [detailGroup, setDetailGroup] = useState(null);
  const [showBirthdaySheet, setShowBirthdaySheet] = useState(false);

  const [selectedDs, setSelectedDs] = useState(() => {
    const inWeek = week.find(d => d.ds === realTodayDs);
    return inWeek ? realTodayDs : week[0]?.ds;
  });

  const handleTouchStart = (e) => {
    if (e.target.closest('[data-no-page-swipe]')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 60 && dy < 40) {
      if (dx < 0) setActivePane('tools');
      else setActivePane('calendar');
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
  const activeSelectedDs = selectedDsInWeek ? selectedDs : (realTodayDay ? realTodayDs : week[0]?.ds);
  const selectedDay = week.find(d => d.ds === activeSelectedDs);
  const selectedIsRealToday = activeSelectedDs === realTodayDs;
  const selectedHolidayName = selectedDay?.hol;
  const goToToday = () => {
    setSelectedDs(realTodayDs);
    onToday?.(realTodayDs);
  };

  const moveWeek = dir => {
    onSwipeWeek?.(dir);
    setSelectedDs(null);
  };

  const getInitials = name => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  const teamRecap = selectedDay
    ? (() => {
        const emptyGroups = Object.fromEntries(
          Object.entries(STATUS_CONFIG).map(([sid, cfg]) => [sid, { id: sid, cfg, people: [] }])
        );

        staffList
          .filter(member => member.email?.toLowerCase() !== me)
          .forEach(member => {
            const shifts = ['AM', 'PM'].map(shift => ({
              shift,
              sid: records[`${member.id}-${selectedDay.ds}-${shift}`] || null,
            })).filter(item => item.sid && emptyGroups[item.sid]);

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

  const detailPeople = detailGroup?.people || [];
  const nonMeTeamCount = staffList.filter(m => m.email?.toLowerCase() !== me).length;

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
        .mv-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'8px 0 2px'}}>
        {['calendar','tools'].map(pane => (
          <button
            key={pane}
            onClick={() => setActivePane(pane)}
            aria-label={pane === 'calendar' ? 'Calendar page' : 'Tools page'}
            style={{
              width:activePane === pane ? 22 : 7,height:7,borderRadius:10,border:'none',
              background:activePane === pane ? 'linear-gradient(90deg,#009bff,#770bff)' : 'rgba(167,139,250,0.28)',
              padding:0,cursor:'pointer',transition:'all 0.2s',
            }}
          />
        ))}
      </div>

      {activePane === 'calendar' ? (
        <>

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
        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
          <button
            onClick={() => moveWeek('prev')}
            aria-label="Previous week"
            style={{width:30,height:30,borderRadius:11,border:'1px solid rgba(167,139,250,0.2)',background:'rgba(255,255,255,0.045)',color:'rgba(232,229,255,0.78)',fontSize:22,lineHeight:1,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0}}
          >‹</button>
          <div style={{fontSize:13,fontWeight:700,color:'rgba(232,229,255,0.7)',letterSpacing:'-0.01em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {activeSelectedDs ? new Date(activeSelectedDs+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''}
          </div>
          <button
            onClick={() => moveWeek('next')}
            aria-label="Next week"
            style={{width:30,height:30,borderRadius:11,border:'1px solid rgba(167,139,250,0.2)',background:'rgba(255,255,255,0.045)',color:'rgba(232,229,255,0.78)',fontSize:22,lineHeight:1,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0}}
          >›</button>
        </div>
        {!selectedIsRealToday && (
          <div
            onClick={goToToday}
            style={{padding:'4px 12px',borderRadius:100,background:'linear-gradient(90deg,#009bff,#770bff)',fontSize:11,fontWeight:700,color:'#fff',cursor:'pointer',flexShrink:0}}
          >Today</div>
        )}
      </div>

      <div
        data-no-page-swipe
        className="mv-scroll"
        style={{
          padding:'0 12px 14px',
          display:'flex',gap:8,
          overflowX:'auto',
          WebkitOverflowScrolling:'touch',
          scrollbarWidth:'none',
          scrollSnapType:'x mandatory',
        }}
      >
        {week.map(d => {
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
                flex:'0 0 27%', minWidth:96, maxWidth:112,
                padding:'10px 4px 8px',borderRadius:14,
                display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                cursor:'pointer',
                scrollSnapAlign:'start',
                background: isSel
                  ? 'linear-gradient(180deg,rgba(0,155,255,0.18),rgba(119,11,255,0.18))'
                  : d.editable ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.018)',
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
              {!d.editable && (
                <div style={{fontSize:8,fontWeight:800,letterSpacing:'0.08em',color:'rgba(232,229,255,0.26)',height:8}}>
                  {d.hol ? 'HOL' : 'WEEKEND'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* my day card */}
      {selectedDay && myId && selectedDay.editable && (
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

      {selectedDay && myId && !selectedDay.editable && (
        <div style={{padding:'0 14px'}}>
          <div style={{
            background:selectedHolidayName
              ? 'linear-gradient(135deg,rgba(255,0,120,0.13),rgba(255,183,0,0.08))'
              : 'linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))',
            border:selectedHolidayName ? '1px solid rgba(255,143,176,0.32)' : '1px solid rgba(167,139,250,0.16)',
            borderRadius:22,padding:18,
            color:'rgba(232,229,255,0.62)',
            backdropFilter:'blur(14px)',
            display:'flex',alignItems:'center',gap:14,
          }}>
            <div style={{
              width:50,height:50,borderRadius:17,
              display:'flex',alignItems:'center',justifyContent:'center',
              background:selectedHolidayName ? 'rgba(255,143,176,0.16)' : 'rgba(167,139,250,0.1)',
              border:selectedHolidayName ? '1px solid rgba(255,143,176,0.36)' : '1px solid rgba(167,139,250,0.18)',
              fontSize:27,flexShrink:0,
            }}>
              {selectedHolidayName ? '🎉' : '☁️'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:'0.14em',color:selectedHolidayName ? 'rgba(255,225,74,0.74)' : 'rgba(167,139,250,0.58)',marginBottom:6}}>YOUR STATUS</div>
              <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:5,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {selectedHolidayName || `${selectedDay.dayName} ${selectedDay.num}`}
              </div>
              <div style={{fontSize:13,lineHeight:1.45}}>No work status is needed for this day.</div>
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

      {/* team by selected day */}
      {selectedDay && (
        <div style={{padding:'18px 14px 0'}}>
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',padding:'0 4px 10px'}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.14em',color:'rgba(167,139,250,0.7)'}}>
              THE TEAM · {selectedDay.dayName?.toUpperCase()} {selectedDay.num}
            </div>
            <div style={{fontSize:11,color:'rgba(232,229,255,0.4)',fontWeight:500}}>{nonMeTeamCount} people</div>
          </div>
          {teamRecap.length === 0 ? (
            <div style={{
              background:'linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))',
              border:'1px solid rgba(167,139,250,0.14)',
              borderRadius:18,padding:'14px 14px',
              color:'rgba(232,229,255,0.62)',fontSize:13,
            }}>
              No team status updates for this day.
            </div>
          ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {teamRecap.map(group => (
              <button key={group.id} onClick={() => setDetailGroup(group)} style={{
                display:'flex',alignItems:'center',gap:12,
                background:'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))',
                border:`1px solid ${group.cfg.border || 'rgba(167,139,250,0.18)'}`,
                borderRadius:18,padding:'13px 12px',
                backdropFilter:'blur(12px)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
                width:'100%',textAlign:'left',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",
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
                    Tap to view AM / PM details
                  </div>
                </div>
                <div style={{fontSize:24,color:'rgba(232,229,255,0.36)',paddingRight:2}}>›</div>
              </button>
            ))}
          </div>
          )}
        </div>
      )}

        </>
      ) : (
        <div style={{padding:'18px 14px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:'0.14em',color:'rgba(167,139,250,0.65)',marginBottom:5}}>TEAM HUB</div>
              <div style={{fontSize:22,fontWeight:900,color:'#fff',letterSpacing:'-0.03em'}}>Quick Actions</div>
            </div>
            <button onClick={() => setActivePane('calendar')} style={{width:40,height:40,borderRadius:14,border:'1px solid rgba(167,139,250,0.22)',background:'rgba(255,255,255,0.055)',color:'#fff',fontSize:20,cursor:'pointer'}}>←</button>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              { label:'Weekly Team Update', icon:'🗓️', hint:'Open the team notes for this week', badge:weeklyUnreadCount || '', onClick:onWeekly, accent:'rgba(167,139,250,0.55)' },
              { label:'Birthdays This Week', icon:'🎂', hint:bdaysThisWeek.length ? `${bdaysThisWeek.length} birthday${bdaysThisWeek.length === 1 ? '' : 's'} this week` : 'No birthdays this week', badge:birthdayUnread ? '1' : '', onClick:()=>setShowBirthdaySheet(true), accent:'rgba(255,183,0,0.5)' },
              { label:'Mind Huddle', icon:'🪐', hint:'Open today’s huddle card', badge:'', onClick:onHuddle, accent:'rgba(139,92,246,0.55)' },
              { label:'Sign Out', icon:getInitials(accountName || meStaff?.name || 'Me'), hint:accountName || 'Account', badge:'', onClick:onLogout, accent:'rgba(106,199,255,0.45)' },
            ].map(action => (
              <button key={action.label} onClick={action.onClick} style={{minHeight:92,borderRadius:22,border:`1px solid ${action.accent}`,background:'linear-gradient(135deg,rgba(255,255,255,0.074),rgba(255,255,255,0.022))',color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif",padding:14,cursor:'pointer',textAlign:'left',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',gap:14,boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)'}}>
                {action.badge !== '' && (
                  <div style={{position:'absolute',top:10,right:10,minWidth:20,height:20,borderRadius:10,background:'linear-gradient(135deg,#009bff,#770bff)',fontSize:10,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px'}}>
                    {action.badge}
                  </div>
                )}
                <div style={{width:48,height:48,borderRadius:17,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,10,40,0.72)',border:'1px solid rgba(167,139,250,0.18)',fontSize:action.label === 'Sign Out' ? 15 : 24,fontWeight:900,flexShrink:0}}>
                  {action.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:16,fontWeight:900,letterSpacing:'-0.01em'}}>{action.label}</div>
                  <div style={{fontSize:12,color:'rgba(232,229,255,0.45)',marginTop:4,lineHeight:1.35}}>{action.hint}</div>
                </div>
                <div style={{fontSize:24,color:'rgba(232,229,255,0.32)',paddingRight:2}}>›</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showBirthdaySheet && (
        <div
          onClick={() => setShowBirthdaySheet(false)}
          style={{
            position:'fixed',inset:0,zIndex:875,
            background:'rgba(7,12,30,0.55)',backdropFilter:'blur(8px)',
            animation:'mvFadeIn 0.18s ease',
            display:'flex',alignItems:'flex-end',
          }}
        >
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              width:'100%',maxHeight:'78vh',overflowY:'auto',
              background:'linear-gradient(180deg,rgba(20,16,48,0.98),rgba(11,18,40,0.98))',
              borderRadius:'24px 24px 0 0',
              border:'1px solid rgba(255,183,0,0.26)',
              borderBottom:'none',
              padding:'12px 16px 30px',
              boxShadow:'0 -16px 48px rgba(0,0,0,0.5)',
              animation:'mvSheetUp 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <div style={{width:40,height:4,borderRadius:2,background:'rgba(255,183,0,0.28)',margin:'0 auto 14px'}}/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:14}}>
              <div>
                <div style={{fontSize:10,fontWeight:900,letterSpacing:'0.14em',color:'rgba(255,225,74,0.72)',marginBottom:4}}>BIRTHDAYS</div>
                <div style={{fontSize:18,fontWeight:900,color:'#fff'}}>This Week</div>
              </div>
              <button onClick={() => setShowBirthdaySheet(false)} style={{width:32,height:32,borderRadius:12,border:'1px solid rgba(255,183,0,0.18)',background:'rgba(255,255,255,0.06)',color:'rgba(232,229,255,0.78)',fontSize:17,cursor:'pointer'}}>×</button>
            </div>
            {bdaysThisWeek.length === 0 ? (
              <div style={{padding:'18px 14px',borderRadius:18,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,183,0,0.16)',color:'rgba(232,229,255,0.62)',fontSize:13}}>
                No birthdays this week.
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {bdaysThisWeek.map(b => {
                  const person = staffList.find(s => s.id === b.id);
                  if (!person) return null;
                  return (
                    <div key={`${b.id}-${b.ds}`} style={{
                      display:'flex',alignItems:'center',gap:12,
                      padding:'11px 10px',borderRadius:16,
                      background:b.isToday ? 'linear-gradient(90deg,rgba(255,183,0,0.17),rgba(244,114,182,0.12))' : 'rgba(255,255,255,0.04)',
                      border:b.isToday ? '1px solid rgba(255,183,0,0.38)' : '1px solid rgba(255,183,0,0.12)',
                    }}>
                      <Avatar name={person.name} photoUrl={staffPhotos[person.id]} size={36}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:900,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{person.name}</div>
                        <div style={{fontSize:11,color:b.isToday ? '#fde68a' : 'rgba(232,229,255,0.46)',marginTop:2}}>
                          {b.isToday ? 'Today' : b.dayName}
                        </div>
                      </div>
                      <div style={{fontSize:20}}>🎂</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {detailGroup && (
        <div
          onClick={() => setDetailGroup(null)}
          style={{
            position:'fixed',inset:0,zIndex:880,
            background:'rgba(7,12,30,0.55)',backdropFilter:'blur(8px)',
            animation:'mvFadeIn 0.18s ease',
            display:'flex',alignItems:'flex-end',
          }}
        >
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              width:'100%',maxHeight:'78vh',overflowY:'auto',
              background:'linear-gradient(180deg,rgba(20,16,48,0.98),rgba(11,18,40,0.98))',
              borderRadius:'24px 24px 0 0',
              border:'1px solid rgba(167,139,250,0.25)',
              borderBottom:'none',
              padding:'12px 16px 30px',
              boxShadow:'0 -16px 48px rgba(0,0,0,0.5)',
              animation:'mvSheetUp 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <div style={{width:40,height:4,borderRadius:2,background:'rgba(167,139,250,0.3)',margin:'0 auto 14px'}}/>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{
                width:44,height:44,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',
                background:detailGroup.cfg.bg,border:`1px solid ${detailGroup.cfg.border || detailGroup.cfg.color}`,
                fontSize:23,flexShrink:0,
              }}>
                {detailGroup.cfg.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:17,fontWeight:900,color:'#fff'}}>{detailGroup.cfg.label}</div>
                <div style={{fontSize:12,color:'rgba(232,229,255,0.48)',marginTop:2}}>
                  {selectedDay?.dayName} {selectedDay?.num} · {detailPeople.length} people
                </div>
              </div>
              <button onClick={() => setDetailGroup(null)} style={{width:32,height:32,borderRadius:12,border:'1px solid rgba(167,139,250,0.18)',background:'rgba(255,255,255,0.06)',color:'rgba(232,229,255,0.78)',fontSize:17,cursor:'pointer'}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {detailPeople.map(person => (
                <div key={person.id} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'10px 8px',borderRadius:14,
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(167,139,250,0.1)',
                }}>
                  <Avatar name={person.name} photoUrl={staffPhotos[person.id]} size={34}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{person.name}</div>
                  </div>
                  <div style={{display:'flex',gap:5}}>
                    {person.shifts.map(shift => (
                      <span key={shift} style={{
                        padding:'4px 8px',borderRadius:9,
                        background:detailGroup.cfg.bg,
                        border:`1px solid ${detailGroup.cfg.border || detailGroup.cfg.color}`,
                        color:'#fff',fontSize:10,fontWeight:900,
                      }}>{shift}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
