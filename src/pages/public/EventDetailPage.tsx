import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import type { EventRegistrationRequest } from '../../types';
import '../../components/ui/EventModal.css';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState<EventRegistrationRequest>({
    fullName: '', email: '', phone: '', notes: '',
  });

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { mutate: register, isPending } = useMutation({
    mutationFn: () => eventsApi.register(Number(id), form),
    onSuccess: () => { setRegistered(true); setShowForm(false); },
  });

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

  const formattedDate = endDate
    ? `${format(startDate, "EEE d MMM", { locale: es })} – ${format(endDate, "EEE d MMM, yyyy", { locale: es })}`
    : format(startDate, "EEEE d 'de' MMMM, yyyy", { locale: es });

  return (
    /* Reuse EventModal styles but as a page (no fixed overlay) */
    <div style={{ background: 'var(--cream, #FAF8F4)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1A1A1A' }}>

      {/* Back bar */}
      <div className="em-back-bar">
        <button className="em-back-btn" onClick={() => navigate('/eventos')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Eventos
        </button>
        <span className="em-back-sep">/</span>
        <span className="em-back-current">{event.title}</span>
      </div>

      {/* Hero */}
      <div className="em-hero">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="em-hero-img" />
        ) : (
          <svg className="em-hero-scene" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <rect x="420" y="100" width="360" height="270" fill="white"/>
            <polygon points="420,100 600,20 780,100" fill="white"/>
            <rect x="565" y="0" width="70" height="130" fill="white"/>
            <ellipse cx="490" cy="170" rx="22" ry="34" fill="#006B75" opacity="0.5"/>
            <ellipse cx="600" cy="170" rx="22" ry="34" fill="#006B75" opacity="0.5"/>
            <ellipse cx="710" cy="170" rx="22" ry="34" fill="#006B75" opacity="0.5"/>
            <rect x="567" y="285" width="66" height="85" fill="#006B75" opacity="0.35"/>
          </svg>
        )}
        <div className="em-hero-overlay" />
        <div className="em-hero-content">
          <div className="em-hero-badges">
            {event.allowsRegistration && !isFull && (
              <div className="em-badge-live"><div className="em-live-dot" />Inscripciones abiertas</div>
            )}
            {isFull && (
              <div className="em-badge-live" style={{ background: 'rgba(100,100,100,0.8)' }}>Sin cupos</div>
            )}
            <div className="em-badge-cat">{event.churchName}</div>
          </div>
          <div className="em-hero-title">{event.title}</div>
          <div className="em-hero-org">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1C4.3 1 2.5 2.8 2.5 5C2.5 7.8 6.5 12 6.5 12S10.5 7.8 10.5 5C10.5 2.8 8.7 1 6.5 1Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" fill="none"/>
              <circle cx="6.5" cy="5" r="1.8" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
            </svg>
            <span>{event.location ?? 'Ubicación por confirmar'}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="em-body">
        {/* Left column */}
        <div className="em-left">
          {event.description && (
            <div>
              <div className="em-section-title">Sobre el evento</div>
              <div className="em-card">
                <div className="em-desc">{event.description}</div>
              </div>
            </div>
          )}

          <div>
            <div className="em-section-title">Información del evento</div>
            <div className="em-card">
              <div className="em-info-grid">
                <div className="em-info-item">
                  <div className="em-info-icon">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="1.5" y="3.5" width="14" height="12" rx="2" stroke="#E8A020" strokeWidth="1.4"/><path d="M5 2V4.5M12 2V4.5M1.5 7.5H15.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div className="em-info-label">Fecha</div>
                    <div className="em-info-val" style={{ textTransform: 'capitalize' }}>{formattedDate}</div>
                  </div>
                </div>
                <div className="em-info-item">
                  <div className="em-info-icon">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="#E8A020" strokeWidth="1.4"/><path d="M8.5 5V8.5L11 10.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div className="em-info-label">Hora</div>
                    <div className="em-info-val">{format(startDate, "HH:mm 'hrs'")}</div>
                    {endDate && <div className="em-info-sub">Hasta {format(endDate, "HH:mm 'hrs'")}</div>}
                  </div>
                </div>
                {event.location && (
                  <div className="em-info-item">
                    <div className="em-info-icon">
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1.5C5.7 1.5 3.5 3.7 3.5 6.5C3.5 10.5 8.5 15.5 8.5 15.5S13.5 10.5 13.5 6.5C13.5 3.7 11.3 1.5 8.5 1.5Z" stroke="#E8A020" strokeWidth="1.4" fill="none"/><circle cx="8.5" cy="6.5" r="2.5" stroke="#E8A020" strokeWidth="1.4"/></svg>
                    </div>
                    <div>
                      <div className="em-info-label">Lugar</div>
                      <div className="em-info-val">{event.location}</div>
                    </div>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="em-info-item">
                    <div className="em-info-icon">
                      <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="6" cy="6" r="3" stroke="#E8A020" strokeWidth="1.4"/><path d="M1.5 15.5C1.5 12.5 3.5 10 6 10" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/><circle cx="12" cy="9" r="2.5" stroke="#E8A020" strokeWidth="1.4"/><path d="M9 15.5C9 13 10.3 11 12 11C13.7 11 15 13 15 15.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <div className="em-info-label">Capacidad</div>
                      <div className="em-info-val">{event.maxAttendees.toLocaleString()} personas</div>
                      <div className="em-info-sub">{spotsLeft !== null && spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Sin cupos'}</div>
                    </div>
                  </div>
                )}
                <div className="em-info-item">
                  <div className="em-info-icon">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2L10.3 7H15.5L11.2 9.9L13 15L8.5 12L4 15L5.8 9.9L1.5 7H6.7L8.5 2Z" stroke="#E8A020" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="em-info-label">Entrada</div>
                    <div className="em-info-val">Gratuita</div>
                    <div className="em-info-sub">{event.allowsRegistration ? 'Inscripción requerida' : 'Sin inscripción'}</div>
                  </div>
                </div>
                <div className="em-info-item">
                  <div className="em-info-icon">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 1.5V3M7 3H10M2 15.5H15V8.5L8.5 4L2 8.5V15.5Z" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 15.5V11H11V15.5" stroke="#E8A020" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div className="em-info-label">Organizador</div>
                    <div className="em-info-val">{event.churchName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="em-right">
          <div className="em-register-card">
            <div className="em-rc-top">
              <div className="em-rc-circle em-rcc1" />
              <div className="em-rc-circle em-rcc2" />
              {event.allowsRegistration && !isFull && (
                <div className="em-rc-tag"><div className="em-rc-tag-dot" />Inscripciones abiertas</div>
              )}
              <div className="em-rc-price-wrap">
                <div className="em-rc-price">Gratis</div>
                <div className="em-rc-price-sub">{event.allowsRegistration ? 'Inscripción requerida' : 'Acceso libre'}</div>
              </div>
              {event.maxAttendees && (
                <div className="em-rc-seats">Quedan <strong>{spotsLeft ?? 0} cupos</strong> de {event.maxAttendees.toLocaleString()}</div>
              )}
            </div>
            <div className="em-rc-body">
              {event.maxAttendees && (
                <div className="em-spots-wrap">
                  <div className="em-spots-label"><span>Ocupación</span><strong>{occupancy}%</strong></div>
                  <div className="em-bar"><div className="em-bar-fill" style={{ width: `${occupancy}%` }} /></div>
                </div>
              )}

              {registered && (
                <div className="em-success">
                  <div className="em-success-title">¡Inscripción confirmada!</div>
                  <div className="em-success-sub">Te esperamos en el evento.</div>
                </div>
              )}

              {event.allowsRegistration && !registered && !showForm && (
                <button className={`em-btn-register${isFull ? ' full' : ''}`} disabled={isFull} onClick={() => setShowForm(true)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M10 5L13 8L10 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {isFull ? 'Sin cupos disponibles' : 'Inscribirme al evento'}
                </button>
              )}

              {event.allowsRegistration && !registered && showForm && (
                <div className="em-form-section">
                  <div className="em-form-title">Formulario de inscripción</div>
                  <div className="em-form-group">
                    <label className="em-form-label">Nombre completo *</label>
                    <input className="em-form-input" required placeholder="Tu nombre completo"
                      value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                  </div>
                  <div className="em-form-group">
                    <label className="em-form-label">Correo electrónico *</label>
                    <input className="em-form-input" type="email" required placeholder="tucorreo@ejemplo.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="em-form-group">
                    <label className="em-form-label">Teléfono</label>
                    <input className="em-form-input" placeholder="Opcional"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="em-form-group">
                    <label className="em-form-label">Notas adicionales</label>
                    <textarea className="em-form-input em-form-textarea" rows={2} placeholder="Opcional"
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="em-form-actions">
                    <button type="button" className="em-btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                    <button type="button" className="em-btn-confirm"
                      disabled={isPending || !form.fullName || !form.email}
                      onClick={() => register()}>
                      {isPending ? 'Enviando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}

              <button className="em-btn-share" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="11" cy="3" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="3" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="11" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.7 8L9.3 10M9.3 4L4.7 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Compartir evento
              </button>
              <div className="em-rc-divider" />
              <div className="em-org-row">
                <div className="em-org-avatar">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5V3M6.5 3H9.5M2 14.5H14V7.5L8 3L2 7.5V14.5Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 14.5V10.5H10.5V14.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="em-org-name">{event.churchName}</div>
                  <div className="em-org-sub">Organizador principal</div>
                </div>
              </div>
              <div className="em-verified">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Iglesia verificada
              </div>
            </div>
          </div>

          {event.location && (
            <div className="em-map">
              <div className="em-map-inner"><div className="em-map-pin" /></div>
              <div className="em-map-footer">
                <span className="em-map-addr">{event.location}</span>
                <span className="em-map-link">Ver en mapa →</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
