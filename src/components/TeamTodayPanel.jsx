import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';

export default function TeamTodayPanel({ open, onClose, staffList, records, STATUS_CONFIG, emotions, staffPhotos, isDayMode }) {
  const panelRef = useRef();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => { if (open) setExpanded({}); }, [open]);

  if (!open) return null;

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  const day = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });

  const people = staffList.map(s => ({
    ...s,
    am:   records[`${s.id}-${today}-AM`] || null,
    pm:   records[`${s.id}-${today}-PM`] || null,
    mood: emotions?.[s.id] || null,
  }));

  // Only show people with at least one status set
  const withStatus = people.filter(p => p.am || p.pm);

  // Group by primary status (AM takes priority)
  const groupMap = {};
  withStatus.forEach(p => {
    const key = p.am || p.pm;
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(p);
  });

  const groups = Object.entries(groupMap).sort((a, b) => b[1].length - a[1].length);

  const toggle = key => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Theme tokens
  const night   = !isDayMode;
  const bg      = night ? 'rgba(13,10,35,0.97)'    : 'rgba(255,255,255,0.98)';
  const border  = night ? 'rgba(167,139,250,0.18)'  : 'rgba(0,155,255,0.13)';
  const shadow  = night
    ? '0 20px 56px rgba(0,0,0,0.55), 0 4px 16px rgba(119,11,255,0.15)'
    : '0 16px 40px rgba(0,155,255,0.1), 0 4px 12px rgba(0,0,0,0.08)';
  const titleC  = night ? 'rgba(167,139,250,0.7)'   : 'rgba(0,100,200,0.55)';
  const nameC   = night ? 'rgba(232,229,255,0.9)'   : '#1A1830';
  const subC    = night ? 'rgba(232,229,255,0.38)'  : 'rgba(26,24,48,0.38)';
  const divider = night ? 'rgba(167,139,250,0.09)'  : 'rgba(0,155,255,0.07)';
  const hdrHov  = night ? 'rgba(167,139,250,0.13)'  : 'rgba(0,155,255,0.08)';
  const badgeBg = night ? 'rgba(167,139,250,0.18)'  : 'rgba(0,155,255,0.1)';
  const badgeC  = night ? 'rgba(196,181,253,0.9)'   : '#009bff';
  const rowAlt  = night ? 'rgba(255,255,255,0.02)'  : 'rgba(0,155,255,0.02)';

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
      <style>{`@keyframes teamTodayIn{from{opacity:0;transform:translateY(-8px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}`}</style>

      {/* Header */}
      <div style={{ padding:'12px 14px 10px', flexShrink:0, borderBottom:`1px solid ${divider}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', color:titleC, textTransform:'uppercase' }}>Team Today</div>
          <div style={{ fontSize:11, color:subC, fontWeight:500, marginTop:1 }}>{day}</div>
        </div>
        <button onClick={onClose}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 6px', fontSize:14, color:subC, borderRadius:6, lineHeight:1, transition:'color 0.15s' }}
          onMouseOver={e => e.currentTarget.style.color = night ? '#fff' : '#1A1830'}
          onMouseOut={e  => e.currentTarget.style.color = subC}
        >✕</button>
      </div>

      {/* Groups — rendered inline to avoid component-remount expand bug */}
      <div style={{ overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:`${divider} transparent` }}>
        {groups.length === 0 && (
          <div style={{ padding:'20px 14px', fontSize:12, color:subC, textAlign:'center' }}>
            No statuses set for today yet.
          </div>
        )}

        {groups.map(([gkey, members]) => {
          const cfg    = STATUS_CONFIG[gkey];
          const icon   = cfg?.icon ?? '•';
          const label  = cfg?.label ?? gkey;
          const isOpen = !!expanded[gkey];

          return (
            <div key={gkey}>
              {/* Group header row */}
              <div
                role="button"
                onClick={() => toggle(gkey)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'9px 14px', cursor:'pointer',
                  borderBottom:`1px solid ${divider}`,
                  background: isOpen ? hdrHov : 'transparent',
                  transition:'background 0.15s', userSelect:'none',
                }}
                onMouseOver={e => e.currentTarget.style.background = hdrHov}
                onMouseOut={e  => e.currentTarget.style.background = isOpen ? hdrHov : 'transparent'}
              >
                <span style={{ fontSize:15 }}>{icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:nameC, flex:1 }}>{label}</span>
                <span style={{ fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:20, background:badgeBg, color:badgeC, minWidth:20, textAlign:'center' }}>
                  {members.length}
                </span>
                <span style={{ fontSize:9, color:subC, marginLeft:4 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Expanded member list */}
              {isOpen && members.map((p, i) => {
                const amCfg = p.am ? STATUS_CONFIG[p.am] : null;
                const pmCfg = p.pm ? STATUS_CONFIG[p.pm] : null;
                return (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'7px 14px 7px 34px',
                    background: i % 2 === 0 ? rowAlt : 'transparent',
                    borderBottom: i < members.length - 1 ? `1px solid ${divider}` : 'none',
                  }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <Avatar name={p.name} photoUrl={staffPhotos?.[p.id]} size={30}/>
                      {p.mood && (
                        <div style={{
                          position:'absolute', bottom:-3, right:-3,
                          fontSize:10, lineHeight:1,
                          background: night ? 'rgba(13,10,35,0.92)' : 'rgba(255,255,255,0.95)',
                          borderRadius:'50%', width:16, height:16,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          border:`1px solid ${border}`,
                        }}>{p.mood}</div>
                      )}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:nameC, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:9, color:subC, fontWeight:700 }}>AM</span>
                        {amCfg
                          ? <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, background:amCfg.bg, border:`1px solid ${amCfg.border}`, color:amCfg.color, whiteSpace:'nowrap' }}>{amCfg.icon} {amCfg.label}</span>
                          : <span style={{ fontSize:9, color:subC }}>—</span>
                        }
                        <span style={{ fontSize:9, color:subC, fontWeight:700, marginLeft:2 }}>PM</span>
                        {pmCfg
                          ? <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, background:pmCfg.bg, border:`1px solid ${pmCfg.border}`, color:pmCfg.color, whiteSpace:'nowrap' }}>{pmCfg.icon} {pmCfg.label}</span>
                          : <span style={{ fontSize:9, color:subC }}>—</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
