import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { blogsApi } from '../../api/blogs';

const BLOG_GRADIENTS = [
  'linear-gradient(135deg,#005F6B,#0098A6)',
  'linear-gradient(135deg,#006B75,#00B5C5)',
  'linear-gradient(135deg,#004A52,#007A85)',
  'linear-gradient(135deg,#00818C,#33C4D0)',
  'linear-gradient(135deg,#003D45,#006B75)',
  'linear-gradient(135deg,#007880,#00A8B5)',
];

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogsApi.getAll(),
  });

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '40px 44px 32px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bondi)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '16px', height: '2px', background: 'var(--amber)', borderRadius: '2px', display: 'inline-block' }} />
            Comunidad
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '36px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, marginBottom: '8px' }}>Blog</h1>
              <p style={{ fontSize: '13.5px', color: 'var(--text-light)' }}>
                {isLoading ? 'Cargando…' : `${posts.length} ${posts.length === 1 ? 'publicación' : 'publicaciones'}`}
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
              <div key={i} style={{ background: 'var(--white)', borderRadius: '14px', height: '320px', opacity: 0.6 }} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
            {posts.map((post, i) => {
              const grad = BLOG_GRADIENTS[i % BLOG_GRADIENTS.length];
              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
                >
                  {/* Image */}
                  <div style={{ background: post.coverImageUrl ? undefined : grad, height: '160px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.coverImageUrl
                      ? <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                            <rect x="6" y="5" width="28" height="30" rx="3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/>
                            <path d="M12 15H28M12 20H28M12 25H20" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        </>
                    }
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {post.tags.length > 0 && (
                      <span style={{ display: 'inline-block', fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '20px', padding: '2px 9px', marginBottom: '9px', background: 'var(--bondi-pale)', color: 'var(--bondi-dark)' }}>
                        {post.tags[0]}
                      </span>
                    )}
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px', lineHeight: 1.35 }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.65, marginBottom: '12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', borderTop: '1px solid var(--gray-100)', paddingTop: '11px', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--bondi)', marginBottom: '2px' }}>{post.churchName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{post.author}</span>
                          {post.publishedAt && (
                            <>
                              <span>·</span>
                              <span>{format(new Date(post.publishedAt), "d MMM yyyy", { locale: es })}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--bondi)', whiteSpace: 'nowrap' }}>Leer →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
            <p style={{ fontSize: '16px', color: 'var(--text-light)', fontWeight: 500 }}>No hay publicaciones aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
