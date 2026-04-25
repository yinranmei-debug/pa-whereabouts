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
}) => {
  const editableDays = week.filter(d => d.editable);
  const todayDay     = editableDays.find(d => d.isToday) || editableDays[0];

  const fmt = d => {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  const realTodayDs = fmt(new Date());

  // 1. FIXED: Initialize Refs
  const swipeRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [picker, setPicker] = useState(null);

  const [selectedDs, setSelectedDs] = useState(() => {
    const inWeek = week.find(d => d.ds === realTodayDs);
    return inWeek ? realTodayDs : editableDays[0]?.ds;
  });

  // Sync selectedDs when week changes
  useEffect(() => {
    const inWeek = week.find(d => d.ds === realTodayDs);
    if (inWeek) setSelectedDs(realTodayDs);
    else setSelectedDs(editableDays[0]?.ds);
  }, [week]);

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
  const openPicker = (ds, shift) => setPicker({ ds, shift });
  const closePicker = () => setPicker(null);

  const pickStatus = (sid) => {
    if (!picker || !myId) return;
    onStatusSelect(`${myId}-${picker.ds}-${picker.shift}`, sid);
    closePicker();
  };

  const selectedDay = week.find(d => d.ds === selectedDs);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        paddingBottom: 120, minHeight: '100vh',
        background: 'transparent', position: 'relative',
      }}
    >
      <style>{`
        @keyframes mvFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mvSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .mv-tile:active { transform:scale(0.97); }
        .mv-day:active  { transform:scale(0.94); }
        .mv-opt:active  { transform:scale(0.92); }
      `}</style>

      {/* Online Status */}
      {onlineUsers.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', margin: '8px 14px 0', marginLeft: 'auto', width: 'fit-content',
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 100,
          fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: '0.06em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
          {onlineUsers.length} ONLINE
        </div>
      )}

      {/* Week Strip */}
      <div style={{ padding: '14px 12px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(232,229,255,0.7)', letterSpacing: '-0.01em' }}>
          {selectedDs ? new Date(selectedDs + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </div>
        {(!editableDays.find(d => d.isToday) || selectedDs !== editableDays.find(d => d.isToday)?.ds) && (
          <div
            onClick={() => setSelectedDs(editableDays.find(d => d.isToday)?.ds || editableDays[0]?.ds)}
            style={{ padding: '4px 12px', borderRadius: 100, background: 'linear-gradient(90deg,#009bff,#770bff)', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }}
          >Today</div>
        )}
      </div>

      <div style={{ padding: '0 12px 14px', display: 'flex', gap: 6 }}>
        {editableDays.map(d => {
          const isSel = d.ds === selectedDs;
          const am = myId && records[`${myId}-${d.ds}-AM`];
          const pm = myId && records[`${myId}-${d.ds}-PM`];
          const filled = (am ? 1 : 0) + (pm ? 1 : 0);
          return (
            <div
              key={d.ds}
              className="mv-day"
              onClick={() => setSelectedDs(d.ds)}
              style={{
                flex: 1, minWidth: 0,
                padding: '10px 4px 8px', borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer',
                background: isSel ? 'linear-gradient(180deg,rgba(0,155,255,0.18),rgba(119,11,255,0.18))' : 'rgba(255,255,255,0.03)',
                border: isSel ? '1.5px solid rgba(167,139,250,0.5)' : '1px solid rgba(167,139,250,0.1)',
                boxShadow: isSel ? '0 4px 16px rgba(119,11,255,0.25)' : 'none',
                transition: 'all 0.18s',
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: d.isToday ? '#a78bfa' : isSel ? 'rgba(232,229,255,0.9)' : 'rgba(232,229,255,0.4)' }}>
                {(d.dayName || '').slice(0, 3).toUpperCase()}
              </div>
              <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: d.isToday ? 'linear-gradient(135deg,#009bff,#770bff)' : 'transparent', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: d.isToday ? '0 4px 12px rgba(119,11,255,0.4)' : 'none' }}>
                {d.num}
              </div>
              <div style={{ display: 'flex', gap: 3, marginTop: 2, height: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: filled >= 1 ? '#4ade80' : 'rgba(167,139,250,0.2)' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: filled >= 2 ? '#4ade80' : 'rgba(167,139,250,0.2)' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* My Day Card */}
      {selectedDay && myId && (
        <div style={{ padding: '0 14px' }}>
          <div style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))',
            backdropFilter: 'blur(20px) saturate(140%)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 22, padding: 16,
            boxShadow: '0 12px 40px rgba(10,5,32,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(167,139,250,0.7)', marginBottom: 4 }}>YOUR STATUS</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  {selectedDay.isToday ? `Today, ${selectedDay.dayName} ${selectedDay.num}` : `${selectedDay.dayName} ${selectedDay.num}`}
                </div>
              </div>
              {selectedDay.isToday && (
                <div style={{ padding: '4px 10px', borderRadius: 100, background: 'linear-gradient(90deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2))', border: '1px solid rgba(167,139,250,0.4)', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#c4b5fd' }}>NOW</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['AM', 'PM'].map(shift => {
                const sid = records[`${myId}-${selectedDay.ds}-${shift}`];
                const cfg = sid && STATUS_CONFIG[sid];
                return (
                  <div key={shift} className="mv-tile" onClick={() => openPicker(selectedDay.ds, shift)} style={{ flex: 1, minHeight: 128, borderRadius: 18, padding: '14px 14px 16px', cursor: 'pointer', background: cfg ? cfg.bg : 'rgba(255,255,255,0.04)', border: cfg ? `1.5px solid ${cfg.border || cfg.color}` : '1.5px dashed rgba(167,139,250,0.25)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', color: cfg ? (cfg.color || '#fff') : 'rgba(232,229,255,0.4)' }}>{shift === 'AM' ? 'MORNING' : 'AFTERNOON'}</div>
                    {cfg ? (
                      <div>
                        <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 6 }}>{cfg.icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{cfg.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(232,229,255,0.45)', marginTop: 4 }}>tap to change</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,rgba(0,155,255,0.2),rgba(119,11,255,0.2))', border: '1px solid rgba(167,139,250,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', marginBottom: 8 }}>+</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(232,229,255,0.75)' }}>Add status</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Birthdays Strip */}
      {bdaysThisWeek.length > 0 && (
        <div style={{ padding: '18px 14px 0' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(255,183,0,0.12),rgba(244,114,182,0.1))', border: '1px solid rgba(255,183,0,0.3)', borderRadius: 18, padding: '14px 14px 12px', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🎂</span>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fde68a' }}>BIRTHDAYS THIS WEEK</div>
            </div>
            {bdaysThisWeek.map(b => {
              const t = staffList.find(s => s.id === b.id);
              if (!t) return null;
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: b.isToday ? '10px 12px' : '6px 4px', marginBottom: 6, background: b.isToday ? 'rgba(255,183,0,0.2)' : 'transparent', borderRadius: 12 }}>
                  <Avatar name={t.name} photoUrl={staffPhotos[t.id]} size={b.isToday ? 36 : 26} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: b.isToday ? 14 : 13, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                    {b.isToday && <div style={{ fontSize: 11, color: '#fde68a' }}>🎉 Today!</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Today Strip */}
      {todayDay && (() => {
        const others = staffList.filter(m => m.email?.toLowerCase() !== me);
        const peopleStatus = others.map(t => ({
          ...t,
          am: records[`${t.id}-${todayDay.ds}-AM`] || null,
          pm: records[`${t.id}-${todayDay.ds}-PM`] || null,
        })).filter(t => t.am || t.pm);

        if (peopleStatus.length === 0) return null;
        return (
          <div style={{ padding: '18px 14px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(167,139,250,0.7)', padding: '0 4px 10px' }}>THE TEAM TODAY</div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: '4px 0' }}>
              {peopleStatus.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < peopleStatus.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <Avatar name={t.name} photoUrl={staffPhotos[t.id]} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{t.name.split(' ')[0]}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['AM', 'PM'].map(shift => {
                        const sid = shift === 'AM' ? t.am : t.pm;
                        const cfg = sid && STATUS_CONFIG[sid];
                        return (
                          <div key={shift} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, background: cfg ? cfg.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${cfg ? (cfg.border || cfg.color) : 'rgba(255,255,255,0.12)'}` }}>
                            <span style={{ fontSize: 10 }}>{cfg ? cfg.icon : '🏢'}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: cfg ? '#fff' : 'rgba(255,255,255,0.35)' }}>{shift}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Status Picker Bottom Sheet */}
      {picker && (() => {
        const day = week.find(d => d.ds === picker.ds);
        const current = myId && records[`${myId}-${picker.ds}-${picker.shift}`];
        return (
          <div onClick={closePicker} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(7,12,30,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#141030', borderRadius: '24px 24px 0 0', padding: '12px 16px 30px', animation: 'mvSheetUp 0.28s ease' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 14px' }} />
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.7)' }}>{picker.shift} · {day?.dayName?.toUpperCase()} {day?.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Where will you be?</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div onClick={() => { onStatusClear(`${myId}-${picker.ds}-${picker.shift}`); closePicker(); }} style={{ padding: '14px 8px', borderRadius: 14, background: !current ? 'rgba(0,155,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${!current ? '#009bff' : 'transparent'}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 26 }}>🏢</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Office</div>
                </div>
                {Object.entries(STATUS_CONFIG).map(([sid, cfg]) => (
                  <div key={sid} onClick={() => pickStatus(sid)} style={{ padding: '14px 8px', borderRadius: 14, background: sid === current ? cfg.bg : 'rgba(255,255,255,0.05)', border: `1.5px solid ${sid === current ? (cfg.border || cfg.color) : 'transparent'}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 26 }}>{cfg.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{cfg.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MobileView;