import React, { useEffect, useRef } from 'react';
import Avatar from './Avatar';

export default function TeamTodayPanel({ open, onClose, staffList, records, STATUS_CONFIG, emotions, staffPhotos, isDayMode }) {
  const panelRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const people = staffList.map(s => ({
    ...s,
    am: records[`${s.id}-${today}-AM`] || null,
    pm: records[`${s.id}-${today}-PM`] || null,
    mood: emotions?.[s.id] || null,
  }));

  const night = !isDayMode;

  const bg       = night ? 'rgba(13,10,35,0.97)'       : 'rgba(255,255,255,0.98)';
  const border   = night ? 'rgba(167,139,250,0.18)'     : 'rgba(0,155,255,0.14)';
  const shadow   = night ? '0 16px 48px rgba(0,0,0,0.55), 0 4px 16px rgba(119,11,255,0.12)'
                         : '0 16px 40px rgba(0,155,255,0.1), 0 4px 12px rgba(0,0,0,0.08)';
  const titleC   = night ? 'rgba(167,139,250,0.7)'      : 'rgba(0,100,200,0.55)';
  const nameC    = night ? 'rgba(232,229,255,0.9)'      : '#1A1830';
  const divider  = night ? 'rgba(167,139,250,0.1)'      : 'rgba(0,155,255,0.08)';
  const emptyC   = night ? 'rgba(232,229,255,0.3)'      : 'rgba(26,24,48,0.35)';
  const scrollTrack = night ? 'rgba(167,139,250,0.1)'   : 'rgba(0,155,255,0.08)';

  const StatusChip = ({ statusId }) => {
    if (!statusId) return <span style={{ fontSize: 11, color: emptyC, fontStyle: 'italic' }}>—</span>;
    const cfg = STATUS_CONFIG[statusId];
    if (!cfg) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        color: cfg.color, whiteSpace: 'nowrap', letterSpacing: '0.02em',
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 136,
        right: 24,
        width: 300,
        maxHeight: 420,
        zIndex: 12000,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 18,
        boxShadow: shadow,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'teamTodayIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <style>{`
        @keyframes teamTodayIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: `1px solid ${divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: titleC, textTransform: 'uppercase' }}>
            Team Today
          </div>
          <div style={{ fontSize: 11, color: emptyC, fontWeight: 500, marginTop: 1 }}>{day}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
            fontSize: 14, color: emptyC, borderRadius: 6, lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.color = night ? '#fff' : '#1A1830'}
          onMouseOut={e => e.currentTarget.style.color = emptyC}
        >✕</button>
      </div>

      {/* List */}
      <div style={{
        overflowY: 'auto', flex: 1,
        padding: '6px 0',
        scrollbarWidth: 'thin',
        scrollbarColor: `${scrollTrack} transparent`,
      }}>
        {people.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 14px',
              borderBottom: i < people.length - 1 ? `1px solid ${divider}` : 'none',
            }}
          >
            {/* Avatar + mood */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar name={p.name} photoUrl={staffPhotos?.[p.id]} size={34}/>
              {p.mood && (
                <div style={{
                  position: 'absolute', bottom: -4, right: -4,
                  fontSize: 12, lineHeight: 1,
                  background: night ? 'rgba(13,10,35,0.9)' : 'rgba(255,255,255,0.95)',
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}>
                  {p.mood}
                </div>
              )}
            </div>

            {/* Name + status chips */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: nameC, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <StatusChip statusId={p.am} />
                {(p.am !== p.pm) && <StatusChip statusId={p.pm} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
