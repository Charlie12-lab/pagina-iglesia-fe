import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import type { Event } from '../../types';
import './EventsPage.css';

const GRADIENTS = ['ep-grad-0', 'ep-grad-1', 'ep-grad-2', 'ep-grad-3', 'ep-grad-4'];

function gradClass(index: number) {
  return GRADIENTS[index % GRADIENTS.length];
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todos');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll(),
  });

  const filters = ['Todos', 'Conferencias', 'Retiros', 'Cursos', 'Adoración'];

  const featured = events[0] ?? null;
  const rest = events.slice(1);

  const goToDetail = (event: Event) => navigate(`/eventos/${event.id}`);

  return (
    <div className="ep-root">
      {/* ── Page header ── */}
      <div className="ep-header">
        <div className="ep-header-circle ep-hc1" />
        <div className="ep-header-circle ep-hc2" />
        <div className="ep-header-inner">
          <div className="ep-label">
            <div className="ep-label-dot" />
            Ecuador y Latinoamérica
          </div>
          <h1>Próximos <em>Eventos</em></h1>
          <p>Conferencias, retiros, cursos y celebraciones. Inscríbete y sé parte.</p>
          <div className="ep-filters">
            {filters.map(f => (
              <button
                key={f}
                className={`ep-filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="ep-main">
        <div className="ep-list">
          {isLoading && (
            <div className="ep-empty"><h3>Cargando eventos...</h3></div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="ep-empty">
              <h3>No hay eventos disponibles</h3>
              <p>Vuelve pronto para ver los próximos eventos.</p>
            </div>
          )}

          {/* Featured card */}
          {featured && (
            <FeaturedCard event={featured} index={0} onClick={() => goToDetail(featured)} />
          )}

          {/* Regular cards */}
          {rest.map((event, i) => (
            <RegularCard key={event.id} event={event} index={i + 1} onClick={() => goToDetail(event)} />
          ))}
        </div>

        {/* ── Sidebar ── */}
        <div className="ep-sidebar">
          <div className="ep-sidebar-card">
            <div className="ep-sc-header">
              <div className="ep-sc-icon">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="5.5" stroke="#E8A020" strokeWidth="1.3"/>
                  <path d="M7.5 4.5V7.5L9.5 9.5" stroke="#E8A020" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="ep-sc-title">Próximamente</span>
            </div>
            <div className="ep-sc-body">
              <div className="ep-upcoming-list">
                {events.slice(0, 5).map(event => {
                  const d = new Date(event.startDate);
                  return (
                    <div
                      key={event.id}
                      className="ep-upcoming-item"
                      onClick={() => goToDetail(event)}
                    >
                      <div className="ep-udb">
                        <div className="ep-udb-day">{format(d, 'd')}</div>
                        <div className="ep-udb-month">{format(d, 'MMM', { locale: es })}</div>
                      </div>
                      <div className="ep-upcoming-info">
                        <h4>{event.title}</h4>
                        <p>{event.location ?? event.churchName}</p>
                        {event.allowsRegistration && (
                          <div className="ep-ui-open">
                            <div className="ep-ui-dot" />
                            Inscripciones abiertas
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {events.length === 0 && !isLoading && (
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', padding: '8px' }}>
                    Sin eventos próximos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Featured Card ── */
function FeaturedCard({ event, index, onClick }: { event: Event; index: number; onClick: () => void }) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : null;
  const occupancy = event.maxAttendees ? Math.round((event.currentAttendees / event.maxAttendees) * 100) : 0;

  return (
    <div className="ep-card-featured" onClick={onClick}>
      <div className="ep-ecf-img">
        <div className={`ep-ecf-img-bg ${gradClass(index)}`} style={{ height: '100%' }}>
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {!event.imageUrl && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
              viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <rect x="280" y="60" width="240" height="180" fill="white"/>
              <polygon points="280,60 400,0 520,60" fill="white"/>
              <rect x="375" y="-10" width="50" height="80" fill="white"/>
              <ellipse cx="325" cy="110" rx="15" ry="24" fill="#006B75" opacity="0.5"/>
              <ellipse cx="400" cy="110" rx="15" ry="24" fill="#006B75" opacity="0.5"/>
              <ellipse cx="475" cy="110" rx="15" ry="24" fill="#006B75" opacity="0.5"/>
            </svg>
          )}
        </div>
        <div className="ep-ecf-img-overlay" />
        <div className="ep-ecf-badges">
          {event.allowsRegistration && (
            <div className="ep-badge-live"><div className="ep-live-dot" />Inscripciones abiertas</div>
          )}
          <div className="ep-badge-cat">{event.churchName}</div>
        </div>
        <div className="ep-date-badge">
          <div className="ep-edb-day">{format(startDate, 'd')}</div>
          <div>
            <div className="ep-edb-month">{format(startDate, 'MMM', { locale: es })}</div>
            <div className="ep-edb-year">{format(startDate, 'yyyy')}</div>
          </div>
        </div>
      </div>

      <div className="ep-ecf-body">
        <div className="ep-ecf-title">{event.title}</div>
        {event.description && (
          <p className="ep-ecf-desc">{event.description}</p>
        )}
        <div className="ep-ecf-meta">
          <div className="ep-meta-item">
            <div className="ep-meta-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="2.5" width="11" height="9" rx="1.5" stroke="#E8A020" strokeWidth="1.2"/>
                <path d="M4 1.5V3M9 1.5V3M1 5.5H12" stroke="#E8A020" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="ep-meta-lbl">Fecha</span>
              <span className="ep-meta-val" style={{ textTransform: 'capitalize' }}>
                {endDate
                  ? `${format(startDate, 'EEE d', { locale: es })} – ${format(endDate, 'EEE d MMM', { locale: es })}`
                  : format(startDate, 'EEE d MMM', { locale: es })}
              </span>
            </div>
          </div>
          {event.location && (
            <div className="ep-meta-item">
              <div className="ep-meta-icon">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1C4.3 1 2.5 2.8 2.5 5C2.5 7.8 6.5 12 6.5 12S10.5 7.8 10.5 5C10.5 2.8 8.7 1 6.5 1Z" stroke="#E8A020" strokeWidth="1.2" fill="none"/>
                  <circle cx="6.5" cy="5" r="1.8" stroke="#E8A020" strokeWidth="1.2"/>
                </svg>
              </div>
              <div>
                <span className="ep-meta-lbl">Lugar</span>
                <span className="ep-meta-val">{event.location}</span>
              </div>
            </div>
          )}
          <div className="ep-meta-item">
            <div className="ep-meta-icon">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="#E8A020" strokeWidth="1.2"/>
                <path d="M6.5 4V6.5L8 8" stroke="#E8A020" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="ep-meta-lbl">Hora</span>
              <span className="ep-meta-val">{format(startDate, 'HH:mm')}</span>
            </div>
          </div>
        </div>

        <div className="ep-ecf-footer">
          {event.maxAttendees ? (
            <div>
              <div className="ep-spots-text" style={{ marginBottom: '5px' }}>
                {spotsLeft} cupos disponibles · {occupancy}% ocupado
              </div>
              <div className="ep-spots-bar">
                <div className="ep-spots-fill" style={{ width: `${occupancy}%` }} />
              </div>
            </div>
          ) : <div />}
          {event.allowsRegistration && (
            <button className="ep-btn-inscripcion" onClick={e => { e.stopPropagation(); onClick(); }}>
              <div className="ep-live-dot" />
              Ver evento
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5H10.5M7.5 4L10.5 6.5L7.5 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Regular Card ── */
function RegularCard({ event, index, onClick }: { event: Event; index: number; onClick: () => void }) {
  const startDate = new Date(event.startDate);

  return (
    <div className="ep-card" onClick={onClick}>
      <div className="ep-ec-img">
        <div className={`ep-ecf-img-bg ${gradClass(index)}`} style={{ height: '100%', position: 'relative' }}>
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div className="ep-ec-img-overlay" />
        <div className="ep-ec-date-badge">
          <div className="ep-ec-day">{format(startDate, 'd')}</div>
          <div className="ep-ec-month">{format(startDate, 'MMM', { locale: es })}</div>
        </div>
      </div>

      <div className="ep-ec-body">
        <div>
          <div className="ep-ec-badges">
            <span className="ep-ec-badge">{event.churchName}</span>
          </div>
          <div className="ep-ec-title">{event.title}</div>
          {event.description && (
            <p className="ep-ec-desc">{event.description}</p>
          )}
          <div className="ep-ec-meta-row">
            <div className="ep-ec-meta-item">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="1" y="2" width="9" height="7.5" rx="1.5" stroke="#ABABAB" strokeWidth="1.1"/>
                <path d="M3.5 1V3M7.5 1V3M1 4.5H10" stroke="#ABABAB" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              <span style={{ textTransform: 'capitalize' }}>{format(startDate, "EEE d MMM", { locale: es })}</span>
            </div>
            {event.location && (
              <div className="ep-ec-meta-item">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1C3.6 1 2 2.6 2 4.5C2 6.8 5.5 10 5.5 10S9 6.8 9 4.5C9 2.6 7.4 1 5.5 1Z" stroke="#ABABAB" strokeWidth="1.1" fill="none"/>
                  <circle cx="5.5" cy="4.5" r="1.5" stroke="#ABABAB" strokeWidth="1.1"/>
                </svg>
                {event.location}
              </div>
            )}
          </div>
        </div>
        <div className="ep-ec-footer">
          <span className={`ep-ec-price${!event.allowsRegistration ? ' free' : ''}`}>
            Entrada libre
          </span>
          <button className="ep-btn-sm" onClick={e => { e.stopPropagation(); onClick(); }}>
            <div className="ep-live-dot" />
            {event.allowsRegistration ? 'Inscribirse' : 'Ver más'}
          </button>
        </div>
      </div>
    </div>
  );
}
