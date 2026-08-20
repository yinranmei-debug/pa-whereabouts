import React from 'react';
import { VALUES_WEEK_DAYS, VALUES_WEEK_INTRO, getValuesWeekDay } from '../data/valuesWeek2026';

const cardStyle = {
  borderRadius: 14,
  background: 'linear-gradient(135deg,rgba(255,183,0,0.1),rgba(167,139,250,0.12))',
  border: '1px solid rgba(255,183,0,0.28)',
  padding: '14px 14px 12px',
  marginBottom: 10,
};

const dayHeaderStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: '#fff',
  marginBottom: 10,
  lineHeight: 1.35,
};

const slotLabelStyle = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.12em',
  color: 'rgba(255,225,74,0.78)',
  marginBottom: 6,
  marginTop: 2,
};

const itemStyle = {
  fontSize: 12,
  color: 'rgba(232,229,255,0.72)',
  lineHeight: 1.55,
  marginBottom: 6,
  paddingLeft: 2,
};

function DayBlock({ day }) {
  return (
    <div style={cardStyle}>
      <div style={dayHeaderStyle}>
        📅 {day.label} — {day.theme}
      </div>
      {day.sessions.map((session, si) => (
        <div key={`${day.date}-${session.slot}`} style={{ marginBottom: si < day.sessions.length - 1 ? 10 : 0 }}>
          <div style={slotLabelStyle}>{session.slot.toUpperCase()}</div>
          {session.items.map((item, i) => (
            <div key={i} style={itemStyle}>{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full schedule or a single day when `date` is set (YYYY-MM-DD). */
export default function ValuesWeekSchedule({ date = null, compact = false }) {
  const days = date ? [getValuesWeekDay(date)].filter(Boolean) : VALUES_WEEK_DAYS;
  if (days.length === 0) return null;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {!date && (
        <div style={{ marginBottom: compact ? 10 : 12 }}>
          <div style={{ fontSize: compact ? 14 : 15, fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.35 }}>
            {VALUES_WEEK_INTRO.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(232,229,255,0.52)', lineHeight: 1.5 }}>
            {VALUES_WEEK_INTRO.disclaimer}
          </div>
        </div>
      )}
      {days.map(day => (
        <DayBlock key={day.date} day={day} />
      ))}
    </div>
  );
}
