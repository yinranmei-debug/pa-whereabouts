import React, { useEffect, useRef } from 'react';

export default function ApacHolidayPanel({ open, onClose, jpHolidays, krHolidays, isDayMode }) {
  const panelRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

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
  const bg      = night ? 'rgba(13,10,35,0.97)'   : 'rgba(255,255,255,0.98)';
  const border  = night ? 'rgba(167,139,250,0.18)' : 'rgba(0,155,255,0.13)';
  const shadow  = night
    ? '0 20px 56px rgba(0,0,0,0.55), 0 4px 16px rgba(119,11,255,0.15)'
    : '0 16px 40px rgba(0,155,255,0.1), 0 4px 12px rgba(0,0,0,0.08)';
  const titleC  = night ? 'rgba(167,139,250,0.7)'  : 'rgba(0,100,200,0.55)';
  const nameC   = night ? 'rgba(232,229,255,0.9)'  : '#1A1830';
  const subC    = night ? 'rgba(232,229,255,0.38)' : 'rgba(26,24,48,0.38)';
  const divider = night ? 'rgba(167,139,250,0.09)' : 'rgba(0,155,255,0.07)';
  const pastC   = night ? 'rgba(232,229,255,0.28)' : 'rgba(26,24,48,0.28)';
  const rowAlt  = night ? 'rgba(255,255,255,0.02)' : 'rgba(0,155,255,0.02)';
  const todayHl = night ? 'rgba(167,139,250,0.12)' : 'rgba(0,155,255,0.07)';

  const fmtDate = ds => {
    const d = new Date(ds + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtWeekday = ds => new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div
      ref={panelRef}
      style={{
        position:'fixed', top:136, right:24,
        width:300, maxHeight:460, zIndex:12000,
        background:bg, border:`1px solid ${border}`,
        borderRadius:18, boxShadow:shadow,
        backdropFilter:'blur(20px)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
        animation:'teamTodayIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Header */}
      <div style={{ padding:'12px 14px 10px', flexShrink:0, borderBottom:`1px solid ${divider}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', color:titleC, textTransform:'uppercase' }}>APAC Holidays</div>
          <div style={{ fontSize:11, color:subC, fontWeight:500, marginTop:1 }}>🇯🇵 Japan · 🇰🇷 Korea · {currentYear}</div>
        </div>
        <button onClick={onClose}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 6px', fontSize:14, color:subC, borderRadius:6, lineHeight:1, transition:'color 0.15s' }}
          onMouseOver={e => e.currentTarget.style.color = night ? '#fff' : '#1A1830'}
          onMouseOut={e  => e.currentTarget.style.color = subC}
        >✕</button>
      </div>

      {/* Holiday list */}
      <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:`${divider} transparent` }}>
        {allHolidays.length === 0 && (
          <div style={{ padding:'20px 14px', fontSize:12, color:subC, textAlign:'center' }}>No holiday data loaded yet.</div>
        )}
        {allHolidays.map((h, i) => {
          const isPast = h.date < today;
          const isToday = h.date === today;
          const jpColor  = night ? 'rgba(255,120,130,0.9)'  : 'rgba(190,30,50,0.85)';
          const krColor  = night ? 'rgba(100,160,255,0.9)'  : 'rgba(20,80,200,0.85)';
          const jpBg     = night ? 'rgba(190,0,30,0.15)'    : 'rgba(190,0,30,0.08)';
          const krBg     = night ? 'rgba(0,50,160,0.15)'    : 'rgba(0,50,160,0.08)';
          const jpBorder = 'rgba(200,40,60,0.4)';
          const krBorder = 'rgba(30,100,220,0.4)';
          return (
            <div key={`${h.date}-${h.country}`} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 14px',
              background: isToday ? todayHl : i % 2 === 0 ? rowAlt : 'transparent',
              borderBottom:`1px solid ${divider}`,
              opacity: isPast ? 0.45 : 1,
            }}>
              {/* Country badge */}
              <div style={{
                flexShrink:0, fontSize:9, fontWeight:800, padding:'2px 5px',
                borderRadius:4, letterSpacing:'0.04em',
                background: h.country === 'JP' ? jpBg : krBg,
                border:`1px solid ${h.country === 'JP' ? jpBorder : krBorder}`,
                color: h.country === 'JP' ? jpColor : krColor,
              }}>
                {h.country === 'JP' ? '🇯🇵 JP' : '🇰🇷 KR'}
              </div>

              {/* Name + date */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color: isPast ? pastC : nameC, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {h.name}
                </div>
                <div style={{ fontSize:9, color:subC, fontWeight:500, marginTop:2 }}>
                  {fmtWeekday(h.date)}, {fmtDate(h.date)}
                </div>
              </div>

              {/* Today indicator */}
              {isToday && <div style={{ flexShrink:0, fontSize:8, fontWeight:800, color:'#009bff', letterSpacing:'0.06em' }}>TODAY</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
