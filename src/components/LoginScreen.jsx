import React, { useState, useEffect, useRef } from 'react';

// Mocking config for demo purposes
const RAW_STAFF_LIST = [
  { id: 'ricardo', name: 'Ricardo Liang', email: 'ricardo.liang@patternasia.com', region: 'Hong Kong' },
  { id: 'shannon', name: 'Shannon Chan', email: 'shannon.chan@patternasia.com', region: 'Hong Kong' },
  { id: 'vicky', name: 'Vicky Lam', email: 'vicky.lam@patternasia.com', region: 'Hong Kong' },
  { id: 'grace', name: 'Grace Wong', email: 'grace.wong@patternasia.com', region: 'Hong Kong' },
  { id: 'jean', name: 'Jean Zhu', email: 'jean.zhu@patternasia.com', region: 'China' },
  { id: 'yinran', name: 'Yinran Mei', email: 'yinran.mei@patternasia.com', region: 'Hong Kong' },
];

const STATUS_CONFIG = {
  'none': { label: 'None', icon: '', bg: 'transparent', color: '#94a3b8' },
  'office': { label: 'In Office', icon: '🏢', bg: 'rgba(240, 253, 244, 0.9)', color: '#16a34a' },
  'wfh': { label: 'WFH', icon: '🏠', bg: 'rgba(239, 246, 255, 0.9)', color: '#2563eb' },
  'leave': { label: 'Leave', icon: '🌴', bg: 'rgba(255, 241, 242, 0.9)', color: '#e11d48' },
};

const ROW_H = 104;

function Avatar({ name, photoUrl, size = 34, isMe = false }) {
  if (!name) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
      background: photoUrl ? 'transparent' : 'linear-gradient(135deg, #a5b4fc, #818cf8)', color: '#fff',
      ...(isMe ? { boxShadow: '0 0 0 2px #fff, 0 0 0 4px #818cf8' } : {}),
    }}>
      {photoUrl ? <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name[0]}
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    body { 
      margin: 0; 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      background: #f8fafc; 
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }

    /* Cinematic Relaxing Effects */
    @keyframes revealText {
      0% { filter: blur(15px); opacity: 0; transform: translateY(20px); }
      100% { filter: blur(0); opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes cloudFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -20px) scale(1.1); }
    }
    @keyframes glint {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    @keyframes spinSoft {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .slogan-part-1 { opacity: 0; animation: revealText 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; animation-delay: 0.3s; }
    .slogan-part-2 { 
      opacity: 0; 
      animation: revealText 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards, shimmer 6s linear infinite; 
      animation-delay: 0.6s, 2s;
      background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
      background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .slogan-sub { opacity: 0; animation: revealText 1s cubic-bezier(0.23, 1, 0.32, 1) forwards; animation-delay: 1.2s; }

    /* Pearl Glassmorphism (浅色调) */
    .glass-nav { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
    .glass-card { 
      background: rgba(255, 255, 255, 0.7); 
      backdrop-filter: blur(40px); 
      border: 1px solid rgba(255, 255, 255, 0.5); 
      box-shadow: 0 40px 100px -20px rgba(148, 163, 184, 0.15), inset 0 0 0 1px rgba(255,255,255,0.4); 
    }
    .glass-table-wrap { background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(15px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.4); }
    
    .soft-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
      animation: cloudFloat 12s ease-in-out infinite;
      opacity: 0.3;
    }

    /* Fixed 'g' Clipping */
    .slogan-h1 { line-height: 1.4; padding-bottom: 8px; overflow: visible; }
    
    .nw { height: ${ROW_H}px; display: flex; align-items: center; gap: 12px; padding: 0 20px; border-bottom: 1px solid rgba(0,0,0,0.03); }
    .dw { height: ${ROW_H}px; display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0 12px; border-bottom: 1px solid rgba(0,0,0,0.03); }
    .sh { height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .sh:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.05); }

    .btn-login {
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .btn-login::after {
      content: '';
      position: absolute;
      top: 0;
      height: 100%;
      width: 60px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: skewX(-20deg);
      left: -100%;
    }
    .btn-login:hover::after {
      animation: glint 0.8s ease-in-out;
    }
    .btn-login:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 20px 40px rgba(99, 102, 241, 0.25);
    }

    .sonar-today { animation: sonar 2s cubic-bezier(0.24, 0, 0.38, 1) infinite; }
    @keyframes sonar {
      0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
    }

    .spinner-soft {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(99, 102, 241, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spinSoft 0.8s linear infinite;
    }
  `}</style>
);

function LoginScreen({ onLogin, isInitializing, error }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Soft Orbs */}
      <div className="soft-orb w-96 h-96 bg-indigo-200 top-10 left-20" />
      <div className="soft-orb w-80 h-80 bg-purple-200 bottom-10 right-20" style={{ animationDelay: '-4s' }} />

      <div className={`relative z-10 w-full max-w-4xl transition-all duration-1000 ${show ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        
        {/* Smaller Slogan - Fixed 'g' */}
        <div className="mb-8 md:mb-12 slogan-container">
          <h1 className="slogan-h1 text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
            <span className="slogan-part-1 inline-block mr-3">Play the</span>
            <span className="slogan-part-2 inline-block">Long Game.</span>
          </h1>
          <p className="slogan-sub mt-1 text-slate-400 text-base md:text-lg font-medium tracking-tight whitespace-nowrap">
            Sustainable growth through mindful presence.
          </p>
        </div>

        {/* Soft Frosted Card */}
        <div className="glass-card w-full max-w-lg mx-auto rounded-[52px] p-10 md:p-14 flex flex-col items-center">
          <img src="https://i.ibb.co/YTQHg15F/Pattern-Logo.png" alt="Pattern" className="h-10 md:h-12 object-contain opacity-80 mb-8" />
          
          <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight mb-8">Welcome back</h2>
          
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="spinner-soft" />
              <div className="text-sm font-semibold text-slate-500 tracking-wide">Initializing session...</div>
            </div>
          ) : (
            <>
              <button 
                onClick={onLogin} 
                className="btn-login group w-full h-16 bg-slate-900 text-white hover:bg-black rounded-2xl font-bold flex items-center justify-center gap-4 active:scale-[0.96] shadow-xl shadow-slate-200"
              >
                <svg width="20" height="20" viewBox="0 0 21 21" className="group-hover:rotate-90 transition-transform duration-700">
                  <rect x="1" y="1" width="9" height="9" fill="white" />
                  <rect x="11" y="1" width="9" height="9" fill="white" fillOpacity="0.7" />
                  <rect x="1" y="11" width="9" height="9" fill="white" fillOpacity="0.7" />
                  <rect x="11" y="11" width="9" height="9" fill="white" fillOpacity="0.4" />
                </svg>
                Sign in with Microsoft
              </button>
              
              {error && (
                <div className="mt-6 px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-lg animate-[revealText_0.3s_ease]">
                  {error}
                </div>
              )}
            </>
          )}

          <div className="w-full pt-8 mt-10 border-t border-slate-100 flex items-center justify-center text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Whereabouts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [account, setAccount] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState('Hong Kong');
  const [records, setRecords] = useState({});
  const [viewDate] = useState(new Date());

  const login = () => {
    setIsInitializing(true);
    setError(null);
    // Simulate initialization delay
    setTimeout(() => {
      setAccount({ name: "Yinran Mei", username: "yinran.mei@patternasia.com" });
      setIsInitializing(false);
    }, 1500);
  };

  if (!account) return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden relative">
      <GlobalStyles />
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
        <source src="https://hr-support.pattern.com/assets/Pattern_logo_video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 z-[1]" />
      <LoginScreen onLogin={login} isInitializing={isInitializing} error={error} />
    </div>
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const staffList = RAW_STAFF_LIST.filter(s => s.region === region);

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(viewDate);
    const day = d.getDay();
    const mon = new Date(d.setDate(d.getDate() - day + (day === 0 ? -6 : 1)));
    const t = new Date(mon); t.setDate(mon.getDate() + i);
    const ds = t.toISOString().split('T')[0];
    return { ds, num: t.getDate(), dayName: t.toLocaleDateString('en-US', { weekday: 'short' }), isToday: ds === todayStr };
  });

  return (
    <div className="min-h-screen relative bg-[#f1f5f9]">
      <GlobalStyles />
      
      {/* Soft Video Background for App */}
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-20">
        <source src="https://hr-support.pattern.com/assets/Pattern_logo_video.mp4" type="video/mp4" />
      </video>

      <nav className="glass-nav h-[64px] sticky top-0 z-[500] flex items-center px-10 justify-between">
        <div className="flex gap-10">
          <div className="text-sm font-extrabold text-indigo-600 border-b-2 border-indigo-600 pb-1">Calendar</div>
          <div className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">Planner</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-white/80 px-4 py-1.5 rounded-full border border-white text-[11px] font-bold text-slate-500 shadow-sm">17 / 17 in office</div>
          <div className="flex items-center gap-3 bg-white/60 p-1 rounded-full border border-white">
            <span className="text-xs font-bold px-2 text-slate-700">{account.name}</span>
            <Avatar name={account.name} isMe size={32} />
          </div>
          <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors" onClick={() => setAccount(null)}>Sign out</button>
        </div>
      </nav>

      <div className="p-10 max-w-[1500px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Whereabouts</h1>
          <div className="flex bg-slate-200/50 p-1.5 rounded-[20px] backdrop-blur-md border border-white">
            {['Hong Kong', 'China'].map(r => (
              <button key={r} onClick={() => setRegion(r)} className={`px-6 py-2 rounded-[16px] text-xs font-bold transition-all ${region === r ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>{r}</button>
            ))}
          </div>
        </div>

        <div className="glass-table-wrap shadow-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-white/60">
              <tr>
                <th className="w-[240px] h-16"></th>
                {week.map(d => (
                  <th key={d.ds} className="p-4 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{d.dayName}</div>
                    <div className={`mt-1 text-xl font-extrabold w-11 h-11 flex items-center justify-center mx-auto rounded-full transition-all ${d.isToday ? 'bg-indigo-500 text-white sonar-today' : 'text-slate-700'}`}>{d.num}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList.map((m) => (
                <tr key={m.id} className="hover:bg-white/40 transition-colors">
                  <td className="sticky left-0 bg-white/60 backdrop-blur-xl z-10">
                    <div className="nw">
                      <Avatar name={m.name} isMe={m.email === account.username} size={38} />
                      <div className={`text-sm font-bold ${m.email === account.username ? 'text-indigo-600' : 'text-slate-700'}`}>{m.name}</div>
                    </div>
                  </td>
                  {week.map(d => (
                    <td key={d.ds}>
                      <div className="dw">
                        {['AM', 'PM'].map(shift => {
                          const sid = records[`${m.id}-${d.ds}-${shift}`] || 'none';
                          const cfg = STATUS_CONFIG[sid];
                          const isEditable = m.email === account.username;
                          return (
                            <div key={shift} className="sh" style={{ background: sid === 'none' ? 'rgba(0,0,0,0.03)' : cfg.bg, color: cfg.color }} onClick={() => {
                              if (!isEditable) return;
                              const next = sid === 'none' ? 'office' : sid === 'office' ? 'wfh' : sid === 'wfh' ? 'leave' : 'none';
                              setRecords(prev => ({ ...prev, [`${m.id}-${d.ds}-${shift}`]: next }));
                            }}>
                              {cfg.icon} <span className="ml-1">{sid !== 'none' ? cfg.label : shift}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}