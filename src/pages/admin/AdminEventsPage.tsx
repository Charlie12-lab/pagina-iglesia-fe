import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import type { Event } from '../../types';

const s = {
  pageHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 } as React.CSSProperties,
  h1: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#1A1A1A', letterSpacing: -0.2, marginBottom: 3 } as React.CSSProperties,
  sub: { fontSize: 13, color: '#777777' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0098A6', color: 'white', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,152,166,0.22)' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: '#444444', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2E2E2', cursor: 'pointer' } as React.CSSProperties,
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
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 5 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 600, color: '#444444' } as React.CSSProperties,
  fi: { background: '#F3F3F3', border: '1.5px solid transparent', borderRadius: 8, padding: '9px 12px', fontFamily: 'inherit', fontSize: 13.5, color: '#1A1A1A', outline: 'none', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  sfCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden', marginBottom: 14 } as React.CSSProperties,
  sfHeader: { padding: '12px 16px', borderBottom: '1px solid #F3F3F3', fontSize: 13, fontWeight: 700, color: '#1A1A1A' } as React.CSSProperties,
  sfBody: { padding: '14px 16px' } as React.CSSProperties,
};

const EVENT_TYPES = ['Vigilia', 'Conferencia', 'Campamento', 'Campaña', 'Aniversario', 'Otros'];

const STATUS_OPTIONS = [
  { value: 'open',     label: 'Inscripciones abiertas', dot: '#0098A6' },
  { value: 'draft',    label: 'Borrador',                dot: '#E8A020' },
  { value: 'finished', label: 'Finalizado',              dot: '#ABABAB' },
];

const MODALITY_OPTIONS = [
  { value: 'Presencial', label: 'Presencial', dot: '#0098A6' },
  { value: 'Online',     label: 'Online',     dot: '#5B21B6' },
  { value: 'Híbrido',    label: 'Híbrido',    dot: '#1B5E20' },
];

const emptyForm = {
  title: '', description: '', startDate: '', endDate: '', location: '',
  imageUrl: '', allowsRegistration: false, maxAttendees: '', isPublished: true, churchId: '',
  eventType: '', modality: 'Presencial',
};

function evStatus(ev: Event): string {
  if (!ev.isPublished) return 'draft';
  if (ev.maxAttendees && ev.currentAttendees >= ev.maxAttendees) return 'full';
  return 'open';
}

function StatusBadge({ ev }: { ev: Event }) {
  const st = evStatus(ev);
  const map: Record<string, { bg: string; color: string; label: string }> = {
    open:  { bg: '#E6F7F8', color: '#00818C', label: 'Abierto' },
    draft: { bg: '#F3F3F3', color: '#5C5C5C', label: 'Borrador' },
    full:  { bg: '#FFEEF2', color: '#9D1539', label: 'Agotado' },
  };
  const c = map[st] ?? map.open;
  return <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
}

export default function AdminEventsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saveError, setSaveError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const { data: events = [] } = useQuery({
    queryKey: ['events-admin'],
    queryFn: () => eventsApi.getAll(user?.role === 'ChurchAdmin' ? { churchId: user.churchId } : undefined),
  });

  const { data: churches = [] } = useQuery({ queryKey: ['churches'], queryFn: churchesApi.getAll });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const churchId = Number(form.churchId) || user?.churchId;
      if (!churchId) return Promise.reject(new Error('Selecciona la iglesia organizadora'));
      if (!form.startDate) return Promise.reject(new Error('La fecha de inicio es requerida'));
      const payload = {
        ...form,
        churchId,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      return editing ? eventsApi.update(editing.id, payload) : eventsApi.create(payload as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events-admin'] });
      qc.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false); setEditing(null); setForm(emptyForm); setSaveError('');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Error al guardar el evento. Inténtalo de nuevo.';
      setSaveError(msg);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: number) => eventsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events-admin'] }); qc.invalidateQueries({ queryKey: ['events'] }); },
  });

  const openEdit = (ev: Event) => {
    setSaveError('');
    setEditing(ev);
    setForm({
      title: ev.title, description: ev.description ?? '',
      startDate: new Date(ev.startDate).toISOString().slice(0, 16),
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
      location: ev.location ?? '', imageUrl: ev.imageUrl ?? '',
      allowsRegistration: ev.allowsRegistration,
      maxAttendees: ev.maxAttendees?.toString() ?? '',
      isPublished: ev.isPublished, churchId: ev.churchId.toString(),
      eventType: ev.eventType ?? '', modality: ev.modality ?? 'Presencial',
    });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setSaveError(''); setShowForm(true); };
  const setField = (key: keyof typeof form, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    return (!search || ev.title.toLowerCase().includes(q) || ev.churchName.toLowerCase().includes(q))
      && (!filterType || ev.eventType === filterType);
  });

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (showForm) {
    const isOpen = form.isPublished;
    const isDraft = !form.isPublished;

    return (
      <div>
        <div style={s.pageHead}>
          <div>
            <h1 style={s.h1}>{editing ? 'Editar Evento' : 'Nuevo Evento'}</h1>
            <p style={s.sub}>Completa la información del evento.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btnSecondary} onClick={() => setShowForm(false)}>← Volver</button>
            <button style={s.btnPrimary} onClick={() => save()} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar evento'}</button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); save(); }}>
          <div style={s.formLayout}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Info evento */}
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#FEF5E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#E8A020" strokeWidth="1.2"/><path d="M4.5 1.5V3.5M9.5 1.5V3.5M1 5.5H13" stroke="#E8A020" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <span style={s.fcTitle}>Información del evento</span>
                </div>
                <div style={s.fcBody}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Nombre del evento <span style={{ color: '#0098A6' }}>*</span></label>
                    <input required style={s.fi} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Nombre del evento" />
                  </div>
                  <div style={s.formRow2}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Fecha de inicio <span style={{ color: '#0098A6' }}>*</span></label>
                      <input required type="datetime-local" style={s.fi} value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Fecha de fin</label>
                      <input type="datetime-local" style={s.fi} value={form.endDate} onChange={e => setField('endDate', e.target.value)} />
                    </div>
                  </div>
                  <div style={s.formRow2}>
                    {user?.role === 'SuperAdmin' && (
                      <div style={s.formGroup}>
                        <label style={s.label}>Iglesia organizadora <span style={{ color: '#0098A6' }}>*</span></label>
                        <select required style={{ ...s.fi, cursor: 'pointer' }} value={form.churchId} onChange={e => setField('churchId', e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={s.formGroup}>
                      <label style={s.label}>Lugar / Dirección</label>
                      <input style={s.fi} value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Nombre del lugar" />
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Descripción</label>
                    <textarea style={{ ...s.fi, resize: 'vertical', minHeight: 90 }} value={form.description} onChange={e => setField('description', e.target.value)} rows={3} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>URL imagen</label>
                    <input style={s.fi} value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Tipo */}
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E6F7F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7L6.5 8.5L9.5 5.5" stroke="#0098A6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#0098A6" strokeWidth="1.2"/></svg>
                  </div>
                  <span style={s.fcTitle}>Tipo de evento <span style={{ fontSize: 11, color: '#777777', fontWeight: 400 }}>(selecciona uno)</span></span>
                </div>
                <div style={s.fcBody}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {EVENT_TYPES.map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1.5px solid ${form.eventType === type ? '#0098A6' : '#E2E2E2'}`, borderRadius: 9, cursor: 'pointer', background: form.eventType === type ? '#F0FAFB' : 'white' }}>
                        <input type="radio" name="evtype" value={type} checked={form.eventType === type} onChange={() => setField('eventType', type)} style={{ accentColor: '#0098A6' }} />
                        <span style={{ fontSize: 13, fontWeight: form.eventType === type ? 700 : 500, color: form.eventType === type ? '#00818C' : '#444444' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inscripciones */}
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7L6 9L10 5" stroke="#1B5E20" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#1B5E20" strokeWidth="1.2"/></svg>
                  </div>
                  <span style={s.fcTitle}>Inscripciones</span>
                </div>
                <div style={s.fcBody}>
                  <div onClick={() => setField('allowsRegistration', !form.allowsRegistration)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: form.allowsRegistration ? '#F0FAFB' : '#FAF8F4', border: `1.5px solid ${form.allowsRegistration ? '#0098A6' : '#EDE8DF'}`, borderRadius: 9, cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Habilitar inscripciones</div>
                      <div style={{ fontSize: 11.5, color: '#777777' }}>Los asistentes podrán registrarse para este evento</div>
                    </div>
                    <div style={{ width: 38, height: 21, background: form.allowsRegistration ? '#0098A6' : '#E2E2E2', borderRadius: 11, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 2.5, left: form.allowsRegistration ? 19.5 : 2.5, width: 16, height: 16, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                    </div>
                  </div>
                  {form.allowsRegistration && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14, background: '#F0FAFB', border: '1.5px solid #0098A6', borderRadius: 9 }}>
                      <div style={s.formGroup}>
                        <label style={s.label}>Capacidad máxima</label>
                        <input type="number" style={s.fi} value={form.maxAttendees} onChange={e => setField('maxAttendees', e.target.value)} placeholder="0 = ilimitado" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={s.sfCard}>
                <div style={s.sfHeader}>Estado del evento</div>
                <div style={s.sfBody}>
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected = (opt.value === 'open' && isOpen) || (opt.value === 'draft' && isDraft);
                    return (
                      <div key={opt.value} onClick={() => setField('isPublished', opt.value === 'open')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1.5px solid ${isSelected ? '#0098A6' : '#E2E2E2'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#00818C' : '#444444', background: isSelected ? '#F0FAFB' : 'white', marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={s.sfCard}>
                <div style={s.sfHeader}>Modalidad</div>
                <div style={s.sfBody}>
                  {MODALITY_OPTIONS.map(opt => (
                    <div key={opt.value} onClick={() => setField('modality', opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1.5px solid ${form.modality === opt.value ? '#0098A6' : '#E2E2E2'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: form.modality === opt.value ? 700 : 500, color: form.modality === opt.value ? '#00818C' : '#444444', background: form.modality === opt.value ? '#F0FAFB' : 'white', marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {saveError && (
                <div style={{ background: '#FFEEF2', border: '1.5px solid #F9B8C6', borderRadius: 9, padding: '10px 14px', fontSize: 12.5, color: '#9D1539', marginBottom: 4 }}>
                  {saveError}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="submit" style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center' }} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar evento'}</button>
                <button type="button" style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={() => { setField('isPublished', false); save(); }}>Guardar borrador</button>
                <button type="button" style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.h1}>Eventos</h1>
          <p style={s.sub}>Crea y administra los eventos de la plataforma.</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="2" x2="6.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="6.5" x2="11" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Nuevo evento
        </button>
      </div>

      <div style={s.tableWrap}>
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#ABABAB', pointerEvents: 'none' }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input style={s.searchInput} placeholder="Buscar evento..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.filterSel} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Evento', 'Tipo', 'Fecha', 'Iglesia', 'Inscripciones', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(ev => (
              <tr key={ev.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(ev)}>
                <td style={{ ...s.td, fontWeight: 700, color: '#1A1A1A' }}>{ev.title}</td>
                <td style={s.td}>{ev.eventType || '—'}</td>
                <td style={s.td}>{new Date(ev.startDate).toLocaleDateString('es')}</td>
                <td style={s.td}>{ev.churchName}</td>
                <td style={s.td}>{ev.allowsRegistration ? `${ev.currentAttendees}${ev.maxAttendees ? ' / ' + ev.maxAttendees : ''}` : '—'}</td>
                <td style={s.td}><StatusBadge ev={ev} /></td>
                <td style={s.td} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={s.actBtn} onClick={() => openEdit(ev)} title="Editar"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg></button>
                    <button style={s.actBtn} onClick={() => { if (confirm('¿Eliminar evento?')) remove(ev.id); }} title="Eliminar"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M5 6V10M8 6V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#ABABAB' }}>
                <div style={{ width: 56, height: 56, background: '#FEF5E0', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="18" rx="3" stroke="#E8A020" strokeWidth="1.5"/><path d="M7 2V6M17 2V6M2 9H22" stroke="#E8A020" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Sin eventos</div>
                <div style={{ fontSize: 13, marginBottom: 18 }}>No hay eventos. Crea el primero.</div>
                <button style={s.btnPrimary} onClick={openNew}>Nuevo evento</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
