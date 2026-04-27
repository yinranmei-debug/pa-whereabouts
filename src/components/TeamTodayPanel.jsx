import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';

export default function TeamTodayPanel({ open, onClose, staffList, records, STATUS_CONFIG, emotions, staffPhotos, isDayMode }) {
  const panelRef   = useRef();
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // reset expansion when panel opens
  useEffect(() => { if (open) setExpanded({}); }, [open]);

  if (!open) return null;

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Build person list with today's statuses
  const people = staffList.map(s => ({
    ...s,
    am: records[`${s.id}-${today}-AM`] || null,
    pm: records[`${s.id}-${today}-PM`] || null,
    mood: emotions?.[s.id] || null,
  }));

  // Group by primary status (AM first, then PM, then "office")
  const groups = {};
  people.forEach(p => {
    const key = p.am || p.pm || '__office__';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  // Build ordered group list: office first, then by count desc
  const officeGroup = groups['__office__'] || [];
  const statusGroups = Object.entries(groups)
    .filter(([k]) => k !== '__office__')
    .sort((a, b) => b[1].length - a[1].length);

  const orderedGroups = [
    ...(officeGroup.length ? [['__office__', officeGroup]] : []),
    ...statusGroups,
  ];

  const toggle = key => setExpanded(e => ({ ...e, [key]: !e[key] }));

  // Theme tokens
  const night   = !isDayMode;
  const bg      = night ? 'rgba(13,10,35,0.97)'   : 'rgba(255,255,255,0.98)';
  const border  = night ? 'rgba(167,139,250,0.18)' : 'rgba(0,155,255,0.13)';
  const shadow  = night
    ? '0 20px 56px rgba(0,0,0,0.55), 0 4px 16px rgba(119,11,255,0.15)'
    : '0 16px 40px rgba(0,155,255,0.1), 0 4px 12px rgba(0,0,0,0.08)';
  const titleC  = night ? 'rgba(167,139,250,0.7)'  : 'rgba(0,100,200,0.55)';
  const nameC   = night ? 'rgba(232,229,255,0.9)'  : '#1A1830';
  const subC    = night ? 'rgba(232,229,255,0.38)' : 'rgba(26,24,48,0.38)';
  const divider = night ? 'rgba(167,139,250,0.09)' : 'rgba(0,155,255,0.07)';
  const hdrBg   = night ? 'rgba(167,139,250,0.07)' : 'rgba(0,155,255,0.05)';
  const hdrHov  = night ? 'rgba(167,139,250,0.13)' : 'rgba(0,155,255,0.1)';
  const badgeBg = night ? 'rgba(167,139,250,0.18)' : 'rgba(0,155,255,0.1)';
  const badgeC  = night ? 'rgba(196,181,253,0.9)'  : '#009bff';

  const Chip = ({ statusId }) => {
    if (!statusId) return null;
    const cfg = STATUS_CONFIG[statusId];
    if (!cfg) return null;
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:3,
        fontSize:9, fontWeight:700, padding:'2px 5px', borderRadius:5,
        background: cfg.bg, border:`1px solid ${cfg.border}`,
        color: cfg.color, whiteSpace:'nowrap', letterSpacing:'0.02em',
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const GroupHeader = ({ gkey, members }) => {
    const isOffice  = gkey === '__office__';
    const cfg       = isOffice ? null : STATUS_CONFIG[gkey];
    const icon      = isOffice ? '🏢' : cfg?.icon ?? '•';
    const label     = isOffice ? 'In Office' : cfg?.label ?? gkey;
    const isOpen    = !!expanded[gkey];

    return (
      <div>
        <button
          onClick={() => toggle(gkey)}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:8,
            padding:'8px 14px', background: isOpen ? hdrHov : 'transparent',
            border:'none', cursor:'pointer', transition:'background 0.15s',
            borderBottom: `1px solid ${divider}`,
          }}
          onMouseOver={e => e.currentTarget.style.background = hdrHov}
          onMouseOut={e => e.currentTarget.style.background = isOpen ? hdrHov : 'transparent'}
        >
          <span style={{fontSize:14}}>{icon}</span>
          <span style={{fontSize:11, fontWeight:700, color:nameC, flex:1, textAlign:'left'}}>{label}</span>
          <span style={{
            fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:20,
            background: badgeBg, color: badgeC, minWidth:20, textAlign:'center',
          }}>{members.length}</span>
          <span style={{fontSize:10, color:subC, marginLeft:2}}>{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div style={{borderBottom:`1px solid ${divider}`}}>
            {members.map((p, i) => (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'6px 14px 6px 36px',
                background: i % 2 === 0
                  ? (night ? 'rgba(255,255,255,0.02)' : 'rgba(0,155,255,0.02)')
                  : 'transparent',
              }}>
                <div style={{position:'relative', flexShrink:0}}>
                  <Avatar name={p.name} photoUrl={staffPhotos?.[p.id]} size={28}/>
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
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:11, fontWeight:700, color:nameC, marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {p.name}
                  </div>
                  <div style={{display:'flex', gap:3, flexWrap:'wrap', alignItems:'center'}}>
                    <span style={{fontSize:9, color:subC, fontWeight:600, minWidth:18}}>AM</span>
                    {p.am ? <Chip statusId={p.am}/> : <span style={{fontSize:9, color:subC}}>—</span>}
                    <span style={{fontSize:9, color:subC, fontWeight:600, minWidth:18, marginLeft:4}}>PM</span>
                    {p.pm ? <Chip statusId={p.pm}/> : <span style={{fontSize:9, color:subC}}>—</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={panelRef}
      style={{
        position:'fixed', top:90, right:24,
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
      <div style={{
        padding:'12px 14px 10px', flexShrink:0,
        borderBottom:`1px solid ${divider}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{fontSize:10, fontWeight:800, letterSpacing:'0.14em', color:titleC, textTransform:'uppercase'}}>Team Today</div>
          <div style={{fontSize:11, color:subC, fontWeight:500, marginTop:1}}>{day}</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',fontSize:14,color:subC,borderRadius:6,lineHeight:1,transition:'color 0.15s'}}
          onMouseOver={e=>e.currentTarget.style.color=night?'#fff':'#1A1830'}
          onMouseOut={e=>e.currentTarget.style.color=subC}
        >✕</button>
      </div>

      {/* Groups */}
      <div style={{overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:`${divider} transparent`}}>
        {orderedGroups.map(([gkey, members]) => (
          <GroupHeader key={gkey} gkey={gkey} members={members}/>
        ))}
      </div>
    </div>
  );
}
