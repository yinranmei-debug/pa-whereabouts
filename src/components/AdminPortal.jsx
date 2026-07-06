import { useState, useEffect, useRef } from 'react';

export default function AdminPortal({ supabase, onClose, onStaffChange }) {
  const ref = useRef();
  const [staffExtras, setStaffExtras] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', region: 'Hong Kong', birthday: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    supabase.from('staff_extras').select('*').order('created_at').then(({ data }) => {
      if (data) setStaffExtras(data);
    });
  }, []);

  const handleAdd = async () => {
    setError('');
    const { name, email, region } = form;
    if (!name.trim() || !email.trim()) return setError('Name and email are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Invalid email format.');

    const id = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
    setSaving(true);
    const { data, error: err } = await supabase.from('staff_extras').insert([{
      id, name: name.trim(), email: email.trim().toLowerCase(),
      region, birthday: form.birthday || null,
    }]).select().single();
    setSaving(false);
    if (err) return setError(err.message);
    const updated = [...staffExtras, data];
    setStaffExtras(updated);
    onStaffChange(updated);
    setForm({ name: '', email: '', region: 'Hong Kong', birthday: '' });
  };

  const handleDelete = async (id) => {
    await supabase.from('staff_extras').delete().eq('id', id);
    const updated = staffExtras.filter(s => s.id !== id);
    setStaffExtras(updated);
    onStaffChange(updated);
  };

  const inputStyle = {
    width: '100%', padding: '7px 10px', fontSize: 11, borderRadius: 8,
    border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(255,255,255,0.05)',
    color: 'rgba(232,229,255,0.9)', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 320, zIndex: 14000,
      background: 'rgba(10,8,28,0.97)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 20,
      boxShadow: '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(119,11,255,0.18)',
      backdropFilter: 'blur(24px)',
      overflow: 'hidden',
      animation: 'ss-dropin 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* Header */}
      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(167,139,250,0.1)' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 3 }}>
          Admin · Staff Management
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(232,229,255,0.92)' }}>Add Team Member</div>
      </div>

      {/* Form */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          style={inputStyle} placeholder="Full name *"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          style={inputStyle} placeholder="Email * (e.g. john.doe@patternasia.com)"
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            style={{ ...inputStyle, width: '55%' }}
            value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
          >
            <option value="Hong Kong">Hong Kong</option>
            <option value="Japan">Japan</option>
            <option value="Korea">Korea</option>
            <option value="China">China</option>
            <option value="UK">UK</option>
          </select>
          <input
            style={{ ...inputStyle, width: '45%' }} placeholder="Birthday MM-DD"
            value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
          />
        </div>
        {error && <div style={{ fontSize: 10, color: '#ff8080', marginTop: -2 }}>{error}</div>}
        <button
          onClick={handleAdd} disabled={saving}
          style={{
            marginTop: 2, padding: '8px 0', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.1em', borderRadius: 100, border: 'none', cursor: saving ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #a78bfa, #60d0ff)',
            color: '#0a0612', textTransform: 'uppercase', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Adding…' : '+ Add Member'}
        </button>
      </div>

      {/* Existing extras */}
      {staffExtras.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(167,139,250,0.45)', textTransform: 'uppercase' }}>
            Added via portal ({staffExtras.length})
          </div>
          {staffExtras.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 16px', borderBottom: '1px solid rgba(167,139,250,0.06)',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(232,229,255,0.85)' }}>{s.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.5)', marginTop: 1 }}>{s.email} · {s.region}</div>
              </div>
              <button onClick={() => handleDelete(s.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,100,100,0.5)', fontSize: 14, padding: '2px 4px',
                transition: 'color 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.color = 'rgba(255,100,100,0.9)'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,100,100,0.5)'}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(167,139,250,0.1)' }}>
        <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.3)', textAlign: 'center' }}>
          Changes are live immediately · No deployment needed
        </div>
      </div>
    </div>
  );
}
