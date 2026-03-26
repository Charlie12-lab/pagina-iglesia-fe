import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import { Navigate } from 'react-router-dom';
import type { Church } from '../../types';

// ── Shared inline styles ─────────────────────────────────────────────────────
const s = {
  pageHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 } as React.CSSProperties,
  h1: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#1A1A1A', letterSpacing: -0.2, marginBottom: 3 } as React.CSSProperties,
  sub: { fontSize: 13, color: '#777777' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0098A6', color: 'white', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,152,166,0.22)' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: '#444444', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2E2E2', cursor: 'pointer' } as React.CSSProperties,
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 } as React.CSSProperties,
  statCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, padding: '16px 18px' } as React.CSSProperties,
  tableWrap: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden' } as React.CSSProperties,
  toolbar: { padding: '14px 18px', borderBottom: '1px solid #F3F3F3', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
  searchWrap: { position: 'relative', flex: 1, maxWidth: 280 } as React.CSSProperties,
  searchInput: { width: '100%', background: '#F3F3F3', border: '1.5px solid transparent', borderRadius: 8, padding: '7px 12px 7px 34px', fontFamily: 'inherit', fontSize: 13, color: '#1A1A1A', outline: 'none' } as React.CSSProperties,
  filterSel: { background: 'white', border: '1.5px solid #E2E2E2', borderRadius: 8, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12.5, color: '#444444', outline: 'none', cursor: 'pointer' } as React.CSSProperties,
  th: { background: '#F9F9F9', borderBottom: '1px solid #E2E2E2', padding: '10px 18px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#777777', letterSpacing: 0.5, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const } as React.CSSProperties,
  td: { padding: '12px 18px', fontSize: 13, color: '#444444', borderBottom: '1px solid #F3F3F3' } as React.CSSProperties,
  actBtn: { width: 28, height: 28, borderRadius: 7, border: '1.5px solid #E2E2E2', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777777' } as React.CSSProperties,
  formLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' } as React.CSSProperties,
  formCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden' } as React.CSSProperties,
  fcHeader: { padding: '16px 20px', borderBottom: '1px solid #F3F3F3', display: 'flex', alignItems: 'center', gap: 9 } as React.CSSProperties,
  fcTitle: { fontSize: 14, fontWeight: 700, color: '#1A1A1A' } as React.CSSProperties,
  fcBody: { padding: '18px 20px', display: 'flex', flexDirection: 'column' as const, gap: 16 } as React.CSSProperties,
  formRow2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as React.CSSProperties,
  formRow3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 } as React.CSSProperties,
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 5 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 600, color: '#444444' } as React.CSSProperties,
  fi: { background: '#F3F3F3', border: '1.5px solid transparent', borderRadius: 8, padding: '9px 12px', fontFamily: 'inherit', fontSize: 13.5, color: '#1A1A1A', outline: 'none', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  sfCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden', marginBottom: 14 } as React.CSSProperties,
  sfHeader: { padding: '12px 16px', borderBottom: '1px solid #F3F3F3', fontSize: 13, fontWeight: 700, color: '#1A1A1A' } as React.CSSProperties,
  sfBody: { padding: '14px 16px' } as React.CSSProperties,
};

const DENOMINATIONS = ['Evangélica', 'Pentecostal', 'Carismática', 'Bautista', 'Reformada', 'Católica', 'Otra'];

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Verificada',           dot: '#0098A6' },
  { value: 'Pending',  label: 'Pendiente de revisión', dot: '#E8A020' },
  { value: 'Inactive', label: 'Inactiva',              dot: '#ABABAB' },
];

const emptyForm = {
  name: '', address: '', city: '', phone: '', email: '',
  description: '', logoUrl: '', websiteUrl: '',
  denomination: '', pastorName: '', pastorEmail: '',
  status: 'Active',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    Active:   { bg: '#E6F7F8', color: '#00818C', label: '✓ Verificada' },
    Pending:  { bg: '#FEF5E0', color: '#9A5E00', label: '⏳ Pendiente' },
    Inactive: { bg: '#F3F3F3', color: '#5C5C5C', label: '— Inactiva' },
  };
  const c = map[status] ?? map.Active;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function StatCard({ num, label, iconColor, trendLabel }: { num: number | string; label: string; iconColor: string; trendLabel?: string }) {
  return (
    <div style={s.statCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: iconColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2V3.5M7.5 3.5H10.5M2.5 16H15.5V9L9 4L2.5 9V16Z" stroke={iconColor} strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M6.5 16V11.5H11.5V16" stroke={iconColor} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        {trendLabel && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#F3F3F3', color: '#5C5C5C' }}>{trendLabel}</span>}
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: '#1A1A1A', lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: 12, color: '#777777', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function AdminChurchesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Church | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDenom, setFilterDenom] = useState('');

  if (user?.role !== 'SuperAdmin') return <Navigate to="/admin" replace />;

  const { data: churches = [] } = useQuery({ queryKey: ['churches'], queryFn: churchesApi.getAll });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => editing ? churchesApi.update(editing.id, form) : churchesApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['churches'] }); setShowForm(false); setEditing(null); setForm(emptyForm); },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: number) => churchesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['churches'] }),
  });

  const openEdit = (c: Church) => {
    setEditing(c);
    setForm({ name: c.name, address: c.address ?? '', city: c.city ?? '', phone: c.phone ?? '', email: c.email ?? '', description: c.description ?? '', logoUrl: c.logoUrl ?? '', websiteUrl: c.websiteUrl ?? '', denomination: c.denomination ?? '', pastorName: c.pastorName ?? '', pastorEmail: c.pastorEmail ?? '', status: c.status ?? 'Active' });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const setField = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }));

  const filtered = churches.filter(c => {
    const q = search.toLowerCase();
    return (!search || c.name.toLowerCase().includes(q) || (c.city ?? '').toLowerCase().includes(q))
      && (!filterStatus || c.status === filterStatus)
      && (!filterDenom || c.denomination === filterDenom);
  });

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div>
        <div style={s.pageHead}>
          <div>
            <h1 style={s.h1}>{editing ? 'Editar Iglesia' : 'Nueva Iglesia'}</h1>
            <p style={s.sub}>Completa la información de la iglesia.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btnSecondary} onClick={() => setShowForm(false)}>← Volver</button>
            <button style={s.btnPrimary} onClick={() => save()} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); save(); }}>
          <div style={s.formLayout}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E6F7F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5V2.5M5.5 2.5H8.5M2 13H12V7.5L7 3.5L2 7.5V13Z" stroke="#0098A6" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 13V9.5H9V13" stroke="#0098A6" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <span style={s.fcTitle}>Información general</span>
                </div>
                <div style={s.fcBody}>
                  <div style={s.formRow2}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Nombre <span style={{ color: '#0098A6' }}>*</span></label>
                      <input required style={s.fi} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Nombre de la iglesia" />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Denominación</label>
                      <select style={{ ...s.fi, cursor: 'pointer' }} value={form.denomination} onChange={e => setField('denomination', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {DENOMINATIONS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={s.formRow3}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Ciudad <span style={{ color: '#0098A6' }}>*</span></label>
                      <input style={s.fi} value={form.city} onChange={e => setField('city', e.target.value)} placeholder="Quito" />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Teléfono</label>
                      <input style={s.fi} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+593 99 000 0000" />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Sitio web</label>
                      <input style={s.fi} value={form.websiteUrl} onChange={e => setField('websiteUrl', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Dirección completa</label>
                    <input style={s.fi} value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Av. Principal y calle..." />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Correo de contacto</label>
                    <input type="email" style={s.fi} value={form.email} onChange={e => setField('email', e.target.value)} placeholder="iglesia@correo.com" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Descripción</label>
                    <textarea style={{ ...s.fi, resize: 'vertical', minHeight: 90 }} value={form.description} onChange={e => setField('description', e.target.value)} rows={3} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>URL Logo</label>
                    <input style={s.fi} value={form.logoUrl} onChange={e => setField('logoUrl', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div>
              <div style={s.sfCard}>
                <div style={s.sfHeader}>Estado</div>
                <div style={s.sfBody}>
                  {STATUS_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setField('status', opt.value)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1.5px solid ${form.status === opt.value ? '#0098A6' : '#E2E2E2'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: form.status === opt.value ? 700 : 500, color: form.status === opt.value ? '#00818C' : '#444444', background: form.status === opt.value ? '#F0FAFB' : 'white', marginBottom: 6 }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.sfCard}>
                <div style={s.sfHeader}>Pastor / Responsable</div>
                <div style={{ ...s.sfBody, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Nombre del pastor</label>
                    <input style={s.fi} value={form.pastorName} onChange={e => setField('pastorName', e.target.value)} placeholder="Pastor Miguel Reyes" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Correo</label>
                    <input type="email" style={s.fi} value={form.pastorEmail} onChange={e => setField('pastorEmail', e.target.value)} placeholder="pastor@iglesia.com" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="submit" style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center' }} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar iglesia'}</button>
                <button type="button" style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  const total = churches.length;
  const active = churches.filter(c => c.status === 'Active').length;
  const pending = churches.filter(c => c.status === 'Pending').length;

  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.h1}>Iglesias</h1>
          <p style={s.sub}>Gestiona las iglesias registradas en la plataforma.</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="2" x2="6.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="6.5" x2="11" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Nueva iglesia
        </button>
      </div>

      <div style={s.statsRow}>
        <StatCard num={total} label="Total iglesias" iconColor="#0098A6" />
        <StatCard num={active} label="Verificadas" iconColor="#1B5E20" />
        <StatCard num={pending} label="Pendientes" iconColor="#E8A020" />
        <StatCard num={churches.reduce((a, _) => a, 0) || '—'} label="Miembros totales" iconColor="#5B21B6" trendLabel="próximamente" />
      </div>

      <div style={s.tableWrap}>
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#ABABAB', pointerEvents: 'none' }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input style={s.searchInput} placeholder="Buscar iglesia..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.filterSel} value={filterDenom} onChange={e => setFilterDenom(e.target.value)}>
            <option value="">Todas las denominaciones</option>
            {DENOMINATIONS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select style={s.filterSel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Active">Verificada</option>
            <option value="Pending">Pendiente</option>
            <option value="Inactive">Inactiva</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Iglesia', 'Denominación', 'Ciudad', 'Pastor', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(c)}>
                <td style={{ ...s.td, fontWeight: 700, color: '#1A1A1A', borderBottom: '1px solid #F3F3F3' }}>{c.name}</td>
                <td style={{ ...s.td, borderBottom: '1px solid #F3F3F3' }}>{c.denomination || '—'}</td>
                <td style={{ ...s.td, borderBottom: '1px solid #F3F3F3' }}>{c.city || '—'}</td>
                <td style={{ ...s.td, borderBottom: '1px solid #F3F3F3' }}>{c.pastorName || '—'}</td>
                <td style={{ ...s.td, borderBottom: '1px solid #F3F3F3' }}><StatusBadge status={c.status} /></td>
                <td style={{ ...s.td, borderBottom: '1px solid #F3F3F3' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={s.actBtn} onClick={() => openEdit(c)} title="Editar">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    </button>
                    <button style={s.actBtn} onClick={() => { if (confirm('¿Desactivar iglesia?')) remove(c.id); }} title="Eliminar">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M5 6V10M8 6V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#ABABAB' }}>
                  <div style={{ width: 56, height: 56, background: '#E6F7F8', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2V4M10 4H14M3 21H21V10L12 4L3 10V21Z" stroke="#0098A6" strokeWidth="1.5"/></svg>
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Sin iglesias</div>
                  <div style={{ fontSize: 13, marginBottom: 18 }}>No hay iglesias que coincidan.</div>
                  <button style={s.btnPrimary} onClick={openNew}>Nueva iglesia</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
