import React from 'react';

export default function ApacHolidayPanel({ open, onClose, jpHolidays, krHolidays, cnHolidays = {}, cnTiaoxiu = {}, isDayMode, onDateClick }) {
  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();

  const allHolidays = [
    ...Object.entries(jpHolidays).map(([date, name]) => ({ date, name, country: 'JP' })),
    ...Object.entries(krHolidays).map(([date, name]) => ({ date, name, country: 'KR' })),
    ...Object.entries(cnHolidays).map(([date, name]) => ({ date, name, country: 'CN' })),
    ...Object.entries(cnTiaoxiu).map(([date, name]) => ({ date, name, country: 'TX' })),
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

  const countryStyle = (country) => {
    const styles = {
      JP: {
        color:  night ? 'rgba(255,120,130,0.9)' : 'rgba(190,30,50,0.85)',
        bg:     night ? 'rgba(190,0,30,0.14)'   : 'rgba(190,0,30,0.07)',
        border: 'rgba(200,40,60,0.35)',
        label:  '🇯🇵 JP',
      },
      KR: {
        color:  night ? 'rgba(100,160,255,0.9)' : 'rgba(20,80,200,0.85)',
        bg:     night ? 'rgba(0,50,160,0.14)'   : 'rgba(0,50,160,0.07)',
        border: 'rgba(30,100,220,0.35)',
        label:  '🇰🇷 KR',
      },
      CN: {
        color:  night ? 'rgba(255,190,60,0.95)' : 'rgba(180,50,20,0.9)',
        bg:     night ? 'rgba(200,40,20,0.14)'  : 'rgba(200,40,20,0.07)',
        border: 'rgba(220,50,20,0.35)',
        label:  '🇨🇳 CN',
      },
      TX: {
        color:  night ? 'rgba(200,200,200,0.7)' : 'rgba(80,80,100,0.65)',
        bg:     night ? 'rgba(180,180,180,0.08)': 'rgba(80,80,100,0.06)',
        border: 'rgba(150,150,160,0.25)',
        label:  '🔄 补班',
      },
    };
    return styles[country] || styles.JP;
  };

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
            🇯🇵 Japan · 🇰🇷 Korea · 🇨🇳 China · {currentYear}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
          const cs = countryStyle(h.country);
          const isTiaoxiu = h.country === 'TX';
          return (
            <div key={`${h.date}-${h.country}`}
              onClick={() => !isTiaoxiu && onDateClick && onDateClick(h.date)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 13px', cursor: isTiaoxiu ? 'default' : 'pointer',
                background: isToday ? todayHl : i % 2 === 0 ? rowAlt : 'transparent',
                borderBottom: `1px solid ${divider}`,
                opacity: isPast ? 0.42 : 1,
                transition: 'background 0.12s',
              }}
              onMouseOver={e => { if (!isTiaoxiu) e.currentTarget.style.background = night ? 'rgba(106,199,255,0.07)' : 'rgba(0,155,255,0.05)'; }}
              onMouseOut={e => e.currentTarget.style.background = isToday ? todayHl : i % 2 === 0 ? rowAlt : 'transparent'}
            >
              <div style={{
                flexShrink: 0, fontSize: 9, fontWeight: 800, padding: '2px 5px',
                borderRadius: 4, letterSpacing: '0.04em',
                background: cs.bg,
                border: `1px solid ${cs.border}`,
                color: cs.color,
              }}>
                {cs.label}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isPast ? pastC : isTiaoxiu ? subC : nameC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.name}
                </div>
                <div style={{ fontSize: 9, color: subC, fontWeight: 500, marginTop: 1 }}>
                  {fmtWeekday(h.date)}, {fmtDate(h.date)}
                </div>
              </div>
              {isToday
                ? <div style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: titleC, letterSpacing: '0.06em' }}>TODAY</div>
                : isTiaoxiu
                  ? <div style={{ flexShrink: 0, fontSize: 9, color: subC, opacity: 0.5 }}>补班</div>
                  : <div style={{ flexShrink: 0, fontSize: 10, color: subC, opacity: 0.5 }}>›</div>
              }
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '7px 13px', borderTop: `1px solid ${divider}`,
        fontSize: 9, color: subC, textAlign: 'center', flexShrink: 0,
      }}>
        🔄 补班 = makeup workday (调休) · Flags shown in calendar
      </div>
    </div>
  );
}
