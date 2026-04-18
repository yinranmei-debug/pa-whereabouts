const NAV_H  = 56;
const SUB_H  = 48;
const TB_H   = 52;
const LG_H   = 36;
const ROW_H  = 104;
const HEADER_STICKY_TOP = NAV_H + SUB_H + TB_H + LG_H;
import React from 'react';

const TEAMS_COLORS = ['#B3CEE0','#D1A7C8','#A7C8A0','#E0C8A7','#A7B9E0','#E0A7A7','#C8D1A7','#A7D1CE','#D1C8A7','#B9A7E0','#A7C8D1','#E0B9A7'];

const teamsColor = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TEAMS_COLORS[Math.abs(h) % TEAMS_COLORS.length];
};

const initials = name => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name[0].toUpperCase();
};

function Avatar({ name, photoUrl, size=34, isMe=false }) {
  if (!name) return null;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.36, fontFamily:"'Segoe UI',sans-serif", fontWeight:600,
      letterSpacing:'0.02em', background:photoUrl?'transparent':teamsColor(name),
      color:'#fff', userSelect:'none',
      ...(isMe?{boxShadow:'0 0 0 2px #fff,0 0 0 4px #770bff'}:{}),
    }}>
      {photoUrl
        ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : initials(name)
      }
    </div>
  );
}

export default Avatar;