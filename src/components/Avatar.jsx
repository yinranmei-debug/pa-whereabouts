import React from 'react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6AC7FF,#009BFF)',
  'linear-gradient(135deg,#A78BFA,#770BFF)',
  'linear-gradient(135deg,#FF8FB0,#E63946)',
  'linear-gradient(135deg,#7AFFD4,#10B981)',
  'linear-gradient(135deg,#FFE14A,#FF9A3C)',
  'linear-gradient(135deg,#6AC7FF,#A78BFA)',
  'linear-gradient(135deg,#00E5A8,#009BFF)',
  'linear-gradient(135deg,#FF8FB0,#770BFF)',
];

const avatarGradient = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
};

const initials = name => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name[0].toUpperCase();
};

function Avatar({ name, photoUrl, size=34, isMe=false }) {
  if (!name) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.33,
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      fontWeight: 800,
      letterSpacing: '0.02em',
      background: photoUrl ? 'transparent' : avatarGradient(name),
      color: '#fff', userSelect: 'none',
      boxShadow: photoUrl ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.25)',
      ...(isMe ? { outline: '2px solid rgba(167,139,250,0.7)', outlineOffset: '2px' } : {}),
    }}>
      {photoUrl
        ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : initials(name)
      }
    </div>
  );
}

export default Avatar;