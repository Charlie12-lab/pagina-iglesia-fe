import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { churchesApi } from '../../api/churches';

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#005F6B,#0098A6)',
  'linear-gradient(135deg,#006B75,#00B5C5)',
  'linear-gradient(135deg,#004A52,#007A85)',
  'linear-gradient(135deg,#00818C,#33C4D0)',
  'linear-gradient(135deg,#003D45,#006B75)',
  'linear-gradient(135deg,#007880,#00A8B5)',
];

export default function ChurchesPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q')?.toLowerCase() ?? '';
  const city = searchParams.get('city')?.toLowerCase() ?? '';

  const { data: churches = [], isLoading } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
  });

  const filtered = churches.filter(c => {
    const matchQ = !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
    const matchCity = !city || (c.city ?? '').toLowerCase().includes(city);
    return matchQ && matchCity;
  });

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '40px 44px 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bondi)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '16px', height: '2px', background: 'var(--amber)', borderRadius: '2px', display: 'inline-block' }} />
            Directorio
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '36px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, marginBottom: '8px' }}>
                {city ? `Iglesias en ${searchParams.get('city')}` : 'Directorio de Iglesias'}
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)' }}>
                {isLoading ? 'Cargando…' : `${filtered.length} ${filtered.length === 1 ? 'iglesia encontrada' : 'iglesias encontradas'}`}
              </p>
            </div>
            <Link to="/" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-mid)', textDecoration: 'none', border: '1.5px solid var(--gray-200)', padding: '7px 15px', borderRadius: '7px', whiteSpace: 'nowrap' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 44px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: 'var(--white)', borderRadius: '14px', height: '280px', opacity: 0.6 }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
            {filtered.map((church, i) => {
              const grad = COVER_GRADIENTS[i % COVER_GRADIENTS.length];
              return (
                <div
                  key={church.id}
                  style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 14px 38px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
                >
                  {/* Cover */}
                  <div style={{ height: '110px', background: grad, position: 'relative' }}>
                    <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.12 }} viewBox="0 0 400 80" preserveAspectRatio="none">
                      <path d="M0 40 Q100 10 200 40 Q300 70 400 40 L400 80 L0 80Z" fill="white"/>
                    </svg>
                    {/* Avatar */}
                    <div style={{ position: 'absolute', bottom: '-16px', left: '14px', width: '44px', height: '44px', background: 'var(--white)', borderRadius: '11px', border: '2px solid var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}>
                      {church.logoUrl
                        ? <img src={church.logoUrl} alt={church.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                        : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2V4.5M8.5 4.5H11.5M3 18H17V9L10 4.5L3 9V18Z" stroke="#0098A6" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 18V14H12.5V18" stroke="#0098A6" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      }
                    </div>
                    {church.isActive && (
                      <div style={{ position: 'absolute', top: '9px', right: '9px', background: 'rgba(0,0,0,0.22)', color: 'white', fontSize: '9.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '3px', backdropFilter: 'blur(4px)' }}>
                        <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L3 5.5L6 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Activa
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '24px 15px 15px' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px', lineHeight: 1.25 }}>{church.name}</div>
                    {church.city && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--bondi)', marginBottom: '7px' }}>{church.city}</div>}
                    {church.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-light)', marginBottom: '9px' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="4" r="1.8" stroke="#ABABAB" strokeWidth="1.1"/><path d="M5 1C3.07 1 1.5 2.57 1.5 4.5C1.5 6.8 5 9.5 5 9.5S8.5 6.8 8.5 4.5C8.5 2.57 6.93 1 5 1Z" stroke="#ABABAB" strokeWidth="1.1" fill="none"/></svg>
                        {church.address}
                      </div>
                    )}
                    {church.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: 1.65, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{church.description}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--gray-100)' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {church.phone && <span style={{ background: 'var(--bondi-pale)', color: 'var(--bondi-dark)', fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px' }}>{church.phone}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {church.websiteUrl && (
                          <a href={church.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600, textDecoration: 'none' }}>Web →</a>
                        )}
                        {church.email && (
                          <a href={`mailto:${church.email}`} style={{ fontSize: '11px', color: 'var(--bondi)', fontWeight: 700, textDecoration: 'none' }}>Contactar →</a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
            <p style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: 500 }}>
              {q || city ? 'No se encontraron iglesias con ese criterio.' : 'No hay iglesias registradas aún.'}
            </p>
            {(q || city) && (
              <Link to="/iglesias" style={{ display: 'inline-block', marginTop: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--bondi)', textDecoration: 'none' }}>
                Ver todas las iglesias
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
