import React from 'react';

export default function ApacHolidayPanel({ open, onClose, jpHolidays, krHolidays, isDayMode }) {
  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();

  const allHolidays = [
    ...Object.entries(jpHolidays).map(([date, name]) => ({ date, name, country: 'JP' })),
    ...Object.entries(krHolidays).map(([date, name]) => ({ date, name, country: 'KR' })),
  ]
    .filter(h => h.date.slice(0, 4) === String(currentYear) || h.date.slice(0, 4) === String(currentYear + 1))
    .sort((a, b) => a.date.localeCompare(b.date));

  const night = !isDayMode;
  const bg      = night ? 'rgba(10,8,30,0.98)'    : 'rgba(255,255,255,0.99)';
  const border  = night ? 'rgba(106,199,255,0.2)'  : 'rgba(0,155,255,0.15)';
  const shadow  = night
    ? '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(0,155,255,0.12)'
    : '0 16px 40px rgba(0,155,255,0.1), 0 4px 12px rgba(0,0,0,0.08)';
  const titleC  = night ? 'rgba(106,199,255,0.75)'  : 'rgba(0,100,200,0.6)';
  const nameC   = night ? 'rgba(232,229,255,0.92)'  : '#1A1830';
  const subC    = night ? 'rgba(232,229,255,0.38)'  : 'rgba(26,24,48,0.38)';
  const divider = night ? 'rgba(106,199,255,0.08)'  : 'rgba(0,155,255,0.07)';
  const pastC   = night ? 'rgba(232,229,255,0.28)'  : 'rgba(26,24,48,0.28)';
  const rowAlt  = night ? 'rgba(106,199,255,0.02)'  : 'rgba(0,155,255,0.02)';
  const todayHl = night ? 'rgba(106,199,255,0.1)'   : 'rgba(0,155,255,0.07)';

  const fmtDate = ds => {
    const d = new Date(ds + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtWeekday = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div
      style={{
        position: 'fixed', top: 136, right: 24,
        width: 290, maxHeight: 460, zIndex: 12000,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 14, boxShadow: shadow,
        backdropFilter: 'blur(24px)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'teamTodayIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 13px 8px', flexShrink: 0,
        borderBottom: `1px solid ${divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: titleC, textTransform: 'uppercase' }}>
            APAC Holidays
          </div>
          <div style={{ fontSize: 10, color: subC, fontWeight: 500, marginTop: 1 }}>
            🇯🇵 Japan · 🇰🇷 Korea · {currentYear}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* active indicator */}
          <div style={{
            fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
            color: titleC, background: night ? 'rgba(106,199,255,0.12)' : 'rgba(0,155,255,0.08)',
            border: `1px solid ${border}`, borderRadius: 4, padding: '2px 6px',
          }}>ON</div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontSize: 13, color: subC, borderRadius: 6, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseOver={e => e.currentTarget.style.color = night ? '#fff' : '#1A1830'}
            onMouseOut={e => e.currentTarget.style.color = subC}
            title="Turn off APAC view"
          >✕</button>
        </div>
      </div>

      {/* Holiday list */}
      <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: `${divider} transparent` }}>
        {allHolidays.length === 0 && (
          <div style={{ padding: '20px 13px', fontSize: 11, color: subC, textAlign: 'center' }}>
            No holiday data loaded yet.
          </div>
        )}
        {allHolidays.map((h, i) => {
          const isPast = h.date < today;
          const isToday = h.date === today;
          const jpColor  = night ? 'rgba(255,120,130,0.9)'  : 'rgba(190,30,50,0.85)';
          const krColor  = night ? 'rgba(100,160,255,0.9)'  : 'rgba(20,80,200,0.85)';
          const jpBg     = night ? 'rgba(190,0,30,0.14)'    : 'rgba(190,0,30,0.07)';
          const krBg     = night ? 'rgba(0,50,160,0.14)'    : 'rgba(0,50,160,0.07)';
          return (
            <div key={`${h.date}-${h.country}`} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 13px',
              background: isToday ? todayHl : i % 2 === 0 ? rowAlt : 'transparent',
              borderBottom: `1px solid ${divider}`,
              opacity: isPast ? 0.42 : 1,
            }}>
              <div style={{
                flexShrink: 0, fontSize: 9, fontWeight: 800, padding: '2px 5px',
                borderRadius: 4, letterSpacing: '0.04em',
                background: h.country === 'JP' ? jpBg : krBg,
                border: `1px solid ${h.country === 'JP' ? 'rgba(200,40,60,0.35)' : 'rgba(30,100,220,0.35)'}`,
                color: h.country === 'JP' ? jpColor : krColor,
              }}>
                {h.country === 'JP' ? '🇯🇵 JP' : '🇰🇷 KR'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isPast ? pastC : nameC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.name}
                </div>
                <div style={{ fontSize: 9, color: subC, fontWeight: 500, marginTop: 1 }}>
                  {fmtWeekday(h.date)}, {fmtDate(h.date)}
                </div>
              </div>
              {isToday && (
                <div style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: titleC, letterSpacing: '0.06em' }}>
                  TODAY
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '7px 13px', borderTop: `1px solid ${divider}`,
        fontSize: 9, color: subC, textAlign: 'center', flexShrink: 0,
      }}>
        Flags shown in calendar · Birthday cakes hidden while ON
      </div>
    </div>
  );
}
