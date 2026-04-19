import React, { useRef, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useDimensionalBreach } from './hooks/useDimensionalBreach';
import DimensionalBreachOverlay from './components/DimensionalBreachOverlay';

const supabase = createClient(
  'https://vzdrpydtxlamoqtukgld.supabase.co',
  'sb_publishable_o1d0wmxwLrJCuTQ84uY38g__dqoj2dD'
);

// Mock users — add yourself here
const MOCK_USERS = [
  { id: 'may',   name: 'May (You)',    color: '#770bff' },
  { id: 'guest', name: 'Guest User',   color: '#009bff' },
];

const TEST_PILLS = [
  { key: 'easter-holiday',   label: '🐣 Easter',   type: 'holiday' },
  { key: 'weekend-2026-04',  label: '🏝️ Weekend',  type: 'weekend' },
];

export default function TestDimensional() {
  const [activeUser, setActiveUser] = useState(MOCK_USERS[0]);
  const [log,        setLog]        = useState([]);
  const presenceRef = useRef(null);
  const { activeBreach, registerClick } = useDimensionalBreach();

  const addLog = msg => setLog(l => [`${new Date().toLocaleTimeString()} — ${msg}`, ...l.slice(0, 19)]);

  // setup supabase broadcast channel
  useEffect(() => {
    const channel = supabase.channel('test-dimensional', {
      config: { presence: { key: activeUser.id } },
    });
    channel
      .on('broadcast', { event: 'pill-click' }, ({ payload }) => {
        addLog(`📡 received pill-click from ${payload.userId} on ${payload.key}`);
        registerClick(payload.key, payload.userId, null);
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') addLog(`✅ connected as ${activeUser.name}`);
      });
    presenceRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [activeUser.id]);

  const handlePillClick = (pill) => {
    addLog(`👆 ${activeUser.name} clicked ${pill.label}`);
    registerClick(pill.key, activeUser.id, null);
    presenceRef.current?.send({
      type: 'broadcast',
      event: 'pill-click',
      payload: { key: pill.key, userId: activeUser.id },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#fff',
      padding: 32,
    }}>
      <DimensionalBreachOverlay breach={activeBreach}/>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          🧪 Dimensional Breach — Test Page
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
          Open this page in two browser tabs. Pick different users. Click same pill rapidly.
        </p>

        {/* user picker */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>
            YOU ARE
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {MOCK_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => setActiveUser(u)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  border: `2px solid ${activeUser.id === u.id ? u.color : 'rgba(255,255,255,0.1)'}`,
                  background: activeUser.id === u.id ? `${u.color}22` : 'transparent',
                  color: activeUser.id === u.id ? u.color : 'rgba(255,255,255,0.5)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >{u.name}</button>
            ))}
          </div>
        </div>

        {/* pills */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>
            CLICK A PILL
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {TEST_PILLS.map(pill => (
              <button
                key={pill.key}
                onClick={() => handlePillClick(pill)}
                style={{
                  flex: 1, height: 80, borderRadius: 16,
                  border: '2px solid rgba(255,255,255,0.1)',
                  background: pill.type === 'holiday'
                    ? 'linear-gradient(180deg,#fdf2f8,#fce7f3)'
                    : 'linear-gradient(180deg,#eff6ff,#dbeafe)',
                  color: pill.type === 'holiday' ? '#be185d' : '#2563eb',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >{pill.label}</button>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            Single user: slow charge (+1.2/click, decays 8s). Two users: fast charge (+2.4/click). Need 100 to breach.
          </div>
        </div>

        {/* progress display */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>
            BREACH STATUS
          </div>
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 13, color: activeBreach ? '#a78bfa' : 'rgba(255,255,255,0.3)',
            fontWeight: activeBreach ? 700 : 400,
          }}>
            {activeBreach ? `🚀 BREACH ACTIVE — phase: ${activeBreach.phase}` : '· idle ·'}
          </div>
        </div>

        {/* log */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 10 }}>
            EVENT LOG
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 12,
            maxHeight: 200, overflowY: 'auto',
          }}>
            {log.length === 0 && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>no events yet</div>}
            {log.map((l, i) => (
              <div key={i} style={{ fontSize: 11, color: i === 0 ? '#a78bfa' : 'rgba(255,255,255,0.35)', marginBottom: 4, fontFamily: 'monospace' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}