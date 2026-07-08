import { useState, useEffect, useRef } from 'react';

export default function AdminPortal({ supabase, staticStaff, onClose, onStaffChange }) {
  const ref = useRef();
  const [tab, setTab] = useState('add');
  const [staffExtras, setStaffExtras] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', region: 'Hong Kong', birthday: '' });
  const [editingEmail, setEditingEmail] = useState({});
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
      id, name: name.trim(), email: email.trim(),
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

  const handleSaveEmail = async (staff, isStaticOverride) => {
    const newEmail = (editingEmail[staff.id] || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return;

    if (isStaticOverride) {
      // Upsert the full static record into staff_extras with the new email
      const { data, error: err } = await supabase.from('staff_extras').upsert({
        id: staff.id,
        name: staff.name,
        email: newEmail,
        region: staff.region,
        birthday: staff.birthday || null,
      }).select().single();
      if (err) return;
      const existing = staffExtras.find(s => s.id === staff.id);
      const updated = existing
        ? staffExtras.map(s => s.id === staff.id ? data : s)
        : [...staffExtras, data];
      setStaffExtras(updated);
      onStaffChange(updated);
    } else {
      // Portal-added staff: update in place
      await supabase.from('staff_extras').update({ email: newEmail }).eq('id', staff.id);
      const updated = staffExtras.map(s => s.id === staff.id ? { ...s, email: newEmail } : s);
      setStaffExtras(updated);
      onStaffChange(updated);
    }
  };

  // Static staff: show with overridden email if it exists in staffExtras
  const extraById = Object.fromEntries(staffExtras.map(s => [s.id, s]));
  const portalOnlyExtras = staffExtras.filter(s => !staticStaff.find(st => st.id === s.id));

  // allForEdit: all static staff + portal-only extras
  const allForEdit = [
    ...staticStaff.map(s => {
      const override = extraById[s.id];
      return { ...s, email: override ? override.email : s.email, isStaticOverride: !!override, isExtra: false };
    }),
    ...portalOnlyExtras.map(s => ({ ...s, isStaticOverride: false, isExtra: true })),
  ];

  const inputStyle = {
    width: '100%', padding: '7px 10px', fontSize: 11, borderRadius: 8,
    border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(255,255,255,0.05)',
    color: 'rgba(232,229,255,0.9)', outline: 'none', boxSizing: 'border-box',
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    border: 'none', cursor: 'pointer', textTransform: 'uppercase',
    background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
    color: active ? 'rgba(167,139,250,0.9)' : 'rgba(167,139,250,0.4)',
    borderBottom: active ? '2px solid rgba(167,139,250,0.6)' : '2px solid transparent',
    transition: 'all 0.15s',
  });

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 340, maxHeight: 520, zIndex: 14000,
      background: 'rgba(10,8,28,0.97)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 20,
      boxShadow: '0 20px 56px rgba(0,0,0,0.6), 0 4px 16px rgba(119,11,255,0.18)',
      backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'ss-dropin 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* Header */}
      <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid rgba(167,139,250,0.1)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: 'rgba(167,139,250,0.55)', textTransform: 'uppercase', marginBottom: 3 }}>
          Admin · Staff Management
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(167,139,250,0.1)', flexShrink: 0 }}>
        <button style={tabStyle(tab === 'add')} onClick={() => setTab('add')}>+ Add Member</button>
        <button style={tabStyle(tab === 'edit')} onClick={() => setTab('edit')}>✎ Edit Email</button>
      </div>

      {/* Add tab */}
      {tab === 'add' && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={inputStyle} placeholder="Full name *"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input style={inputStyle} placeholder="Email * (e.g. john.doe@patternasia.com)"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <div style={{ display: 'flex', gap: 8 }}>
            <select style={{ ...inputStyle, width: '55%' }}
              value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
              <option value="Hong Kong">Hong Kong</option>
              <option value="Japan">Japan</option>
              <option value="Korea">Korea</option>
              <option value="China">China</option>
              <option value="UK">UK</option>
            </select>
            <input style={{ ...inputStyle, width: '45%' }} placeholder="Birthday MM-DD"
              value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
          </div>
          {error && <div style={{ fontSize: 10, color: '#ff8080' }}>{error}</div>}
          <button onClick={handleAdd} disabled={saving} style={{
            marginTop: 2, padding: '8px 0', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.1em', borderRadius: 100, border: 'none', cursor: saving ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #a78bfa, #60d0ff)',
            color: '#0a0612', textTransform: 'uppercase', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Adding…' : '+ Add Member'}
          </button>

          {portalOnlyExtras.length > 0 && (
            <div style={{ marginTop: 4, borderTop: '1px solid rgba(167,139,250,0.1)', paddingTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(167,139,250,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
                Added via portal ({portalOnlyExtras.length})
              </div>
              {portalOnlyExtras.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(232,229,255,0.85)' }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.5)' }}>{s.email}</div>
                  </div>
                  <button onClick={() => handleDelete(s.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,100,100,0.5)', fontSize: 14, padding: '2px 6px',
                  }}
                    onMouseOver={e => e.currentTarget.style.color = 'rgba(255,100,100,0.9)'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(255,100,100,0.5)'}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit email tab */}
      {tab === 'edit' && (
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          <div style={{ padding: '4px 16px 8px', fontSize: 9, color: 'rgba(167,139,250,0.4)', letterSpacing: '0.06em' }}>
            Click ✓ to save after editing
          </div>
          {allForEdit.map(s => {
            const currentEmail = s.email;
            const edited = editingEmail[s.id] ?? currentEmail;
            const changed = edited.trim().toLowerCase() !== currentEmail.toLowerCase();
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edited.trim());
            return (
              <div key={s.id} style={{
                padding: '6px 16px', borderBottom: '1px solid rgba(167,139,250,0.06)',
                display: 'flex', flexDirection: 'column', gap: 3,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(232,229,255,0.85)' }}>{s.name}</div>
                  {s.isStaticOverride && <span style={{ fontSize: 8, color: 'rgba(96,208,255,0.6)', fontWeight: 700 }}>EDITED</span>}
                  {s.isExtra && !s.isStaticOverride && <span style={{ fontSize: 8, color: 'rgba(167,139,250,0.4)', fontWeight: 700 }}>PORTAL</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    style={{
                      ...inputStyle, flex: 1, padding: '5px 8px', fontSize: 10,
                      borderColor: !valid && edited ? 'rgba(255,100,100,0.5)' : changed ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.15)',
                    }}
                    value={edited}
                    onChange={e => setEditingEmail(prev => ({ ...prev, [s.id]: e.target.value }))}
                  />
                  {changed && valid && (
                    <button onClick={() => handleSaveEmail(s, !s.isExtra)} style={{
                      background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)',
                      borderRadius: 6, color: '#a78bfa', fontSize: 12, cursor: 'pointer',
                      padding: '4px 8px', flexShrink: 0,
                    }}>✓</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: '7px 16px', borderTop: '1px solid rgba(167,139,250,0.1)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.3)', textAlign: 'center' }}>
          Changes are live immediately · No deployment needed
        </div>
      </div>
    </div>
  );
}
