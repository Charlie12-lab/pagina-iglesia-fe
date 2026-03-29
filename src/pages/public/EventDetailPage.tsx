import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import type { GroupMember } from '../../types';
import './EventRegistrationPage.css';

type Mode = 'individual' | 'colectiva';

interface IndForm {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
  church: string;
}

interface ColForm {
  responsible: string;
  email: string;
  phone: string;
  church: string;
}

interface SuccessData {
  title: string;
  sub: string;
  rows: [string, string][];
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [mode, setMode] = useState<Mode>('individual');
  const [success, setSuccess] = useState<SuccessData | null>(null);

  // Individual form state
  const [ind, setInd] = useState<IndForm>({ fullName: '', email: '', phone: '', notes: '', church: '' });
  const [indErrors, setIndErrors] = useState<Partial<IndForm>>({});
  const [indVoucher, setIndVoucher] = useState<File | null>(null);
  const indVoucherRef = useRef<HTMLInputElement>(null);

  // Colectiva form state
  const [col, setCol] = useState<ColForm>({ responsible: '', email: '', phone: '', church: '' });
  const [colErrors, setColErrors] = useState<Partial<ColForm>>({});
  const [members, setMembers] = useState<GroupMember[]>([{ fullName: '' }, { fullName: '' }]);
  const [colVoucher, setColVoucher] = useState<File | null>(null);
  const colVoucherRef = useRef<HTMLInputElement>(null);
  const [memberErrors, setMemberErrors] = useState<{ [i: number]: string }>({});

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { mutate: registerInd, isPending: pendingInd } = useMutation({
    mutationFn: () => eventsApi.register(
      Number(id),
      { fullName: ind.fullName, email: ind.email, phone: ind.phone || undefined, notes: ind.notes || undefined, church: ind.church || undefined },
      indVoucher ?? undefined,
    ),
    onSuccess: () => {
      setSuccess({
        title: '¡Inscripción confirmada!',
        sub: 'Tu inscripción ha sido registrada. Recibirás un correo con los detalles del evento.',
        rows: [
          ['Nombre', ind.fullName],
          ['Correo', ind.email],
          ...(event?.price ? [['Pago', `$${event.price.toFixed(2)}`] as [string, string]] : []),
          ...(indVoucher ? [['Comprobante', indVoucher.name] as [string, string]] : []),
        ],
      });
      setInd({ fullName: '', email: '', phone: '', notes: '', church: '' });
      setIndErrors({});
      setIndVoucher(null);
      if (indVoucherRef.current) indVoucherRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const { mutate: registerCol, isPending: pendingCol } = useMutation({
    mutationFn: () => eventsApi.registerGroup(
      Number(id),
      { responsible: col.responsible, email: col.email, phone: col.phone || undefined, church: col.church || undefined, members },
      colVoucher ?? undefined,
    ),
    onSuccess: () => {
      setSuccess({
        title: '¡Inscripción grupal confirmada!',
        sub: `El grupo de ${members.length} persona${members.length !== 1 ? 's' : ''} ha sido registrado. El responsable recibirá la confirmación.`,
        rows: [
          ['Responsable', col.responsible],
          ['Correo', col.email],
          ['Personas', String(members.length)],
          ...(event?.price ? [['Total', `$${(event.price * members.length).toFixed(2)}`] as [string, string]] : []),
          ...(colVoucher ? [['Comprobante', colVoucher.name] as [string, string]] : []),
        ],
      });
      setCol({ responsible: '', email: '', phone: '', church: '' });
      setColErrors({});
      setMembers([{ fullName: '' }, { fullName: '' }]);
      setMemberErrors({});
      setColVoucher(null);
      if (colVoucherRef.current) colVoucherRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleIndSubmit() {
    const errs: Partial<IndForm> = {};
    if (!ind.fullName.trim()) errs.fullName = 'requerido';
    setIndErrors(errs);
    if (Object.keys(errs).length) return;
    registerInd();
  }

  function handleColSubmit() {
    const errs: Partial<ColForm> = {};
    if (!col.responsible.trim()) errs.responsible = 'requerido';
    if (!col.email.trim()) errs.email = 'requerido';
    setColErrors(errs);

    const mErrs: { [i: number]: string } = {};
    members.forEach((m, i) => {
      if (!m.fullName.trim()) mErrs[i] = 'requerido';
    });
    setMemberErrors(mErrs);

    if (Object.keys(errs).length || Object.keys(mErrs).length) return;
    registerCol();
  }

  function addMember() {
    setMembers(prev => [...prev, { fullName: '' }]);
  }

  function removeMember(i: number) {
    setMembers(prev => prev.filter((_, idx) => idx !== i));
    setMemberErrors(prev => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
  }

  function updateMember(i: number, field: keyof GroupMember, value: string) {
    setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  function handleVoucherChange(file: File | null, type: 'ind' | 'col') {
    if (type === 'ind') setIndVoucher(file);
    else setColVoucher(file);
  }

  // ── Loading / error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#777' }}>
        Cargando evento...
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#777', gap: '12px' }}>
        <p>Evento no encontrado.</p>
        <button onClick={() => navigate('/eventos')}
          style={{ background: '#0098A6', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 700 }}>
          Volver a eventos
        </button>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : null;
  const occupancy = event.maxAttendees ? Math.round((event.currentAttendees / event.maxAttendees) * 100) : 0;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  const formattedDateLong = endDate
    ? `${format(startDate, "EEE d MMM", { locale: es })} – ${format(endDate, "EEE d MMM yyyy", { locale: es })}`
    : format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es });

  const priceLabel = event.price && event.price > 0 ? `$${event.price.toFixed(2)}` : 'Gratuita';
  const priceSub = event.price && event.price > 0 ? 'Incluye alimentación' : 'Sin costo';
  const groupTotal = event.price ? event.price * members.length : 0;

  return (
    <div className="erp-page">

      {/* Breadcrumb */}
      <div className="erp-back-bar">
        <button className="erp-back-btn" onClick={() => navigate('/eventos')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Eventos
        </button>
        <span className="erp-back-sep">/</span>
        <span className="erp-back-cur">{event.title}</span>
      </div>

      <div className="erp-body">

        {/* ── LEFT: info del evento ── */}
        <div className="erp-info-panel">

          {/* Header con gradiente */}
          <div className="erp-event-header">
            <div className="erp-eh-pattern" />
            {event.allowsRegistration && !isFull && (
              <div className="erp-eh-badge">
                <div className="erp-eh-dot" />
                Inscripciones abiertas
              </div>
            )}
            {isFull && (
              <div className="erp-eh-badge" style={{ background: 'rgba(100,100,100,0.4)' }}>Sin cupos</div>
            )}
            <div className="erp-eh-title">{event.title}</div>
            <div className="erp-eh-org">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1C3.8 1 2 2.8 2 5C2 7.5 6 11 6 11S10 7.5 10 5C10 2.8 8.2 1 6 1Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                <circle cx="6" cy="5" r="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
              </svg>
              {event.churchName}
            </div>
          </div>

          {/* Info grid */}
          <div className="erp-info-grid">
            <div className="erp-info-card">
              <div className="erp-ic-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="2" stroke="#E8A020" strokeWidth="1.4"/><path d="M5 2V4.5M11 2V4.5M1.5 6.5H14.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="erp-ic-label">Fecha</div>
                <div className="erp-ic-val" style={{ textTransform: 'capitalize' }}>{formattedDateLong}</div>
              </div>
            </div>

            <div className="erp-info-card">
              <div className="erp-ic-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#E8A020" strokeWidth="1.4"/><path d="M8 5V8.5L10.5 10.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="erp-ic-label">Hora</div>
                <div className="erp-ic-val">{format(startDate, "HH:mm 'hrs'")}</div>
                {endDate && <div className="erp-ic-sub">Hasta {format(endDate, "HH:mm 'hrs'")}</div>}
              </div>
            </div>

            {event.location && (
              <div className="erp-info-card">
                <div className="erp-ic-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14.5 8 14.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#E8A020" strokeWidth="1.4" fill="none"/><circle cx="8" cy="6" r="2" stroke="#E8A020" strokeWidth="1.4"/></svg>
                </div>
                <div>
                  <div className="erp-ic-label">Lugar</div>
                  <div className="erp-ic-val">{event.location}</div>
                </div>
              </div>
            )}

            {event.maxAttendees && (
              <div className="erp-info-card">
                <div className="erp-ic-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.5" r="2.5" stroke="#E8A020" strokeWidth="1.4"/><path d="M1.5 14C1.5 11.5 3.5 9.5 6 9.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/><circle cx="11" cy="8" r="2" stroke="#E8A020" strokeWidth="1.4"/><path d="M8.5 14C8.5 12 9.6 10.5 11 10.5C12.4 10.5 13.5 12 13.5 14" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div className="erp-ic-label">Capacidad</div>
                  <div className="erp-ic-val">{event.maxAttendees.toLocaleString()} personas</div>
                  <div className="erp-ic-sub">
                    {spotsLeft !== null && spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Sin cupos'}
                  </div>
                </div>
              </div>
            )}

            <div className="erp-info-card">
              <div className="erp-ic-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6H14L10.5 8.5L12 12.5L8 10L4 12.5L5.5 8.5L2 6H6.5L8 2Z" stroke="#E8A020" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="erp-ic-label">Entrada</div>
                <div className="erp-ic-val">{priceLabel}</div>
                <div className="erp-ic-sub">{priceSub}</div>
              </div>
            </div>

            <div className="erp-info-card">
              <div className="erp-ic-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5V2.5M6.5 2.5H9.5M2 14.5H14V8L8 3.5L2 8V14.5Z" stroke="#E8A020" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 14.5V10.5H10.5V14.5" stroke="#E8A020" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="erp-ic-label">Organizador</div>
                <div className="erp-ic-val">{event.churchName}</div>
              </div>
            </div>
          </div>

          {/* Barra de ocupación */}
          {event.maxAttendees && (
            <div className="erp-ocupacion">
              <div className="erp-oc-header">
                <span className="erp-oc-title">Ocupación del evento</span>
                <span className="erp-oc-pct">{occupancy}%</span>
              </div>
              <div className="erp-oc-bar">
                <div className="erp-oc-fill" style={{ width: `${occupancy}%` }} />
              </div>
              <div className="erp-oc-meta">
                <span>{event.currentAttendees} inscritos</span>
                <span>{event.maxAttendees.toLocaleString()} cupos totales</span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: formulario ── */}
        <div className="erp-form-panel">
          <div className="erp-fp-card">

            {/* Price header */}
            <div className="erp-fp-head">
              <div className="erp-fp-head-circle erp-fhc1" />
              <div className="erp-fp-head-circle erp-fhc2" />
              <div className="erp-fp-price-row">
                <div className="erp-fp-price">
                  {mode === 'colectiva' && event.price && event.price > 0
                    ? `$${groupTotal.toFixed(2)}`
                    : priceLabel}
                </div>
                <div className="erp-fp-price-sub">
                  {mode === 'colectiva' && event.price && event.price > 0
                    ? `${members.length} personas × $${event.price.toFixed(2)}`
                    : 'por persona'}
                </div>
              </div>
              {event.maxAttendees && (
                <div className="erp-fp-cupos">
                  Quedan <strong>{spotsLeft ?? 0} cupos</strong> de {event.maxAttendees.toLocaleString()}
                </div>
              )}
            </div>

            {/* Toggle individual / colectiva */}
            {event.allowsRegistration && !isFull && (
              <div className="erp-mode-toggle">
                <button
                  className={`erp-mt-btn${mode === 'individual' ? ' active' : ''}`}
                  onClick={() => setMode('individual')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 13C1.5 10.2 4 8 7 8C10 8 12.5 10.2 12.5 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Individual
                </button>
                <button
                  className={`erp-mt-btn${mode === 'colectiva' ? ' active' : ''}`}
                  onClick={() => setMode('colectiva')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="4.5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3"/><path d="M0.5 12.5C0.5 10.5 2.3 9 4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9.5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 9C11.7 9 13.5 10.5 13.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Colectiva
                </button>
              </div>
            )}

            {/* Sin inscripciones / sin cupos */}
            {(!event.allowsRegistration || isFull) && (
              <div className="erp-fp-body">
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-light)', fontSize: 13 }}>
                  {isFull ? 'Este evento ya no tiene cupos disponibles.' : 'Este evento no requiere inscripción previa.'}
                </div>
              </div>
            )}

            {/* ══ INDIVIDUAL ══ */}
            {event.allowsRegistration && !isFull && mode === 'individual' && (
              <div className="erp-fp-body">

                <div className="erp-form-group">
                  <label className="erp-fl">Nombre completo <span className="erp-req">*</span></label>
                  <input
                    className={`erp-fi${indErrors.fullName ? ' error' : ''}`}
                    placeholder="Tu nombre completo"
                    value={ind.fullName}
                    onChange={e => { setInd(p => ({ ...p, fullName: e.target.value })); setIndErrors(p => ({ ...p, fullName: '' })); }}
                  />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Correo electrónico <span style={{ fontSize: 11, color: '#ABABAB', fontWeight: 400 }}>(opcional)</span></label>
                  <input
                    className="erp-fi"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={ind.email}
                    onChange={e => { setInd(p => ({ ...p, email: e.target.value })); setIndErrors(p => ({ ...p, email: '' })); }}
                  />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Teléfono</label>
                  <input className="erp-fi" placeholder="+593 99 000 0000" value={ind.phone}
                    onChange={e => setInd(p => ({ ...p, phone: e.target.value }))} />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Iglesia de procedencia</label>
                  <input className="erp-fi" placeholder="Nombre de tu iglesia" value={ind.church}
                    onChange={e => setInd(p => ({ ...p, church: e.target.value }))} />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Notas adicionales</label>
                  <textarea className="erp-fi" rows={2} placeholder="Alergias, necesidades especiales, etc."
                    style={{ resize: 'none' }} value={ind.notes}
                    onChange={e => setInd(p => ({ ...p, notes: e.target.value }))} />
                </div>

                {/* Voucher individual — solo si el evento tiene costo */}
                {event.price && event.price > 0 && (
                  <VoucherUpload
                    file={indVoucher}
                    inputRef={indVoucherRef}
                    onChange={f => handleVoucherChange(f, 'ind')}
                  />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <button className="erp-btn-confirm" disabled={pendingInd} onClick={handleIndSubmit}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5L6 10.5L12 4.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {pendingInd ? 'Enviando...' : 'Confirmar inscripción'}
                  </button>
                  <button className="erp-btn-cancel" onClick={() => navigate('/eventos')}>Cancelar</button>
                </div>
              </div>
            )}

            {/* ══ COLECTIVA ══ */}
            {event.allowsRegistration && !isFull && mode === 'colectiva' && (
              <div className="erp-fp-body">

                <div className="erp-form-group">
                  <label className="erp-fl">Tu nombre (responsable) <span className="erp-req">*</span></label>
                  <input
                    className={`erp-fi${colErrors.responsible ? ' error' : ''}`}
                    placeholder="Nombre del responsable"
                    value={col.responsible}
                    onChange={e => { setCol(p => ({ ...p, responsible: e.target.value })); setColErrors(p => ({ ...p, responsible: '' })); }}
                  />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Correo de contacto <span className="erp-req">*</span></label>
                  <input
                    className={`erp-fi${colErrors.email ? ' error' : ''}`}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={col.email}
                    onChange={e => { setCol(p => ({ ...p, email: e.target.value })); setColErrors(p => ({ ...p, email: '' })); }}
                  />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Teléfono del responsable</label>
                  <input className="erp-fi" placeholder="+593 99 000 0000" value={col.phone}
                    onChange={e => setCol(p => ({ ...p, phone: e.target.value }))} />
                </div>

                <div className="erp-form-group">
                  <label className="erp-fl">Iglesia del grupo</label>
                  <input className="erp-fi" placeholder="Nombre de la iglesia" value={col.church}
                    onChange={e => setCol(p => ({ ...p, church: e.target.value }))} />
                </div>

                {/* Lista de miembros */}
                <div>
                  <div className="erp-members-header">
                    <span className="erp-members-title">Miembros del grupo</span>
                    <button className="erp-btn-add-member" onClick={addMember}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Agregar persona
                    </button>
                  </div>
                  <div className="erp-member-list">
                    {members.map((m, i) => (
                      <div key={i} className="erp-member-card">
                        <div className="erp-mc-header">
                          <div className="erp-mc-num">
                            <div className="erp-mc-badge">{i + 1}</div>
                            <div className="erp-mc-label">Persona {i + 1}</div>
                          </div>
                          {i > 0 && (
                            <button className="erp-mc-remove" onClick={() => removeMember(i)}>✕</button>
                          )}
                        </div>
                        <div className="erp-mc-fields">
                          <input
                            className={`erp-fi-sm${memberErrors[i] ? ' error' : ''}`}
                            style={memberErrors[i] ? { borderColor: 'var(--red)', background: 'var(--red-pale)' } : {}}
                            placeholder="Nombre completo *"
                            value={m.fullName}
                            onChange={e => { updateMember(i, 'fullName', e.target.value); setMemberErrors(p => { const n = { ...p }; delete n[i]; return n; }); }}
                          />
                          <div className="erp-fi-row">
                            <input className="erp-fi-sm" type="email" placeholder="Correo electrónico"
                              value={m.email ?? ''}
                              onChange={e => updateMember(i, 'email', e.target.value)} />
                            <input className="erp-fi-sm" placeholder="Teléfono"
                              value={m.phone ?? ''}
                              onChange={e => updateMember(i, 'phone', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen grupal */}
                {members.length > 0 && event.price && event.price > 0 && (
                  <div className="erp-summary">
                    <div className="erp-sb-row"><span>Personas</span><span>{members.length}</span></div>
                    <div className="erp-sb-row"><span>Precio por persona</span><span>${event.price.toFixed(2)}</span></div>
                    <div className="erp-sb-row total"><span>Total a pagar</span><span>${groupTotal.toFixed(2)}</span></div>
                  </div>
                )}

                {/* Voucher colectivo — solo si el evento tiene costo */}
                {members.length > 0 && event.price && event.price > 0 && (
                  <VoucherUpload
                    file={colVoucher}
                    inputRef={colVoucherRef}
                    onChange={f => handleVoucherChange(f, 'col')}
                    label="Comprobante de pago grupal"
                    placeholder="Sube el comprobante grupal"
                  />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <button className="erp-btn-confirm" disabled={pendingCol} onClick={handleColSubmit}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5L6 10.5L12 4.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {pendingCol ? 'Enviando...' : 'Confirmar inscripción grupal'}
                  </button>
                  <button className="erp-btn-cancel" onClick={() => navigate('/eventos')}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="erp-share-row">
              <button className="erp-share-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="10.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="10.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 7.3L9 9.7M9 3.3L4 5.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Compartir evento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {success && (
        <div className="erp-success-overlay">
          <div className="erp-success-card">
            <div className="erp-sc-icon">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path d="M5 15L11 21L25 8" stroke="#0098A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="erp-sc-title">{success.title}</div>
            <div className="erp-sc-sub">{success.sub}</div>
            <div className="erp-sc-detail">
              {success.rows.map(([label, value], i) => (
                <div key={i} className="erp-sd-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <button className="erp-btn-sc" onClick={() => setSuccess(null)}>Entendido ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-componente VoucherUpload ──────────────────────────────────────────────
interface VoucherUploadProps {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (f: File | null) => void;
  label?: string;
  placeholder?: string;
}

function VoucherUpload({ file, inputRef, onChange, label = 'Comprobante de pago', placeholder = 'Sube tu comprobante' }: VoucherUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFile(f: File) {
    onChange(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreviewUrl(null);
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="erp-voucher-section">
      <div className="erp-vs-title">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="#7A5000" strokeWidth="1.3"/><path d="M5 7.5L6.5 9L10 5.5" stroke="#7A5000" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {label} <span className="erp-vs-optional">(requerido)</span>
      </div>
      <div
        className="erp-voucher-upload"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="erp-vu-preview">
            {previewUrl && <img className="erp-vu-img" src={previewUrl} alt="Voucher" />}
            <div className="erp-vu-name">{file.name}</div>
            <div className="erp-vu-remove" onClick={handleRemove}>✕ Eliminar comprobante</div>
          </div>
        ) : (
          <div className="erp-vu-placeholder">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4V16M14 4L10 8M14 4L18 8" stroke="#B07020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="20" height="8" rx="2.5" stroke="#B07020" strokeWidth="1.5"/></svg>
            <p>{placeholder}</p>
            <span>Toca aquí · JPG, PNG o PDF</span>
          </div>
        )}
      </div>
    </div>
  );
}
