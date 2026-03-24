import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api/events';
import { churchesApi } from '../../api/churches';
import { blogsApi } from '../../api/blogs';
import EventModal from '../../components/ui/EventModal';
import type { Event, Church, BlogPostSummary } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SLIDE_GRADIENTS = [
  'linear-gradient(135deg,#003E46 0%,#006B75 40%,#009BA8 100%)',
  'linear-gradient(135deg,#1A2E1A 0%,#1A4A2E 40%,#1E7A4A 100%)',
  'linear-gradient(135deg,#1A1A3E 0%,#2A2A6E 40%,#3A3A9E 100%)',
  'linear-gradient(135deg,#3E1A00 0%,#6B3000 40%,#A84800 100%)',
];

const TAG_COLORS = ['#E8A020', '#10B981', '#6D28D9', '#DC2626'];

const STATIC_SLIDES = [
  { tag: '🌟 Bienvenido', tagColor: '#E8A020', title: 'Encuentra tu comunidad\nde fe hoy', meta: 'Directorio completo de iglesias en Ecuador y Latinoamérica', btn: 'Explorar iglesias', to: '/iglesias' },
  { tag: '📖 Recursos', tagColor: '#10B981', title: 'Reflexiones y enseñanzas\npara tu vida de fe', meta: 'Mensajes, noticias y recursos de la comunidad', btn: 'Leer blog', to: '/blog' },
];

const CITIES = [
  { name: 'Quito', count: '824' },
  { name: 'Guayaquil', count: '712' },
  { name: 'Cuenca', count: '348' },
  { name: 'Santo Domingo', count: '215' },
  { name: 'Machala', count: '187' },
  { name: 'Durán', count: '143' },
];

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#005F6B,#0098A6)',
  'linear-gradient(135deg,#006B75,#00B5C5)',
  'linear-gradient(135deg,#004A52,#007A85)',
  'linear-gradient(135deg,#00818C,#33C4D0)',
  'linear-gradient(135deg,#003D45,#006B75)',
  'linear-gradient(135deg,#007880,#00A8B5)',
];

const BLOG_GRADIENTS = [
  'linear-gradient(135deg,#005F6B,#0098A6)',
  'linear-gradient(135deg,#006B75,#00B5C5)',
  'linear-gradient(135deg,#004A52,#007A85)',
  'linear-gradient(135deg,#007880,#00A8B5)',
];

// ─── Section label helper ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bondi)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ width: '16px', height: '2px', background: 'var(--amber)', borderRadius: '2px', display: 'inline-block' }} />
      {children}
    </div>
  );
}

// ─── Church card ──────────────────────────────────────────────────────────────

function ChurchCard({ church, index }: { church: Church; index: number }) {
  const grad = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  return (
    <div
      style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 14px 38px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
    >
      {/* Cover */}
      <div style={{ height: '110px', background: grad, position: 'relative' }}>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: 0.12 }} viewBox="0 0 400 80" preserveAspectRatio="none">
          <path d="M0 40 Q100 10 200 40 Q300 70 400 40 L400 80 L0 80Z" fill="white"/>
        </svg>
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
          {church.email && (
            <a href={`mailto:${church.email}`} style={{ fontSize: '11px', color: 'var(--bondi)', fontWeight: 700, textDecoration: 'none' }}>Contactar →</a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Blog card ────────────────────────────────────────────────────────────────

function BlogCard({ post, index, featured }: { post: BlogPostSummary; index: number; featured?: boolean }) {
  const grad = BLOG_GRADIENTS[index % BLOG_GRADIENTS.length];
  return (
    <Link
      to={`/blog/${post.id}`}
      style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', textDecoration: 'none', display: 'flex', flexDirection: 'column', gridRow: featured ? 'span 2' : undefined }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
    >
      <div style={{ background: post.coverImageUrl ? undefined : grad, height: featured ? '260px' : '130px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {post.coverImageUrl
          ? <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
              <svg width={featured ? 48 : 36} height={featured ? 48 : 36} viewBox="0 0 48 48" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                <circle cx="24" cy="24" r="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                <path d="M14 20H34M14 26H28" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </>
        }
      </div>
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {post.tags.length > 0 && (
          <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '20px', padding: '2px 9px', marginBottom: '9px', background: 'var(--bondi-pale)', color: 'var(--bondi-dark)' }}>
            {post.tags[0]}
          </span>
        )}
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: featured ? '20px' : '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px', lineHeight: 1.35 }}>{post.title}</h3>
        {post.excerpt && (
          <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.65, marginBottom: '12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', borderTop: '1px solid var(--gray-100)', paddingTop: '11px', marginTop: 'auto' }}>
          <span>{post.churchName} · {post.author}</span>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--bondi)' }}>Leer →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [cur, setCur] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: () => eventsApi.getAll() });
  const { data: churches = [] } = useQuery({ queryKey: ['churches'], queryFn: churchesApi.getAll });
  const { data: blogs = [] } = useQuery({ queryKey: ['blogs'], queryFn: () => blogsApi.getAll() });

  // Hero slides from real events or static fallback
  const slides = events.length >= 2
    ? events.slice(0, 4).map((ev, i) => ({
        tag: `📅 Evento`,
        tagColor: TAG_COLORS[i % 4],
        title: ev.title,
        meta: `${format(new Date(ev.startDate), "EEE d MMM, yyyy", { locale: es })}${ev.location ? ' · ' + ev.location : ''}`,
        btn: 'Ver detalles',
        event: ev as Event,
        to: null as string | null,
      }))
    : STATIC_SLIDES.map(s => ({ ...s, event: null as Event | null }));

  const total = slides.length;

  const startAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCur(c => (c + 1) % total), 5000);
  };

  useEffect(() => {
    startAuto();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  const goTo = (n: number) => { setCur((n + total) % total); startAuto(); };

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (searchQ) p.set('q', searchQ);
    if (searchCity) p.set('city', searchCity);
    navigate(`/iglesias?${p.toString()}`);
  };

  const eventsCount = events.filter(ev => {
    const d = new Date(ev.startDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || events.length;

  return (
    <>
      {/* ──────────── HERO ──────────── */}
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden', background: 'var(--bondi-deeper)' }}>
        <div className="hero-slides-wrapper">
          <div className="hero-slides" style={{ transform: `translateX(-${cur * 100}%)` }}>
            {slides.map((slide, i) => (
              <div key={i} className="hero-slide" style={{ background: SLIDE_GRADIENTS[i % 4] }}>
                {/* Decorative background */}
                <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', opacity: 0.12 }} viewBox="0 0 600 420" preserveAspectRatio="xMaxYMid slice">
                  <rect x="180" y="160" width="240" height="220" fill="white"/>
                  <polygon points="180,160 300,60 420,160" fill="white"/>
                  <rect x="270" y="30" width="60" height="130" fill="white"/>
                  <rect x="288" y="0" width="24" height="60" fill="white"/>
                  <ellipse cx="240" cy="200" rx="18" ry="28" fill="#006B75" opacity="0.6"/>
                  <ellipse cx="300" cy="200" rx="18" ry="28" fill="#006B75" opacity="0.6"/>
                  <ellipse cx="360" cy="200" rx="18" ry="28" fill="#006B75" opacity="0.6"/>
                </svg>
                {/* Overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.2) 60%,rgba(0,0,0,0.05) 100%)', zIndex: 1 }} />
                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, padding: '0 60px', maxWidth: '560px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: slide.tagColor, color: 'white', fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '20px', marginBottom: '16px' }}>
                    {slide.tag}
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '34px', fontWeight: 600, color: 'white', lineHeight: 1.2, marginBottom: '10px', letterSpacing: '-0.3px', whiteSpace: 'pre-line' }}>
                    {slide.title}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', marginBottom: '22px' }}>
                    {slide.meta}
                  </div>
                  {slide.event ? (
                    <button
                      onClick={() => setSelectedEvent(slide.event)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'white', color: 'var(--bondi-deeper)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      {slide.btn}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  ) : (
                    <Link
                      to={slide.to!}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'white', color: 'var(--bondi-deeper)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, padding: '10px 22px', borderRadius: '8px', textDecoration: 'none' }}
                    >
                      {slide.btn}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <div onClick={() => goTo(cur - 1)} style={{ position: 'absolute', top: '50%', left: '18px', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '18px', userSelect: 'none' }}>
          ‹
        </div>
        <div onClick={() => goTo(cur + 1)} style={{ position: 'absolute', top: '50%', right: '18px', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '18px', userSelect: 'none' }}>
          ›
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ height: '4px', borderRadius: '2px', cursor: 'pointer', background: i === cur ? 'var(--amber-light)' : 'rgba(255,255,255,0.4)', width: i === cur ? '36px' : '20px', transition: 'width 0.3s, background 0.3s' }} />
          ))}
        </div>

        {/* Search bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'center', padding: '0 44px 14px' }}>
          <div style={{ background: 'white', borderRadius: '11px', padding: '6px 6px 6px 16px', display: 'flex', alignItems: 'center', gap: '9px', boxShadow: '0 14px 44px rgba(0,0,0,0.25)', width: '100%', maxWidth: '640px' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#ABABAB" strokeWidth="1.4"/><path d="M10.5 10.5L13.5 13.5" stroke="#ABABAB" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input
              type="text"
              placeholder="Busca por nombre, ciudad o denominación…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13.5px', color: 'var(--text)', background: 'transparent' }}
            />
            <div style={{ width: '1px', height: '24px', background: 'var(--gray-200)', flexShrink: 0 }} />
            <select
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              style={{ border: 'none', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12.5px', color: 'var(--text-mid)', background: 'transparent', cursor: 'pointer', padding: '0 6px' }}
            >
              <option value="">Todas las ciudades</option>
              {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button
              onClick={handleSearch}
              style={{ background: 'var(--bondi)', color: 'white', border: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, padding: '9px 20px', borderRadius: '7px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* ──────────── STATS ──────────── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '16px 44px', display: 'flex', justifyContent: 'center', gap: '52px' }}>
        {[
          { emoji: '🏠', num: churches.length > 0 ? churches.length.toLocaleString() : '—', lbl: 'Iglesias registradas' },
          { emoji: '👥', num: '+190K', lbl: 'Miembros conectados' },
          { emoji: '📅', num: eventsCount > 0 ? `${eventsCount}+` : '—', lbl: 'Eventos este mes' },
          { emoji: '🌍', num: '18', lbl: 'Países disponibles' },
        ].map(({ emoji, num, lbl }) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--amber-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              {emoji}
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text)', lineHeight: 1, marginBottom: '2px' }}>{num}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>{lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ──────────── CITIES ──────────── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '48px 44px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <SectionLabel>Ecuador</SectionLabel>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 600, color: 'var(--text)', marginBottom: '26px' }}>Principales ciudades</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px' }}>
            {CITIES.map(city => (
              <Link
                key={city.name}
                to={`/iglesias?city=${encodeURIComponent(city.name)}`}
                style={{ background: 'var(--cream)', border: '1px solid var(--cream-border)', borderRadius: '13px', padding: '18px 12px 16px', textAlign: 'center', cursor: 'pointer', textDecoration: 'none', display: 'block', transition: 'transform 0.15s, border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'var(--bondi)'; el.style.background = 'var(--bondi-mist)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.borderColor = 'var(--cream-border)'; el.style.background = 'var(--cream)'; }}
              >
                <div style={{ width: '40px', height: '40px', background: 'var(--amber-pale)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '18px' }}>📍</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{city.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{city.count} iglesias</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────── CHURCHES ──────────── */}
      <div style={{ background: 'var(--cream)', padding: '58px 44px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
            <div>
              <SectionLabel>Destacadas</SectionLabel>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>Iglesias cerca de ti</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)', maxWidth: '440px' }}>Comunidades activas, verificadas y listas para recibirte.</p>
            </div>
            <Link to="/iglesias" style={{ background: 'transparent', border: '1.5px solid var(--gray-200)', color: 'var(--text-mid)', fontSize: '12px', fontWeight: 600, padding: '7px 15px', borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Ver todas →
            </Link>
          </div>
          {churches.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
              {churches.slice(0, 6).map((church, i) => <ChurchCard key={church.id} church={church} index={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No hay iglesias registradas aún.</div>
          )}
        </div>
      </div>

      {/* ──────────── BLOGS ──────────── */}
      <div style={{ background: 'var(--cream-warm)', borderTop: '1px solid var(--cream-border)', borderBottom: '1px solid var(--cream-border)', padding: '58px 44px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
            <div>
              <SectionLabel>Comunidad</SectionLabel>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>Blogs más recientes</h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)', maxWidth: '440px' }}>Reflexiones, enseñanzas y recursos para tu vida de fe.</p>
            </div>
            <Link to="/blog" style={{ background: 'transparent', border: '1.5px solid var(--gray-200)', color: 'var(--text-mid)', fontSize: '12px', fontWeight: 600, padding: '7px 15px', borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Ver todos →
            </Link>
          </div>
          {blogs.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr 1fr', gap: '18px', gridTemplateRows: 'auto auto' }}>
              {blogs.slice(0, 4).map((post, i) => <BlogCard key={post.id} post={post} index={i} featured={i === 0} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No hay publicaciones aún.</div>
          )}
        </div>
      </div>

      {/* ──────────── CTA ──────────── */}
      <div style={{ background: 'var(--bondi-deeper)', padding: '58px 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '320px', height: '320px', top: '-100px', right: '8%', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', width: '220px', height: '220px', bottom: '-70px', left: '5%', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '40px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.8)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 11px', borderRadius: '20px', marginBottom: '12px' }}>
              ⭐ Para iglesias
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 600, color: 'white', marginBottom: '9px', lineHeight: 1.2 }}>
              ¿Tienes una iglesia?<br/>
              <em style={{ fontStyle: 'italic', color: 'var(--bondi-light)' }}>Regístrala gratis hoy.</em>
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', maxWidth: '460px' }}>
              Llega a miles de personas que buscan una comunidad. Crea tu perfil en minutos.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <Link to="/admin/login" style={{ background: 'white', color: 'var(--bondi-deeper)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, padding: '11px 24px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Registrar mi iglesia →
            </Link>
            <Link to="/iglesias" style={{ background: 'transparent', color: 'rgba(255,255,255,0.62)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12.5px', fontWeight: 500, padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Explorar el directorio
            </Link>
          </div>
        </div>
      </div>

      {/* Event modal */}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </>
  );
}
